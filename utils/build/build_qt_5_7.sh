#!/bin/sh
#Build script for Qt 5.7 environments that offer native TypedArray support
#Works only with Qt Canvas3D 5.7 and later.
cd "$(dirname "$0")"
python build.py --include qt_license --include common --include extras --include qt_5_7 --output ../../build/three.js
