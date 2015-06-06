import QtQuick 2.0
import QtCanvas3D 1.0
import QtQuick.Controls 1.3
import QtQuick.Layouts 1.1

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

    ExclusiveGroup {
        id: modeGroup
    }

    RowLayout {
        id: buttonLayout
        anchors.topMargin: 10
        anchors.top: parent.top
        anchors.horizontalCenter: parent.horizontalCenter
//        anchors.left: parent.left
//        anchors.right: parent.right
        anchors.leftMargin: 16
        anchors.rightMargin: 16
        spacing: 6

        Button {
            id: translateButton
            text: "Translate"
            checkable: true
            exclusiveGroup: modeGroup
            Layout.fillWidth : true
            checked: true

            onClicked: GLCode.setTranslateMode();
        }

        Button {
            id: rotateButton
            text: "Rotate"
            checkable: true
            exclusiveGroup: modeGroup
            Layout.fillWidth : true

            onClicked: GLCode.setRotateMode();
        }

        Button {
            id: scaleButton
            text: "Scale"
            checkable: true
            exclusiveGroup: modeGroup
            Layout.fillWidth : true

            onClicked: GLCode.setScaleMode();
        }

        Item {
            width: 16
        }

        Button {
            id: incSizeButton
            text: "Increase Size"
            Layout.fillWidth : true

            onClicked: GLCode.increaseSize();
        }

        Button {
            id: decSizeButton
            text: "Decrease Size"
            Layout.fillWidth : true

            onClicked: GLCode.decreaseSize();
        }

        Item {
            width: 16
        }

        Label {
            text: "Coordinates:"
            color: "white"
        }

        Button {
            id: coordSelection
            text: "Local"
            Layout.fillWidth : true
            property bool isLocal: true

            onClicked: {
                if (coordSelection.isLocal) {
                    coordSelection.isLocal = false;
                    GLCode.setWorldControlSpace();
                    coordSelection.text = "World";
                }
                else {
                    coordSelection.isLocal = true;
                    GLCode.setLocalControlSpace();
                    coordSelection.text = "Local";
                }
            }
        }
    }
}
