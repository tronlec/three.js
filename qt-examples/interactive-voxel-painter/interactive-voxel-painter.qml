import QtQuick 2.0
import QtCanvas3D 1.0
import QtQuick.Controls 1.2

import "interactive-voxel-painter.js" as GLCode

Item {
    id: mainview
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

        onWidthChanged: {
            GLCode.onResizeGL(canvas3d);
        }

        onHeightChanged: {
            GLCode.onResizeGL(canvas3d);
        }

        onDevicePixelRatioChanged: {
            GLCode.onResizeGL(canvas3d);
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
        text: "<strong>click</strong>: add voxel, <strong>shift + click</strong>: remove voxel"
    }
}
