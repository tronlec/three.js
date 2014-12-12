//@author pasikeranen / pasi.keranen@theqtcompany.com

Qt.include("three.js")

var container, stats;
var camera, scene, raycaster, renderer;

var mouse = new THREE.Vector2(), INTERSECTED;
var radius = 100, theta = 0;

function log(message) {
    if (canvas3d.logAllCalls)
        console.log(message)
}

function initGL(canvas) {
    log("initGL ENTER...");

    camera = new THREE.PerspectiveCamera( 70, canvas.width / canvas.height, 1, 10000 );

    scene = new THREE.Scene();

    var light = new THREE.DirectionalLight( 0xffffff, 1 );
    light.position.set( 1, 1, 1 ).normalize();
    scene.add( light );

    var geometry = new THREE.BoxGeometry( 20, 20, 20 );

    for ( var i = 0; i < 500; i ++ ) {

        var object = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color: Math.random() * 0xffffff } ) );

        object.position.x = Math.random() * 500 - 250;
        object.position.y = Math.random() * 500 - 250;
        object.position.z = Math.random() * 500 - 250;

        object.rotation.x = Math.random() * 2 * Math.PI;
        object.rotation.y = Math.random() * 2 * Math.PI;
        object.rotation.z = Math.random() * 2 * Math.PI;

        object.scale.x = Math.random() + 0.5;
        object.scale.y = Math.random() + 0.5;
        object.scale.z = Math.random() + 0.5;

        scene.add( object );

    }

    raycaster = new THREE.Raycaster();

    renderer = new THREE.Canvas3DRenderer(
                { canvas: canvas, antialias: true, devicePixelRatio: canvas.devicePixelRatio });
    renderer.setClearColor( 0xf0f0f0 );
    renderer.setSize( canvas.width, canvas.height );
    renderer.sortObjects = false;
}

function onCanvasResize(canvas) {
    if (camera === undefined) return;

    camera.aspect = canvas.width / canvas.height;
    camera.updateProjectionMatrix();

    renderer.devicePixelRatio = canvas.devicePixelRatio;
    renderer.setSize( canvas.width, canvas.height );
}

function onDocumentMouseMove( canvas, x, y ) {
    mouse.x = ( x / canvas.width ) * 2 - 1;
    mouse.y = - ( y / canvas.height ) * 2 + 1;
}

function renderGL(canvas) {
    log("renderGL ENTER...");

    theta += 0.1;

    camera.position.x = radius * Math.sin( THREE.Math.degToRad( theta ) );
    camera.position.y = radius * Math.sin( THREE.Math.degToRad( theta ) );
    camera.position.z = radius * Math.cos( THREE.Math.degToRad( theta ) );
    camera.lookAt( scene.position );

    // find intersections

    var vector = new THREE.Vector3( mouse.x, mouse.y, 1 ).unproject( camera );

    raycaster.set( camera.position, vector.sub( camera.position ).normalize() );

    var intersects = raycaster.intersectObjects( scene.children );

    if ( intersects.length > 0 ) {

        if ( INTERSECTED != intersects[ 0 ].object ) {

            if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );

            INTERSECTED = intersects[ 0 ].object;
            INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
            INTERSECTED.material.emissive.setHex( 0xff0000 );

        }

    } else {

        if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );

        INTERSECTED = null;

    }

    renderer.render( scene, camera );


    log("renderGL EXIT...");
}
