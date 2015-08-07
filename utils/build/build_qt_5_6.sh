#!/bin/sh
#Build script for Qt 5.6 environments that offer native TypedArray support
#Works only with Qt Canvas3D 1.1 and later.
cd "$(dirname "$0")"
python build.py --include common --include extras --include qt_5_6 --output ../../build/three.js
