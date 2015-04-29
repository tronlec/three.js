import QtQuick 2.0
import QtCanvas3D 1.0

import "buffergeometry.js" as GLCode

Item {
    id: mainview
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

        onWidthChanged: {
            GLCode.onResizeGL(canvas3d);
        }

        onHeightChanged: {
            GLCode.onResizeGL(canvas3d);
        }

        onDevicePixelRatioChanged: {
            GLCode.onResizeGL(canvas3d);
        }
    }
}
