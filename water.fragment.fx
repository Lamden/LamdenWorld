#ifdef BUMP
#extension GL_OES_standard_derivatives : enable
#endif
#define FOGMODE_NONE 0.
#define FOGMODE_EXP 1.
#define FOGMODE_EXP2 2.
#define FOGMODE_LINEAR 3.
#define E 2.71828

#ifdef GL_ES
precision highp float;
#endif


uniform vec3 vEyePosition;
uniform vec4 vLevels;
uniform vec3 waterColor;
uniform vec2 waveData;

// Lights
varying vec3 vPositionW;
varying vec3 vNormalW;
uniform vec3 vLightPosition;
uniform vec3 vLightAmbient;

//specular
uniform vec3 vSpecularColor;
uniform float vSpecularPower;

#ifdef SHADOW0
varying vec4 vPositionFromLight0;
uniform sampler2D shadowSampler0;
uniform vec3 shadowsInfo0;
#endif

// Refs
varying vec2 vBumpUV;
varying vec2 vBumpUV2;
varying vec4 vUV;
uniform sampler2D refractionSampler;
uniform sampler2D reflectionSampler;
uniform sampler2D bumpSampler;

#ifdef OPACITY
varying vec2 vOpacityUV;
uniform sampler2D opacitySampler;
#endif

// Fog
uniform vec4 vFogInfos;
uniform vec3 vFogColor;
varying float fFogDistance;

float CalcFogFactor()
{
 float fogCoeff = 1.0;
 float fogStart = vFogInfos.y;
 float fogEnd = vFogInfos.z;
 float fogDensity = vFogInfos.w;

 if (FOGMODE_LINEAR == vFogInfos.x)
 {
  fogCoeff = (fogEnd - fFogDistance) / (fogEnd - fogStart);
 }
 else if (FOGMODE_EXP == vFogInfos.x)
 {
  fogCoeff = 1.0 / pow(E, fFogDistance * fogDensity);
 }
 else if (FOGMODE_EXP2 == vFogInfos.x)
 {
  fogCoeff = 1.0 / pow(E, fFogDistance * fFogDistance * fogDensity * fogDensity);
 }

 return clamp(fogCoeff, 0.0, 1.0);
}

#ifdef BUMP
// Thanks to http://www.thetenthplanet.de/archives/1180
mat3 cotangent_frame(vec3 normal, vec3 p, vec2 uv)
{
	// get edge vectors of the pixel triangle
	vec3 dp1 = dFdx(p);
	vec3 dp2 = dFdy(p);
	vec2 duv1 = dFdx(uv);
	vec2 duv2 = dFdy(uv);

	// solve the linear system
	vec3 dp2perp = cross(dp2, normal);
	vec3 dp1perp = cross(normal, dp1);
	vec3 tangent = dp2perp * duv1.x + dp1perp * duv2.x;
	vec3 binormal = dp2perp * duv1.y + dp1perp * duv2.y;

	// construct a scale-invariant frame 
	float invmax = inversesqrt(max(dot(tangent, tangent), dot(binormal, binormal)));
	return mat3(tangent * invmax, binormal * invmax, normal);
}

vec3 perturbNormal(vec3 viewDir)
{
	vec3 map = texture2D(bumpSampler, vBumpUV).xyz;
	map = map * 255. / 127. - 128. / 127.;
	mat3 TBN = cotangent_frame(vNormalW * 1., -viewDir, vBumpUV);
	return normalize(TBN * map);
}
vec3 perturbNormal2(vec3 viewDir)
{
	vec3 map = texture2D(bumpSampler, vBumpUV2).xyz;
	map = map * 255. / 127. - 128. / 127.;
	mat3 TBN = cotangent_frame(vNormalW * 1., -viewDir, vBumpUV2);
	return normalize(TBN * map);
}
#endif

// Shadows
#ifdef SHADOWS
uniform vec2 depthValues;

float unpack(vec4 color)
{
	const vec4 bit_shift = vec4(1.0 / (255.0 * 255.0 * 255.0), 1.0 / (255.0 * 255.0), 1.0 / 255.0, 1.0);
	return dot(color, bit_shift);
}
float computeShadowCube(vec3 lightPosition, samplerCube shadowSampler, float darkness, float bias)
{
	vec3 directionToLight = vPositionW - lightPosition;
	float depth = length(directionToLight);

	depth = clamp(depth, 0., 1.);

	directionToLight.y = 1.0 - directionToLight.y;

	float shadow = unpack(textureCube(shadowSampler, directionToLight)) + bias;

	if (depth > shadow)
	{
		return darkness;
	}
	return 1.0;
}

