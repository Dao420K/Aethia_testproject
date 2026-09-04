import React, { useState } from 'react';
import {
  Sun,
  Cloud,
  Droplets,
  Sliders,
  Sparkles,
  MapPin,
  Moon,
  Zap,
  RotateCcw,
  Palette,
  ChevronRight,
  Flame,
  Globe,
  Hammer,
  Grid,
  Lightbulb,
  Compass,
  Waves,
  Download,
  Upload,
  Orbit,
  Disc,
} from 'lucide-react';
import { EnvironmentalParams, LocationPOI, UIThemeAccent } from '../types';
import { SystemNavigator } from './SystemNavigator';

interface ControlPanelProps {
  params: EnvironmentalParams;
  onChangeParams: (newParams: EnvironmentalParams) => void;
  locations: LocationPOI[];
  selectedLocation: LocationPOI | null;
  onSelectLocation: (location: LocationPOI | null) => void;
  accent: UIThemeAccent;
  onChangeAccent: (accent: UIThemeAccent) => void;
  orbitalVelocities?: { aethelia: number; aethelgard: number; lunaNova: number; gaia?: number };
  solarDistances?: { aethelia: number; aethelgard: number; lunaNova: number; gaia?: number; sun: number };
  onOpenCompareModal?: () => void;
  onOpenAncientMap?: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  params,
  onChangeParams,
  locations,
  selectedLocation,
  onSelectLocation,
  accent,
  onChangeAccent,
  orbitalVelocities,
  solarDistances,
  onOpenCompareModal,
  onOpenAncientMap,
}) => {
  const [activeTab, setActiveTab] = useState<'nav' | 'sun' | 'sculpt' | 'lighting' | 'clouds' | 'ocean' | 'hdr' | 'pois'>('nav');
  const [isOpen, setIsOpen] = useState(true);

  // Helper for slider updating
  const updateParam = <K extends keyof EnvironmentalParams>(key: K, value: EnvironmentalParams[K]) => {
    onChangeParams({ ...params, [key]: value });
  };

  // Preset Handlers
  const applyPreset = (type: 'noon' | 'sunset' | 'night' | 'ignis') => {
    if (type === 'noon') {
      onChangeParams({
        ...params,
        sunLongitude: 90,
        sunLatitude: 15,
        atmosphereDensity: 1.0,
        rayleighScale: 1.5,
        cityLightsIntensity: 0.5,
        cloudCoverage: 0.5,
        cloudShadowStrength: 0.6,
        exposure: 1.1,
        keyLightIntensity: 2.2,
      });
    } else if (type === 'sunset') {
      onChangeParams({
        ...params,
        sunLongitude: 180,
        sunLatitude: 2,
        atmosphereDensity: 1.8,
        rayleighScale: 2.2,
        sunsetGlow: 1.8,
        cityLightsIntensity: 1.8,
        cloudCoverage: 0.6,
        cloudShadowStrength: 0.8,
        exposure: 1.2,
        keyLightIntensity: 2.5,
      });
    } else if (type === 'night') {
      onChangeParams({
        ...params,
        sunLongitude: 280,
        sunLatitude: -10,
        atmosphereDensity: 0.8,
        cityLightsIntensity: 2.8,
        volcanoGlowIntensity: 2.5,
        exposure: 1.4,
        keyLightIntensity: 0.8,
      });
    } else if (type === 'ignis') {
      onChangeParams({
        ...params,
        sunLongitude: 85,
        sunLatitude: -20,
        cityLightsIntensity: 2.0,
        volcanoGlowIntensity: 3.0,
        atmosphereDensity: 1.6,
        atmosphereColor: '#ff5500',
        exposure: 1.3,
      });
    }
  };

  return (
    <div
      className={`fixed right-4 top-16 bottom-14 z-20 pointer-events-auto transition-all duration-300 flex flex-col font-mono ${
        isOpen ? 'w-80 md:w-96' : 'w-10'
      }`}
    >
      {/* Container Box */}
      <div className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-none h-full shadow-2xl flex flex-col overflow-hidden text-slate-200">
        {/* Panel Header */}
        <div className="p-3 border-b border-white/10 flex items-center justify-between bg-black/90 border-l-2 border-l-[#ff3e00]">
          {isOpen ? (
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-[#ff3e00]/10 border border-[#ff3e00]/30 text-[#ff3e00]">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold tracking-widest uppercase text-white">STUDIO_VULKAN_ENGINE</h3>
                <p className="text-[9px] text-white/40">3-SPHERES_PBR_SCULPTOR</p>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsOpen(true)}
              className="mx-auto p-1.5 bg-white/5 text-white/70 hover:bg-white/10"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
            </button>
          )}

          {isOpen && (
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-none bg-white/5 text-white/60 hover:text-white hover:bg-white/10"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {isOpen && (
          <>
            {/* Target Focus Selection Bar */}
            <div className="p-2.5 border-b border-white/10 bg-black/90 space-y-2">
              <div className="text-[10px] uppercase text-amber-400 font-bold tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 text-[#ff3e00]" /> SÉLECTEUR_CORPS_CÉLESTE</span>
                <span className="px-1.5 py-0.5 bg-amber-400/20 border border-amber-400 text-amber-300 text-[9px] rounded">
                  {params.selectedTarget.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 text-[10px] font-mono font-bold">
                <button
                  onClick={() => updateParam('selectedTarget', 'aethelia')}
                  className={`p-2 border uppercase transition-all flex items-center justify-center gap-1.5 ${
                    params.selectedTarget === 'aethelia'
                      ? 'bg-cyan-500 text-black border-cyan-400 font-extrabold shadow-lg shadow-cyan-500/20'
                      : 'bg-white/5 border-white/10 text-cyan-300 hover:bg-white/10'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" /> AETHELIA PRIME
                </button>

                <button
                  onClick={() => updateParam('selectedTarget', 'aethelgard')}
                  className={`p-2 border uppercase transition-all flex items-center justify-center gap-1.5 ${
                    params.selectedTarget === 'aethelgard'
                      ? 'bg-emerald-500 text-black border-emerald-400 font-extrabold shadow-lg shadow-emerald-500/20'
                      : 'bg-white/5 border-white/10 text-emerald-300 hover:bg-white/10'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5" /> AETHELGARD
                </button>

                <button
                  onClick={() => updateParam('selectedTarget', 'luna_nova')}
                  className={`p-2 border uppercase transition-all flex items-center justify-center gap-1.5 ${
                    params.selectedTarget === 'luna_nova'
                      ? 'bg-purple-500 text-black border-purple-400 font-extrabold shadow-lg shadow-purple-500/20'
                      : 'bg-white/5 border-white/10 text-purple-300 hover:bg-white/10'
                  }`}
                >
                  <Disc className="w-3.5 h-3.5" /> LUNA NOVA
                </button>

                <button
                  onClick={() => updateParam('selectedTarget', 'gaia')}
                  className={`p-2 border uppercase transition-all flex items-center justify-center gap-1.5 ${
                    params.selectedTarget === 'gaia'
                      ? 'bg-teal-500 text-black border-teal-400 font-extrabold shadow-lg shadow-teal-500/20'
                      : 'bg-white/5 border-white/10 text-teal-300 hover:bg-white/10'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" /> GAIA
                </button>

                <button
                  onClick={() => updateParam('selectedTarget', 'sun')}
                  className={`p-2 border uppercase transition-all flex items-center justify-center gap-1.5 ${
                    params.selectedTarget === 'sun'
                      ? 'bg-amber-500 text-black border-amber-400 font-extrabold shadow-lg shadow-amber-500/20'
                      : 'bg-white/5 border-white/10 text-amber-300 hover:bg-white/10'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" /> SOLEIL
                </button>

                <button
                  onClick={() => updateParam('selectedTarget', 'system_overview')}
                  className={`p-2 border uppercase transition-all flex items-center justify-center gap-1.5 ${
                    params.selectedTarget === 'system_overview'
                      ? 'bg-amber-400 text-black border-amber-400 font-extrabold shadow-lg shadow-amber-400/20'
                      : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5" /> VUE GLOBALE
                </button>
              </div>

              <div className="p-1.5 bg-white/5 border border-white/10 text-[9px] text-white/70 flex items-center justify-between">
                <span>CIBLE SELECTIONNÉE POUR MODIFICATIONS:</span>
                <span className="font-bold text-amber-400 uppercase">
                  {params.selectedTarget === 'aethelia' ? 'Aethelia Prime (Océanique)' :
                   params.selectedTarget === 'aethelgard' ? 'Aethelgard (Volcanique)' :
                   params.selectedTarget === 'luna_nova' ? 'Luna Nova (Lune)' :
                   params.selectedTarget === 'gaia' ? 'GAIA (Planète Vivante 1.75x)' :
                   params.selectedTarget === 'sun' ? 'Soleil Central' : 'Système Solaire'}
                </span>
              </div>
            </div>

            {/* Viewport Mode Selectors Bar */}
            <div className="p-2 border-b border-white/10 bg-black/60">
              <div className="text-[9px] uppercase text-white/50 tracking-widest mb-1.5 flex items-center gap-1">
                <Compass className="w-3 h-3 text-[#ff3e00]" /> MODE_INTERACTIF_VIEWPORT
              </div>
              <div className="grid grid-cols-2 gap-1 text-[10px]">
                <button
                  onClick={() => {
                    updateParam('viewportMode', 'explore');
                    setActiveTab('pois');
                  }}
                  className={`p-1.5 flex items-center justify-center gap-1.5 border font-bold uppercase transition-all ${
                    params.viewportMode === 'explore'
                      ? 'bg-[#ff3e00] text-black border-[#ff3e00]'
                      : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5" /> EXPLORER
                </button>

                <button
                  onClick={() => {
                    updateParam('viewportMode', 'sculpt');
                    setActiveTab('sculpt');
                  }}
                  className={`p-1.5 flex items-center justify-center gap-1.5 border font-bold uppercase transition-all ${
                    params.viewportMode === 'sculpt'
                      ? 'bg-emerald-500 text-black border-emerald-500'
                      : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                  }`}
                >
                  <Hammer className="w-3.5 h-3.5" /> SCULPTER
                </button>

                <button
                  onClick={() => {
                    updateParam('viewportMode', 'wireframe_segments');
                    setActiveTab('hdr');
                  }}
                  className={`p-1.5 flex items-center justify-center gap-1.5 border font-bold uppercase transition-all ${
                    params.viewportMode === 'wireframe_segments'
                      ? 'bg-cyan-500 text-black border-cyan-500'
                      : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                  }`}
                >
                  <Grid className="w-3.5 h-3.5" /> SECTEURS
                </button>

                <button
                  onClick={() => {
                    updateParam('viewportMode', 'studio_lighting');
                    setActiveTab('lighting');
                  }}
                  className={`p-1.5 flex items-center justify-center gap-1.5 border font-bold uppercase transition-all ${
                    params.viewportMode === 'studio_lighting'
                      ? 'bg-amber-400 text-black border-amber-400'
                      : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                  }`}
                >
                  <Lightbulb className="w-3.5 h-3.5" /> STUDIO_3D
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-white/10 bg-black/90 p-1 gap-1 text-[10px] overflow-x-auto">
              {[
                { id: 'nav', label: 'NAVIGATEUR', icon: Orbit },
                { id: 'sculpt', label: 'SCULPT', icon: Hammer },
                { id: 'lighting', label: 'LUMIERE', icon: Lightbulb },
                { id: 'sun', label: 'SOLEIL', icon: Sun },
                { id: 'ocean', label: 'EAU_3D', icon: Waves },
                { id: 'clouds', label: 'NUAGES', icon: Cloud },
                { id: 'pois', label: 'LIEUX', icon: MapPin },
              ].map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-2 py-1.5 flex items-center justify-center gap-1 font-mono uppercase tracking-wider transition-colors whitespace-nowrap ${
                      isActive
                        ? 'bg-[#ff3e00] text-black font-bold'
                        : 'text-white/50 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Contents Scrollable */}
            <div className="flex-1 overflow-y-auto p-3 space-y-4 text-xs font-mono">
              {/* TAB: SYSTEM NAVIGATOR */}
              {activeTab === 'nav' && (
                <SystemNavigator
                  params={params}
                  onChangeParams={onChangeParams}
                  orbitalVelocities={orbitalVelocities}
                  solarDistances={solarDistances}
                  onOpenCompareModal={onOpenCompareModal}
                  onOpenAncientMap={onOpenAncientMap}
                />
              )}
              {/* TAB: SCULPTURE TERRAIN 3D */}
              {activeTab === 'sculpt' && (
                <div className="space-y-4">
                  <div className="p-2 bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-[10px] uppercase">
                    <strong>INSTRUCTION_SCULPTURE:</strong> Cliquez et glissez sur la planète 3D pour façonner directement le relief des montagnes et fosses.
                  </div>

                  <div>
                    <label className="block text-white/80 font-mono text-[11px] mb-1">
                      OUTIL_DE_SCULPTURE
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { id: 'raise', label: 'ÉLEVER (+)', desc: 'Montagnes / Volcans' },
                        { id: 'lower', label: 'CREUSER (-)', desc: 'Fosses / Canyons' },
                        { id: 'smooth', label: 'LISSER (~)', desc: 'Atténuer le relief' },
                        { id: 'flatten', label: 'APLATIR (_)', desc: 'Plateaux uniformes' },
                      ].map(t => (
                        <button
                          key={t.id}
                          onClick={() => updateParam('sculptTool', t.id as any)}
                          className={`p-2 border text-left font-mono transition-all ${
                            params.sculptTool === t.id
                              ? 'bg-emerald-500 text-black border-emerald-400 font-bold'
                              : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'
                          }`}
                        >
                          <div className="text-xs">{t.label}</div>
                          <div className="text-[9px] opacity-70">{t.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-white/80 font-mono mb-1 text-[11px]">
                      <span>RAYON_PINCEAU (BRUSH_SIZE)</span>
                      <span className="text-emerald-400">{params.brushRadius.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min={0.05}
                      max={0.35}
                      step={0.01}
                      value={params.brushRadius}
                      onChange={e => updateParam('brushRadius', Number(e.target.value))}
                      className="w-full accent-emerald-400 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-white/80 font-mono mb-1 text-[11px]">
                      <span>FORCE_SCULPTURE (INTENSITY)</span>
                      <span className="text-emerald-400">{params.brushStrength.toFixed(3)}</span>
                    </div>
                    <input
                      type="range"
                      min={0.005}
                      max={0.08}
                      step={0.002}
                      value={params.brushStrength}
                      onChange={e => updateParam('brushStrength', Number(e.target.value))}
                      className="w-full accent-emerald-400 cursor-pointer"
                    />
                  </div>

                  <div className="pt-2 border-t border-white/10">
                    <div className="flex justify-between text-white/80 font-mono mb-1 text-[11px]">
                      <span>NIVEAU_DES_OCEANS (3-SPHERES)</span>
                      <span className="text-cyan-400">{(params.waterSphereRadius * 100).toFixed(1)}m</span>
                    </div>
                    <input
                      type="range"
                      min={1.000}
                      max={1.035}
                      step={0.001}
                      value={params.waterSphereRadius}
                      onChange={e => updateParam('waterSphereRadius', Number(e.target.value))}
                      className="w-full accent-cyan-400 cursor-pointer"
                    />
                    <p className="text-[9px] text-white/40 mt-1">
                      Ajuste le rayon de la sphère d'eau par rapport à la sphère de terre.
                    </p>
                  </div>

                  {/* Heightmap JSON Export & Import Section */}
                  <div className="pt-3 border-t border-white/10 space-y-2">
                    <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider flex items-center justify-between">
                      <span>PERSISTANCE_HEIGHTMAP_JSON</span>
                      <span className="text-[9px] text-white/40">v1.0</span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => {
                          const exportData = {
                            version: '1.0.0',
                            timestamp: new Date().toISOString(),
                            planet: 'Aethelia Prime',
                            sculptParams: {
                              brushRadius: params.brushRadius,
                              brushStrength: params.brushStrength,
                              sculptTool: params.sculptTool,
                              waterSphereRadius: params.waterSphereRadius,
                            },
                            environment: {
                              sunLongitude: params.sunLongitude,
                              sunLatitude: params.sunLatitude,
                              atmosphereDensity: params.atmosphereDensity,
                              cloudCoverage: params.cloudCoverage,
                            },
                          };
                          const blob = new Blob([JSON.stringify(exportData, null, 2)], {
                            type: 'application/json',
                          });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `aethelia-heightmap-${Date.now()}.json`;
                          a.click();
                          URL.revokeObjectURL(url);
                        }}
                        className="p-2 bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/50 text-emerald-300 font-bold flex items-center justify-center gap-1.5 transition-all text-[10px] uppercase"
                      >
                        <Download className="w-3.5 h-3.5" /> EXPORTER_JSON
                      </button>

                      <label className="p-2 bg-white/5 hover:bg-white/10 border border-white/20 text-white/80 font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all text-[10px] uppercase">
                        <Upload className="w-3.5 h-3.5 text-cyan-400" /> IMPORTER_JSON
                        <input
                          type="file"
                          accept=".json"
                          className="hidden"
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = ev => {
                              try {
                                const data = JSON.parse(ev.target?.result as string);
                                if (data.sculptParams) {
                                  onChangeParams({
                                    ...params,
                                    brushRadius: data.sculptParams.brushRadius ?? params.brushRadius,
                                    brushStrength: data.sculptParams.brushStrength ?? params.brushStrength,
                                    sculptTool: data.sculptParams.sculptTool ?? params.sculptTool,
                                    waterSphereRadius: data.sculptParams.waterSphereRadius ?? params.waterSphereRadius,
                                    ...(data.environment || {}),
                                  });
                                }
                              } catch (err) {
                                alert('Fichier JSON invalide');
                              }
                            };
                            reader.readAsText(file);
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: STUDIO LIGHTING & RIG SHADERS */}
              {activeTab === 'lighting' && (
                <div className="space-y-4">
                  <div className="p-2 bg-amber-950/40 border border-amber-500/30 text-amber-400 text-[10px] uppercase">
                    <strong>STUDIO_ECLAIRAGE_3D:</strong> Modifiez le soleil Key Light, la lumière Fill et le contour Rim Light en temps réel.
                  </div>

                  <div>
                    <div className="flex justify-between text-white/80 font-mono mb-1 text-[11px]">
                      <span>INTENSITE_KEY_LIGHT (SOLEIL)</span>
                      <span className="text-amber-400">{params.keyLightIntensity.toFixed(1)}x</span>
                    </div>
                    <input
                      type="range"
                      min={0.2}
                      max={4.0}
                      step={0.1}
                      value={params.keyLightIntensity}
                      onChange={e => updateParam('keyLightIntensity', Number(e.target.value))}
                      className="w-full accent-amber-400 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-white/80 font-mono mb-1 text-[11px]">
                      <span>INTENSITE_FILL_LIGHT (OMBRE)</span>
                      <span className="text-blue-400">{params.fillLightIntensity.toFixed(1)}x</span>
                    </div>
                    <input
                      type="range"
                      min={0.0}
                      max={2.0}
                      step={0.1}
                      value={params.fillLightIntensity}
                      onChange={e => updateParam('fillLightIntensity', Number(e.target.value))}
                      className="w-full accent-blue-400 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-white/80 font-mono mb-1 text-[11px]">
                      <span>CONTOUR_RIM_LIGHT</span>
                      <span className="text-cyan-400">{params.rimLightIntensity.toFixed(1)}x</span>
                    </div>
                    <input
                      type="range"
                      min={0.0}
                      max={3.0}
                      step={0.1}
                      value={params.rimLightIntensity}
                      onChange={e => updateParam('rimLightIntensity', Number(e.target.value))}
                      className="w-full accent-cyan-400 cursor-pointer"
                    />
                  </div>

                  <div className="pt-2 border-t border-white/10">
                    <div className="flex justify-between text-white/80 font-mono mb-1 text-[11px]">
                      <span>RUGOSTE_PBR (ROUGHNESS)</span>
                      <span className="text-amber-400">{params.materialRoughness.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min={0.05}
                      max={0.95}
                      step={0.05}
                      value={params.materialRoughness}
                      onChange={e => updateParam('materialRoughness', Number(e.target.value))}
                      className="w-full accent-amber-400 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-white/80 font-mono mb-1 text-[11px]">
                      <span>METALLICITE_OCEANS</span>
                      <span className="text-amber-400">{params.materialMetalness.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min={0.0}
                      max={0.9}
                      step={0.05}
                      value={params.materialMetalness}
                      onChange={e => updateParam('materialMetalness', Number(e.target.value))}
                      className="w-full accent-amber-400 cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {/* TAB: SOLEIL & ATMOSPHERE */}
              {activeTab === 'sun' && (
                <div className="space-y-4">
                  {/* Solar System & Orbit Parameters */}
                  <div className="p-2 bg-amber-950/40 border border-amber-500/40 space-y-2">
                    <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider flex items-center justify-between">
                      <span>SYSTEME_SOLAIRE_&_ORBITE</span>
                      <span className="text-[9px] text-white/40">2 PLANETES</span>
                    </div>

                    <div>
                      <div className="flex justify-between text-white/80 font-mono mb-1 text-[10px]">
                        <span>VITESSE_ORBITALE</span>
                        <span className="text-amber-400">{params.orbitSpeed.toFixed(1)}x</span>
                      </div>
                      <input
                        type="range"
                        min={0.0}
                        max={3.0}
                        step={0.1}
                        value={params.orbitSpeed}
                        onChange={e => updateParam('orbitSpeed', Number(e.target.value))}
                        className="w-full accent-amber-400 cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-white/80 font-mono mb-1 text-[10px]">
                        <span>RAYON_ORBITAL_PARTAGE</span>
                        <span className="text-amber-400">{params.orbitRadius} UA</span>
                      </div>
                      <input
                        type="range"
                        min={250}
                        max={700}
                        step={10}
                        value={params.orbitRadius}
                        onChange={e => updateParam('orbitRadius', Number(e.target.value))}
                        className="w-full accent-amber-400 cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-white/80 font-mono mb-1 text-[10px]">
                        <span>TAILLE_SOLEIL_CENTRAL</span>
                        <span className="text-amber-400">{params.sunSize}.0</span>
                      </div>
                      <input
                        type="range"
                        min={20}
                        max={80}
                        step={2}
                        value={params.sunSize}
                        onChange={e => updateParam('sunSize', Number(e.target.value))}
                        className="w-full accent-amber-400 cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-white/80 font-mono mb-1 text-[10px]">
                        <span>RAYONNEMENT_SOLAIRE</span>
                        <span className="text-amber-400">{params.sunIntensity.toFixed(1)}x</span>
                      </div>
                      <input
                        type="range"
                        min={0.5}
                        max={5.0}
                        step={0.2}
                        value={params.sunIntensity}
                        onChange={e => updateParam('sunIntensity', Number(e.target.value))}
                        className="w-full accent-amber-400 cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1 text-[10px]">
                      <span className="text-white/80">ANNEAUX_D_ORBITE</span>
                      <input
                        type="checkbox"
                        checked={params.showOrbitRings}
                        onChange={e => updateParam('showOrbitRings', e.target.checked)}
                        className="w-3.5 h-3.5 accent-amber-400"
                      />
                    </div>
                  </div>

                  {/* Quick Presets Bar */}
                  <div className="p-2 border border-white/10 bg-black/40">
                    <div className="text-[9px] uppercase text-white/50 tracking-widest mb-1.5 flex items-center gap-1">
                      <Zap className="w-3 h-3 text-amber-400" /> AMBIANCES_PRESETS
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => applyPreset('noon')}
                        className="px-2 py-1.5 text-[10px] rounded-none bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 flex items-center gap-1.5 transition-all font-mono uppercase"
                      >
                        <Sun className="w-3 h-3 text-amber-400" /> MIDI
                      </button>
                      <button
                        onClick={() => applyPreset('sunset')}
                        className="px-2 py-1.5 text-[10px] rounded-none bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 flex items-center gap-1.5 transition-all font-mono uppercase"
                      >
                        <Sparkles className="w-3 h-3 text-orange-400" /> COUCHER
                      </button>
                      <button
                        onClick={() => applyPreset('night')}
                        className="px-2 py-1.5 text-[10px] rounded-none bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 flex items-center gap-1.5 transition-all font-mono uppercase"
                      >
                        <Moon className="w-3 h-3 text-blue-400" /> NUIT
                      </button>
                      <button
                        onClick={() => applyPreset('ignis')}
                        className="px-2 py-1.5 text-[10px] rounded-none bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 flex items-center gap-1.5 transition-all font-mono uppercase"
                      >
                        <Flame className="w-3 h-3 text-[#ff3e00]" /> IGNIS
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-white/80 font-mono mb-1 text-[11px]">
                      <span>LONGITUDE_SOLEIL</span>
                      <span className="text-[#ff3e00]">{params.sunLongitude}°</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={360}
                      value={params.sunLongitude}
                      onChange={e => updateParam('sunLongitude', Number(e.target.value))}
                      className="w-full accent-[#ff3e00] cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-white/80 font-mono mb-1 text-[11px]">
                      <span>LATITUDE_SOLEIL</span>
                      <span className="text-[#ff3e00]">{params.sunLatitude}°</span>
                    </div>
                    <input
                      type="range"
                      min={-90}
                      max={90}
                      value={params.sunLatitude}
                      onChange={e => updateParam('sunLatitude', Number(e.target.value))}
                      className="w-full accent-[#ff3e00] cursor-pointer"
                    />
                  </div>

                  <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                    <span className="text-white/80 text-[11px]">AUTO_ROTATION</span>
                    <input
                      type="checkbox"
                      checked={params.autoRotate}
                      onChange={e => updateParam('autoRotate', e.target.checked)}
                      className="w-3.5 h-3.5 accent-[#ff3e00]"
                    />
                  </div>
                </div>
              )}

              {/* TAB: EAU 3D */}
              {activeTab === 'ocean' && (
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-white/80 font-mono mb-1 text-[11px]">
                      <span>RAYON_SPHERE_OCEAN</span>
                      <span className="text-cyan-400">{(params.waterSphereRadius * 100).toFixed(1)}m</span>
                    </div>
                    <input
                      type="range"
                      min={1.000}
                      max={1.035}
                      step={0.001}
                      value={params.waterSphereRadius}
                      onChange={e => updateParam('waterSphereRadius', Number(e.target.value))}
                      className="w-full accent-cyan-400 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-white/80 font-mono mb-1 text-[11px]">
                      <span>RUGOSTE_OCEANIC</span>
                      <span className="text-cyan-400">{params.oceanRoughness.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min={0.02}
                      max={0.8}
                      step={0.02}
                      value={params.oceanRoughness}
                      onChange={e => updateParam('oceanRoughness', Number(e.target.value))}
                      className="w-full accent-cyan-400 cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {/* TAB: NUAGES */}
              {activeTab === 'clouds' && (
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-white/80 font-mono mb-1 text-[11px]">
                      <span>COUVERTURE_NUAGEUSE</span>
                      <span className="text-[#ff3e00]">{Math.round(params.cloudCoverage * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={params.cloudCoverage}
                      onChange={e => updateParam('cloudCoverage', Number(e.target.value))}
                      className="w-full accent-[#ff3e00] cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {/* TAB: LIEUX */}
              {activeTab === 'pois' && (
                <div className="space-y-2">
                  <div className="text-[10px] text-white/40 mb-2 font-mono uppercase">
                    POINTS_INTERET_AETHELIA:
                  </div>
                  {locations.map(loc => {
                    const isSelected = selectedLocation?.id === loc.id;
                    return (
                      <button
                        key={loc.id}
                        onClick={() => onSelectLocation(isSelected ? null : loc)}
                        className={`w-full p-2 border text-left transition-all flex items-center justify-between font-mono ${
                          isSelected
                            ? 'bg-[#ff3e00]/20 border-[#ff3e00] text-white'
                            : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-xs flex items-center gap-1.5 uppercase">
                            <MapPin className="w-3.5 h-3.5 text-[#ff3e00]" />
                            {loc.name}
                          </div>
                          <div className="text-[9px] text-white/40 font-mono mt-0.5">{loc.region}</div>
                        </div>
                        <span className="text-[9px] px-1.5 py-0.5 bg-black border border-white/10 text-white/80 font-mono">
                          {loc.temperature}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Dark Theme Personalization Footer */}
            <div className="p-2.5 border-t border-white/10 bg-black/90 flex items-center justify-between text-[10px] font-mono">
              <span className="text-white/40 flex items-center gap-1 uppercase">
                <Palette className="w-3.5 h-3.5 text-[#ff3e00]" /> ACCENT:
              </span>
              <div className="flex items-center gap-1.5">
                {(['teal', 'amber', 'crimson', 'emerald', 'violet'] as UIThemeAccent[]).map(c => (
                  <button
                    key={c}
                    onClick={() => onChangeAccent(c)}
                    className={`w-3.5 h-3.5 border transition-transform ${
                      accent === c ? 'scale-125 border-white ring-1 ring-[#ff3e00]' : 'border-transparent hover:scale-110'
                    }`}
                    style={{
                      backgroundColor:
                        c === 'teal'
                          ? '#ff3e00'
                          : c === 'amber'
                          ? '#f59e0b'
                          : c === 'crimson'
                          ? '#f43f5e'
                          : c === 'emerald'
                          ? '#10b981'
                          : '#8b5cf6',
                    }}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
