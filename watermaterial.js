(function () {
    watermaterial = function (name, scene, light) {
        BABYLON.Material.call(this, name, scene);
        this.light = light;
        this.specularPower = 512;

        this.bumpTexture = new BABYLON.Texture("textures/water1.png", scene);
        this.bumpTexture.wAng = Math.PI / 2;
        this.bumpTexture.uScale = 16;
        this.bumpTexture.vScale = 16;

        this.reflectionTexture = new BABYLON.MirrorTexture("reflection", 512, scene, true);
        this.refractionTexture = new BABYLON.RenderTargetTexture("refraction", 512, scene, true);
        this.reflectionTexture.mirrorPlane = new BABYLON.Plane(0, -1, 0, 0);

        this.refractionTexture.onBeforeRender = function() {
            BABYLON.clipPlane = new BABYLON.Plane(0, 1, 0, 0);
        };

        this.refractionTexture.onAfterRender = function() {
            BABYLON.clipPlane = null;
        };

        this.waterColor = new BABYLON.Color3(0.0, 0.3, 0.3); // new BABYLON.Color3(0.0, 0.5, 0.3);
        this.waterColorLevel = 0.3;
        this.fresnelLevel = 1.0;
        this.reflectionLevel = 1;
        this.refractionLevel = .4;

        this.waveLength = 1;
        this.waveHeight = 0.005;

        this.waterDirection = new BABYLON.Vector2(0.2, -5.0);
        this.waterDirection2 = new BABYLON.Vector2(-0.2, 5);

        this._time = 0;
    };

    watermaterial.prototype = Object.create(BABYLON.Material.prototype);

    // Properties
    watermaterial.prototype.needAlphaBlending = function () {
        return false;
    };

    watermaterial.prototype.needAlphaTesting = function () {
        return false;
    };

    // Methods
    watermaterial.prototype.getRenderTargetTextures = function () {
        var results = [];
        if (!BABYLON.StandardMaterial.ReflectionTextureEnabled) {
			return results;
		}

        results.push(this.reflectionTexture);
        results.push(this.refractionTexture);

        return results;
    };

    watermaterial.prototype.isReady = function (mesh) {
        var engine = this._scene.getEngine();

        if (this.bumpTexture && !this.bumpTexture.isReady) {
            return false;
        }
        if (this.opacityTexture && !this.opacityTexture.isReady) {
            return false;
        }

        var defines = [];

		// Shadows
		if (scene.shadowsEnabled) {
			var lightIndex = 0;
			var shadowGenerator = this.light.getShadowGenerator();
			if (mesh && mesh.receiveShadows && shadowGenerator) {
				defines.push("#define SHADOW" + lightIndex);
				defines.push("#define SHADOWS");
				if (shadowGenerator.useExponentialShadowMap || shadowGenerator.useBlurExponentialShadowMap) {
					defines.push("#define SHADOWVSM" + lightIndex);
				}
				if (shadowGenerator.usePoissonSampling) {
					defines.push("#define SHADOWPCF" + lightIndex);
				}
			}
		}

		// bump
		if (engine._gl.getSupportedExtensions().indexOf('OES_standard_derivatives') > -1) {
			defines.push("#define BUMP");
		}

		// opacity
		if (this.opacityTexture) {
			defines.push("#define OPACITY");
		}

		// Fog
		if (this._scene.fogEnabled && mesh && mesh.applyFog && this._scene.fogMode !== BABYLON.Scene.FOGMODE_NONE) {
            defines.push("#define FOG");
		}

        var join = defines.join("\n");
        this._effect = engine.createEffect("./water",
            ["position", "normal", "uv"],
            ["worldViewProjection", "world", "view", "vLightPosition", "vLightAmbient", "vEyePosition", "waterColor", "vLevels", "waveData", "windMatrix", "windMatrix2", "opacityMatrix", "vFogInfos", "vFogColor", 'shadowsInfo0', 'lightMatrix0', 'depthValues', 'vSpecularColor', 'vSpecularPower'],
            ["reflectionSampler", "refractionSampler", "bumpSampler", "opacitySampler", 'shadowSampler0'],
            join);

        if (!this._effect.isReady()) {
            return false;
        }

        return true;
    };

    watermaterial.prototype.bind = function (world, mesh) {
        this._time += 0.0001 * this._scene.getAnimationRatio();

        this._effect.setMatrix("world", world);
        this._effect.setMatrix("worldViewProjection", world.multiply(this._scene.getTransformMatrix()));
        this._effect.setColor3("vLightAmbient", this._scene.ambientColor);
        this._effect.setVector3("vEyePosition", this._scene.activeCamera.position);
        this._effect.setVector3("vLightPosition", BABYLON.Vector3.Zero().subtract(this.light.direction));
        this._effect.setColor3("waterColor", this.waterColor);
        this._effect.setFloat4("vLevels", this.waterColorLevel, this.fresnelLevel, this.reflectionLevel, this.refractionLevel);
        this._effect.setColor3('vSpecularColor', this.light.diffuse);
        this._effect.setFloat('vSpecularPower', this.specularPower);
        this._effect.setFloat2("waveData", this.waveLength, this.waveHeight);

		// Fog
		if (this._scene.fogEnabled && mesh.applyFog && this._scene.fogMode !== BABYLON.Scene.FOGMODE_NONE) {
			this._effect.setMatrix("view", this.getScene().getViewMatrix());
			this._effect.setFloat4("vFogInfos", this._scene.fogMode, this._scene.fogStart, this._scene.fogEnd, this._scene.fogDensity);
			this._effect.setColor3("vFogColor", this._scene.fogColor);
		}

        // Textures
        this._effect.setMatrix("windMatrix", this.bumpTexture.getTextureMatrix().multiply(BABYLON.Matrix.Translation(this.waterDirection.x * this._time, this.waterDirection.y * this._time, 0)));
        this._effect.setMatrix("windMatrix2", this.bumpTexture.getTextureMatrix().multiply(BABYLON.Matrix.Translation(this.waterDirection2.x * this._time, this.waterDirection2.y * this._time, 0)));
        this._effect.setTexture("bumpSampler", this.bumpTexture);
        if (this.opacityTexture) {
        	this._effect.setTexture("opacitySampler", this.opacityTexture);
			this._effect.setMatrix("opacityMatrix", this.opacityTexture.getTextureMatrix());
		}
        if (BABYLON.StandardMaterial.ReflectionTextureEnabled) {
        	this._effect.setTexture("reflectionSampler", this.reflectionTexture);
        	this._effect.setTexture("refractionSampler", this.refractionTexture);
		}

		// Shadows
		if (scene.shadowsEnabled) {
			var lightIndex = 0;
			var shadowGenerator = this.light.getShadowGenerator();
			if (mesh.receiveShadows && shadowGenerator) {
				if (!this.light.needCube()) {
					this._effect.setMatrix("lightMatrix" + lightIndex, shadowGenerator.getTransformMatrix());
				} else {
					this._effect.setFloat2("depthValues", scene.activeCamera.minZ, scene.activeCamera.maxZ);
				}
				this._effect.setTexture("shadowSampler" + lightIndex, shadowGenerator.getShadowMap());
				this._effect.setFloat3("shadowsInfo" + lightIndex, shadowGenerator.getDarkness(), shadowGenerator.blurScale / shadowGenerator.getShadowMap().getSize().width, shadowGenerator.bias);
			}
		}

    };

    watermaterial.prototype.dispose = function () {
        if (this.bumpTexture) {
            this.bumpTexture.dispose();
        }
        if (this.opacityTexture) {
            this.opacityTexture.dispose();
        }

        if (this.reflectionTexture) {
            this.reflectionTexture.dispose();
        }

        if (this.refractionTexture) {
            this.refractionTexture.dispose();
        }
        BABYLON.Material.dispose.call(this);
    };
})();