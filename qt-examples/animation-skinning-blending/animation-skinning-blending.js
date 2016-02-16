//@author tiheikka / titta.heikkala@theqtcompany.com

Qt.include("three.js")
Qt.include("OrbitControls.js")
Qt.include("BlendCharacter.js")
//Qt.include("BlendCharacterGui.js")

var blendMesh, helper, camera, scene, renderer, controls, controlEventSource;
var canvas3d;
var clock = new THREE.Clock();

var isFrameStepping = false;
var timeToStep = 0;


function log(message) {
    if (canvas3d.logAllCalls)
        console.log(message)
}

function initializeGL(canvas, eventSource) {
    console.log("initializeGL ENTER...");

    canvas3d = canvas;
    controlEventSource = eventSource;

    // scene

    scene = new THREE.Scene();
    scene.add ( new THREE.AmbientLight( 0xaaaaaa ) );

    var light = new THREE.DirectionalLight( 0xffffff, 1.5 );
    light.position.set( 0, 0, 1000 );
    scene.add( light );

    camera = new THREE.PerspectiveCamera( 45, canvas.width / canvas.height, 1, 10000 );

    renderer = new THREE.Canvas3DRenderer(
                { canvas: canvas, antialias: true, alpha:false, devicePixelRatio: canvas.devicePixelRatio });
    renderer.setClearColor( '#777777', 1 );
    renderer.setSize( canvas.width, canvas.height );
    renderer.autoClear = true;

    blendMesh = new THREE.BlendCharacter();
    blendMesh.load( "marine_anims.js", start );
}


function onResizeGL(canvas) {

    if (camera === undefined) return;

    camera.aspect = canvas.width / canvas.height;
    camera.updateProjectionMatrix();

    renderer.setSize( canvas.width, canvas.height );

}

function onStartAnimation( data ) {

    blendMesh.stopAll();

    // the blend mesh will combine 1 or more animations
    for ( var i = 0; i < data.anims.length; ++i ) {

        blendMesh.play(data.anims[i], data.weights[i]);

    }

    isFrameStepping = false;

}

function onStopAnimation() {

    blendMesh.stopAll();
    isFrameStepping = false;

}

function onPauseAnimation( ) {

    isFrameStepping ? blendMesh.unPauseAll(): blendMesh.pauseAll();

    isFrameStepping = false;

}

function onStepAnimation(stepSize) {

    blendMesh.unPauseAll();
    isFrameStepping = true;
    timeToStep = stepSize;
}

function onWeightAnimation(data) {

    for ( var i = 0; i < data.anims.length; ++i ) {

        blendMesh.applyWeight(data.anims[i], data.weights[i]);

    }

}

function onCrossfade(data) {

    blendMesh.stopAll();
    blendMesh.crossfade( data.from, data.to, data.time );

    isFrameStepping = false;

}

function onWarp( data ) {

    blendMesh.stopAll();
    blendMesh.warp( data.from, data.to, data.time );

    isFrameStepping = false;

}


function onShowSkeleton( shouldShow ) {

    helper.visible = shouldShow;

}

function onShowModel( shouldShow ) {

    blendMesh.showModel( shouldShow );

}

function start() {


    blendMesh.rotation.y = Math.PI * -135 / 180;
    scene.add( blendMesh );

    var radius = blendMesh.geometry.boundingSphere.radius;
    camera.position.set( 0.0, radius, radius * 3.5 );

    controls = new THREE.OrbitControls( camera, controlEventSource );
    controls.target.set( 0, radius, 0 );
    controls.update();

    // Set default weights
    blendMesh.applyWeight( 'idle', 1 / 3 );
    blendMesh.applyWeight( 'walk', 1 / 3 );
    blendMesh.applyWeight( 'run', 1 / 3 );
    // TODO: GUI needs complete rewrite as QtQuick
    //gui = new BlendCharacterGui(blendMesh);

    // Create the debug visualization
//    helper = new THREE.SkeletonHelper( blendMesh );
//    helper.material.linewidth = 3;
//    scene.add( helper );

//    helper.visible = false;
}

function paintGL(canvas, guiParameters) {

    log("paintGL ENTER...");

    // step forward in time based on whether we're stepping and scale

    var scale = guiParameters.timeScale;
    var delta = clock.getDelta();
    var stepSize = (!isFrameStepping) ? delta * scale: timeToStep;

    // modify blend weights

    if(blendMesh.mixer)
        blendMesh.update( stepSize );
    // TODO: GUI needs complete rewrite as QtQuick
    //helper.update();
    //gui.update( blendMesh.mixer.time );

    renderer.render( scene, camera );

    // if we are stepping, consume time
    // ( will equal step size next time a single step is desired )

    timeToStep = 0;

    log("paintGL EXIT...");
}
