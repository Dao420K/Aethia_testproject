import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Layers, BookOpen, Sparkles, Orbit } from 'lucide-react';
import { VulkanViewport } from './components/VulkanViewport';
import { VulkanTelemetryOverlay } from './components/VulkanTelemetryOverlay';
import { ControlPanel } from './components/ControlPanel';
import { NotificationSystem } from './components/NotificationSystem';
import { LocationDetailsCard } from './components/LocationDetailsCard';
import { PlanetaryCompareModal } from './components/PlanetaryCompareModal';
import { AncientMapViewer } from './components/AncientMapViewer';
import { AETHELIA_LOCATIONS, AETHELGARD_LOCATIONS, LUNA_NOVA_LOCATIONS, GAIA_LOCATIONS } from './data/locations';
import { INITIAL_ALERTS } from './data/alerts';
import { CriticalAlert, EnvironmentalParams, LocationPOI, UIThemeAccent, VulkanPipelineStats } from './types';
import { cosmicAudio } from './utils/audioEngine';

export default function App() {
  // Environmental Shaders & Atmosphere State
  const [params, setParams] = useState<EnvironmentalParams>({
    sunLongitude: 110,
    sunLatitude: 15,
    autoRotate: true,
    rotationSpeed: 0.8,
    atmosphereDensity: 1.2,
    rayleighScale: 1.5,
    mieScattering: 0.8,
    atmosphereColor: '#3a86ff',
    sunsetGlow: 1.2,
    cloudCoverage: 0.55,
    cloudAltitude: 1.02,
    cloudDensity: 1.0,
    cloudSpeed: 1.0,
    cloudShadowStrength: 0.6,
    oceanRoughness: 0.2,
    specularPower: 32,
    oceanColor: '#0a3a4e',
    waveBumpScale: 0.05,
    cityLightsIntensity: 1.8,
    volcanoGlowIntensity: 2.5,
    displacementScale: 0.05,
    exposure: 1.15,
    toneMapping: 'ACESFilmic',
    bloomIntensity: 1.2,
    bloomThreshold: 0.6,
    contrast: 1.0,
    renderMode: 'full',

    // Solar System & Orbital Parameters
    orbitSpeed: 0.8,
    orbitRadius: 420,
    moonOrbitRadius: 55,
    moonOrbitSpeed: 1.2,
    showMoonOrbit: true,
    showMoon: true,
    selectedTarget: 'system_overview',
    showOrbitRings: true,
    sunSize: 42,
    sunIntensity: 3.5,
    sunColor: '#ffaa00',

    // New Astrophysical & Visual Simulation Additions
    showAsteroidBelt: true,
    showGaiaRings: true,
    timeWarp: 1,
    cinematicTour: false,
    soundEnabled: false,

    // Interactive Viewport & Sculpting
    viewportMode: 'explore',
    sculptTool: 'raise',
    brushRadius: 0.15,
    brushStrength: 0.03,
    waterSphereRadius: 1.018,

    // Studio Lighting Rig
    keyLightIntensity: 2.2,
    fillLightIntensity: 0.8,
    fillLightColor: '#1d3557',
    rimLightIntensity: 1.5,
    rimLightColor: '#48cae4',
    materialRoughness: 0.45,
    materialMetalness: 0.15,
    bumpStrength: 1.2,
  });

  // Locations & Alerts State
  const [locations] = useState<LocationPOI[]>([...AETHELIA_LOCATIONS, ...AETHELGARD_LOCATIONS, ...LUNA_NOVA_LOCATIONS, ...GAIA_LOCATIONS]);
  const [selectedLocation, setSelectedLocation] = useState<LocationPOI | null>(null);
  const [alerts, setAlerts] = useState<CriticalAlert[]>(INITIAL_ALERTS);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [activeAlertLocationId, setActiveAlertLocationId] = useState<string | undefined>(undefined);

  // New Modals State
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [isMapViewerOpen, setIsMapViewerOpen] = useState(false);
  const [isAudioActive, setIsAudioActive] = useState(false);

  // UI Theme Accent State
  const [accent, setAccent] = useState<UIThemeAccent>('teal');

  // Vulkan Real-time Telemetry Stats
  const [vulkanStats, setVulkanStats] = useState<VulkanPipelineStats>({
    fps: 60,
    frameTimeMs: 16.6,
    drawCalls: 180,
    triangles: 245000,
    vertices: 182000,
    vramUsedMb: 148,
    vramTotalMb: 8192,
    shaderModules: 14,
    activeExtensions: [
      'VK_KHR_ray_tracing_pipeline',
      'VK_KHR_volumetric_fog',
      'VK_KHR_hdr_metadata',
      'VK_EXT_mesh_shader',
      'VK_KHR_atmosphere_scattering'
    ],
    apiDriver: 'Vulkan v1.3.280 (NVIDIA WebGPU/WebGL2 Core)'
  });

  // Sync sound target with selected planetary focus
  useEffect(() => {
    cosmicAudio.setPlanet(params.selectedTarget);
  }, [params.selectedTarget]);

  const toggleSound = () => {
    const active = cosmicAudio.toggle();
    setIsAudioActive(active);
    setParams(prev => ({ ...prev, soundEnabled: active }));
  };

  const unreadAlertCount = alerts.filter(a => !a.isRead).length;

  const handleSelectAlertLocation = (lat: number, lng: number, alertId: string) => {
    const target = locations.find(l => Math.abs(l.lat - lat) < 15 && Math.abs(l.lng - lng) < 15) || null;
    setSelectedLocation(target);
    setActiveAlertLocationId(alertId);
    setNotificationsOpen(false);
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, isRead: true } : a));
  };

  const handleMarkAllRead = () => {
    setAlerts(prev => prev.map(a => ({ ...a, isRead: true })));
  };

  const handleSimulateNewAlert = () => {
    const newAlert: CriticalAlert = {
      id: `alert-${Date.now()}`,
      timestamp: 'À l’instant',
      title: 'TEMPÊTE SOLAIRE DÉTECTÉE',
      locationName: 'Pôle Nord Glacé (Hyperborea)',
      lat: 82,
      lng: -10,
      severity: 'critical',
      message: 'Intense tempête géomagnétique provoquant des aurores boréales massives et des perturbations dans la haute atmosphère.',
      iconType: 'magic',
      isRead: false
    };

    setAlerts(prev => [newAlert, ...prev]);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#050608] text-[#e0e0e0] font-mono overflow-hidden select-none" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #0d1117 0%, #050608 100%)' }}>
      {/* Geometric Balance Top Header Bar */}
      <header className="h-11 border-b border-white/10 flex items-center justify-between px-4 bg-black/70 backdrop-blur-md z-30 shrink-0 text-xs">
        <div className="flex items-center space-x-3">
          <div className="w-2.5 h-2.5 bg-[#ff3e00] rounded-full animate-pulse shadow-[0_0_10px_#ff3e00]"></div>
          <span className="font-bold tracking-widest uppercase text-white/90 text-xs">
            Vulkan_Render_Engine // Core_v4.2
          </span>
          <span className="hidden lg:inline-block px-1.5 py-0.5 text-[9px] bg-teal-500/20 text-teal-300 border border-teal-500/30">
            SYSTÈME_GAIA_ACTIF
          </span>
        </div>

        {/* Action Center Buttons in Header */}
        <div className="flex items-center space-x-2">
          {/* Audio Synthesizer Toggle */}
          <button
            onClick={toggleSound}
            className={`px-2.5 py-1 text-[10px] font-bold uppercase flex items-center gap-1.5 border transition-all ${
              isAudioActive
                ? 'bg-amber-400 text-black border-amber-300 shadow-[0_0_12px_#fbbf24]'
                : 'bg-white/5 border-white/15 text-white/60 hover:bg-white/10 hover:text-white'
            }`}
            title="Activer/Désactiver l'ambiance sonore cosmique procédurale"
          >
            {isAudioActive ? <Volume2 className="w-3.5 h-3.5 text-black animate-pulse" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>{isAudioActive ? 'AUDIO_ON' : 'AUDIO_OFF'}</span>
          </button>

          {/* Scale Comparator */}
          <button
            onClick={() => setIsCompareModalOpen(true)}
            className="px-2.5 py-1 text-[10px] font-bold uppercase flex items-center gap-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 transition-colors"
          >
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">ÉCHELLES_PLANÉTAIRES</span>
          </button>

          {/* Ancient Map Viewer */}
          <button
            onClick={() => setIsMapViewerOpen(true)}
            className="px-2.5 py-1 text-[10px] font-bold uppercase flex items-center gap-1.5 bg-[#d4af37]/10 hover:bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#f3e5ab] transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#d4af37]" />
            <span className="hidden sm:inline">ATLAS_ANTIQUE</span>
          </button>
        </div>

        <div className="hidden md:flex items-center space-x-5 text-[11px] text-white/60 uppercase tracking-tight">
          <span>FPS: <strong className="text-emerald-400 font-bold">{vulkanStats.fps}</strong></span>
          <span>VRAM: <strong className="text-cyan-400 font-bold">{vulkanStats.vramUsedMb}MB / {vulkanStats.vramTotalMb}MB</strong></span>
          <span>HDR: <strong className="text-amber-400 font-bold">{params.toneMapping}</strong></span>
        </div>
      </header>

      {/* Main Viewport Workspace with Center Geometric Crosshair Overlay */}
      <main className="flex-1 relative overflow-hidden">
        {/* Subtle Geometric Balance Grid Crosshairs */}
        <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center opacity-25">
          <div className="absolute w-full h-px bg-white/10"></div>
          <div className="absolute h-full w-px bg-white/10"></div>
          <div className="w-[500px] h-[500px] rounded-full border border-white/10"></div>
          <div className="w-[650px] h-[650px] rounded-full border border-dashed border-white/5"></div>
        </div>

        {/* 3D Vulkan Viewport */}
        <VulkanViewport
          params={params}
          locations={locations}
          selectedLocation={selectedLocation}
          onSelectLocation={setSelectedLocation}
          onUpdateStats={setVulkanStats}
          activeAlertLocationId={activeAlertLocationId}
          onChangeParams={setParams}
        />

        {/* Top Left Vulkan Telemetry HUD */}
        <VulkanTelemetryOverlay
          stats={vulkanStats}
          renderMode={params.renderMode}
          onChangeRenderMode={mode => setParams({ ...params, renderMode: mode })}
          unreadAlertCount={unreadAlertCount}
          onOpenNotifications={() => setNotificationsOpen(true)}
          accentColorClass={accent}
        />

        {/* Right Dark Mode Environmental Control Panel */}
        <ControlPanel
          params={params}
          onChangeParams={setParams}
          locations={locations}
          selectedLocation={selectedLocation}
          onSelectLocation={setSelectedLocation}
          accent={accent}
          onChangeAccent={setAccent}
          onOpenCompareModal={() => setIsCompareModalOpen(true)}
          onOpenAncientMap={() => setIsMapViewerOpen(true)}
        />

        {/* Bottom Left Active Location Details Lore Card */}
        <LocationDetailsCard
          location={selectedLocation}
          onClose={() => setSelectedLocation(null)}
        />
      </main>

      {/* Geometric Balance Bottom Footer Status Bar */}
      <footer className="h-9 border-t border-white/10 flex items-center px-5 bg-black/80 text-[10px] text-white/40 space-x-6 uppercase tracking-wider shrink-0 z-30 font-mono">
        <div className="flex items-center">
          <span className="w-1.5 h-1.5 bg-emerald-400 mr-2 rounded-full animate-ping"></span>
          <span className="text-emerald-400 font-bold">VULKAN_API: STABLE</span>
        </div>
        <div className="hidden sm:block">MESH_TRIANGLES: {vulkanStats.triangles.toLocaleString()}</div>
        <div className="hidden sm:block">CEINTURE_ASTÉROÏDES: ACTIVE (1,800 CORPS)</div>
        <div className="flex-1 text-right italic text-white/60">Système Stellaire Kaelis // GAIA & Aethelia</div>
      </footer>

      {/* Critical Push Notifications Modal */}
      <NotificationSystem
        alerts={alerts}
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        onSelectAlertLocation={handleSelectAlertLocation}
        onMarkAllRead={handleMarkAllRead}
        onSimulateNewAlert={handleSimulateNewAlert}
      />

      {/* Astrophysics Scale Comparison Modal */}
      <PlanetaryCompareModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        onSelectPlanet={(planetId) => {
          cosmicAudio.setPlanet(planetId);
          setParams(prev => ({ ...prev, selectedTarget: planetId as any }));
        }}
      />

      {/* Ancient Parchment Map Explorer */}
      <AncientMapViewer
        isOpen={isMapViewerOpen}
        onClose={() => setIsMapViewerOpen(false)}
        onSelectLocation={(loc) => {
          setSelectedLocation(loc);
          if (loc.planet === 'GAIA') {
            setParams(prev => ({ ...prev, selectedTarget: 'gaia' }));
          } else if (loc.planet === 'Aethelgard') {
            setParams(prev => ({ ...prev, selectedTarget: 'aethelgard' }));
          } else if (loc.planet === 'Luna Nova') {
            setParams(prev => ({ ...prev, selectedTarget: 'luna_nova' }));
          } else {
            setParams(prev => ({ ...prev, selectedTarget: 'aethelia' }));
          }
        }}
      />
    </div>
  );
}
