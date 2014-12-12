#!/bin/sh

cd "$(dirname "$0")"
python build.py --include qml --include common --include extras --output ../../build/three.js
python build.py --include extras --externs externs/extras.js --output ../../build/three-extras.js
python build.py --include math --output ../../build/three-math.js
