#!/bin/sh
# Build script for Qt 5.5 environments that offer native TypedArray support
# Works only with Qt Canvas3D 1.0 and later.

cd "$(dirname "$0")"
python build.py --include qt_5_5 --include common --include extras --output ../../build/three.js
#python build.py --include qml --include common --include extras --minify --output ../../build/three.min.js
python build.py --include extras --externs externs/extras.js --output ../../build/three-extras.js
python build.py --include math --output ../../build/three-math.js
