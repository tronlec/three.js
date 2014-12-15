//@author Pasi Keränen / pasi.keranen@theqtcompany.com

Qt.include("three.js")
Qt.include("TrackballControls.js")

var camera, controls, scene, renderer;
var objects = [], plane;

var mouse = new THREE.Vector2(),
offset = new THREE.Vector3(),
INTERSECTED, SELECTED;

function log(message) {
    if (canvas3d.logAllCalls)
        console.log(message)
}

function initGL(canvas, mouseArea) {
    log("initGL ENTER...");

    camera = new THREE.PerspectiveCamera( 70, canvas.width / canvas.height, 1, 10000 );
    camera.position.z = 1000;

    controls = new THREE.TrackballControls( camera, canvas, mouseArea );
    controls.rotateSpeed = 1.0;
    controls.zoomSpeed = 1.2;
    controls.panSpeed = 0.8;
    controls.noZoom = false;
    controls.noPan = false;
    controls.staticMoving = true;
    controls.dynamicDampingFactor = 0.3;

    scene = new THREE.Scene();

    scene.add( new THREE.AmbientLight( 0x505050 ) );

    var light = new THREE.SpotLight( 0xffffff, 1.5 );
    light.position.set( 0, 500, 2000 );
    light.castShadow = true;

    light.shadowCameraNear = 200;
    light.shadowCameraFar = camera.far;
    light.shadowCameraFov = 50;

    light.shadowBias = -0.00022;
    light.shadowDarkness = 0.5;

    light.shadowMapWidth = 2048;
    light.shadowMapHeight = 2048;

    scene.add( light );

    var geometry = new THREE.BoxGeometry( 40, 40, 40 );

    for ( var i = 0; i < 200; i ++ ) {

        var object = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color: Math.random() * 0xffffff } ) );

        object.material.ambient = object.material.color;

        object.position.x = Math.random() * 1000 - 500;
        object.position.y = Math.random() * 600 - 300;
        object.position.z = Math.random() * 800 - 400;

        object.rotation.x = Math.random() * 2 * Math.PI;
        object.rotation.y = Math.random() * 2 * Math.PI;
        object.rotation.z = Math.random() * 2 * Math.PI;

        object.scale.x = Math.random() * 2 + 1;
        object.scale.y = Math.random() * 2 + 1;
        object.scale.z = Math.random() * 2 + 1;

        object.castShadow = true;
        object.receiveShadow = true;

        scene.add( object );

        objects.push( object );

    }

    plane = new THREE.Mesh(
        new THREE.PlaneBufferGeometry( 2000, 2000, 8, 8 ),
        new THREE.MeshBasicMaterial( { color: 0x000000, opacity: 0.25, transparent: true } )
    );
    plane.visible = false;
    scene.add( plane );

    renderer = new THREE.Canvas3DRenderer(
                { canvas: canvas, antialias: true, devicePixelRatio: canvas.devicePixelRatio });
    renderer.setClearColor( 0xf0f0f0 );
    renderer.setSize( canvas.width, canvas.height );
    renderer.sortObjects = false;

    renderer.shadowMapEnabled = true;
    renderer.shadowMapType = THREE.PCFShadowMap;

    mouseArea.mouseMove.connect(onDocumentMouseMove);
    mouseArea.mouseDown.connect(onDocumentMouseDown);
    mouseArea.mouseUp.connect(onDocumentMouseUp);
}

function onCanvasResize(canvas) {
    if (camera === undefined) return;

    camera.aspect = canvas.width / canvas.height;
    camera.updateProjectionMatrix();

    renderer.devicePixelRatio = canvas.devicePixelRatio;
    renderer.setSize( canvas.width, canvas.height );
}

function onDocumentMouseMove( mouseArea, canvas, x, y ) {

    mouse.x = ( x / canvas.width ) * 2 - 1;
    mouse.y = - ( y / canvas.height ) * 2 + 1;

    var vector = new THREE.Vector3( mouse.x, mouse.y, 0.5 ).unproject( camera );

    var raycaster = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );

    if ( SELECTED ) {
        var intersects = raycaster.intersectObject( plane );
        SELECTED.position.copy( intersects[ 0 ].point.sub( offset ) );
        return;
    }

    var intersects = raycaster.intersectObjects( objects );

    if ( intersects.length > 0 ) {
        if ( INTERSECTED !== intersects[ 0 ].object ) {
            if ( INTERSECTED ) INTERSECTED.material.color.setHex( INTERSECTED.currentHex );
            INTERSECTED = intersects[ 0 ].object;
            INTERSECTED.currentHex = INTERSECTED.material.color.getHex();
            plane.position.copy( INTERSECTED.position );
            plane.lookAt( camera.position );
        }

        mouseArea.cursorShape = Qt.OpenHandCursor;
    } else {
        if ( INTERSECTED ) INTERSECTED.material.color.setHex( INTERSECTED.currentHex );
        INTERSECTED = null;
        mouseArea.cursorShape = Qt.ArrowCursor;
    }
}

function onDocumentMouseDown( mouseArea, canvas, x, y ) {
    var vector = new THREE.Vector3( mouse.x, mouse.y, 0.5 ).unproject( camera );

    var raycaster = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );

    var intersects = raycaster.intersectObjects( objects );

    if ( intersects.length > 0 ) {

        controls.enabled = false;

        SELECTED = intersects[ 0 ].object;

        var intersects = raycaster.intersectObject( plane );
        offset.copy( intersects[ 0 ].point ).sub( plane.position );

        mouseArea.cursorShape = Qt.ClosedHandCursor;
    }
}

function onDocumentMouseUp( mouseArea, canvas, x, y ) {

    controls.enabled = true;

    if ( INTERSECTED ) {

        plane.position.copy( INTERSECTED.position );

        SELECTED = null;

    }

    mouseArea.cursorShape = Qt.ArrowCursor;
}

function renderGL(canvas) {
    log("renderGL ENTER...");

    controls.update();

    renderer.render( scene, camera );


    log("renderGL EXIT...");
}
