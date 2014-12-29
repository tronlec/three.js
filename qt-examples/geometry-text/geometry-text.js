//@author tiheikka / titta.heikkala@theqtcompany.com

// procedural 3D text by zz85 (http://www.lab4games.net/zz85/blog) & alteredq
// fonts from typeface.js (http://typeface.neocracy.org/)
// and Droid (http://en.wikipedia.org/wiki/Droid_%28font%29)

Qt.include("three.js")
Qt.include("GeometryUtils.js")

Qt.include("ConvolutionShader.js")
Qt.include("CopyShader.js")
Qt.include("FilmShader.js")
Qt.include("FXAAShader.js")
Qt.include("EffectComposer.js")
Qt.include("RenderPass.js")
Qt.include("ShaderPass.js")
Qt.include("MaskPass.js")
Qt.include("BloomPass.js")
Qt.include("FilmPass.js")

Qt.include("gentilis_bold.typeface.js")
Qt.include("gentilis_regular.typeface.js")
Qt.include("optimer_bold.typeface.js")
Qt.include("optimer_regular.typeface.js")
Qt.include("helvetiker_bold.typeface.js")
Qt.include("helvetiker_regular.typeface.js")
Qt.include("droid_sans_regular.typeface.js")
Qt.include("droid_sans_bold.typeface.js")
Qt.include("droid_serif_regular.typeface.js")
Qt.include("droid_serif_bold.typeface.js")

var camera, cameraTarget, scene, renderer;

var composer;
var effectFXAA;

var group, textMesh1, textMesh2, textGeo, material;

var pointLight;

var text = "three.js",

    height = 20,
    size = 70,
    hover = 30,

    curveSegments = 4,

    bevelThickness = 2,
    bevelSize = 1.5,
    bevelSegments = 3,
    bevelEnabled = true,

    font = "optimer", // helvetiker, optimer, gentilis, droid sans, droid serif
    weight = "bold", // normal bold
    style = "normal"; // normal italic

var mirror = true;

var fontMap = {

    "helvetiker": 0,
    "optimer": 1,
    "gentilis": 2,
    "droid sans": 3,
    "droid serif": 4

};

var weightMap = {

    "normal": 0,
    "bold": 1

};

var targetRotation = 0;
var targetRotationOnMouseDown = 0;

function FakeWindow(awidth, aheight) {
    this.innerWidth = awidth;
    this.innerHeight = aheight;
}

var window = new FakeWindow(0,0);

var mouseX = 0;
var mouseXOnMouseDown = 0;

var postprocessing = { enabled : false };
var glow = 0.9;


function log(message) {
    if (canvas3d.logAllCalls)
        console.log(message)
}

function initGL(canvas, eventSource) {
    log("initGL ENTER...");

    window.innerWidth = canvas.width;
    window.innerHeight = canvas.height;

    // CAMERA

    camera = new THREE.PerspectiveCamera( 30, canvas.width / canvas.height, 1, 1500 );
    camera.position.set( 0, 400, 700 );

    cameraTarget = new THREE.Vector3( 0, 150, 0 );

    // SCENE

    scene = new THREE.Scene();
    scene.fog = new THREE.Fog( 0x000000, 250, 1400 );


    // LIGHTS

    var dirLight = new THREE.DirectionalLight( 0xffffff, 0.125 );
    dirLight.position.set( 0, 0, 1 ).normalize();
    scene.add( dirLight );

    pointLight = new THREE.PointLight( 0xffffff, 1.5 );
    pointLight.position.set( 0, 100, 90 );
    scene.add( pointLight );

    pointLight.color.setHSL( Math.random(), 1, 0.5 );

    material = new THREE.MeshFaceMaterial( [
        new THREE.MeshPhongMaterial( { color: 0xffffff, shading: THREE.FlatShading } ), // front
        new THREE.MeshPhongMaterial( { color: 0xffffff, shading: THREE.SmoothShading } ) // side
    ] );

    group = new THREE.Group();
    group.position.y = 100;

    scene.add( group );

    createText();

    var plane = new THREE.Mesh(
        new THREE.PlaneBufferGeometry( 10000, 10000 ),
        new THREE.MeshBasicMaterial( { color: 0xffffff, opacity: 0.5, transparent: true } )
    );
    plane.position.y = 100;
    plane.rotation.x = - Math.PI / 2;
    scene.add( plane );

    // RENDERER

    renderer = new THREE.Canvas3DRenderer(
                { canvas: canvas, antialias: true, devicePixelRatio: canvas.devicePixelRatio } );
    renderer.setSize( canvas.width, canvas.height );

    renderer.setClearColor( scene.fog.color, 1 );

    // POSTPROCESSING

    renderer.autoClear = false;

    var renderModel = new THREE.RenderPass( scene, camera );
    var effectBloom = new THREE.BloomPass( 0.25 );
    var effectFilm = new THREE.FilmPass( 0.5, 0.125, 2048, false );

    effectFXAA = new THREE.ShaderPass( THREE.FXAAShader );

    var width = canvas.width || 2;
    var height = canvas.height || 2;

    effectFXAA.uniforms[ 'resolution' ].value.set( 1 / width, 1 / height );

    effectFilm.renderToScreen = true;

    composer = new THREE.EffectComposer( renderer );

    composer.addPass( renderModel );
    composer.addPass( effectFXAA );
    composer.addPass( effectBloom );
    composer.addPass( effectFilm );

    //

    eventSource.mouseDown.connect(onDocumentMouseDown);

}

