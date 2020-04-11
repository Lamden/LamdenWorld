BABYLON.Database.IDBStorageEnabled = false;
var canvas = document.getElementById("renderCanvas");
var engine = new BABYLON.Engine(canvas, true);

var scene = new BABYLON.Scene(engine);
scene.fogMode = 3;
scene.fogStart = 150;
scene.fogEnd = 350;
scene.fogColor = color(.7,.85,1);
scene.ambientColor = color(1,1,1);
scene.clearColor = scene.fogColor;

var shadowGenerator;
var shadowRenderList = [];
var reflectionRenderList = [];
scene.ambientColor = color(.5,.5,.5);

var camera = new BABYLON.ArcRotateCamera('camera', 0, .5, 300, new BABYLON.Mesh('Camera Target', scene), scene);
//var camera = new BABYLON.ArcRotateCamera('camera', 1, 1, 100, v(0,0,0), scene);
//var camera = new BABYLON.FollowCamera('camera', v(0,10,0), scene);
camera.panningAxis = v(1,0,1);
camera.speed = 2;
camera.attachControl(canvas, true, false, 2);
camera.lowerRadiusLimit = 2;
camera.wheelPrecision = 3;
camera.radius = 150;
camera.inertia = .9;
scene.activeCamera = camera;

var sun = new BABYLON.DirectionalLight('sun', v(-.4,-.7,.2), scene);
var shadowMesh = new BABYLON.Mesh.CreateBox('Shadow Mesh', 20, scene);
shadowMesh.isVisible = false;
sun.shadowMesh = shadowMesh;

/*var skybox = BABYLON.Mesh.CreateBox("skyBox", 1024, scene);
skybox.infiniteDistance = true;
skybox.applyFog = false;
skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
skyboxMaterial.backFaceCulling = false;
skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture('skybox/', scene);
skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
skyboxMaterial.fogEnabled = false;
skybox.material = skyboxMaterial;
skyboxMaterial.diffuseColor = BABYLON.Color3.Black();
skyboxMaterial.ambientColor = BABYLON.Color3.Black();
skyboxMaterial.specularColor = BABYLON.Color3.Black();
reflectionRenderList.push(skybox);*/

//torch = new BABYLON.PointLight('Torch', v(0,0,0), scene);
//torch.intensity = .6;
//torch.range = 50;

shadowGenerator = new BABYLON.ShadowGenerator(2048, sun);
shadowGenerator.getShadowMap().renderList = shadowRenderList;
shadowGenerator.getShadowMap().refreshRate = 30;
shadowGenerator.bias = .00003;
shadowGenerator.usePoissonSampling = true;
shadowGenerator._darkness = .2

function randomArray(a) {
	return a[Math.floor(Math.random() * a.length)];
}
function clamp(num, min, max) {
  return num <= min ? min : num >= max ? max : num;
}
function v(x, y, z, w) {
	if (w !== undefined) {
		return new BABYLON.Vector4(x, y, z, w);
	}
	if (z !== undefined) {
		return new BABYLON.Vector3(x, y, z);
	}
	return new BABYLON.Vector2(x, y);
}
function color(r, g, b, a) {
	if (a) {
		return new BABYLON.Color4(r, g, b, a);
	}
	return new BABYLON.Color3(r, g, b);
}
let black = color(0,0,0);
let gray = color(.5,.5,.5);
let white = color(1,1,1);
function h(v) {
	return 0;
	if (ground) {
		return ground.getHeightAtCoordinates(v.x, v.z);
	}
	var x = ground.x + Math.round(v.x / 1024);
	var z = ground.y - Math.round(v.z / 1024);
	if (!tiles || !tiles[x + '-' + z]) {
		return false;
	}
	var ground = tiles[x + '-' + z].ground;
	if (!ground || !ground.getVerticesData(BABYLON.VertexBuffer.PositionKind)) {
		return null;
	}
	return ground.getHeightAtCoordinates(v.x, v.z);
}
function mat(options) {
	var options = options || {};
	var name = options.name || 'Material#' + Math.round(Math.random() * 999);
	var mat = new BABYLON.StandardMaterial(name, scene);
	mat.ambientColor = color(.5,.5,.5);
	if (options.dColor) {
		mat.diffuseColor = options.dColor;
	}
	if (options.ambient) {
		if (options.ambient.r !== undefined) {
			mat.ambientColor = options.ambient;
		} else {
			mat.ambientTexture = texture(options.ambient);
		}
	}
	if (options.diffuse) {
		if (options.diffuse.r !== undefined) {
			mat.diffuseColor = options.diffuse;
		} else {
			mat.diffuseTexture = texture(options.diffuse);
		}
	}
	if (options.specular) {
		mat.specularColor = options.specular;
	} else {
		mat.specularColor = color(0,0,0);
	}
	if (options.bump) {
		mat.bumpTexture = texture(options.bump);
	}
	return mat;
}
function texture(url) {
	return new BABYLON.Texture(url, scene);
}

