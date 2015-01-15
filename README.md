# robopaint-translator
A Python/Node.js halfbreed to help do update batch machine translations for
[RoboPaint](https://github.com/evil-mad/robopaint).

Inspired/hard-forked from @docprofsky's
[i18n-web-translate](https://github.com/docprofsky/i18n-web-translate/), this
makes use of the same goslate python plugin (installed with
`pip install goslate`), controlled and orchestrated via a node.js script.

None of this is intended for normal human consumption and is quite specific to
RoboPaint's needs, but hopefully it's publicity and existence will help someone
down the line.

## Install
0. Clone the repo as a sibling to your RoboPaint repository. My local RP repo
lives in a folder called "code" as it already lives in a `robopaint` folder. If
you keep yours the default "robopaint", you'll need to change the references on
line 6 & 7.
0. `npm install`
0. `pip install goslate`
0. Test translation by running `python trans.py en es "Hello world!"`, should
return `Hola Mundo!` on stdout.

## Run! :runner:
Run with `node translator`, it should automatically enumerate and compare all
translation JSON files based on the en-US "root" files.

If keys exist in those files, new translated keys will be added to all supported
languages. If a new mode/translation file is created (en-US), then entirely new
files will be created for all supported languages. Changes are written directly
to the JSON files in the sibling repository for easy revisions, and subsequent
runs should change nothing.
