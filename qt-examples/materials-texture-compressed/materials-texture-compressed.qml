import QtQuick 2.0
import QtCanvas3D 1.0
import QtQuick.Controls 1.3

import "materials-texture-compressed.js" as GLCode

ApplicationWindow {
    id: mainview
    title: qsTr("Qt Canvas 3D + three.js Examples - Materials - Compressed textures")
    width: 1280
    height: 768
    visible: true

    Canvas3D {
        id: canvas3d
        anchors.fill: parent
        focus: true

        // Emitted when one time initializations should happen
        onInitializeGL: {
            GLCode.initializeGL(canvas3d);
        }

        // Emitted each time Canvas3D is ready for a new frame
        onPaintGL: {
            GLCode.paintGL(canvas3d);
        }

        onResizeGL: {
            GLCode.resizeGL(canvas3d);
        }
    }
}