function normal(vec) {
	return v(0,1,0);
	return ground.getNormalAtCoordinates(vec.x, vec.z);
	var options = {normal: v(0,0,0)}
	ground.getHeightFromMap(vec.x, vec.z, options);
	return options.normal;
}
function distance(a, b) {
	return BABYLON.Vector3.Distance(a, b);
}
function angle2b(a, b) {
	if (!a || !b) {
		return;
	}
	dx = (a.x - b.x);
	dz = (a.z - b.z);
	var r = Math.atan(dx / dz);
	if (dz < 0) {
		r -= Math.PI;
	}
	return r;
}
function angleAtSegment(curve, i) {
	i = Math.min(curve.length - 1, i);
	i = Math.max(0, i);
	return i == curve.length - 1 ? angle2b(curve[i - 1], curve[i]) : angle2b(curve[i], curve[i + 1]);
}
// finds vector distance p from vector p perpendicular to angle a.
function distPerpendicular(p, a, d) {
	return v(
		p.x - Math.cos(a) * d,
		p.y,
		p.z + Math.sin(a) * d
	);
}
function distPerpendicularXY(p, a, d) {
	return v(
		p.x - Math.cos(a) * d,
		p.y + Math.sin(a) * d,
		p.z
	);
}

// finds vector distance p from vector p perpendicular to angle a.
function distHorizontal(p, a, d) {
	return v(
		p.x - Math.sin(a) * d,
		p.y,
		p.z - Math.cos(a) * d
	);
}
function normal2rot(mesh, z) { // mesh should not have parent
	if (mesh.position.y > h(mesh.position) + 2) {
		mesh.rotation.x = 0;
		mesh.rotation.z = 0;
		return;
	}
	if (!mesh.targetRotation) {
		mesh.targetRotation = mesh.rotation.clone();
	}
	var r = mesh.rotation.y;
	var n = normal(mesh.position);
	var x = Math.sin(r) * n.x;
	x += Math.cos(r) * n.z;
	mesh.targetRotation.x = x;
	mesh.rotation.x += (mesh.targetRotation.x - mesh.rotation.x) / 5;
	if (z) {
		z = Math.sin(r - Math.PI / 2) * n.x;
		z += Math.cos(r - Math.PI / 2) * n.z;
		mesh.targetRotation.z = z;
		mesh.rotation.z += (mesh.targetRotation.z - mesh.rotation.z) / 5;
	}
}



function getAbsoluteRotation(mesh) {
	var rotation = mesh.rotation.clone();
	while (mesh.parent) {
		rotation.addInPlace(mesh.parent.rotation);
		mesh = mesh.parent;
	}
	return rotation;
}
function setAbsoluteRotation(mesh, rotation) {
	rotation = rotation.clone();
	var target = mesh;
	while (mesh.parent) {
		rotation.subtractInPlace(mesh.parent.rotation);
		mesh = mesh.parent;
	}
	target.rotation = rotation;
}
function getLocalPosition(parent, position) {
	var invertParentWorldMatrix = parent.getWorldMatrix().clone();
	return BABYLON.Vector3.TransformCoordinates(position, invertParentWorldMatrix);
}
function getWorldPosition(parent, position) {
	parent.computeWorldMatrix(true);
	var invertParentWorldMatrix = parent.getWorldMatrix().clone();
	invertParentWorldMatrix.invert();
	return BABYLON.Vector3.TransformCoordinates(position, invertParentWorldMatrix);
}

