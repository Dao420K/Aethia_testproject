export interface EnvironmentalParams {
  // Time & Rotation
  sunLongitude: number; // 0 - 360 degrees
  sunLatitude: number; // -90 to +90 degrees
  autoRotate: boolean;
  rotationSpeed: number; // 0 to 2

  // Atmosphere
  atmosphereDensity: number; // 0.2 to 2.5
  rayleighScale: number; // 0.5 to 3.0
  mieScattering: number; // 0.1 to 2.0
  atmosphereColor: string; // Hex color string
  sunsetGlow: number; // 0 to 2

  // Volumetric Clouds
  cloudCoverage: number; // 0 to 1
  cloudAltitude: number; // 1.01 to 1.15 sphere radius
  cloudDensity: number; // 0.1 to 2.0
  cloudSpeed: number; // 0 to 2
  cloudShadowStrength: number; // 0 to 1

  // Ocean & Surface Reflections
  oceanRoughness: number; // 0 to 1
  specularPower: number; // 1 to 100
  oceanColor: string;
  waveBumpScale: number; // 0 to 1

  // Surface & Night
  cityLightsIntensity: number; // 0 to 3
  volcanoGlowIntensity: number; // 0 to 3
  displacementScale: number; // 0 to 0.15

  // HDR & Post Processing
  exposure: number; // 0.2 to 3.0
  toneMapping: 'ACESFilmic' | 'Reinhard' | 'Cineon' | 'Linear' | 'AgX';
  bloomIntensity: number; // 0 to 2
  bloomThreshold: number; // 0.2 to 1.0
  contrast: number; // 0.5 to 1.5

  // Solar System & Orbital Parameters
  orbitSpeed: number; // 0 to 3
  orbitRadius: number; // 300 to 800
  moonOrbitRadius: number; // 35 to 100
  moonOrbitSpeed: number; // 0.1 to 4.0
  showMoonOrbit: boolean;
  showMoon?: boolean;
  selectedTarget: 'aethelia' | 'aethelgard' | 'luna_nova' | 'sun' | 'system_overview' | 'gaia';
  showOrbitRings: boolean;
  sunSize: number; // 20 to 80
  sunIntensity: number; // 0.5 to 5.0
  sunColor: string;

  // New Astrophysical Simulation & FX
  timeWarp: number; // 0.1 to 50
  showAsteroidBelt: boolean;
  showGaiaRings: boolean;
  cinematicTour: boolean;
  soundEnabled: boolean;
  soundVolume: number;

  // Render & Debug mode
  renderMode: 'full' | 'wireframe' | 'normals' | 'roughness' | 'clouds_only' | 'rayleigh_pass' | 'night_lights';

  // Interactive Viewport Mode
  viewportMode: 'explore' | 'sculpt' | 'wireframe_segments' | 'studio_lighting';

  // Terrain Sculpting Tools
  sculptTool: 'raise' | 'lower' | 'smooth' | 'flatten';
  brushRadius: number; // 0.05 to 0.5 sphere units
  brushStrength: number; // 0.01 to 0.1 height delta
  waterSphereRadius: number; // 1.000 to 1.050

  // Studio 3D Lighting Rig & Shaders
  keyLightIntensity: number; // 0.5 to 4.0
  fillLightIntensity: number; // 0.0 to 2.0
  fillLightColor: string;
  rimLightIntensity: number; // 0.0 to 3.0
  rimLightColor: string;
  materialRoughness: number; // 0.0 to 1.0
  materialMetalness: number; // 0.0 to 1.0
  bumpStrength: number; // 0.0 to 2.0
}

export interface GridSegmentSector {
  id: string;
  code: string; // e.g. "SEC-B04"
  lat: number;
  lng: number;
  elevation: number; // meters or relative value
  biome: string;
  seismicIndex: number;
  temperature: string;
  vulkanMemoryAddress: string;
}

export interface LocationPOI {
  id: string;
  name: string;
  region: string;
  lat: number; // Latitude -90 to 90
  lng: number; // Longitude -180 to 180
  type: 'city' | 'mountain' | 'forest' | 'volcano' | 'floating' | 'ice' | 'ruins';
  description: string;
  faction?: string;
  temperature?: string;
  climate?: string;
  vulkanShaderStats?: {
    drawCalls: number;
    vertexCount: number;
    triangleCount: number;
  };
}

export interface CriticalAlert {
  id: string;
  timestamp: string;
  title: string;
  locationName: string;
  lat: number;
  lng: number;
  severity: 'critical' | 'high' | 'warning' | 'info';
  message: string;
  iconType: 'volcano' | 'storm' | 'ice' | 'magic' | 'seismic';
  isRead?: boolean;
}

export interface VulkanPipelineStats {
  fps: number;
  frameTimeMs: number;
  drawCalls: number;
  triangles: number;
  vertices: number;
  vramUsedMb: number;
  vramTotalMb: number;
  shaderModules: number;
  activeExtensions: string[];
  apiDriver: string;
  orbitalVelocities?: {
    aethelia: number; // km/s
    aethelgard: number; // km/s
    lunaNova: number; // km/s
    gaia?: number; // km/s
  };
  solarDistances?: {
    aethelia: number; // M km or UA
    aethelgard: number;
    lunaNova: number;
    sun: number;
    gaia?: number;
  };
  activeSolarDistance?: number;
  activeOrbitalVelocity?: number;
}

export type UIThemeAccent = 'teal' | 'amber' | 'crimson' | 'emerald' | 'violet';
