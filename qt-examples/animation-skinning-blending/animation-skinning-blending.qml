import QtQuick 2.0
import QtCanvas3D 1.0

import "animation-skinning-blending.js" as GLCode

Item {
    id: mainview
    width: 1280
    height: 768
    visible: true

    // Parameters that must be updated per frame from the GUI to the animation code
    Item {
        id: guiInputParameters

        property real timeScale: 1.0
    }

    /*
    TODO: GUI rewrite as QtQuick
    window.addEventListener( 'start-animation', onStartAnimation );
    window.addEventListener( 'stop-animation', onStopAnimation );
    window.addEventListener( 'pause-animation', onPauseAnimation );
    window.addEventListener( 'step-animation', onStepAnimation );
    window.addEventListener( 'weight-animation', onWeightAnimation );
    window.addEventListener( 'crossfade', onCrossfade );
    window.addEventListener( 'warp', onWarp );
    window.addEventListener( 'toggle-lock-camera', onLockCameraToggle );
    window.addEventListener( 'toggle-show-skeleton', onShowSkeleton );
    window.addEventListener( 'toggle-show-model', onShowModel );
    */

    Canvas3D {
        id: canvas3d
        anchors.fill: parent
        logAllCalls: false

        // Emitted when one time initializations should happen
        onInitializeGL: {
            GLCode.initializeGL(canvas3d, eventSource);
        }

        // Emitted each time Canvas3D is ready for a new frame
        onPaintGL: {
            GLCode.paintGL(canvas3d, guiInputParameters);
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
            id: eventSource
            anchors.fill: parent
            focus: true
        }
    }
}
