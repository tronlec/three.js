import QtQuick 2.4
import QtCanvas3D 1.1
import QtQuick.Window 2.2

import "loader-gltf.js" as GLCode

Window {
    title: qsTr("THREE.GLTFLoader example")
    width: 1280
    height: 768
    visible: true

    Canvas3D {
        id: canvas3d
        anchors.fill: parent
        focus: true

        onInitializeGL: {
            GLCode.initializeGL(canvas3d, eventSource);
        }

        onPaintGL: {
            GLCode.paintGL(canvas3d);
        }

        onResizeGL: {
            GLCode.resizeGL(canvas3d);
        }

        ControlEventSource {
            id: eventSource
            anchors.fill: parent
            focus: true
        }
    }
}

