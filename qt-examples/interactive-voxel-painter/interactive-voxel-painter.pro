TEMPLATE = app

QT += qml quick widgets

SOURCES += main.cpp

OTHER_FILES += interactive-voxel-painter.qml \
               interactive-voxel-painter.js

RESOURCES += interactive-voxel-painter.qrc

# Additional import path used to resolve QML modules in Qt Creator's code model
QML_IMPORT_PATH =

# Default rules for deployment.
include(../deployment.pri)
