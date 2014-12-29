//@author tiheikka / titta.heikkala@theqtcompany.com

Qt.include("three.js")
Qt.include("helvetiker_regular.typeface.js")

var camera, scene, renderer;

var group, text;

var canvas;

var targetRotation = 0;
var targetRotationOnMouseDown = 0;

var mouseX = 0;
var mouseXOnMouseDown = 0;

//var windowHalfX = canvas.width / 2;
//var windowHalfY = canvas.height / 2;


function log(message) {
    if (canvas3d.logAllCalls)
        console.log(message)
}

function initGL(canvas) {
    log("initGL ENTER...");

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera( 50, canvas.width / canvas.height, 1, 10000 );
    camera.position.set( 0, 150, 500 );

    // Get text from hash

    var theText = "Hello three.js! :)";

    //var hash = document.location.hash.substr( 1 );

//    if ( hash.length !== 0 ) {

//        theText = hash;

//    }

    var text3d = new THREE.TextGeometry( theText, {

        size: 80,
        height: 20,
        curveSegments: 2,
        font: "helvetiker"

    });

    text3d.computeBoundingBox();
    var centerOffset = -0.5 * ( text3d.boundingBox.max.x - text3d.boundingBox.min.x );

    var textMaterial = new THREE.MeshBasicMaterial( { color: Math.random() * 0xffffff, overdraw: 0.5 } );
    text = new THREE.Mesh( text3d, textMaterial );

    text.position.x = centerOffset;
    text.position.y = 100;
    text.position.z = 0;

    text.rotation.x = 0;
    text.rotation.y = Math.PI * 2;

    group = new THREE.Group();
    group.add( text );

    scene.add( group );

    renderer = new THREE.Canvas3DRenderer(
                { canvas: canvas, antialias: true, devicePixelRatio: canvas.devicePixelRatio });
    renderer.setClearColor( 0xf0f0f0 );
    renderer.setSize( canvas.width, canvas.height );

//    renderer.autoClear = false;
}

function onCanvasResize(canvas) {
    if (camera === undefined) return;

    camera.aspect = canvas.width / canvas.height;
    camera.updateProjectionMatrix();

    renderer.setSize( canvas.width, canvas.height );


}

function renderGL(canvas) {
    log("renderGL ENTER...");

    group.rotation.y += ( targetRotation - group.rotation.y ) * 0.05;
    renderer.render( scene, camera );

    log("renderGL EXIT...");
}
