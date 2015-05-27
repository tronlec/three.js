three.js
========
#### What this branch is about? ####

This branch of the three.js includes changes and a new Canvas3DRenderer that allows it to run inside the QtQuick JavaScript environment and use the QtCanvas3D module for rendering. See https://qt.gitorious.org/qt/qtcanvas3d 

The ready built libraries are meant to be used with Qt 5.5 that contains the Canvas3D and necessary changes to the QtQuick JavaScript engine (support for TypedArrays etc.). To build three.js that works with Qt 5.4 dev branch you need to use the utils/build/build_qt_5_4.sh script to build a new library that includes the TypedArray wrappers and includes the correct version of Canvas3DRenderer for Qt 5.4 that matches the Canvas3D Technology Preview 2 API.

#### JavaScript 3D library ####

The aim of the project is to create a lightweight 3D library with a very low level of complexity — in other words, for dummies. The library provides &lt;canvas&gt;, &lt;svg&gt;, CSS3D, WebGL and Qt Canvas3D renderers.

[Examples](http://threejs.org/) — [Documentation](http://threejs.org/docs/) — [Migrating](https://github.com/mrdoob/three.js/wiki/Migration) — [Help](http://stackoverflow.com/questions/tagged/three.js)


### Usage with Qt Canvas3D ###

Download the [library](https://github.com/tronlec/three.js/blob/master/build/three.js) and include it in your project's resource (.qrc) file along with the code that uses three.js, then include the three.js library to the JavaScript file that will use it.

This QML code adds the Canvas3D as the only component to the QtQuick scene.

```QML
import QtQuick 2.0
import QtCanvas3D 1.0
import QtQuick.Controls 1.2

import "code.js" as GLCode

Item {
    id: mainview
    width: 1280
    height: 768
    visible: true

    Canvas3D {
        id: canvas3d
        anchors.fill: parent

        onInitializeGL: {
            GLCode.initializeGL(canvas3d);
        }

        onPaintGL: {
            GLCode.paintGL(canvas3d);
        }
        
        onResizeGL: {
            GLCode.resizeGL(canvas3d);
        }
    }
}
```


This code (place it in "code.js" file in your Qt resource file) creates a scene, then creates a camera, adds the camera and cube to the scene, creates a &lt;Canvas3D&gt; renderer.

```JavaScript
	Qt.include("three.js")

	var camera, scene, renderer;
	var geometry, material, mesh;

	function initializeGL(canvas) {

		camera = new THREE.PerspectiveCamera( 75, canvas.width / canvas.height, 1, 10000 );
		camera.position.z = 1000;

		scene = new THREE.Scene();

		geometry = new THREE.BoxGeometry( 200, 200, 200 );
		material = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } );

		mesh = new THREE.Mesh( geometry, material );
		scene.add( mesh );

		renderer = new THREE.Canvas3DRenderer( {canvas: canvas, devicePixelRatio: canvas.devicePixelRatio});
		renderer.setSize( canvas.width, canvas.height );
	}

	function paintGL(canvas) {

		mesh.rotation.x += 0.01;
		mesh.rotation.y += 0.02;

		renderer.render( scene, camera );

	}

	function resizeGL(canvas) {

		if (camera === undefined) return;

		camera.aspect = canvas.width / canvas.height;
		camera.updateProjectionMatrix();

		renderer.setSize( canvas.width, canvas.height );

	}
```
If everything went well you should see [this](http://jsfiddle.net/Gy4w7/).

For more examples on how to port content from HTML to run inside Qt Quick, see the /qt-examples folder that includes some of the three.js examples ported over to Qt Quick.