function lineSegments(start, end, num) {
	var points = [];
	var diff = end.subtract(start);
	var step = v(
		diff.x / num,
		diff.y / num,
		diff.z / num
	);
	for (var i = 0; i < num; i++) {
		points.push(v(
			start.x + (step.x * i),
			start.y + (step.y * i),
			start.z + (step.z * i)
		));
	}
	points.push(end);
	return points;
}
function circleCoords(radius, segments, hemi) {
	var points = [];
	for (var i = 0; i <= segments; i++) {
		var angle = Math.PI * (hemi ? 1 : 2) / segments * i;
		points.push(v(radius * Math.cos(angle), radius * Math.sin(angle), 0));
	}
	if (!hemi) {
		points.push(points[0].clone());
	} else {
		points.push(BABYLON.Vector3.Zero().subtract(points[0]));
	}
	return points;
}

// screen functions
function getScreenCoords(position) {
	var worldMatrix = BABYLON.Matrix.Identity();
	var transformMatrix = scene.getTransformMatrix();
	var viewport = scene.activeCamera.viewport;
	var c = BABYLON.Vector3.Project(position, worldMatrix, transformMatrix, viewport);
	return v(c.x * canvas.width / window.devicePixelRatio, c.y * canvas.height / window.devicePixelRatio, c.z);
}

// polygon  functions
function getBounds(coords) {
	var min = coords[0].clone();
	var max = coords[0].clone();
	for (var c in coords) {
		min.x = Math.min(min.x, coords[c].x);
		max.x = Math.max(max.x, coords[c].x);
		min.y = Math.min(min.y, coords[c].y);
		max.y = Math.max(max.y, coords[c].y);
		min.z = Math.min(min.z, coords[c].z);
		max.z = Math.max(max.z, coords[c].z);
	}
	return [min, max];
}

function pointInPolygon(x, y, coords) {

	var cornersX = [];
	var cornersY = [];
	for (var c in coords) {
		cornersX.push(coords[c].x);
		cornersY.push(coords[c].z);
	}

	var i, j=cornersX.length-1 ;
	var oddNodes=0;

	var polyX = cornersX;
	var polyY = cornersY;

	for (i=0; i<cornersX.length; i++) {
		if ((polyY[i]< y && polyY[j]>=y ||  polyY[j]< y && polyY[i]>=y) &&  (polyX[i]<=x || polyX[j]<=x)) {
		  oddNodes^=(polyX[i]+(y-polyY[i])/(polyY[j]-polyY[i])*(polyX[j]-polyX[i])<x);
		}
		j=i;
	}
	return oddNodes == 1;
}
function polygonArea(coords) {
	var cornersX = [];
	var cornersY = [];
	for (var c in coords) {
		cornersX.push(coords[c].x);
		cornersY.push(coords[c].z);
	}

	var area = 0;         // Accumulates area in the loop
	var j = coords.length - 1;  // The last vertex is the 'previous' one to the first vertex
	var numPoints = coords.length;

	for (i=0; i<numPoints; i++) {
		area += (cornersX[j]+cornersX[i]) * (cornersY[j]-cornersY[i]);
		j = i;  //j is previous vertex to i
	}
	return Math.abs(area / 2);
}
function isClockWise(coords) {
	var result = 0;
	for (var c = 1; c < coords.length; c++) {
		result += (coords[c].x - coords[c - 1].x) * (coords[c].z + coords[c - 1].z);
	}
	return result > 0;
}
function coordCenter(coords) {
	coords = coords.slice();
	if (distance(coords[0], coords[coords.length - 1]) < .01) {
		coords.pop();
	}
	var avg = v(0,0,0);
	for (var c in coords) {
		avg.x += coords[c].x;
		avg.y += coords[c].y;
		avg.z += coords[c].z;
	}
	avg.scaleInPlace(1 / coords.length);
	return avg;
}

// get query string parameter
function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

sourceModels = {}; // source models in case they are not in scene.meshes
meshTransformationData = {}; // mTD[materialName][meshName][numID];
modelSPS = {}; // SPSs
shapeIDs = {};
updateSPS = {}; // set true if sps needs update
dynamicSPS = {}; // prefills SPS with set amount, only does updateParticles(); intended for only one shape, but multiple possible

