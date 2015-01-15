var exec = require('exec-queue');
var fs = require('fs');
var traverse = require('traverse');
var extend = require('util')._extend;

var rpRoot = "../code/resources/";
var rpPackage = JSON.parse(fs.readFileSync('../code/package.json', 'utf8'));
var langs = ['ar', 'bn', 'de', 'es', 'fr', 'hi', 'pt', 'ru', 'ur', 'zh-CN'];
var defaultMetaCreator = "techninja via GoogleTranslate";

// List all folders where i18n content lives
var locations = [
  {type:'mode', loc: 'colorsets'},
  {type:'root', loc: 'colorsets/_i18n/colorsets'},
  {type:'root', loc: '_i18n/robopaint'},
  {type:'mode', loc: 'modes'}
];

var i18nBases = []; // This final list is built from the previous array.

// Steps:
// 1. Move through every i18n folder/set
// 2. Determine if the file exists
// 3a. If the file doesn't exist, translate the whole thing
// 3b. if the file does exist, only translate the new strings and append them

// Compile the list of canonical _i18n base folder locations
locations.forEach(function(location) {
  // What type of location is this?
  if (location.type === "root") { // Direct, only one folder/name
    i18nBases.push(rpRoot + location.loc);
  } else { // Indirect, actual folders based off top level dir listing
    var dir = rpRoot + location.loc + '/';
    fs.readdirSync(dir).forEach(function(file) {
      if (!fs.statSync(dir + file).isFile() && file !== '_i18n') {
        i18nBases.push(dir + file + '/_i18n/' + file);
      }
    });
  }
});

// Move through all i18n base folder locations, to then go through each set.
i18nBases.forEach(function(i18nBase) {
  var rootTrans = traverse(JSON.parse(fs.readFileSync(i18nBase + '.en-US.json')));
  rootTrans.set(['_meta'], {}); // Empty the root meta

  // Move through all languages in base...
  langs.forEach(function(lang) {
    var langFile = i18nBase + '.' + lang + '.json';
    var langTrans = {}; // Placeholder for this lang's translation object

    var translateList = [];

    // Does the file exist?
    if (fs.existsSync(langFile)) { // Translation already exists!
      langTrans = traverse(JSON.parse(fs.readFileSync(langFile, 'utf8')));

      // Check every root translation leaf if it exists in the
      rootTrans.forEach(function (x) {
        if (this.isLeaf && typeof x === "string") {
          if (!langTrans.has(this.path)) {
            // Add the item to the list of items to translate
            translateList.push(this.path);
          }
        }
      });
    } else { // No translation yet, add every string to translateList
      langTrans = traverse({
        _meta: {
          release: '', // Set later on
          target: lang,
          creator: defaultMetaCreator
        }
      });

      rootTrans.forEach(function (x) {
        if (this.isLeaf && typeof x === "string") {
          translateList.push(this.path);
        }
      });
    }

    var leafCount = 0;
    // Move through every translate object path and translate it
    if (translateList.length !== 0) {
      translateList.forEach(function (transPath) {
        translate(rootTrans.get(transPath), lang, function(translatedText, error){
          if (translatedText === false) {
            console.error("Translation failed for", transPath, 'Try again.', error);
          } else {
            langTrans.set(transPath, translatedText);
          }

          leafCount++;
          // If we did as many as there are, we're done!
          if (leafCount == translateList.length) {
            langTrans.set(['_meta', 'release'], rpPackage.version);
            console.log('Wrote ' + leafCount + ' strings to ' + langFile);
            fs.writeFile(langFile, JSON.stringify(langTrans.value, null, 2) + "\n");
          }
        });
      });
    } else {
      console.log('No changes needed for', langFile);
    }
  });

});

function translate(text, targetLang, callback) {
  exec('python trans.py en-US ' + targetLang + ' "' + text + '"',
    function (error, stdout, stderr) {
      if (error !== null) {
        callback(false, error);
      } else {
        callback(stdout.trim());
      }
  });
}
