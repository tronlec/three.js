//@author tiheikka / titta.heikkala@theqtcompany.com

Qt.include("three.js")
Qt.include("TransformControls.js")

var camera, scene, renderer, control;

function initializeGL(canvas, eventSource) {

    camera = new THREE.PerspectiveCamera( 70, canvas.width / canvas.height, 1, 3000 );
    camera.position.set( 1000, 500, 1000 );
    camera.lookAt( new THREE.Vector3( 0, 200, 0) );

    scene = new THREE.Scene();
    scene.add( new THREE.GridHelper( 500, 100 ) );

    var light = new THREE.DirectionalLight( 0xffffff, 2 );
    light.position.set( 1, 1, 1 );
    scene.add( light );

    renderer = new THREE.Canvas3DRenderer(
                { canvas: canvas, antialias: true, devicePixelRatio: canvas.devicePixelRatio });

    var texture = new THREE.TextureLoader().load( 'qrc:/textures/crate.gif');
    texture.mapping = THREE.UVMapping;
    texture.anisotropy = renderer.getMaxAnisotropy();

    var geometry = new THREE.BoxGeometry( 200, 200, 200 );
    var material = new THREE.MeshLambertMaterial( { map: texture } );

    control = new THREE.TransformControls( camera, canvas, eventSource );

    var mesh = new THREE.Mesh( geometry, material );
    scene.add( mesh );

    control.attach( mesh );
    scene.add( control );

    //

    renderer.setPixelRatio( canvas.devicePixelRatio );
    renderer.setSize( canvas.width, canvas.height );

    setLocalControlSpace();

}

function resizeGL(canvas) {

    camera.aspect = canvas.width / canvas.height;
    camera.updateProjectionMatrix();

    renderer.setPixelRatio( canvas.devicePixelRatio );
    renderer.setSize( canvas.width, canvas.height );

}

function setLocalControlSpace() {
    control.setSpace( "local" );
}

function setWorldControlSpace() {
    control.setSpace( "world" );
}

function setTranslateMode() {
    control.setMode( "translate" );
}

function setRotateMode() {
    control.setMode( "rotate" )
}

function setScaleMode() {
    control.setMode( "scale" );
}

function increaseSize() {
    control.setSize( control.size + 0.1 );
}

function decreaseSize() {
    control.setSize( Math.max(control.size - 0.1, 0.1 ) );
}

function paintGL(canvas) {

    renderer.render( scene, camera );

}
