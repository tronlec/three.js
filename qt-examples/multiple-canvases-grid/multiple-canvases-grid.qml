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

    ControlEventSource {
        anchors.fill: parent
        focus: true
        id: eventSource
    }

    Canvas3D {
        id: canvas1
        x: 0
        y: 0
        width: canvasWidth * 2
        height: canvasHeight * 2
        focus: true
        property variant app

        // Emitted when one time initializations should happen
        onInitializeGL: {
            app = new GLCode.App();
            app.initializeGL(canvas1, eventSource, width, height, 0, 0, canvasWidth, canvasHeight);
        }

        // Emitted each time Canvas3D is ready for a new frame
        onPaintGL: {
            if (app)
                app.paintGL(canvas1);
        }

        onResizeGL: {
            if (app)
                app.onResizeGL(canvas1);
        }

    }

    Canvas3D {
        id: canvas2
        x: canvasWidth * 2
        y: 0
        width: canvasWidth * 2
        height: canvasHeight * 2
        focus: true
        property variant app

        // Emitted when one time initializations should happen
        onInitializeGL: {
            app = new GLCode.App();
            app.initializeGL(canvas2, eventSource, width, height, canvasWidth, 0,
                          canvasWidth, canvasHeight);
        }

        // Emitted each time Canvas3D is ready for a new frame
        onPaintGL: {
            if (app)
                app.paintGL(canvas2);
        }

        onResizeGL: {
            if (app)
                app.onResizeGL(canvas2);
        }

    }

    Canvas3D {
        id: canvas3
        x: 0
        y: canvasHeight * 2
        width: canvasWidth * 2
        height: canvasHeight * 2
        focus: true
        property variant app

        // Emitted when one time initializations should happen
        onInitializeGL: {
            app = new GLCode.App();
            app.initializeGL(canvas3, eventSource, width, height, 0, canvasHeight,
                          canvasWidth, canvasHeight);
        }

        // Emitted each time Canvas3D is ready for a new frame
        onPaintGL: {
            if (app)
                app.paintGL(canvas3);
        }

        onResizeGL: {
            if (app)
                app.onResizeGL(canvas3);
        }

    }

    Canvas3D {
        id: canvas4
        x: canvasWidth * 2
        y: canvasHeight * 2
        width: canvasWidth * 2
        height: canvasHeight * 2
        focus: true
        property variant app

        // Emitted when one time initializations should happen
        onInitializeGL: {
            app = new GLCode.App();
            app.initializeGL(canvas4, eventSource, width, height, canvasWidth, canvasHeight,
                          canvasWidth, canvasHeight);
        }

        // Emitted each time Canvas3D is ready for a new frame
        onPaintGL: {
            if (app)
                app.paintGL(canvas4);
        }

        onResizeGL: {
            if (app)
                app.onResizeGL(canvas4);
        }

    }

    Rectangle { anchors.fill: canvas1; border.color: "red"; color: "transparent" }
    Rectangle { anchors.fill: canvas2; border.color: "red"; color: "transparent" }
    Rectangle { anchors.fill: canvas3; border.color: "red"; color: "transparent" }
    Rectangle { anchors.fill: canvas4; border.color: "red"; color: "transparent" }
}
