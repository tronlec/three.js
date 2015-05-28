//@author tiheikka / titta.heikkala@theqtcompany.com

Qt.include("three.js")

var camera, scene, renderer;
var plane, cube;
var mouse, raycaster, isShiftDown = false;

var rollOverGeo, rollOverMesh, rollOverMaterial;
var cubeGeo, cubeMaterial;

var voxelCanvas;

var objects = [];

function initializeGL(canvas, eventSource) {

    voxelCanvas = canvas;

    camera = new THREE.PerspectiveCamera( 45, canvas.width / canvas.height, 1, 10000 );
    camera.position.set( 500, 800, 1300 );
    camera.lookAt( new THREE.Vector3() );

    scene = new THREE.Scene();

    // roll-over helpers

    rollOverGeo = new THREE.BoxGeometry( 50, 50, 50 );
    rollOverMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000, opacity: 0.5, transparent: true } );
    rollOverMesh = new THREE.Mesh( rollOverGeo, rollOverMaterial );
    scene.add( rollOverMesh );

    // cubes

    cubeGeo = new THREE.BoxGeometry( 50, 50, 50 );
    cubeMaterial = new THREE.MeshLambertMaterial( { color: 0xfeb74c, shading: THREE.FlatShading, map: THREE.ImageUtils.loadTexture( 'qrc:/textures/square-outline-textured.png' ) } );

    // grid

    var size = 500, step = 50;

    var geometry = new THREE.Geometry();

    for ( var i = - size; i <= size; i += step ) {

        geometry.vertices.push( new THREE.Vector3( - size, 0, i ) );
        geometry.vertices.push( new THREE.Vector3(   size, 0, i ) );

        geometry.vertices.push( new THREE.Vector3( i, 0, - size ) );
        geometry.vertices.push( new THREE.Vector3( i, 0,   size ) );

    }

    var material = new THREE.LineBasicMaterial( { color: 0x000000, opacity: 0.2, transparent: true } );

    var line = new THREE.Line( geometry, material, THREE.LinePieces );
    scene.add( line );

    //

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    var geometry = new THREE.PlaneBufferGeometry( 1000, 1000 );
    geometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );

    plane = new THREE.Mesh( geometry );
    plane.visible = false;
    scene.add( plane );

    objects.push( plane );

    // Lights

    var ambientLight = new THREE.AmbientLight( 0x606060 );
    scene.add( ambientLight );

    var directionalLight = new THREE.DirectionalLight( 0xffffff );
    directionalLight.position.set( 1, 0.75, 0.5 ).normalize();
    scene.add( directionalLight );

    //

    renderer = new THREE.Canvas3DRenderer(
                { canvas: canvas, antialias: true, devicePixelRatio: canvas.devicePixelRatio });
    renderer.setClearColor( 0xf0f0f0 );
    renderer.setPixelRatio( canvas.devicePixelRatio );
    renderer.setSize( canvas.width, canvas.height );

    eventSource.mouseMove.connect(onDocumentMouseMove);
    eventSource.mouseDown.connect(onDocumentMouseDown);
    eventSource.keyDown.connect(onDocumentKeyDown);
    eventSource.keyUp.connect(onDocumentKeyUp);

}

function resizeGL(canvas) {

    camera.aspect = canvas.width / canvas.height;
    camera.updateProjectionMatrix();

    renderer.setPixelRatio( canvas.devicePixelRatio );
    renderer.setSize( canvas.width, canvas.height );

}

function onDocumentMouseMove( x, y ) {

    mouse.set( ( x / voxelCanvas.width ) * 2 - 1, - ( y / voxelCanvas.height ) * 2 + 1 );

    raycaster.setFromCamera( mouse, camera );

    var intersects = raycaster.intersectObjects( objects );

    if ( intersects.length > 0 ) {

        var intersect = intersects[ 0 ];

        rollOverMesh.position.copy( intersect.point ).add( intersect.face.normal );
        rollOverMesh.position.divideScalar( 50 ).floor().multiplyScalar( 50 ).addScalar( 25 );

    }

}

function onDocumentMouseDown( x, y ) {

    mouse.set( ( x / voxelCanvas.width ) * 2 - 1, - ( y / voxelCanvas.height ) * 2 + 1 );

    raycaster.setFromCamera( mouse, camera );

    var intersects = raycaster.intersectObjects( objects );

    if ( intersects.length > 0 ) {

        var intersect = intersects[ 0 ];

        // delete cube

        if ( isShiftDown ) {

            if ( intersect.object != plane ) {

                scene.remove( intersect.object );

                objects.splice( objects.indexOf( intersect.object ), 1 );

            }

        // create cube

        } else {

            var voxel = new THREE.Mesh( cubeGeo, cubeMaterial );
            voxel.position.copy( intersect.point ).add( intersect.face.normal );
            voxel.position.divideScalar( 50 ).floor().multiplyScalar( 50 ).addScalar( 25 );
            scene.add( voxel );

            objects.push( voxel );

        }

    }

}

function onDocumentKeyDown( event ) {

    switch( event.key ) {

        case Qt.Key_Shift: isShiftDown = true; break;

    }

}

function onDocumentKeyUp( event ) {

    switch ( event.key ) {

        case Qt.Key_Shift: isShiftDown = false; break;

    }

}

function paintGL(canvas) {

    renderer.render( scene, camera );

}
