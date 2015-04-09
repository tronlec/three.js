import QtQuick 2.0
import QtCanvas3D 1.0

import "multiple-canvases-grid.js" as GLCode

Item {
    id: mainview
    width: 1200
    height: 800
    visible: true

    property int canvasWidth: 300
    property int canvasHeight: 200

    Canvas3D {
        id: canvas1
        x: 0
        y: 0
        width: canvasWidth * 2
        height: canvasHeight * 2
        focus: true

        // Emitted when one time initializations should happen
        onInitGL: {
            GLCode.initGL(canvas1, eventSource1, width, height, 0, 0, canvasWidth, canvasHeight);
        }

        // Emitted each time Canvas3D is ready for a new frame
        onRenderGL: {
            GLCode.renderGL(canvas1);
        }

        onWidthChanged: {
            GLCode.onCanvasResize(canvas1);
        }

        onHeightChanged: {
            GLCode.onCanvasResize(canvas1);
        }

        onDevicePixelRatioChanged: {
            GLCode.onCanvasResize(canvas1);
        }

        ControlEventSource {
            anchors.fill: parent
            focus: true
            id: eventSource1
        }

    }

    Canvas3D {
        id: canvas2
        x: canvasWidth * 2
        y: 0
        width: canvasWidth * 2
        height: canvasHeight * 2
        focus: true

        // Emitted when one time initializations should happen
        onInitGL: {
            GLCode.initGL(canvas2, eventSource2, width, height, canvasWidth, 0,
                          canvasWidth, canvasHeight);
        }

        // Emitted each time Canvas3D is ready for a new frame
        onRenderGL: {
            GLCode.renderGL(canvas2);
        }

        onWidthChanged: {
            GLCode.onCanvasResize(canvas2);
        }

        onHeightChanged: {
            GLCode.onCanvasResize(canvas2);
        }

        onDevicePixelRatioChanged: {
            GLCode.onCanvasResize(canvas2);
        }

        ControlEventSource {
            anchors.fill: parent
            focus: true
            id: eventSource2
        }

    }

    Canvas3D {
        id: canvas3
        x: 0
        y: canvasHeight * 2
        width: canvasWidth * 2
        height: canvasHeight * 2
        focus: true

        // Emitted when one time initializations should happen
        onInitGL: {
            GLCode.initGL(canvas3, eventSource3, width, height, 0, canvasHeight,
                          canvasWidth, canvasHeight);
        }

        // Emitted each time Canvas3D is ready for a new frame
        onRenderGL: {
            GLCode.renderGL(canvas3);
        }

        onWidthChanged: {
            GLCode.onCanvasResize(canvas3);
        }

        onHeightChanged: {
            GLCode.onCanvasResize(canvas3);
        }

        onDevicePixelRatioChanged: {
            GLCode.onCanvasResize(canvas3);
        }

        ControlEventSource {
            anchors.fill: parent
            focus: true
            id: eventSource3
        }

    }

    Canvas3D {
        id: canvas4
        x: canvasWidth * 2
        y: canvasHeight * 2
        width: canvasWidth * 2
        height: canvasHeight * 2
        focus: true

        // Emitted when one time initializations should happen
        onInitGL: {
            GLCode.initGL(canvas4, eventSource4, width, height, canvasWidth, canvasHeight,
                          canvasWidth, canvasHeight);
        }

        // Emitted each time Canvas3D is ready for a new frame
        onRenderGL: {
            GLCode.renderGL(canvas4);
        }

        onWidthChanged: {
            GLCode.onCanvasResize(canvas4);
        }

        onHeightChanged: {
            GLCode.onCanvasResize(canvas4);
        }

        onDevicePixelRatioChanged: {
            GLCode.onCanvasResize(canvas4);
        }

        ControlEventSource {
            anchors.fill: parent
            focus: true
            id: eventSource4
        }

    }

    Rectangle { anchors.fill: canvas1; border.color: "red"; color: "transparent" }
    Rectangle { anchors.fill: canvas2; border.color: "red"; color: "transparent" }
    Rectangle { anchors.fill: canvas3; border.color: "red"; color: "transparent" }
    Rectangle { anchors.fill: canvas4; border.color: "red"; color: "transparent" }
}
