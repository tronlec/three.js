import QtQuick 2.0
import QtCanvas3D 1.0
import QtQuick.Controls 1.3

import "geometry-text.js" as GLCode

ApplicationWindow {
    id: mainview
    title: qsTr("Qt Canvas 3D + three.js Examples - Geometry - Text")
    width: 1280
    height: 768
    visible: true

    Button {
        id: colorButton
        anchors.left: parent.left
        width: parent.width / 5
        text: "Change Color"

        onClicked: GLCode.changeColor()
    }

    Button {
        id: fontButton
        anchors.left: colorButton.right
        width: parent.width / 5
        text: "Change Font"

        onClicked: GLCode.changeFont()
    }

    Button {
        id: weigthButton
        anchors.left: fontButton.right
        width: parent.width / 5
        text: "Change Weight"

        onClicked: GLCode.changeWeight()
    }

    Button {
        id: bevelButton
        anchors.left: weigthButton.right
        width: parent.width / 5
        text: "Change Bevel"

        onClicked: GLCode.changeBevel()
    }

    Button {
        id: postProcessingButton
        anchors.left: bevelButton.right
        anchors.right: parent.right
        width: parent.width / 5
        text: "Change Postprocessing"

        onClicked: GLCode.changePostProcessing()
    }

    TextInput {
        id: textInput
        width: colorButton.width * 4
        anchors.left: parent.left
        anchors.top: colorButton.bottom
        height: colorButton.height
        verticalAlignment: TextInput.AlignVCenter
        text: "three.js"
    }

    Button {
        id: changeTextButton
        width: colorButton.width
        anchors.top: colorButton.bottom
        anchors.left: textInput.right
        anchors.right: parent.right
        text: "Change Text"

        onClicked: GLCode.changeText(textInput.text)
    }

    Canvas3D {
        id: canvas3d
        width: parent.width
        anchors.top: textInput.bottom
        anchors.bottom: parent.bottom
        focus: true

        // Emitted when one time initializations should happen
        onInitializeGL: {
            GLCode.initializeGL(canvas3d, eventSource);
        }

        // Emitted each time Canvas3D is ready for a new frame
        onPaintGL: {
            GLCode.paintGL(canvas3d);
        }

        onResizeGL: {
            GLCode.onResizeGL(canvas3d);
        }

        ControlEventSource {
            anchors.fill: parent
            focus: true
            id: eventSource
        }
    }
}