function addModel(mesh, position, rotation, scaling, c) {
	//mesh = scene.getMeshByName(mesh);
	if (!mesh || !mesh.name) {
		console.error('Cannot find model: ' + mesh);
		return;
	}
	var name = mesh.name;
	if (!sourceModels[name]) {
		sourceModels[name] = mesh;
	}

	var id = mesh.material.name;
	if (!meshTransformationData[id]) {
		meshTransformationData[id] = {};
		updateSPS[id] = {};
	}
	if (!meshTransformationData[id][name]) {
		meshTransformationData[id][name] = [];
	}
	if (!position) {
		position = mesh.getAbsolutePosition();
		rotation = getAbsoluteRotation(mesh);
	}
	if (!scaling) {
		scaling = 1;
	}
	if (!c && mesh.getVerticesDataKinds().indexOf('color') > -1) {
		c = color(
			mesh.getVerticesData('color')[0],
			mesh.getVerticesData('color')[1],
			mesh.getVerticesData('color')[2],
		);
	}
	// position, rotation, scaling, color, originalScaling
	meshTransformationData[id][name].push([position, rotation, scaling, c, scaling]);
	updateSPS[id] = true;
	mesh.isVisible = false;
	mesh.freezeWorldMatrix();
	return meshTransformationData[id][name].length - 1;
}
function removeModel(mesh) {
	if (!mesh) {
		return false;
	}
	var name = mesh.name;
	var id = mesh.material.name;
	if (!meshTransformationData[id]) {
		console.log('Could not remove model, no SPS for material');
		return false;
	}
	if (!meshTransformationData[id][name]) {
		console.log('Could not remove model, object not found in SPS');
		return false;
	}
	delete meshTransformationData[id][name];
	updateSPS[id] = true;
	return true;
}
function hideMeshInSPS(mesh) {
	if (!mesh) {
		return false;
	}
	var mat = mesh.material.name;
	var name = mesh.name;
	if (!modelSPS[mat]) {
		return false;
	}
	if (!meshTransformationData[mat][name]) {
		return false;
	}
	meshTransformationData[mat][name][0][2] = .01;
}
function showMeshInSPS(mesh) {
	if (!mesh) {
		return false;
	}
	var mat = mesh.material.name;
	var name = mesh.name;
	if (!modelSPS[mat]) {
		return false;
	}
	if (!meshTransformationData[mat][name]) {
		return false;
	}
	meshTransformationData[mat][name][0][2] = 1;
}
function updateMeshInSPS(mesh, color) {
	if (!mesh || mesh.behavior) {
		return false;
	}
	var mat = mesh.material.name;
	var name = mesh.name;
	if (!modelSPS[mat]) {
		return false;
	}
	if (!meshTransformationData[mat][name]) {
		return false;
	}
	//meshTransformationData[mat][name][0][0] = mesh.position;
	//meshTransformationData[mat][name][0][1] = mesh.rotation;
	//meshTransformationData[mat][name][0][2] = mesh.scaling;
	meshTransformationData[mat][name][0][3] = color;
}
function updateParticle(t) {
	var shapeID = shapeIDs[this.id][t.shapeId];
	if (!shapeID) {
		return t;
	}
	var data = meshTransformationData[this.id][shapeID][t.idxInShape];
	if (!data && dynamicSPS[this.id]) {
		data = [v(0,1000,0), v(0,0,0), .001]; // hide unused particesl in dynamicSPS
	}
	var position = data[0];
	t.position = position;
	t.rotation = data[1];
	if (data[1].w) {
		t.quaternion = data[1];
	}
	if (data[2].x) {
		t.scale = v(data[2].x, data[2].y, data[2].z);
	} else {
		t.scale = v(1,1,1).scale(data[2]);
	}
	var c = data[3] || color(1,1,1);// || Math.random() * .7 + .3;
	t.color = c.toColor4();
	return t;
}
function updateSPSMeshes() {
	//return false;
	for (var id in updateSPS) {
		if (modelSPS[id] && modelSPS[id].mesh && !dynamicSPS[id]) {
			modelSPS[id].dispose();
		}
		if (!dynamicSPS[id] || !modelSPS[id]) {
			modelSPS[id] = new BABYLON.SolidParticleSystem('aaaSPS' + id, scene);
			modelSPS[id].updateParticle = updateParticle;
//			modelSPS[id].setParticles = updateParticle;
			modelSPS[id].id = id;
			shapeIDs[id] = {};
			var c = 0;
			for (var m in meshTransformationData[id]) {
				c += meshTransformationData[id][m].length;
				var model = sourceModels[m];
				if (!model) {
					console.warn('Could not find ' + m);
					continue;
				}
				if (!model.getVerticesData('position')) {
					console.warn('mesh is empty ' + m);
					continue;
				}
				var shapeIndex = modelSPS[id].addShape(model, dynamicSPS[id] ? dynamicSPS[id] : meshTransformationData[id][m].length);
				//var shapeIndex = modelSPS[id].addShape(model, meshTransformationData[id][m].length);
				shapeIDs[id][shapeIndex] = m;
			}
			var spsMesh = modelSPS[id].buildMesh();
			spsMesh.material = scene.getMaterialByName(id);
			shadowRenderList.push(spsMesh);
			spsMesh.receiveShadows = true;
	//		if ((!spsMesh.material.reflectionTexture || !spsMesh.material.reflectionTexture.renderList)) {
//				reflectionRenderList.push(spsMesh);
				World.reflect.push(spsMesh);
	//		}
	//		if (water && water.material.refractionTexture) {
//				World.reflect.push(spsMesh);
	//		}
		}
		var t0 = performance.now();
		modelSPS[id].computeBoundingBox = true;
		modelSPS[id].setParticles();
		modelSPS[id].refreshVisibleSize();
		modelSPS[id].mesh.freezeWorldMatrix();
		var t1 = performance.now();
//		console.trace();
//		console.log(id + ' : ' + (t1 - t0));
	}
	updateSPS = {};
}

