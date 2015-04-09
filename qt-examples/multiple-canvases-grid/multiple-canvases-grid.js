//@author tiheikka / titta.heikkala@theqtcompany.com

Qt.include("three.js")

var camera, gridCanvas, scene, renderer;

var mesh, group1, group2, group3, light;

var mouseX = 0, mouseY = 0;


function log(message) {
    console.log(message)
}

function initGL(canvas, eventSource, fullWidth, fullHeight, viewX, viewY, viewWidth, viewHeight) {
    log("initGL ENTER...");

    gridCanvas = canvas;

    camera = new THREE.PerspectiveCamera( 20, canvas.width / canvas.height, 1, 10000 );
    camera.setViewOffset( fullWidth, fullHeight, viewX, viewY, viewWidth, viewHeight );
    camera.position.z = 1800;

    scene = new THREE.Scene();

    light = new THREE.DirectionalLight( 0xffffff );
    light.position.set( 0, 0, 1 ).normalize();
    scene.add( light );

    var faceIndices = [ 'a', 'b', 'c', 'd' ];

    var color, f1, f2, f3, p, n, vertexIndex,

        radius = 200,

        geometry1 = new THREE.IcosahedronGeometry( radius, 1 ),
        geometry2 = new THREE.IcosahedronGeometry( radius, 1 ),
        geometry3 = new THREE.IcosahedronGeometry( radius, 1 );

    for ( var i = 0; i < geometry1.faces.length; i ++ ) {

        f1 = geometry1.faces[ i ];
        f2 = geometry2.faces[ i ];
        f3 = geometry3.faces[ i ];

        n = ( f1 instanceof THREE.Face3 ) ? 3 : 4;

        for( var j = 0; j < n; j ++ ) {

            vertexIndex = f1[ faceIndices[ j ] ];

            p = geometry1.vertices[ vertexIndex ];

            color = new THREE.Color( 0xffffff );
            color.setHSL( ( p.y / radius + 1 ) / 2, 1.0, 0.5 );

            f1.vertexColors[ j ] = color;

            color = new THREE.Color( 0xffffff );
            color.setHSL( 0.0, ( p.y / radius + 1 ) / 2, 0.5 );

            f2.vertexColors[ j ] = color;

            color = new THREE.Color( 0xffffff );
            color.setHSL( 0.125 * vertexIndex / geometry1.vertices.length, 1.0, 0.5 );

            f3.vertexColors[ j ] = color;

        }

    }

    var materials = [

        new THREE.MeshLambertMaterial( { color: 0xffffff, shading: THREE.FlatShading, vertexColors: THREE.VertexColors } ),
        new THREE.MeshBasicMaterial( { color: 0x000000, shading: THREE.FlatShading, wireframe: true, transparent: true } )

    ];

    group1 = THREE.SceneUtils.createMultiMaterialObject( geometry1, materials );
    group1.position.x = -400;
    group1.rotation.x = -1.87;
    scene.add( group1 );

    group2 = THREE.SceneUtils.createMultiMaterialObject( geometry2, materials );
    group2.position.x = 400;
    group2.rotation.x = 0;
    scene.add( group2 );

    group3 = THREE.SceneUtils.createMultiMaterialObject( geometry3, materials );
    group3.position.x = 0;
    group3.rotation.x = 0;
    scene.add( group3 );

    renderer = new THREE.Canvas3DRenderer(
                { canvas: canvas, antialias: true, devicePixelRatio: canvas.devicePixelRatio });
    renderer.setClearColor( 0xffffff  );
    renderer.setSize( canvas.width, canvas.height );

    eventSource.mouseMove.connect(onDocumentMouseMove);

}

function onCanvasResize(canvas) {
    if (camera === undefined) return;

    camera.aspect = canvas.width / canvas.height;
    camera.updateProjectionMatrix();

    renderer.setSize( canvas.width, canvas.height );

}

function onDocumentMouseMove( x, y ) {

    mouseX = x - gridCanvas.width / 2;
    mouseY = y - gridCanvas.height / 2;

}

function renderGL(canvas) {
    log("renderGL ENTER...");

    camera.position.x += ( mouseX - camera.position.x ) * 0.05;
    camera.position.z += ( - mouseY - camera.position.y ) * 0.05;

    camera.lookAt( scene.position );

    renderer.render( scene, camera );

    log("renderGL EXIT...");
}
