import QtQuick 2.0
import QtCanvas3D 1.0
import QtQuick.Controls 1.3

import "controls-transform.js" as GLCode

ApplicationWindow {
    id: mainview
    title: qsTr("Qt Canvas 3D + three.js Examples - Transform Controls")
    width: 1280
    height: 768
    visible: true

    Canvas3D {
        id: canvas3d
        anchors.fill: parent

        // Emitted when one time initializations should happen
        onInitializeGL: {
            GLCode.initializeGL(canvas3d, eventSource);
        }

        // Emitted each time Canvas3D is ready for a new frame
        onPaintGL: {
            GLCode.paintGL(canvas3d);
        }

        onResizeGL: {
            GLCode.resizeGL(canvas3d);
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