function dumpMats() {
	for (var m in scene.materials) {
		console.log(scene.materials[m].name, scene.materials[m].isFrozen);
	}
}
function dumpMeshes() {
	for (var m in scene.meshes) {
		console.log(scene.meshes[m].name, scene.meshes[m].isWorldMatrixFrozen, scene.meshes[m].getTotalVertices());
	}
}


// =========
// Turbo SPS
// =========
// not in use atm
var SPS = function(name, workerNb, scene) {
    this.name = name;
    this.scene = scene;
    this.particleNb = 0;
    // Tmp particle object to mask the array access
    this.particle = {
        idx: 0,                        // particle index
        position: BABYLON.Vector3.Zero(),
        rotation: BABYLON.Vector3.Zero(),
        scaling: BABYLON.Vector3.Zero(),
        velocity: BABYLON.Vector3.Zero(),
        color: new BABYLON.Color4(1., 1., 1., 1.),
        uvs: new BABYLON.Vector4(0., 0., 1., 1.),
        alive: true,
        isVisible: true
    };

    this.stride = 20;                      // stride in the transforms array
    this.shiftInd = 0;                     // indice shift
    this.transforms = undefined;           // particle transformations (posx, posy, posz, rotx, roty, rotz, scalx, scaly, scalz)
    this.localPos = [];                    // mesh vertex local positions  (x, y, z) * particle shape nb of points
    this.localNor = [];                    // mesh local normals
    this.localUVs = [];                    // mesh local uvs
    this.localCol = [];                    // mesh local colors
    this.indices = [];                     // mesh indices
    this.shapeLengths = [];                // length of each particle shape
    this.pPosIndexes = [];                 // index of each particle in the positions array
    this.pPos = 0;                         // current index
    this.posBuffer= undefined;             // the vertex buffer
    this.norBuffer = undefined;            // the normal buffer
    this.uvsBuffer = undefined             // the uvs buffer
    this.norShared = undefined;            // shared buffers for the worker communication
    this.posShared = undefined;
    this.mesh = undefined;

    this.rotated = BABYLON.Vector3.Zero();
    this.quaternion = new BABYLON.Vector4(0., 0., 0., 0.);
    this.rotMatrix = new Array(10);
    this.halfroll = 0.;
    this.halfpitch = 0.;
    this.halfyaw = 0.;
    this.sinRoll = 0.;
    this.cosRoll = 0.;
    this.sinPitch = 0.;
    this.cosPitch = 0.;
    this.sinYaw = 0.;
    this.cosYaw = 0.;

    this.workerNb = workerNb || 2;
    this.workers = [];
    this.finishedWorkers = [];
    this.workerURL = "spsProtoWorker-worker.js";
    for (var w = 0; w < this.workerNb; w++) {
        this.workers.push(new Worker(this.workerURL));
        this.finishedWorkers.push(true);
    }

};

