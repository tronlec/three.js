//@author miheikki / miikka.heikkinen@theqtcompany.com

Qt.include("three.js")

//
// Draws a cube that has a Qt Quick item as decal texture on each face.
//

var camera, scene, renderer;
var mesh;

var canvasTextureProvider = null;

function initializeGL(canvas, textureSource) {

    camera = new THREE.PerspectiveCamera( 45, canvas.width / canvas.height, 1, 1000 );
    camera.position.z = 0;

    scene = new THREE.Scene();

    var geometry = new THREE.BoxGeometry( 2, 2, 2 );

    var texture = new THREE.QtQuickItemTexture( textureSource );
    texture.repeat = new THREE.Vector2( 2, 2 );
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;

    var material = new THREE.MeshBasicMaterial( { map: texture } );

    mesh = new THREE.Mesh( geometry, material );
    scene.add( mesh );

    renderer = new THREE.Canvas3DRenderer(
                { canvas: canvas, antialias: true, devicePixelRatio: canvas.devicePixelRatio,
                  alpha: true});
    renderer.setSize( canvas.width, canvas.height );
}

function resizeGL(canvas)
{
    camera.aspect = canvas.width / canvas.height;
    camera.updateProjectionMatrix();

    renderer.setPixelRatio(canvas.devicePixelRatio);
    renderer.setSize( canvas.width, canvas.height );
}

function degToRad(degrees) {
    return degrees * Math.PI / 180;
}

function paintGL(canvas) {
    mesh.rotation.x = degToRad(canvas.xRotAnim);
    mesh.rotation.y = degToRad(canvas.yRotAnim);
    mesh.rotation.z = degToRad(canvas.zRotAnim);
    mesh.position.x = (canvas.yRotAnim - 120.0) / 120.0;
    mesh.position.y = (canvas.xRotAnim -  60.0) / 50.0;
    mesh.position.z = -7.0;

    renderer.render( scene, camera );
}
