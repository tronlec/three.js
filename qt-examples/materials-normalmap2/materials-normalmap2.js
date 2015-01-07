//@author pasikeranen / pasi.keranen@theqtcompany.com

Qt.include("three.js")
Qt.include("js/shaders/BleachBypassShader.js")
Qt.include("js/shaders/ColorCorrectionShader.js")
Qt.include("js/shaders/CopyShader.js")
Qt.include("js/shaders/FXAAShader.js")
Qt.include("js/postprocessing/EffectComposer.js")
Qt.include("js/postprocessing/RenderPass.js")
Qt.include("js/postprocessing/ShaderPass.js")
Qt.include("js/postprocessing/MaskPass.js")

var loader;

var camera, scene, renderer;

var mesh, zmesh, lightMesh, geometry;
var mesh1;

var directionalLight, pointLight, ambientLight;

var mouseX = 0;
var mouseY = 0;

var windowHalfX = 0.5;
var windowHalfY = 0.5;

var composer, effectFXAA;

function WindowType() {
    this.innerWidth = 0;
    this.innerHeight = 0;
}

var window = new WindowType();

function initGL(canvas, eventSrc) {

    windowHalfX = canvas.width / 2;
    windowHalfY = canvas.height / 2;
    window.innerWidth = canvas.width;
    window.innerHeight = canvas.height;

    camera = new THREE.PerspectiveCamera( 27, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.z = 1200;

    scene = new THREE.Scene();

    // LIGHTS

    ambientLight = new THREE.AmbientLight( 0x444444 );
    scene.add( ambientLight );

    pointLight = new THREE.PointLight( 0xffffff, 1.25, 1000 );
    pointLight.position.set( 0, 0, 600 );

    scene.add( pointLight );

    directionalLight = new THREE.DirectionalLight( 0xffffff );
    directionalLight.position.set( 1, -0.5, -1 );
    scene.add( directionalLight );

    // material parameters

    var ambient = 0x111111, diffuse = 0xbbbbbb, specular = 0x060606, shininess = 35;

    var shader = THREE.ShaderLib[ "normalmap" ];
    var uniforms = THREE.UniformsUtils.clone( shader.uniforms );

    uniforms[ "tNormal" ].value = THREE.ImageUtils.loadTexture( "obj/leeperrysmith/Infinite-Level_02_Tangent_SmoothUV.jpg" );
    uniforms[ "uNormalScale" ].value.set( 0.8, 0.8 );

    uniforms[ "tDiffuse" ].value = THREE.ImageUtils.loadTexture( "obj/leeperrysmith/Map-COL.jpg" );
    uniforms[ "tSpecular" ].value = THREE.ImageUtils.loadTexture( "obj/leeperrysmith/Map-SPEC.jpg" );

    uniforms[ "enableAO" ].value = false;
    uniforms[ "enableDiffuse" ].value = true;
    uniforms[ "enableSpecular" ].value = true;

    uniforms[ "diffuse" ].value.setHex( diffuse );
    uniforms[ "specular" ].value.setHex( specular );
    uniforms[ "ambient" ].value.setHex( ambient );

    uniforms[ "shininess" ].value = shininess;

    uniforms[ "wrapRGB" ].value.set( 0.575, 0.5, 0.5 );

    var parameters = { fragmentShader: shader.fragmentShader, vertexShader: shader.vertexShader, uniforms: uniforms, lights: true };
    var material = new THREE.ShaderMaterial( parameters );

    material.wrapAround = true;

    loader = new THREE.JSONLoader( true );
    loader.load( "obj/leeperrysmith/LeePerrySmith.js", function( geometry ) { createScene( geometry, 100, material ) } );

    renderer = new THREE.Canvas3DRenderer(
                { canvas: canvas, antialias: false, devicePixelRatio: canvas.devicePixelRatio });
    renderer.setClearColor( 0x111111, 1 );
    renderer.setSize( canvas.width, canvas.height );

    //

    renderer.gammaInput = true;
    renderer.gammaOutput = true;


    // COMPOSER

    renderer.autoClear = false;

    var renderModel = new THREE.RenderPass( scene, camera );

    var effectBleach = new THREE.ShaderPass( THREE.BleachBypassShader );
    var effectColor = new THREE.ShaderPass( THREE.ColorCorrectionShader );
    effectFXAA = new THREE.ShaderPass( THREE.FXAAShader );

    effectFXAA.uniforms[ 'resolution' ].value.set( 1 / canvas.width, 1 / canvas.height );

    effectBleach.uniforms[ 'opacity' ].value = 0.4;

    effectColor.uniforms[ 'powRGB' ].value.set( 1.4, 1.45, 1.45 );
    effectColor.uniforms[ 'mulRGB' ].value.set( 1.1, 1.1, 1.1 );

    effectFXAA.renderToScreen = true;

    composer = new THREE.EffectComposer( renderer );

    composer.addPass( renderModel );

    composer.addPass( effectBleach );
    composer.addPass( effectColor );
    composer.addPass( effectFXAA );

    // EVENTS

    eventSrc.addEventListener( 'mousemove', onDocumentMouseMove, false );

}

function createScene( geometry, scale, material ) {

    geometry.computeTangents();

    mesh1 = new THREE.Mesh( geometry, material );

    mesh1.position.y = - 50;
    mesh1.scale.x = mesh1.scale.y = mesh1.scale.z = scale;

    scene.add( mesh1 );

}

function onCanvasResize(canvas) {
    window.innerWidth = canvas.width;
    window.innerHeight = canvas.height;

    if (camera === undefined) return;

    renderer.setSize( canvas.width, canvas.height );

    camera.aspect = canvas.width / canvas.height;
    camera.updateProjectionMatrix();

    composer.reset();

    effectFXAA.uniforms[ 'resolution' ].value.set( 1 / canvas.width, 1 / canvas.height );
}


function onDocumentMouseMove(x, y) {

    mouseX = ( x - windowHalfX ) * 10;
    mouseY = ( y - windowHalfY ) * 10;

}

function renderGL(canvas) {

    var ry = mouseX * 0.0003, rx = mouseY * 0.0003;

    if( mesh1 ) {

        mesh1.rotation.y = ry;
        mesh1.rotation.x = rx;

    }

    //renderer.render( scene, camera );
    composer.render();

}
