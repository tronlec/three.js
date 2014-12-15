import QtQuick 2.0
import QtCanvas3D 1.0
import QtQuick.Controls 1.2

import "webgl-camera.js" as GLCode

Item {
    id: mainview
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
        onInitGL: {
            GLCode.initGL(canvas3d);
        }

        // Emitted each time Canvas3D is ready for a new frame
        onRenderGL: {
            GLCode.renderGL(canvas3d);
        }

        onWidthChanged: {
            GLCode.onCanvasResize(canvas3d);
        }

        onHeightChanged: {
            GLCode.onCanvasResize(canvas3d);
        }

        onDevicePixelRatioChanged: {
            GLCode.onCanvasResize(canvas3d);
        }
    }
}
