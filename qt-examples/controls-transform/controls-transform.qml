import QtQuick 2.0
import QtCanvas3D 1.0
import QtQuick.Controls 1.2

import "controls-transform.js" as GLCode

Item {
    id: mainview
    width: 1280
    height: 768
    visible: true

    Canvas3D {
        id: canvas3d
        anchors.fill: parent

        // Emitted when one time initializations should happen
        onInitGL: {
            GLCode.initGL(canvas3d, eventSource);
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

        ControlEventSource {
            anchors.fill: parent
            focus: true
            id: eventSource
        }
    }

    Text {
        anchors.topMargin: 10
        anchors.top: parent.top
        anchors.horizontalCenter: parent.horizontalCenter
        color: "white"
        text: "'T' translate | 'R' rotate | 'S' scale | '+' increase size | '- decrease size<br />Press 'Q' twice to toggle world/local space"
    }
}
