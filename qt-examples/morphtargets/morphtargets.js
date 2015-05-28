//@author tiheikka / titta.heikkala@theqtcompany.com

Qt.include("three.js")

var camera, scene, renderer;
var morphCanvas;

var geometry, objects;

var mouseX = 0, mouseY = 0;

var mesh;

function initializeGL(canvas, eventSource) {

    morphCanvas = canvas;

    camera = new THREE.PerspectiveCamera( 45, canvas.width / canvas.height, 1, 15000 );
    camera.position.set( 0, 150, 500 );

    scene = new THREE.Scene();
    scene.fog = new THREE.Fog( 0x000000, 1, 15000 );

    var light = new THREE.PointLight( 0xff2200 );
    light.position.set( 100, 100, 100 );
    scene.add( light );

    var light = new THREE.AmbientLight( 0x111111 );
    scene.add( light );

    var geometry = new THREE.BoxGeometry( 100, 100, 100 );
    var material = new THREE.MeshLambertMaterial( { color: 0xffffff, morphTargets: true } );

    // construct 8 blend shapes

    for ( var i = 0; i < geometry.vertices.length; i ++ ) {

        var vertices = [];

        for ( var v = 0; v < geometry.vertices.length; v ++ ) {

            vertices.push( geometry.vertices[ v ].clone() );

            if ( v === i ) {

                vertices[ vertices.length - 1 ].x *= 2;
                vertices[ vertices.length - 1 ].y *= 2;
                vertices[ vertices.length - 1 ].z *= 2;

            }

        }

        geometry.morphTargets.push( { name: "target" + i, vertices: vertices } );

    }

    mesh = new THREE.Mesh( geometry, material );

    scene.add( mesh );

    //

    renderer = new THREE.Canvas3DRenderer(
                { canvas: canvas, antialias: true, alpha:false, devicePixelRatio: canvas.devicePixelRatio });
    renderer.setClearColor( 0x222222, 1 );
    renderer.setPixelRatio( canvas.devicePixelRatio );
    renderer.setSize( canvas.width, canvas.height );
    renderer.sortObjects = false;

    eventSource.mouseMove.connect(onDocumentMouseMove);
}

function resizeGL(canvas) {

    if (camera === undefined) return;

    camera.aspect = canvas.width / canvas.height;
    camera.updateProjectionMatrix();

    renderer.setPixelRatio( canvas.devicePixelRatio );
    renderer.setSize( canvas.width, canvas.height );

}

function onDocumentMouseMove( x, y ) {

    mouseX = ( x - morphCanvas.width / 2 );
    mouseY = ( y - morphCanvas.height / 2 ) * 2;

}

function onMorphTargetChange(index, value) {

    mesh.morphTargetInfluences[ index ] = value / 100;

}

function paintGL(canvas) {

    mesh.rotation.y += 0.01;

    camera.position.y += ( - mouseY - camera.position.y ) * .01;

    camera.lookAt( scene.position );

    renderer.render( scene, camera );

}
