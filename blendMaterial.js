function blendMaterial(name, scene) {
	var _this = this;
	this.scene = scene;
	this.backFaceCulling = true;
    this.fogEnabled = true;
	this.ambientColor = new BABYLON.Color3(0, 0, 0);
	this.diffuseColor = new BABYLON.Color3(1, 1, 1);
	this.specularColor1 = new BABYLON.Color3(1, 1, 1);
	this.specularColor2 = new BABYLON.Color3(1, 1, 1);
	this.specularPower1 = 64;
	this.specularPower2 = 64;
	this.soilLimit = new BABYLON.Vector3(10, 1);
	this.emissiveColor = new BABYLON.Color3(0, 0, 0);
	this.useAlphaFromDiffuseTexture = false;
	this.useEmissiveAsIllumination = false;
	this.linkEmissiveWithDiffuse = false;
	this.useReflectionFresnelFromSpecular = false;
	this.useSpecularOverAlpha = false;
	this.disableLighting = false;
	this.roughness = 0;
	this.useGlossinessFromSpecularMapAlpha = false;
	this._renderTargets = new BABYLON.SmartArray(16);
	this._worldViewProjectionMatrix = BABYLON.Matrix.Zero();
	this._globalAmbientColor = new BABYLON.Color3(0, 0, 0);
	this._defines = MaterialDefines();
	this._cachedDefines = MaterialDefines();
	this._cachedDefines.BonesPerMesh = -1;
	this.getRenderTargetTextures = function () {
		_this._renderTargets.reset();
		if (_this.reflectionTexture && _this.reflectionTexture.isRenderTarget) {
			_this._renderTargets.push(_this.reflectionTexture);
		}
		return _this._renderTargets;
	};
}
Object.defineProperty(blendMaterial.prototype, "useLogarithmicDepth", {
	get: function () {
		return this._useLogarithmicDepth;
	},
	set: function (value) {
		this._useLogarithmicDepth = value && this.scene.getEngine().getCaps().fragmentDepthSupported;
	},
	enumerable: true,
	configurable: true
});
blendMaterial.prototype.needAlphaBlending = function () {
	return (this.alpha < 1.0) || (this.opacityTexture != null) || this._shouldUseAlphaFromDiffuseTexture() || this.opacityFresnelParameters && this.opacityFresnelParameters.isEnabled;
};
blendMaterial.prototype.needAlphaTesting = function () {
	return this.diffuseTexture1 != null && this.diffuseTexture1.hasAlpha;
};
blendMaterial.prototype._shouldUseAlphaFromDiffuseTexture = function () {
	return this.diffuseTexture1 != null && this.diffuseTexture1.hasAlpha && this.useAlphaFromDiffuseTexture;
};
blendMaterial.prototype.getAlphaTestTexture = function () {
	return this.diffuseTexture1;
};
// Methods
blendMaterial.prototype._checkCache = function (scene, mesh, useInstances) {
	if (!mesh) {
		return true;
	}
	if (this._defines.INSTANCES !== useInstances) {
		return false;
	}
	if (mesh._materialDefines && mesh._materialDefines.isEqual(this._defines)) {
		return true;
	}
	return false;
};
blendMaterial.PrepareDefinesForLights = function (scene, mesh, defines) {
	var lightIndex = 0;
	var needNormals = false;
	for (var index = 0; index < scene.lights.length; index++) {
		var light = scene.lights[index];
		if (!light.isEnabled()) {
			continue;
		}
		// Excluded check
		if (light._excludedMeshesIds.length > 0) {
			for (var excludedIndex = 0; excludedIndex < light._excludedMeshesIds.length; excludedIndex++) {
				var excludedMesh = scene.getMeshByID(light._excludedMeshesIds[excludedIndex]);
				if (excludedMesh) {
					light.excludedMeshes.push(excludedMesh);
				}
			}
			light._excludedMeshesIds = [];
		}
		// Included check
		if (light._includedOnlyMeshesIds.length > 0) {
			for (var includedOnlyIndex = 0; includedOnlyIndex < light._includedOnlyMeshesIds.length; includedOnlyIndex++) {
				var includedOnlyMesh = scene.getMeshByID(light._includedOnlyMeshesIds[includedOnlyIndex]);
				if (includedOnlyMesh) {
					light.includedOnlyMeshes.push(includedOnlyMesh);
				}
			}
			light._includedOnlyMeshesIds = [];
		}
		if (!light.canAffectMesh(mesh)) {
			continue;
		}
		needNormals = true;
		defines["LIGHT" + lightIndex] = true;
		var type;
		if (light instanceof BABYLON.SpotLight) {
			type = "SPOTLIGHT" + lightIndex;
		}
		else if (light instanceof BABYLON.HemisphericLight) {
			type = "HEMILIGHT" + lightIndex;
		}
		else if (light instanceof BABYLON.PointLight) {
			type = "POINTLIGHT" + lightIndex;
		}
		else {
			type = "DIRLIGHT" + lightIndex;
		}
		defines[type] = true;
		// Specular
		if (!light.specular.equalsFloats(0, 0, 0)) {
			defines["SPECULARTERM"] = true;
		}
		// Shadows
		if (scene.shadowsEnabled) {
			var shadowGenerator = light.getShadowGenerator();
			if (mesh && mesh.receiveShadows && shadowGenerator) {
				defines["SHADOW" + lightIndex] = true;
				defines["SHADOWS"] = true;
				if (shadowGenerator.useExponentialShadowMap || shadowGenerator.useBlurExponentialShadowMap) {
					defines["SHADOWVSM" + lightIndex] = true;
				}
				if (shadowGenerator.usePoissonSampling) {
					defines["SHADOWPCF" + lightIndex] = true;
				}
			}
		}
		lightIndex++;
		if (lightIndex === 4)
			break;
	}
	return needNormals;
};
blendMaterial.BindLights = function (scene, mesh, effect, defines) {
	var lightIndex = 0;
	var depthValuesAlreadySet = false;
	for (var index = 0; index < scene.lights.length; index++) {
		var light = scene.lights[index];
		if (!light.isEnabled()) {
			continue;
		}
		if (!light.canAffectMesh(mesh)) {
			continue;
		}
		if (light instanceof BABYLON.PointLight) {
			// Point Light
//			light.transferToEffect(effect, "vLightData" + lightIndex);
		}
		else if (light instanceof BABYLON.DirectionalLight) {
			// Directional Light
//			light.transferToEffect(effect, "vLightData" + lightIndex);
		}
		else if (light instanceof BABYLON.SpotLight) {
			// Spot Light
			light.transferToEffect(effect, "vLightData" + lightIndex, "vLightDirection" + lightIndex);
		}
		else if (light instanceof BABYLON.HemisphericLight) {
			// Hemispheric Light
			light.transferToEffect(effect, "vLightData" + lightIndex, "vLightGround" + lightIndex);
		}
		light.diffuse.scaleToRef(light.intensity, blendMaterial._scaledDiffuse);
		effect.setColor4("vLightDiffuse" + lightIndex, blendMaterial._scaledDiffuse, light.range);
		if (light instanceof BABYLON.PointLight) {
			effect.setFloat4("vLightData" + lightIndex, light.position.x, light.position.y, light.position.z, 0.0);
		} else {
			effect.setFloat4("vLightData" + lightIndex, light.direction.x, light.direction.y, light.direction.z, 1.0);
		}
		if (defines["SPECULARTERM"]) {
			light.specular.scaleToRef(light.intensity, blendMaterial._scaledSpecular);
			effect.setColor3("vLightSpecular" + lightIndex, blendMaterial._scaledSpecular);
		}
		// Shadows
		if (scene.shadowsEnabled) {
			var shadowGenerator = light.getShadowGenerator();
			if (mesh.receiveShadows && shadowGenerator) {
				if (!light.needCube()) {
					effect.setMatrix("lightMatrix" + lightIndex, shadowGenerator.getTransformMatrix());
				}
				else {
					if (!depthValuesAlreadySet) {
						depthValuesAlreadySet = true;
						effect.setFloat2("depthValues", scene.activeCamera.minZ, scene.activeCamera.maxZ);
					}
				}
				effect.setTexture("shadowSampler" + lightIndex, shadowGenerator.getShadowMapForRendering());
				effect.setFloat3("shadowsInfo" + lightIndex, shadowGenerator.getDarkness(), shadowGenerator.blurScale / shadowGenerator.getShadowMap().getSize().width, shadowGenerator.bias);
				// 3.0
	            // effect.setFloat2("depthValues", shadowGenerator.getLight().getDepthMinZ(scene.activeCamera), shadowGenerator.getLight().getDepthMinZ(scene.activeCamera) + shadowGenerator.getLight().getDepthMaxZ(scene.activeCamera));

			}
		}
		lightIndex++;
		if (lightIndex === 4)
			break;
	}
};
blendMaterial.prototype.isReady = function (mesh, useInstances) {
	if (this.isFrozen) {
		if (this._wasPreviouslyReady) {
			return true;
		}
	}
	var scene = this.scene;
/*	if (!this.checkReadyOnEveryCall) {
		if (this._renderId === scene.getRenderId()) {
			if (this._checkCache(scene, mesh, useInstances)) {
				return true;
			}
		}
	}*/
	var engine = scene.getEngine();
	var needNormals = false;
	var needUVs = false;
	this._defines = MaterialDefines();
	// Textures
	if (scene.texturesEnabled) {
		if (this.diffuseTexture1 && blendMaterial.DiffuseTextureEnabled) {
			if (!this.diffuseTexture1.isReady()) {
				return false;
			}
			else {
				needUVs = true;
				this._defines.DIFFUSE1 = true;
			}
		}
		if (this.diffuseTexture2 && blendMaterial.DiffuseTextureEnabled) {
			if (!this.diffuseTexture2.isReady()) {
				return false;
			}
			else {
				needUVs = true;
				this._defines.DIFFUSE2 = true;
			}
		}
		if (this.diffuseTexture3 && blendMaterial.DiffuseTextureEnabled) {
			if (!this.diffuseTexture3.isReady()) {
				return false;
			}
			else {
				needUVs = true;
				this._defines.DIFFUSE3 = true;
			}
		}
		if (this.blendTexture && blendMaterial.DiffuseTextureEnabled) {
			if (!this.blendTexture.isReady()) {
				return false;
			}
			else {
				needUVs = true;
				this._defines.BLEND = true;
			}
		}
		if (this.soilTexture && blendMaterial.DiffuseTextureEnabled) {
			if (!this.soilTexture.isReady()) {
				return false;
			}
			else {
				needUVs = true;
				this._defines.SOIL = true;
			}
		}
		if (this.ambientTexture && blendMaterial.AmbientTextureEnabled) {
			if (!this.ambientTexture.isReady()) {
				return false;
			}
			else {
				needUVs = true;
				this._defines.AMBIENT = true;
			}
		}
		if (this.opacityTexture && blendMaterial.OpacityTextureEnabled) {
			if (!this.opacityTexture.isReady()) {
				return false;
			}
			else {
				needUVs = true;
				this._defines.OPACITY = true;
				if (this.opacityTexture.getAlphaFromRGB) {
					this._defines.OPACITYRGB = true;
				}
			}
		}
		if (this.reflectionTexture && blendMaterial.ReflectionTextureEnabled) {
			if (!this.reflectionTexture.isReady()) {
				return false;
			}
			else {
				needNormals = true;
				this._defines.REFLECTION = true;
				if (this.roughness > 0) {
					this._defines.ROUGHNESS = true;
				}
				if (this.reflectionTexture.coordinatesMode === BABYLON.Texture.INVCUBIC_MODE) {
					this._defines.INVERTCUBICMAP = true;
				}
				this._defines.REFLECTIONMAP_3D = this.reflectionTexture.isCube;
				switch (this.reflectionTexture.coordinatesMode) {
					case BABYLON.Texture.CUBIC_MODE:
					case BABYLON.Texture.INVCUBIC_MODE:
						this._defines.REFLECTIONMAP_CUBIC = true;
						break;
					case BABYLON.Texture.EXPLICIT_MODE:
						this._defines.REFLECTIONMAP_EXPLICIT = true;
						break;
					case BABYLON.Texture.PLANAR_MODE:
						this._defines.REFLECTIONMAP_PLANAR = true;
						break;
					case BABYLON.Texture.PROJECTION_MODE:
						this._defines.REFLECTIONMAP_PROJECTION = true;
						break;
					case BABYLON.Texture.SKYBOX_MODE:
						this._defines.REFLECTIONMAP_SKYBOX = true;
						break;
					case BABYLON.Texture.SPHERICAL_MODE:
						this._defines.REFLECTIONMAP_SPHERICAL = true;
						break;
					case BABYLON.Texture.EQUIRECTANGULAR_MODE:
						this._defines.REFLECTIONMAP_EQUIRECTANGULAR = true;
						break;
					case BABYLON.Texture.FIXED_EQUIRECTANGULAR_MODE:
						this._defines.REFLECTIONMAP_EQUIRECTANGULAR_FIXED = true;
						break;
				}
			}
		}
		if (this.emissiveTexture && blendMaterial.EmissiveTextureEnabled) {
			if (!this.emissiveTexture.isReady()) {
				return false;
			}
			else {
				needUVs = true;
				this._defines.EMISSIVE = true;
			}
		}
		if (this.specularTexture && blendMaterial.SpecularTextureEnabled) {
			if (!this.specularTexture.isReady()) {
				return false;
			}
			else {
				needUVs = true;
				this._defines.SPECULAR = true;
				this._defines.GLOSSINESS = this.useGlossinessFromSpecularMapAlpha;
			}
		}
	}
	if (scene.getEngine().getCaps().standardDerivatives && this.bumpTexture1 && blendMaterial.BumpTextureEnabled) {
		if (!this.bumpTexture1.isReady()) {
			return false;
		}
		else {
			needUVs = true;
			this._defines.BUMP1 = true;
		}
	}
	if (scene.getEngine().getCaps().standardDerivatives && this.bumpTexture2 && blendMaterial.BumpTextureEnabled) {
		if (!this.bumpTexture2.isReady()) {
			return false;
		}
		else {
			needUVs = true;
			this._defines.BUMP2 = true;
		}
	}
	// Effect
	if (scene.clipPlane) {
		this._defines.CLIPPLANE = true;
	}
	if (engine.getAlphaTesting()) {
		this._defines.ALPHATEST = true;
	}
	if (this._shouldUseAlphaFromDiffuseTexture()) {
		this._defines.ALPHAFROMDIFFUSE = true;
	}
	if (this.useEmissiveAsIllumination) {
		this._defines.EMISSIVEASILLUMINATION = true;
	}
	if (this.linkEmissiveWithDiffuse) {
		this._defines.LINKEMISSIVEWITHDIFFUSE = true;
	}
	if (this.useReflectionFresnelFromSpecular) {
		this._defines.REFLECTIONFRESNELFROMSPECULAR = true;
	}
	if (this.useLogarithmicDepth) {
		this._defines.LOGARITHMICDEPTH = true;
	}
	// Point size
	if (this.pointsCloud || scene.forcePointsCloud) {
		this._defines.POINTSIZE = true;
	}
	// Fog
	if (scene.fogEnabled && mesh && mesh.applyFog && scene.fogMode !== BABYLON.Scene.FOGMODE_NONE && this.fogEnabled) {
		this._defines.FOG = true;
	}
	if (scene.lightsEnabled && !this.disableLighting) {
		needNormals = blendMaterial.PrepareDefinesForLights(scene, mesh, this._defines);
	}
	if (blendMaterial.FresnelEnabled) {
		// Fresnel
		if (this.diffuseFresnelParameters && this.diffuseFresnelParameters.isEnabled ||
			this.opacityFresnelParameters && this.opacityFresnelParameters.isEnabled ||
			this.emissiveFresnelParameters && this.emissiveFresnelParameters.isEnabled ||
			this.reflectionFresnelParameters && this.reflectionFresnelParameters.isEnabled) {
			if (this.diffuseFresnelParameters && this.diffuseFresnelParameters.isEnabled) {
				this._defines.DIFFUSEFRESNEL = true;
			}
			if (this.opacityFresnelParameters && this.opacityFresnelParameters.isEnabled) {
				this._defines.OPACITYFRESNEL = true;
			}
			if (this.reflectionFresnelParameters && this.reflectionFresnelParameters.isEnabled) {
				this._defines.REFLECTIONFRESNEL = true;
			}
			if (this.emissiveFresnelParameters && this.emissiveFresnelParameters.isEnabled) {
				this._defines.EMISSIVEFRESNEL = true;
			}
			needNormals = true;
			this._defines.FRESNEL = true;
		}
	}
	if (this._defines.SPECULARTERM && this.useSpecularOverAlpha) {
		this._defines.SPECULAROVERALPHA = true;
	}
	// Attribs
	if (mesh) {
		if (needNormals && mesh.isVerticesDataPresent(BABYLON.VertexBuffer.NormalKind)) {
			this._defines.NORMAL = true;
		}
		if (needUVs) {
			if (mesh.isVerticesDataPresent(BABYLON.VertexBuffer.UVKind)) {
				this._defines.UV1 = true;
			}
			if (mesh.isVerticesDataPresent(BABYLON.VertexBuffer.UV2Kind)) {
				this._defines.UV2 = true;
			}
		}
		if (mesh.useVertexColors && mesh.isVerticesDataPresent(BABYLON.VertexBuffer.ColorKind)) {
			this._defines.VERTEXCOLOR = true;
			if (mesh.hasVertexAlpha) {
				this._defines.VERTEXALPHA = true;
			}
		}
		if (mesh.useBones && mesh.computeBonesUsingShaders) {
			this._defines.NUM_BONE_INFLUENCERS = mesh.numBoneInfluencers;
			this._defines.BonesPerMesh = (mesh.skeleton.bones.length + 1);
		}
		// Instances
		if (useInstances) {
			this._defines.INSTANCES = true;
		}
	}
	// Get correct effect
	if (1) {
		// Fallbacks
		var fallbacks = new BABYLON.EffectFallbacks();
		if (this._defines.REFLECTION) {
			fallbacks.addFallback(0, "REFLECTION");
		}
		if (this._defines.SPECULAR) {
			fallbacks.addFallback(0, "SPECULAR");
		}
		if (this._defines.BUMP1) {
			fallbacks.addFallback(0, "BUMP1");
		}
		if (this._defines.BUMP2) {
			fallbacks.addFallback(0, "BUMP2");
		}
		if (this._defines.SPECULAROVERALPHA) {
			fallbacks.addFallback(0, "SPECULAROVERALPHA");
		}
		if (this._defines.FOG) {
			fallbacks.addFallback(1, "FOG");
		}
		if (this._defines.POINTSIZE) {
			fallbacks.addFallback(0, "POINTSIZE");
		}
		if (this._defines.LOGARITHMICDEPTH) {
			fallbacks.addFallback(0, "LOGARITHMICDEPTH");
		}
		for (var lightIndex = 0; lightIndex < 4; lightIndex++) {
			if (!this._defines["LIGHT" + lightIndex]) {
				continue;
			}
			if (lightIndex > 0) {
				fallbacks.addFallback(lightIndex, "LIGHT" + lightIndex);
			}
			if (this._defines["SHADOW" + lightIndex]) {
				fallbacks.addFallback(0, "SHADOW" + lightIndex);
			}
			if (this._defines["SHADOWPCF" + lightIndex]) {
				fallbacks.addFallback(0, "SHADOWPCF" + lightIndex);
			}
			if (this._defines["SHADOWVSM" + lightIndex]) {
				fallbacks.addFallback(0, "SHADOWVSM" + lightIndex);
			}
		}
		if (this._defines.SPECULARTERM) {
			fallbacks.addFallback(0, "SPECULARTERM");
		}
		if (this._defines.DIFFUSEFRESNEL) {
			fallbacks.addFallback(1, "DIFFUSEFRESNEL");
		}
		if (this._defines.OPACITYFRESNEL) {
			fallbacks.addFallback(2, "OPACITYFRESNEL");
		}
		if (this._defines.REFLECTIONFRESNEL) {
			fallbacks.addFallback(3, "REFLECTIONFRESNEL");
		}
		if (this._defines.EMISSIVEFRESNEL) {
			fallbacks.addFallback(4, "EMISSIVEFRESNEL");
		}
		if (this._defines.FRESNEL) {
			fallbacks.addFallback(4, "FRESNEL");
		}
		if (this._defines.NUM_BONE_INFLUENCERS > 0) {
			fallbacks.addCPUSkinningFallback(0, mesh);
		}
		//Attributes
		var attribs = [BABYLON.VertexBuffer.PositionKind];
		if (this._defines.NORMAL) {
			attribs.push(BABYLON.VertexBuffer.NormalKind);
		}
		if (this._defines.UV1) {
			attribs.push(BABYLON.VertexBuffer.UVKind);
		}
		if (this._defines.UV2) {
			attribs.push(BABYLON.VertexBuffer.UV2Kind);
		}
		if (this._defines.VERTEXCOLOR) {
			attribs.push(BABYLON.VertexBuffer.ColorKind);
		}
		if (this._defines.NUM_BONE_INFLUENCERS > 0) {
			attribs.push(BABYLON.VertexBuffer.MatricesIndicesKind);
			attribs.push(BABYLON.VertexBuffer.MatricesWeightsKind);
			if (this._defines.NUM_BONE_INFLUENCERS > 4) {
				attribs.push(BABYLON.VertexBuffer.MatricesIndicesExtraKind);
				attribs.push(BABYLON.VertexBuffer.MatricesWeightsExtraKind);
			}
		}
		if (this._defines.INSTANCES) {
			attribs.push("world0");
			attribs.push("world1");
			attribs.push("world2");
			attribs.push("world3");
		}
		// Legacy browser patch
		var shaderName = "./blend";
		var join = '';
		for (var index in this._defines) {
			var prop = this._defines[index];
			if (typeof (this._defines[index]) === "number") {
				join += "#define " + index + " " + this._defines[index] + "\n";
			}
			else if (this._defines[index]) {
				join += "#define " + index + "\n";
			}
		}
		this._effect = scene.getEngine().createEffect(shaderName, attribs, ["world", "view", "viewProjection", "vEyePosition", "vLightsType", "vAmbientColor", "vDiffuseColor", "vSpecularColor1", "vSpecularColor2", "vEmissiveColor",
			"vLightData0", "vLightDiffuse0", "vLightSpecular0", "vLightDirection0", "vLightGround0", "lightMatrix0",
			"vLightData1", "vLightDiffuse1", "vLightSpecular1", "vLightDirection1", "vLightGround1", "lightMatrix1",
			"vLightData2", "vLightDiffuse2", "vLightSpecular2", "vLightDirection2", "vLightGround2", "lightMatrix2",
			"vLightData3", "vLightDiffuse3", "vLightSpecular3", "vLightDirection3", "vLightGround3", "lightMatrix3",
			"vFogInfos", "vFogColor", "pointSize",
			"vDiffuseInfos1", "vDiffuseInfos2", "vDiffuseInfos3", "vBlendInfos", "vSoilLimit", "vAmbientInfos", "vOpacityInfos", "vReflectionInfos", "vEmissiveInfos", "vSpecularInfos", "vBumpInfos1", "vBumpInfos2",
		 	"mBones",
			"vClipPlane", "diffuseMatrix1", "diffuseMatrix2", "diffuseMatrix3", "blendMatrix", "ambientMatrix", "opacityMatrix", "reflectionMatrix", "emissiveMatrix", "specularMatrix", "bumpMatrix1", "bumpMatrix2",
			"shadowsInfo0", "shadowsInfo1", "shadowsInfo2", "shadowsInfo3", "depthValues",
			"diffuseLeftColor", "diffuseRightColor", "opacityParts", "reflectionLeftColor", "reflectionRightColor", "emissiveLeftColor", "emissiveRightColor",
			"logarithmicDepthConstant"
		], ["diffuseSampler1", "diffuseSampler2", "diffuseSampler3", "blendSampler", "soilSampler", "ambientSampler", "opacitySampler", "reflectionCubeSampler", "reflection2DSampler", "emissiveSampler", "specularSampler", "bumpSampler1", "bumpSampler2",
			"shadowSampler0", "shadowSampler1", "shadowSampler2", "shadowSampler3"
		], join, fallbacks, this.onCompiled, this.onError);
	}
	if (!this._effect.isReady()) {
		return false;
	}
	this._renderId = scene.getRenderId();
	this._wasPreviouslyReady = true;
	if (mesh) {
		if (!mesh._materialDefines) {
			mesh._materialDefines = MaterialDefines();
		}
//		this._defines.cloneTo(mesh._materialDefines);
	}
	return true;
};
blendMaterial.prototype._preBind = function () {
	var engine = this.scene.getEngine();
	engine.enableEffect(this._effect);
	engine.setState(this.backFaceCulling, this.zOffset, false, this.sideOrientation === BABYLON.Material.ClockWiseSideOrientation);
};
blendMaterial.prototype.getEffect = function () {
	return this._effect;
};
blendMaterial.prototype.unbind = function () {
	if (this.reflectionTexture && this.reflectionTexture.isRenderTarget) {
		this._effect.setTexture("reflection2DSampler", null);
	}
	//_super.prototype.unbind.call(this);
};
blendMaterial.prototype.bindOnlyWorldMatrix = function (world) {
	this._effect.setMatrix("world", world);
};
blendMaterial.prototype.bind = function (world, mesh) {
	var scene = this.scene;
	// Matrices
	this.bindOnlyWorldMatrix(world);
	// Bones
	if (mesh && mesh.useBones && mesh.computeBonesUsingShaders) {
		this._effect.setMatrices("mBones", mesh.skeleton.getTransformMatrices(mesh));
	}
	if (scene.getCachedMaterial() !== this) {
		this._effect.setMatrix("viewProjection", scene.getTransformMatrix());
		if (blendMaterial.FresnelEnabled) {
			// Fresnel
			if (this.diffuseFresnelParameters && this.diffuseFresnelParameters.isEnabled) {
				this._effect.setColor4("diffuseLeftColor", this.diffuseFresnelParameters.leftColor, this.diffuseFresnelParameters.power);
				this._effect.setColor4("diffuseRightColor", this.diffuseFresnelParameters.rightColor, this.diffuseFresnelParameters.bias);
			}
			if (this.opacityFresnelParameters && this.opacityFresnelParameters.isEnabled) {
				this._effect.setColor4("opacityParts", new BABYLON.Color3(this.opacityFresnelParameters.leftColor.toLuminance(), this.opacityFresnelParameters.rightColor.toLuminance(), this.opacityFresnelParameters.bias), this.opacityFresnelParameters.power);
			}
			if (this.reflectionFresnelParameters && this.reflectionFresnelParameters.isEnabled) {
				this._effect.setColor4("reflectionLeftColor", this.reflectionFresnelParameters.leftColor, this.reflectionFresnelParameters.power);
				this._effect.setColor4("reflectionRightColor", this.reflectionFresnelParameters.rightColor, this.reflectionFresnelParameters.bias);
			}
			if (this.emissiveFresnelParameters && this.emissiveFresnelParameters.isEnabled) {
				this._effect.setColor4("emissiveLeftColor", this.emissiveFresnelParameters.leftColor, this.emissiveFresnelParameters.power);
				this._effect.setColor4("emissiveRightColor", this.emissiveFresnelParameters.rightColor, this.emissiveFresnelParameters.bias);
			}
		}
		// Textures
		if (scene.texturesEnabled) {
			if (this.diffuseTexture1 && blendMaterial.DiffuseTextureEnabled) {
				this._effect.setTexture("diffuseSampler1", this.diffuseTexture1);
				this._effect.setFloat2("vDiffuseInfos1", this.diffuseTexture1.coordinatesIndex, this.diffuseTexture1.level);
				this._effect.setMatrix("diffuseMatrix1", this.diffuseTexture1.getTextureMatrix());
			}
			if (this.diffuseTexture2 && blendMaterial.DiffuseTextureEnabled) {
				this._effect.setTexture("diffuseSampler2", this.diffuseTexture2);
				this._effect.setFloat2("vDiffuseInfos2", this.diffuseTexture2.coordinatesIndex, this.diffuseTexture2.level);
				this._effect.setMatrix("diffuseMatrix2", this.diffuseTexture2.getTextureMatrix());
			}
			if (this.diffuseTexture3 && blendMaterial.DiffuseTextureEnabled) {
				this._effect.setTexture("diffuseSampler3", this.diffuseTexture3);
				this._effect.setFloat2("vDiffuseInfos3", this.diffuseTexture3.coordinatesIndex, this.diffuseTexture3.level);
				this._effect.setMatrix("diffuseMatrix3", this.diffuseTexture3.getTextureMatrix());
			}
			if (this.blendTexture && blendMaterial.DiffuseTextureEnabled) {
				this._effect.setTexture("blendSampler", this.blendTexture);
				this._effect.setFloat2("vBlendInfos", this.blendTexture.coordinatesIndex, this.blendTexture.level);
				this._effect.setMatrix("blendMatrix", this.blendTexture.getTextureMatrix());
			}
			if (this.soilTexture && blendMaterial.DiffuseTextureEnabled) {
				this._effect.setTexture("soilSampler", this.soilTexture);
				this._effect.setFloat2("vSoilLimit", this.soilLimit.x, this.soilLimit.y);
			}
			if (this.ambientTexture && blendMaterial.AmbientTextureEnabled) {
				this._effect.setTexture("ambientSampler", this.ambientTexture);
				this._effect.setFloat2("vAmbientInfos", this.ambientTexture.coordinatesIndex, this.ambientTexture.level);
				this._effect.setMatrix("ambientMatrix", this.ambientTexture.getTextureMatrix());
			}
			if (this.opacityTexture && blendMaterial.OpacityTextureEnabled) {
				this._effect.setTexture("opacitySampler", this.opacityTexture);
				this._effect.setFloat2("vOpacityInfos", this.opacityTexture.coordinatesIndex, this.opacityTexture.level);
				this._effect.setMatrix("opacityMatrix", this.opacityTexture.getTextureMatrix());
			}
			if (this.reflectionTexture && blendMaterial.ReflectionTextureEnabled) {
				if (this.reflectionTexture.isCube) {
					this._effect.setTexture("reflectionCubeSampler", this.reflectionTexture);
				}
				else {
					this._effect.setTexture("reflection2DSampler", this.reflectionTexture);
				}
				this._effect.setMatrix("reflectionMatrix", this.reflectionTexture.getReflectionTextureMatrix());
				this._effect.setFloat2("vReflectionInfos", this.reflectionTexture.level, this.roughness);
			}
			if (this.emissiveTexture && blendMaterial.EmissiveTextureEnabled) {
				this._effect.setTexture("emissiveSampler", this.emissiveTexture);
				this._effect.setFloat2("vEmissiveInfos", this.emissiveTexture.coordinatesIndex, this.emissiveTexture.level);
				this._effect.setMatrix("emissiveMatrix", this.emissiveTexture.getTextureMatrix());
			}
			if (this.specularTexture && blendMaterial.SpecularTextureEnabled) {
				this._effect.setTexture("specularSampler", this.specularTexture);
				this._effect.setFloat2("vSpecularInfos", this.specularTexture.coordinatesIndex, this.specularTexture.level);
				this._effect.setMatrix("specularMatrix", this.specularTexture.getTextureMatrix());
			}
			if (this.bumpTexture1 && scene.getEngine().getCaps().standardDerivatives && blendMaterial.BumpTextureEnabled) {
				this._effect.setTexture("bumpSampler1", this.bumpTexture1);
				this._effect.setFloat2("vBumpInfos1", this.bumpTexture1.coordinatesIndex, 1.0 / this.bumpTexture1.level);
				this._effect.setMatrix("bumpMatrix1", this.bumpTexture1.getTextureMatrix());
			}
			if (this.bumpTexture2 && scene.getEngine().getCaps().standardDerivatives && blendMaterial.BumpTextureEnabled) {
				this._effect.setTexture("bumpSampler2", this.bumpTexture2);
				this._effect.setFloat2("vBumpInfos2", this.bumpTexture2.coordinatesIndex, 1.0 / this.bumpTexture2.level);
				this._effect.setMatrix("bumpMatrix2", this.bumpTexture2.getTextureMatrix());
			}
		}
		// Clip plane
		if (scene.clipPlane) {
			var clipPlane = scene.clipPlane;
			this._effect.setFloat4("vClipPlane", clipPlane.normal.x, clipPlane.normal.y, clipPlane.normal.z, clipPlane.d);
		}
		// Point size
		if (this.pointsCloud) {
			this._effect.setFloat("pointSize", this.pointSize);
		}
		// Colors
		scene.ambientColor.multiplyToRef(this.ambientColor, this._globalAmbientColor);
		this._effect.setVector3("vEyePosition", scene._mirroredCameraPosition ? scene._mirroredCameraPosition : scene.activeCamera.position);
		this._effect.setColor3("vAmbientColor", scene.ambientColor);
		if (this._defines.SPECULARTERM) {
			this._effect.setColor4("vSpecularColor1", this.specularColor1, this.specularPower1);
			this._effect.setColor4("vSpecularColor2", this.specularColor2, this.specularPower2);
		}
		this._effect.setColor3("vEmissiveColor", this.emissiveColor);
	}
	if (scene.getCachedMaterial() !== this || !this.isFrozen) {
		// Diffuse
		this._effect.setColor4("vDiffuseColor", this.diffuseColor, this.alpha * mesh.visibility);
		// Lights
		if (scene.lightsEnabled && !this.disableLighting) {
			blendMaterial.BindLights(scene, mesh, this._effect, this._defines);
		}
		// View
		if (scene.fogEnabled && mesh.applyFog && scene.fogMode !== BABYLON.Scene.FOGMODE_NONE || this.reflectionTexture) {
			this._effect.setMatrix("view", scene.getViewMatrix());
		}
		// Fog
		if (scene.fogEnabled && mesh.applyFog && scene.fogMode !== BABYLON.Scene.FOGMODE_NONE) {
			this._effect.setFloat4("vFogInfos", scene.fogMode, scene.fogStart, scene.fogEnd, scene.fogDensity);
			this._effect.setColor3("vFogColor", scene.fogColor);
		}
		// Log. depth
		if (this._defines.LOGARITHMICDEPTH) {
			this._effect.setFloat("logarithmicDepthConstant", 2.0 / (Math.log(scene.activeCamera.maxZ + 1.0) / Math.LN2));
		}
	}
	//this.bind(this, world, mesh);
};
blendMaterial.prototype.getAnimatables = function () {
	var results = [];
	if (this.diffuseTexture1 && this.diffuseTexture1.animations && this.diffuseTexture1.animations.length > 0) {
		results.push(this.diffuseTexture1);
	}
	if (this.diffuseTexture1 && this.diffuseTexture1.animations && this.diffuseTexture1.animations.length > 0) {
		results.push(this.diffuseTexture1);
	}
	if (this.diffuseTexture2 && this.diffuseTexture2.animations && this.diffuseTexture2.animations.length > 0) {
		results.push(this.diffuseTexture2);
	}
	if (this.diffuseTexture3 && this.diffuseTexture3.animations && this.diffuseTexture3.animations.length > 0) {
		results.push(this.diffuseTexture3);
	}
	if (this.blendTexture && this.blendTexture.animations && this.blendTexture.animations.length > 0) {
		results.push(this.blendTexture);
	}
	if (this.ambientTexture && this.ambientTexture.animations && this.ambientTexture.animations.length > 0) {
		results.push(this.ambientTexture);
	}
	if (this.opacityTexture && this.opacityTexture.animations && this.opacityTexture.animations.length > 0) {
		results.push(this.opacityTexture);
	}
	if (this.reflectionTexture && this.reflectionTexture.animations && this.reflectionTexture.animations.length > 0) {
		results.push(this.reflectionTexture);
	}
	if (this.emissiveTexture && this.emissiveTexture.animations && this.emissiveTexture.animations.length > 0) {
		results.push(this.emissiveTexture);
	}
	if (this.specularTexture && this.specularTexture.animations && this.specularTexture.animations.length > 0) {
		results.push(this.specularTexture);
	}
	if (this.bumpTexture1 && this.bumpTexture1.animations && this.bumpTexture1.animations.length > 0) {
		results.push(this.bumpTexture1);
	}
	if (this.bumpTexture2 && this.bumpTexture2.animations && this.bumpTexture2.animations.length > 0) {
		results.push(this.bumpTexture2);
	}
	return results;
};
blendMaterial.prototype.dispose = function (forceDisposeEffect) {
	if (this.diffuseTexture1) {
		this.diffuseTexture1.dispose();
	}
	if (this.diffuseTexture2) {
		this.diffuseTexture2.dispose();
	}
	if (this.diffuseTexture3) {
		this.diffuseTexture3.dispose();
	}
	if (this.blendTexture) {
		this.blendTexture.dispose();
	}
	if (this.ambientTexture) {
		this.ambientTexture.dispose();
	}
	if (this.opacityTexture) {
		this.opacityTexture.dispose();
	}
	if (this.reflectionTexture) {
		this.reflectionTexture.dispose();
	}
	if (this.emissiveTexture) {
		this.emissiveTexture.dispose();
	}
	if (this.specularTexture) {
		this.specularTexture.dispose();
	}
	if (this.bumpTexture1) {
		this.bumpTexture1.dispose();
	}
	if (this.bumpTexture2) {
		this.bumpTexture2.dispose();
	}
	//_super.prototype.dispose.call(this, forceDisposeEffect);
};
blendMaterial._scaledDiffuse = new BABYLON.Color3();
blendMaterial._scaledSpecular = new BABYLON.Color3();
// Statics
// Flags used to enable or disable a type of texture for all Standard Materials
blendMaterial.DiffuseTextureEnabled = true;
blendMaterial.AmbientTextureEnabled = true;
blendMaterial.OpacityTextureEnabled = true;
blendMaterial.ReflectionTextureEnabled = true;
blendMaterial.EmissiveTextureEnabled = true;
blendMaterial.SpecularTextureEnabled = true;
blendMaterial.BumpTextureEnabled = true;
blendMaterial.FresnelEnabled = true;
function MaterialDefines() {
	var defines = {};
	defines.DIFFUSE1 = false;
	defines.DIFFUSE2 = false;
	defines.BLEND = false;
	defines.AMBIENT = false;
	defines.OPACITY = false;
	defines.OPACITYRGB = false;
	defines.REFLECTION = false;
	defines.EMISSIVE = false;
	defines.SPECULAR = false;
	defines.BUMP1 = false;
	defines.BUMP2 = false;
	defines.SPECULAROVERALPHA = false;
	defines.CLIPPLANE = false;
	defines.ALPHATEST = false;
	defines.ALPHAFROMDIFFUSE = false;
	defines.POINTSIZE = false;
	defines.FOG = false;
	defines.LIGHT0 = false;
	defines.LIGHT1 = false;
	defines.LIGHT2 = false;
	defines.LIGHT3 = false;
	defines.SPOTLIGHT0 = false;
	defines.SPOTLIGHT1 = false;
	defines.SPOTLIGHT2 = false;
	defines.SPOTLIGHT3 = false;
	defines.HEMILIGHT0 = false;
	defines.HEMILIGHT1 = false;
	defines.HEMILIGHT2 = false;
	defines.HEMILIGHT3 = false;
	defines.POINTLIGHT0 = false;
	defines.POINTLIGHT1 = false;
	defines.POINTLIGHT2 = false;
	defines.POINTLIGHT3 = false;
	defines.DIRLIGHT0 = false;
	defines.DIRLIGHT1 = false;
	defines.DIRLIGHT2 = false;
	defines.DIRLIGHT3 = false;
	defines.SPECULARTERM = false;
	defines.SHADOW0 = false;
	defines.SHADOW1 = false;
	defines.SHADOW2 = false;
	defines.SHADOW3 = false;
	defines.SHADOWS = false;
	defines.SHADOWVSM0 = false;
	defines.SHADOWVSM1 = false;
	defines.SHADOWVSM2 = false;
	defines.SHADOWVSM3 = false;
	defines.SHADOWPCF0 = false;
	defines.SHADOWPCF1 = false;
	defines.SHADOWPCF2 = false;
	defines.SHADOWPCF3 = false;
	defines.DIFFUSEFRESNEL = false;
	defines.OPACITYFRESNEL = false;
	defines.REFLECTIONFRESNEL = false;
	defines.EMISSIVEFRESNEL = false;
	defines.FRESNEL = false;
	defines.NORMAL = false;
	defines.UV1 = false;
	defines.UV2 = false;
	defines.VERTEXCOLOR = false;
	defines.VERTEXALPHA = false;
	defines.NUM_BONE_INFLUENCERS = 0;
	defines.BonesPerMesh = 0;
	defines.INSTANCES = false;
	defines.GLOSSINESS = false;
	defines.ROUGHNESS = false;
	defines.EMISSIVEASILLUMINATION = false;
	defines.LINKEMISSIVEWITHDIFFUSE = false;
	defines.REFLECTIONFRESNELFROMSPECULAR = false;
	defines.REFLECTIONMAP_3D = false;
	defines.REFLECTIONMAP_SPHERICAL = false;
	defines.REFLECTIONMAP_PLANAR = false;
	defines.REFLECTIONMAP_CUBIC = false;
	defines.REFLECTIONMAP_PROJECTION = false;
	defines.REFLECTIONMAP_SKYBOX = false;
	defines.REFLECTIONMAP_EXPLICIT = false;
	defines.REFLECTIONMAP_EQUIRECTANGULAR = false;
	defines.REFLECTIONMAP_EQUIRECTANGULAR_FIXED = false;
	defines.INVERTCUBICMAP = false;
	defines.LOGARITHMICDEPTH = false;
	return defines;
}
