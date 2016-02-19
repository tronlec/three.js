Qt.include("three.js")
Qt.include("OrbitControls.js")

var camera, scene, renderer, loader, orbitControls;

var cameraIndex = 0;
var cameras = [];
var defaultCamera = null;

var gltf = null;

var gl;

function getMeshByName(rootObj, objName) {
    var obj = rootObj.getObjectByName(objName);
    if (obj) {
        traceProperties(obj.name, obj);
        for (var i = obj.children.length - 1; i >= 0 ; i--) {
            var child = obj.children[i];
            if (child instanceof THREE.Mesh)
                return child;
        }
    }
    return null;
}

function traceProperties(offsetStr, obj) {
    if (obj instanceof THREE.Mesh) {
        console.log(offsetStr + " -> Is a mesh");
        if (obj.geometry instanceof THREE.BufferGeometry)
            console.log(offsetStr + " -> Uses BufferGeometry");
    }
}

function traceGLTF(gltf) {
    var keys = Object.keys(gltf);
    console.log("GLTF keys: " + keys);
}

function traceChildren(obj, depth) {
    if (depth === 0) {
        console.log("Root object: \'" + obj.name + "\'" + " type: \'" + obj.type + "\'");
        traceProperties("", obj);
    }
    depth++;
    for (var i = obj.children.length - 1; i >= 0 ; i--) {
        var child = obj.children[i];
        var offsetStr = "";
        for (var k = 0; k < depth; k++)
            offsetStr += " ";
        console.log(offsetStr + "-> " + i + ": \'" + child.name + "\'" + " type: \'" + obj.type + "\'");
        traceProperties(offsetStr, child);
        traceChildren(child, depth)
    }
}

function initializeGL(canvas, eventSource) {
    scene = new THREE.Scene();
    defaultCamera = new THREE.PerspectiveCamera(75, canvas.width / canvas.height, 0.1, 1000);
    defaultCamera.position.z = 5;
    defaultCamera.position.y = 5;
    camera = defaultCamera;

    gl = canvas.getContext("canvas3d", {depth:true, antialias:false, alpha:false});

    renderer = new THREE.Canvas3DRenderer(
                { canvas: canvas, antialias: true, devicePixelRatio: canvas.devicePixelRatio });
    renderer.setSize(canvas.width, canvas.height);

    gl.clearColor(0.98, 0.98, 0.98, 1.0);
    gl.clearDepth(1.0);

    loader = new THREE.glTFLoader(false, gl);
    loader.useBufferGeometry = true;
    var loadStartTime = Date.now();
    console.log("Starting model load");
    loader.load("cellphone_scene.qgltf", function(data) {
        console.log("Model loaded " + data);
        gltf = data;

        var object = gltf.scene;
        traceGLTF(gltf);
        traceChildren(object, 0);

        var loadEndTime = Date.now();

        var loadTime = (loadEndTime - loadStartTime) / 1000;

        console.log("Load time: " + loadTime.toFixed(2) + " seconds.");

        cameraIndex = 0;
        cameras = [];
        if (gltf.cameras && gltf.cameras.length) {
            var len = gltf.cameras.length;
            console.log(len + " camera(s)")
            for (var i = 0; i < len; i++) {
                cameras.push(gltf.cameras[i]);
            }
            switchCamera(1);
        } else {
            console.log("Loaded scene defines no cameras, use default camera.");
            switchCamera(0);
        }
        camera.aspect = canvas.width / canvas.height;

        orbitControls = new THREE.OrbitControls(camera, eventSource);

        if (gltf.lights && gltf.lights.length) {
            len = gltf.lights.length;
            console.log(len + " light(s)");
        } else {
            console.log("Loaded scene has no lights, create default lights.");
            var ambientLight = new THREE.AmbientLight(0x666666);
            scene.add(ambientLight);
            var light = new THREE.DirectionalLight(0xffffff, 1);
            light.position.x = 5;
            light.position.y = 5;
            light.position.z = 5;
            scene.add(light);
        }

        scene.add(object);
    });
    console.log("Model load started");
}

function resizeGL(canvas) {
    if (!defaultCamera) {
        return;
    }

    defaultCamera.aspect = canvas.width / canvas.height;
    defaultCamera.updateProjectionMatrix();

    var i, len = cameras.length;
    for (i = 0; i < len; i++) {
        cameras[i].aspect = canvas.width / canvas.height;
        cameras[i].updateProjectionMatrix();
    }

    renderer.setPixelRatio(canvas.devicePixelRatio);
    renderer.setSize(canvas.width, canvas.height);
}

function paintGL(canvas) {
    THREE.glTFShaders.update(scene, camera);
    if (orbitControls)
        orbitControls.update();

    renderer.render(scene, camera);
}

function switchCamera(index)
{
    scene.remove(camera)
    cameraIndex = index;
    camera = defaultCamera;
    if (cameraIndex >= 1 && cameraIndex <= cameras.length) {
        camera = cameras[cameraIndex - 1];
    }
    camera.position.copy(camera.parent.position);
    camera.up = new THREE.Vector3(0, 1, 0);
    camera.up.applyQuaternion(camera.parent.quaternion);
    camera.updateProjectionMatrix();
    scene.add(camera)
}
