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

    var texture = THREE.ImageUtils.loadTexture( 'qrc:/textures/crate.gif', THREE.UVMapping );
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

    eventSource.keyDown.connect(onDocumentKeyDown);

}

function resizeGL(canvas) {

    camera.aspect = canvas.width / canvas.height;
    camera.updateProjectionMatrix();

    renderer.setPixelRatio( canvas.devicePixelRatio );
    renderer.setSize( canvas.width, canvas.height );

}

function onDocumentKeyDown( event ) {

    switch ( event.key ) {
      case Qt.Key_Q:
        control.setSpace( control.space == "local" ? "world" : "local" );
        break;
      case Qt.Key_T:
        control.setMode( "translate" );
        break;
      case Qt.Key_R:
        control.setMode( "rotate" );
        break;
      case Qt.Key_S:
        control.setMode( "scale" );
        break;
    case Qt.Key_Plus:
        control.setSize( control.size + 0.1 );
        break;
    case Qt.Key_Minus:
        control.setSize( Math.max(control.size - 0.1, 0.1 ) );
        break;
    }

}

function paintGL(canvas) {

    renderer.render( scene, camera );

}
