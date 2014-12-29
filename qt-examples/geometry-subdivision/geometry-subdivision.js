//@author tiheikka / titta.heikkala@theqtcompany.com

Qt.include("three.js")
Qt.include("OrbitControls.js")
Qt.include("SubdivisionModifier.js")

var container, stats;
var camera, controls, scene, renderer;

var cube, plane;

var geometry;

// Create new object by parameters

var createSomething = function( klass, args ) {

    var F = function( klass, args ) {

        klass.apply( this, args );
        return this;

    }

    F.prototype = klass.prototype;
    return new F( klass, args );

};

// Cube

var materials = [];


var geometriesParams = [

    { type: 'BoxGeometry', args: [ 200, 200, 200, 2, 2, 2, materials ] },
    { type: 'TorusGeometry', args: [ 100, 60, 4, 8, Math.PI*2 ] },
    { type: 'TorusKnotGeometry', args: [  ], scale:0.25, meshScale:4 },
    { type: 'SphereGeometry', args: [ 100, 3, 3 ], meshScale:2 },
    { type: 'IcosahedronGeometry', args: [ 100, 1 ], meshScale:2 },
    { type: 'CylinderGeometry', args: [ 25, 75, 200, 8, 3 ]} ,
    { type: 'OctahedronGeometry', args: [200, 0], meshScale:2 },
    { type: 'LatheGeometry', args: [ [
        new THREE.Vector3(0,0,0),
        new THREE.Vector3(0,50,50),
        new THREE.Vector3(0,10,100),
        new THREE.Vector3(0,50,150),
        new THREE.Vector3(0,0,200) ] ]},
    { type: 'TextGeometry', args: ['&', {
                            size: 200,
                            height: 50,
                            curveSegments: 1,
                            font: "helvetiker"

                        }]},
    { type: 'PlaneGeometry', args: [ 200, 200, 4, 4 ] }

];


var info;
var subdivisions = 2;
var geometryIndex = 0;


function log(message) {
    if (canvas3d.logAllCalls)
        console.log(message)
}

function nextSubdivision( x ) {

    subdivisions = Math.max( 0, subdivisions + x );
    addStuff();

}

function nextGeometry() {

    geometryIndex ++;

    if ( geometryIndex > geometriesParams.length - 1 ) {

        geometryIndex = 0;

    }

    addStuff();

}

function switchGeometry(i) {

    geometryIndex = i;

    addStuff();
}

function updateInfo() {

    // do this in QML?

}

function addStuff() {

    if ( cube ) {

        scene.remove( group );
        scene.remove( cube );

    }


    var modifier = new THREE.SubdivisionModifier( subdivisions );


    var params = geometriesParams[ geometryIndex ];
    geometry = createSomething( THREE[ params.type ], params.args );

    // Scale Geometry

    if ( params.scale ) {

        geometry.applyMatrix( new THREE.Matrix4().makeScale( params.scale, params.scale, params.scale ) );

    }

    // Cloning original geometry for debuging

    var smooth = geometry.clone();

    // mergeVertices(); is run in case of duplicated vertices
    smooth.mergeVertices();
    smooth.computeFaceNormals();
    smooth.computeVertexNormals();

    modifier.modify( smooth );

    updateInfo();

    var faceABCD = "abcd";
    var color, f, p, n, vertexIndex;

    for ( var i = 0; i < smooth.faces.length; i ++ ) {

        f  = smooth.faces[ i ];


        n = ( f instanceof THREE.Face3 ) ? 3 : 4;

        for( var j = 0; j < n; j++ ) {

            vertexIndex = f[ faceABCD.charAt( j ) ];

            p = smooth.vertices[ vertexIndex ];

            color = new THREE.Color( 0xffffff );
            color.setHSL( ( p.y ) / 200 + 0.5, 1.0, 0.5 );

            f.vertexColors[ j ] = color;

        }

    }

    var group = new THREE.Group();
    scene.add( group );

    var material = new THREE.MeshBasicMaterial( { color: 0xfefefe, wireframe: true, opacity: 0.5 } );
    var mesh = new THREE.Mesh( geometry, material )
    group.add( mesh );

    var meshmaterials = [
        new THREE.MeshLambertMaterial( { color: 0xffffff, shading: THREE.FlatShading, vertexColors: THREE.VertexColors } ),
        new THREE.MeshBasicMaterial( { color: 0x405040, wireframe: true, opacity: 0.8, transparent: true } )
    ];

    cube = THREE.SceneUtils.createMultiMaterialObject( smooth, meshmaterials );

    var meshScale =  params.meshScale ? params.meshScale : 1;

    cube.scale.x = meshScale;
    cube.scale.y = meshScale;
    cube.scale.z = meshScale;

    scene.add( cube );

    group.scale.copy( cube.scale );

}

function initGL(canvas, eventSource) {
    log("initGL ENTER...");

    var loader = new THREE.JSONLoader();
    loader.load( 'obj/WaltHeadLo.js', function ( geometry ) {

        geometriesParams.push({type: 'WaltHead', args: [ ], meshScale: 6 });

        THREE.WaltHead = function() {
            return geometry.clone();
        };

        updateInfo()

    });

    var loader2 = new THREE.JSONLoader();
    loader2.load( 'obj/Suzanne.js', function ( geometry ) {

        geometriesParams.push({type: 'Suzanne', args: [ ], scale: 100, meshScale:2 });

        THREE.Suzanne = function() {
            return geometry.clone();
        };

        updateInfo()

    } );

    for ( var i = 0; i < 6; i ++ ) {

        materials.push( [ new THREE.MeshBasicMaterial( { color: Math.random() * 0xffffff, wireframe: false } ) ] );

    }


    camera = new THREE.PerspectiveCamera( 70, canvas.width / canvas.height, 1, 10000 );
    camera.position.z = 500;

    scene = new THREE.Scene();

    scene.add( camera );

    var light = new THREE.PointLight( 0xffffff, 1.5 );
    light.position.set( 1000, 1000, 2000 );
    scene.add( light );

    addStuff();

    renderer = new THREE.Canvas3DRenderer(
                { canvas: canvas, antialias: true, devicePixelRatio: canvas.devicePixelRatio });
    renderer.setSize( canvas.width, canvas.height );

    controls = new THREE.OrbitControls( camera, eventSource );

}


function onCanvasResize(canvas) {

    if (camera === undefined) return;

    camera.aspect = canvas.width / canvas.height;
    camera.updateProjectionMatrix();

    renderer.setSize( canvas.width, canvas.height );

}

function renderGL(canvas) {

    log("renderGL ENTER...");

    controls.update();

    render();

    log("renderGL EXIT...");

}

function render() {

    renderer.render( scene, camera );

}
