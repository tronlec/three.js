//@author tiheikka / titta.heikkala@theqtcompany.com

Qt.include("three.js")
Qt.include("js/loaders/DDSLoader.js")

var camera, scene, renderer;
var geometry;
var meshes = [];

function initializeGL(canvas) {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera( 50, canvas.width / canvas.height, 1, 2000 );
    camera.position.z = 1000;

    geometry = new THREE.BoxGeometry( 200, 200, 200 );

    /*
    This is how compressed textures are supposed to be used:

    DXT1 - RGB - opaque textures
    DXT3 - RGBA - transparent textures with sharp alpha transitions
    DXT5 - RGBA - transparent textures with full alpha range
    */

    var loader = new THREE.DDSLoader();

    var map1 = loader.load( 'qrc:/textures/compressed/disturb_dxt1_nomip.dds' );
    map1.minFilter = map1.magFilter = THREE.LinearFilter;
    map1.anisotropy = 4;

    var map2 = loader.load( 'qrc:/textures/compressed/disturb_dxt1_mip.dds' );
    map2.anisotropy = 4;

    var map3 = loader.load( 'qrc:/textures/compressed/hepatica_dxt3_mip.dds' );
    map3.anisotropy = 4;

    var map4 = loader.load( 'qrc:/textures/compressed/explosion_dxt5_mip.dds' );
    map4.anisotropy = 4;

    var map5 = loader.load( 'qrc:/textures/compressed/disturb_argb_nomip.dds' );
    map5.minFilter = map5.magFilter = THREE.LinearFilter;
    map5.anisotropy = 4;

    var map6 = loader.load( 'qrc:/textures/compressed/disturb_argb_mip.dds' );
    map6.anisotropy = 4;

    var cubemap1 = loader.load( 'qrc:/textures/compressed/Mountains.dds', function ( texture ) {
        texture.magFilter = THREE.LinearFilter
        texture.minFilter = THREE.LinearFilter;
        texture.mapping = THREE.CubeReflectionMapping;
        material1.needsUpdate = true;
    } );

    var cubemap2 = loader.load( 'qrc:/textures/compressed/Mountains_argb_mip.dds', function ( texture ) {
        texture.magFilter = THREE.LinearFilter;
        texture.minFilter = THREE.LinearFilter;
        texture.mapping = THREE.CubeReflectionMapping;
        material5.needsUpdate = true;
    } );

    var cubemap3 = loader.load( 'qrc:/textures/compressed/Mountains_argb_nomip.dds', function ( texture ) {
        texture.magFilter = THREE.LinearFilter;
        texture.minFilter = THREE.LinearFilter;
        texture.mapping = THREE.CubeReflectionMapping;
        material6.needsUpdate = true;
    } );

    var material1 = new THREE.MeshBasicMaterial( { map: map1, envMap: cubemap1 } );
    var material2 = new THREE.MeshBasicMaterial( { map: map2 } );
    var material3 = new THREE.MeshBasicMaterial( { map: map3, alphaTest: 0.5, side: THREE.DoubleSide } );
    var material4 = new THREE.MeshBasicMaterial( { map: map4, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthTest: false, transparent: true } );
    var material5 = new THREE.MeshBasicMaterial( { envMap: cubemap2 } );
    var material6 = new THREE.MeshBasicMaterial( { envMap: cubemap3 } );
    var material7 = new THREE.MeshBasicMaterial( { map: map5 } );
    var material8 = new THREE.MeshBasicMaterial( { map: map6 } );


    var mesh = new THREE.Mesh( new THREE.TorusGeometry( 100, 50, 32, 16 ), material1 );
    mesh.position.x = -600;
    mesh.position.y = -200;
    scene.add( mesh );
    meshes.push( mesh );

    mesh = new THREE.Mesh( geometry, material2 );
    mesh.position.x = -200;
    mesh.position.y = -200;
    scene.add( mesh );
    meshes.push( mesh );

    mesh = new THREE.Mesh( geometry, material3 );
    mesh.position.x = -200;
    mesh.position.y = 200;
    scene.add( mesh );
    meshes.push( mesh );

    mesh = new THREE.Mesh( geometry, material4 );
    mesh.position.x = -600;
    mesh.position.y = 200;
    scene.add( mesh );
    meshes.push( mesh );

    mesh = new THREE.Mesh( new THREE.BoxGeometry( 200, 200, 200 ), material5 );
    mesh.position.x = 200;
    mesh.position.y = 200;
    scene.add( mesh );
    meshes.push( mesh );

    mesh = new THREE.Mesh( new THREE.BoxGeometry( 200, 200, 200 ), material6 );
    mesh.position.x = 200;
    mesh.position.y = -200;
    scene.add( mesh );
    meshes.push( mesh );

    mesh = new THREE.Mesh( geometry, material7 );
    mesh.position.x = 600;
    mesh.position.y = -200;
    scene.add( mesh );
    meshes.push( mesh );

    mesh = new THREE.Mesh( geometry, material8 );
    mesh.position.x = 600;
    mesh.position.y = 200;
    scene.add( mesh );
    meshes.push( mesh );

    renderer = new THREE.Canvas3DRenderer(
                   { canvas: canvas, antialias: true, devicePixelRatio: canvas.devicePixelRatio });
    renderer.setPixelRatio( canvas.devicePixelRatio );
    renderer.setSize( canvas.width, canvas.height );

}

function onResizeGL(canvas) {
    if (camera === undefined) return;

    camera.aspect = canvas.width / canvas.height;
    camera.updateProjectionMatrix();

    renderer.setSize( canvas.width, canvas.height );

}

function paintGL(canvas) {
    var time = Date.now() * 0.001;

    for ( var i = 0; i < meshes.length; i ++ ) {

        var mesh = meshes[ i ];
        mesh.rotation.x = time;
        mesh.rotation.y = time;

    }

    renderer.render( scene, camera );
}
