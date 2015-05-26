TEMPLATE = app

QT += qml quick widgets

SOURCES += main.cpp

OTHER_FILES += geometry-text.qml \
               geometry-text.js

RESOURCES += geometry-text.qrc

# Additional import path used to resolve QML modules in Qt Creator's code model
QML_IMPORT_PATH =

# Default rules for deployment.
include(../deployment.pri)
