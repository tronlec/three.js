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
    loader.load( './models/ply/ascii/dolphins.ply', function ( geometry ) {
        geometry.computeFaceNormals();

        var material = new THREE.MeshStandardMaterial( { color: 0x0055ff } );
        var mesh = new THREE.Mesh( geometry, material );

        mesh.position.y = - 0.25;
        mesh.rotation.x = - Math.PI / 2;
        mesh.scale.multiplyScalar( 0.001 );

        mesh.castShadow = true;
        mesh.receiveShadow = true;

        scene.add( mesh );

    } );

    // Lights

    scene.add( new THREE.HemisphereLight( 0x443333, 0x111122 ) );

    addShadowedLight( 1, 1, 1, 0xffffff, 1.35 );
    addShadowedLight( 0.5, 1, -1, 0xffaa00, 1 );

    //

    renderer = new THREE.Canvas3DRenderer(
                { canvas: canvas, antialias: true, devicePixelRatio: canvas.devicePixelRatio });
    renderer.setPixelRatio( canvas.devicePixelRatio );
    renderer.setSize( canvas.width, canvas.height );

    renderer.setClearColor( scene.fog.color );

    renderer.gammaInput = true;
    renderer.gammaOutput = true;

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.cullFace = THREE.CullFaceBack;

}

function addShadowedLight( x, y, z, color, intensity ) {

    var directionalLight = new THREE.DirectionalLight( color, intensity );
    directionalLight.position.set( x, y, z );
    scene.add( directionalLight );

    directionalLight.castShadow = true;

    var d = 1;
    directionalLight.shadow.camera.left = -d;
    directionalLight.shadow.camera.right = d;
    directionalLight.shadow.camera.top = d;
    directionalLight.shadow.camera.bottom = -d;

    directionalLight.shadow.camera.near = 1;
    directionalLight.shadow.camera.far = 4;

    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;

    directionalLight.shadow.bias = -0.005;

}

function resizeGL(canvas) {

    camera.aspect = canvas.width / canvas.height;
    camera.updateProjectionMatrix();

    renderer.setPixelRatio( canvas.devicePixelRatio );
    renderer.setSize( canvas.width, canvas.height );

}

function paintGL(canvas) {
    var timer = Date.now() * 0.0005;

    camera.position.x = Math.sin( timer ) * 3;
    camera.position.z = Math.cos( timer ) * 3;

    camera.lookAt( scene.position );

    renderer.render( scene, camera );
}
