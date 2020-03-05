#ifdef GL_ES
precision highp float;
#endif

// Attributes
attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;

// Uniforms
uniform vec2 waveData;
uniform mat4 windMatrix;
uniform mat4 windMatrix2;
uniform mat4 world;
uniform mat4 view;
uniform mat4 worldViewProjection;

// Normal
varying vec3 vPositionW;
varying vec3 vNormalW;
varying vec4 vUV;
varying vec2 vBumpUV;
varying vec2 vBumpUV2;

#ifdef OPACITY
varying vec2 vOpacityUV;
uniform mat4 opacityMatrix;
#endif

// Shadows
#ifdef SHADOWS
uniform mat4 lightMatrix0;
varying vec4 vPositionFromLight0;
#endif

// Fog
#ifdef FOG
	varying float fFogDistance;
#endif

void main(void) {
	vec4 outPosition = worldViewProjection * vec4(position, 1.0);
	gl_Position = outPosition;

	vec4 worldPos = world * vec4(position, 1.0);
	
	vPositionW = vec3(world * vec4(position, 1.0));
	vNormalW = normalize(vec3(world * vec4(normal, 0.0)));

	vUV = outPosition;

	vec2 bumpTexCoord = vec2(windMatrix * vec4(uv, 0.0, 1.0));
	vec2 bumpTexCoord2 = vec2(windMatrix2 * vec4(uv, 0.0, 1.0));
	vBumpUV = bumpTexCoord / waveData.x;
	vBumpUV2 = bumpTexCoord2 / waveData.x;
#ifdef OPACITY
	vOpacityUV = vec2(opacityMatrix * vec4(uv, 1.0, 0.0));
#endif

#ifdef SHADOWS
	vPositionFromLight0 = lightMatrix0 * worldPos;
#endif
#ifdef FOG
	fFogDistance = (view * worldPos).z;
#endif
}