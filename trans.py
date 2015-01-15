import goslate
import argparse
import io

gs = goslate.Goslate()

parser = argparse.ArgumentParser()

parser.add_argument("srclang",  help="Source language code.")
parser.add_argument("targetlang", help="The language to translate to.")
parser.add_argument("text", help="The text to translate")
args = parser.parse_args()

print gs.translate(args.text, args.targetlang, args.srclang).encode('utf8')