float computeShadow(vec4 vPositionFromLight, sampler2D shadowSampler, float darkness, float bias)
{
	vec3 depth = vPositionFromLight.xyz / vPositionFromLight.w;
	depth = 0.5 * depth + vec3(0.5);
	vec2 uv = depth.xy;

	if (uv.x < .0 || uv.x > 1.0 || uv.y < 0. || uv.y > 1.0)
	{
		return 1.;
	}

	float shadow = unpack(texture2D(shadowSampler0, uv)) + bias;
	if (depth.z > shadow)
	{
		return darkness;
	}
	return 1.;
}
float computeShadowWithPCFCube(vec3 lightPosition, samplerCube shadowSampler, float mapSize, float bias, float darkness)
{
	vec3 directionToLight = vPositionW - lightPosition;
	float depth = length(directionToLight);

	depth = (depth - depthValues.x) / (depthValues.y - depthValues.x);
	depth = clamp(depth, 0., 1.0);

	directionToLight = normalize(directionToLight);
	directionToLight.y = -directionToLight.y;

	float visibility = 1.;

	vec3 poissonDisk[4];
	poissonDisk[0] = vec3(-1.0, 1.0, -1.0);
	poissonDisk[1] = vec3(1.0, -1.0, -1.0);
	poissonDisk[2] = vec3(-1.0, -1.0, -1.0);
	poissonDisk[3] = vec3(1.0, -1.0, 1.0);

	// Poisson Sampling
	float biasedDepth = depth - bias;

	if (unpack(textureCube(shadowSampler, directionToLight + poissonDisk[0] * mapSize)) < biasedDepth) visibility -= 0.25;
	if (unpack(textureCube(shadowSampler, directionToLight + poissonDisk[1] * mapSize)) < biasedDepth) visibility -= 0.25;
	if (unpack(textureCube(shadowSampler, directionToLight + poissonDisk[2] * mapSize)) < biasedDepth) visibility -= 0.25;
	if (unpack(textureCube(shadowSampler, directionToLight + poissonDisk[3] * mapSize)) < biasedDepth) visibility -= 0.25;

	return  min(1.0, visibility + darkness);
}
float computeShadowWithPCF(vec4 vPositionFromLight, sampler2D shadowSampler, float mapSize, float bias, float darkness)
{
	vec3 depth = vPositionFromLight.xyz / vPositionFromLight.w;
	depth = 0.5 * depth + vec3(0.5);
	vec2 uv = depth.xy;

	if (uv.x < .0 || uv.x > 1.0 || uv.y < 0. || uv.y > 1.0)
	{
		return 1.;
	}

	float visibility = 1.;

	vec2 poissonDisk[4];
	poissonDisk[0] = vec2(-0.94201624, -0.39906216);
	poissonDisk[1] = vec2(0.94558609, -0.76890725);
	poissonDisk[2] = vec2(-0.094184101, -0.92938870);
	poissonDisk[3] = vec2(0.34495938, 0.29387760);

	// Poisson Sampling
	float biasedDepth = depth.z - bias;

	if (unpack(texture2D(shadowSampler, uv + poissonDisk[0] * mapSize)) < biasedDepth) visibility -= 0.25;
	if (unpack(texture2D(shadowSampler, uv + poissonDisk[1] * mapSize)) < biasedDepth) visibility -= 0.25;
	if (unpack(texture2D(shadowSampler, uv + poissonDisk[2] * mapSize)) < biasedDepth) visibility -= 0.25;
	if (unpack(texture2D(shadowSampler, uv + poissonDisk[3] * mapSize)) < biasedDepth) visibility -= 0.25;

	return  min(1.0, visibility + darkness);
}
#endif


void main(void) {
	vec3 viewDirectionW = normalize(vEyePosition - vPositionW);

	// Light
	vec3 lightVectorW = normalize(vLightPosition); // normalize(vLightPosition - vPositionW);

	// shadow
	float shadow = 1.;
#ifdef SHADOWS
#ifdef SHADOWPCF0
	shadow = computeShadowWithPCF(vPositionFromLight0, shadowSampler0, shadowsInfo0.y, shadowsInfo0.z, shadowsInfo0.x);
#else
	shadow = computeShadow(vPositionFromLight0, shadowSampler0, shadowsInfo0.x, shadowsInfo0.z);
#endif
#endif

	// Wave
	vec3 bumpNormal = (2.0 * texture2D(bumpSampler, vBumpUV).rgb - 1.0) + (2.0 * texture2D(bumpSampler, vBumpUV2).rgb - 1.0);
	vec2 perturbation = waveData.y * bumpNormal.rg;

	// diffuse
#ifdef BUMP
	vec3 normalW = (perturbNormal(viewDirectionW) + perturbNormal2(viewDirectionW)) / 2.;
#else 
	vec3 normalW = vec3(1.0,1.0,1.0);
#endif
	vec3 ndl = max(0., dot(normalW, lightVectorW)) + vLightAmbient;

	float alpha = 1.;
#ifdef OPACITY
	vec4 opacityMap = texture2D(opacitySampler, vOpacityUV);
	opacityMap.rgb = opacityMap.rgb * vec3(20.0, 0.59, 0.11);
	alpha *= clamp(20. - (opacityMap.r) * 2., 0., 1.);
#endif

	// Specular
	vec3 angleW = normalize(viewDirectionW + lightVectorW);
	float specComp = dot(normalize(normalW), angleW);
	specComp = pow(abs(specComp), vSpecularPower) * shadow;

	// Refraction
	vec2 texCoords;
	texCoords.x = vUV.x / vUV.w / 2.0 + 0.5;
	texCoords.y = vUV.y / vUV.w / 2.0 + 0.5;

	vec3 refractionColor = texture2D(refractionSampler, texCoords + perturbation).rgb;

	// Reflection
	vec3 reflectionColor = texture2D(reflectionSampler, texCoords + perturbation).rgb;

	// Fresnel
	float fresnelTerm = dot(viewDirectionW, vNormalW);
	fresnelTerm = clamp((1.0 - fresnelTerm) * vLevels.y, 0., 1.);

	// Water color
	vec3 finalColor = (waterColor * ndl * (.5 + shadow * .5)) * vLevels.x + (1.0 - vLevels.x) * (reflectionColor * fresnelTerm * vLevels.z + (1.0 - fresnelTerm) * refractionColor * vLevels.w * shadow) + (vec3(1) * specComp);


#ifdef FOG
	float fog = CalcFogFactor();
	finalColor.rgb = fog * finalColor.rgb + (1.0 - fog) * vFogColor;
#endif

	gl_FragColor = vec4(finalColor, alpha);
}