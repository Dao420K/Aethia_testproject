import * as THREE from 'three';

/**
 * Rayleigh Atmosphere Outer Halo Shader
 */
export const AtmosphereShader = {
  uniforms: {
    uSunDirection: { value: new THREE.Vector3(1, 0, 0) },
    uAtmosphereColor: { value: new THREE.Color('#3a86ff') },
    uSunsetColor: { value: new THREE.Color('#ffaa00') },
    uDensity: { value: 1.2 },
    uRayleighScale: { value: 1.5 },
  },
  vertexShader: `
    varying vec3 vNormal;
    varying vec3 vWorldPosition;

    void main() {
      vNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPos.xyz;
      gl_Position = projectionMatrix * viewMatrix * worldPos;
    }
  `,
  fragmentShader: `
    uniform vec3 uSunDirection;
    uniform vec3 uAtmosphereColor;
    uniform vec3 uSunsetColor;
    uniform float uDensity;
    uniform float uRayleighScale;

    varying vec3 vNormal;
    varying vec3 vWorldPosition;

    void main() {
      vec3 N = normalize(vNormal);
      vec3 viewVector = normalize(cameraPosition - vWorldPosition);
      float viewDotNormal = dot(viewVector, N);
      float rim = 1.0 - clamp(viewDotNormal, 0.0, 1.0);
      
      vec3 lightDir = normalize(uSunDirection);
      float sunDotNormal = dot(lightDir, N);
      
      // Day side factor (lit side of atmosphere)
      float dayFactor = smoothstep(-0.25, 0.3, sunDotNormal);
      
      // Sunset transition: peaks near terminator boundary (sunDotNormal ~ 0.0) on lit side
      float sunsetFactor = smoothstep(0.35, 0.0, abs(sunDotNormal)) * dayFactor;
      
      // Pure Cyan-Blue sky for day, golden amber accent for sunset
      vec3 skyBlue = uAtmosphereColor;
      vec3 solarGold = vec3(1.0, 0.65, 0.2);
      
      vec3 scatColor = mix(skyBlue, solarGold, sunsetFactor * 0.8);
      
      // Atmosphere intensity powered by rim angle and density
      float intensity = pow(rim, 3.2 * (2.0 / uRayleighScale)) * uDensity;
      intensity *= (dayFactor * 0.85 + 0.15);

      gl_FragColor = vec4(scatColor * intensity, intensity * 0.85);
    }
  `
};

/**
 * Custom Surface Planet Shader with Night Lights, Ocean Specularity, and Cloud Shadows
 */
export const PlanetSurfaceShader = {
  uniforms: {
    uDayTexture: { value: null as THREE.Texture | null },
    uBumpTexture: { value: null as THREE.Texture | null },
    uSpecularTexture: { value: null as THREE.Texture | null },
    uNightTexture: { value: null as THREE.Texture | null },
    uCloudTexture: { value: null as THREE.Texture | null },
    uSunDirection: { value: new THREE.Vector3(1, 0, 0) },
    uCityLightsIntensity: { value: 1.5 },
    uCloudShadowStrength: { value: 0.6 },
    uCloudOffset: { value: 0.0 }, // Dynamic cloud rotation offset
    uSpecularPower: { value: 32.0 },
    uBumpScale: { value: 0.05 },
    uVolcanoGlow: { value: 2.0 }
  },
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;

    void main() {
      vUv = uv;
      vNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPos.xyz;
      gl_Position = projectionMatrix * viewMatrix * worldPos;
    }
  `,
  fragmentShader: `
    uniform sampler2D uDayTexture;
    uniform sampler2D uBumpTexture;
    uniform sampler2D uSpecularTexture;
    uniform sampler2D uNightTexture;
    uniform sampler2D uCloudTexture;
    
    uniform vec3 uSunDirection;
    uniform float uCityLightsIntensity;
    uniform float uCloudShadowStrength;
    uniform float uCloudOffset;
    uniform float uSpecularPower;
    uniform float uBumpScale;
    uniform float uVolcanoGlow;

    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;

    void main() {
      vec3 N = normalize(vNormal);

      // 1. Day Color Texture
      vec4 dayColor = texture2D(uDayTexture, vUv);
      
      // 2. Specular / Glossiness Map (Oceans white, Land black)
      vec4 specMap = texture2D(uSpecularTexture, vUv);
      float isOcean = specMap.r;
      
      // 3. Cloud Map & Soft Shadow Projection
      vec2 cloudUv = vec2(vUv.x + uCloudOffset, vUv.y);
      vec4 cloudColor = texture2D(uCloudTexture, cloudUv);
      
      // Light directional offset for shadow
      vec3 lightDir = normalize(uSunDirection);
      vec2 shadowUv = cloudUv - vec2(lightDir.x * 0.015, lightDir.y * 0.008);
      vec4 cloudShadow = texture2D(uCloudTexture, shadowUv);
      float shadowFactor = 1.0 - (cloudShadow.r * uCloudShadowStrength);
      
      // 4. Lighting calculations
      float NdotL = max(dot(N, lightDir), 0.0);
      
      // Apply Cloud Shadow to Day Lighting
      vec3 litDayColor = dayColor.rgb * (NdotL * shadowFactor + 0.08);

      // 5. Specular Ocean Glare (Fresnel/Phong)
      vec3 viewDir = normalize(cameraPosition - vWorldPosition);
      vec3 halfDir = normalize(lightDir + viewDir);
      float specAngle = max(dot(N, halfDir), 0.0);
      float specular = pow(specAngle, uSpecularPower) * isOcean * NdotL * 2.2;
      vec3 specColor = vec3(1.0, 0.96, 0.85) * specular;

      // 6. Night Lights & Volcano Lava Glow
      vec4 nightColor = texture2D(uNightTexture, vUv);
      
      // Night is active where NdotL is <= 0.2
      float nightFactor = smoothstep(0.25, -0.15, dot(N, lightDir));
      
      // Red/Orange lava highlights pop even brighter
      vec3 nightGlow = nightColor.rgb * uCityLightsIntensity;
      if (nightColor.r > 0.5 && nightColor.g < 0.35) {
        nightGlow *= uVolcanoGlow; // Volcano lava glow booster
      }

      // 7. Combine Day + Specular + Night
      vec3 finalColor = mix(litDayColor + specColor, nightGlow, nightFactor);

      // Atmosphere Horizon Blend at edge
      float rim = 1.0 - max(dot(viewDir, N), 0.0);
      vec3 atmosphereRim = vec3(0.2, 0.5, 1.0) * pow(rim, 3.8) * NdotL;

      gl_FragColor = vec4(finalColor + atmosphereRim, 1.0);
    }
  `
};
