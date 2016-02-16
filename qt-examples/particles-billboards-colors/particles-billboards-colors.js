//@author tiheikka / titta.heikkala@theqtcompany.com

Qt.include("three.js")

var camera, scene, renderer, particles, geometry, material, i, h, color, colors = [], sprite, size;

var particlesCanvas;

var mouseX = 0, mouseY = 0;

function initializeGL(canvas, eventSource) {

    particlesCanvas = canvas;

    camera = new THREE.PerspectiveCamera( 50, canvas.width / canvas.height, 1, 3000 );
    camera.position.z = 1400;

    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2( 0x000000, 0.0009 );

    geometry = new THREE.Geometry();

    sprite = new THREE.TextureLoader().load( "textures/sprites/ball.png" );

    for ( i = 0; i < 5000; i ++ ) {

        var vertex = new THREE.Vector3();
        vertex.x = 2000 * Math.random() - 1000;
        vertex.y = 2000 * Math.random() - 1000;
        vertex.z = 2000 * Math.random() - 1000;

        geometry.vertices.push( vertex );

        colors[ i ] = new THREE.Color( 0xffffff );
        colors[ i ].setHSL( ( vertex.x + 1000 ) / 2000, 1, 0.5 );

    }

    geometry.colors = colors;

    material = new THREE.PointsMaterial( { size: 85, map: sprite, vertexColors: THREE.VertexColors, alphaTest: 0.5, transparent: true } );
    material.color.setHSL( 1.0, 0.2, 0.7 );

    particles = new THREE.Points( geometry, material );
    particles.sortParticles = true;

    scene.add( particles );

    //

    renderer = new THREE.Canvas3DRenderer(
                { canvas: canvas, antialias: true, clearAlpha: 1, devicePixelRatio: canvas.devicePixelRatio });
    renderer.setPixelRatio(canvas.devicePixelRatio);
    renderer.setSize( canvas.width, canvas.height );

    eventSource.mouseMove.connect(onDocumentMouseMove);
}

function resizeGL(canvas) {

    camera.aspect = canvas.width / canvas.height;
    camera.updateProjectionMatrix();

    renderer.setPixelRatio(canvas.devicePixelRatio);
    renderer.setSize( canvas.width, canvas.height );

    material.size = 85 * canvas.devicePixelRatio;

}

function onDocumentMouseMove( x, y ) {

    mouseX = x - particlesCanvas.width / 2;
    mouseY = y - particlesCanvas.height / 2;

}
function paintGL(canvas) {

    var time = Date.now() * 0.00005;

    camera.position.x += ( mouseX - camera.position.x ) * 0.05;
    camera.position.y += ( - mouseY - camera.position.y ) * 0.05;

    camera.lookAt( scene.position );

    h = ( 360 * ( 1.0 + time ) % 360 ) / 360;
    material.color.setHSL( h, 1.0, 0.6 );

    renderer.render( scene, camera );

}
