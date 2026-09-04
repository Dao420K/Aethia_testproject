import React from 'react';
import { Sun, Globe, Compass, Radio, Disc, Orbit, Play, Pause, Layers, BookOpen, Sparkles } from 'lucide-react';
import { EnvironmentalParams } from '../types';
import { cosmicAudio } from '../utils/audioEngine';

interface SystemNavigatorProps {
  params: EnvironmentalParams;
  onChangeParams: (params: EnvironmentalParams) => void;
  orbitalVelocities?: { aethelia: number; aethelgard: number; lunaNova: number; gaia?: number };
  solarDistances?: { aethelia: number; aethelgard: number; lunaNova: number; gaia?: number; sun: number };
  onOpenCompareModal?: () => void;
  onOpenAncientMap?: () => void;
}

export const SystemNavigator: React.FC<SystemNavigatorProps> = ({
  params,
  onChangeParams,
  orbitalVelocities,
  solarDistances,
  onOpenCompareModal,
  onOpenAncientMap,
}) => {
  const targets = [
    {
      id: 'system_overview',
      name: 'VUE SYSTÈME',
      type: 'overview',
      icon: Compass,
      color: 'border-amber-400 text-amber-400 bg-amber-400/10',
      activeColor: 'bg-amber-400 text-black border-amber-400 font-bold',
      dist: solarDistances?.aethelia ? `${(solarDistances.aethelia * 1.2).toFixed(1)} M km` : '---',
      speed: 'V_SYS',
      radiusSpec: 'Système complet',
      gravity: '---',
    },
    {
      id: 'sun',
      name: 'SOLEIL CENTRAL',
      type: 'sun',
      icon: Sun,
      color: 'border-amber-500 text-amber-500 bg-amber-500/10',
      activeColor: 'bg-amber-500 text-black border-amber-500 font-bold',
      dist: '0.00 UA (0 km)',
      speed: '0.0 km/s',
      radiusSpec: 'R = 14,200 km',
      gravity: '274.0 m/s²',
    },
    {
      id: 'aethelia',
      name: 'AETHELIA PRIME',
      type: 'planet',
      icon: Globe,
      color: 'border-cyan-400 text-cyan-400 bg-cyan-400/10',
      activeColor: 'bg-cyan-400 text-black border-cyan-400 font-bold',
      dist: solarDistances?.aethelia ? `${solarDistances.aethelia.toFixed(1)} M km` : '149.6 M km',
      speed: orbitalVelocities?.aethelia ? `${orbitalVelocities.aethelia.toFixed(2)} km/s` : '29.78 km/s',
      radiusSpec: 'R = 637.1 km (10% Terre)',
      gravity: '0.98 m/s²',
    },
    {
      id: 'aethelgard',
      name: 'AETHELGARD',
      type: 'planet',
      icon: Globe,
      color: 'border-emerald-400 text-emerald-400 bg-emerald-400/10',
      activeColor: 'bg-emerald-400 text-black border-emerald-400 font-bold',
      dist: solarDistances?.aethelgard ? `${solarDistances.aethelgard.toFixed(1)} M km` : '152.1 M km',
      speed: orbitalVelocities?.aethelgard ? `${orbitalVelocities.aethelgard.toFixed(2)} km/s` : '28.95 km/s',
      radiusSpec: 'R = 509.7 km (-20% Aethelia)',
      gravity: '0.78 m/s²',
    },
    {
      id: 'luna_nova',
      name: 'LUNA NOVA (LUNE)',
      type: 'moon',
      icon: Disc,
      color: 'border-purple-400 text-purple-400 bg-purple-400/10',
      activeColor: 'bg-purple-400 text-black border-purple-400 font-bold',
      dist: solarDistances?.lunaNova ? `${solarDistances.lunaNova.toFixed(1)} M km` : '149.9 M km',
      speed: orbitalVelocities?.lunaNova ? `${orbitalVelocities.lunaNova.toFixed(2)} km/s` : '1.02 km/s',
      radiusSpec: 'R = 1,737.4 km (Taille Lune)',
      gravity: '1.62 m/s²',
    },
    {
      id: 'gaia',
      name: 'GAIA (PLANÈTE VIVANTE)',
      type: 'planet',
      icon: Globe,
      color: 'border-teal-400 text-teal-400 bg-teal-400/10',
      activeColor: 'bg-teal-400 text-black border-teal-400 font-bold',
      dist: solarDistances?.gaia ? `${solarDistances.gaia.toFixed(1)} M km` : '246.8 M km',
      speed: orbitalVelocities?.gaia ? `${orbitalVelocities.gaia.toFixed(2)} km/s` : '23.15 km/s',
      radiusSpec: 'R = 1,114.9 km (1.75x Aethelia)',
      gravity: '1.72 m/s²',
    },
  ] as const;

  return (
    <div className="space-y-3 font-mono">
      {/* Quick Launchpad Buttons: Compare & Ancient Map */}
      <div className="grid grid-cols-2 gap-1.5">
        <button
          onClick={() => {
            cosmicAudio.playBeep(600, 0.06);
            if (onOpenCompareModal) onOpenCompareModal();
          }}
          className="p-2 bg-gradient-to-r from-amber-950/80 to-black border border-amber-500/50 hover:border-amber-400 text-amber-300 text-[10px] font-bold uppercase flex items-center justify-center gap-1.5 transition-transform active:scale-95 shadow-md"
        >
          <Layers className="w-3.5 h-3.5 text-amber-400" /> Comparateur Échelles
        </button>

        <button
          onClick={() => {
            cosmicAudio.playBeep(600, 0.06);
            if (onOpenAncientMap) onOpenAncientMap();
          }}
          className="p-2 bg-gradient-to-r from-[#2a2215] to-black border border-[#b89758]/60 hover:border-[#d4af37] text-[#f3e5ab] text-[10px] font-bold uppercase flex items-center justify-center gap-1.5 transition-transform active:scale-95 shadow-md"
        >
          <BookOpen className="w-3.5 h-3.5 text-[#d4af37]" /> Atlas Cartographique
        </button>
      </div>

      {/* Cinematic Tour Toggle Banner */}
      <div className="p-2 bg-black/80 border border-cyan-500/40 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[11px] font-bold text-cyan-300 uppercase">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>VISITE_GUIDÉE_CINÉMATIQUE</span>
        </div>

        <button
          onClick={() => {
            cosmicAudio.playBeep(700, 0.08);
            onChangeParams({ ...params, cinematicTour: !params.cinematicTour });
          }}
          className={`px-2.5 py-1 text-[10px] font-bold uppercase transition-all flex items-center gap-1 ${
            params.cinematicTour
              ? 'bg-cyan-400 text-black border border-cyan-300 shadow-[0_0_10px_#22d3ee]'
              : 'bg-white/10 text-white/70 hover:bg-white/20 border border-white/20'
          }`}
        >
          {params.cinematicTour ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
          {params.cinematicTour ? 'ACTIF' : 'LANCER'}
        </button>
      </div>

      {/* Target Focus Selection Grid */}
      <div className="grid grid-cols-1 gap-1.5 text-xs">
        {targets.map(t => {
          const Icon = t.icon;
          const isSelected = params.selectedTarget === t.id;

          return (
            <button
              key={t.id}
              onClick={() => {
                cosmicAudio.setPlanet(t.id);
                cosmicAudio.playBeep(550, 0.05);
                onChangeParams({ ...params, selectedTarget: t.id as any, cinematicTour: false });
              }}
              className={`p-2 border transition-all flex flex-col gap-1 group ${
                isSelected ? t.activeColor : 'bg-black/60 border-white/10 text-slate-300 hover:bg-white/10'
              }`}
            >
              <div className="w-full flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-black' : 'text-amber-400'}`} />
                  <span className="font-bold tracking-wider">{t.name}</span>
                </div>

                <div className="flex items-center gap-2 text-[10px] opacity-90 font-mono">
                  <span className="hidden sm:inline-block">{t.dist}</span>
                  <span className="px-1.5 py-0.5 border border-current text-[9px] font-bold">
                    {t.speed}
                  </span>
                </div>
              </div>

              {t.radiusSpec && t.id !== 'system_overview' && (
                <div className="w-full flex items-center justify-between text-[9px] font-mono border-t border-white/10 pt-1 mt-0.5 opacity-90">
                  <span className={isSelected ? 'text-black font-semibold' : 'text-amber-300/90'}>
                    📐 {t.radiusSpec}
                  </span>
                  <span className={isSelected ? 'text-black font-semibold' : 'text-emerald-300/90'}>
                    ⚓ Gravité: {t.gravity}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Orbital Mechanics & Time Warp Sliders */}
      <div className="p-2.5 bg-black/60 border border-white/10 space-y-2.5 text-xs">
        <div className="text-[10px] text-white/50 uppercase tracking-widest flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-cyan-400" /> CONTRÔLE_ORBITES_KEPLÉRIENNES
          </div>
        </div>

        {/* Time Warp Presets */}
        <div className="space-y-1">
          <div className="flex justify-between text-white/80 text-[10px]">
            <span>PROPAGATION_TEMPORELLE (TIME_WARP)</span>
            <span className="text-amber-400 font-bold">{(params.timeWarp ?? 1)}x</span>
          </div>
          <div className="grid grid-cols-4 gap-1">
            {[1, 5, 20, 50].map(speed => (
              <button
                key={speed}
                onClick={() => {
                  cosmicAudio.playBeep(450 + speed * 5, 0.04);
                  onChangeParams({ ...params, timeWarp: speed });
                }}
                className={`py-1 text-[9px] font-bold border transition-all ${
                  (params.timeWarp ?? 1) === speed
                    ? 'bg-amber-400 text-black border-amber-400 font-extrabold'
                    : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between text-white/80 mb-1 text-[10px]">
            <span>VITESSE_ORBITALE_SYSTEME</span>
            <span className="text-amber-400 font-bold">{(params.orbitSpeed ?? 0.8).toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min={0.0}
            max={3.0}
            step={0.1}
            value={params.orbitSpeed ?? 0.8}
            onChange={e => onChangeParams({ ...params, orbitSpeed: Number(e.target.value) })}
            className="w-full accent-amber-400 cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between text-white/80 mb-1 text-[10px]">
            <span>RAYON_ORBITAL_DES_PLANÈTES</span>
            <span className="text-cyan-400 font-bold">{params.orbitRadius ?? 420} UA</span>
          </div>
          <input
            type="range"
            min={250}
            max={750}
            step={10}
            value={params.orbitRadius ?? 420}
            onChange={e => onChangeParams({ ...params, orbitRadius: Number(e.target.value) })}
            className="w-full accent-cyan-400 cursor-pointer"
          />
        </div>

        {/* Feature Toggles: Asteroid belt & Rings */}
        <div className="space-y-1.5 pt-2 border-t border-white/10 text-[10px]">
          <div className="flex items-center justify-between">
            <span className="text-white/80">CEINTURE_ASTÉROÏDES_KAELIS</span>
            <input
              type="checkbox"
              checked={params.showAsteroidBelt ?? true}
              onChange={e => onChangeParams({ ...params, showAsteroidBelt: e.target.checked })}
              className="w-3.5 h-3.5 accent-amber-400 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-white/80">ANNEAUX_PLANÉTAIRES_GAIA</span>
            <input
              type="checkbox"
              checked={params.showGaiaRings ?? true}
              onChange={e => onChangeParams({ ...params, showGaiaRings: e.target.checked })}
              className="w-3.5 h-3.5 accent-teal-400 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-white/80">TRAJECTOIRE_LUNA_NOVA</span>
            <input
              type="checkbox"
              checked={params.showMoonOrbit}
              onChange={e => onChangeParams({ ...params, showMoonOrbit: e.target.checked })}
              className="w-3.5 h-3.5 accent-purple-400 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
