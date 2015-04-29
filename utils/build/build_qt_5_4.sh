
# Build script for Qt 5.4.x environments without the native TypedArray support.
# Works only with Qt Canvas3D Technology Preview 2.0 release available from:
#
cd "$(dirname "$0")"
python build.py --include qt_5_4 --include extras --output ../../build/three.js
python build.py --include extras --externs externs/extras.js --output ../../build/three-extras.js
python build.py --include math --output ../../build/three-math.js
