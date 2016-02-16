//@author tiheikka / titta.heikkala@theqtcompany.com

// procedural 3D text by zz85 (http://www.lab4games.net/zz85/blog) & alteredq
// fonts from typeface.js (http://typeface.neocracy.org/)
// and Droid (http://en.wikipedia.org/wiki/Droid_%28font%29)

Qt.include("three.js")
Qt.include("GeometryUtils.js")

THREE.Cache.enabled = true;

var camera, cameraTarget, scene, renderer;

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

    font = undefined,

    fontName = "optimer", // helvetiker, optimer, gentilis, droid sans, droid serif
    fontWeight = "bold"; // normal bold

var mirror = true;

var fontMap = {

    "helvetiker": 0,
    "optimer": 1,
    "gentilis": 2,
    "droid sans": 3,
    "droid serif": 4
};

var weightMap = {

    "regular": 0,
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

function initializeGL(canvas, eventSource) {

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

    material = new THREE.MultiMaterial( [
        new THREE.MeshPhongMaterial( { color: 0xffffff, shading: THREE.FlatShading } ), // front
        new THREE.MeshPhongMaterial( { color: 0xffffff, shading: THREE.SmoothShading } ) // side
    ] );

    group = new THREE.Group();
    group.position.y = 100;

    scene.add( group );

    loadFont();

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
    renderer.setPixelRatio( canvas.devicePixelRatio );
    renderer.setSize( canvas.width, canvas.height );

    renderer.setClearColor( scene.fog.color, 1 );

    eventSource.mouseDown.connect(onDocumentMouseDown);

}

function resizeGL(canvas) {

    camera.aspect = canvas.width / canvas.height;
    camera.updateProjectionMatrix();

    window.innerWidth = canvas.width;
    window.innerHeight = canvas.height;

    renderer.setPixelRatio( canvas.devicePixelRatio );
    renderer.setSize( canvas.width, canvas.height );
}

function loadFont() {

    var loader = new THREE.FontLoader();
    loader.load( 'qrc:/' + fontName + '_' + fontWeight + '.typeface.js', function ( response ) {

        font = response;

        refreshText();

    } );

}

function createText() {

    textGeo = new THREE.TextGeometry( text, {
        font: font,
        size: size,
        height: height,
        curveSegments: curveSegments,

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

    if ( fontName == "helvetiker" ) {

        fontName = "optimer";

    } else if ( fontName == "optimer" ) {

        fontName = "gentilis";

    } else if ( fontName == "gentilis" ) {

        fontName = "droid_sans";

    } else if ( fontName == "droid_sans" ) {

        fontName = "droid_serif";

    } else {

        fontName = "helvetiker";

    }

    loadFont();

}

function changeWeight() {

    if ( fontWeight == "bold" ) {

        fontWeight = "regular";

    } else {

        fontWeight = "bold";
    }

    loadFont();
}

function changeText( newText ) {

    text = newText;

    refreshText();
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

function paintGL(canvas) {

    group.rotation.y += ( targetRotation - group.rotation.y ) * 0.05;

    camera.lookAt( cameraTarget );

    renderer.clear();

    renderer.render( scene, camera );
}