function onCanvasResize(canvas) {
    if (camera === undefined) return;

    camera.aspect = canvas.width / canvas.height;
    camera.updateProjectionMatrix();

    window.innerWidth = canvas.width;
    window.innerHeight = canvas.height;

    renderer.setSize( canvas.width, canvas.height );

    composer.reset();

    effectFXAA.uniforms[ 'resolution' ].value.set( 1 / canvas.width, 1 / canvas.height );

}

function createText() {

    textGeo = new THREE.TextGeometry( text, {

        size: size,
        height: height,
        curveSegments: curveSegments,

        font: font,
        weight: weight,
        style: style,

        bevelThickness: bevelThickness,
        bevelSize: bevelSize,
        bevelEnabled: bevelEnabled,

        material: 0,
        extrudeMaterial: 1

    });

    textGeo.computeBoundingBox();
    textGeo.computeVertexNormals();

    // "fix" side normals by removing z-component of normals for side faces
    // (this doesn't work well for beveled geometry as then we lose nice curvature around z-axis)
    if ( ! bevelEnabled ) {

        var triangleAreaHeuristics = 0.1 * ( height * size );

        for ( var i = 0; i < textGeo.faces.length; i ++ ) {

            var face = textGeo.faces[ i ];

            if ( face.materialIndex == 1 ) {

                for ( var j = 0; j < face.vertexNormals.length; j ++ ) {

                    face.vertexNormals[ j ].z = 0;
                    face.vertexNormals[ j ].normalize();

                }

                var va = textGeo.vertices[ face.a ];
                var vb = textGeo.vertices[ face.b ];
                var vc = textGeo.vertices[ face.c ];

                var s = THREE.GeometryUtils.triangleArea( va, vb, vc );

                if ( s > triangleAreaHeuristics ) {

                    for ( var j = 0; j < face.vertexNormals.length; j ++ ) {

                        face.vertexNormals[ j ].copy( face.normal );

                    }

                }

            }

        }

    }

    var centerOffset = -0.5 * ( textGeo.boundingBox.max.x - textGeo.boundingBox.min.x );

    textMesh1 = new THREE.Mesh( textGeo, material );

    textMesh1.position.x = centerOffset;
    textMesh1.position.y = hover;
    textMesh1.position.z = 0;

    textMesh1.rotation.x = 0;
    textMesh1.rotation.y = Math.PI * 2;

    group.add( textMesh1 );

    if ( mirror ) {

        textMesh2 = new THREE.Mesh( textGeo, material );

        textMesh2.position.x = centerOffset;
        textMesh2.position.y = -hover;
        textMesh2.position.z = height;

        textMesh2.rotation.x = Math.PI;
        textMesh2.rotation.y = Math.PI * 2;

        group.add( textMesh2 );

    }

}

function refreshText() {

    group.remove( textMesh1 );
    if ( mirror ) group.remove( textMesh2 );

    if ( !text ) return;

    createText();

}

function changeColor() {

    pointLight.color.setHSL( Math.random(), 1, 0.5 );

}

function changeFont() {

    if ( font == "helvetiker" ) {

        font = "optimer";

    } else if ( font == "optimer" ) {

        font = "gentilis";

    } else if ( font == "gentilis" ) {

        font = "droid sans";

    } else if ( font == "droid sans" ) {

        font = "droid serif";

    } else {

        font = "helvetiker";

    }

    refreshText();

}

function changeWeight() {

    if ( weight == "bold" ) {

        weight = "normal";

    } else {

        weight = "bold";
    }

    refreshText();
}

function changeBevel() {
    console.log("changeBevel");
    bevelEnabled = !bevelEnabled;

    refreshText();
}

function changePostProcessing() {

    postprocessing.enabled = !postprocessing.enabled;

}

function onDocumentMouseDown( x, y, buttons ) {

    eventSource.mouseMove.connect(onDocumentMouseMove);
    eventSource.mouseUp.connect(onDocumentMouseUp);
    eventSource.mouseOut.connect(onDocumentMouseOut);

    mouseXOnMouseDown = x - window.innerWidth / 2;
    targetRotationOnMouseDown = targetRotation;

}

function onDocumentMouseMove( x, y ) {

    mouseX = x - window.innerWidth / 2;

    targetRotation = targetRotationOnMouseDown + ( mouseX - mouseXOnMouseDown ) * 0.02;

}

function onDocumentMouseUp( x, y ) {

    eventSource.mouseMove.disconnect(onDocumentMouseMove);
    eventSource.mouseUp.disconnect(onDocumentMouseUp);
    eventSource.mouseOut.disconnect(onDocumentMouseOut);

}

function onDocumentMouseOut() {

    eventSource.mouseMove.disconnect(onDocumentMouseMove);
    eventSource.mouseUp.disconnect(onDocumentMouseUp);
    eventSource.mouseOut.disconnect(onDocumentMouseOut);
}

function renderGL(canvas) {
    log("renderGL ENTER...");

    group.rotation.y += ( targetRotation - group.rotation.y ) * 0.05;

    camera.lookAt( cameraTarget );

    renderer.clear();

    if ( postprocessing.enabled ) {

        composer.render( 0.05 );

    } else {

        renderer.render( scene, camera );

    }


    log("renderGL EXIT...");
}
