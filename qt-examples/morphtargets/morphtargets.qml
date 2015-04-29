import QtQuick 2.0
import QtCanvas3D 1.0
import QtQuick.Controls 1.2
import QtQuick.Layouts 1.1

import "morphtargets.js" as GLCode

Item {
    id: mainview
    width: 1280
    height: 768
    visible: true

    Component {
        id: sliderComponent
        Slider {
            width: 100
            value: 0
            minimumValue: 0
            maximumValue: 100
            onValueChanged: GLCode.onMorphTargetChange(modelIndex, value);
        }
    }

    Rectangle {
        id: layoutRect
        width: 130
        height: parent.height
        color: "#222222"

        Text {
            id: text
            anchors.left: parent.left
            anchors.margins: 5
            color: "white"
            text: "Use controls to change<br>morph target influences:"
        }

        Column {
            anchors.top: text.bottom
            anchors.left: parent.left
            anchors.margins: 5
            spacing: 10
            Repeater {
                model: 8
                delegate: Component {
                    id: delegateComponent
                    Loader {
                        property int modelIndex: index
                        sourceComponent: sliderComponent
                    }
                }
            }
        }
    }

    Canvas3D {
        id: canvas3d
        anchors.left: layoutRect.right
        anchors.right: parent.right
        height: parent.height
        focus: true

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
}
