//@author tiheikka / titta.heikkala@theqtcompany.com

Qt.include("three.js")
//Qt.include("OrbitControls.js")
Qt.include("BlendCharacter.js")
//Qt.include("BlendCharacterGui.js")

var blendMesh, camera, scene, renderer, controls;
var canvas;
var clock = new THREE.Clock();
var gui = null;

var isFrameStepping = false;
var timeToStep = 0;


function log(message) {
    if (canvas3d.logAllCalls)
        console.log(message)
}

function initGL(canvas) {
    console.log("initGL ENTER...");

    // scene

    scene = new THREE.Scene();
    scene.add ( new THREE.AmbientLight( 0xaaaaaa ) );

    camera = new THREE.PerspectiveCamera( 45, canvas.width / canvas.height, 1, 10000 );

    var light = new THREE.DirectionalLight( 0xffffff, 1.5 );
    light.position.set( 0, 0, 1000 );
    scene.add( light );

    renderer = new THREE.Canvas3DRenderer(
                { canvas: canvas, antialias: true, devicePixelRatio: canvas.devicePixelRatio });
    renderer.setClearColor( '#777777', 1 );
    renderer.setSize( canvas.width, canvas.height );
    renderer.autoClear = true;

    blendMesh = new THREE.BlendCharacter();
    blendMesh.load( "marine_anims.js", start );

    var radius = blendMesh.geometry.boundingSphere.radius;

    camera.position.set( 0.0, radius, radius * 3.5 );

}


function onCanvasResize(canvas) {

    if (camera === undefined) return;

    camera.aspect = canvas.width / canvas.height;
    camera.updateProjectionMatrix();

    renderer.setSize( canvas.width, canvas.height );

}

//function onStartAnimation( event ) {

//    var data = event.detail;

//    blendMesh.stopAll();

//    // the blend mesh will combine 1 or more animations
//    for ( var i = 0; i < data.anims.length; ++i ) {

//        blendMesh.play(data.anims[i], data.weights[i]);

//    }

//    isFrameStepping = false;

//}

//function onStopAnimation( event ) {

//    blendMesh.stopAll();
//    isFrameStepping = false;

//}

//function onPauseAnimation( event ) {

//    ( isFrameStepping ) ? blendMesh.unPauseAll(): blendMesh.pauseAll();

//    isFrameStepping = false;

//}

//function onStepAnimation( event ) {

//    blendMesh.unPauseAll();
//    isFrameStepping = true;
//    timeToStep = event.detail.stepSize;
//}

//function onWeightAnimation(event) {

//    var data = event.detail;
//    for ( var i = 0; i < data.anims.length; ++i ) {

//        blendMesh.applyWeight(data.anims[i], data.weights[i]);

//    }

//}

//function onCrossfade(event) {

//    var data = event.detail;

//    blendMesh.stopAll();
//    blendMesh.crossfade( data.from, data.to, data.time );

//    isFrameStepping = false;

//}

//function onWarp( event ) {

//    var data = event.detail;

//    blendMesh.stopAll();
//    blendMesh.warp( data.from, data.to, data.time );

//    isFrameStepping = false;

//}


//function onLockCameraToggle( event ) {

//    var shouldLock = event.detail.shouldLock;
//    controls.enabled = !shouldLock;

//}

//function onShowSkeleton( event ) {

//    var shouldShow = event.detail.shouldShow;
//    blendMesh.showSkeleton( shouldShow );

//}

function onShowModel( event ) {

    var shouldShow = event.detail.shouldShow;
    blendMesh.showModel( shouldShow );

}

function start() {

    blendMesh.rotation.y = Math.PI * -135 / 180;
    scene.add( blendMesh );

//    controls = new THREE.OrbitControls( camera );
//    controls.target = new THREE.Vector3( 0, radius, 0 );
//    controls.update();

    // Set default weights

    blendMesh.animations[ 'idle' ].weight = 1 / 3;
    blendMesh.animations[ 'walk' ].weight = 1 / 3;
    blendMesh.animations[ 'run' ].weight = 1 / 3;

//    gui = new BlendCharacterGui(blendMesh.animations);

}

function renderGL(canvas) {

    log("renderGL ENTER...");

    // step forward in time based on whether we're stepping and scale

//    var scale = gui.getTimeScale();
//    var delta = clock.getDelta();
//    var stepSize = (!isFrameStepping) ? delta * scale: timeToStep;

//    // modify blend weights

//    blendMesh.update( stepSize );
//    gui.update();

//    THREE.AnimationHandler.update( stepSize );

    renderer.render( scene, camera );

    // if we are stepping, consume time
    // ( will equal step size next time a single step is desired )

//    timeToStep = 0;

    log("renderGL EXIT...");

}
