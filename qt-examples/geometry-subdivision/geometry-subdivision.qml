import QtQuick 2.0
import QtCanvas3D 1.0
import QtQuick.Controls 1.3

import "geometry-subdivision.js" as GLCode

Item {
    id: mainview
    width: 1280
    height: 768
    visible: true

    Rectangle {
        id: rect
        color: "#f0f0f0"
        height: 130
        width: 300
        z: 1

        anchors.top: parent.top

        property int rectSpacing: 5

        property int geometryVertices;
        property int smoothVertices;
        property int geometryFaces;
        property int smoothFaces;

        function updateCounts() {
            geometryVertices = GLCode.geometryVertices();
            smoothVertices = GLCode.smoothVertices();
            geometryFaces = GLCode.geometryFaces();
            smoothFaces = GLCode.smoothFaces();
        }

        Text {
            id: dragText
            text: "Drag to Spin THREE." + combo.currentText
            width: parent.width
            anchors.top: parent.top
            anchors.left: parent.left
            anchors.margins: rect.rectSpacing
            anchors.bottomMargin: 10
        }

        Text {
            id: subdivText
            property int count: GLCode.subdivisionsCount()
            text: "Subdivisions: " + count.toString()
            anchors.left: parent.left
            anchors.verticalCenter: plusButton.verticalCenter
            anchors.margins: rect.rectSpacing
        }
        Button {
            id: plusButton
            text: "+"
            anchors.left: subdivText.right
            anchors.top: dragText.bottom
            anchors.margins: rect.rectSpacing
            onClicked: {
                GLCode.nextSubdivision(1);
                subdivText.count = GLCode.subdivisionsCount();
                rect.updateCounts();
            }
        }
        Button {
            text: "-"
            anchors.left: plusButton.right
            anchors.top: dragText.bottom
            anchors.margins: rect.rectSpacing
            onClicked: {
                GLCode.nextSubdivision(-1);
                subdivText.count = GLCode.subdivisionsCount();
                rect.updateCounts();
            }
        }

        Text {
            id: geometryText
            anchors.left: parent.left
            anchors.verticalCenter: combo.verticalCenter
            anchors.margins: rect.rectSpacing
            text: "Geometry:"
        }
        ComboBox {
            id: combo
            anchors.left: geometryText.right
            anchors.top: plusButton.bottom
            anchors.margins: rect.rectSpacing
            width: 150
            property bool ready: false
            model: GLCode.geometryList()
            onCurrentIndexChanged: {
                if (ready) {
                    GLCode.switchGeometry(currentIndex);
                    rect.updateCounts();
                }
            }
            Component.onCompleted: {
                ready = true;
            }
        }
        Button {
            anchors.left: combo.right
            anchors.top: plusButton.bottom
            anchors.margins: rect.rectSpacing
            text: "Next"
            onClicked: {
                if (combo.currentIndex == combo.count - 1)
                    combo.currentIndex = 0
                else
                    combo.currentIndex = combo.currentIndex + 1
            }
        }

        Text {
            id: verticesText
            width: parent.width
            anchors.top: combo.bottom
            anchors.left: parent.left
            anchors.margins: rect.rectSpacing
            text: "Vertices count: before " + rect.geometryVertices.toString()
                  + " after " + rect.smoothVertices.toString()
        }
        Text {
            width: parent.width
            anchors.top: verticesText.bottom
            anchors.left: parent.left
            anchors.margins: rect.rectSpacing
            text: "Face count: before " + rect.geometryFaces.toString()
                  + " after " + rect.smoothFaces.toString()
        }
    }

    Canvas3D {
        id: canvas3d
        width: parent.width
        anchors.fill: parent
        focus: true

        // Emitted when one time initializations should happen
        onInitializeGL: {
            GLCode.initializeGL(canvas3d, eventSource);
            rect.updateCounts();
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

        function geometriesLoaded() {
            combo.model = GLCode.geometryList();
        }
    }
}
