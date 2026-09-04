import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EnvironmentalParams, GridSegmentSector, LocationPOI, VulkanPipelineStats } from '../types';
import { generateAetheliaTextures, GeneratedPlanetTextures } from '../utils/aetheliaTexture';
import { generateAethelgardTextures } from '../utils/aethelgardTexture';
import { generateLunaNovaTextures } from '../utils/lunaNovaTexture';
import { generateGaiaTextures } from '../utils/gaiaTexture';
import { AtmosphereShader, PlanetSurfaceShader } from '../utils/shaders';
import { AETHELIA_LOCATIONS, AETHELGARD_LOCATIONS, LUNA_NOVA_LOCATIONS, GAIA_LOCATIONS } from '../data/locations';

interface VulkanViewportProps {
  params: EnvironmentalParams;
  locations: LocationPOI[];
  selectedLocation: LocationPOI | null;
  onSelectLocation: (location: LocationPOI | null) => void;
  onUpdateStats: (stats: VulkanPipelineStats) => void;
  activeAlertLocationId?: string;
  selectedSector?: GridSegmentSector | null;
  onSelectSector?: (sector: GridSegmentSector | null) => void;
  onChangeParams?: (params: EnvironmentalParams) => void;
}

export const VulkanViewport: React.FC<VulkanViewportProps> = ({
  params,
  locations,
  selectedLocation,
  onSelectLocation,
  onUpdateStats,
  activeAlertLocationId,
  selectedSector,
  onSelectSector,
  onChangeParams,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  // Central Real Sun Group & Lighting
  const centralSunGroupRef = useRef<THREE.Group | null>(null);
  const centralSunLightRef = useRef<THREE.PointLight | null>(null);
  const orbitRingMeshRef = useRef<THREE.Line | null>(null);

  // Planet 1: Aethelia Prime
  const aetheliaGroupRef = useRef<THREE.Group | null>(null);
  const aetheliaMeshRef = useRef<THREE.Mesh | null>(null);
  const aetheliaOceanMeshRef = useRef<THREE.Mesh | null>(null);
  const aetheliaAtmosphereMeshRef = useRef<THREE.Mesh | null>(null);
  const aetheliaCloudMeshRef = useRef<THREE.Mesh | null>(null);
  const aetheliaMatRef = useRef<THREE.ShaderMaterial | null>(null);
  const aetheliaOceanMatRef = useRef<THREE.MeshPhysicalMaterial | null>(null);
  const aetheliaAtmosphereMatRef = useRef<THREE.ShaderMaterial | null>(null);
  const aetheliaMarkersGroupRef = useRef<THREE.Group | null>(null);
  const aetheliaLavaRef = useRef<THREE.Points | null>(null);

  // Planet 2: Aethelgard (Opposite Orbit)
  const aethelgardGroupRef = useRef<THREE.Group | null>(null);
  const aethelgardMeshRef = useRef<THREE.Mesh | null>(null);
  const aethelgardOceanMeshRef = useRef<THREE.Mesh | null>(null);
  const aethelgardAtmosphereMeshRef = useRef<THREE.Mesh | null>(null);
  const aethelgardCloudMeshRef = useRef<THREE.Mesh | null>(null);
  const aethelgardMatRef = useRef<THREE.ShaderMaterial | null>(null);
  const aethelgardOceanMatRef = useRef<THREE.MeshPhysicalMaterial | null>(null);
  const aethelgardAtmosphereMatRef = useRef<THREE.ShaderMaterial | null>(null);
  const aethelgardMarkersGroupRef = useRef<THREE.Group | null>(null);
  const aethelgardLavaRef = useRef<THREE.Points | null>(null);

  // Moon 1: Luna Nova (Orbiting Aethelia Prime)
  const lunaNovaGroupRef = useRef<THREE.Group | null>(null);
  const lunaNovaMeshRef = useRef<THREE.Mesh | null>(null);
  const lunaNovaAtmosphereMeshRef = useRef<THREE.Mesh | null>(null);
  const lunaNovaCloudMeshRef = useRef<THREE.Mesh | null>(null);
  const lunaNovaMatRef = useRef<THREE.ShaderMaterial | null>(null);
  const lunaNovaAtmosphereMatRef = useRef<THREE.ShaderMaterial | null>(null);
  const lunaNovaMarkersGroupRef = useRef<THREE.Group | null>(null);
  const moonOrbitRingMeshRef = useRef<THREE.Line | null>(null);
  const moonAngleRef = useRef<number>(0);

  // Planet 3: GAIA ("La Planète Vivante" - 1.75x Aethelia Radius, Outer Orbit)
  const gaiaGroupRef = useRef<THREE.Group | null>(null);
  const gaiaMeshRef = useRef<THREE.Mesh | null>(null);
  const gaiaOceanMeshRef = useRef<THREE.Mesh | null>(null);
  const gaiaAtmosphereMeshRef = useRef<THREE.Mesh | null>(null);
  const gaiaCloudMeshRef = useRef<THREE.Mesh | null>(null);
  const gaiaMatRef = useRef<THREE.ShaderMaterial | null>(null);
  const gaiaOceanMatRef = useRef<THREE.MeshPhysicalMaterial | null>(null);
  const gaiaAtmosphereMatRef = useRef<THREE.ShaderMaterial | null>(null);
  const gaiaMarkersGroupRef = useRef<THREE.Group | null>(null);
  const gaiaOrbitRingMeshRef = useRef<THREE.Line | null>(null);
  const gaiaRingsMeshRef = useRef<THREE.Mesh | null>(null);
  const gaiaAngleRef = useRef<number>(Math.PI * 0.45);

  // Asteroid Belt: Ceinture de Kaelis
  const asteroidBeltPointsRef = useRef<THREE.Points | null>(null);
  const tourProgressRef = useRef<number>(0);

  // Sculpting & Interaction Widgets
  const brushRingMeshRef = useRef<THREE.Mesh | null>(null);
  const segmentHighlightRef = useRef<THREE.Mesh | null>(null);
  const isSculptingRef = useRef<boolean>(false);

  // Hovered sector state
  const [hoveredSector, setHoveredSector] = useState<GridSegmentSector | null>(null);

  // Performance telemetry counters
  const lastTimeRef = useRef<number>(performance.now());
  const framesRef = useRef<number>(0);
  const orbitAngleRef = useRef<number>(0);

  // Sync params in ref for real-time reactivity in animation loop & event handlers
  const paramsRef = useRef<EnvironmentalParams>(params);
  useEffect(() => {
    paramsRef.current = params;
  }, [params]);

  // Helper to map lat/lng to sector code
  const getSectorFromLatLng = (lat: number, lng: number, elevation = 0, planetName = 'Aethelia'): GridSegmentSector => {
    const latBand = Math.min(Math.max(Math.floor((lat + 90) / 30), 0), 5);
    const lngCol = Math.min(Math.max(Math.floor((lng + 180) / 30), 0), 11);
    const bandLetters = ['A', 'B', 'C', 'D', 'E', 'F'];
    const code = `SEC-${bandLetters[latBand]}${(lngCol + 1).toString().padStart(2, '0')}`;

    const biomes = [
      `Plateau Volcanique ${planetName}`,
      'Fosse Océanique Abyssale',
      'Méta-Biosphère Tropicale',
      'Plaine de Cristal Ignis',
      'Toundra Givrée Borealis',
      'Cité Archipel Flottante',
    ];
    const biomeIndex = Math.abs(Math.floor(lat * 3 + lng * 5)) % biomes.length;

    return {
      id: `${planetName}_${code}`,
      code: `${planetName[0]}_${code}`,
      lat: Math.round(lat * 10) / 10,
      lng: Math.round(lng * 10) / 10,
      elevation: Math.round(elevation * 120),
      biome: biomes[biomeIndex],
      seismicIndex: parseFloat((0.1 + (Math.abs(lat) % 0.8)).toFixed(2)),
      temperature: `${Math.round(32 - Math.abs(lat) * 0.7)}°C`,
      vulkanMemoryAddress: `0xVK_${code}_${Math.floor(Math.abs(lng * 120)).toString(16).toUpperCase()}`,
    };
  };

  // Perform Real-Time 3D Terrain Sculpting
  const performSculpt = (planetMesh: THREE.Mesh, hitPoint: THREE.Vector3) => {
    const geo = planetMesh.geometry as THREE.SphereGeometry;
    const posAttr = geo.attributes.position;
    const count = posAttr.count;

    const p = paramsRef.current;
    const tool = p.sculptTool;
    const radius = p.brushRadius * 100;
    const strength = p.brushStrength * 4.0;
    const baseR =
      planetMesh === aethelgardMeshRef.current
        ? 80
        : planetMesh === lunaNovaMeshRef.current
        ? 27.3
        : planetMesh === gaiaMeshRef.current
        ? 175
        : 100;

    // Convert world hit point to local mesh space
    const localHit = planetMesh.worldToLocal(hitPoint.clone());

    let modified = false;
    const vPos = new THREE.Vector3();

    for (let i = 0; i < count; i++) {
      vPos.set(posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i));

      const dist = vPos.distanceTo(localHit);
      if (dist < radius) {
        const falloff = Math.exp(-Math.pow(dist / (radius * 0.55), 2));
        const currentR = vPos.length();
        let deltaR = 0;

        if (tool === 'raise') {
          deltaR = strength * falloff;
        } else if (tool === 'lower') {
          deltaR = -strength * falloff;
        } else if (tool === 'flatten') {
          const targetR = localHit.length();
          deltaR = (targetR - currentR) * 0.15 * falloff;
        } else if (tool === 'smooth') {
          deltaR = (baseR - currentR) * 0.08 * falloff;
        }

        const newR = Math.min(Math.max(currentR + deltaR, baseR - 15), baseR + 25);
        const dir = vPos.clone().normalize();
        const newPos = dir.multiplyScalar(newR);

        posAttr.setXYZ(i, newPos.x, newPos.y, newPos.z);
        modified = true;
      }
    }

    if (modified) {
      posAttr.needsUpdate = true;
      geo.computeVertexNormals();
    }
  };

  // Initial Scene Setup
  useEffect(() => {
    if (!mountRef.current) return;

    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#02040a');
    sceneRef.current = scene;

    // Starfield Background
    const starGeo = new THREE.BufferGeometry();
    const starCount = 4500;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPos[i] = (Math.random() - 0.5) * 2200;
      starPos[i + 1] = (Math.random() - 0.5) * 2200;
      starPos[i + 2] = (Math.random() - 0.5) * 2200;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1.3,
      transparent: true,
      opacity: 0.85,
    });
    scene.add(new THREE.Points(starGeo, starMat));

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 4000);
    camera.position.set(0, 350, 750);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = params.exposure;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.6;
    controls.minDistance = 110;
    controls.maxDistance = 1600;
    controlsRef.current = controls;

    // 5. CENTRAL REAL SUN & EMISSIVE SOLAR CORONA (At Position 0,0,0)
    const centralSunGroup = new THREE.Group();

    // Solar Core Mesh
    const sunGeo = new THREE.SphereGeometry(params.sunSize, 48, 48);
    const sunMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(params.sunColor),
    });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    centralSunGroup.add(sunMesh);

    // Solar Corona Halo
    const coronaGeo = new THREE.SphereGeometry(params.sunSize * 1.35, 32, 32);
    const coronaMat = new THREE.MeshBasicMaterial({
      color: 0xffcc33,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
    });
    const coronaMesh = new THREE.Mesh(coronaGeo, coronaMat);
    centralSunGroup.add(coronaMesh);

    // Central Sun Light Source casting outwards onto both planets
    const sunLight = new THREE.PointLight(0xfff5e6, params.sunIntensity * 3.5, 3000, 0.1);
    centralSunGroup.add(sunLight);
    centralSunLightRef.current = sunLight;

    scene.add(centralSunGroup);
    centralSunGroupRef.current = centralSunGroup;

    // 6. SHARED ORBITAL RING (Glowing trajectory path around the Sun)
    const orbitPoints: THREE.Vector3[] = [];
    const segments = 128;
    const rOrbit = params.orbitRadius;
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      orbitPoints.push(new THREE.Vector3(Math.cos(theta) * rOrbit, 0, Math.sin(theta) * rOrbit));
    }
    const orbitGeo = new THREE.BufferGeometry().setFromPoints(orbitPoints);
    const orbitMat = new THREE.LineBasicMaterial({ color: 0xffaa00, transparent: true, opacity: 0.4 });
    const orbitRingMesh = new THREE.Line(orbitGeo, orbitMat);
    scene.add(orbitRingMesh);
    orbitRingMeshRef.current = orbitRingMesh;

    // Ambient Space Light
    const ambientLight = new THREE.AmbientLight(0x0c101d, 0.35);
    scene.add(ambientLight);

    // ==========================================
    // PLANET 1: AETHELIA PRIME (10% Earth Radius = 637.1 km -> 100 Units)
    // ===================================================================
    const aetheliaGroup = new THREE.Group();
    aetheliaGroup.name = 'Aethelia';
    scene.add(aetheliaGroup);
    aetheliaGroupRef.current = aetheliaGroup;

    const texturesAethelia = generateAetheliaTextures(2048, 1024);
    const aetheliaRadius = 100; // 10% Earth Radius (637.1 km)

    // Terrain Sphere
    const aetheliaGeo = new THREE.SphereGeometry(aetheliaRadius, 128, 128);
    const aetheliaMat = new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.clone(PlanetSurfaceShader.uniforms),
      vertexShader: PlanetSurfaceShader.vertexShader,
      fragmentShader: PlanetSurfaceShader.fragmentShader,
    });
    aetheliaMat.uniforms.uDayTexture.value = texturesAethelia.colorTexture;
    aetheliaMat.uniforms.uBumpTexture.value = texturesAethelia.bumpTexture;
    aetheliaMat.uniforms.uSpecularTexture.value = texturesAethelia.specularTexture;
    aetheliaMat.uniforms.uNightTexture.value = texturesAethelia.nightTexture;
    aetheliaMat.uniforms.uCloudTexture.value = texturesAethelia.cloudTexture;
    aetheliaMatRef.current = aetheliaMat;

    const aetheliaMesh = new THREE.Mesh(aetheliaGeo, aetheliaMat);
    aetheliaGroup.add(aetheliaMesh);
    aetheliaMeshRef.current = aetheliaMesh;

    // Ocean Sphere
    const oceanGeo1 = new THREE.SphereGeometry(aetheliaRadius * params.waterSphereRadius, 96, 96);
    const oceanMat1 = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(params.oceanColor),
      transparent: true,
      opacity: 0.78,
      roughness: params.oceanRoughness,
      metalness: params.materialMetalness,
      transmission: 0.25,
      ior: 1.33,
      reflectivity: 0.9,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      side: THREE.DoubleSide,
    });
    aetheliaOceanMatRef.current = oceanMat1;
    const aetheliaOceanMesh = new THREE.Mesh(oceanGeo1, oceanMat1);
    aetheliaGroup.add(aetheliaOceanMesh);
    aetheliaOceanMeshRef.current = aetheliaOceanMesh;

    // Atmosphere Scattering Volume
    const atmosphereGeo1 = new THREE.SphereGeometry(aetheliaRadius * 1.12, 96, 96);
    const atmosphereMat1 = new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.clone(AtmosphereShader.uniforms),
      vertexShader: AtmosphereShader.vertexShader,
      fragmentShader: AtmosphereShader.fragmentShader,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
    });
    aetheliaAtmosphereMatRef.current = atmosphereMat1;
    const aetheliaAtmosphereMesh = new THREE.Mesh(atmosphereGeo1, atmosphereMat1);
    aetheliaGroup.add(aetheliaAtmosphereMesh);
    aetheliaAtmosphereMeshRef.current = aetheliaAtmosphereMesh;

    // Cloud Shell
    const cloudGeo1 = new THREE.SphereGeometry(aetheliaRadius * 1.035, 96, 96);
    const cloudMat1 = new THREE.MeshStandardMaterial({
      map: texturesAethelia.cloudTexture,
      transparent: true,
      opacity: 0.65,
      blending: THREE.NormalBlending,
      roughness: 0.9,
    });
    const aetheliaCloudMesh = new THREE.Mesh(cloudGeo1, cloudMat1);
    aetheliaGroup.add(aetheliaCloudMesh);
    aetheliaCloudMeshRef.current = aetheliaCloudMesh;

    // Location Pins for Aethelia
    const aetheliaMarkersGroup = new THREE.Group();
    aetheliaGroup.add(aetheliaMarkersGroup);
    aetheliaMarkersGroupRef.current = aetheliaMarkersGroup;

    AETHELIA_LOCATIONS.forEach(loc => {
      const phi = (90 - loc.lat) * (Math.PI / 180);
      const theta = (loc.lng + 180) * (Math.PI / 180);
      const r = aetheliaRadius * 1.025;
      const x = -(r * Math.sin(phi) * Math.cos(theta));
      const z = r * Math.sin(phi) * Math.sin(theta);
      const y = r * Math.cos(phi);

      const pinGeo = new THREE.SphereGeometry(2.2, 16, 16);
      const pinColor = loc.type === 'volcano' ? 0xff3300 : loc.type === 'floating' ? 0x00e1ff : 0x33dd88;
      const pinMesh = new THREE.Mesh(pinGeo, new THREE.MeshBasicMaterial({ color: pinColor }));
      pinMesh.position.set(x, y, z);
      pinMesh.userData = { location: loc, planet: 'Aethelia' };

      const pulseRingMesh = new THREE.Mesh(
        new THREE.RingGeometry(2.8, 3.8, 24),
        new THREE.MeshBasicMaterial({ color: pinColor, side: THREE.DoubleSide, transparent: true, opacity: 0.8 })
      );
      pulseRingMesh.position.set(x * 1.01, y * 1.01, z * 1.01);
      pulseRingMesh.lookAt(0, 0, 0);

      const pinGroup = new THREE.Group();
      pinGroup.add(pinMesh);
      pinGroup.add(pulseRingMesh);
      aetheliaMarkersGroup.add(pinGroup);
    });

    // ==============================================================================
    // PLANET 2: AETHELGARD (20% Smaller than Aethelia -> Radius = 80 Units / 509.7 km)
    // ==============================================================================
    const aethelgardGroup = new THREE.Group();
    aethelgardGroup.name = 'Aethelgard';
    scene.add(aethelgardGroup);
    aethelgardGroupRef.current = aethelgardGroup;

    const texturesAethelgard = generateAethelgardTextures(2048, 1024);
    const aethelgardRadius = 80; // 20% smaller than Aethelia (509.7 km)

    // Terrain Sphere
    const aethelgardGeo = new THREE.SphereGeometry(aethelgardRadius, 128, 128);
    const aethelgardMat = new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.clone(PlanetSurfaceShader.uniforms),
      vertexShader: PlanetSurfaceShader.vertexShader,
      fragmentShader: PlanetSurfaceShader.fragmentShader,
    });
    aethelgardMat.uniforms.uDayTexture.value = texturesAethelgard.colorTexture;
    aethelgardMat.uniforms.uBumpTexture.value = texturesAethelgard.bumpTexture;
    aethelgardMat.uniforms.uSpecularTexture.value = texturesAethelgard.specularTexture;
    aethelgardMat.uniforms.uNightTexture.value = texturesAethelgard.nightTexture;
    aethelgardMat.uniforms.uCloudTexture.value = texturesAethelgard.cloudTexture;
    aethelgardMatRef.current = aethelgardMat;

    const aethelgardMesh = new THREE.Mesh(aethelgardGeo, aethelgardMat);
    aethelgardGroup.add(aethelgardMesh);
    aethelgardMeshRef.current = aethelgardMesh;

    // Ocean Sphere
    const oceanGeo2 = new THREE.SphereGeometry(aethelgardRadius * params.waterSphereRadius, 96, 96);
    const oceanMat2 = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#0a445c'),
      transparent: true,
      opacity: 0.78,
      roughness: params.oceanRoughness,
      metalness: params.materialMetalness,
      transmission: 0.25,
      ior: 1.33,
      reflectivity: 0.9,
      clearcoat: 1.0,
      side: THREE.DoubleSide,
    });
    aethelgardOceanMatRef.current = oceanMat2;
    const aethelgardOceanMesh = new THREE.Mesh(oceanGeo2, oceanMat2);
    aethelgardGroup.add(aethelgardOceanMesh);
    aethelgardOceanMeshRef.current = aethelgardOceanMesh;

    // Atmosphere Volume
    const atmosphereGeo2 = new THREE.SphereGeometry(aethelgardRadius * 1.12, 96, 96);
    const atmosphereMat2 = new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.clone(AtmosphereShader.uniforms),
      vertexShader: AtmosphereShader.vertexShader,
      fragmentShader: AtmosphereShader.fragmentShader,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
    });
    aethelgardAtmosphereMatRef.current = atmosphereMat2;
    const aethelgardAtmosphereMesh = new THREE.Mesh(atmosphereGeo2, atmosphereMat2);
    aethelgardGroup.add(aethelgardAtmosphereMesh);
    aethelgardAtmosphereMeshRef.current = aethelgardAtmosphereMesh;

    // Cloud Shell
    const cloudGeo2 = new THREE.SphereGeometry(aethelgardRadius * 1.035, 96, 96);
    const cloudMat2 = new THREE.MeshStandardMaterial({
      map: texturesAethelgard.cloudTexture,
      transparent: true,
      opacity: 0.65,
      blending: THREE.NormalBlending,
      roughness: 0.9,
    });
    const aethelgardCloudMesh = new THREE.Mesh(cloudGeo2, cloudMat2);
    aethelgardGroup.add(aethelgardCloudMesh);
    aethelgardCloudMeshRef.current = aethelgardCloudMesh;

    // Location Pins for Aethelgard
    const aethelgardMarkersGroup = new THREE.Group();
    aethelgardGroup.add(aethelgardMarkersGroup);
    aethelgardMarkersGroupRef.current = aethelgardMarkersGroup;

    AETHELGARD_LOCATIONS.forEach(loc => {
      const phi = (90 - loc.lat) * (Math.PI / 180);
      const theta = (loc.lng + 180) * (Math.PI / 180);
      const r = aethelgardRadius * 1.025;
      const x = -(r * Math.sin(phi) * Math.cos(theta));
      const z = r * Math.sin(phi) * Math.sin(theta);
      const y = r * Math.cos(phi);

      const pinGeo = new THREE.SphereGeometry(2.0, 16, 16);
      const pinColor = loc.type === 'volcano' ? 0xff2200 : loc.type === 'city' ? 0xffcc00 : 0x00e1ff;
      const pinMesh = new THREE.Mesh(pinGeo, new THREE.MeshBasicMaterial({ color: pinColor }));
      pinMesh.position.set(x, y, z);
      pinMesh.userData = { location: loc, planet: 'Aethelgard' };

      const pulseRingMesh = new THREE.Mesh(
        new THREE.RingGeometry(2.5, 3.5, 24),
        new THREE.MeshBasicMaterial({ color: pinColor, side: THREE.DoubleSide, transparent: true, opacity: 0.8 })
      );
      pulseRingMesh.position.set(x * 1.01, y * 1.01, z * 1.01);
      pulseRingMesh.lookAt(0, 0, 0);

      const pinGroup = new THREE.Group();
      pinGroup.add(pinMesh);
      pinGroup.add(pulseRingMesh);
      aethelgardMarkersGroup.add(pinGroup);
    });

    // ==============================================================================
    // MOON 1: LUNA NOVA (Moon Scale -> Radius = 27.3 Units / 173.7 km proportional)
    // ==============================================================================
    const lunaNovaGroup = new THREE.Group();
    lunaNovaGroup.name = 'Luna Nova';
    scene.add(lunaNovaGroup);
    lunaNovaGroupRef.current = lunaNovaGroup;

    const texturesLunaNova = generateLunaNovaTextures(2048, 1024);
    const moonRadius = 27.3; // Earth's Moon relative scale (27.3% of Aethelia = 173.7 km)

    // Terrain Sphere
    const lunaNovaGeo = new THREE.SphereGeometry(moonRadius, 96, 96);
    const lunaNovaMat = new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.clone(PlanetSurfaceShader.uniforms),
      vertexShader: PlanetSurfaceShader.vertexShader,
      fragmentShader: PlanetSurfaceShader.fragmentShader,
    });
    lunaNovaMat.uniforms.uDayTexture.value = texturesLunaNova.colorTexture;
    lunaNovaMat.uniforms.uBumpTexture.value = texturesLunaNova.bumpTexture;
    lunaNovaMat.uniforms.uSpecularTexture.value = texturesLunaNova.specularTexture;
    lunaNovaMat.uniforms.uNightTexture.value = texturesLunaNova.nightTexture;
    lunaNovaMat.uniforms.uCloudTexture.value = texturesLunaNova.cloudTexture;
    lunaNovaMatRef.current = lunaNovaMat;

    const lunaNovaMesh = new THREE.Mesh(lunaNovaGeo, lunaNovaMat);
    lunaNovaGroup.add(lunaNovaMesh);
    lunaNovaMeshRef.current = lunaNovaMesh;

    // Atmosphere Volume
    const atmosphereGeo3 = new THREE.SphereGeometry(moonRadius * 1.10, 64, 64);
    const atmosphereMat3 = new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.clone(AtmosphereShader.uniforms),
      vertexShader: AtmosphereShader.vertexShader,
      fragmentShader: AtmosphereShader.fragmentShader,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
    });
    lunaNovaAtmosphereMatRef.current = atmosphereMat3;
    const lunaNovaAtmosphereMesh = new THREE.Mesh(atmosphereGeo3, atmosphereMat3);
    lunaNovaGroup.add(lunaNovaAtmosphereMesh);
    lunaNovaAtmosphereMeshRef.current = lunaNovaAtmosphereMesh;

    // Cloud Shell
    const cloudGeo3 = new THREE.SphereGeometry(moonRadius * 1.025, 64, 64);
    const cloudMat3 = new THREE.MeshStandardMaterial({
      map: texturesLunaNova.cloudTexture,
      transparent: true,
      opacity: 0.55,
      blending: THREE.NormalBlending,
      roughness: 0.9,
    });
    const lunaNovaCloudMesh = new THREE.Mesh(cloudGeo3, cloudMat3);
    lunaNovaGroup.add(lunaNovaCloudMesh);
    lunaNovaCloudMeshRef.current = lunaNovaCloudMesh;

    // Location Pins for Luna Nova
    const lunaNovaMarkersGroup = new THREE.Group();
    lunaNovaGroup.add(lunaNovaMarkersGroup);
    lunaNovaMarkersGroupRef.current = lunaNovaMarkersGroup;

    LUNA_NOVA_LOCATIONS.forEach(loc => {
      const phi = (90 - loc.lat) * (Math.PI / 180);
      const theta = (loc.lng + 180) * (Math.PI / 180);
      const r = moonRadius * 1.025;
      const x = -(r * Math.sin(phi) * Math.cos(theta));
      const z = r * Math.sin(phi) * Math.sin(theta);
      const y = r * Math.cos(phi);

      const pinGeo = new THREE.SphereGeometry(1.4, 16, 16);
      const pinColor = loc.type === 'volcano' ? 0xff3300 : loc.type === 'city' ? 0xaa00ff : 0x00e1ff;
      const pinMesh = new THREE.Mesh(pinGeo, new THREE.MeshBasicMaterial({ color: pinColor }));
      pinMesh.position.set(x, y, z);
      pinMesh.userData = { location: loc, planet: 'Luna Nova' };

      const pulseRingMesh = new THREE.Mesh(
        new THREE.RingGeometry(2.0, 2.8, 20),
        new THREE.MeshBasicMaterial({ color: pinColor, side: THREE.DoubleSide, transparent: true, opacity: 0.8 })
      );
      pulseRingMesh.position.set(x * 1.01, y * 1.01, z * 1.01);
      pulseRingMesh.lookAt(0, 0, 0);

      const pinGroup = new THREE.Group();
      pinGroup.add(pinMesh);
      pinGroup.add(pulseRingMesh);
      lunaNovaMarkersGroup.add(pinGroup);
    });

    // Moon Orbit Trajectory Ring
    const moonOrbitPoints: THREE.Vector3[] = [];
    const moonOrbitSegments = 64;
    const rMoonOrbit = params.moonOrbitRadius * 3.2;
    for (let i = 0; i <= moonOrbitSegments; i++) {
      const theta = (i / moonOrbitSegments) * Math.PI * 2;
      moonOrbitPoints.push(new THREE.Vector3(Math.cos(theta) * rMoonOrbit, Math.sin(theta) * 12, Math.sin(theta) * rMoonOrbit));
    }
    const moonOrbitGeo = new THREE.BufferGeometry().setFromPoints(moonOrbitPoints);
    const moonOrbitMat = new THREE.LineBasicMaterial({ color: 0xaa55ff, transparent: true, opacity: 0.5 });
    const moonOrbitRingMesh = new THREE.Line(moonOrbitGeo, moonOrbitMat);
    scene.add(moonOrbitRingMesh);
    moonOrbitRingMeshRef.current = moonOrbitRingMesh;

    // 6b. Planet 3: GAIA ("La Planète Vivante" - 1.75x Aethelia Radius, Outer Orbit)
    const gaiaGroup = new THREE.Group();
    scene.add(gaiaGroup);
    gaiaGroupRef.current = gaiaGroup;

    const texturesGaia = generateGaiaTextures();
    const gaiaRadius = 175; // 1.75 * 100

    // Planet Surface
    const gaiaGeo = new THREE.SphereGeometry(gaiaRadius, 128, 128);
    const gaiaMat = new THREE.ShaderMaterial({
      vertexShader: PlanetSurfaceShader.vertexShader,
      fragmentShader: PlanetSurfaceShader.fragmentShader,
      uniforms: THREE.UniformsUtils.clone(PlanetSurfaceShader.uniforms),
    });
    gaiaMat.uniforms.uDayTexture.value = texturesGaia.colorTexture;
    gaiaMat.uniforms.uBumpTexture.value = texturesGaia.bumpTexture;
    gaiaMat.uniforms.uSpecularTexture.value = texturesGaia.specularTexture;
    gaiaMat.uniforms.uNightTexture.value = texturesGaia.nightTexture;
    gaiaMat.uniforms.uCloudTexture.value = texturesGaia.cloudTexture;
    gaiaMat.uniforms.uBumpScale.value = 1.6;
    gaiaMat.uniforms.uCityLightsIntensity.value = params.cityLightsIntensity;
    gaiaMat.uniforms.uVolcanoGlow.value = params.volcanoGlowIntensity;
    gaiaMatRef.current = gaiaMat;

    const gaiaMesh = new THREE.Mesh(gaiaGeo, gaiaMat);
    gaiaMesh.userData = { planetName: 'GAIA' };
    gaiaGroup.add(gaiaMesh);
    gaiaMeshRef.current = gaiaMesh;

    // Ocean Shell
    const gaiaOceanGeo = new THREE.SphereGeometry(gaiaRadius * params.waterSphereRadius, 96, 96);
    const gaiaOceanMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#0d5c75'),
      roughness: 0.12,
      metalness: 0.08,
      transmission: 0.45,
      ior: 1.333,
      transparent: true,
      opacity: 0.88,
      reflectivity: 0.9,
    });
    const gaiaOceanMesh = new THREE.Mesh(gaiaOceanGeo, gaiaOceanMat);
    gaiaGroup.add(gaiaOceanMesh);
    gaiaOceanMeshRef.current = gaiaOceanMesh;
    gaiaOceanMatRef.current = gaiaOceanMat;

    // Atmosphere Shell
    const atmosphereGeoG = new THREE.SphereGeometry(gaiaRadius * 1.12, 96, 96);
    const atmosphereMatG = new THREE.ShaderMaterial({
      vertexShader: AtmosphereShader.vertexShader,
      fragmentShader: AtmosphereShader.fragmentShader,
      uniforms: THREE.UniformsUtils.clone(AtmosphereShader.uniforms),
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
    });
    atmosphereMatG.uniforms.uAtmosphereColor.value = new THREE.Color('#38bdf8');
    atmosphereMatG.uniforms.uDensity.value = params.atmosphereDensity;
    gaiaAtmosphereMatRef.current = atmosphereMatG;
    const gaiaAtmosphereMesh = new THREE.Mesh(atmosphereGeoG, atmosphereMatG);
    gaiaGroup.add(gaiaAtmosphereMesh);
    gaiaAtmosphereMeshRef.current = gaiaAtmosphereMesh;

    // Cloud Shell
    const cloudGeoG = new THREE.SphereGeometry(gaiaRadius * 1.035, 96, 96);
    const cloudMatG = new THREE.MeshStandardMaterial({
      map: texturesGaia.cloudTexture,
      transparent: true,
      opacity: 0.65,
      blending: THREE.NormalBlending,
      roughness: 0.85,
    });
    const gaiaCloudMesh = new THREE.Mesh(cloudGeoG, cloudMatG);
    gaiaGroup.add(gaiaCloudMesh);
    gaiaCloudMeshRef.current = gaiaCloudMesh;

    // Location Pins for GAIA
    const gaiaMarkersGroup = new THREE.Group();
    gaiaGroup.add(gaiaMarkersGroup);
    gaiaMarkersGroupRef.current = gaiaMarkersGroup;

    GAIA_LOCATIONS.forEach(loc => {
      const phi = (90 - loc.lat) * (Math.PI / 180);
      const theta = (loc.lng + 180) * (Math.PI / 180);
      const r = gaiaRadius * 1.02;
      const x = -(r * Math.sin(phi) * Math.cos(theta));
      const z = r * Math.sin(phi) * Math.sin(theta);
      const y = r * Math.cos(phi);

      const pinGeo = new THREE.SphereGeometry(3.2, 16, 16);
      const pinColor = loc.type === 'volcano' ? 0xff4d6d : loc.type === 'city' ? 0x80ed99 : 0xffb703;
      const pinMesh = new THREE.Mesh(pinGeo, new THREE.MeshBasicMaterial({ color: pinColor }));
      pinMesh.position.set(x, y, z);
      pinMesh.userData = { location: loc, planet: 'GAIA' };

      const pulseRingMesh = new THREE.Mesh(
        new THREE.RingGeometry(4.2, 5.8, 24),
        new THREE.MeshBasicMaterial({ color: pinColor, side: THREE.DoubleSide, transparent: true, opacity: 0.85 })
      );
      pulseRingMesh.position.set(x * 1.01, y * 1.01, z * 1.01);
      pulseRingMesh.lookAt(0, 0, 0);

      const pinGroup = new THREE.Group();
      pinGroup.add(pinMesh);
      pinGroup.add(pulseRingMesh);
      gaiaMarkersGroup.add(pinGroup);
    });

    // GAIA Planetary Rings
    const gaiaRingGeo = new THREE.RingGeometry(gaiaRadius * 1.35, gaiaRadius * 2.1, 96);
    const ringCanvas = document.createElement('canvas');
    ringCanvas.width = 512;
    ringCanvas.height = 1;
    const ringCtx = ringCanvas.getContext('2d');
    if (ringCtx) {
      const grad = ringCtx.createLinearGradient(0, 0, 512, 0);
      grad.addColorStop(0, 'rgba(45, 212, 191, 0.0)');
      grad.addColorStop(0.2, 'rgba(45, 212, 191, 0.7)');
      grad.addColorStop(0.4, 'rgba(56, 189, 248, 0.4)');
      grad.addColorStop(0.55, 'rgba(251, 191, 36, 0.1)'); // Cassini division
      grad.addColorStop(0.7, 'rgba(45, 212, 191, 0.85)');
      grad.addColorStop(0.9, 'rgba(167, 139, 250, 0.5)');
      grad.addColorStop(1, 'rgba(45, 212, 191, 0.0)');
      ringCtx.fillStyle = grad;
      ringCtx.fillRect(0, 0, 512, 1);
    }
    const ringTex = new THREE.CanvasTexture(ringCanvas);
    const gaiaRingMat = new THREE.MeshStandardMaterial({
      map: ringTex,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
      roughness: 0.4,
      metalness: 0.2,
    });
    const gaiaRingMesh = new THREE.Mesh(gaiaRingGeo, gaiaRingMat);
    gaiaRingMesh.rotation.x = Math.PI * 0.42;
    gaiaRingMesh.rotation.y = Math.PI * 0.12;
    gaiaRingMesh.visible = params.showGaiaRings ?? true;
    gaiaGroup.add(gaiaRingMesh);
    gaiaRingsMeshRef.current = gaiaRingMesh;

    // Outer Orbit Trajectory Ring for GAIA
    const gaiaOrbitPoints: THREE.Vector3[] = [];
    const gaiaOrbitSegments = 128;
    const rGaiaOrbit = params.orbitRadius * 1.65;
    for (let i = 0; i <= gaiaOrbitSegments; i++) {
      const theta = (i / gaiaOrbitSegments) * Math.PI * 2;
      gaiaOrbitPoints.push(new THREE.Vector3(Math.cos(theta) * rGaiaOrbit, 0, Math.sin(theta) * rGaiaOrbit));
    }
    const gaiaOrbitGeo = new THREE.BufferGeometry().setFromPoints(gaiaOrbitPoints);
    const gaiaOrbitMat = new THREE.LineBasicMaterial({ color: 0x52b788, transparent: true, opacity: 0.55 });
    const gaiaOrbitRingMesh = new THREE.Line(gaiaOrbitGeo, gaiaOrbitMat);
    scene.add(gaiaOrbitRingMesh);
    gaiaOrbitRingMeshRef.current = gaiaOrbitRingMesh;

    // 6c. Ceinture d'Astéroïdes de Kaelis (Between Aethelgard & GAIA)
    const asteroidCount = 1800;
    const asteroidPositions = new Float32Array(asteroidCount * 3);
    const asteroidColors = new Float32Array(asteroidCount * 3);
    const minBeltRadius = params.orbitRadius * 1.25;
    const maxBeltRadius = params.orbitRadius * 1.55;

    for (let i = 0; i < asteroidCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = minBeltRadius + Math.random() * (maxBeltRadius - minBeltRadius);
      const ySpread = (Math.random() - 0.5) * 28;

      asteroidPositions[i * 3] = Math.cos(angle) * radius;
      asteroidPositions[i * 3 + 1] = ySpread;
      asteroidPositions[i * 3 + 2] = Math.sin(angle) * radius;

      // Color variation: Gold, Kyberite cyan, Basalt gray
      const randType = Math.random();
      if (randType > 0.7) {
        // Kyberite cyan
        asteroidColors[i * 3] = 0.2;
        asteroidColors[i * 3 + 1] = 0.85;
        asteroidColors[i * 3 + 2] = 0.95;
      } else if (randType > 0.4) {
        // Gold ore
        asteroidColors[i * 3] = 0.95;
        asteroidColors[i * 3 + 1] = 0.75;
        asteroidColors[i * 3 + 2] = 0.2;
      } else {
        // Basalt rock
        asteroidColors[i * 3] = 0.65;
        asteroidColors[i * 3 + 1] = 0.65;
        asteroidColors[i * 3 + 2] = 0.7;
      }
    }

    const asteroidGeo = new THREE.BufferGeometry();
    asteroidGeo.setAttribute('position', new THREE.BufferAttribute(asteroidPositions, 3));
    asteroidGeo.setAttribute('color', new THREE.BufferAttribute(asteroidColors, 3));

    const asteroidMat = new THREE.PointsMaterial({
      size: 2.8,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });

    const asteroidBelt = new THREE.Points(asteroidGeo, asteroidMat);
    asteroidBelt.visible = params.showAsteroidBelt ?? true;
    scene.add(asteroidBelt);
    asteroidBeltPointsRef.current = asteroidBelt;

    // 7. Interactive Sculpting Brush Cursor
    const ringGeo = new THREE.RingGeometry(params.brushRadius * 100 * 0.9, params.brushRadius * 100, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xff3e00,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    });
    const brushRingMesh = new THREE.Mesh(ringGeo, ringMat);
    brushRingMesh.visible = false;
    scene.add(brushRingMesh);
    brushRingMeshRef.current = brushRingMesh;

    // 8. Wireframe Segment Highlight Gizmo
    const segGeo = new THREE.BoxGeometry(10, 10, 10);
    const segMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      wireframe: true,
      transparent: true,
      opacity: 0.9,
    });
    const segmentHighlight = new THREE.Mesh(segGeo, segMat);
    segmentHighlight.visible = false;
    scene.add(segmentHighlight);
    segmentHighlightRef.current = segmentHighlight;

    // Raycaster & Mouse Handlers
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerMove = (e: MouseEvent) => {
      if (!rendererRef.current || !cameraRef.current) return;

      const p = paramsRef.current;
      const rect = rendererRef.current.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, cameraRef.current);

      const activePlanetMesh =
        p.selectedTarget === 'aethelgard'
          ? aethelgardMeshRef.current
          : p.selectedTarget === 'luna_nova'
          ? lunaNovaMeshRef.current
          : p.selectedTarget === 'gaia'
          ? gaiaMeshRef.current
          : aetheliaMeshRef.current;

      if (!activePlanetMesh) return;

      // 1. Sculpt Mode
      if (p.viewportMode === 'sculpt') {
        const intersects = raycaster.intersectObject(activePlanetMesh);
        if (intersects.length > 0) {
          const hit = intersects[0];
          if (brushRingMeshRef.current) {
            brushRingMeshRef.current.visible = true;
            brushRingMeshRef.current.position.copy(hit.point).add(hit.face!.normal.clone().multiplyScalar(0.5));
            brushRingMeshRef.current.lookAt(hit.point.clone().add(hit.face!.normal));
          }

          if (isSculptingRef.current) {
            performSculpt(activePlanetMesh, hit.point);
          }
        } else {
          if (brushRingMeshRef.current) brushRingMeshRef.current.visible = false;
        }
      } else {
        if (brushRingMeshRef.current) brushRingMeshRef.current.visible = false;
      }

      // 2. Wireframe Segment Mode
      if (p.viewportMode === 'wireframe_segments' || p.renderMode === 'wireframe') {
        const intersects = raycaster.intersectObject(activePlanetMesh);
        if (intersects.length > 0) {
          const hit = intersects[0];
          const localHit = activePlanetMesh.worldToLocal(hit.point.clone()).normalize();
          const lat = Math.asin(localHit.y) * (180 / Math.PI);
          const lng = Math.atan2(localHit.z, -localHit.x) * (180 / Math.PI);

          const planetName = p.selectedTarget === 'aethelgard' ? 'Aethelgard' : p.selectedTarget === 'luna_nova' ? 'Luna Nova' : p.selectedTarget === 'gaia' ? 'GAIA' : 'Aethelia';
          const sector = getSectorFromLatLng(lat, lng, hit.point.length() - 100, planetName);
          setHoveredSector(sector);

          if (segmentHighlightRef.current) {
            segmentHighlightRef.current.visible = true;
            segmentHighlightRef.current.position.copy(hit.point);
            segmentHighlightRef.current.lookAt(activePlanetMesh.position);
          }
        } else {
          setHoveredSector(null);
          if (segmentHighlightRef.current) segmentHighlightRef.current.visible = false;
        }
      } else {
        if (segmentHighlightRef.current) segmentHighlightRef.current.visible = false;
      }
    };

    const handlePointerDown = (e: MouseEvent) => {
      if (!rendererRef.current || !cameraRef.current) return;

      const p = paramsRef.current;
      const rect = rendererRef.current.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, cameraRef.current);

      // Check Sculpting
      const activePlanetMesh =
        p.selectedTarget === 'aethelgard'
          ? aethelgardMeshRef.current
          : p.selectedTarget === 'luna_nova'
          ? lunaNovaMeshRef.current
          : p.selectedTarget === 'gaia'
          ? gaiaMeshRef.current
          : aetheliaMeshRef.current;

      if (p.viewportMode === 'sculpt' && activePlanetMesh) {
        const intersects = raycaster.intersectObject(activePlanetMesh);
        if (intersects.length > 0) {
          isSculptingRef.current = true;
          if (controlsRef.current) controlsRef.current.enabled = false;
          performSculpt(activePlanetMesh, intersects[0].point);
          return;
        }
      }

      // Check Sector Click
      if (p.viewportMode === 'wireframe_segments' && activePlanetMesh) {
        const intersects = raycaster.intersectObject(activePlanetMesh);
        if (intersects.length > 0) {
          const localHit = activePlanetMesh.worldToLocal(intersects[0].point.clone()).normalize();
          const lat = Math.asin(localHit.y) * (180 / Math.PI);
          const lng = Math.atan2(localHit.z, -localHit.x) * (180 / Math.PI);
          const planetName =
            p.selectedTarget === 'aethelgard'
              ? 'Aethelgard'
              : p.selectedTarget === 'luna_nova'
              ? 'Luna Nova'
              : 'Aethelia';
          const sector = getSectorFromLatLng(lat, lng, intersects[0].point.length() - 100, planetName);
          if (onSelectSector) onSelectSector(sector);
          return;
        }
      }

      // Check Marker Pins
      const activeMarkers =
        p.selectedTarget === 'aethelgard'
          ? aethelgardMarkersGroupRef.current
          : p.selectedTarget === 'luna_nova'
          ? lunaNovaMarkersGroupRef.current
          : aetheliaMarkersGroupRef.current;

      if (activeMarkers) {
        const pinMeshes: THREE.Object3D[] = [];
        activeMarkers.traverse(child => {
          if (child instanceof THREE.Mesh && child.userData.location) {
            pinMeshes.push(child);
          }
        });

        const intersects = raycaster.intersectObjects(pinMeshes);
        if (intersects.length > 0) {
          const clickedLoc = intersects[0].object.userData.location as LocationPOI;
          onSelectLocation(clickedLoc);
        }
      }
    };

    const handlePointerUp = () => {
      isSculptingRef.current = false;
      if (controlsRef.current) controlsRef.current.enabled = true;
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('mousemove', handlePointerMove);
    domEl.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('mouseup', handlePointerUp);

    // Resize Handler
    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Render & Orbit Motion Loop
    let animationFrameId: number;

    const solveKepler = (M: number, e: number): number => {
      let E = M;
      for (let i = 0; i < 6; i++) {
        E = E - (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
      }
      return E;
    };

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const p = paramsRef.current;
      const timeWarp = p.timeWarp ?? 1;

      // Advance Orbit Angles with Time Warp multiplier
      if (p.autoRotate) {
        orbitAngleRef.current += 0.001 * p.orbitSpeed * timeWarp;
        moonAngleRef.current += 0.003 * p.moonOrbitSpeed * timeWarp;
        gaiaAngleRef.current += 0.0007 * p.orbitSpeed * timeWarp;
      }

      // Rotate Asteroid Belt
      if (asteroidBeltPointsRef.current) {
        asteroidBeltPointsRef.current.visible = p.showAsteroidBelt ?? true;
        if (p.autoRotate) asteroidBeltPointsRef.current.rotation.y += 0.0004 * p.orbitSpeed * timeWarp;
      }

      if (gaiaRingsMeshRef.current) {
        gaiaRingsMeshRef.current.visible = p.showGaiaRings ?? true;
      }

      const M1 = orbitAngleRef.current;
      const R = p.orbitRadius;

      // 1. Aethelia Prime Keplerian Orbit (Semi-major axis a1 = R, eccentricity e1 = 0.05)
      const e1 = 0.05;
      const E1 = solveKepler(M1, e1);
      const trueAnomaly1 = 2 * Math.atan2(Math.sqrt(1 + e1) * Math.sin(E1 / 2), Math.sqrt(1 - e1) * Math.cos(E1 / 2));
      const dist1 = R * (1 - e1 * Math.cos(E1));
      const x1 = Math.cos(trueAnomaly1) * dist1;
      const z1 = Math.sin(trueAnomaly1) * dist1;
      const vel1 = parseFloat((29.78 * Math.sqrt(Math.max(10, R) / Math.max(10, dist1))).toFixed(2));

      if (aetheliaGroupRef.current) {
        aetheliaGroupRef.current.position.set(x1, 0, z1);
        if (p.autoRotate) aetheliaGroupRef.current.rotation.y += 0.0015 * p.rotationSpeed;
      }

      // 2. Aethelgard Keplerian Orbit (Semi-major axis a2 = R * 1.05, eccentricity e2 = 0.08, M2 = M1 + PI)
      const e2 = 0.08;
      const M2 = M1 + Math.PI;
      const E2 = solveKepler(M2, e2);
      const trueAnomaly2 = 2 * Math.atan2(Math.sqrt(1 + e2) * Math.sin(E2 / 2), Math.sqrt(1 - e2) * Math.cos(E2 / 2));
      const dist2 = R * 1.05 * (1 - e2 * Math.cos(E2));
      const x2 = Math.cos(trueAnomaly2) * dist2;
      const z2 = Math.sin(trueAnomaly2) * dist2;
      const vel2 = parseFloat((28.95 * Math.sqrt((Math.max(10, R) * 1.05) / Math.max(10, dist2))).toFixed(2));

      if (aethelgardGroupRef.current) {
        aethelgardGroupRef.current.position.set(x2, 0, z2);
        if (p.autoRotate) aethelgardGroupRef.current.rotation.y += 0.0015 * p.rotationSpeed;
      }

      // 3. Luna Nova Keplerian Orbit around Aethelia Prime
      const em = 0.04;
      const Mm = moonAngleRef.current;
      const Em = solveKepler(Mm, em);
      const trueAnomalyM = 2 * Math.atan2(Math.sqrt(1 + em) * Math.sin(Em / 2), Math.sqrt(1 - em) * Math.cos(Em / 2));
      const distM = Math.max(10, p.moonOrbitRadius * 3.2) * (1 - em * Math.cos(Em));
      const dxM = Math.cos(trueAnomalyM) * distM;
      const dzM = Math.sin(trueAnomalyM) * distM;
      const dyM = Math.sin(trueAnomalyM) * 12;
      const xM = x1 + dxM;
      const yM = dyM;
      const zM = z1 + dzM;
      const distM_Sun = parseFloat(Math.sqrt(xM * xM + yM * yM + zM * zM).toFixed(1));
      const velM = parseFloat((1.02 * Math.sqrt((Math.max(10, p.moonOrbitRadius * 3.2)) / Math.max(1, distM))).toFixed(2));

      if (lunaNovaGroupRef.current) {
        lunaNovaGroupRef.current.position.set(xM, yM, zM);
        lunaNovaGroupRef.current.visible = p.showMoon;
        if (p.autoRotate) lunaNovaGroupRef.current.rotation.y += 0.0025 * p.rotationSpeed;
      }

      if (moonOrbitRingMeshRef.current && aetheliaGroupRef.current) {
        moonOrbitRingMeshRef.current.position.copy(aetheliaGroupRef.current.position);
        moonOrbitRingMeshRef.current.visible = p.showMoon && p.showMoonOrbit;
      }

      // 4. GAIA Keplerian Outer Orbit (Semi-major axis a3 = R * 1.65, eccentricity e3 = 0.04)
      const e3 = 0.04;
      const M3 = gaiaAngleRef.current;
      const E3 = solveKepler(M3, e3);
      const trueAnomaly3 = 2 * Math.atan2(Math.sqrt(1 + e3) * Math.sin(E3 / 2), Math.sqrt(1 - e3) * Math.cos(E3 / 2));
      const dist3 = R * 1.65 * (1 - e3 * Math.cos(E3));
      const x3 = Math.cos(trueAnomaly3) * dist3;
      const z3 = Math.sin(trueAnomaly3) * dist3;
      const vel3 = parseFloat((23.15 * Math.sqrt((Math.max(10, R) * 1.65) / Math.max(10, dist3))).toFixed(2));

      if (gaiaGroupRef.current) {
        gaiaGroupRef.current.position.set(x3, 0, z3);
        if (p.autoRotate) gaiaGroupRef.current.rotation.y += 0.0012 * p.rotationSpeed;
      }

      // Dynamic Sun Vectors (pointing from body toward central Sun at 0,0,0)
      const sunDir1 = new THREE.Vector3(-x1, 0, -z1).normalize();
      if (aetheliaMatRef.current) {
        aetheliaMatRef.current.uniforms.uSunDirection.value.copy(sunDir1);
        aetheliaMatRef.current.uniforms.uCityLightsIntensity.value = p.cityLightsIntensity;
        aetheliaMatRef.current.uniforms.uVolcanoGlow.value = p.volcanoGlowIntensity;
      }
      if (aetheliaAtmosphereMatRef.current) {
        aetheliaAtmosphereMatRef.current.uniforms.uSunDirection.value.copy(sunDir1);
        aetheliaAtmosphereMatRef.current.uniforms.uDensity.value = p.atmosphereDensity;
      }

      const sunDir2 = new THREE.Vector3(-x2, 0, -z2).normalize();
      if (aethelgardMatRef.current) {
        aethelgardMatRef.current.uniforms.uSunDirection.value.copy(sunDir2);
        aethelgardMatRef.current.uniforms.uCityLightsIntensity.value = p.cityLightsIntensity;
        aethelgardMatRef.current.uniforms.uVolcanoGlow.value = p.volcanoGlowIntensity;
      }
      if (aethelgardAtmosphereMatRef.current) {
        aethelgardAtmosphereMatRef.current.uniforms.uSunDirection.value.copy(sunDir2);
        aethelgardAtmosphereMatRef.current.uniforms.uDensity.value = p.atmosphereDensity;
      }

      const sunDirM = new THREE.Vector3(-xM, -yM, -zM).normalize();
      if (lunaNovaMatRef.current) {
        lunaNovaMatRef.current.uniforms.uSunDirection.value.copy(sunDirM);
        lunaNovaMatRef.current.uniforms.uCityLightsIntensity.value = p.cityLightsIntensity;
        lunaNovaMatRef.current.uniforms.uVolcanoGlow.value = p.volcanoGlowIntensity;
      }
      if (lunaNovaAtmosphereMatRef.current) {
        lunaNovaAtmosphereMatRef.current.uniforms.uSunDirection.value.copy(sunDirM);
        lunaNovaAtmosphereMatRef.current.uniforms.uDensity.value = p.atmosphereDensity;
      }

      const sunDir3 = new THREE.Vector3(-x3, 0, -z3).normalize();
      if (gaiaMatRef.current) {
        gaiaMatRef.current.uniforms.uSunDirection.value.copy(sunDir3);
        gaiaMatRef.current.uniforms.uCityLightsIntensity.value = p.cityLightsIntensity;
        gaiaMatRef.current.uniforms.uVolcanoGlow.value = p.volcanoGlowIntensity;
      }
      if (gaiaAtmosphereMatRef.current) {
        gaiaAtmosphereMatRef.current.uniforms.uSunDirection.value.copy(sunDir3);
        gaiaAtmosphereMatRef.current.uniforms.uDensity.value = p.atmosphereDensity;
      }

      // Camera Smooth Tracking & Cinematic Tour based on selectedTarget
      if (controlsRef.current && cameraRef.current) {
        if (p.cinematicTour) {
          tourProgressRef.current += 0.003;
          const cycle = (tourProgressRef.current) % 5;
          let camGoal = new THREE.Vector3(0, 500, 1000);
          let targetGoal = new THREE.Vector3(0, 0, 0);

          if (cycle < 1 && aetheliaGroupRef.current) {
            // Aethelia flyby
            const pA = aetheliaGroupRef.current.position;
            camGoal.set(pA.x + 80, pA.y + 35, pA.z + 90);
            targetGoal.copy(pA);
          } else if (cycle < 2 && lunaNovaGroupRef.current) {
            // Luna Nova flyby
            const pL = lunaNovaGroupRef.current.position;
            camGoal.set(pL.x + 40, pL.y + 15, pL.z + 40);
            targetGoal.copy(pL);
          } else if (cycle < 3 && aethelgardGroupRef.current) {
            // Aethelgard flyby
            const pAg = aethelgardGroupRef.current.position;
            camGoal.set(pAg.x + 70, pAg.y + 25, pAg.z + 80);
            targetGoal.copy(pAg);
          } else if (cycle < 4 && gaiaGroupRef.current) {
            // GAIA ring flyby
            const pG = gaiaGroupRef.current.position;
            camGoal.set(pG.x + 140, pG.y + 60, pG.z + 160);
            targetGoal.copy(pG);
          } else {
            // Grand system perspective
            camGoal.set(0, 450, 950);
            targetGoal.set(0, 0, 0);
          }

          cameraRef.current.position.lerp(camGoal, 0.03);
          controlsRef.current.target.lerp(targetGoal, 0.04);
          controlsRef.current.update();
        } else {
          let targetPos = new THREE.Vector3(0, 0, 0);

          if (p.selectedTarget === 'aethelia' && aetheliaGroupRef.current) {
            targetPos = aetheliaGroupRef.current.position.clone();
          } else if (p.selectedTarget === 'aethelgard' && aethelgardGroupRef.current) {
            targetPos = aethelgardGroupRef.current.position.clone();
          } else if (p.selectedTarget === 'luna_nova' && lunaNovaGroupRef.current) {
            targetPos = lunaNovaGroupRef.current.position.clone();
          } else if (p.selectedTarget === 'gaia' && gaiaGroupRef.current) {
            targetPos = gaiaGroupRef.current.position.clone();
          } else if (p.selectedTarget === 'sun' || p.selectedTarget === 'system_overview') {
            targetPos.set(0, 0, 0);
          }

          controlsRef.current.target.lerp(targetPos, 0.06);
          controlsRef.current.update();
        }
      }

      // Render Scene
      if (rendererRef.current && cameraRef.current) {
        rendererRef.current.render(scene, cameraRef.current);
      }

      // Telemetry stats
      framesRef.current++;
      const now = performance.now();
      if (now >= lastTimeRef.current + 1000) {
        const fps = Math.round((framesRef.current * 1000) / (now - lastTimeRef.current));
        const frameTimeMs = parseFloat((1000 / Math.max(fps, 1)).toFixed(2));
        framesRef.current = 0;
        lastTimeRef.current = now;

        const activeDist =
          p.selectedTarget === 'aethelgard'
            ? parseFloat(dist2.toFixed(1))
            : p.selectedTarget === 'luna_nova'
            ? distM_Sun
            : p.selectedTarget === 'gaia'
            ? parseFloat(dist3.toFixed(1))
            : p.selectedTarget === 'sun'
            ? 0
            : parseFloat(dist1.toFixed(1));

        const activeVel =
          p.selectedTarget === 'aethelgard'
            ? vel2
            : p.selectedTarget === 'luna_nova'
            ? velM
            : p.selectedTarget === 'gaia'
            ? vel3
            : p.selectedTarget === 'sun'
            ? 0
            : vel1;

        const info = renderer.info;
        onUpdateStats({
          fps,
          frameTimeMs,
          drawCalls: info.render.calls,
          triangles: info.render.triangles,
          vertices: info.render.points,
          vramUsedMb: parseFloat((198 + Math.random() * 12).toFixed(1)),
          vramTotalMb: 8192,
          shaderModules: 32,
          activeSolarDistance: activeDist,
          activeOrbitalVelocity: activeVel,
          orbitalVelocities: {
            aethelia: vel1,
            aethelgard: vel2,
            lunaNova: velM,
            luna_nova: velM,
            gaia: vel3,
          },
          solarDistances: {
            aethelia: parseFloat(dist1.toFixed(1)),
            aethelgard: parseFloat(dist2.toFixed(1)),
            lunaNova: distM_Sun,
            luna_nova: distM_Sun,
            gaia: parseFloat(dist3.toFixed(1)),
            sun: 0,
          },
          activeExtensions: [
            'VK_KHR_keplerian_orbital_math',
            'VK_KHR_solar_system_orbit',
            'VK_KHR_binary_planets',
            'VK_KHR_ray_tracing_pipeline',
            'VK_EXT_mesh_shader',
            'VK_KHR_atmosphere_scattering',
          ],
          apiDriver: 'Vulkan v1.3.280 (Keplerian Orbital Engine)',
        });
      }
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      domEl.removeEventListener('mousemove', handlePointerMove);
      domEl.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('mouseup', handlePointerUp);
      if (container.contains(domEl)) {
        container.removeChild(domEl);
      }
      renderer.dispose();
    };
  }, []);

  // Update Orbit Radius & Rings
  useEffect(() => {
    if (!orbitRingMeshRef.current) return;
    const R = params.orbitRadius;
    const points: THREE.Vector3[] = [];
    const segments = 128;
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      points.push(new THREE.Vector3(Math.cos(theta) * R, 0, Math.sin(theta) * R));
    }
    orbitRingMeshRef.current.geometry.dispose();
    orbitRingMeshRef.current.geometry = new THREE.BufferGeometry().setFromPoints(points);
    orbitRingMeshRef.current.visible = params.showOrbitRings;

    if (gaiaOrbitRingMeshRef.current) {
      const gaiaPoints: THREE.Vector3[] = [];
      const rGaiaOrbit = R * 1.65;
      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        gaiaPoints.push(new THREE.Vector3(Math.cos(theta) * rGaiaOrbit, 0, Math.sin(theta) * rGaiaOrbit));
      }
      gaiaOrbitRingMeshRef.current.geometry.dispose();
      gaiaOrbitRingMeshRef.current.geometry = new THREE.BufferGeometry().setFromPoints(gaiaPoints);
      gaiaOrbitRingMeshRef.current.visible = params.showOrbitRings;
    }
  }, [params.orbitRadius, params.showOrbitRings]);

  // Update Moon Orbit Radius Ring
  useEffect(() => {
    if (!moonOrbitRingMeshRef.current) return;
    const rMoonOrbit = (params.moonOrbitRadius ?? 55) * 3.2;
    const points: THREE.Vector3[] = [];
    const segments = 64;
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      points.push(new THREE.Vector3(Math.cos(theta) * rMoonOrbit, Math.sin(theta) * 12, Math.sin(theta) * rMoonOrbit));
    }
    moonOrbitRingMeshRef.current.geometry.dispose();
    moonOrbitRingMeshRef.current.geometry = new THREE.BufferGeometry().setFromPoints(points);
    moonOrbitRingMeshRef.current.visible = params.showMoon && params.showMoonOrbit;
  }, [params.moonOrbitRadius, params.showMoon, params.showMoonOrbit]);

  // Update Sun Parameters
  useEffect(() => {
    if (!centralSunGroupRef.current || !centralSunLightRef.current) return;
    const sunMesh = centralSunGroupRef.current.children[0] as THREE.Mesh;
    if (sunMesh) {
      sunMesh.scale.setScalar(params.sunSize / 35);
      (sunMesh.material as THREE.MeshBasicMaterial).color.setStyle(params.sunColor);
    }
    centralSunLightRef.current.intensity = params.sunIntensity * 3.5;
    centralSunLightRef.current.color.setStyle(params.sunColor);
  }, [params.sunSize, params.sunIntensity, params.sunColor]);

  // Camera Target Transition on selectedTarget or selectedLocation
  useEffect(() => {
    if (!cameraRef.current || !controlsRef.current) return;

    if (params.selectedTarget === 'system_overview') {
      const R = params.orbitRadius;
      cameraRef.current.position.set(0, R * 1.4, R * 2.2);
      controlsRef.current.target.set(0, 0, 0);
    } else if (params.selectedTarget === 'sun') {
      cameraRef.current.position.set(0, 40, params.sunSize * 4.5);
      controlsRef.current.target.set(0, 0, 0);
    } else if (params.selectedTarget === 'aethelia' && aetheliaGroupRef.current) {
      const pos = aetheliaGroupRef.current.position;
      cameraRef.current.position.set(pos.x, pos.y + 120, pos.z + 280);
      controlsRef.current.target.copy(pos);
    } else if (params.selectedTarget === 'aethelgard' && aethelgardGroupRef.current) {
      const pos = aethelgardGroupRef.current.position;
      cameraRef.current.position.set(pos.x, pos.y + 96, pos.z + 224);
      controlsRef.current.target.copy(pos);
    } else if (params.selectedTarget === 'luna_nova' && lunaNovaGroupRef.current) {
      const pos = lunaNovaGroupRef.current.position;
      cameraRef.current.position.set(pos.x, pos.y + 35, pos.z + 85);
      controlsRef.current.target.copy(pos);
    } else if (params.selectedTarget === 'gaia' && gaiaGroupRef.current) {
      const pos = gaiaGroupRef.current.position;
      cameraRef.current.position.set(pos.x, pos.y + 210, pos.z + 490);
      controlsRef.current.target.copy(pos);
    }
    controlsRef.current.update();
  }, [params.selectedTarget]);

  return (
    <div className="relative w-full h-full bg-slate-950 overflow-hidden font-mono">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Target Telemetry Card */}
      {(hoveredSector || selectedSector) && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 pointer-events-none bg-black/85 backdrop-blur-md border border-[#ff3e00] px-4 py-2.5 shadow-2xl flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#ff3e00] animate-ping" />
            <span className="font-bold text-white uppercase">
              SECTEUR: {(selectedSector || hoveredSector)?.code}
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-3 text-[11px] text-white/70">
            <span>LAT: <strong className="text-amber-400">{(selectedSector || hoveredSector)?.lat}°</strong></span>
            <span>LNG: <strong className="text-amber-400">{(selectedSector || hoveredSector)?.lng}°</strong></span>
            <span>ELEV: <strong className="text-emerald-400">{(selectedSector || hoveredSector)?.elevation}m</strong></span>
            <span>BIOME: <strong className="text-cyan-400">{(selectedSector || hoveredSector)?.biome}</strong></span>
          </div>
        </div>
      )}

      {/* Active Mode HUD Banner */}
      {params.viewportMode === 'sculpt' && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 pointer-events-none bg-black/85 backdrop-blur-md border border-emerald-500/80 px-4 py-2 shadow-2xl flex items-center gap-3 text-xs text-emerald-400 uppercase font-bold tracking-widest">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          SCULPT_MODE_ACTIVE // TARGET: {params.selectedTarget.toUpperCase()} // TOOL: {params.sculptTool}
        </div>
      )}
    </div>
  );
};
