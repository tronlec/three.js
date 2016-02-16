//@author pasikeranen / pasi.keranen@theqtcompany.com

Qt.include("three.js")

var camera, scene, renderer;
var particleLight;

var objects = [], materials = [];

function initializeGL(canvas) {

    camera = new THREE.PerspectiveCamera( 45, canvas.width / canvas.height, 1, 2000 );
    camera.position.set( 0, 200, 800 );

    scene = new THREE.Scene();

    // Grid

    var line_material = new THREE.LineBasicMaterial( { color: 0x303030 } ),
            geometry = new THREE.Geometry(),
            floor = -75, step = 25;

    for ( var i = 0; i <= 40; i ++ ) {

        geometry.vertices.push( new THREE.Vector3( - 500, floor, i * step - 500 ) );
        geometry.vertices.push( new THREE.Vector3(   500, floor, i * step - 500 ) );

        geometry.vertices.push( new THREE.Vector3( i * step - 500, floor, -500 ) );
        geometry.vertices.push( new THREE.Vector3( i * step - 500, floor,  500 ) );

    }

    var line = new THREE.LineSegments( geometry, line_material );
    scene.add( line );

    // Materials
    var texture = new THREE.TextureLoader().load("qrc:/textures/land_ocean_ice_cloud_2048.jpg")

    materials.push( new THREE.MeshLambertMaterial( { map: texture, transparent: true } ) );
    materials.push( new THREE.MeshLambertMaterial( { color: 0xdddddd } ) );
    materials.push( new THREE.MeshPhongMaterial( { color: 0xdddddd, specular: 0x009900, shininess: 30, shading: THREE.FlatShading } ) );
    materials.push( new THREE.MeshNormalMaterial( ) );
    materials.push( new THREE.MeshBasicMaterial( { color: 0xffaa00, transparent: true, blending: THREE.AdditiveBlending } ) );
    //materials.push( new THREE.MeshBasicMaterial( { color: 0xff0000, blending: THREE.SubtractiveBlending } ) );

    materials.push( new THREE.MeshLambertMaterial( { color: 0xdddddd } ) );
    materials.push( new THREE.MeshPhongMaterial( { color: 0xdddddd, specular: 0x009900, shininess: 30, shading: THREE.SmoothShading, map: texture, transparent: true } ) );
    materials.push( new THREE.MeshNormalMaterial() );
    materials.push( new THREE.MeshBasicMaterial( { color: 0xffaa00, wireframe: true } ) );

    materials.push( new THREE.MeshDepthMaterial() );

    materials.push( new THREE.MeshLambertMaterial( { color: 0x666666, emissive: 0xff0000 } ) );
    materials.push( new THREE.MeshPhongMaterial( { color: 0x000000, specular: 0x666666, emissive: 0xff0000, shininess: 10, shading: THREE.SmoothShading, opacity: 0.9, transparent: true } ) );

    materials.push( new THREE.MeshBasicMaterial( { map: texture, transparent: true } ) );

    // Spheres geometry

    geometry = new THREE.SphereGeometry( 70, 32, 16 );

    for ( var i = 0, l = geometry.faces.length; i < l; i ++ ) {

        var face = geometry.faces[ i ];
        face.materialIndex = Math.floor( Math.random() * materials.length );

    }

    geometry.sortFacesByMaterialIndex();

    objects = [];

    for ( var i = 0, l = materials.length; i < l; i ++ ) {
        addMesh( geometry, materials[ i ] );
    }

    addMesh( geometry, new THREE.MultiMaterial( materials ) );

    particleLight = new THREE.Mesh( new THREE.SphereGeometry( 4, 8, 8 ), new THREE.MeshBasicMaterial( { color: 0xffffff } ) );
    scene.add( particleLight );

    // Lights

    scene.add( new THREE.AmbientLight( 0x111111 ) );

    var directionalLight = new THREE.DirectionalLight( /*Math.random() * */ 0xffffff, 0.125 );

    directionalLight.position.x = Math.random() - 0.5;
    directionalLight.position.y = Math.random() - 0.5;
    directionalLight.position.z = Math.random() - 0.5;

    directionalLight.position.normalize();

    scene.add( directionalLight );

    var pointLight = new THREE.PointLight( 0xffffff, 1 );
    particleLight.add( pointLight );

    renderer = new THREE.Canvas3DRenderer(
                { canvas: canvas, antialias: true, devicePixelRatio: canvas.devicePixelRatio });
    renderer.setPixelRatio( canvas.devicePixelRatio );
    renderer.setSize( canvas.width, canvas.height );
}

function addMesh( geometry, material ) {

    var mesh = new THREE.Mesh( geometry, material );

    mesh.position.x = ( objects.length % 4 ) * 200 - 400;
    mesh.position.z = Math.floor( objects.length / 4 ) * 200 - 200;

    mesh.rotation.x = Math.random() * 200 - 100;
    mesh.rotation.y = Math.random() * 200 - 100;
    mesh.rotation.z = Math.random() * 200 - 100;

    objects.push( mesh );

    scene.add( mesh );
}

function resizeGL(canvas) {

    camera.aspect = canvas.width / canvas.height;
    camera.updateProjectionMatrix();

    renderer.setPixelRatio( canvas.devicePixelRatio );
    renderer.setSize( canvas.width, canvas.height );
}

function paintGL(canvas) {

    var timer = 0.0001 * Date.now();

    camera.position.x = Math.cos( timer ) * 1000;
    camera.position.z = Math.sin( timer ) * 1000;

    camera.lookAt( scene.position );

    for ( var i = 0, l = objects.length; i < l; i ++ ) {

        var object = objects[ i ];

        object.rotation.x += 0.01;
        object.rotation.y += 0.005;

    }

    materials[ materials.length - 2 ].emissive.setHSL( 0.54, 1, 0.35 * ( 0.5 + 0.5 * Math.sin( 35 * timer ) ) );
    materials[ materials.length - 3 ].emissive.setHSL( 0.04, 1, 0.35 * ( 0.5 + 0.5 * Math.cos( 35 * timer ) ) );

    particleLight.position.x = Math.sin( timer * 7 ) * 300;
    particleLight.position.y = Math.cos( timer * 5 ) * 400;
    particleLight.position.z = Math.cos( timer * 3 ) * 300;

    renderer.render( scene, camera );

}
