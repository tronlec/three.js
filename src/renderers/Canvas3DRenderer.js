/**
 * @author supereggbert / http://www.paulbrunt.co.uk/
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 * @author szimek / https://github.com/szimek/
 */
var p_uniforms;
var m_uniforms;

var PROGRAM_UNIFORMS = 0;
var PROGRAM_ATTRIBUTES  = 1;
var PROGRAM_ID  = 2;

var BUFFER_BELONGS_TO_ATTRIBUTE = 0;

var debug_renderer = true;
var renderer_name = "THREE.Canvas3DRenderer";

THREE.Canvas3DRenderer = function ( parameters ) {

    console.log( 'THREE.Canvas3DRenderer', THREE.REVISION );

	parameters = parameters || {};

    if (parameters.canvas === undefined) {
        console.warn("parameter.canvas must be set when using THREE.Canvas3DRenderer");
        return;
    }

    if (parameters.context === undefined) {
        console.warn("parameter.context must be set when using THREE.Canvas3DRenderer");
        return;
    }

    var _canvas = parameters.canvas,
    _context = parameters.context,
    _precision = parameters.precision !== undefined ? parameters.precision : 'highp',

	_buffers = {},

	_alpha = parameters.alpha !== undefined ? parameters.alpha : false,
	_premultipliedAlpha = parameters.premultipliedAlpha !== undefined ? parameters.premultipliedAlpha : true,
	_antialias = parameters.antialias !== undefined ? parameters.antialias : false,
	_stencil = parameters.stencil !== undefined ? parameters.stencil : true,
	_preserveDrawingBuffer = parameters.preserveDrawingBuffer !== undefined ? parameters.preserveDrawingBuffer : false,

	_clearColor = new THREE.Color( 0x000000 ),
	_clearAlpha = 0;

	// public properties

	this.domElement = _canvas;
	this.context = null;
	this.devicePixelRatio = parameters.devicePixelRatio !== undefined
				? parameters.devicePixelRatio
				: self.devicePixelRatio !== undefined
					? self.devicePixelRatio
					: 1;

	// clearing

	this.autoClear = true;
	this.autoClearColor = true;
	this.autoClearDepth = true;
    this.autoClearStencil = _stencil;

	// scene graph

	this.sortObjects = true;
	this.autoUpdateObjects = true;

	// physically based shading

	this.gammaInput = false;
	this.gammaOutput = false;

	// shadow map

	this.shadowMapEnabled = false;
	this.shadowMapAutoUpdate = true;
	this.shadowMapType = THREE.PCFShadowMap;
	this.shadowMapCullFace = THREE.CullFaceFront;
	this.shadowMapDebug = false;
	this.shadowMapCascade = false;

	// morphs

	this.maxMorphTargets = 8;
	this.maxMorphNormals = 4;

	// flags

	this.autoScaleCubemaps = true;

	// custom render plugins

	this.renderPluginsPre = [];
	this.renderPluginsPost = [];

	// info

	this.info = {

		memory: {

			programs: 0,
			geometries: 0,
			textures: 0

		},

		render: {

			calls: 0,
			vertices: 0,
			faces: 0,
			points: 0

		}

	};

	// internal properties
    var _this,
    _programs,
    _programs_counter,
    // internal state cache
    _currentProgram,
    _currentFramebuffer,
    _currentMaterialId,
    _currentGeometryGroupHash,
    _currentCamera,
    _usedTextureUnits,
    // GL state cache
    _oldDoubleSided,
    _oldFlipSided,
    _oldBlending,
    _oldBlendEquation,
    _oldBlendSrc,
    _oldBlendDst,
    _oldDepthTest,
    _oldDepthWrite,
    _oldPolygonOffset,
    _oldPolygonOffsetFactor,
    _oldPolygonOffsetUnits,
    _oldLineWidth,
    _viewportX,
    _viewportY,
    _viewportWidth,
    _viewportHeight,
    _currentWidth,
    _currentHeight,
    _enabledAttributes,
    // frustum
    _frustum,
     // camera matrices cache
    _projScreenMatrix,
    _projScreenMatrixPS,
    _vector3,
    // light arrays cache
    _direction,
    _lightsNeedUpdate,
    _lights;

    _this = this;
    _programs = [];
    _programs_counter = 0;
	// internal state cache
    _currentProgram = null;
    _currentFramebuffer = null;
    _currentMaterialId = -1;
    _currentGeometryGroupHash = null;
    _currentCamera = null;
    _usedTextureUnits = 0;
	// GL state cache
    _oldDoubleSided = -1;
    _oldFlipSided = -1;
    _oldBlending = -1;
    _oldBlendEquation = -1;
    _oldBlendSrc = -1;
    _oldBlendDst = -1;
    _oldDepthTest = -1;
    _oldDepthWrite = -1;
    _oldPolygonOffset = null;
    _oldPolygonOffsetFactor = null;
    _oldPolygonOffsetUnits = null;
    _oldLineWidth = null;
    _viewportX = 0;
    _viewportY = 0;
    _viewportWidth = _canvas.width;
    _viewportHeight = _canvas.height;
    _currentWidth = 0;
    _currentHeight = 0;
    _enabledAttributes = [];
    for (var aidx = 0; aidx < 16; aidx++) {
        _enabledAttributes[aidx] = 0;
    }

	// frustum
    _frustum = new THREE.Frustum();
	 // camera matrices cache
    _projScreenMatrix = new THREE.Matrix4();
    _projScreenMatrixPS = new THREE.Matrix4();
    _vector3 = new THREE.Vector3();
	// light arrays cache
    _direction = new THREE.Vector3();
    _lightsNeedUpdate = true;
	_lights = {
		ambient: [ 0, 0, 0 ],
		directional: { length: 0, colors: new Array(), positions: new Array() },
		point: { length: 0, colors: new Array(), positions: new Array(), distances: new Array() },
		spot: { length: 0, colors: new Array(), positions: new Array(), distances: new Array(), directions: new Array(), anglesCos: new Array(), exponents: new Array() },
		hemi: { length: 0, skyColors: new Array(), groundColors: new Array(), positions: new Array() }
	};

	// initialize
	var _gl;
	var _glExtensionTextureFloat;
	var _glExtensionTextureFloatLinear;
	var _glExtensionStandardDerivatives;
	var _glExtensionTextureFilterAnisotropic;
	var _glExtensionCompressedTextureS3TC;

	initGL();

	setDefaultGLState();

	this.context = _gl;

	// GPU capabilities

    var _maxTextures = _gl.getParameter( Context3D.MAX_TEXTURE_IMAGE_UNITS );
    var _maxVertexTextures = _gl.getParameter( Context3D.MAX_VERTEX_TEXTURE_IMAGE_UNITS );
    var _maxTextureSize = _gl.getParameter( Context3D.MAX_TEXTURE_SIZE );
    var _maxCubemapSize = _gl.getParameter( Context3D.MAX_CUBE_MAP_TEXTURE_SIZE );

	var _maxAnisotropy = _glExtensionTextureFilterAnisotropic ? _gl.getParameter( _glExtensionTextureFilterAnisotropic.MAX_TEXTURE_MAX_ANISOTROPY_EXT ) : 0;

	var _supportsVertexTextures = ( _maxVertexTextures > 0 );
	var _supportsBoneTextures = _supportsVertexTextures && _glExtensionTextureFloat;

    var _compressedTextureFormats = _glExtensionCompressedTextureS3TC ? _gl.getParameter( Context3D.COMPRESSED_TEXTURE_FORMATS ) : [];

	//

    var _vertexShaderPrecisionHighpFloat = _gl.getShaderPrecisionFormat( Context3D.VERTEX_SHADER, Context3D.HIGH_FLOAT );
    var _vertexShaderPrecisionMediumpFloat = _gl.getShaderPrecisionFormat( Context3D.VERTEX_SHADER, Context3D.MEDIUM_FLOAT );
    var _vertexShaderPrecisionLowpFloat = _gl.getShaderPrecisionFormat( Context3D.VERTEX_SHADER, Context3D.LOW_FLOAT );

    var _fragmentShaderPrecisionHighpFloat = _gl.getShaderPrecisionFormat( Context3D.FRAGMENT_SHADER, Context3D.HIGH_FLOAT );
    var _fragmentShaderPrecisionMediumpFloat = _gl.getShaderPrecisionFormat( Context3D.FRAGMENT_SHADER, Context3D.MEDIUM_FLOAT );
    var _fragmentShaderPrecisionLowpFloat = _gl.getShaderPrecisionFormat( Context3D.FRAGMENT_SHADER, Context3D.LOW_FLOAT );

    var _vertexShaderPrecisionHighpInt = _gl.getShaderPrecisionFormat( Context3D.VERTEX_SHADER, Context3D.HIGH_INT );
    var _vertexShaderPrecisionMediumpInt = _gl.getShaderPrecisionFormat( Context3D.VERTEX_SHADER, Context3D.MEDIUM_INT );
    var _vertexShaderPrecisionLowpInt = _gl.getShaderPrecisionFormat( Context3D.VERTEX_SHADER, Context3D.LOW_INT );

    var _fragmentShaderPrecisionHighpInt = _gl.getShaderPrecisionFormat( Context3D.FRAGMENT_SHADER, Context3D.HIGH_INT );
    var _fragmentShaderPrecisionMediumpInt = _gl.getShaderPrecisionFormat( Context3D.FRAGMENT_SHADER, Context3D.MEDIUM_INT );
    var _fragmentShaderPrecisionLowpInt = _gl.getShaderPrecisionFormat( Context3D.FRAGMENT_SHADER, Context3D.LOW_INT );

	// clamp precision to maximum available

	var highpAvailable = _vertexShaderPrecisionHighpFloat.precision > 0 && _fragmentShaderPrecisionHighpFloat.precision > 0;
	var mediumpAvailable = _vertexShaderPrecisionMediumpFloat.precision > 0 && _fragmentShaderPrecisionMediumpFloat.precision > 0;

	if ( _precision === "highp" && ! highpAvailable ) {

		if ( mediumpAvailable ) {

			_precision = "mediump";
            console.warn( "Canvas3DRenderer: highp not supported, using mediump" );

		} else {

			_precision = "lowp";
            console.warn( "Canvas3DRenderer: highp and mediump not supported, using lowp" );

		}

	}

	if ( _precision === "mediump" && ! mediumpAvailable ) {

		_precision = "lowp";
        console.warn( "Canvas3DRenderer: mediump not supported, using lowp" );

	}

	// API

	this.getContext = function () {

		return _gl;

	};

	this.supportsVertexTextures = function () {

		return _supportsVertexTextures;

	};

	this.supportsFloatTextures = function () {

		return _glExtensionTextureFloat;

	};

	this.supportsStandardDerivatives = function () {

		return _glExtensionStandardDerivatives;

	};

	this.supportsCompressedTextureS3TC = function () {

		return _glExtensionCompressedTextureS3TC;

	};

	this.getMaxAnisotropy  = function () {

		return _maxAnisotropy;

	};

	this.getPrecision = function () {

		return _precision;

	};

	this.setSize = function ( width, height, updateStyle ) {

		this.setViewport( 0, 0, width, height );

	};

	this.setViewport = function ( x, y, width, height ) {

		_viewportX = x * this.devicePixelRatio;
		_viewportY = y * this.devicePixelRatio;

		_viewportWidth = width * this.devicePixelRatio;
		_viewportHeight = height * this.devicePixelRatio;

		_gl.viewport( _viewportX, _viewportY, _viewportWidth, _viewportHeight );

	};

	this.setScissor = function ( x, y, width, height ) {

		_gl.scissor(
			x * this.devicePixelRatio,
			y * this.devicePixelRatio,
			width * this.devicePixelRatio,
			height * this.devicePixelRatio
		);

	};

	this.enableScissorTest = function ( enable ) {

        enable ? _gl.enable( Context3D.SCISSOR_TEST ) : _gl.disable( Context3D.SCISSOR_TEST );

	};

	// Clearing

	this.setClearColor = function ( color, alpha ) {

		_clearColor.set( color );
		_clearAlpha = alpha !== undefined ? alpha : 1;

		_gl.clearColor( _clearColor.r, _clearColor.g, _clearColor.b, _clearAlpha );

	};

	this.setClearColorHex = function ( hex, alpha ) {

		console.warn( 'DEPRECATED: .setClearColorHex() is being removed. Use .setClearColor() instead.' );
		this.setClearColor( hex, alpha );

	};

	this.getClearColor = function () {

		return _clearColor;

	};

	this.getClearAlpha = function () {

		return _clearAlpha;

	};

	this.clear = function ( color, depth, stencil ) {

		var bits = 0;

        if ( color !== undefined && color ) bits |= Context3D.COLOR_BUFFER_BIT;
        if ( depth !== undefined && depth ) bits |= Context3D.DEPTH_BUFFER_BIT;
        if ( stencil !== undefined && stencil ) bits |= Context3D.STENCIL_BUFFER_BIT;

		_gl.clear( bits );

	};

	this.clearColor = function () {

        _gl.clear( Context3D.COLOR_BUFFER_BIT );

	};

	this.clearDepth = function () {

        _gl.clear( Context3D.DEPTH_BUFFER_BIT );

	};

	this.clearStencil = function () {

        _gl.clear( Context3D.STENCIL_BUFFER_BIT );

	};

	this.clearTarget = function ( renderTarget, color, depth, stencil ) {

		this.setRenderTarget( renderTarget );
		this.clear( color, depth, stencil );

	};

	// Plugins

	this.addPostPlugin = function ( plugin ) {

		plugin.init( this );
		this.renderPluginsPost.push( plugin );

	};

	this.addPrePlugin = function ( plugin ) {

		plugin.init( this );
		this.renderPluginsPre.push( plugin );

	};

	// Rendering

	this.updateShadowMap = function ( scene, camera ) {
        if (debug_renderer) console.log(renderer_name+".updateShadowMap()");

		_currentProgram = null;
		_oldBlending = -1;
		_oldDepthTest = -1;
		_oldDepthWrite = -1;
		_currentGeometryGroupHash = -1;
		_currentMaterialId = -1;
		_lightsNeedUpdate = true;
		_oldDoubleSided = -1;
		_oldFlipSided = -1;

		this.shadowMapPlugin.update( scene, camera );

	};

	// Internal functions

	// Buffer allocation

	function createParticleBuffers ( geometry ) {
        if (debug_renderer) console.log(renderer_name+".createParticleBuffers()");

		geometry.__webglVertexBuffer = _gl.createBuffer();
        geometry.__webglVertexBuffer.name = "Particle__webglVertexBuffer";
		geometry.__webglColorBuffer = _gl.createBuffer();
        geometry.__webglColorBuffer.name = "Particle__webglColorBuffer";

		_this.info.memory.geometries ++;

	};

	function createLineBuffers ( geometry ) {
        if (debug_renderer) console.log(renderer_name+"createLineBuffers()");

		geometry.__webglVertexBuffer = _gl.createBuffer();
        geometry.__webglVertexBuffer.name = "Line__webglVertexBuffer";
        geometry.__webglColorBuffer = _gl.createBuffer();
        geometry.__webglColorBuffer.name = "Line__webglColorBuffer";
        geometry.__webglLineDistanceBuffer = _gl.createBuffer();
        geometry.__webglLineDistanceBuffer.name = "Line__webglLineDistanceBuffer";

		_this.info.memory.geometries ++;

	};

	function createMeshBuffers ( geometryGroup ) {
        if (debug_renderer) console.log(renderer_name+"createMeshBuffers()");

        geometryGroup.__webglVertexBuffer = _gl.createBuffer();
        geometryGroup.__webglVertexBuffer.name = "Mesh__webglVertexBuffer";
        geometryGroup.__webglNormalBuffer = _gl.createBuffer();
        geometryGroup.__webglNormalBuffer.name = "Mesh__webglNormalBuffer";
        geometryGroup.__webglTangentBuffer = _gl.createBuffer();
        geometryGroup.__webglTangentBuffer.name = "Mesh__webglTangentBuffer";
        geometryGroup.__webglColorBuffer = _gl.createBuffer();
        geometryGroup.__webglColorBuffer.name = "Mesh__webglColorBuffer";
        geometryGroup.__webglUVBuffer = _gl.createBuffer();
        geometryGroup.__webglUVBuffer.name = "Mesh__webglUVBuffer";
        geometryGroup.__webglUV2Buffer = _gl.createBuffer();
        geometryGroup.__webglUV2Buffer.name = "Mesh__webglUV2Buffer";

		geometryGroup.__webglSkinIndicesBuffer = _gl.createBuffer();
        geometryGroup.__webglSkinIndicesBuffer.name = "Mesh__webglSkinIndicesBuffer";
        geometryGroup.__webglSkinWeightsBuffer = _gl.createBuffer();
        geometryGroup.__webglSkinWeightsBuffer.name = "Mesh__webglSkinWeightsBuffer";

		geometryGroup.__webglFaceBuffer = _gl.createBuffer();
        geometryGroup.__webglFaceBuffer.name = "Mesh__webglFaceBuffer";
        geometryGroup.__webglLineBuffer = _gl.createBuffer();
        geometryGroup.__webglLineBuffer.name = "Mesh__webglLineBuffer";

		var m, ml;

		if ( geometryGroup.numMorphTargets ) {

			geometryGroup.__webglMorphTargetsBuffers = [];

			for ( m = 0, ml = geometryGroup.numMorphTargets; m < ml; m ++ ) {
                var buf =  _gl.createBuffer();
                buf.name = "Mesh__MorphTarget_"+m;
                geometryGroup.__webglMorphTargetsBuffers.push(buf);

			}

		}

		if ( geometryGroup.numMorphNormals ) {

			geometryGroup.__webglMorphNormalsBuffers = [];

			for ( m = 0, ml = geometryGroup.numMorphNormals; m < ml; m ++ ) {
                var nbuf =  _gl.createBuffer();
                nbuf.name = "Mesh__MorphNormal_"+m;
                geometryGroup.__webglMorphNormalsBuffers.push( nbuf );

			}

		}

		_this.info.memory.geometries ++;

	};

	// Events

	var onGeometryDispose = function ( event ) {
        if (debug_renderer) console.log(renderer_name+".onGeometryDispose()");

		var geometry = event.target;

		geometry.removeEventListener( 'dispose', onGeometryDispose );

		deallocateGeometry( geometry );

	};

	var onTextureDispose = function ( event ) {
        if (debug_renderer) console.log(renderer_name+".onTextureDispose()");

		var texture = event.target;

		texture.removeEventListener( 'dispose', onTextureDispose );

		deallocateTexture( texture );

		_this.info.memory.textures --;


	};

	var onRenderTargetDispose = function ( event ) {
        if (debug_renderer) console.log(renderer_name+".onRenderTargetDispose()");

		var renderTarget = event.target;

		renderTarget.removeEventListener( 'dispose', onRenderTargetDispose );

		deallocateRenderTarget( renderTarget );

		_this.info.memory.textures --;

	};

	var onMaterialDispose = function ( event ) {
        if (debug_renderer) console.log(renderer_name+".onMaterialDispose()");

		var material = event.target;

		material.removeEventListener( 'dispose', onMaterialDispose );

		deallocateMaterial( material );

	};

	// Buffer deallocation

	var deleteBuffers = function ( geometry ) {
        if (debug_renderer) console.log(renderer_name+".deleteBuffers()");

		if ( geometry.__webglVertexBuffer !== undefined ) _gl.deleteBuffer( geometry.__webglVertexBuffer );
		if ( geometry.__webglNormalBuffer !== undefined ) _gl.deleteBuffer( geometry.__webglNormalBuffer );
		if ( geometry.__webglTangentBuffer !== undefined ) _gl.deleteBuffer( geometry.__webglTangentBuffer );
		if ( geometry.__webglColorBuffer !== undefined ) _gl.deleteBuffer( geometry.__webglColorBuffer );
		if ( geometry.__webglUVBuffer !== undefined ) _gl.deleteBuffer( geometry.__webglUVBuffer );
		if ( geometry.__webglUV2Buffer !== undefined ) _gl.deleteBuffer( geometry.__webglUV2Buffer );

		if ( geometry.__webglSkinIndicesBuffer !== undefined ) _gl.deleteBuffer( geometry.__webglSkinIndicesBuffer );
		if ( geometry.__webglSkinWeightsBuffer !== undefined ) _gl.deleteBuffer( geometry.__webglSkinWeightsBuffer );

		if ( geometry.__webglFaceBuffer !== undefined ) _gl.deleteBuffer( geometry.__webglFaceBuffer );
		if ( geometry.__webglLineBuffer !== undefined ) _gl.deleteBuffer( geometry.__webglLineBuffer );

		if ( geometry.__webglLineDistanceBuffer !== undefined ) _gl.deleteBuffer( geometry.__webglLineDistanceBuffer );
		// custom attributes

		if ( geometry.__webglCustomAttributesList !== undefined ) {

			for ( var id in geometry.__webglCustomAttributesList ) {

				_gl.deleteBuffer( geometry.__webglCustomAttributesList[ id ].buffer );

			}

		}

		_this.info.memory.geometries --;

	};

	var deallocateGeometry = function ( geometry ) {
        if (debug_renderer) console.log(renderer_name+".deallocateGeometry()");

		geometry.__webglInit = undefined;

		if ( geometry instanceof THREE.BufferGeometry ) {

			var attributes = geometry.attributes;

			for ( var key in attributes ) {

				if ( attributes[ key ].buffer !== undefined ) {

					_gl.deleteBuffer( attributes[ key ].buffer );
		
				}

			}

			_this.info.memory.geometries --;

		} else {

			if ( geometry.geometryGroups !== undefined ) {

				for ( var g in geometry.geometryGroups ) {

					var geometryGroup = geometry.geometryGroups[ g ];

					if ( geometryGroup.numMorphTargets !== undefined ) {

						for ( var m = 0, ml = geometryGroup.numMorphTargets; m < ml; m ++ ) {

							_gl.deleteBuffer( geometryGroup.__webglMorphTargetsBuffers[ m ] );

						}

					}

					if ( geometryGroup.numMorphNormals !== undefined ) {

						for ( var m = 0, ml = geometryGroup.numMorphNormals; m < ml; m ++ ) {

							_gl.deleteBuffer( geometryGroup.__webglMorphNormalsBuffers[ m ] );

						}

					}

					deleteBuffers( geometryGroup );

				}

			} else {

				deleteBuffers( geometry );

			}

		}

	};

	var deallocateTexture = function ( texture ) {
        if (debug_renderer) console.log(renderer_name+".deallocateTexture()");

		if ( texture.image && texture.image.__webglTextureCube ) {

			// cube texture

			_gl.deleteTexture( texture.image.__webglTextureCube );

		} else {

			// 2D texture

			if ( ! texture.__webglInit ) return;

			texture.__webglInit = false;
			_gl.deleteTexture( texture.__webglTexture );

		}

	};

	var deallocateRenderTarget = function ( renderTarget ) {
        if (debug_renderer) console.log(renderer_name+".deallocateRenderTarget()");

		if ( !renderTarget || ! renderTarget.__webglTexture ) return;

		_gl.deleteTexture( renderTarget.__webglTexture );

		if ( renderTarget instanceof THREE.WebGLRenderTargetCube ) {

			for ( var i = 0; i < 6; i ++ ) {

				_gl.deleteFramebuffer( renderTarget.__webglFramebuffer[ i ] );
				_gl.deleteRenderbuffer( renderTarget.__webglRenderbuffer[ i ] );

			}

		} else {

			_gl.deleteFramebuffer( renderTarget.__webglFramebuffer );
			_gl.deleteRenderbuffer( renderTarget.__webglRenderbuffer );

		}

	};

	var deallocateMaterial = function ( material ) {
        if (debug_renderer) console.log(renderer_name+".deallocateMaterial()");

		var program = material.program;

		if ( program === undefined ) return;

		material.program = undefined;

		// only deallocate GL program if this was the last use of shared program
		// assumed there is only single copy of any program in the _programs list
		// (that's how it's constructed)

		var i, il, programInfo;
		var deleteProgram = false;

		for ( i = 0, il = _programs.length; i < il; i ++ ) {

			programInfo = _programs[ i ];

			if ( programInfo.program === program ) {

				programInfo.usedTimes --;

				if ( programInfo.usedTimes === 0 ) {

					deleteProgram = true;

				}

				break;

			}

		}

		if ( deleteProgram === true ) {

			// avoid using array.splice, this is costlier than creating new array from scratch

			var newPrograms = [];

			for ( i = 0, il = _programs.length; i < il; i ++ ) {

				programInfo = _programs[ i ];

				if ( programInfo.program !== program ) {

					newPrograms.push( programInfo );

				}

			}

			_programs = newPrograms;

			_gl.deleteProgram( program );

			_this.info.memory.programs --;

		}

	};

	// Buffer initialization

	function initCustomAttributes ( geometry, object ) {
        if (debug_renderer) console.log(renderer_name+".initCustomAttributes()");

		var nvertices = geometry.vertices.length;

		var material = object.material;

		if ( material.attributes ) {

			if ( geometry.__webglCustomAttributesList === undefined ) {

				geometry.__webglCustomAttributesList = [];

			}

			for ( var a in material.attributes ) {

				var attribute = material.attributes[ a ];

				if ( !attribute.__webglInitialized || attribute.createUniqueBuffers ) {

					attribute.__webglInitialized = true;

					var size = 1;		// "f" and "i"

					if ( attribute.type === "v2" ) size = 2;
					else if ( attribute.type === "v3" ) size = 3;
					else if ( attribute.type === "v4" ) size = 4;
					else if ( attribute.type === "c"  ) size = 3;

					attribute.size = size;

					attribute.array = new Float32Array( nvertices * size );
                    attribute.array.name = ""+attribute+"attribute.array";

					attribute.buffer = _gl.createBuffer();
                    attribute.buffer[BUFFER_BELONGS_TO_ATTRIBUTE] = a;

					attribute.needsUpdate = true;

				}

				geometry.__webglCustomAttributesList.push( attribute );

			}

		}

	};

	function initParticleBuffers ( geometry, object ) {
        if (debug_renderer) console.log(renderer_name+".initParticleBuffers()");

		var nvertices = geometry.vertices.length;

		geometry.__vertexArray = new Float32Array( nvertices * 3 );
        geometry.__vertexArray.name = "geometry.__vertexArray";
        geometry.__colorArray = new Float32Array( nvertices * 3 );
        geometry.__colorArray.name = "geometry.__colorArray";

		geometry.__sortArray = [];

		geometry.__webglParticleCount = nvertices;

		initCustomAttributes ( geometry, object );

	};

	function initLineBuffers ( geometry, object ) {
        if (debug_renderer) console.log(renderer_name+".initLineBuffers()");

		var nvertices = geometry.vertices.length;

		geometry.__vertexArray = new Float32Array( nvertices * 3 );
        geometry.__vertexArray.name = "geometry.__vertexArray";
        geometry.__colorArray = new Float32Array( nvertices * 3 );
        geometry.__colorArray.name = "geometry.__colorArray";
        geometry.__lineDistanceArray = new Float32Array( nvertices * 1 );
        geometry.__lineDistanceArray.name = "geometry.__lineDistanceArray";
        geometry.__webglLineCount = nvertices;

		initCustomAttributes ( geometry, object );

	};

	function initMeshBuffers ( geometryGroup, object ) {
        if (debug_renderer) console.log(renderer_name+".initMeshBuffers()");
		var geometry = object.geometry,
			faces3 = geometryGroup.faces3,

			nvertices = faces3.length * 3,
			ntris     = faces3.length * 1,
			nlines    = faces3.length * 3,

			material = getBufferMaterial( object, geometryGroup ),

			uvType = bufferGuessUVType( material ),
			normalType = bufferGuessNormalType( material ),
			vertexColorType = bufferGuessVertexColorType( material );

		// console.log( "uvType", uvType, "normalType", normalType, "vertexColorType", vertexColorType, object, geometryGroup, material );

		geometryGroup.__vertexArray = new Float32Array( nvertices * 3 );
        geometryGroup.__vertexArray.name = "geometryGroup.__vertexArray";
        if ( normalType ) {

			geometryGroup.__normalArray = new Float32Array( nvertices * 3 );
            geometryGroup.__normalArray.name = "geometryGroup.__normalArray";
        }

		if ( geometry.hasTangents ) {

			geometryGroup.__tangentArray = new Float32Array( nvertices * 4 );
            geometryGroup.__tangentArray.name = "geometryGroup.__tangentArray";
        }

		if ( vertexColorType ) {

			geometryGroup.__colorArray = new Float32Array( nvertices * 3 );
            geometryGroup.__colorArray.name = "geometryGroup.__colorArray";
        }

		if ( uvType ) {

			if ( geometry.faceVertexUvs.length > 0 ) {

				geometryGroup.__uvArray = new Float32Array( nvertices * 2 );
                geometryGroup.__uvArray.name = "geometryGroup.__uvArray";
            }

			if ( geometry.faceVertexUvs.length > 1 ) {

				geometryGroup.__uv2Array = new Float32Array( nvertices * 2 );
                geometryGroup.__uv2Array.name = "geometryGroup.__uv2Array";
            }

		}

		if ( object.geometry.skinWeights.length && object.geometry.skinIndices.length ) {
			geometryGroup.__skinIndexArray = new Float32Array( nvertices * 4 );
            geometryGroup.__skinIndexArray.name = "geometryGroup.__skinIndexArray";
			geometryGroup.__skinWeightArray = new Float32Array( nvertices * 4 );
            geometryGroup.__skinWeightArray.name = "geometryGroup.__skinWeightArray";
		}

        geometryGroup.__faceArray = new Uint16Array( ntris * 3 );
        geometryGroup.__faceArray.name = "geometryGroup.__faceArray";
        geometryGroup.__lineArray = new Uint16Array( nlines * 2 );
        geometryGroup.__lineArray.name = "geometryGroup.__lineArray";

        var m, ml, mta;

		if ( geometryGroup.numMorphTargets ) {

			geometryGroup.__morphTargetsArrays = [];

			for ( m = 0, ml = geometryGroup.numMorphTargets; m < ml; m ++ ) {
                mta = new Float32Array( nvertices * 3 );
                mta.name = "morphTargetArray_"+m;
                geometryGroup.__morphTargetsArrays.push(mta);
			}

		}

		if ( geometryGroup.numMorphNormals ) {

			geometryGroup.__morphNormalsArrays = [];

			for ( m = 0, ml = geometryGroup.numMorphNormals; m < ml; m ++ ) {
                mta = new Float32Array( nvertices * 3 );
                mta.name = "morphNormalsArray_"+m;
                geometryGroup.__morphNormalsArrays.push( mta );
			}

		}

		geometryGroup.__webglFaceCount = ntris * 3;
		geometryGroup.__webglLineCount = nlines * 2;


		// custom attributes

		if ( material.attributes ) {

			if ( geometryGroup.__webglCustomAttributesList === undefined ) {

				geometryGroup.__webglCustomAttributesList = [];

			}

			for ( var a in material.attributes ) {

				// Do a shallow copy of the attribute object so different geometryGroup chunks use different
				// attribute buffers which are correctly indexed in the setMeshBuffers function

				var originalAttribute = material.attributes[ a ];

				var attribute = {};

				for ( var property in originalAttribute ) {

					attribute[ property ] = originalAttribute[ property ];

				}

				if ( !attribute.__webglInitialized || attribute.createUniqueBuffers ) {

					attribute.__webglInitialized = true;

					var size = 1;		// "f" and "i"

					if( attribute.type === "v2" ) size = 2;
					else if( attribute.type === "v3" ) size = 3;
					else if( attribute.type === "v4" ) size = 4;
					else if( attribute.type === "c"  ) size = 3;

					attribute.size = size;

					attribute.array = new Float32Array( nvertices * size );
                    attribute.array.name = ""+material.name+"_attribute_array";

					attribute.buffer = _gl.createBuffer();
                    attribute.buffer[BUFFER_BELONGS_TO_ATTRIBUTE] = a;

					originalAttribute.needsUpdate = true;
					attribute.__original = originalAttribute;

				}

				geometryGroup.__webglCustomAttributesList.push( attribute );

			}

		}

		geometryGroup.__inittedArrays = true;

	};

	function getBufferMaterial( object, geometryGroup ) {

		return object.material instanceof THREE.MeshFaceMaterial
			? object.material.materials[ geometryGroup.materialIndex ]
			: object.material;

	};

	function materialNeedsSmoothNormals ( material ) {

		return material && material.shading !== undefined && material.shading === THREE.SmoothShading;

	};

	function bufferGuessNormalType ( material ) {

		// only MeshBasicMaterial and MeshDepthMaterial don't need normals

		if ( ( material instanceof THREE.MeshBasicMaterial && !material.envMap ) || material instanceof THREE.MeshDepthMaterial ) {

			return false;

		}

		if ( materialNeedsSmoothNormals( material ) ) {

			return THREE.SmoothShading;

		} else {

			return THREE.FlatShading;

		}

	};

	function bufferGuessVertexColorType( material ) {

		if ( material.vertexColors ) {

			return material.vertexColors;

		}

		return false;

	};

	function bufferGuessUVType( material ) {

		// material must use some texture to require uvs

		if ( material.map ||
		     material.lightMap ||
		     material.bumpMap ||
		     material.normalMap ||
		     material.specularMap ||
		     material instanceof THREE.ShaderMaterial ) {

			return true;

		}

		return false;

	};

	//

	function initDirectBuffers( geometry ) {

		var a, attribute, type;

		for ( a in geometry.attributes ) {

			if ( a === "index" ) {

                type = Context3D.ELEMENT_ARRAY_BUFFER;

			} else {

                type = Context3D.ARRAY_BUFFER;

			}

			attribute = geometry.attributes[ a ];

			attribute.buffer = _gl.createBuffer();

            _gl.bindBuffer( type, attribute.buffer );
            _gl.bufferData( type, attribute.array.typedArray(), Context3D.STATIC_DRAW );

		}

	};

	// Buffer setting

	function setParticleBuffers ( geometry, hint, object ) {

		var v, c, vertex, offset, index, color,

		vertices = geometry.vertices,
		vl = vertices.length,

		colors = geometry.colors,
		cl = colors.length,

		vertexArray = geometry.__vertexArray,
		colorArray = geometry.__colorArray,

		sortArray = geometry.__sortArray,

		dirtyVertices = geometry.verticesNeedUpdate,
		dirtyElements = geometry.elementsNeedUpdate,
		dirtyColors = geometry.colorsNeedUpdate,

		customAttributes = geometry.__webglCustomAttributesList,
		i, il,
		a, ca, cal, value,
		customAttribute;

		if ( object.sortParticles ) {

			_projScreenMatrixPS.copy( _projScreenMatrix );
			_projScreenMatrixPS.multiply( object.matrixWorld );

			for ( v = 0; v < vl; v ++ ) {

				vertex = vertices[ v ];

				_vector3.copy( vertex );
				_vector3.applyProjection( _projScreenMatrixPS );

				sortArray[ v ] = [ _vector3.z, v ];

			}

			sortArray.sort( numericalSort );

			for ( v = 0; v < vl; v ++ ) {

				vertex = vertices[ sortArray[v][1] ];

				offset = v * 3;

				vertexArray[ offset ]     = vertex.x;
				vertexArray[ offset + 1 ] = vertex.y;
				vertexArray[ offset + 2 ] = vertex.z;

			}

			for ( c = 0; c < cl; c ++ ) {

				offset = c * 3;

				color = colors[ sortArray[c][1] ];

				colorArray[ offset ]     = color.r;
				colorArray[ offset + 1 ] = color.g;
				colorArray[ offset + 2 ] = color.b;

			}

			if ( customAttributes ) {

				for ( i = 0, il = customAttributes.length; i < il; i ++ ) {

					customAttribute = customAttributes[ i ];

					if ( ! ( customAttribute.boundTo === undefined || customAttribute.boundTo === "vertices" ) ) continue;

					offset = 0;

					cal = customAttribute.value.length;

					if ( customAttribute.size === 1 ) {

						for ( ca = 0; ca < cal; ca ++ ) {

							index = sortArray[ ca ][ 1 ];

							customAttribute.array[ ca ] = customAttribute.value[ index ];

						}

					} else if ( customAttribute.size === 2 ) {

						for ( ca = 0; ca < cal; ca ++ ) {

							index = sortArray[ ca ][ 1 ];

							value = customAttribute.value[ index ];

							customAttribute.array[ offset ] 	= value.x;
							customAttribute.array[ offset + 1 ] = value.y;

							offset += 2;

						}

					} else if ( customAttribute.size === 3 ) {

						if ( customAttribute.type === "c" ) {

							for ( ca = 0; ca < cal; ca ++ ) {

								index = sortArray[ ca ][ 1 ];

								value = customAttribute.value[ index ];

								customAttribute.array[ offset ]     = value.r;
								customAttribute.array[ offset + 1 ] = value.g;
								customAttribute.array[ offset + 2 ] = value.b;

								offset += 3;

							}

						} else {

							for ( ca = 0; ca < cal; ca ++ ) {

								index = sortArray[ ca ][ 1 ];

								value = customAttribute.value[ index ];

								customAttribute.array[ offset ] 	= value.x;
								customAttribute.array[ offset + 1 ] = value.y;
								customAttribute.array[ offset + 2 ] = value.z;

								offset += 3;

							}

						}

					} else if ( customAttribute.size === 4 ) {

						for ( ca = 0; ca < cal; ca ++ ) {

							index = sortArray[ ca ][ 1 ];

							value = customAttribute.value[ index ];

							customAttribute.array[ offset ]      = value.x;
							customAttribute.array[ offset + 1  ] = value.y;
							customAttribute.array[ offset + 2  ] = value.z;
							customAttribute.array[ offset + 3  ] = value.w;

							offset += 4;

						}

					}

				}

			}

		} else {

			if ( dirtyVertices ) {

				for ( v = 0; v < vl; v ++ ) {

					vertex = vertices[ v ];

					offset = v * 3;

					vertexArray[ offset ]     = vertex.x;
					vertexArray[ offset + 1 ] = vertex.y;
					vertexArray[ offset + 2 ] = vertex.z;

				}

			}

			if ( dirtyColors ) {

				for ( c = 0; c < cl; c ++ ) {

					color = colors[ c ];

					offset = c * 3;

					colorArray[ offset ]     = color.r;
					colorArray[ offset + 1 ] = color.g;
					colorArray[ offset + 2 ] = color.b;

				}

			}

			if ( customAttributes ) {

				for ( i = 0, il = customAttributes.length; i < il; i ++ ) {

					customAttribute = customAttributes[ i ];

					if ( customAttribute.needsUpdate &&
						 ( customAttribute.boundTo === undefined ||
						   customAttribute.boundTo === "vertices") ) {

						cal = customAttribute.value.length;

						offset = 0;

						if ( customAttribute.size === 1 ) {

							for ( ca = 0; ca < cal; ca ++ ) {

								customAttribute.array[ ca ] = customAttribute.value[ ca ];

							}

						} else if ( customAttribute.size === 2 ) {

							for ( ca = 0; ca < cal; ca ++ ) {

								value = customAttribute.value[ ca ];

								customAttribute.array[ offset ] 	= value.x;
								customAttribute.array[ offset + 1 ] = value.y;

								offset += 2;

							}

						} else if ( customAttribute.size === 3 ) {

							if ( customAttribute.type === "c" ) {

								for ( ca = 0; ca < cal; ca ++ ) {

									value = customAttribute.value[ ca ];

									customAttribute.array[ offset ] 	= value.r;
									customAttribute.array[ offset + 1 ] = value.g;
									customAttribute.array[ offset + 2 ] = value.b;

									offset += 3;

								}

							} else {

								for ( ca = 0; ca < cal; ca ++ ) {

									value = customAttribute.value[ ca ];

									customAttribute.array[ offset ] 	= value.x;
									customAttribute.array[ offset + 1 ] = value.y;
									customAttribute.array[ offset + 2 ] = value.z;

									offset += 3;

								}

							}

						} else if ( customAttribute.size === 4 ) {

							for ( ca = 0; ca < cal; ca ++ ) {

								value = customAttribute.value[ ca ];

								customAttribute.array[ offset ]      = value.x;
								customAttribute.array[ offset + 1  ] = value.y;
								customAttribute.array[ offset + 2  ] = value.z;
								customAttribute.array[ offset + 3  ] = value.w;

								offset += 4;

							}

						}

					}

				}

			}

		}

		if ( dirtyVertices || object.sortParticles ) {

            _gl.bindBuffer( Context3D.ARRAY_BUFFER, geometry.__webglVertexBuffer );
            _gl.bufferData( Context3D.ARRAY_BUFFER, vertexArray.typedArray(), hint );

		}

		if ( dirtyColors || object.sortParticles ) {

            _gl.bindBuffer( Context3D.ARRAY_BUFFER, geometry.__webglColorBuffer );
            _gl.bufferData( Context3D.ARRAY_BUFFER, colorArray.typedArray(), hint );

		}

		if ( customAttributes ) {

			for ( i = 0, il = customAttributes.length; i < il; i ++ ) {

				customAttribute = customAttributes[ i ];

				if ( customAttribute.needsUpdate || object.sortParticles ) {

                    _gl.bindBuffer( Context3D.ARRAY_BUFFER, customAttribute.buffer );
                    _gl.bufferData( Context3D.ARRAY_BUFFER, customAttribute.array.typedArray(), hint );

				}

			}

		}


	};

	function setLineBuffers ( geometry, hint ) {

		var v, c, d, vertex, offset, color,

		vertices = geometry.vertices,
		colors = geometry.colors,
		lineDistances = geometry.lineDistances,

		vl = vertices.length,
		cl = colors.length,
		dl = lineDistances.length,

		vertexArray = geometry.__vertexArray,
		colorArray = geometry.__colorArray,
		lineDistanceArray = geometry.__lineDistanceArray,

		dirtyVertices = geometry.verticesNeedUpdate,
		dirtyColors = geometry.colorsNeedUpdate,
		dirtyLineDistances = geometry.lineDistancesNeedUpdate,

		customAttributes = geometry.__webglCustomAttributesList,

		i, il,
		a, ca, cal, value,
		customAttribute;

		if ( dirtyVertices ) {

			for ( v = 0; v < vl; v ++ ) {

				vertex = vertices[ v ];

				offset = v * 3;

				vertexArray[ offset ]     = vertex.x;
				vertexArray[ offset + 1 ] = vertex.y;
				vertexArray[ offset + 2 ] = vertex.z;

			}

            _gl.bindBuffer( Context3D.ARRAY_BUFFER, geometry.__webglVertexBuffer );
            _gl.bufferData( Context3D.ARRAY_BUFFER, vertexArray.typedArray(), hint );

		}

		if ( dirtyColors ) {

			for ( c = 0; c < cl; c ++ ) {

				color = colors[ c ];

				offset = c * 3;

				colorArray[ offset ]     = color.r;
				colorArray[ offset + 1 ] = color.g;
				colorArray[ offset + 2 ] = color.b;

			}

            _gl.bindBuffer( Context3D.ARRAY_BUFFER, geometry.__webglColorBuffer );
            _gl.bufferData( Context3D.ARRAY_BUFFER, colorArray.typedArray(), hint );

		}

		if ( dirtyLineDistances ) {

			for ( d = 0; d < dl; d ++ ) {

				lineDistanceArray[ d ] = lineDistances[ d ];

			}

            _gl.bindBuffer( Context3D.ARRAY_BUFFER, geometry.__webglLineDistanceBuffer );
            _gl.bufferData( Context3D.ARRAY_BUFFER, lineDistanceArray.typedArray(), hint );

		}

		if ( customAttributes ) {

			for ( i = 0, il = customAttributes.length; i < il; i ++ ) {

				customAttribute = customAttributes[ i ];

				if ( customAttribute.needsUpdate &&
					 ( customAttribute.boundTo === undefined ||
					   customAttribute.boundTo === "vertices" ) ) {

					offset = 0;

					cal = customAttribute.value.length;

					if ( customAttribute.size === 1 ) {

						for ( ca = 0; ca < cal; ca ++ ) {

							customAttribute.array[ ca ] = customAttribute.value[ ca ];

						}

					} else if ( customAttribute.size === 2 ) {

						for ( ca = 0; ca < cal; ca ++ ) {

							value = customAttribute.value[ ca ];

							customAttribute.array[ offset ] 	= value.x;
							customAttribute.array[ offset + 1 ] = value.y;

							offset += 2;

						}

					} else if ( customAttribute.size === 3 ) {

						if ( customAttribute.type === "c" ) {

							for ( ca = 0; ca < cal; ca ++ ) {

								value = customAttribute.value[ ca ];

								customAttribute.array[ offset ] 	= value.r;
								customAttribute.array[ offset + 1 ] = value.g;
								customAttribute.array[ offset + 2 ] = value.b;

								offset += 3;

							}

						} else {

							for ( ca = 0; ca < cal; ca ++ ) {

								value = customAttribute.value[ ca ];

								customAttribute.array[ offset ] 	= value.x;
								customAttribute.array[ offset + 1 ] = value.y;
								customAttribute.array[ offset + 2 ] = value.z;

								offset += 3;

							}

						}

					} else if ( customAttribute.size === 4 ) {

						for ( ca = 0; ca < cal; ca ++ ) {

							value = customAttribute.value[ ca ];

							customAttribute.array[ offset ] 	 = value.x;
							customAttribute.array[ offset + 1  ] = value.y;
							customAttribute.array[ offset + 2  ] = value.z;
							customAttribute.array[ offset + 3  ] = value.w;

							offset += 4;

						}

					}

                    _gl.bindBuffer( Context3D.ARRAY_BUFFER, customAttribute.buffer );
                    _gl.bufferData( Context3D.ARRAY_BUFFER, customAttribute.array.typedArray(), hint );

				}

			}

		}

	};

	function setMeshBuffers( geometryGroup, object, hint, dispose, material ) {
        if (debug_renderer) console.log(renderer_name+".setMeshBuffers()");
		if ( ! geometryGroup.__inittedArrays ) {

			return;

		}

		var normalType = bufferGuessNormalType( material ),
		vertexColorType = bufferGuessVertexColorType( material ),
		uvType = bufferGuessUVType( material ),

		needsSmoothNormals = ( normalType === THREE.SmoothShading );

		var f, fl, fi, face,
		vertexNormals, faceNormal, normal,
		vertexColors, faceColor,
		vertexTangents,
		uv, uv2, v1, v2, v3, v4, t1, t2, t3, t4, n1, n2, n3, n4,
		c1, c2, c3, c4,
		sw1, sw2, sw3, sw4,
		si1, si2, si3, si4,
		sa1, sa2, sa3, sa4,
		sb1, sb2, sb3, sb4,
		m, ml, i, il,
		vn, uvi, uv2i,
		vk, vkl, vka,
		nka, chf, faceVertexNormals,
		a,

		vertexIndex = 0,

		offset = 0,
		offset_uv = 0,
		offset_uv2 = 0,
		offset_face = 0,
		offset_normal = 0,
		offset_tangent = 0,
		offset_line = 0,
		offset_color = 0,
		offset_skin = 0,
		offset_morphTarget = 0,
		offset_custom = 0,
		offset_customSrc = 0,

		value,

		vertexArray = geometryGroup.__vertexArray,
		uvArray = geometryGroup.__uvArray,
		uv2Array = geometryGroup.__uv2Array,
		normalArray = geometryGroup.__normalArray,
		tangentArray = geometryGroup.__tangentArray,
		colorArray = geometryGroup.__colorArray,

		skinIndexArray = geometryGroup.__skinIndexArray,
		skinWeightArray = geometryGroup.__skinWeightArray,

		morphTargetsArrays = geometryGroup.__morphTargetsArrays,
		morphNormalsArrays = geometryGroup.__morphNormalsArrays,

		customAttributes = geometryGroup.__webglCustomAttributesList,
		customAttribute,

		faceArray = geometryGroup.__faceArray,
		lineArray = geometryGroup.__lineArray,

		geometry = object.geometry, // this is shared for all chunks

		dirtyVertices = geometry.verticesNeedUpdate,
		dirtyElements = geometry.elementsNeedUpdate,
		dirtyUvs = geometry.uvsNeedUpdate,
		dirtyNormals = geometry.normalsNeedUpdate,
		dirtyTangents = geometry.tangentsNeedUpdate,
		dirtyColors = geometry.colorsNeedUpdate,
		dirtyMorphTargets = geometry.morphTargetsNeedUpdate,

		vertices = geometry.vertices,
		chunk_faces3 = geometryGroup.faces3,
		obj_faces = geometry.faces,

		obj_uvs  = geometry.faceVertexUvs[ 0 ],
		obj_uvs2 = geometry.faceVertexUvs[ 1 ],

		obj_colors = geometry.colors,

		obj_skinIndices = geometry.skinIndices,
		obj_skinWeights = geometry.skinWeights,

		morphTargets = geometry.morphTargets,
		morphNormals = geometry.morphNormals;

		if ( dirtyVertices ) {

			for ( f = 0, fl = chunk_faces3.length; f < fl; f ++ ) {

				face = obj_faces[ chunk_faces3[ f ] ];

				v1 = vertices[ face.a ];
				v2 = vertices[ face.b ];
				v3 = vertices[ face.c ];

				vertexArray[ offset ]     = v1.x;
				vertexArray[ offset + 1 ] = v1.y;
				vertexArray[ offset + 2 ] = v1.z;

				vertexArray[ offset + 3 ] = v2.x;
				vertexArray[ offset + 4 ] = v2.y;
				vertexArray[ offset + 5 ] = v2.z;

				vertexArray[ offset + 6 ] = v3.x;
				vertexArray[ offset + 7 ] = v3.y;
				vertexArray[ offset + 8 ] = v3.z;

				offset += 9;

			}

            _gl.bindBuffer( Context3D.ARRAY_BUFFER, geometryGroup.__webglVertexBuffer );
            _gl.bufferData( Context3D.ARRAY_BUFFER, vertexArray.typedArray(), hint );

		}

		if ( dirtyMorphTargets ) {

			for ( vk = 0, vkl = morphTargets.length; vk < vkl; vk ++ ) {

				offset_morphTarget = 0;
				for ( f = 0, fl = chunk_faces3.length; f < fl; f ++ ) {

					chf = chunk_faces3[ f ];
					face = obj_faces[ chf ];

					// morph positions

					v1 = morphTargets[ vk ].vertices[ face.a ];
					v2 = morphTargets[ vk ].vertices[ face.b ];
					v3 = morphTargets[ vk ].vertices[ face.c ];

					vka = morphTargetsArrays[ vk ];

					vka[ offset_morphTarget ] 	  = v1.x;
					vka[ offset_morphTarget + 1 ] = v1.y;
					vka[ offset_morphTarget + 2 ] = v1.z;

					vka[ offset_morphTarget + 3 ] = v2.x;
					vka[ offset_morphTarget + 4 ] = v2.y;
					vka[ offset_morphTarget + 5 ] = v2.z;

					vka[ offset_morphTarget + 6 ] = v3.x;
					vka[ offset_morphTarget + 7 ] = v3.y;
					vka[ offset_morphTarget + 8 ] = v3.z;

					// morph normals

					if ( material.morphNormals ) {

						if ( needsSmoothNormals ) {

							faceVertexNormals = morphNormals[ vk ].vertexNormals[ chf ];

							n1 = faceVertexNormals.a;
							n2 = faceVertexNormals.b;
							n3 = faceVertexNormals.c;

						} else {

							n1 = morphNormals[ vk ].faceNormals[ chf ];
							n2 = n1;
							n3 = n1;

						}

						nka = morphNormalsArrays[ vk ];

						nka[ offset_morphTarget ] 	  = n1.x;
						nka[ offset_morphTarget + 1 ] = n1.y;
						nka[ offset_morphTarget + 2 ] = n1.z;

						nka[ offset_morphTarget + 3 ] = n2.x;
						nka[ offset_morphTarget + 4 ] = n2.y;
						nka[ offset_morphTarget + 5 ] = n2.z;

						nka[ offset_morphTarget + 6 ] = n3.x;
						nka[ offset_morphTarget + 7 ] = n3.y;
						nka[ offset_morphTarget + 8 ] = n3.z;

					}

					//

					offset_morphTarget += 9;

				}

                _gl.bindBuffer( Context3D.ARRAY_BUFFER, geometryGroup.__webglMorphTargetsBuffers[ vk ] );
                _gl.bufferData( Context3D.ARRAY_BUFFER, morphTargetsArrays[ vk ].typedArray(), hint );

				if ( material.morphNormals ) {

                    _gl.bindBuffer( Context3D.ARRAY_BUFFER, geometryGroup.__webglMorphNormalsBuffers[ vk ] );
                    _gl.bufferData( Context3D.ARRAY_BUFFER, morphNormalsArrays[ vk ].typedArray(), hint );

				}

			}

		}

		if ( obj_skinWeights.length ) {

			for ( f = 0, fl = chunk_faces3.length; f < fl; f ++ ) {

				face = obj_faces[ chunk_faces3[ f ]	];

				// weights

				sw1 = obj_skinWeights[ face.a ];
				sw2 = obj_skinWeights[ face.b ];
				sw3 = obj_skinWeights[ face.c ];

				skinWeightArray[ offset_skin ]     = sw1.x;
				skinWeightArray[ offset_skin + 1 ] = sw1.y;
				skinWeightArray[ offset_skin + 2 ] = sw1.z;
				skinWeightArray[ offset_skin + 3 ] = sw1.w;

				skinWeightArray[ offset_skin + 4 ] = sw2.x;
				skinWeightArray[ offset_skin + 5 ] = sw2.y;
				skinWeightArray[ offset_skin + 6 ] = sw2.z;
				skinWeightArray[ offset_skin + 7 ] = sw2.w;

				skinWeightArray[ offset_skin + 8 ]  = sw3.x;
				skinWeightArray[ offset_skin + 9 ]  = sw3.y;
				skinWeightArray[ offset_skin + 10 ] = sw3.z;
				skinWeightArray[ offset_skin + 11 ] = sw3.w;

				// indices

				si1 = obj_skinIndices[ face.a ];
				si2 = obj_skinIndices[ face.b ];
				si3 = obj_skinIndices[ face.c ];

				skinIndexArray[ offset_skin ]     = si1.x;
				skinIndexArray[ offset_skin + 1 ] = si1.y;
				skinIndexArray[ offset_skin + 2 ] = si1.z;
				skinIndexArray[ offset_skin + 3 ] = si1.w;

				skinIndexArray[ offset_skin + 4 ] = si2.x;
				skinIndexArray[ offset_skin + 5 ] = si2.y;
				skinIndexArray[ offset_skin + 6 ] = si2.z;
				skinIndexArray[ offset_skin + 7 ] = si2.w;

				skinIndexArray[ offset_skin + 8 ]  = si3.x;
				skinIndexArray[ offset_skin + 9 ]  = si3.y;
				skinIndexArray[ offset_skin + 10 ] = si3.z;
				skinIndexArray[ offset_skin + 11 ] = si3.w;

				offset_skin += 12;

			}

			if ( offset_skin > 0 ) {

                _gl.bindBuffer( Context3D.ARRAY_BUFFER, geometryGroup.__webglSkinIndicesBuffer );
                _gl.bufferData( Context3D.ARRAY_BUFFER, skinIndexArray.typedArray(), hint );

                _gl.bindBuffer( Context3D.ARRAY_BUFFER, geometryGroup.__webglSkinWeightsBuffer );
                _gl.bufferData( Context3D.ARRAY_BUFFER, skinWeightArray.typedArray(), hint );

			}

		}

		if ( dirtyColors && vertexColorType ) {

			for ( f = 0, fl = chunk_faces3.length; f < fl; f ++ ) {

				face = obj_faces[ chunk_faces3[ f ]	];

				vertexColors = face.vertexColors;
				faceColor = face.color;

				if ( vertexColors.length === 3 && vertexColorType === THREE.VertexColors ) {

					c1 = vertexColors[ 0 ];
					c2 = vertexColors[ 1 ];
					c3 = vertexColors[ 2 ];

				} else {

					c1 = faceColor;
					c2 = faceColor;
					c3 = faceColor;

				}

				colorArray[ offset_color ]     = c1.r;
				colorArray[ offset_color + 1 ] = c1.g;
				colorArray[ offset_color + 2 ] = c1.b;

				colorArray[ offset_color + 3 ] = c2.r;
				colorArray[ offset_color + 4 ] = c2.g;
				colorArray[ offset_color + 5 ] = c2.b;

				colorArray[ offset_color + 6 ] = c3.r;
				colorArray[ offset_color + 7 ] = c3.g;
				colorArray[ offset_color + 8 ] = c3.b;

				offset_color += 9;

			}

			if ( offset_color > 0 ) {

                _gl.bindBuffer( Context3D.ARRAY_BUFFER, geometryGroup.__webglColorBuffer );
                _gl.bufferData( Context3D.ARRAY_BUFFER, colorArray.typedArray(), hint );

			}

		}

		if ( dirtyTangents && geometry.hasTangents ) {

			for ( f = 0, fl = chunk_faces3.length; f < fl; f ++ ) {

				face = obj_faces[ chunk_faces3[ f ]	];

				vertexTangents = face.vertexTangents;

				t1 = vertexTangents[ 0 ];
				t2 = vertexTangents[ 1 ];
				t3 = vertexTangents[ 2 ];

				tangentArray[ offset_tangent ]     = t1.x;
				tangentArray[ offset_tangent + 1 ] = t1.y;
				tangentArray[ offset_tangent + 2 ] = t1.z;
				tangentArray[ offset_tangent + 3 ] = t1.w;

				tangentArray[ offset_tangent + 4 ] = t2.x;
				tangentArray[ offset_tangent + 5 ] = t2.y;
				tangentArray[ offset_tangent + 6 ] = t2.z;
				tangentArray[ offset_tangent + 7 ] = t2.w;

				tangentArray[ offset_tangent + 8 ]  = t3.x;
				tangentArray[ offset_tangent + 9 ]  = t3.y;
				tangentArray[ offset_tangent + 10 ] = t3.z;
				tangentArray[ offset_tangent + 11 ] = t3.w;

				offset_tangent += 12;

			}

            _gl.bindBuffer( Context3D.ARRAY_BUFFER, geometryGroup.__webglTangentBuffer );
            _gl.bufferData( Context3D.ARRAY_BUFFER, tangentArray.typedArray(), hint );

		}

		if ( dirtyNormals && normalType ) {

			for ( f = 0, fl = chunk_faces3.length; f < fl; f ++ ) {

				face = obj_faces[ chunk_faces3[ f ]	];

				vertexNormals = face.vertexNormals;
				faceNormal = face.normal;

				if ( vertexNormals.length === 3 && needsSmoothNormals ) {

					for ( i = 0; i < 3; i ++ ) {

						vn = vertexNormals[ i ];

						normalArray[ offset_normal ]     = vn.x;
						normalArray[ offset_normal + 1 ] = vn.y;
						normalArray[ offset_normal + 2 ] = vn.z;

						offset_normal += 3;

					}

				} else {

					for ( i = 0; i < 3; i ++ ) {

						normalArray[ offset_normal ]     = faceNormal.x;
						normalArray[ offset_normal + 1 ] = faceNormal.y;
						normalArray[ offset_normal + 2 ] = faceNormal.z;

						offset_normal += 3;

					}

				}

			}

            _gl.bindBuffer( Context3D.ARRAY_BUFFER, geometryGroup.__webglNormalBuffer );
            _gl.bufferData( Context3D.ARRAY_BUFFER, normalArray.typedArray(), hint );

		}

		if ( dirtyUvs && obj_uvs && uvType ) {

			for ( f = 0, fl = chunk_faces3.length; f < fl; f ++ ) {

				fi = chunk_faces3[ f ];

				uv = obj_uvs[ fi ];

				if ( uv === undefined ) continue;

				for ( i = 0; i < 3; i ++ ) {

					uvi = uv[ i ];

					uvArray[ offset_uv ]     = uvi.x;
					uvArray[ offset_uv + 1 ] = uvi.y;

					offset_uv += 2;

				}

			}

			if ( offset_uv > 0 ) {

                _gl.bindBuffer( Context3D.ARRAY_BUFFER, geometryGroup.__webglUVBuffer );
                _gl.bufferData( Context3D.ARRAY_BUFFER, uvArray.typedArray(), hint );

			}

		}

		if ( dirtyUvs && obj_uvs2 && uvType ) {

			for ( f = 0, fl = chunk_faces3.length; f < fl; f ++ ) {

				fi = chunk_faces3[ f ];

				uv2 = obj_uvs2[ fi ];

				if ( uv2 === undefined ) continue;

				for ( i = 0; i < 3; i ++ ) {

					uv2i = uv2[ i ];

					uv2Array[ offset_uv2 ]     = uv2i.x;
					uv2Array[ offset_uv2 + 1 ] = uv2i.y;

					offset_uv2 += 2;

				}

			}

			if ( offset_uv2 > 0 ) {

                _gl.bindBuffer( Context3D.ARRAY_BUFFER, geometryGroup.__webglUV2Buffer );
                _gl.bufferData( Context3D.ARRAY_BUFFER, uv2Array.typedArray(), hint );

			}

		}

		if ( dirtyElements ) {

			for ( f = 0, fl = chunk_faces3.length; f < fl; f ++ ) {

				faceArray[ offset_face ] 	 = vertexIndex;
				faceArray[ offset_face + 1 ] = vertexIndex + 1;
				faceArray[ offset_face + 2 ] = vertexIndex + 2;

				offset_face += 3;

				lineArray[ offset_line ]     = vertexIndex;
				lineArray[ offset_line + 1 ] = vertexIndex + 1;

				lineArray[ offset_line + 2 ] = vertexIndex;
				lineArray[ offset_line + 3 ] = vertexIndex + 2;

				lineArray[ offset_line + 4 ] = vertexIndex + 1;
				lineArray[ offset_line + 5 ] = vertexIndex + 2;

				offset_line += 6;

				vertexIndex += 3;

			}

            _gl.bindBuffer( Context3D.ELEMENT_ARRAY_BUFFER, geometryGroup.__webglFaceBuffer );
            _gl.bufferData( Context3D.ELEMENT_ARRAY_BUFFER, faceArray.typedArray(), hint );

            _gl.bindBuffer( Context3D.ELEMENT_ARRAY_BUFFER, geometryGroup.__webglLineBuffer );
            _gl.bufferData( Context3D.ELEMENT_ARRAY_BUFFER, lineArray.typedArray(), hint );

		}

		if ( customAttributes ) {

			for ( i = 0, il = customAttributes.length; i < il; i ++ ) {

				customAttribute = customAttributes[ i ];

				if ( ! customAttribute.__original.needsUpdate ) continue;

				offset_custom = 0;
				offset_customSrc = 0;

				if ( customAttribute.size === 1 ) {

					if ( customAttribute.boundTo === undefined || customAttribute.boundTo === "vertices" ) {

						for ( f = 0, fl = chunk_faces3.length; f < fl; f ++ ) {

							face = obj_faces[ chunk_faces3[ f ]	];

							customAttribute.array[ offset_custom ] 	   = customAttribute.value[ face.a ];
							customAttribute.array[ offset_custom + 1 ] = customAttribute.value[ face.b ];
							customAttribute.array[ offset_custom + 2 ] = customAttribute.value[ face.c ];

							offset_custom += 3;

						}

					} else if ( customAttribute.boundTo === "faces" ) {

						for ( f = 0, fl = chunk_faces3.length; f < fl; f ++ ) {

							value = customAttribute.value[ chunk_faces3[ f ] ];

							customAttribute.array[ offset_custom ] 	   = value;
							customAttribute.array[ offset_custom + 1 ] = value;
							customAttribute.array[ offset_custom + 2 ] = value;

							offset_custom += 3;

						}

					}

				} else if ( customAttribute.size === 2 ) {

					if ( customAttribute.boundTo === undefined || customAttribute.boundTo === "vertices" ) {

						for ( f = 0, fl = chunk_faces3.length; f < fl; f ++ ) {

							face = obj_faces[ chunk_faces3[ f ]	];

							v1 = customAttribute.value[ face.a ];
							v2 = customAttribute.value[ face.b ];
							v3 = customAttribute.value[ face.c ];

							customAttribute.array[ offset_custom ] 	   = v1.x;
							customAttribute.array[ offset_custom + 1 ] = v1.y;

							customAttribute.array[ offset_custom + 2 ] = v2.x;
							customAttribute.array[ offset_custom + 3 ] = v2.y;

							customAttribute.array[ offset_custom + 4 ] = v3.x;
							customAttribute.array[ offset_custom + 5 ] = v3.y;

							offset_custom += 6;

						}

					} else if ( customAttribute.boundTo === "faces" ) {

						for ( f = 0, fl = chunk_faces3.length; f < fl; f ++ ) {

							value = customAttribute.value[ chunk_faces3[ f ] ];

							v1 = value;
							v2 = value;
							v3 = value;

							customAttribute.array[ offset_custom ] 	   = v1.x;
							customAttribute.array[ offset_custom + 1 ] = v1.y;

							customAttribute.array[ offset_custom + 2 ] = v2.x;
							customAttribute.array[ offset_custom + 3 ] = v2.y;

							customAttribute.array[ offset_custom + 4 ] = v3.x;
							customAttribute.array[ offset_custom + 5 ] = v3.y;

							offset_custom += 6;

						}

					}

				} else if ( customAttribute.size === 3 ) {

					var pp;

					if ( customAttribute.type === "c" ) {

						pp = [ "r", "g", "b" ];

					} else {

						pp = [ "x", "y", "z" ];

					}

					if ( customAttribute.boundTo === undefined || customAttribute.boundTo === "vertices" ) {

						for ( f = 0, fl = chunk_faces3.length; f < fl; f ++ ) {

							face = obj_faces[ chunk_faces3[ f ]	];

							v1 = customAttribute.value[ face.a ];
							v2 = customAttribute.value[ face.b ];
							v3 = customAttribute.value[ face.c ];

							customAttribute.array[ offset_custom ] 	   = v1[ pp[ 0 ] ];
							customAttribute.array[ offset_custom + 1 ] = v1[ pp[ 1 ] ];
							customAttribute.array[ offset_custom + 2 ] = v1[ pp[ 2 ] ];

							customAttribute.array[ offset_custom + 3 ] = v2[ pp[ 0 ] ];
							customAttribute.array[ offset_custom + 4 ] = v2[ pp[ 1 ] ];
							customAttribute.array[ offset_custom + 5 ] = v2[ pp[ 2 ] ];

							customAttribute.array[ offset_custom + 6 ] = v3[ pp[ 0 ] ];
							customAttribute.array[ offset_custom + 7 ] = v3[ pp[ 1 ] ];
							customAttribute.array[ offset_custom + 8 ] = v3[ pp[ 2 ] ];

							offset_custom += 9;

						}

					} else if ( customAttribute.boundTo === "faces" ) {

						for ( f = 0, fl = chunk_faces3.length; f < fl; f ++ ) {

							value = customAttribute.value[ chunk_faces3[ f ] ];

							v1 = value;
							v2 = value;
							v3 = value;

							customAttribute.array[ offset_custom ] 	   = v1[ pp[ 0 ] ];
							customAttribute.array[ offset_custom + 1 ] = v1[ pp[ 1 ] ];
							customAttribute.array[ offset_custom + 2 ] = v1[ pp[ 2 ] ];

							customAttribute.array[ offset_custom + 3 ] = v2[ pp[ 0 ] ];
							customAttribute.array[ offset_custom + 4 ] = v2[ pp[ 1 ] ];
							customAttribute.array[ offset_custom + 5 ] = v2[ pp[ 2 ] ];

							customAttribute.array[ offset_custom + 6 ] = v3[ pp[ 0 ] ];
							customAttribute.array[ offset_custom + 7 ] = v3[ pp[ 1 ] ];
							customAttribute.array[ offset_custom + 8 ] = v3[ pp[ 2 ] ];

							offset_custom += 9;

						}

					} else if ( customAttribute.boundTo === "faceVertices" ) {

						for ( f = 0, fl = chunk_faces3.length; f < fl; f ++ ) {

							value = customAttribute.value[ chunk_faces3[ f ] ];

							v1 = value[ 0 ];
							v2 = value[ 1 ];
							v3 = value[ 2 ];

							customAttribute.array[ offset_custom ] 	   = v1[ pp[ 0 ] ];
							customAttribute.array[ offset_custom + 1 ] = v1[ pp[ 1 ] ];
							customAttribute.array[ offset_custom + 2 ] = v1[ pp[ 2 ] ];

							customAttribute.array[ offset_custom + 3 ] = v2[ pp[ 0 ] ];
							customAttribute.array[ offset_custom + 4 ] = v2[ pp[ 1 ] ];
							customAttribute.array[ offset_custom + 5 ] = v2[ pp[ 2 ] ];

							customAttribute.array[ offset_custom + 6 ] = v3[ pp[ 0 ] ];
							customAttribute.array[ offset_custom + 7 ] = v3[ pp[ 1 ] ];
							customAttribute.array[ offset_custom + 8 ] = v3[ pp[ 2 ] ];

							offset_custom += 9;

						}

					}

				} else if ( customAttribute.size === 4 ) {

					if ( customAttribute.boundTo === undefined || customAttribute.boundTo === "vertices" ) {

						for ( f = 0, fl = chunk_faces3.length; f < fl; f ++ ) {

							face = obj_faces[ chunk_faces3[ f ]	];

							v1 = customAttribute.value[ face.a ];
							v2 = customAttribute.value[ face.b ];
							v3 = customAttribute.value[ face.c ];

							customAttribute.array[ offset_custom  ] 	= v1.x;
							customAttribute.array[ offset_custom + 1  ] = v1.y;
							customAttribute.array[ offset_custom + 2  ] = v1.z;
							customAttribute.array[ offset_custom + 3  ] = v1.w;

							customAttribute.array[ offset_custom + 4  ] = v2.x;
							customAttribute.array[ offset_custom + 5  ] = v2.y;
							customAttribute.array[ offset_custom + 6  ] = v2.z;
							customAttribute.array[ offset_custom + 7  ] = v2.w;

							customAttribute.array[ offset_custom + 8  ] = v3.x;
							customAttribute.array[ offset_custom + 9  ] = v3.y;
							customAttribute.array[ offset_custom + 10 ] = v3.z;
							customAttribute.array[ offset_custom + 11 ] = v3.w;

							offset_custom += 12;

						}

					} else if ( customAttribute.boundTo === "faces" ) {

						for ( f = 0, fl = chunk_faces3.length; f < fl; f ++ ) {

							value = customAttribute.value[ chunk_faces3[ f ] ];

							v1 = value;
							v2 = value;
							v3 = value;

							customAttribute.array[ offset_custom  ] 	= v1.x;
							customAttribute.array[ offset_custom + 1  ] = v1.y;
							customAttribute.array[ offset_custom + 2  ] = v1.z;
							customAttribute.array[ offset_custom + 3  ] = v1.w;

							customAttribute.array[ offset_custom + 4  ] = v2.x;
							customAttribute.array[ offset_custom + 5  ] = v2.y;
							customAttribute.array[ offset_custom + 6  ] = v2.z;
							customAttribute.array[ offset_custom + 7  ] = v2.w;

							customAttribute.array[ offset_custom + 8  ] = v3.x;
							customAttribute.array[ offset_custom + 9  ] = v3.y;
							customAttribute.array[ offset_custom + 10 ] = v3.z;
							customAttribute.array[ offset_custom + 11 ] = v3.w;

							offset_custom += 12;

						}

					} else if ( customAttribute.boundTo === "faceVertices" ) {

						for ( f = 0, fl = chunk_faces3.length; f < fl; f ++ ) {

							value = customAttribute.value[ chunk_faces3[ f ] ];

							v1 = value[ 0 ];
							v2 = value[ 1 ];
							v3 = value[ 2 ];

							customAttribute.array[ offset_custom  ] 	= v1.x;
							customAttribute.array[ offset_custom + 1  ] = v1.y;
							customAttribute.array[ offset_custom + 2  ] = v1.z;
							customAttribute.array[ offset_custom + 3  ] = v1.w;

							customAttribute.array[ offset_custom + 4  ] = v2.x;
							customAttribute.array[ offset_custom + 5  ] = v2.y;
							customAttribute.array[ offset_custom + 6  ] = v2.z;
							customAttribute.array[ offset_custom + 7  ] = v2.w;

							customAttribute.array[ offset_custom + 8  ] = v3.x;
							customAttribute.array[ offset_custom + 9  ] = v3.y;
							customAttribute.array[ offset_custom + 10 ] = v3.z;
							customAttribute.array[ offset_custom + 11 ] = v3.w;

							offset_custom += 12;

						}

					}

				}

                _gl.bindBuffer( Context3D.ARRAY_BUFFER, customAttribute.buffer );
                _gl.bufferData( Context3D.ARRAY_BUFFER, customAttribute.array.typedArray(), hint );

			}

		}

		if ( dispose ) {

			delete geometryGroup.__inittedArrays;
			delete geometryGroup.__colorArray;
			delete geometryGroup.__normalArray;
			delete geometryGroup.__tangentArray;
			delete geometryGroup.__uvArray;
			delete geometryGroup.__uv2Array;
			delete geometryGroup.__faceArray;
			delete geometryGroup.__vertexArray;
			delete geometryGroup.__lineArray;
			delete geometryGroup.__skinIndexArray;
			delete geometryGroup.__skinWeightArray;

		}

	};

	// used by renderBufferDirect for THREE.Line
	function setupLinesVertexAttributes( material, programAttributes, geometryAttributes, startIndex ) {

		var attributeItem, attributeName, attributePointer, attributeSize;

		for ( attributeName in programAttributes ) {

			attributePointer = programAttributes[ attributeName ];
			attributeItem = geometryAttributes[ attributeName ];
			
			if ( attributePointer >= 0 ) {

				if ( attributeItem ) {

					attributeSize = attributeItem.itemSize;
                    _gl.bindBuffer( Context3D.ARRAY_BUFFER, attributeItem.buffer );
					enableAttribute( attributePointer );
                    _gl.vertexAttribPointer( attributePointer, attributeSize, Context3D.FLOAT, false, 0, startIndex * attributeSize * 4 ); // 4 bytes per Float32

				} else if ( material.defaultAttributeValues ) {

					if ( material.defaultAttributeValues[ attributeName ].length === 2 ) {

						_gl.vertexAttrib2fv( attributePointer, material.defaultAttributeValues[ attributeName ] );

					} else if ( material.defaultAttributeValues[ attributeName ].length === 3 ) {

						_gl.vertexAttrib3fv( attributePointer, material.defaultAttributeValues[ attributeName ] );

					}

				}

			}

		}

	}

	function setDirectBuffers( geometry, hint ) {

		var attributes = geometry.attributes;

		var attributeName, attributeItem;

		for ( attributeName in attributes ) {

			attributeItem = attributes[ attributeName ];

			if ( attributeItem.needsUpdate ) {

				if ( attributeName === 'index' ) {

                    _gl.bindBuffer( Context3D.ELEMENT_ARRAY_BUFFER, attributeItem.buffer );
                    _gl.bufferData( Context3D.ELEMENT_ARRAY_BUFFER, attributeItem.array.typedArray(), hint );

				} else {

                    _gl.bindBuffer( Context3D.ARRAY_BUFFER, attributeItem.buffer );
                    _gl.bufferData( Context3D.ARRAY_BUFFER, attributeItem.array.typedArray(), hint );

				}

				attributeItem.needsUpdate = false;

			}

		}

	}

	// Buffer rendering

	this.renderBufferImmediate = function ( object, program, material ) {
        if (debug_renderer) console.log(renderer_name+".renderBufferImmediate()");

        if ( object.hasPositions && ! object.__webglVertexBuffer ) {
            var vertexBuffer = _gl.createBuffer();
            vertexBuffer.name = "object.__webglVertexBuffer";
            object.__webglVertexBuffer = vertexBuffer;
        }
        if ( object.hasNormals && ! object.__webglNormalBuffer ) {
            var normalBuffer = _gl.createBuffer();
            normalBuffer.name = "object.__webglNormalBuffer";
            object.__webglNormalBuffer = normalBuffer;
        }
        if ( object.hasUvs && ! object.__webglUvBuffer ) {
            var uvBuffer = _gl.createBuffer();
            normalBuffer.name = "object.__webglUvBuffer";
            object.__webglUvBuffer = uvBuffer;
        }
        if ( object.hasColors && ! object.__webglColorBuffer ) {
            var colorBuffer = _gl.createBuffer();
            colorBuffer.name = "object.__webglColorBuffer";
            object.__webglColorBuffer = colorBuffer;
        }

		if ( object.hasPositions ) {

            _gl.bindBuffer( Context3D.ARRAY_BUFFER, object.__webglVertexBuffer );
            _gl.bufferData( Context3D.ARRAY_BUFFER, object.positionArray.typedArray(), Context3D.DYNAMIC_DRAW );
            _gl.enableVertexAttribArray( material.program[PROGRAM_ATTRIBUTES].position );
            _gl.vertexAttribPointer( material.program[PROGRAM_ATTRIBUTES].position, 3, Context3D.FLOAT, false, 0, 0 );

		}
        var aMap = program[PROGRAM_ATTRIBUTES];

		if ( object.hasNormals ) {

            _gl.bindBuffer( Context3D.ARRAY_BUFFER, object.__webglNormalBuffer );

			if ( material.shading === THREE.FlatShading ) {

				var nx, ny, nz,
					nax, nbx, ncx, nay, nby, ncy, naz, nbz, ncz,
					normalArray,
					i, il = object.count * 3;

				for( i = 0; i < il; i += 9 ) {

					normalArray = object.normalArray;

					nax  = normalArray[ i ];
					nay  = normalArray[ i + 1 ];
					naz  = normalArray[ i + 2 ];

					nbx  = normalArray[ i + 3 ];
					nby  = normalArray[ i + 4 ];
					nbz  = normalArray[ i + 5 ];

					ncx  = normalArray[ i + 6 ];
					ncy  = normalArray[ i + 7 ];
					ncz  = normalArray[ i + 8 ];

					nx = ( nax + nbx + ncx ) / 3;
					ny = ( nay + nby + ncy ) / 3;
					nz = ( naz + nbz + ncz ) / 3;

					normalArray[ i ] 	 = nx;
					normalArray[ i + 1 ] = ny;
					normalArray[ i + 2 ] = nz;

					normalArray[ i + 3 ] = nx;
					normalArray[ i + 4 ] = ny;
					normalArray[ i + 5 ] = nz;

					normalArray[ i + 6 ] = nx;
					normalArray[ i + 7 ] = ny;
					normalArray[ i + 8 ] = nz;

				}

			}

            _gl.bufferData( Context3D.ARRAY_BUFFER, object.normalArray.typedArray(), Context3D.DYNAMIC_DRAW );
            _gl.enableVertexAttribArray( aMap.normal );
            _gl.vertexAttribPointer( aMap.normal, 3, Context3D.FLOAT, false, 0, 0 );

		}

		if ( object.hasUvs && material.map ) {

            _gl.bindBuffer( Context3D.ARRAY_BUFFER, object.__webglUvBuffer );
            _gl.bufferData( Context3D.ARRAY_BUFFER, object.uvArray.typedArray(), Context3D.DYNAMIC_DRAW );
            _gl.enableVertexAttribArray( aMap.uv );
            _gl.vertexAttribPointer( aMap.uv, 2, Context3D.FLOAT, false, 0, 0 );

		}

		if ( object.hasColors && material.vertexColors !== THREE.NoColors ) {

            _gl.bindBuffer( Context3D.ARRAY_BUFFER, object.__webglColorBuffer );
            _gl.bufferData( Context3D.ARRAY_BUFFER, object.colorArray.typedArray(), Context3D.DYNAMIC_DRAW );
            _gl.enableVertexAttribArray( aMap.color );
            _gl.vertexAttribPointer( aMap.color, 3, Context3D.FLOAT, false, 0, 0 );

		}

        _gl.drawArrays( Context3D.TRIANGLES, 0, object.count );

		object.count = 0;

	};

	this.renderBufferDirect = function ( camera, lights, fog, material, geometry, object ) {
        if (debug_renderer) console.log(renderer_name+".renderBufferDirect()");
		if ( material.visible === false ) return;

		var linewidth, a, attribute;
		var attributeItem, attributeName, attributePointer, attributeSize;

		var program = setProgram( camera, lights, fog, material, object );

        var programAttributes = program[PROGRAM_ATTRIBUTES];
		var geometryAttributes = geometry.attributes;

		var updateBuffers = false,
			wireframeBit = material.wireframe ? 1 : 0,
            geometryHash = ( geometry.id * 0xffffff ) + ( program[PROGRAM_ID] * 2 ) + wireframeBit;

		if ( geometryHash !== _currentGeometryGroupHash ) {

			_currentGeometryGroupHash = geometryHash;
			updateBuffers = true;

		}

		if ( updateBuffers ) {

			disableAttributes();

		}

		// render mesh

		if ( object instanceof THREE.Mesh ) {

			var index = geometryAttributes[ "index" ];

			// indexed triangles

			if ( index ) {

				var offsets = geometry.offsets;

				// if there is more than 1 chunk
				// must set attribute pointers to use new offsets for each chunk
				// even if geometry and materials didn't change

				if ( offsets.length > 1 ) updateBuffers = true;

				for ( var i = 0, il = offsets.length; i < il; i ++ ) {

					var startIndex = offsets[ i ].index;

					if ( updateBuffers ) {

						for ( attributeName in programAttributes ) {

							attributePointer = programAttributes[ attributeName ];
							attributeItem = geometryAttributes[ attributeName ];

							if ( attributePointer >= 0 ) {

								if ( attributeItem ) {

									attributeSize = attributeItem.itemSize;
                                    _gl.bindBuffer( Context3D.ARRAY_BUFFER, attributeItem.buffer );
									enableAttribute( attributePointer );
                                    _gl.vertexAttribPointer( attributePointer, attributeSize, Context3D.FLOAT, false, 0, startIndex * attributeSize * 4 ); // 4 bytes per Float32

								} else if ( material.defaultAttributeValues ) {

									if ( material.defaultAttributeValues[ attributeName ].length === 2 ) {

										_gl.vertexAttrib2fv( attributePointer, material.defaultAttributeValues[ attributeName ] );

									} else if ( material.defaultAttributeValues[ attributeName ].length === 3 ) {

										_gl.vertexAttrib3fv( attributePointer, material.defaultAttributeValues[ attributeName ] );

									}

								}

							}

						}

						// indices

                        _gl.bindBuffer( Context3D.ELEMENT_ARRAY_BUFFER, index.buffer );

					}

					// render indexed triangles

                    _gl.drawElements( Context3D.TRIANGLES, offsets[ i ].count, Context3D.UNSIGNED_SHORT, offsets[ i ].start * 2 ); // 2 bytes per Uint16

					_this.info.render.calls ++;
					_this.info.render.vertices += offsets[ i ].count; // not really true, here vertices can be shared
					_this.info.render.faces += offsets[ i ].count / 3;

				}

			// non-indexed triangles

			} else {

				if ( updateBuffers ) {

					for ( attributeName in programAttributes ) {

						if ( attributeName === 'index') continue;

						attributePointer = programAttributes[ attributeName ];
						attributeItem = geometryAttributes[ attributeName ];
						
						if ( attributePointer >= 0 ) {

							if ( attributeItem ) {

								attributeSize = attributeItem.itemSize;
                                _gl.bindBuffer( Context3D.ARRAY_BUFFER, attributeItem.buffer );
								enableAttribute( attributePointer );
                                _gl.vertexAttribPointer( attributePointer, attributeSize, Context3D.FLOAT, false, 0, 0 );

							} else if ( material.defaultAttributeValues && material.defaultAttributeValues[ attributeName ] ) {

								if ( material.defaultAttributeValues[ attributeName ].length === 2 ) {

									_gl.vertexAttrib2fv( attributePointer, material.defaultAttributeValues[ attributeName ] );

								} else if ( material.defaultAttributeValues[ attributeName ].length === 3 ) {

									_gl.vertexAttrib3fv( attributePointer, material.defaultAttributeValues[ attributeName ] );

								}

							}

						}

					}

				}

				var position = geometry.attributes[ "position" ];

				// render non-indexed triangles

                _gl.drawArrays( Context3D.TRIANGLES, 0, position.array.length / 3 );

				_this.info.render.calls ++;
				_this.info.render.vertices += position.array.length / 3;
				_this.info.render.faces += position.array.length / 3 / 3;

			}

		// render particles

		} else if ( object instanceof THREE.ParticleSystem ) {

			if ( updateBuffers ) {

				for ( attributeName in programAttributes ) {

					attributePointer = programAttributes[ attributeName ];
					attributeItem = geometryAttributes[ attributeName ];
					
					if ( attributePointer >= 0 ) {

						if ( attributeItem ) {

							attributeSize = attributeItem.itemSize;
                            _gl.bindBuffer( Context3D.ARRAY_BUFFER, attributeItem.buffer );
							enableAttribute( attributePointer );
                            _gl.vertexAttribPointer( attributePointer, attributeSize, Context3D.FLOAT, false, 0, 0 );

						} else if ( material.defaultAttributeValues && material.defaultAttributeValues[ attributeName ] ) {

							if ( material.defaultAttributeValues[ attributeName ].length === 2 ) {

								_gl.vertexAttrib2fv( attributePointer, material.defaultAttributeValues[ attributeName ] );

							} else if ( material.defaultAttributeValues[ attributeName ].length === 3 ) {

								_gl.vertexAttrib3fv( attributePointer, material.defaultAttributeValues[ attributeName ] );

							}

						}

					}

				}

			}

			var position = geometryAttributes[ "position" ];

			// render particles

            _gl.drawArrays( Context3D.POINTS, 0, position.array.length / 3 );

			_this.info.render.calls ++;
			_this.info.render.points += position.array.length / 3;

		} else if ( object instanceof THREE.Line ) {

            var primitives = ( object.type === THREE.LineStrip ) ? Context3D.LINE_STRIP : Context3D.LINES;

			setLineWidth( material.linewidth );

			var index = geometryAttributes[ "index" ];

			// indexed lines
			
			if ( index ) {

				var offsets = geometry.offsets;

				// if there is more than 1 chunk
				// must set attribute pointers to use new offsets for each chunk
				// even if geometry and materials didn't change

				if ( offsets.length > 1 ) updateBuffers = true;

				for ( var i = 0, il = offsets.length; i < il; i ++ ) {

					var startIndex = offsets[ i ].index;

					if ( updateBuffers ) {

						setupLinesVertexAttributes(material, programAttributes, geometryAttributes, startIndex);

						// indices
                        _gl.bindBuffer( Context3D.ELEMENT_ARRAY_BUFFER, index.buffer );

					}

					// render indexed lines

                    _gl.drawElements( Context3D.LINES, offsets[ i ].count, Context3D.UNSIGNED_SHORT, offsets[ i ].start * 2 ); // 2 bytes per Uint16Array

					_this.info.render.calls ++;
					_this.info.render.vertices += offsets[ i ].count; // not really true, here vertices can be shared

				}

			}

			// non-indexed lines

			else {

				if ( updateBuffers ) {

					setupLinesVertexAttributes(material, programAttributes, geometryAttributes, 0);
				}

				var position = geometryAttributes[ "position" ];

				_gl.drawArrays( primitives, 0, position.array.length / 3 );
				_this.info.render.calls ++;
				_this.info.render.points += position.array.length;
			}



		}

	};

	this.renderBuffer = function ( camera, lights, fog, material, geometryGroup, object ) {
        if (debug_renderer) console.log(renderer_name+".renderBuffer()");

		if ( material.visible === false ) return;

		var linewidth, a, attribute, i, il;

		var program = setProgram( camera, lights, fog, material, object );

        var attributes = program[PROGRAM_ATTRIBUTES];

		var updateBuffers = false,
			wireframeBit = material.wireframe ? 1 : 0,
            geometryGroupHash = ( geometryGroup.id * 0xffffff ) + ( program[PROGRAM_ID] * 2 ) + wireframeBit;

		if ( geometryGroupHash !== _currentGeometryGroupHash ) {

			_currentGeometryGroupHash = geometryGroupHash;
			updateBuffers = true;

		}

		if ( updateBuffers ) {

			disableAttributes();

		}

		// vertices

		if ( !material.morphTargets && attributes.position >= 0 ) {

			if ( updateBuffers ) {

                _gl.bindBuffer( Context3D.ARRAY_BUFFER, geometryGroup.__webglVertexBuffer );
				enableAttribute( attributes.position );
                _gl.vertexAttribPointer( attributes.position, 3, Context3D.FLOAT, false, 0, 0 );

			}

		} else {

			if ( object.morphTargetBase ) {

				setupMorphTargets( material, geometryGroup, object );

			}

		}


		if ( updateBuffers ) {

			// custom attributes

			// Use the per-geometryGroup custom attribute arrays which are setup in initMeshBuffers

			if ( geometryGroup.__webglCustomAttributesList ) {

				for ( i = 0, il = geometryGroup.__webglCustomAttributesList.length; i < il; i ++ ) {

					attribute = geometryGroup.__webglCustomAttributesList[ i ];

                    if ( attributes[ attribute.buffer[BUFFER_BELONGS_TO_ATTRIBUTE] ] >= 0 ) {

                        _gl.bindBuffer( Context3D.ARRAY_BUFFER, attribute.buffer );
                        enableAttribute( attributes[ attribute.buffer[BUFFER_BELONGS_TO_ATTRIBUTE] ] );
                        _gl.vertexAttribPointer( attributes[ attribute.buffer[BUFFER_BELONGS_TO_ATTRIBUTE] ], attribute.size, Context3D.FLOAT, false, 0, 0 );

					}

				}

			}


			// colors

			if ( attributes.color >= 0 ) {

				if ( object.geometry.colors.length > 0 || object.geometry.faces.length > 0 ) {

                    _gl.bindBuffer( Context3D.ARRAY_BUFFER, geometryGroup.__webglColorBuffer );
					enableAttribute( attributes.color );
                    _gl.vertexAttribPointer( attributes.color, 3, Context3D.FLOAT, false, 0, 0 );

				} else if ( material.defaultAttributeValues ) {


					_gl.vertexAttrib3fv( attributes.color, material.defaultAttributeValues.color );

				}

			}

			// normals

			if ( attributes.normal >= 0 ) {

                _gl.bindBuffer( Context3D.ARRAY_BUFFER, geometryGroup.__webglNormalBuffer );
				enableAttribute( attributes.normal );
                _gl.vertexAttribPointer( attributes.normal, 3, Context3D.FLOAT, false, 0, 0 );

			}

			// tangents

			if ( attributes.tangent >= 0 ) {

                _gl.bindBuffer( Context3D.ARRAY_BUFFER, geometryGroup.__webglTangentBuffer );
				enableAttribute( attributes.tangent );
                _gl.vertexAttribPointer( attributes.tangent, 4, Context3D.FLOAT, false, 0, 0 );

			}

			// uvs

			if ( attributes.uv >= 0 ) {

				if ( object.geometry.faceVertexUvs[0] ) {

                    _gl.bindBuffer( Context3D.ARRAY_BUFFER, geometryGroup.__webglUVBuffer );
					enableAttribute( attributes.uv );
                    _gl.vertexAttribPointer( attributes.uv, 2, Context3D.FLOAT, false, 0, 0 );

				} else if ( material.defaultAttributeValues ) {


					_gl.vertexAttrib2fv( attributes.uv, material.defaultAttributeValues.uv );

				}

			}

			if ( attributes.uv2 >= 0 ) {

				if ( object.geometry.faceVertexUvs[1] ) {

                    _gl.bindBuffer( Context3D.ARRAY_BUFFER, geometryGroup.__webglUV2Buffer );
					enableAttribute( attributes.uv2 );
                    _gl.vertexAttribPointer( attributes.uv2, 2, Context3D.FLOAT, false, 0, 0 );

				} else if ( material.defaultAttributeValues ) {


					_gl.vertexAttrib2fv( attributes.uv2, material.defaultAttributeValues.uv2 );

				}

			}

			if ( material.skinning &&
				 attributes.skinIndex >= 0 && attributes.skinWeight >= 0 ) {

                _gl.bindBuffer( Context3D.ARRAY_BUFFER, geometryGroup.__webglSkinIndicesBuffer );
				enableAttribute( attributes.skinIndex );
                _gl.vertexAttribPointer( attributes.skinIndex, 4, Context3D.FLOAT, false, 0, 0 );

                _gl.bindBuffer( Context3D.ARRAY_BUFFER, geometryGroup.__webglSkinWeightsBuffer );
				enableAttribute( attributes.skinWeight );
                _gl.vertexAttribPointer( attributes.skinWeight, 4, Context3D.FLOAT, false, 0, 0 );

			}

			// line distances

			if ( attributes.lineDistance >= 0 ) {

                _gl.bindBuffer( Context3D.ARRAY_BUFFER, geometryGroup.__webglLineDistanceBuffer );
				enableAttribute( attributes.lineDistance );
                _gl.vertexAttribPointer( attributes.lineDistance, 1, Context3D.FLOAT, false, 0, 0 );

			}

		}

		// render mesh

		if ( object instanceof THREE.Mesh ) {

			// wireframe

			if ( material.wireframe ) {

				setLineWidth( material.wireframeLinewidth );

                if ( updateBuffers ) _gl.bindBuffer( Context3D.ELEMENT_ARRAY_BUFFER, geometryGroup.__webglLineBuffer );
                _gl.drawElements( Context3D.LINES, geometryGroup.__webglLineCount, Context3D.UNSIGNED_SHORT, 0 );

			// triangles

			} else {

                if ( updateBuffers ) _gl.bindBuffer( Context3D.ELEMENT_ARRAY_BUFFER, geometryGroup.__webglFaceBuffer );
                _gl.drawElements( Context3D.TRIANGLES, geometryGroup.__webglFaceCount, Context3D.UNSIGNED_SHORT, 0 );

			}

			_this.info.render.calls ++;
			_this.info.render.vertices += geometryGroup.__webglFaceCount;
			_this.info.render.faces += geometryGroup.__webglFaceCount / 3;

		// render lines

		} else if ( object instanceof THREE.Line ) {

            var primitives = ( object.type === THREE.LineStrip ) ? Context3D.LINE_STRIP : Context3D.LINES;

			setLineWidth( material.linewidth );

			_gl.drawArrays( primitives, 0, geometryGroup.__webglLineCount );

			_this.info.render.calls ++;

		// render particles

		} else if ( object instanceof THREE.ParticleSystem ) {

            _gl.drawArrays( Context3D.POINTS, 0, geometryGroup.__webglParticleCount );

			_this.info.render.calls ++;
			_this.info.render.points += geometryGroup.__webglParticleCount;

		}

	};

	function enableAttribute( attribute ) {
		if ( _enabledAttributes[ attribute ] === 0 ) {

			_gl.enableVertexAttribArray( attribute );
			_enabledAttributes[ attribute ] = 1;

		}

	};

	function disableAttributes() {

		for ( var attribute in _enabledAttributes ) {

			if ( _enabledAttributes[ attribute ] === 1 ) {

				_gl.disableVertexAttribArray( attribute );
				_enabledAttributes[ attribute ] = 0;

			}

		}

	};

	function setupMorphTargets ( material, geometryGroup, object ) {
        if (debug_renderer) console.log(renderer_name+".setupMorphTargets()");
		// set base

        var attributes = material.program[PROGRAM_ATTRIBUTES];

		if ( object.morphTargetBase !== -1 && attributes.position >= 0 ) {
            if (debug_renderer) console.log(renderer_name+".setupMorphTargets() object.morphTargetBase !== -1 && attributes.position >= 0");
            _gl.bindBuffer( Context3D.ARRAY_BUFFER, geometryGroup.__webglMorphTargetsBuffers[ object.morphTargetBase ] );
			enableAttribute( attributes.position );
            _gl.vertexAttribPointer( attributes.position, 3, Context3D.FLOAT, false, 0, 0 );

		} else if ( attributes.position >= 0 ) {
            if (debug_renderer) console.log(renderer_name+".setupMorphTargets() attributes.position >= 0");
            _gl.bindBuffer( Context3D.ARRAY_BUFFER, geometryGroup.__webglVertexBuffer );
			enableAttribute( attributes.position );
            _gl.vertexAttribPointer( attributes.position, 3, Context3D.FLOAT, false, 0, 0 );

		}

		if ( object.morphTargetForcedOrder.length ) {
            if (debug_renderer) console.log(renderer_name+".setupMorphTargets() object.morphTargetForcedOrder.length = "+object.morphTargetForcedOrder.length);
            // set forced order

			var m = 0;
			var order = object.morphTargetForcedOrder;
			var influences = object.morphTargetInfluences;

			while ( m < material.numSupportedMorphTargets && m < order.length ) {

				if ( attributes[ "morphTarget" + m ] >= 0 ) {

                    _gl.bindBuffer( Context3D.ARRAY_BUFFER, geometryGroup.__webglMorphTargetsBuffers[ order[ m ] ] );
					enableAttribute( attributes[ "morphTarget" + m ] );
                    _gl.vertexAttribPointer( attributes[ "morphTarget" + m ], 3, Context3D.FLOAT, false, 0, 0 );

				}

				if ( attributes[ "morphNormal" + m ] >= 0 && material.morphNormals ) {

                    _gl.bindBuffer( Context3D.ARRAY_BUFFER, geometryGroup.__webglMorphNormalsBuffers[ order[ m ] ] );
					enableAttribute( attributes[ "morphNormal" + m ] );
                    _gl.vertexAttribPointer( attributes[ "morphNormal" + m ], 3, Context3D.FLOAT, false, 0, 0 );

				}

                object.__webglMorphTargetInfluences[ m ] = influences[ order[ m ] ];

				m ++;
			}

		} else {

			// find the most influencing
            if (debug_renderer) console.log(renderer_name+".setupMorphTargets() find the most influencing ");

			var influence, activeInfluenceIndices = [];
			var influences = object.morphTargetInfluences;
			var i, il = influences.length;

			for ( i = 0; i < il; i ++ ) {

				influence = influences[ i ];
				if ( influence > 0 ) {
                    if (debug_renderer) console.log(renderer_name+".setupMorphTargets() activeInfluenceIndices.push(influence:"+influence+", i:"+i+")");
                    activeInfluenceIndices.push( [ influence, i ] );

				}

			}

			if ( activeInfluenceIndices.length > material.numSupportedMorphTargets ) {

				activeInfluenceIndices.sort( numericalSort );
				activeInfluenceIndices.length = material.numSupportedMorphTargets;

			} else if ( activeInfluenceIndices.length > material.numSupportedMorphNormals ) {

				activeInfluenceIndices.sort( numericalSort );

			} else if ( activeInfluenceIndices.length === 0 ) {

				activeInfluenceIndices.push( [ 0, 0 ] );

			};

			var influenceIndex, m = 0;

			while ( m < material.numSupportedMorphTargets ) {

				if ( activeInfluenceIndices[ m ] ) {

					influenceIndex = activeInfluenceIndices[ m ][ 1 ];
                    console.log("Morph target "+m);
                    if ( attributes[ "morphTarget" + m ] >= 0 ) {
                        console.log("Enabling attribute for morph target "+m);
                        enableAttribute( attributes[ "morphTarget" + m ] );
                        _gl.bindBuffer( Context3D.ARRAY_BUFFER, geometryGroup.__webglMorphTargetsBuffers[ influenceIndex ] );
                        _gl.vertexAttribPointer( attributes[ "morphTarget" + m ], 3, Context3D.FLOAT, false, 0, 0 );

					}

					if ( attributes[ "morphNormal" + m ] >= 0 && material.morphNormals ) {

                        enableAttribute( attributes[ "morphNormal" + m ] );
                        _gl.bindBuffer( Context3D.ARRAY_BUFFER, geometryGroup.__webglMorphNormalsBuffers[ influenceIndex ] );
                        _gl.vertexAttribPointer( attributes[ "morphNormal" + m ], 3, Context3D.FLOAT, false, 0, 0 );

					}

					object.__webglMorphTargetInfluences[ m ] = influences[ influenceIndex ];

				} else {

					/*
                    _gl.vertexAttribPointer( attributes[ "morphTarget" + m ], 3, Context3D.FLOAT, false, 0, 0 );

					if ( material.morphNormals ) {

                        _gl.vertexAttribPointer( attributes[ "morphNormal" + m ], 3, Context3D.FLOAT, false, 0, 0 );

					}
					*/

					object.__webglMorphTargetInfluences[ m ] = 0;

				}

				m ++;

			}

		}

		// load updated influences uniform
        var morphTargetInfluences = material.program[PROGRAM_UNIFORMS].morphTargetInfluences;
        console.log("morphTargetInfluences "+morphTargetInfluences);
        if ( morphTargetInfluences !== null ) {
            object.__webglMorphTargetInfluences.print();
            _gl.uniform1fv( morphTargetInfluences, object.__webglMorphTargetInfluences.typedArray() );
		}

	};

	// Sorting

	function painterSortStable ( a, b ) {

		if ( a.z !== b.z ) {

			return b.z - a.z;

		} else {

			return a.id - b.id;

		}

	};

	function numericalSort ( a, b ) {

		return b[ 0 ] - a[ 0 ];

	};


	// Rendering

	this.render = function ( scene, camera, renderTarget, forceClear ) {
        if (debug_renderer) console.log(renderer_name+".render() enter");
        if ( camera instanceof THREE.Camera === false ) {

            console.error( 'THREE.Canvas3DRenderer.render: camera is not an instance of THREE.Camera.' );
			return;

		}

		var i, il,

		webglObject, object,
		renderList,

		lights = scene.__lights,
		fog = scene.fog;

		// reset caching for this frame

		_currentMaterialId = -1;
		_lightsNeedUpdate = true;

		// update scene graph

		if ( scene.autoUpdate === true ) scene.updateMatrixWorld();

		// update camera matrices and frustum

		if ( camera.parent === undefined ) camera.updateMatrixWorld();

		camera.matrixWorldInverse.getInverse( camera.matrixWorld );

		_projScreenMatrix.multiplyMatrices( camera.projectionMatrix, camera.matrixWorldInverse );
		_frustum.setFromMatrix( _projScreenMatrix );

		// update WebGL objects

		if ( this.autoUpdateObjects ) this.initWebGLObjects( scene );

		// custom render plugins (pre pass)
        if (debug_renderer) console.log(renderer_name+".render renderPlugins(renderPluginsPre)");
        renderPlugins( this.renderPluginsPre, scene, camera );

		//

		_this.info.render.calls = 0;
		_this.info.render.vertices = 0;
		_this.info.render.faces = 0;
		_this.info.render.points = 0;

		this.setRenderTarget( renderTarget );

		if ( this.autoClear || forceClear ) {

			this.clear( this.autoClearColor, this.autoClearDepth, this.autoClearStencil );

		}

		// set matrices for regular objects (frustum culled)

		renderList = scene.__webglObjects;

        if (debug_renderer) console.log(renderer_name+".render renderList");
        for ( i = 0, il = renderList.length; i < il; i ++ ) {

			webglObject = renderList[ i ];
			object = webglObject.object;

			webglObject.id = i;
			webglObject.render = false;

			if ( object.visible ) {

				if ( ! ( object instanceof THREE.Mesh || object instanceof THREE.ParticleSystem ) || ! ( object.frustumCulled ) || _frustum.intersectsObject( object ) ) {

					setupMatrices( object, camera );

					unrollBufferMaterial( webglObject );

					webglObject.render = true;

					if ( this.sortObjects === true ) {

						if ( object.renderDepth !== null ) {

							webglObject.z = object.renderDepth;

						} else {

							_vector3.setFromMatrixPosition( object.matrixWorld );
							_vector3.applyProjection( _projScreenMatrix );

							webglObject.z = _vector3.z;

						}

					}

				}

			}

		}

        if ( this.sortObjects ) {
            if (debug_renderer) console.log(renderer_name+".render renderList.sort()");
            renderList.sort( painterSortStable );

		}

		// set matrices for immediate objects

		renderList = scene.__webglObjectsImmediate;

		for ( i = 0, il = renderList.length; i < il; i ++ ) {

			webglObject = renderList[ i ];
			object = webglObject.object;

			if ( object.visible ) {

				setupMatrices( object, camera );

				unrollImmediateBufferMaterial( webglObject );

			}

		}

		if ( scene.overrideMaterial ) {

			var material = scene.overrideMaterial;

			this.setBlending( material.blending, material.blendEquation, material.blendSrc, material.blendDst );
			this.setDepthTest( material.depthTest );
			this.setDepthWrite( material.depthWrite );
			setPolygonOffset( material.polygonOffset, material.polygonOffsetFactor, material.polygonOffsetUnits );

			renderObjects( scene.__webglObjects, false, "", camera, lights, fog, true, material );
			renderObjectsImmediate( scene.__webglObjectsImmediate, "", camera, lights, fog, false, material );

		} else {

			var material = null;

			// opaque pass (front-to-back order)

			this.setBlending( THREE.NoBlending );

			renderObjects( scene.__webglObjects, true, "opaque", camera, lights, fog, false, material );
			renderObjectsImmediate( scene.__webglObjectsImmediate, "opaque", camera, lights, fog, false, material );

			// transparent pass (back-to-front order)

			renderObjects( scene.__webglObjects, false, "transparent", camera, lights, fog, true, material );
			renderObjectsImmediate( scene.__webglObjectsImmediate, "transparent", camera, lights, fog, true, material );

		}

		// custom render plugins (post pass)

        if (debug_renderer) console.log(renderer_name+".render renderPlugins(renderPluginsPost)");
        renderPlugins( this.renderPluginsPost, scene, camera );


		// Generate mipmap if we're using any kind of mipmap filtering

		if ( renderTarget && renderTarget.generateMipmaps && renderTarget.minFilter !== THREE.NearestFilter && renderTarget.minFilter !== THREE.LinearFilter ) {

			updateRenderTargetMipmap( renderTarget );

		}

		// Ensure depth buffer writing is enabled so it can be cleared on next render

		this.setDepthTest( true );
		this.setDepthWrite( true );

		// _gl.finish();
        if (debug_renderer) console.log(renderer_name+".render() exit");
	};

	function renderPlugins( plugins, scene, camera ) {

		if ( ! plugins.length ) return;

		for ( var i = 0, il = plugins.length; i < il; i ++ ) {

			// reset state for plugin (to start from clean slate)

			_currentProgram = null;
			_currentCamera = null;

			_oldBlending = -1;
			_oldDepthTest = -1;
			_oldDepthWrite = -1;
			_oldDoubleSided = -1;
			_oldFlipSided = -1;
			_currentGeometryGroupHash = -1;
			_currentMaterialId = -1;

			_lightsNeedUpdate = true;

			plugins[ i ].render( scene, camera, _currentWidth, _currentHeight );

			// reset state after plugin (anything could have changed)

			_currentProgram = null;
			_currentCamera = null;

			_oldBlending = -1;
			_oldDepthTest = -1;
			_oldDepthWrite = -1;
			_oldDoubleSided = -1;
			_oldFlipSided = -1;
			_currentGeometryGroupHash = -1;
			_currentMaterialId = -1;

			_lightsNeedUpdate = true;

		}

	};

	function renderObjects( renderList, reverse, materialType, camera, lights, fog, useBlending, overrideMaterial ) {
        if (debug_renderer) console.log(renderer_name+".renderObjects() enter");
		var webglObject, object, buffer, material, start, end, delta;

		if ( reverse ) {

			start = renderList.length - 1;
			end = -1;
			delta = -1;

		} else {

			start = 0;
			end = renderList.length;
			delta = 1;
		}

		for ( var i = start; i !== end; i += delta ) {

			webglObject = renderList[ i ];

			if ( webglObject.render ) {

				object = webglObject.object;
				buffer = webglObject.buffer;

				if ( overrideMaterial ) {

					material = overrideMaterial;

				} else {

					material = webglObject[ materialType ];

					if ( ! material ) continue;

					if ( useBlending ) _this.setBlending( material.blending, material.blendEquation, material.blendSrc, material.blendDst );

					_this.setDepthTest( material.depthTest );
					_this.setDepthWrite( material.depthWrite );
					setPolygonOffset( material.polygonOffset, material.polygonOffsetFactor, material.polygonOffsetUnits );

				}

				_this.setMaterialFaces( material );

				if ( buffer instanceof THREE.BufferGeometry ) {

					_this.renderBufferDirect( camera, lights, fog, material, buffer, object );

				} else {

					_this.renderBuffer( camera, lights, fog, material, buffer, object );

				}

			}

		}

	};

	function renderObjectsImmediate ( renderList, materialType, camera, lights, fog, useBlending, overrideMaterial ) {
        if (debug_renderer) console.log(renderer_name+".renderObjectsImmediate() enter");
		var webglObject, object, material, program;

		for ( var i = 0, il = renderList.length; i < il; i ++ ) {

			webglObject = renderList[ i ];
			object = webglObject.object;

			if ( object.visible ) {

				if ( overrideMaterial ) {

					material = overrideMaterial;

				} else {

					material = webglObject[ materialType ];

					if ( ! material ) continue;

					if ( useBlending ) _this.setBlending( material.blending, material.blendEquation, material.blendSrc, material.blendDst );

					_this.setDepthTest( material.depthTest );
					_this.setDepthWrite( material.depthWrite );
					setPolygonOffset( material.polygonOffset, material.polygonOffsetFactor, material.polygonOffsetUnits );

				}

				_this.renderImmediateObject( camera, lights, fog, material, object );

			}

		}

	};

	this.renderImmediateObject = function ( camera, lights, fog, material, object ) {
        if (debug_renderer) console.log(renderer_name+".renderImmediateObject() enter");
		var program = setProgram( camera, lights, fog, material, object );

		_currentGeometryGroupHash = -1;

		_this.setMaterialFaces( material );

		if ( object.immediateRenderCallback ) {

			object.immediateRenderCallback( program, _gl, _frustum );

		} else {

			object.render( function( object ) { _this.renderBufferImmediate( object, program, material ); } );

		}

	};

	function unrollImmediateBufferMaterial ( globject ) {
        if (debug_renderer) console.log(renderer_name+".unrollImmediateBufferMaterial() enter");
		var object = globject.object,
			material = object.material;

		if ( material.transparent ) {

			globject.transparent = material;
			globject.opaque = null;

		} else {

			globject.opaque = material;
			globject.transparent = null;

		}

	};

	function unrollBufferMaterial ( globject ) {
        if (debug_renderer) console.log(renderer_name+".unrollBufferMaterial() enter");
		var object = globject.object;
		var buffer = globject.buffer;

		var geometry = object.geometry;
		var material = object.material;

		if ( material instanceof THREE.MeshFaceMaterial ) {

			var materialIndex = geometry instanceof THREE.BufferGeometry ? 0 : buffer.materialIndex;

			material = material.materials[ materialIndex ];

			if ( material.transparent ) {

				globject.transparent = material;
				globject.opaque = null;

			} else {

				globject.opaque = material;
				globject.transparent = null;

			}

		} else {

			if ( material ) {

				if ( material.transparent ) {

					globject.transparent = material;
					globject.opaque = null;

				} else {

					globject.opaque = material;
					globject.transparent = null;

				}

			}

		}

	};

	// Objects refresh

	this.initWebGLObjects = function ( scene ) {
        if (debug_renderer) console.log(renderer_name+".initWebGLObjects() enter");
		if ( !scene.__webglObjects ) {

			scene.__webglObjects = [];
			scene.__webglObjectsImmediate = [];
			scene.__webglSprites = [];
			scene.__webglFlares = [];

		}

		while ( scene.__objectsAdded.length ) {

			addObject( scene.__objectsAdded[ 0 ], scene );
			scene.__objectsAdded.splice( 0, 1 );

		}

		while ( scene.__objectsRemoved.length ) {

			removeObject( scene.__objectsRemoved[ 0 ], scene );
			scene.__objectsRemoved.splice( 0, 1 );

		}

		// update must be called after objects adding / removal

		for ( var o = 0, ol = scene.__webglObjects.length; o < ol; o ++ ) {

			var object = scene.__webglObjects[ o ].object;

            // TODO: Remove this hack (Canvas3DRenderer refactoring)

			if ( object.__webglInit === undefined ) {

				if ( object.__webglActive !== undefined ) {

					removeObject( object, scene );

				}

				addObject( object, scene );

			}

			updateObject( object );

		}

	};

	// Objects adding

	function addObject( object, scene ) {

		var g, geometry, material, geometryGroup;

		if ( object.__webglInit === undefined ) {

			object.__webglInit = true;

			object._modelViewMatrix = new THREE.Matrix4();
			object._normalMatrix = new THREE.Matrix3();

			if ( object.geometry !== undefined && object.geometry.__webglInit === undefined ) {

				object.geometry.__webglInit = true;
				object.geometry.addEventListener( 'dispose', onGeometryDispose );

			}

			geometry = object.geometry;

			if ( geometry === undefined ) {

				// fail silently for now

			} else if ( geometry instanceof THREE.BufferGeometry ) {

				initDirectBuffers( geometry );

			} else if ( object instanceof THREE.Mesh ) {

				material = object.material;

				if ( geometry.geometryGroups === undefined ) {

					geometry.makeGroups( material instanceof THREE.MeshFaceMaterial );

				}

				// create separate VBOs per geometry chunk

				for ( g in geometry.geometryGroups ) {

					geometryGroup = geometry.geometryGroups[ g ];

					// initialise VBO on the first access

					if ( ! geometryGroup.__webglVertexBuffer ) {

						createMeshBuffers( geometryGroup );
						initMeshBuffers( geometryGroup, object );

						geometry.verticesNeedUpdate = true;
						geometry.morphTargetsNeedUpdate = true;
						geometry.elementsNeedUpdate = true;
						geometry.uvsNeedUpdate = true;
						geometry.normalsNeedUpdate = true;
						geometry.tangentsNeedUpdate = true;
						geometry.colorsNeedUpdate = true;

					}

				}

			} else if ( object instanceof THREE.Line ) {

				if ( ! geometry.__webglVertexBuffer ) {

					createLineBuffers( geometry );
					initLineBuffers( geometry, object );

					geometry.verticesNeedUpdate = true;
					geometry.colorsNeedUpdate = true;
					geometry.lineDistancesNeedUpdate = true;

				}

			} else if ( object instanceof THREE.ParticleSystem ) {

				if ( ! geometry.__webglVertexBuffer ) {

					createParticleBuffers( geometry );
					initParticleBuffers( geometry, object );

					geometry.verticesNeedUpdate = true;
					geometry.colorsNeedUpdate = true;

				}

			}

		}

		if ( object.__webglActive === undefined ) {

			if ( object instanceof THREE.Mesh ) {

				geometry = object.geometry;

				if ( geometry instanceof THREE.BufferGeometry ) {

					addBuffer( scene.__webglObjects, geometry, object );

				} else if ( geometry instanceof THREE.Geometry ) {

					for ( g in geometry.geometryGroups ) {

						geometryGroup = geometry.geometryGroups[ g ];

						addBuffer( scene.__webglObjects, geometryGroup, object );

					}

				}

			} else if ( object instanceof THREE.Line ||
						object instanceof THREE.ParticleSystem ) {

				geometry = object.geometry;
				addBuffer( scene.__webglObjects, geometry, object );

			} else if ( object instanceof THREE.ImmediateRenderObject || object.immediateRenderCallback ) {

				addBufferImmediate( scene.__webglObjectsImmediate, object );

			} else if ( object instanceof THREE.Sprite ) {

				scene.__webglSprites.push( object );

			} else if ( object instanceof THREE.LensFlare ) {

				scene.__webglFlares.push( object );

			}

			object.__webglActive = true;

		}

	};

	function addBuffer( objlist, buffer, object ) {
        if (debug_renderer) console.log(renderer_name+".addBuffer() enter");
		objlist.push(
			{
				id: null,
				buffer: buffer,
				object: object,
				opaque: null,
				transparent: null,
				z: 0
			}
		);

	};

	function addBufferImmediate( objlist, object ) {
        if (debug_renderer) console.log(renderer_name+".addBufferImmediate() enter");
        objlist.push(
			{
				id: null,
				object: object,
				opaque: null,
				transparent: null,
				z: 0
			}
		);

	};

	// Objects updates

	function updateObject( object ) {
        if (debug_renderer) console.log(renderer_name+".updateObject() enter");
        var geometry = object.geometry,
			geometryGroup, customAttributesDirty, material;

		if ( geometry instanceof THREE.BufferGeometry ) {

            setDirectBuffers( geometry, Context3D.DYNAMIC_DRAW );

		} else if ( object instanceof THREE.Mesh ) {

			// check all geometry groups

			for( var i = 0, il = geometry.geometryGroupsList.length; i < il; i ++ ) {

				geometryGroup = geometry.geometryGroupsList[ i ];

				material = getBufferMaterial( object, geometryGroup );

				if ( geometry.buffersNeedUpdate ) {

					initMeshBuffers( geometryGroup, object );

				}

				customAttributesDirty = material.attributes && areCustomAttributesDirty( material );

				if ( geometry.verticesNeedUpdate || geometry.morphTargetsNeedUpdate || geometry.elementsNeedUpdate ||
					 geometry.uvsNeedUpdate || geometry.normalsNeedUpdate ||
					 geometry.colorsNeedUpdate || geometry.tangentsNeedUpdate || customAttributesDirty ) {

                    setMeshBuffers( geometryGroup, object, Context3D.DYNAMIC_DRAW, !geometry.dynamic, material );

				}

			}

			geometry.verticesNeedUpdate = false;
			geometry.morphTargetsNeedUpdate = false;
			geometry.elementsNeedUpdate = false;
			geometry.uvsNeedUpdate = false;
			geometry.normalsNeedUpdate = false;
			geometry.colorsNeedUpdate = false;
			geometry.tangentsNeedUpdate = false;

			geometry.buffersNeedUpdate = false;

			material.attributes && clearCustomAttributes( material );

		} else if ( object instanceof THREE.Line ) {

			material = getBufferMaterial( object, geometry );

			customAttributesDirty = material.attributes && areCustomAttributesDirty( material );

			if ( geometry.verticesNeedUpdate || geometry.colorsNeedUpdate || geometry.lineDistancesNeedUpdate || customAttributesDirty ) {

                setLineBuffers( geometry, Context3D.DYNAMIC_DRAW );

			}

			geometry.verticesNeedUpdate = false;
			geometry.colorsNeedUpdate = false;
			geometry.lineDistancesNeedUpdate = false;

			material.attributes && clearCustomAttributes( material );


		} else if ( object instanceof THREE.ParticleSystem ) {

			material = getBufferMaterial( object, geometry );

			customAttributesDirty = material.attributes && areCustomAttributesDirty( material );

			if ( geometry.verticesNeedUpdate || geometry.colorsNeedUpdate || object.sortParticles || customAttributesDirty ) {

                setParticleBuffers( geometry, Context3D.DYNAMIC_DRAW, object );

			}

			geometry.verticesNeedUpdate = false;
			geometry.colorsNeedUpdate = false;

			material.attributes && clearCustomAttributes( material );

		}

	};

	// Objects updates - custom attributes check

	function areCustomAttributesDirty( material ) {

		for ( var a in material.attributes ) {

			if ( material.attributes[ a ].needsUpdate ) return true;

		}

		return false;

	};

	function clearCustomAttributes( material ) {

		for ( var a in material.attributes ) {

			material.attributes[ a ].needsUpdate = false;

		}

	};

	// Objects removal

	function removeObject( object, scene ) {

		if ( object instanceof THREE.Mesh  ||
			 object instanceof THREE.ParticleSystem ||
			 object instanceof THREE.Line ) {

			removeInstances( scene.__webglObjects, object );

		} else if ( object instanceof THREE.Sprite ) {

			removeInstancesDirect( scene.__webglSprites, object );

		} else if ( object instanceof THREE.LensFlare ) {

			removeInstancesDirect( scene.__webglFlares, object );

		} else if ( object instanceof THREE.ImmediateRenderObject || object.immediateRenderCallback ) {

			removeInstances( scene.__webglObjectsImmediate, object );

		}

		delete object.__webglActive;

	};

	function removeInstances( objlist, object ) {

		for ( var o = objlist.length - 1; o >= 0; o -- ) {

			if ( objlist[ o ].object === object ) {

				objlist.splice( o, 1 );

			}

		}

	};

	function removeInstancesDirect( objlist, object ) {

		for ( var o = objlist.length - 1; o >= 0; o -- ) {

			if ( objlist[ o ] === object ) {

				objlist.splice( o, 1 );

			}

		}

	};

	// Materials

	this.initMaterial = function ( material, lights, fog, object ) {
        if (debug_renderer) console.log(renderer_name+".initMaterial("+material+") enter");
		material.addEventListener( 'dispose', onMaterialDispose );

		var u, a, identifiers, i, parameters, maxLightCount, maxBones, maxShadows, shaderID;

		if ( material instanceof THREE.MeshDepthMaterial ) {

			shaderID = 'depth';

		} else if ( material instanceof THREE.MeshNormalMaterial ) {

			shaderID = 'normal';

		} else if ( material instanceof THREE.MeshBasicMaterial ) {

			shaderID = 'basic';

		} else if ( material instanceof THREE.MeshLambertMaterial ) {

			shaderID = 'lambert';

		} else if ( material instanceof THREE.MeshPhongMaterial ) {

			shaderID = 'phong';

		} else if ( material instanceof THREE.LineBasicMaterial ) {

			shaderID = 'basic';

		} else if ( material instanceof THREE.LineDashedMaterial ) {

			shaderID = 'dashed';

		} else if ( material instanceof THREE.ParticleSystemMaterial ) {

			shaderID = 'particle_basic';

		}

		if ( shaderID ) {

			setMaterialShaders( material, THREE.ShaderLib[ shaderID ] );

		}

		// heuristics to create shader parameters according to lights in the scene
		// (not to blow over maxLights budget)

		maxLightCount = allocateLights( lights );

		maxShadows = allocateShadows( lights );

		maxBones = allocateBones( object );

		parameters = {

			map: !!material.map,
			envMap: !!material.envMap,
			lightMap: !!material.lightMap,
			bumpMap: !!material.bumpMap,
			normalMap: !!material.normalMap,
			specularMap: !!material.specularMap,

			vertexColors: material.vertexColors,

			fog: fog,
			useFog: material.fog,
			fogExp: fog instanceof THREE.FogExp2,

			sizeAttenuation: material.sizeAttenuation,

			skinning: material.skinning,
			maxBones: maxBones,
			useVertexTexture: _supportsBoneTextures && object && object.useVertexTexture,

			morphTargets: material.morphTargets,
			morphNormals: material.morphNormals,
			maxMorphTargets: this.maxMorphTargets,
			maxMorphNormals: this.maxMorphNormals,

			maxDirLights: maxLightCount.directional,
			maxPointLights: maxLightCount.point,
			maxSpotLights: maxLightCount.spot,
			maxHemiLights: maxLightCount.hemi,

			maxShadows: maxShadows,
			shadowMapEnabled: this.shadowMapEnabled && object.receiveShadow && maxShadows > 0,
			shadowMapType: this.shadowMapType,
			shadowMapDebug: this.shadowMapDebug,
			shadowMapCascade: this.shadowMapCascade,

			alphaTest: material.alphaTest,
			metal: material.metal,
			wrapAround: material.wrapAround,
			doubleSided: material.side === THREE.DoubleSide,
			flipSided: material.side === THREE.BackSide

		};

		material.program = buildProgram( shaderID, material.fragmentShader, material.vertexShader, material.uniforms, material.attributes, material.defines, parameters, material.index0AttributeName );

        var attributes = material.program[PROGRAM_ATTRIBUTES];

		if ( material.morphTargets ) {

			material.numSupportedMorphTargets = 0;

			var id, base = "morphTarget";

			for ( i = 0; i < this.maxMorphTargets; i ++ ) {

				id = base + i;

				if ( attributes[ id ] >= 0 ) {

					material.numSupportedMorphTargets ++;

				}

			}

		}

		if ( material.morphNormals ) {

			material.numSupportedMorphNormals = 0;

			var id, base = "morphNormal";

			for ( i = 0; i < this.maxMorphNormals; i ++ ) {

				id = base + i;

				if ( attributes[ id ] >= 0 ) {

					material.numSupportedMorphNormals ++;

				}

			}

		}

		material.uniformsList = [];

		for ( u in material.uniforms ) {

			material.uniformsList.push( [ material.uniforms[ u ], u ] );

		}

	};

	function setMaterialShaders( material, shaders ) {

		material.uniforms = THREE.UniformsUtils.clone( shaders.uniforms );
		material.vertexShader = shaders.vertexShader;
		material.fragmentShader = shaders.fragmentShader;

	};

	function setProgram( camera, lights, fog, material, object ) {
        if (debug_renderer) console.log(renderer_name+".setProgram() enter");
		_usedTextureUnits = 0;

		if ( material.needsUpdate ) {

			if ( material.program ) deallocateMaterial( material );

			_this.initMaterial( material, lights, fog, object );
			material.needsUpdate = false;

		}

		if ( material.morphTargets ) {

			if ( ! object.__webglMorphTargetInfluences ) {

				object.__webglMorphTargetInfluences = new Float32Array( _this.maxMorphTargets );
                object.__webglMorphTargetInfluences.name = ""+object.name+"._webglMorphTargetInfluencesArray";
			}

		}

		var refreshMaterial = false;

        var program = material.program;
        p_uniforms = program[PROGRAM_UNIFORMS];
        m_uniforms = material.uniforms;

		if ( program !== _currentProgram ) {

			_gl.useProgram( program );
			_currentProgram = program;

			refreshMaterial = true;

		}

		if ( material.id !== _currentMaterialId ) {

			_currentMaterialId = material.id;
			refreshMaterial = true;

		}

		if ( refreshMaterial || camera !== _currentCamera ) {

            _gl.uniformMatrix4fv( p_uniforms.projectionMatrix, false, camera.projectionMatrix.elements.typedArray() );

			if ( camera !== _currentCamera ) _currentCamera = camera;

		}

		// skinning uniforms must be set even if material didn't change
		// auto-setting of texture unit for bone texture must go before other textures
		// not sure why, but otherwise weird things happen

		if ( material.skinning ) {

			if ( _supportsBoneTextures && object.useVertexTexture ) {

				if ( p_uniforms.boneTexture !== null ) {

					var textureUnit = getTextureUnit();

					_gl.uniform1i( p_uniforms.boneTexture, textureUnit );
					_this.setTexture( object.boneTexture, textureUnit );

				}

				if ( p_uniforms.boneTextureWidth !== null ) {

					_gl.uniform1i( p_uniforms.boneTextureWidth, object.boneTextureWidth );

				}

				if ( p_uniforms.boneTextureHeight !== null ) {

					_gl.uniform1i( p_uniforms.boneTextureHeight, object.boneTextureHeight );

				}

			} else {

				if ( p_uniforms.boneGlobalMatrices !== null ) {

                    _gl.uniformMatrix4fv( p_uniforms.boneGlobalMatrices, false, object.boneMatrices.typedArray() );

				}

			}

		}

		if ( refreshMaterial ) {

			// refresh uniforms common to several materials

			if ( fog && material.fog ) {

				refreshUniformsFog( m_uniforms, fog );

			}

			if ( material instanceof THREE.MeshPhongMaterial ||
				 material instanceof THREE.MeshLambertMaterial ||
				 material.lights ) {

				if ( _lightsNeedUpdate ) {

					setupLights( program, lights );
					_lightsNeedUpdate = false;

				}

				refreshUniformsLights( m_uniforms, _lights );

			}

			if ( material instanceof THREE.MeshBasicMaterial ||
				 material instanceof THREE.MeshLambertMaterial ||
				 material instanceof THREE.MeshPhongMaterial ) {

				refreshUniformsCommon( m_uniforms, material );

			}

			// refresh single material specific uniforms

			if ( material instanceof THREE.LineBasicMaterial ) {

				refreshUniformsLine( m_uniforms, material );

			} else if ( material instanceof THREE.LineDashedMaterial ) {

				refreshUniformsLine( m_uniforms, material );
				refreshUniformsDash( m_uniforms, material );

			} else if ( material instanceof THREE.ParticleSystemMaterial ) {

				refreshUniformsParticle( m_uniforms, material );

			} else if ( material instanceof THREE.MeshPhongMaterial ) {

				refreshUniformsPhong( m_uniforms, material );

			} else if ( material instanceof THREE.MeshLambertMaterial ) {

				refreshUniformsLambert( m_uniforms, material );

			} else if ( material instanceof THREE.MeshDepthMaterial ) {

				m_uniforms.mNear.value = camera.near;
				m_uniforms.mFar.value = camera.far;
				m_uniforms.opacity.value = material.opacity;

			} else if ( material instanceof THREE.MeshNormalMaterial ) {

				m_uniforms.opacity.value = material.opacity;

			}

			if ( object.receiveShadow && ! material._shadowPass ) {

				refreshUniformsShadow( m_uniforms, lights );

			}

			// load common uniforms

			loadUniformsGeneric( program, material.uniformsList );

			// load material specific uniforms
			// (shader material also gets them for the sake of genericity)

			if ( material instanceof THREE.ShaderMaterial ||
				 material instanceof THREE.MeshPhongMaterial ||
				 material.envMap ) {

				if ( p_uniforms.cameraPosition !== null ) {

					_vector3.setFromMatrixPosition( camera.matrixWorld );
					_gl.uniform3f( p_uniforms.cameraPosition, _vector3.x, _vector3.y, _vector3.z );

				}

			}

			if ( material instanceof THREE.MeshPhongMaterial ||
				 material instanceof THREE.MeshLambertMaterial ||
				 material instanceof THREE.ShaderMaterial ||
				 material.skinning ) {

				if ( p_uniforms.viewMatrix !== null ) {

                    _gl.uniformMatrix4fv( p_uniforms.viewMatrix, false, camera.matrixWorldInverse.elements.typedArray() );

				}

			}

		}

		loadUniformsMatrices( p_uniforms, object );

		if ( p_uniforms.modelMatrix !== null ) {

            _gl.uniformMatrix4fv( p_uniforms.modelMatrix, false, object.matrixWorld.elements.typedArray() );

		}

		return program;

	};

	// Uniforms (refresh uniforms objects)

	function refreshUniformsCommon ( uniforms, material ) {

		uniforms.opacity.value = material.opacity;

		if ( _this.gammaInput ) {

			uniforms.diffuse.value.copyGammaToLinear( material.color );

		} else {

			uniforms.diffuse.value = material.color;

		}

		uniforms.map.value = material.map;
		uniforms.lightMap.value = material.lightMap;
		uniforms.specularMap.value = material.specularMap;

		if ( material.bumpMap ) {

			uniforms.bumpMap.value = material.bumpMap;
			uniforms.bumpScale.value = material.bumpScale;

		}

		if ( material.normalMap ) {

			uniforms.normalMap.value = material.normalMap;
			uniforms.normalScale.value.copy( material.normalScale );

		}

		// uv repeat and offset setting priorities
		//	1. color map
		//	2. specular map
		//	3. normal map
		//	4. bump map

		var uvScaleMap;

		if ( material.map ) {

			uvScaleMap = material.map;

		} else if ( material.specularMap ) {

			uvScaleMap = material.specularMap;

		} else if ( material.normalMap ) {

			uvScaleMap = material.normalMap;

		} else if ( material.bumpMap ) {

			uvScaleMap = material.bumpMap;

		}

		if ( uvScaleMap !== undefined ) {

			var offset = uvScaleMap.offset;
			var repeat = uvScaleMap.repeat;

			uniforms.offsetRepeat.value.set( offset.x, offset.y, repeat.x, repeat.y );

		}

		uniforms.envMap.value = material.envMap;
		uniforms.flipEnvMap.value = ( material.envMap instanceof THREE.WebGLRenderTargetCube ) ? 1 : -1;

		if ( _this.gammaInput ) {

			//uniforms.reflectivity.value = material.reflectivity * material.reflectivity;
			uniforms.reflectivity.value = material.reflectivity;

		} else {

			uniforms.reflectivity.value = material.reflectivity;

		}

		uniforms.refractionRatio.value = material.refractionRatio;
		uniforms.combine.value = material.combine;
		uniforms.useRefract.value = material.envMap && material.envMap.mapping instanceof THREE.CubeRefractionMapping;

	};

	function refreshUniformsLine ( uniforms, material ) {

		uniforms.diffuse.value = material.color;
		uniforms.opacity.value = material.opacity;

	};

	function refreshUniformsDash ( uniforms, material ) {

		uniforms.dashSize.value = material.dashSize;
		uniforms.totalSize.value = material.dashSize + material.gapSize;
		uniforms.scale.value = material.scale;

	};

	function refreshUniformsParticle ( uniforms, material ) {

		uniforms.psColor.value = material.color;
		uniforms.opacity.value = material.opacity;
		uniforms.size.value = material.size;
		uniforms.scale.value = _canvas.height / 2.0; // TODO: Cache this.

		uniforms.map.value = material.map;

	};

	function refreshUniformsFog ( uniforms, fog ) {

		uniforms.fogColor.value = fog.color;

		if ( fog instanceof THREE.Fog ) {

			uniforms.fogNear.value = fog.near;
			uniforms.fogFar.value = fog.far;

		} else if ( fog instanceof THREE.FogExp2 ) {

			uniforms.fogDensity.value = fog.density;

		}

	};

	function refreshUniformsPhong ( uniforms, material ) {

		uniforms.shininess.value = material.shininess;

		if ( _this.gammaInput ) {

			uniforms.ambient.value.copyGammaToLinear( material.ambient );
			uniforms.emissive.value.copyGammaToLinear( material.emissive );
			uniforms.specular.value.copyGammaToLinear( material.specular );

		} else {

			uniforms.ambient.value = material.ambient;
			uniforms.emissive.value = material.emissive;
			uniforms.specular.value = material.specular;

		}

		if ( material.wrapAround ) {

			uniforms.wrapRGB.value.copy( material.wrapRGB );

		}

	};

	function refreshUniformsLambert ( uniforms, material ) {

		if ( _this.gammaInput ) {

			uniforms.ambient.value.copyGammaToLinear( material.ambient );
			uniforms.emissive.value.copyGammaToLinear( material.emissive );

		} else {

			uniforms.ambient.value = material.ambient;
			uniforms.emissive.value = material.emissive;

		}

		if ( material.wrapAround ) {

			uniforms.wrapRGB.value.copy( material.wrapRGB );

		}

	};

	function refreshUniformsLights ( uniforms, lights ) {

		uniforms.ambientLightColor.value = lights.ambient;

		uniforms.directionalLightColor.value = lights.directional.colors;
		uniforms.directionalLightDirection.value = lights.directional.positions;

		uniforms.pointLightColor.value = lights.point.colors;
		uniforms.pointLightPosition.value = lights.point.positions;
		uniforms.pointLightDistance.value = lights.point.distances;

		uniforms.spotLightColor.value = lights.spot.colors;
		uniforms.spotLightPosition.value = lights.spot.positions;
		uniforms.spotLightDistance.value = lights.spot.distances;
		uniforms.spotLightDirection.value = lights.spot.directions;
		uniforms.spotLightAngleCos.value = lights.spot.anglesCos;
		uniforms.spotLightExponent.value = lights.spot.exponents;

		uniforms.hemisphereLightSkyColor.value = lights.hemi.skyColors;
		uniforms.hemisphereLightGroundColor.value = lights.hemi.groundColors;
		uniforms.hemisphereLightDirection.value = lights.hemi.positions;

	};

	function refreshUniformsShadow ( uniforms, lights ) {

		if ( uniforms.shadowMatrix ) {

			var j = 0;

			for ( var i = 0, il = lights.length; i < il; i ++ ) {

				var light = lights[ i ];

				if ( ! light.castShadow ) continue;

				if ( light instanceof THREE.SpotLight || ( light instanceof THREE.DirectionalLight && ! light.shadowCascade ) ) {

					uniforms.shadowMap.value[ j ] = light.shadowMap;
					uniforms.shadowMapSize.value[ j ] = light.shadowMapSize;

					uniforms.shadowMatrix.value[ j ] = light.shadowMatrix;

					uniforms.shadowDarkness.value[ j ] = light.shadowDarkness;
					uniforms.shadowBias.value[ j ] = light.shadowBias;

					j ++;

				}

			}

		}

	};

	// Uniforms (load to GPU)

	function loadUniformsMatrices ( uniforms, object ) {

        _gl.uniformMatrix4fv( uniforms.modelViewMatrix, false, object._modelViewMatrix.elements.typedArray() );

		if ( uniforms.normalMatrix ) {

            _gl.uniformMatrix3fv( uniforms.normalMatrix, false, object._normalMatrix.elements.typedArray() );

		}

	};

	function getTextureUnit() {

		var textureUnit = _usedTextureUnits;

		if ( textureUnit >= _maxTextures ) {

            console.warn( "Canvas3DRenderer: trying to use " + textureUnit + " texture units while this GPU supports only " + _maxTextures );

		}

		_usedTextureUnits += 1;

		return textureUnit;

	};

	function loadUniformsGeneric ( program, uniforms ) {

		var uniform, value, type, location, texture, textureUnit, i, il, j, jl, offset;

		for ( j = 0, jl = uniforms.length; j < jl; j ++ ) {
            var location = program[PROGRAM_UNIFORMS][ uniforms[ j ][ 1 ] ];
			if ( !location ) continue;

			uniform = uniforms[ j ][ 0 ];

			type = uniform.type;
			value = uniform.value;

			if ( type === "i" ) { // single integer

                _gl.uniform1i( location, value );

			} else if ( type === "f" ) { // single float

                _gl.uniform1f( location, value );

			} else if ( type === "v2" ) { // single THREE.Vector2

				_gl.uniform2f( location, value.x, value.y );

			} else if ( type === "v3" ) { // single THREE.Vector3

				_gl.uniform3f( location, value.x, value.y, value.z );

			} else if ( type === "v4" ) { // single THREE.Vector4

				_gl.uniform4f( location, value.x, value.y, value.z, value.w );

			} else if ( type === "c" ) { // single THREE.Color

				_gl.uniform3f( location, value.r, value.g, value.b );

			} else if ( type === "iv1" ) { // flat array of integers (JS or typed array)
                if (value instanceof Array)
                    _gl.uniform1iva( location, value );
                else
                    _gl.uniform1iv( location, value.typedArray() );
			} else if ( type === "iv" ) { // flat array of integers with 3 x N size (JS or typed array)

                if (value instanceof Array)
                    _gl.uniform3iva( location, value );
                else
                    _gl.uniform3iv( location, value.typedArray() );

			} else if ( type === "fv1" ) { // flat array of floats (JS or typed array)

                if (value instanceof Array)
                    _gl.uniform1fva( location, value );
                else
                    _gl.uniform1fv( location, value.typedArray() );

			} else if ( type === "fv" ) { // flat array of floats with 3 x N size (JS or typed array)

                if (value instanceof Array)
                    _gl.uniform3fva( location, value );
                else
                    _gl.uniform3fv( location, value.typedArray() );

			} else if ( type === "v2v" ) { // array of THREE.Vector2

				if ( uniform._array === undefined ) {

					uniform._array = new Float32Array( 2 * value.length );
                    uniform._array.name = "_uniform_array_v2v";
				}

				for ( i = 0, il = value.length; i < il; i ++ ) {

					offset = i * 2;

					uniform._array[ offset ] 	 = value[ i ].x;
					uniform._array[ offset + 1 ] = value[ i ].y;

				}

                _gl.uniform2fv( location, uniform._array.typedArray() );

			} else if ( type === "v3v" ) { // array of THREE.Vector3

				if ( uniform._array === undefined ) {

					uniform._array = new Float32Array( 3 * value.length );
                    uniform._array.name = "_uniform_array_v3v";
				}

				for ( i = 0, il = value.length; i < il; i ++ ) {

					offset = i * 3;

					uniform._array[ offset ] 	 = value[ i ].x;
					uniform._array[ offset + 1 ] = value[ i ].y;
					uniform._array[ offset + 2 ] = value[ i ].z;

				}

                _gl.uniform3fv( location, uniform._array.typedArray() );

			} else if ( type === "v4v" ) { // array of THREE.Vector4

				if ( uniform._array === undefined ) {

					uniform._array = new Float32Array( 4 * value.length );
                    uniform._array.name = "_uniform_array_v4v";
				}

				for ( i = 0, il = value.length; i < il; i ++ ) {

					offset = i * 4;

					uniform._array[ offset ] 	 = value[ i ].x;
					uniform._array[ offset + 1 ] = value[ i ].y;
					uniform._array[ offset + 2 ] = value[ i ].z;
					uniform._array[ offset + 3 ] = value[ i ].w;

				}

                _gl.uniform4fv( location, uniform._array.typedArray() );

			} else if ( type === "m4") { // single THREE.Matrix4

				if ( uniform._array === undefined ) {

					uniform._array = new Float32Array( 16 );
                    uniform._array.name = "_uniform_array_m4";
				}

				value.flattenToArray( uniform._array );
                _gl.uniformMatrix4fv( location, false, uniform._array.typedArray() );

            } else if ( type === "m4v" ) { // array of THREE.Matrix4;

				if ( uniform._array === undefined ) {

					uniform._array = new Float32Array( 16 * value.length );
                    uniform._array.name = "_uniform_array_m4v";
				}

				for ( i = 0, il = value.length; i < il; i ++ ) {

					value[ i ].flattenToArrayOffset( uniform._array, i * 16 );

				}

                _gl.uniformMatrix4fv( location, false, uniform._array.typedArray() );

			} else if ( type === "t" ) { // single THREE.Texture (2d or cube)

				texture = value;
				textureUnit = getTextureUnit();

				_gl.uniform1i( location, textureUnit );

				if ( !texture ) continue;

				if ( texture.image instanceof Array && texture.image.length === 6 ) {

					setCubeTexture( texture, textureUnit );

				} else if ( texture instanceof THREE.WebGLRenderTargetCube ) {

					setCubeTextureDynamic( texture, textureUnit );

				} else {

					_this.setTexture( texture, textureUnit );

				}

			} else if ( type === "tv" ) { // array of THREE.Texture (2d)

				if ( uniform._array === undefined ) {

					uniform._array = [];

				}

				for( i = 0, il = uniform.value.length; i < il; i ++ ) {

					uniform._array[ i ] = getTextureUnit();

				}

                _gl.uniform1iv( location, uniform._array.typedArray() );

				for( i = 0, il = uniform.value.length; i < il; i ++ ) {

					texture = uniform.value[ i ];
					textureUnit = uniform._array[ i ];

					if ( !texture ) continue;

					_this.setTexture( texture, textureUnit );

				}

			} else {

                console.warn( 'THREE.Canvas3DRenderer: Unknown uniform type: ' + type );

			}

		}

	};

	function setupMatrices ( object, camera ) {

		object._modelViewMatrix.multiplyMatrices( camera.matrixWorldInverse, object.matrixWorld );
		object._normalMatrix.getNormalMatrix( object._modelViewMatrix );

	};

	//

	function setColorGamma( array, offset, color, intensitySq ) {

		array[ offset ]     = color.r * color.r * intensitySq;
		array[ offset + 1 ] = color.g * color.g * intensitySq;
		array[ offset + 2 ] = color.b * color.b * intensitySq;

	};

	function setColorLinear( array, offset, color, intensity ) {

		array[ offset ]     = color.r * intensity;
		array[ offset + 1 ] = color.g * intensity;
		array[ offset + 2 ] = color.b * intensity;

	};

	function setupLights ( program, lights ) {

		var l, ll, light, n,
		r = 0, g = 0, b = 0,
		color, skyColor, groundColor,
		intensity,  intensitySq,
		position,
		distance,

		zlights = _lights,

		dirColors = zlights.directional.colors,
		dirPositions = zlights.directional.positions,

		pointColors = zlights.point.colors,
		pointPositions = zlights.point.positions,
		pointDistances = zlights.point.distances,

		spotColors = zlights.spot.colors,
		spotPositions = zlights.spot.positions,
		spotDistances = zlights.spot.distances,
		spotDirections = zlights.spot.directions,
		spotAnglesCos = zlights.spot.anglesCos,
		spotExponents = zlights.spot.exponents,

		hemiSkyColors = zlights.hemi.skyColors,
		hemiGroundColors = zlights.hemi.groundColors,
		hemiPositions = zlights.hemi.positions,

		dirLength = 0,
		pointLength = 0,
		spotLength = 0,
		hemiLength = 0,

		dirCount = 0,
		pointCount = 0,
		spotCount = 0,
		hemiCount = 0,

		dirOffset = 0,
		pointOffset = 0,
		spotOffset = 0,
		hemiOffset = 0;

		for ( l = 0, ll = lights.length; l < ll; l ++ ) {

			light = lights[ l ];

			if ( light.onlyShadow ) continue;

			color = light.color;
			intensity = light.intensity;
			distance = light.distance;

			if ( light instanceof THREE.AmbientLight ) {

				if ( ! light.visible ) continue;

				if ( _this.gammaInput ) {

					r += color.r * color.r;
					g += color.g * color.g;
					b += color.b * color.b;

				} else {

					r += color.r;
					g += color.g;
					b += color.b;

				}

			} else if ( light instanceof THREE.DirectionalLight ) {

				dirCount += 1;

				if ( ! light.visible ) continue;

				_direction.setFromMatrixPosition( light.matrixWorld );
				_vector3.setFromMatrixPosition( light.target.matrixWorld );
				_direction.sub( _vector3 );
				_direction.normalize();

				// skip lights with undefined direction
				// these create troubles in OpenGL (making pixel black)

				if ( _direction.x === 0 && _direction.y === 0 && _direction.z === 0 ) continue;

				dirOffset = dirLength * 3;

				dirPositions[ dirOffset ]     = _direction.x;
				dirPositions[ dirOffset + 1 ] = _direction.y;
				dirPositions[ dirOffset + 2 ] = _direction.z;

				if ( _this.gammaInput ) {

					setColorGamma( dirColors, dirOffset, color, intensity * intensity );

				} else {

					setColorLinear( dirColors, dirOffset, color, intensity );

				}

				dirLength += 1;

			} else if ( light instanceof THREE.PointLight ) {

				pointCount += 1;

				if ( ! light.visible ) continue;

				pointOffset = pointLength * 3;

				if ( _this.gammaInput ) {

					setColorGamma( pointColors, pointOffset, color, intensity * intensity );

				} else {

					setColorLinear( pointColors, pointOffset, color, intensity );

				}

				_vector3.setFromMatrixPosition( light.matrixWorld );

				pointPositions[ pointOffset ]     = _vector3.x;
				pointPositions[ pointOffset + 1 ] = _vector3.y;
				pointPositions[ pointOffset + 2 ] = _vector3.z;

				pointDistances[ pointLength ] = distance;

				pointLength += 1;

			} else if ( light instanceof THREE.SpotLight ) {

				spotCount += 1;

				if ( ! light.visible ) continue;

				spotOffset = spotLength * 3;

				if ( _this.gammaInput ) {

					setColorGamma( spotColors, spotOffset, color, intensity * intensity );

				} else {

					setColorLinear( spotColors, spotOffset, color, intensity );

				}

				_vector3.setFromMatrixPosition( light.matrixWorld );

				spotPositions[ spotOffset ]     = _vector3.x;
				spotPositions[ spotOffset + 1 ] = _vector3.y;
				spotPositions[ spotOffset + 2 ] = _vector3.z;

				spotDistances[ spotLength ] = distance;

				_direction.copy( _vector3 );
				_vector3.setFromMatrixPosition( light.target.matrixWorld );
				_direction.sub( _vector3 );
				_direction.normalize();

				spotDirections[ spotOffset ]     = _direction.x;
				spotDirections[ spotOffset + 1 ] = _direction.y;
				spotDirections[ spotOffset + 2 ] = _direction.z;

				spotAnglesCos[ spotLength ] = Math.cos( light.angle );
				spotExponents[ spotLength ] = light.exponent;

				spotLength += 1;

			} else if ( light instanceof THREE.HemisphereLight ) {

				hemiCount += 1;

				if ( ! light.visible ) continue;

				_direction.setFromMatrixPosition( light.matrixWorld );
				_direction.normalize();

				// skip lights with undefined direction
				// these create troubles in OpenGL (making pixel black)

				if ( _direction.x === 0 && _direction.y === 0 && _direction.z === 0 ) continue;

				hemiOffset = hemiLength * 3;

				hemiPositions[ hemiOffset ]     = _direction.x;
				hemiPositions[ hemiOffset + 1 ] = _direction.y;
				hemiPositions[ hemiOffset + 2 ] = _direction.z;

				skyColor = light.color;
				groundColor = light.groundColor;

				if ( _this.gammaInput ) {

					intensitySq = intensity * intensity;

					setColorGamma( hemiSkyColors, hemiOffset, skyColor, intensitySq );
					setColorGamma( hemiGroundColors, hemiOffset, groundColor, intensitySq );

				} else {

					setColorLinear( hemiSkyColors, hemiOffset, skyColor, intensity );
					setColorLinear( hemiGroundColors, hemiOffset, groundColor, intensity );

				}

				hemiLength += 1;

			}

		}

		// null eventual remains from removed lights
		// (this is to avoid if in shader)

		for ( l = dirLength * 3, ll = Math.max( dirColors.length, dirCount * 3 ); l < ll; l ++ ) dirColors[ l ] = 0.0;
		for ( l = pointLength * 3, ll = Math.max( pointColors.length, pointCount * 3 ); l < ll; l ++ ) pointColors[ l ] = 0.0;
		for ( l = spotLength * 3, ll = Math.max( spotColors.length, spotCount * 3 ); l < ll; l ++ ) spotColors[ l ] = 0.0;
		for ( l = hemiLength * 3, ll = Math.max( hemiSkyColors.length, hemiCount * 3 ); l < ll; l ++ ) hemiSkyColors[ l ] = 0.0;
		for ( l = hemiLength * 3, ll = Math.max( hemiGroundColors.length, hemiCount * 3 ); l < ll; l ++ ) hemiGroundColors[ l ] = 0.0;

		zlights.directional.length = dirLength;
		zlights.point.length = pointLength;
		zlights.spot.length = spotLength;
		zlights.hemi.length = hemiLength;

		zlights.ambient[ 0 ] = r;
		zlights.ambient[ 1 ] = g;
		zlights.ambient[ 2 ] = b;

	};

	// GL state setting

	this.setFaceCulling = function ( cullFace, frontFaceDirection ) {

		if ( cullFace === THREE.CullFaceNone ) {

            _gl.disable( Context3D.CULL_FACE );

		} else {

			if ( frontFaceDirection === THREE.FrontFaceDirectionCW ) {

                _gl.frontFace( Context3D.CW );

			} else {

                _gl.frontFace( Context3D.CCW );

			}

			if ( cullFace === THREE.CullFaceBack ) {

                _gl.cullFace( Context3D.BACK );

			} else if ( cullFace === THREE.CullFaceFront ) {

                _gl.cullFace( Context3D.FRONT );

			} else {

                _gl.cullFace( Context3D.FRONT_AND_BACK );

			}

            _gl.enable( Context3D.CULL_FACE );

		}

	};

	this.setMaterialFaces = function ( material ) {

		var doubleSided = material.side === THREE.DoubleSide;
		var flipSided = material.side === THREE.BackSide;

		if ( _oldDoubleSided !== doubleSided ) {

			if ( doubleSided ) {

                _gl.disable( Context3D.CULL_FACE );

			} else {

                _gl.enable( Context3D.CULL_FACE );

			}

			_oldDoubleSided = doubleSided;

		}

		if ( _oldFlipSided !== flipSided ) {

			if ( flipSided ) {

                _gl.frontFace( Context3D.CW );

			} else {

                _gl.frontFace( Context3D.CCW );

			}

			_oldFlipSided = flipSided;

		}

	};

	this.setDepthTest = function ( depthTest ) {

		if ( _oldDepthTest !== depthTest ) {

			if ( depthTest ) {

                _gl.enable( Context3D.DEPTH_TEST );

			} else {

                _gl.disable( Context3D.DEPTH_TEST );

			}

			_oldDepthTest = depthTest;

		}

	};

	this.setDepthWrite = function ( depthWrite ) {

		if ( _oldDepthWrite !== depthWrite ) {

			_gl.depthMask( depthWrite );
			_oldDepthWrite = depthWrite;

		}

	};

	function setLineWidth ( width ) {

		if ( width !== _oldLineWidth ) {

			_gl.lineWidth( width );

			_oldLineWidth = width;

		}

	};

	function setPolygonOffset ( polygonoffset, factor, units ) {

		if ( _oldPolygonOffset !== polygonoffset ) {

			if ( polygonoffset ) {

                _gl.enable( Context3D.POLYGON_OFFSET_FILL );

			} else {

                _gl.disable( Context3D.POLYGON_OFFSET_FILL );

			}

			_oldPolygonOffset = polygonoffset;

		}

		if ( polygonoffset && ( _oldPolygonOffsetFactor !== factor || _oldPolygonOffsetUnits !== units ) ) {

			_gl.polygonOffset( factor, units );

			_oldPolygonOffsetFactor = factor;
			_oldPolygonOffsetUnits = units;

		}

	};

	this.setBlending = function ( blending, blendEquation, blendSrc, blendDst ) {

		if ( blending !== _oldBlending ) {

			if ( blending === THREE.NoBlending ) {

                _gl.disable( Context3D.BLEND );

			} else if ( blending === THREE.AdditiveBlending ) {

                _gl.enable( Context3D.BLEND );
                _gl.blendEquation( Context3D.FUNC_ADD );
                _gl.blendFunc( Context3D.SRC_ALPHA, Context3D.ONE );

			} else if ( blending === THREE.SubtractiveBlending ) {

				// TODO: Find blendFuncSeparate() combination
                _gl.enable( Context3D.BLEND );
                _gl.blendEquation( Context3D.FUNC_ADD );
                _gl.blendFunc( Context3D.ZERO, Context3D.ONE_MINUS_SRC_COLOR );

			} else if ( blending === THREE.MultiplyBlending ) {

				// TODO: Find blendFuncSeparate() combination
                _gl.enable( Context3D.BLEND );
                _gl.blendEquation( Context3D.FUNC_ADD );
                _gl.blendFunc( Context3D.ZERO, Context3D.SRC_COLOR );

			} else if ( blending === THREE.CustomBlending ) {

                _gl.enable( Context3D.BLEND );

			} else {

                _gl.enable( Context3D.BLEND );
                _gl.blendEquationSeparate( Context3D.FUNC_ADD, Context3D.FUNC_ADD );
                _gl.blendFuncSeparate( Context3D.SRC_ALPHA, Context3D.ONE_MINUS_SRC_ALPHA, Context3D.ONE, Context3D.ONE_MINUS_SRC_ALPHA );

			}

			_oldBlending = blending;

		}

		if ( blending === THREE.CustomBlending ) {

			if ( blendEquation !== _oldBlendEquation ) {

				_gl.blendEquation( paramThreeToGL( blendEquation ) );

				_oldBlendEquation = blendEquation;

			}

			if ( blendSrc !== _oldBlendSrc || blendDst !== _oldBlendDst ) {

				_gl.blendFunc( paramThreeToGL( blendSrc ), paramThreeToGL( blendDst ) );

				_oldBlendSrc = blendSrc;
				_oldBlendDst = blendDst;

			}

		} else {

			_oldBlendEquation = null;
			_oldBlendSrc = null;
			_oldBlendDst = null;

		}

	};

	// Defines

	function generateDefines ( defines ) {

		var value, chunk, chunks = [];

		for ( var d in defines ) {

			value = defines[ d ];
			if ( value === false ) continue;

			chunk = "#define " + d + " " + value;
			chunks.push( chunk );

		}

		return chunks.join( "\n" );

	};

	// Shaders

	function buildProgram( shaderID, fragmentShader, vertexShader, uniforms, attributes, defines, parameters, index0AttributeName ) {

		var p, pl, d, program, code;
		var chunks = [];

		// Generate code

		if ( shaderID ) {

			chunks.push( shaderID );

		} else {

			chunks.push( fragmentShader );
			chunks.push( vertexShader );

		}

		for ( d in defines ) {

			chunks.push( d );
			chunks.push( defines[ d ] );

		}

		for ( p in parameters ) {

			chunks.push( p );
			chunks.push( parameters[ p ] );

		}

		code = chunks.join();

		// Check if code has been already compiled
		for ( p = 0, pl = _programs.length; p < pl; p ++ ) {

			var programInfo = _programs[ p ];

			if ( programInfo.code === code ) {

                console.log( "Code already compiled.:\n\n" + code );
				programInfo.usedTimes ++;

				return programInfo.program;
			}
		}

		var shadowMapTypeDefine = "SHADOWMAP_TYPE_BASIC";

		if ( parameters.shadowMapType === THREE.PCFShadowMap ) {

			shadowMapTypeDefine = "SHADOWMAP_TYPE_PCF";

		} else if ( parameters.shadowMapType === THREE.PCFSoftShadowMap ) {

			shadowMapTypeDefine = "SHADOWMAP_TYPE_PCF_SOFT";

		}

        console.log( "building new program " );

		//

		var customDefines = generateDefines( defines );

		//

		program = _gl.createProgram();

		var prefix_vertex = [

			"precision " + _precision + " float;",
			"precision " + _precision + " int;",

			customDefines,

			_supportsVertexTextures ? "#define VERTEX_TEXTURES" : "",

			_this.gammaInput ? "#define GAMMA_INPUT" : "",
			_this.gammaOutput ? "#define GAMMA_OUTPUT" : "",

			"#define MAX_DIR_LIGHTS " + parameters.maxDirLights,
			"#define MAX_POINT_LIGHTS " + parameters.maxPointLights,
			"#define MAX_SPOT_LIGHTS " + parameters.maxSpotLights,
			"#define MAX_HEMI_LIGHTS " + parameters.maxHemiLights,

			"#define MAX_SHADOWS " + parameters.maxShadows,

			"#define MAX_BONES " + parameters.maxBones,

			parameters.map ? "#define USE_MAP" : "",
			parameters.envMap ? "#define USE_ENVMAP" : "",
			parameters.lightMap ? "#define USE_LIGHTMAP" : "",
			parameters.bumpMap ? "#define USE_BUMPMAP" : "",
			parameters.normalMap ? "#define USE_NORMALMAP" : "",
			parameters.specularMap ? "#define USE_SPECULARMAP" : "",
			parameters.vertexColors ? "#define USE_COLOR" : "",

			parameters.skinning ? "#define USE_SKINNING" : "",
			parameters.useVertexTexture ? "#define BONE_TEXTURE" : "",

			parameters.morphTargets ? "#define USE_MORPHTARGETS" : "",
			parameters.morphNormals ? "#define USE_MORPHNORMALS" : "",
			parameters.wrapAround ? "#define WRAP_AROUND" : "",
			parameters.doubleSided ? "#define DOUBLE_SIDED" : "",
			parameters.flipSided ? "#define FLIP_SIDED" : "",

			parameters.shadowMapEnabled ? "#define USE_SHADOWMAP" : "",
			parameters.shadowMapEnabled ? "#define " + shadowMapTypeDefine : "",
			parameters.shadowMapDebug ? "#define SHADOWMAP_DEBUG" : "",
			parameters.shadowMapCascade ? "#define SHADOWMAP_CASCADE" : "",

			parameters.sizeAttenuation ? "#define USE_SIZEATTENUATION" : "",

			"uniform mat4 modelMatrix;",
			"uniform mat4 modelViewMatrix;",
			"uniform mat4 projectionMatrix;",
			"uniform mat4 viewMatrix;",
			"uniform mat3 normalMatrix;",
			"uniform vec3 cameraPosition;",

			"attribute vec3 position;",
			"attribute vec3 normal;",
			"attribute vec2 uv;",
			"attribute vec2 uv2;",

			"#ifdef USE_COLOR",

				"attribute vec3 color;",

			"#endif",

			"#ifdef USE_MORPHTARGETS",

				"attribute vec3 morphTarget0;",
				"attribute vec3 morphTarget1;",
				"attribute vec3 morphTarget2;",
				"attribute vec3 morphTarget3;",

				"#ifdef USE_MORPHNORMALS",

					"attribute vec3 morphNormal0;",
					"attribute vec3 morphNormal1;",
					"attribute vec3 morphNormal2;",
					"attribute vec3 morphNormal3;",

				"#else",

					"attribute vec3 morphTarget4;",
					"attribute vec3 morphTarget5;",
					"attribute vec3 morphTarget6;",
					"attribute vec3 morphTarget7;",

				"#endif",

			"#endif",

			"#ifdef USE_SKINNING",

				"attribute vec4 skinIndex;",
				"attribute vec4 skinWeight;",

			"#endif",

			""

		].join("\n");

		var prefix_fragment = [

			"precision " + _precision + " float;",
			"precision " + _precision + " int;",

			( parameters.bumpMap || parameters.normalMap ) ? "#extension GL_OES_standard_derivatives : enable" : "",

			customDefines,

			"#define MAX_DIR_LIGHTS " + parameters.maxDirLights,
			"#define MAX_POINT_LIGHTS " + parameters.maxPointLights,
			"#define MAX_SPOT_LIGHTS " + parameters.maxSpotLights,
			"#define MAX_HEMI_LIGHTS " + parameters.maxHemiLights,

			"#define MAX_SHADOWS " + parameters.maxShadows,

			parameters.alphaTest ? "#define ALPHATEST " + parameters.alphaTest: "",

			_this.gammaInput ? "#define GAMMA_INPUT" : "",
			_this.gammaOutput ? "#define GAMMA_OUTPUT" : "",

			( parameters.useFog && parameters.fog ) ? "#define USE_FOG" : "",
			( parameters.useFog && parameters.fogExp ) ? "#define FOG_EXP2" : "",

			parameters.map ? "#define USE_MAP" : "",
			parameters.envMap ? "#define USE_ENVMAP" : "",
			parameters.lightMap ? "#define USE_LIGHTMAP" : "",
			parameters.bumpMap ? "#define USE_BUMPMAP" : "",
			parameters.normalMap ? "#define USE_NORMALMAP" : "",
			parameters.specularMap ? "#define USE_SPECULARMAP" : "",
			parameters.vertexColors ? "#define USE_COLOR" : "",

			parameters.metal ? "#define METAL" : "",
			parameters.wrapAround ? "#define WRAP_AROUND" : "",
			parameters.doubleSided ? "#define DOUBLE_SIDED" : "",
			parameters.flipSided ? "#define FLIP_SIDED" : "",

			parameters.shadowMapEnabled ? "#define USE_SHADOWMAP" : "",
			parameters.shadowMapEnabled ? "#define " + shadowMapTypeDefine : "",
			parameters.shadowMapDebug ? "#define SHADOWMAP_DEBUG" : "",
			parameters.shadowMapCascade ? "#define SHADOWMAP_CASCADE" : "",

			"uniform mat4 viewMatrix;",
			"uniform vec3 cameraPosition;",
			""

		].join("\n");

		var glVertexShader = getShader( "vertex", prefix_vertex + vertexShader );
		var glFragmentShader = getShader( "fragment", prefix_fragment + fragmentShader );

		_gl.attachShader( program, glVertexShader );
		_gl.attachShader( program, glFragmentShader );

		// Force a particular attribute to index 0.
		// because potentially expensive emulation is done by browser if attribute 0 is disabled.
		// And, color, for example is often automatically bound to index 0 so disabling it
		if ( index0AttributeName !== undefined ) {

			_gl.bindAttribLocation( program, 0, index0AttributeName );

		}

		_gl.linkProgram( program );

        if ( !_gl.getProgramParameter( program, Context3D.LINK_STATUS )) {

			console.error( 'Could not initialise shader' );
            console.error( 'gl.VALIDATE_STATUS', _gl.getProgramParameter( program, Context3D.VALIDATE_STATUS ) );
			console.error( 'gl.getError()', _gl.getError() );
		}

		if ( _gl.getProgramInfoLog( program ) !== '' ) {

			console.error( 'gl.getProgramInfoLog()', _gl.getProgramInfoLog( program ) );

		}

		// clean up

		_gl.deleteShader( glFragmentShader );
		_gl.deleteShader( glVertexShader );

		// console.log( prefix_fragment + fragmentShader );
		// console.log( prefix_vertex + vertexShader );

        program[PROGRAM_UNIFORMS] = {};
        program[PROGRAM_ATTRIBUTES] = {};

		var identifiers, u, a, i;

		// cache uniform locations

		identifiers = [

			'viewMatrix', 'modelViewMatrix', 'projectionMatrix', 'normalMatrix', 'modelMatrix', 'cameraPosition',
			'morphTargetInfluences'

		];

		if ( parameters.useVertexTexture ) {

			identifiers.push( 'boneTexture' );
			identifiers.push( 'boneTextureWidth' );
			identifiers.push( 'boneTextureHeight' );

		} else {

			identifiers.push( 'boneGlobalMatrices' );

		}

		for ( u in uniforms ) {

			identifiers.push( u );

		}

		cacheUniformLocations( program, identifiers );

		// cache attributes locations

		identifiers = [

			"position", "normal", "uv", "uv2", "tangent", "color",
			"skinIndex", "skinWeight", "lineDistance"

		];

		for ( i = 0; i < parameters.maxMorphTargets; i ++ ) {

			identifiers.push( "morphTarget" + i );

		}

		for ( i = 0; i < parameters.maxMorphNormals; i ++ ) {

			identifiers.push( "morphNormal" + i );

		}

		for ( a in attributes ) {

			identifiers.push( a );

		}

		cacheAttributeLocations( program, identifiers );

        program[PROGRAM_ID] = _programs_counter ++;

		_programs.push( { program: program, code: code, usedTimes: 1 } );

		_this.info.memory.programs = _programs.length;

		return program;

	};

	// Shader parameters cache

    function cacheUniformLocations ( program, identifiers ) {

        var i, l, id;
		for( i = 0, l = identifiers.length; i < l; i ++ ) {
            id = identifiers[ i ];
            var uniformLoc = _gl.getUniformLocation( program, id );
            if (uniformLoc != null)
                uniformLoc.name = ""+id;
            program[PROGRAM_UNIFORMS][id] = uniformLoc;
		}

	};

	function cacheAttributeLocations ( program, identifiers ) {

        var i, l, id;
        for( i = 0, l = identifiers.length; i < l; i ++ ) {
			id = identifiers[ i ];
            program[PROGRAM_ATTRIBUTES][ id ] = _gl.getAttribLocation( program, id );

        }

    };

	function addLineNumbers ( string ) {

		var chunks = string.split( "\n" );

		for ( var i = 0, il = chunks.length; i < il; i ++ ) {

			// Chrome reports shader errors on lines
			// starting counting from 1

			chunks[ i ] = ( i + 1 ) + ": " + chunks[ i ];

		}

		return chunks.join( "\n" );

	};

	function getShader ( type, string ) {

		var shader;

		if ( type === "fragment" ) {

            shader = _gl.createShader( Context3D.FRAGMENT_SHADER );

		} else if ( type === "vertex" ) {

            shader = _gl.createShader( Context3D.VERTEX_SHADER );

		}

		_gl.shaderSource( shader, string );
		_gl.compileShader( shader );

        if ( !_gl.getShaderParameter( shader, Context3D.COMPILE_STATUS ) ) {

			console.error( _gl.getShaderInfoLog( shader ) );
			console.error( addLineNumbers( string ) );
			return null;

		}

		return shader;

	};

	// Textures

	function setTextureParameters ( textureType, texture, isImagePowerOfTwo ) {

		if ( isImagePowerOfTwo ) {

            _gl.texParameteri( textureType, Context3D.TEXTURE_WRAP_S, paramThreeToGL( texture.wrapS ) );
            _gl.texParameteri( textureType, Context3D.TEXTURE_WRAP_T, paramThreeToGL( texture.wrapT ) );

            _gl.texParameteri( textureType, Context3D.TEXTURE_MAG_FILTER, paramThreeToGL( texture.magFilter ) );
            _gl.texParameteri( textureType, Context3D.TEXTURE_MIN_FILTER, paramThreeToGL( texture.minFilter ) );

		} else {

            _gl.texParameteri( textureType, Context3D.TEXTURE_WRAP_S, Context3D.CLAMP_TO_EDGE );
            _gl.texParameteri( textureType, Context3D.TEXTURE_WRAP_T, Context3D.CLAMP_TO_EDGE );

            _gl.texParameteri( textureType, Context3D.TEXTURE_MAG_FILTER, filterFallback( texture.magFilter ) );
            _gl.texParameteri( textureType, Context3D.TEXTURE_MIN_FILTER, filterFallback( texture.minFilter ) );

		}

		if ( _glExtensionTextureFilterAnisotropic && texture.type !== THREE.FloatType ) {

			if ( texture.anisotropy > 1 || texture.__oldAnisotropy ) {

				_gl.texParameterf( textureType, _glExtensionTextureFilterAnisotropic.TEXTURE_MAX_ANISOTROPY_EXT, Math.min( texture.anisotropy, _maxAnisotropy ) );
				texture.__oldAnisotropy = texture.anisotropy;

			}

		}

	};

	this.setTexture = function ( texture, slot ) {

		if ( texture.needsUpdate ) {

			if ( ! texture.__webglInit ) {

				texture.__webglInit = true;

				texture.addEventListener( 'dispose', onTextureDispose );

				texture.__webglTexture = _gl.createTexture();

				_this.info.memory.textures ++;

			}

            _gl.activeTexture( Context3D.TEXTURE0 + slot );
            _gl.bindTexture( Context3D.TEXTURE_2D, texture.__webglTexture );

            _gl.pixelStorei( Context3D.UNPACK_FLIP_Y_WEBGL, texture.flipY );
            _gl.pixelStorei( Context3D.UNPACK_PREMULTIPLY_ALPHA_WEBGL, texture.premultiplyAlpha );
            _gl.pixelStorei( Context3D.UNPACK_ALIGNMENT, texture.unpackAlignment );

			var image = texture.image,
			isImagePowerOfTwo = THREE.Math.isPowerOfTwo( image.width ) && THREE.Math.isPowerOfTwo( image.height ),
			glFormat = paramThreeToGL( texture.format ),
			glType = paramThreeToGL( texture.type );

            setTextureParameters( Context3D.TEXTURE_2D, texture, isImagePowerOfTwo );

			var mipmap, mipmaps = texture.mipmaps;

			if ( texture instanceof THREE.DataTexture ) {

				// use manually created mipmaps if available
				// if there are no manual mipmaps
				// set 0 level mipmap and then use GL to generate other mipmap levels

				if ( mipmaps.length > 0 && isImagePowerOfTwo ) {

					for ( var i = 0, il = mipmaps.length; i < il; i ++ ) {

						mipmap = mipmaps[ i ];
                        _gl.texImage2D( Context3D.TEXTURE_2D, i, glFormat, mipmap.width, mipmap.height, 0, glFormat, glType, mipmap.data );

					}

					texture.generateMipmaps = false;

				} else {

                    _gl.texImage2D( Context3D.TEXTURE_2D, 0, glFormat, image.width, image.height, 0, glFormat, glType, image.data );

				}

			} else if ( texture instanceof THREE.CompressedTexture ) {

				for( var i = 0, il = mipmaps.length; i < il; i ++ ) {

					mipmap = mipmaps[ i ];
					if ( texture.format!==THREE.RGBAFormat ) {
                        _gl.compressedTexImage2D( Context3D.TEXTURE_2D, i, glFormat, mipmap.width, mipmap.height, 0, mipmap.data );
					} else {
                        _gl.texImage2D( Context3D.TEXTURE_2D, i, glFormat, mipmap.width, mipmap.height, 0, glFormat, glType, mipmap.data );
					}

				}

			} else { // regular Texture (image, video, canvas)

				// use manually created mipmaps if available
				// if there are no manual mipmaps
				// set 0 level mipmap and then use GL to generate other mipmap levels

				if ( mipmaps.length > 0 && isImagePowerOfTwo ) {

					for ( var i = 0, il = mipmaps.length; i < il; i ++ ) {

						mipmap = mipmaps[ i ];
                        _gl.texImage2D( Context3D.TEXTURE_2D, i, glFormat, glFormat, glType, mipmap.texImage() );

					}

					texture.generateMipmaps = false;

				} else {

                    _gl.texImage2D( Context3D.TEXTURE_2D, 0, glFormat, glFormat, glType, texture.image.texImage() );

				}

			}

            if ( texture.generateMipmaps && isImagePowerOfTwo ) _gl.generateMipmap( Context3D.TEXTURE_2D );

			texture.needsUpdate = false;

			if ( texture.onUpdate ) texture.onUpdate();

		} else {

            _gl.activeTexture( Context3D.TEXTURE0 + slot );
            _gl.bindTexture( Context3D.TEXTURE_2D, texture.__webglTexture );

		}

	};

	function clampToMaxSize ( image, maxSize ) {

		if ( image.width <= maxSize && image.height <= maxSize ) {

			return image;

		}

        // TODO: Downscaling of too large textures

        return image;

//		// Warning: Scaling through the canvas will only work with images that use
//		// premultiplied alpha.

//		var maxDimension = Math.max( image.width, image.height );
//		var newWidth = Math.floor( image.width * maxSize / maxDimension );
//		var newHeight = Math.floor( image.height * maxSize / maxDimension );

//		var canvas = document.createElement( 'canvas' );
//		canvas.width = newWidth;
//		canvas.height = newHeight;

//		var ctx = canvas.getContext( "2d" );
//		ctx.drawImage( image, 0, 0, image.width, image.height, 0, 0, newWidth, newHeight );

//		return canvas;

	}

	function setCubeTexture ( texture, slot ) {

		if ( texture.image.length === 6 ) {

			if ( texture.needsUpdate ) {

				if ( ! texture.image.__webglTextureCube ) {

					texture.addEventListener( 'dispose', onTextureDispose );

					texture.image.__webglTextureCube = _gl.createTexture();

					_this.info.memory.textures ++;

				}

                _gl.activeTexture( Context3D.TEXTURE0 + slot );
                _gl.bindTexture( Context3D.TEXTURE_CUBE_MAP, texture.image.__webglTextureCube );

                _gl.pixelStorei( Context3D.UNPACK_FLIP_Y_WEBGL, texture.flipY );

				var isCompressed = texture instanceof THREE.CompressedTexture;

				var cubeImage = [];

				for ( var i = 0; i < 6; i ++ ) {

					if ( _this.autoScaleCubemaps && ! isCompressed ) {

						cubeImage[ i ] = clampToMaxSize( texture.image[ i ], _maxCubemapSize );

					} else {

						cubeImage[ i ] = texture.image[ i ];

					}

				}

				var image = cubeImage[ 0 ],
				isImagePowerOfTwo = THREE.Math.isPowerOfTwo( image.width ) && THREE.Math.isPowerOfTwo( image.height ),
				glFormat = paramThreeToGL( texture.format ),
				glType = paramThreeToGL( texture.type );

                setTextureParameters( Context3D.TEXTURE_CUBE_MAP, texture, isImagePowerOfTwo );

				for ( var i = 0; i < 6; i ++ ) {

					if( !isCompressed ) {

                        _gl.texImage2D( Context3D.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, glFormat, glFormat, glType, cubeImage[ i ].texImage() );

					} else {
						
						var mipmap, mipmaps = cubeImage[ i ].mipmaps;

						for( var j = 0, jl = mipmaps.length; j < jl; j ++ ) {

							mipmap = mipmaps[ j ];
							if ( texture.format!==THREE.RGBAFormat ) {

                                _gl.compressedTexImage2D( Context3D.TEXTURE_CUBE_MAP_POSITIVE_X + i, j, glFormat, mipmap.width, mipmap.height, 0, mipmap.data );

							} else {
                                _gl.texImage2D( Context3D.TEXTURE_CUBE_MAP_POSITIVE_X + i, j, glFormat, mipmap.width, mipmap.height, 0, glFormat, glType, mipmap.data );
							}

						}
					}
				}

				if ( texture.generateMipmaps && isImagePowerOfTwo ) {

                    _gl.generateMipmap( Context3D.TEXTURE_CUBE_MAP );

				}

				texture.needsUpdate = false;

				if ( texture.onUpdate ) texture.onUpdate();

			} else {

                _gl.activeTexture( Context3D.TEXTURE0 + slot );
                _gl.bindTexture( Context3D.TEXTURE_CUBE_MAP, texture.image.__webglTextureCube );

			}

		}

	};

	function setCubeTextureDynamic ( texture, slot ) {

        _gl.activeTexture( Context3D.TEXTURE0 + slot );
        _gl.bindTexture( Context3D.TEXTURE_CUBE_MAP, texture.__webglTexture );

	};

	// Render targets

	function setupFrameBuffer ( framebuffer, renderTarget, textureTarget ) {

        _gl.bindFramebuffer( Context3D.FRAMEBUFFER, framebuffer );
        _gl.framebufferTexture2D( Context3D.FRAMEBUFFER, Context3D.COLOR_ATTACHMENT0, textureTarget, renderTarget.__webglTexture, 0 );

	};

	function setupRenderBuffer ( renderbuffer, renderTarget  ) {

        _gl.bindRenderbuffer( Context3D.RENDERBUFFER, renderbuffer );

		if ( renderTarget.depthBuffer && ! renderTarget.stencilBuffer ) {

            _gl.renderbufferStorage( Context3D.RENDERBUFFER, Context3D.DEPTH_COMPONENT16, renderTarget.width, renderTarget.height );
            _gl.framebufferRenderbuffer( Context3D.FRAMEBUFFER, Context3D.DEPTH_ATTACHMENT, Context3D.RENDERBUFFER, renderbuffer );

		/* For some reason this is not working. Defaulting to RGBA4.
		} else if( ! renderTarget.depthBuffer && renderTarget.stencilBuffer ) {

            _gl.renderbufferStorage( Context3D.RENDERBUFFER, Context3D.STENCIL_INDEX8, renderTarget.width, renderTarget.height );
            _gl.framebufferRenderbuffer( Context3D.FRAMEBUFFER, Context3D.STENCIL_ATTACHMENT, Context3D.RENDERBUFFER, renderbuffer );
		*/
		} else if ( renderTarget.depthBuffer && renderTarget.stencilBuffer ) {

            _gl.renderbufferStorage( Context3D.RENDERBUFFER, Context3D.DEPTH_STENCIL, renderTarget.width, renderTarget.height );
            _gl.framebufferRenderbuffer( Context3D.FRAMEBUFFER, Context3D.DEPTH_STENCIL_ATTACHMENT, Context3D.RENDERBUFFER, renderbuffer );

		} else {

            _gl.renderbufferStorage( Context3D.RENDERBUFFER, Context3D.RGBA4, renderTarget.width, renderTarget.height );

		}

	};

	this.setRenderTarget = function ( renderTarget ) {

		var isCube = ( renderTarget instanceof THREE.WebGLRenderTargetCube );

		if ( renderTarget && ! renderTarget.__webglFramebuffer ) {

			if ( renderTarget.depthBuffer === undefined ) renderTarget.depthBuffer = true;
			if ( renderTarget.stencilBuffer === undefined ) renderTarget.stencilBuffer = true;

			renderTarget.addEventListener( 'dispose', onRenderTargetDispose );

			renderTarget.__webglTexture = _gl.createTexture();

			_this.info.memory.textures ++;

			// Setup texture, create render and frame buffers

			var isTargetPowerOfTwo = THREE.Math.isPowerOfTwo( renderTarget.width ) && THREE.Math.isPowerOfTwo( renderTarget.height ),
				glFormat = paramThreeToGL( renderTarget.format ),
				glType = paramThreeToGL( renderTarget.type );

			if ( isCube ) {

				renderTarget.__webglFramebuffer = [];
				renderTarget.__webglRenderbuffer = [];

                _gl.bindTexture( Context3D.TEXTURE_CUBE_MAP, renderTarget.__webglTexture );
                setTextureParameters( Context3D.TEXTURE_CUBE_MAP, renderTarget, isTargetPowerOfTwo );

				for ( var i = 0; i < 6; i ++ ) {

					renderTarget.__webglFramebuffer[ i ] = _gl.createFramebuffer();
					renderTarget.__webglRenderbuffer[ i ] = _gl.createRenderbuffer();

                    _gl.texImage2D( Context3D.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, glFormat, renderTarget.width, renderTarget.height, 0, glFormat, glType, null );

                    setupFrameBuffer( renderTarget.__webglFramebuffer[ i ], renderTarget, Context3D.TEXTURE_CUBE_MAP_POSITIVE_X + i );
					setupRenderBuffer( renderTarget.__webglRenderbuffer[ i ], renderTarget );

				}

                if ( isTargetPowerOfTwo ) _gl.generateMipmap( Context3D.TEXTURE_CUBE_MAP );

			} else {

				renderTarget.__webglFramebuffer = _gl.createFramebuffer();

				if ( renderTarget.shareDepthFrom ) {

					renderTarget.__webglRenderbuffer = renderTarget.shareDepthFrom.__webglRenderbuffer;

				} else {

					renderTarget.__webglRenderbuffer = _gl.createRenderbuffer();

				}

                _gl.bindTexture( Context3D.TEXTURE_2D, renderTarget.__webglTexture );
                setTextureParameters( Context3D.TEXTURE_2D, renderTarget, isTargetPowerOfTwo );

                _gl.texImage2D( Context3D.TEXTURE_2D, 0, glFormat, renderTarget.width, renderTarget.height, 0, glFormat, glType, null );

                setupFrameBuffer( renderTarget.__webglFramebuffer, renderTarget, Context3D.TEXTURE_2D );

				if ( renderTarget.shareDepthFrom ) {

					if ( renderTarget.depthBuffer && ! renderTarget.stencilBuffer ) {

                        _gl.framebufferRenderbuffer( Context3D.FRAMEBUFFER, Context3D.DEPTH_ATTACHMENT, Context3D.RENDERBUFFER, renderTarget.__webglRenderbuffer );

					} else if ( renderTarget.depthBuffer && renderTarget.stencilBuffer ) {

                        _gl.framebufferRenderbuffer( Context3D.FRAMEBUFFER, Context3D.DEPTH_STENCIL_ATTACHMENT, Context3D.RENDERBUFFER, renderTarget.__webglRenderbuffer );

					}

				} else {

					setupRenderBuffer( renderTarget.__webglRenderbuffer, renderTarget );

				}

                if ( isTargetPowerOfTwo ) _gl.generateMipmap( Context3D.TEXTURE_2D );

			}

			// Release everything

			if ( isCube ) {

                _gl.bindTexture( Context3D.TEXTURE_CUBE_MAP, null );

			} else {

                _gl.bindTexture( Context3D.TEXTURE_2D, null );

			}

            _gl.bindRenderbuffer( Context3D.RENDERBUFFER, null );
            _gl.bindFramebuffer( Context3D.FRAMEBUFFER, null );

		}

		var framebuffer, width, height, vx, vy;

		if ( renderTarget ) {

			if ( isCube ) {

				framebuffer = renderTarget.__webglFramebuffer[ renderTarget.activeCubeFace ];

			} else {

				framebuffer = renderTarget.__webglFramebuffer;

			}

			width = renderTarget.width;
			height = renderTarget.height;

			vx = 0;
			vy = 0;

		} else {

			framebuffer = null;

			width = _viewportWidth;
			height = _viewportHeight;

			vx = _viewportX;
			vy = _viewportY;

		}

		if ( framebuffer !== _currentFramebuffer ) {

            _gl.bindFramebuffer( Context3D.FRAMEBUFFER, framebuffer );
			_gl.viewport( vx, vy, width, height );

			_currentFramebuffer = framebuffer;

		}

		_currentWidth = width;
		_currentHeight = height;

	};

	function updateRenderTargetMipmap ( renderTarget ) {

		if ( renderTarget instanceof THREE.WebGLRenderTargetCube ) {

            _gl.bindTexture( Context3D.TEXTURE_CUBE_MAP, renderTarget.__webglTexture );
            _gl.generateMipmap( Context3D.TEXTURE_CUBE_MAP );
            _gl.bindTexture( Context3D.TEXTURE_CUBE_MAP, null );

		} else {

            _gl.bindTexture( Context3D.TEXTURE_2D, renderTarget.__webglTexture );
            _gl.generateMipmap( Context3D.TEXTURE_2D );
            _gl.bindTexture( Context3D.TEXTURE_2D, null );

		}

	};

	// Fallback filters for non-power-of-2 textures

	function filterFallback ( f ) {

		if ( f === THREE.NearestFilter || f === THREE.NearestMipMapNearestFilter || f === THREE.NearestMipMapLinearFilter ) {

            return Context3D.NEAREST;

		}

        return Context3D.LINEAR;

	};

	// Map three.js constants to WebGL constants

	function paramThreeToGL ( p ) {

        if ( p === THREE.RepeatWrapping ) return Context3D.REPEAT;
        if ( p === THREE.ClampToEdgeWrapping ) return Context3D.CLAMP_TO_EDGE;
        if ( p === THREE.MirroredRepeatWrapping ) return Context3D.MIRRORED_REPEAT;

        if ( p === THREE.NearestFilter ) return Context3D.NEAREST;
        if ( p === THREE.NearestMipMapNearestFilter ) return Context3D.NEAREST_MIPMAP_NEAREST;
        if ( p === THREE.NearestMipMapLinearFilter ) return Context3D.NEAREST_MIPMAP_LINEAR;

        if ( p === THREE.LinearFilter ) return Context3D.LINEAR;
        if ( p === THREE.LinearMipMapNearestFilter ) return Context3D.LINEAR_MIPMAP_NEAREST;
        if ( p === THREE.LinearMipMapLinearFilter ) return Context3D.LINEAR_MIPMAP_LINEAR;

        if ( p === THREE.UnsignedByteType ) return Context3D.UNSIGNED_BYTE;
        if ( p === THREE.UnsignedShort4444Type ) return Context3D.UNSIGNED_SHORT_4_4_4_4;
        if ( p === THREE.UnsignedShort5551Type ) return Context3D.UNSIGNED_SHORT_5_5_5_1;
        if ( p === THREE.UnsignedShort565Type ) return Context3D.UNSIGNED_SHORT_5_6_5;

        if ( p === THREE.ByteType ) return Context3D.BYTE;
        if ( p === THREE.ShortType ) return Context3D.SHORT;
        if ( p === THREE.UnsignedShortType ) return Context3D.UNSIGNED_SHORT;
        if ( p === THREE.IntType ) return Context3D.INT;
        if ( p === THREE.UnsignedIntType ) return Context3D.UNSIGNED_INT;
        if ( p === THREE.FloatType ) return Context3D.FLOAT;

        if ( p === THREE.AlphaFormat ) return Context3D.ALPHA;
        if ( p === THREE.RGBFormat ) return Context3D.RGB;
        if ( p === THREE.RGBAFormat ) return Context3D.RGBA;
        if ( p === THREE.LuminanceFormat ) return Context3D.LUMINANCE;
        if ( p === THREE.LuminanceAlphaFormat ) return Context3D.LUMINANCE_ALPHA;

        if ( p === THREE.AddEquation ) return Context3D.FUNC_ADD;
        if ( p === THREE.SubtractEquation ) return Context3D.FUNC_SUBTRACT;
        if ( p === THREE.ReverseSubtractEquation ) return Context3D.FUNC_REVERSE_SUBTRACT;

        if ( p === THREE.ZeroFactor ) return Context3D.ZERO;
        if ( p === THREE.OneFactor ) return Context3D.ONE;
        if ( p === THREE.SrcColorFactor ) return Context3D.SRC_COLOR;
        if ( p === THREE.OneMinusSrcColorFactor ) return Context3D.ONE_MINUS_SRC_COLOR;
        if ( p === THREE.SrcAlphaFactor ) return Context3D.SRC_ALPHA;
        if ( p === THREE.OneMinusSrcAlphaFactor ) return Context3D.ONE_MINUS_SRC_ALPHA;
        if ( p === THREE.DstAlphaFactor ) return Context3D.DST_ALPHA;
        if ( p === THREE.OneMinusDstAlphaFactor ) return Context3D.ONE_MINUS_DST_ALPHA;

        if ( p === THREE.DstColorFactor ) return Context3D.DST_COLOR;
        if ( p === THREE.OneMinusDstColorFactor ) return Context3D.ONE_MINUS_DST_COLOR;
        if ( p === THREE.SrcAlphaSaturateFactor ) return Context3D.SRC_ALPHA_SATURATE;

		if ( _glExtensionCompressedTextureS3TC !== undefined ) {

			if ( p === THREE.RGB_S3TC_DXT1_Format ) return _glExtensionCompressedTextureS3TC.COMPRESSED_RGB_S3TC_DXT1_EXT;
			if ( p === THREE.RGBA_S3TC_DXT1_Format ) return _glExtensionCompressedTextureS3TC.COMPRESSED_RGBA_S3TC_DXT1_EXT;
			if ( p === THREE.RGBA_S3TC_DXT3_Format ) return _glExtensionCompressedTextureS3TC.COMPRESSED_RGBA_S3TC_DXT3_EXT;
			if ( p === THREE.RGBA_S3TC_DXT5_Format ) return _glExtensionCompressedTextureS3TC.COMPRESSED_RGBA_S3TC_DXT5_EXT;

		}

		return 0;

	};

	// Allocations

	function allocateBones ( object ) {

		if ( _supportsBoneTextures && object && object.useVertexTexture ) {

			return 1024;

		} else {

			// default for when object is not specified
			// ( for example when prebuilding shader
			//   to be used with multiple objects )
			//
			// 	- leave some extra space for other uniforms
			//  - limit here is ANGLE's 254 max uniform vectors
			//    (up to 54 should be safe)

            var nVertexUniforms = _gl.getParameter( Context3D.MAX_VERTEX_UNIFORM_VECTORS );
			var nVertexMatrices = Math.floor( ( nVertexUniforms - 20 ) / 4 );

			var maxBones = nVertexMatrices;

			if ( object !== undefined && object instanceof THREE.SkinnedMesh ) {

				maxBones = Math.min( object.bones.length, maxBones );

				if ( maxBones < object.bones.length ) {

                    console.warn( "Canvas3DRenderer: too many bones - " + object.bones.length + ", this GPU supports just " + maxBones + " (try OpenGL instead of ANGLE)" );

				}

			}

			return maxBones;

		}

	};

	function allocateLights( lights ) {

		var dirLights = 0;
		var pointLights = 0;
		var spotLights = 0;
		var hemiLights = 0;

		for ( var l = 0, ll = lights.length; l < ll; l ++ ) {

			var light = lights[ l ];

			if ( light.onlyShadow || light.visible === false ) continue;

			if ( light instanceof THREE.DirectionalLight ) dirLights ++;
			if ( light instanceof THREE.PointLight ) pointLights ++;
			if ( light instanceof THREE.SpotLight ) spotLights ++;
			if ( light instanceof THREE.HemisphereLight ) hemiLights ++;

		}

		return { 'directional' : dirLights, 'point' : pointLights, 'spot': spotLights, 'hemi': hemiLights };

	};

	function allocateShadows( lights ) {

		var maxShadows = 0;

		for ( var l = 0, ll = lights.length; l < ll; l++ ) {

			var light = lights[ l ];

			if ( ! light.castShadow ) continue;

			if ( light instanceof THREE.SpotLight ) maxShadows ++;
			if ( light instanceof THREE.DirectionalLight && ! light.shadowCascade ) maxShadows ++;

		}

		return maxShadows;

	};

	// Initialization

	function initGL() {

		try {

			var attributes = {
				alpha: _alpha,
				premultipliedAlpha: _premultipliedAlpha,
				antialias: _antialias,
				stencil: _stencil,
				preserveDrawingBuffer: _preserveDrawingBuffer
			};

			_gl = _context || _canvas.getContext( 'webgl', attributes ) || _canvas.getContext( 'experimental-webgl', attributes );

			if ( _gl === null ) {

				throw 'Error creating WebGL context.';

			}

		} catch ( error ) {

			console.error( error );

		}

		_glExtensionTextureFloat = _gl.getExtension( 'OES_texture_float' );
		_glExtensionTextureFloatLinear = _gl.getExtension( 'OES_texture_float_linear' );
		_glExtensionStandardDerivatives = _gl.getExtension( 'OES_standard_derivatives' );

		_glExtensionTextureFilterAnisotropic = _gl.getExtension( 'EXT_texture_filter_anisotropic' ) || _gl.getExtension( 'MOZ_EXT_texture_filter_anisotropic' ) || _gl.getExtension( 'WEBKIT_EXT_texture_filter_anisotropic' );

		_glExtensionCompressedTextureS3TC = _gl.getExtension( 'WEBGL_compressed_texture_s3tc' ) || _gl.getExtension( 'MOZ_WEBGL_compressed_texture_s3tc' ) || _gl.getExtension( 'WEBKIT_WEBGL_compressed_texture_s3tc' );

		if ( ! _glExtensionTextureFloat ) {

            console.log( 'THREE.Canvas3DRenderer: Float textures not supported.' );

		}

		if ( ! _glExtensionStandardDerivatives ) {

            console.log( 'THREE.Canvas3DRenderer: Standard derivatives not supported.' );

		}

		if ( ! _glExtensionTextureFilterAnisotropic ) {

            console.log( 'THREE.Canvas3DRenderer: Anisotropic texture filtering not supported.' );

		}

		if ( ! _glExtensionCompressedTextureS3TC ) {

            console.log( 'THREE.Canvas3DRenderer: S3TC compressed textures not supported.' );

		}

		if ( _gl.getShaderPrecisionFormat === undefined ) {

			_gl.getShaderPrecisionFormat = function() {

				return {
					"rangeMin"  : 1,
					"rangeMax"  : 1,
					"precision" : 1
				};

			}
		}

	};

	function setDefaultGLState () {

		_gl.clearColor( 0, 0, 0, 1 );
		_gl.clearDepth( 1 );
		_gl.clearStencil( 0 );

        _gl.enable( Context3D.DEPTH_TEST );
        _gl.depthFunc( Context3D.LEQUAL );

        _gl.frontFace( Context3D.CCW );
        _gl.cullFace( Context3D.BACK );
        _gl.enable( Context3D.CULL_FACE );

        _gl.enable( Context3D.BLEND );
        _gl.blendEquation( Context3D.FUNC_ADD );
        _gl.blendFunc( Context3D.SRC_ALPHA, Context3D.ONE_MINUS_SRC_ALPHA );

		_gl.viewport( _viewportX, _viewportY, _viewportWidth, _viewportHeight );
		
		_gl.clearColor( _clearColor.r, _clearColor.g, _clearColor.b, _clearAlpha );

	};

	// default plugins (order is important)

    //this.shadowMapPlugin = new THREE.ShadowMapPlugin();
    //this.addPrePlugin( this.shadowMapPlugin );

    //this.addPostPlugin( new THREE.SpritePlugin() );
    //this.addPostPlugin( new THREE.LensFlarePlugin() );

};