SPS.prototype.updateParticle = function() { return; };

SPS.prototype.addShape = function(mesh, nb) {
    var meshInd = mesh.getIndices();
    var meshPos = mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);
    var meshNor = mesh.getVerticesData(BABYLON.VertexBuffer.NormalKind);
    var meshUVs = mesh.getVerticesData(BABYLON.VertexBuffer.UVKind);
    var meshCol = mesh.getVerticesData(BABYLON.VertexBuffer.ColorKind);
    var l = (meshPos.length / 3)|0;

    for (var m = 0; m < nb; m++) {
        this.addElementsToRef(meshInd, this.shiftInd, this.indices);
        this.addElementsToRef(meshPos, 0, this.localPos);
        this.addElementsToRef(meshNor, 0, this.localNor,);
        this.addElementsToRef(meshUVs, 0, this.localUVs);
        if (meshCol) {
            this.addElementsToRef(meshCol, 0, this.localCol);
        }
        this.shapeLengths.push(l);
        this.shiftInd += l;
        this.pPosIndexes.push(this.pPos);
        this.pPos += l * 3;
    }
    this.particleNb += nb;
};

SPS.prototype.addElementsToRef = function(fromArray, shift, toArray) {
    for (var i = 0; i < fromArray.length; i++) {
        toArray.push(fromArray[i] + shift);
    }
};

SPS.prototype.buildMesh = function() {
    this.posShared = new Float32Array(new SharedArrayBuffer(this.localPos.length * Float32Array.BYTES_PER_ELEMENT));
    this.norShared = new Float32Array(new SharedArrayBuffer(this.localNor.length * Float32Array.BYTES_PER_ELEMENT));
    this.posBuffer = new Float32Array(this.localPos);
    this.norBuffer = new Float32Array(this.localNor);

    this.transforms = new Float32Array(new SharedArrayBuffer(this.stride * this.particleNb * Float32Array.BYTES_PER_ELEMENT));
    // buffer init
    for (var t = 0; t < this.transforms.length; t++) {
        this.transforms[t] = 0.0;
    }
    for (var p = 0; p < this.posBuffer.length; p++) {
        this.posShared[p] = this.posBuffer[p];
        this.norShared[p] = this.norShared[p];
    }

    this.uvsBuffer = new Float32Array(this.localUVs);
    if (this.localCol.length) {
        this.colBuffer = new Float32Array(this.localCol);
    }

    var vertexData = new BABYLON.VertexData();
    vertexData.indices = this.indices;
    vertexData.positions = this.posBuffer;
    vertexData.normals = this.norBuffer;
    vertexData.uvs = this.uvsBuffer;
    // colors to be done ...
    var mesh = new BABYLON.Mesh(this.name, scene);
    vertexData.applyToMesh(mesh, true);
    this.mesh = mesh;

    // Worker initialization
    // pass the workers the local positions and normals once for all
    // then share the normals and positions buffers
    var range = (this.particleNb / this.workerNb)|0;
    var sps = this;
    for (var w = 0; w < this.workerNb; w++) {
        var end = range * (w + 1);
        end = (end < this.particleNb) ? end : this.particleNb - 1;
        // worker initialization message
        var initMsg = {
            id: w,
            start: range * w,
            end: end,
            localPos: this.localPos,
            localNor: this.localNor,
            shapeLengths: this.shapeLengths,
            pPosIndexes: this.pPosIndexes,
            stride: this.stride
        };
        this.workers[w].postMessage(initMsg);
        // sharing buffers
        this.workers[w].postMessage(this.posShared);    // share buffers
        this.workers[w].postMessage(this.norShared);
        this.workers[w].postMessage(this.transforms);

        // register worker answer process
        this.workers[w].onmessage = function(e) {
            var id = e.data;
            sps.finishedWorkers[id] = true;
            sps.updateMesh();
        };

        this.workers[w].postMessage("c"); // initial computation order
    }
    return mesh;
};

