import QtQuick 2.0
import QtCanvas3D 1.0
import QtQuick.Controls 1.3

import "camera.js" as GLCode

ApplicationWindow {
    id: mainview
    title: qsTr("Qt Canvas 3D + three.js Examples - Camera")
    width: 1280
    height: 768
    visible: true

    Button {
        id: orthoButton
        anchors.left: parent.left
        width: parent.width / 2
        text: "Orthographic"

        onClicked: GLCode.changeProjection(0)
    }

    Button {
        id: perspButton
        anchors.left: orthoButton.right
        anchors.right: parent.right
        width: parent.width / 2
        text: "Perspective"

        onClicked: GLCode.changeProjection(1)
    }

    Canvas3D {
        id: canvas3d
        width: parent.width
        anchors.top: orthoButton.bottom
        anchors.bottom: parent.bottom
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
