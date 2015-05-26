TEMPLATE = app

QT += qml quick widgets

SOURCES += main.cpp

OTHER_FILES += loader-ply.qml \
               loader-ply.js

RESOURCES += loader-ply.qrc

# Additional import path used to resolve QML modules in Qt Creator's code model
QML_IMPORT_PATH =

# Default rules for deployment.
include(../deployment.pri)