// update the mesh vertex only when all workers have completed
SPS.prototype.updateMesh = function() {
    var done = true;
    var w = 0;
    for (w = 0; w < this.finishedWorkers.length; w++) {
        done = done && this.finishedWorkers[w];
    }
    if (done) {
        // update the positions/normals buffer from the shared buffer
        for (var i = 0; i < this.posBuffer.length; i++) {
            this.posBuffer[i] = this.posShared[i];
            this.norBuffer[i] = this.norShared[i];
        }
        for (var w = 0; w < this.workers.length; w++) {
            this.finishedWorkers[w] = false;
            this.workers[w].postMessage("c");  // re-order computation
        }
    }
};

SPS.prototype.setParticles = function() {
    var q = 0;          // index in the particle shape
    var pIdx = 0;       // index in the transforms array
    var x = 0.0;        // tmp x, y, z
    var y = 0.0;
    var z = 0.0;
    var pPos = 0;       // particle index in the positions array

    // Particle logical update
    for (var p = 0; p < this.particleNb; p++) {
        // get the current particle status
        this.particle.idx = p;
        pIdx = p * this.stride;                  // stride = 20
        this.particle.position.x = this.transforms[pIdx];
        this.particle.position.y = this.transforms[pIdx + 1];
        this.particle.position.z = this.transforms[pIdx + 2];

        this.particle.rotation.x = this.transforms[pIdx + 3];
        this.particle.rotation.y = this.transforms[pIdx + 4];
        this.particle.rotation.z = this.transforms[pIdx + 5];

        this.particle.scaling.x = this.transforms[pIdx + 6];
        this.particle.scaling.y = this.transforms[pIdx + 7];
        this.particle.scaling.z = this.transforms[pIdx + 8];

        this.particle.velocity.x = this.transforms[pIdx + 9];
        this.particle.velocity.y = this.transforms[pIdx + 10];
        this.particle.velocity.z = this.transforms[pIdx + 11];

        this.particle.color.r = this.transforms[pIdx + 12];
        this.particle.color.g = this.transforms[pIdx + 13];
        this.particle.color.b = this.transforms[pIdx + 14];
        this.particle.color.a = this.transforms[pIdx + 15];

        this.particle.uvs.x = this.transforms[pIdx + 16];
        this.particle.uvs.y = this.transforms[pIdx + 17];
        this.particle.uvs.z = this.transforms[pIdx + 18];
        this.particle.uvs.w = this.transforms[pIdx + 19];

        // call to particle update function
        this.updateParticle();

        // restore the particle updated transformations
        this.transforms[pIdx] = this.particle.position.x;
        this.transforms[pIdx + 1] = this.particle.position.y;
        this.transforms[pIdx + 2] = this.particle.position.z;

        this.transforms[pIdx + 3] = this.particle.rotation.x;
        this.transforms[pIdx + 4] = this.particle.rotation.y;
        this.transforms[pIdx + 5] = this.particle.rotation.z;

        this.transforms[pIdx + 6] = this.particle.scaling.x;
        this.transforms[pIdx + 7] = this.particle.scaling.y;
        this.transforms[pIdx + 8] = this.particle.scaling.z;

        this.transforms[pIdx + 9] = this.particle.velocity.x;
        this.transforms[pIdx + 10] = this.particle.velocity.y;
        this.transforms[pIdx + 11] = this.particle.velocity.z;

        this.transforms[pIdx + 12] = this.particle.color.r;
        this.transforms[pIdx + 13] = this.particle.color.g;
        this.transforms[pIdx + 14] = this.particle.color.b;
        this.transforms[pIdx + 15] = this.particle.color.a;

        this.transforms[pIdx + 16] = this.particle.uvs.x;
        this.transforms[pIdx + 17] = this.particle.uvs.y;
        this.transforms[pIdx + 18] = this.particle.uvs.z;
        this.transforms[pIdx + 19] = this.particle.uvs.w;
    }

    // update the actual mesh positions anyway
    this.mesh.updateVerticesData(BABYLON.VertexBuffer.PositionKind, this.posBuffer, false, false);
    this.mesh.updateVerticesData(BABYLON.VertexBuffer.NormalKind, this.norBuffer, false, false);

};

