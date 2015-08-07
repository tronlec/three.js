import QtQuick 2.4
import QtCanvas3D 1.1
import QtQuick.Controls 1.1
import QtQuick.Layouts 1.1
import QtQuick.Window 2.2

import "quickitemtexture.js" as GLCode

Window {
    id: mainview
    width: 800
    height: 600
    visible: true
    title: "Qt Quick Item as Texture"
    color: "#f9f9f9"

    ColumnLayout {
        Layout.fillWidth: true
        x: 4
        y: 4
        //! [0]
        Rectangle {
            id: textureSource
            color: "lightgreen"
            width: 256
            height: 256
            border.color: "blue"
            border.width: 4
            layer.enabled: true
            layer.smooth: true
            // Flip again to show the label correctly in UI as well. Note that transforms done
            // to layered item do not manifest into the generated texture.
            transform: Scale { origin.y: textureSource.height / 2; yScale: -1 }
            Label {
                id: infoLabel
                // Layer generates Y-mirrored textures, so flip the label
                transform: Scale { origin.y: infoLabel.height / 2; yScale: -1 }
                anchors.fill: parent
                anchors.margins: 16
                text: "X Rot:" + (canvas3d.xRotAnim | 0) + "\n"
                    + "Y Rot:" + (canvas3d.yRotAnim | 0) + "\n"
                    + "Z Rot:" + (canvas3d.zRotAnim | 0) + "\n"
                    + "FPS:" + canvas3d.fps
                color: "red"
                font.pointSize: 30
                horizontalAlignment: Text.AlignLeft
                verticalAlignment: Text.AlignVCenter
            }
        }
        //! [0]
        Button {
            Layout.fillWidth: true
            Layout.minimumWidth: 256
            text: textureSource.visible ? "Hide texture source" : "Show texture source"
            onClicked: textureSource.visible = !textureSource.visible
        }
        Button {
            Layout.fillWidth: true
            Layout.minimumWidth: 256
            text: "Quit"
            onClicked: Qt.quit()
        }
    }

    Canvas3D {
        id: canvas3d
        anchors.fill:parent
        focus: true
        property double xRotAnim: 0
        property double yRotAnim: 0
        property double zRotAnim: 0
        property bool isRunning: true

        // Emitted when one time initializations should happen
        onInitializeGL: {
            GLCode.initializeGL(canvas3d, textureSource);
        }

        // Emitted each time Canvas3D is ready for a new frame
        onPaintGL: {
            GLCode.paintGL(canvas3d);
        }

        onResizeGL: {
            GLCode.resizeGL(canvas3d);
        }

        Keys.onSpacePressed: {
            canvas3d.isRunning = !canvas3d.isRunning
            if (canvas3d.isRunning) {
                objAnimationX.pause();
                objAnimationY.pause();
                objAnimationZ.pause();
            } else {
                objAnimationX.resume();
                objAnimationY.resume();
                objAnimationZ.resume();
            }
        }

        SequentialAnimation {
            id: objAnimationX
            loops: Animation.Infinite
            running: true
            NumberAnimation {
                target: canvas3d
                property: "xRotAnim"
                from: 0.0
                to: 120.0
                duration: 7000
                easing.type: Easing.InOutQuad
            }
            NumberAnimation {
                target: canvas3d
                property: "xRotAnim"
                from: 120.0
                to: 0.0
                duration: 7000
                easing.type: Easing.InOutQuad
            }
        }

        SequentialAnimation {
            id: objAnimationY
            loops: Animation.Infinite
            running: true
            NumberAnimation {
                target: canvas3d
                property: "yRotAnim"
                from: 0.0
                to: 240.0
                duration: 5000
                easing.type: Easing.InOutCubic
            }
            NumberAnimation {
                target: canvas3d
                property: "yRotAnim"
                from: 240.0
                to: 0.0
                duration: 5000
                easing.type: Easing.InOutCubic
            }
        }

        SequentialAnimation {
            id: objAnimationZ
            loops: Animation.Infinite
            running: true
            NumberAnimation {
                target: canvas3d
                property: "zRotAnim"
                from: -100.0
                to: 100.0
                duration: 3000
                easing.type: Easing.InOutSine
            }
            NumberAnimation {
                target: canvas3d
                property: "zRotAnim"
                from: 100.0
                to: -100.0
                duration: 3000
                easing.type: Easing.InOutSine
            }
        }
    }
}
