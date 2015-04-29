//@author tiheikka / titta.heikkala@theqtcompany.com

Qt.include("three.js")
Qt.include("js/loaders/PLYLoader.js")

var camera, cameraTarget, scene, renderer;

function initializeGL(canvas) {

    camera = new THREE.PerspectiveCamera( 35, canvas.width / canvas.height, 1, 15 );
    camera.position.set( 3, 0.15, 3 );

    cameraTarget = new THREE.Vector3( 0, -0.25, 0 );

    scene = new THREE.Scene();
    scene.fog = new THREE.Fog( 0x72645b, 2, 15 );

    // Ground

    var plane = new THREE.Mesh(
        new THREE.PlaneBufferGeometry( 40, 40 ),
        new THREE.MeshPhongMaterial( { color: 0x999999, specular: 0x101010 } )
    );
    plane.rotation.x = -Math.PI/2;
    plane.position.y = -0.5;
    scene.add( plane );

    plane.receiveShadow = true;


    // PLY file

    var loader = new THREE.PLYLoader();
    loader.addEventListener( 'load', function ( event ) {

        var geometry = event.content;
        var material = new THREE.MeshPhongMaterial( { color: 0x0055ff, specular: 0x111111, shininess: 200 } );
        var mesh = new THREE.Mesh( geometry, material );

        mesh.position.set( 0, - 0.25, 0 );
        mesh.rotation.set( 0, - Math.PI / 2, 0 );
        mesh.scale.set( 0.001, 0.001, 0.001 );

        mesh.castShadow = true;
        mesh.receiveShadow = true;

        scene.add( mesh );

    } );
    loader.load( './models/ply/ascii/dolphins.ply' );

    // Lights

    scene.add( new THREE.AmbientLight( 0x777777 ) );

    addShadowedLight( 1, 1, 1, 0xffffff, 1.35 );
    addShadowedLight( 0.5, 1, -1, 0xffaa00, 1 );

    //

    renderer = new THREE.Canvas3DRenderer(
                { canvas: canvas, antialias: true, devicePixelRatio: canvas.devicePixelRatio });
    renderer.setSize( canvas.width, canvas.height );

    renderer.setClearColor( scene.fog.color );

    renderer.gammaInput = true;
    renderer.gammaOutput = true;

    renderer.shadowMapEnabled = true;
    renderer.shadowMapCullFace = THREE.CullFaceBack;

}

function addShadowedLight( x, y, z, color, intensity ) {

    var directionalLight = new THREE.DirectionalLight( color, intensity );
    directionalLight.position.set( x, y, z )
    scene.add( directionalLight );

    directionalLight.castShadow = true;

    var d = 1;
    directionalLight.shadowCameraLeft = -d;
    directionalLight.shadowCameraRight = d;
    directionalLight.shadowCameraTop = d;
    directionalLight.shadowCameraBottom = -d;

    directionalLight.shadowCameraNear = 1;
    directionalLight.shadowCameraFar = 4;

    directionalLight.shadowMapWidth = 1024;
    directionalLight.shadowMapHeight = 1024;

    directionalLight.shadowBias = -0.005;
    directionalLight.shadowDarkness = 0.15;

}

function onResizeGL(canvas) {
    if (camera === undefined) return;

    camera.aspect = canvas.width / canvas.height;
    camera.updateProjectionMatrix();

    renderer.setSize( canvas.width, canvas.height );

}

function paintGL(canvas) {
    var timer = Date.now() * 0.0005;

    camera.position.x = Math.sin( timer ) * 3;
    camera.position.z = Math.cos( timer ) * 3;

    camera.lookAt( scene.position );

    renderer.render( scene, camera );
}
