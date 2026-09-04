import React, { useState } from 'react';
import { X, Globe, Sun, Disc, Layers, Orbit, Sparkles, Compass, Shield, Activity } from 'lucide-react';
import { EnvironmentalParams } from '../types';
import { cosmicAudio } from '../utils/audioEngine';

interface PlanetaryCompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  params: EnvironmentalParams;
  onSelectTarget: (target: EnvironmentalParams['selectedTarget']) => void;
}

interface CelestialBodySpec {
  id: EnvironmentalParams['selectedTarget'];
  name: string;
  subtitle: string;
  type: 'Étoile' | 'Planète Océanique' | 'Planète Volcanique' | 'Lune Tellurique' | 'Super-Planète Vivante';
  class: 'Class Stellar' | 'Class M (Terrestre)' | 'Class V (Volcanique)' | 'Class L (Lunaire)' | 'Class G (Bio-Gaïa)';
  diameterKm: number;
  scaleRelative: string;
  radiusUnits: number;
  massKg: string;
  densityGcm3: number;
  surfaceGravity: string;
  orbitalDistanceMkm: number;
  orbitalVelocityKmS: number;
  orbitalPeriodDays: number;
  rotationPeriodHours: number;
  surfaceTemp: string;
  atmosphere: string[];
  surfacePressure: string;
  habitabilityScore: number;
  primaryResource: string;
  dominantFaction: string;
  color: string;
  borderColor: string;
  bgGrad: string;
  description: string;
  internalLayers: { name: string; thickness: string; desc: string }[];
}

const CELESTIAL_SPECS: CelestialBodySpec[] = [
  {
    id: 'sun',
    name: 'LE SOLEIL CENTRAL',
    subtitle: 'Étoile Naine Jaune-Orageuse',
    type: 'Étoile',
    class: 'Class Stellar',
    diameterKm: 28400,
    scaleRelative: '25.4x Aethelia',
    radiusUnits: 250,
    massKg: '1.989 × 10³⁰ kg',
    densityGcm3: 1.41,
    surfaceGravity: '274.0 m/s² (28g)',
    orbitalDistanceMkm: 0,
    orbitalVelocityKmS: 0,
    orbitalPeriodDays: 0,
    rotationPeriodHours: 600,
    surfaceTemp: '5,500°C (Couronne: 2,000,000°C)',
    atmosphere: ['Hydrogène (74%)', 'Hélium (24%)', 'Plasma ionisé (2%)'],
    surfacePressure: '3.4 × 10¹¹ atm',
    habitabilityScore: 0,
    primaryResource: 'Énergie Stellaire & Hélium-3 Pur',
    dominantFaction: 'Aucune (Sanctuaire Stellaire)',
    color: '#ffaa00',
    borderColor: 'border-amber-500',
    bgGrad: 'from-amber-950/40 via-yellow-950/20 to-black',
    description: 'Cœur ardent du système solaire d’Aethelia. Sa fusion thermonucléaire irradie les mondes en éther pur et alimente les aurores célestes.',
    internalLayers: [
      { name: 'Cœur Thermonucléaire', thickness: '0 - 0.25 R', desc: 'Zone de fusion de l’hydrogène à 15 millions de Kelvin.' },
      { name: 'Zone Radiative', thickness: '0.25 - 0.70 R', desc: 'Transfert d’énergie par photons sur des millions d’années.' },
      { name: 'Photosphère & Couronne', thickness: '0.70 - 1.00 R', desc: 'Surface visible émettrice de lumière et éruptions de plasma.' },
    ],
  },
  {
    id: 'gaia',
    name: 'GAIA',
    subtitle: 'La Planète Vivante Suprême',
    type: 'Super-Planète Vivante',
    class: 'Class G (Bio-Gaïa)',
    diameterKm: 2229.8,
    scaleRelative: '1.75x Aethelia (1,114.9 km R)',
    radiusUnits: 175,
    massKg: '3.12 × 10²³ kg',
    densityGcm3: 5.48,
    surfaceGravity: '1.72 m/s² (0.17g)',
    orbitalDistanceMkm: 246.8,
    orbitalVelocityKmS: 23.15,
    orbitalPeriodDays: 687,
    rotationPeriodHours: 28.5,
    surfaceTemp: '-40°C à +42°C (Moy: 22°C)',
    atmosphere: ['Azote (76%)', 'Oxygène (21%)', 'Vapeur d’eau (2%)', 'Éther Gaïen (1%)'],
    surfacePressure: '1.08 atm',
    habitabilityScore: 98,
    primaryResource: 'Cristaux du Lac de Cristal & Gemmes des Brases',
    dominantFaction: 'Gardiens d’Orphée & Amirauté du Levant',
    color: '#2dd4bf',
    borderColor: 'border-teal-400',
    bgGrad: 'from-teal-950/40 via-emerald-950/20 to-black',
    description: 'Vaste planète aux continents grandioses préservés par la carte antique de Gaïa. Berceau de la Forêt d’Orphée, du Lac de Cristal et des Monts de Brase.',
    internalLayers: [
      { name: 'Noyau Métallo-Cristallin', thickness: '0 - 0.35 R', desc: 'Générateur d’un puissant champ magnétosphérique protecteur.' },
      { name: 'Manteau Terrestre Gaïen', thickness: '0.35 - 0.90 R', desc: 'Silicates riches en sève minérale et flux telluriques.' },
      { name: 'Croûte & Biosphère', thickness: '0.90 - 1.00 R', desc: 'Continents antiques, océans d’émeraude et atmosphère riche.' },
    ],
  },
  {
    id: 'aethelia',
    name: 'AETHELIA PRIME',
    subtitle: 'Le Berceau Océanique',
    type: 'Planète Océanique',
    class: 'Class M (Terrestre)',
    diameterKm: 1274.2,
    scaleRelative: '1.00x Base (637.1 km R)',
    radiusUnits: 100,
    massKg: '5.97 × 10²² kg',
    densityGcm3: 5.51,
    surfaceGravity: '0.98 m/s² (0.10g)',
    orbitalDistanceMkm: 149.6,
    orbitalVelocityKmS: 29.78,
    orbitalPeriodDays: 365.25,
    rotationPeriodHours: 24.0,
    surfaceTemp: '-52°C à +58°C (Moy: 18°C)',
    atmosphere: ['Azote (78%)', 'Oxygène (20.5%)', 'Argon (0.9%)', 'Éther Céleste (0.6%)'],
    surfacePressure: '1.00 atm',
    habitabilityScore: 95,
    primaryResource: 'Éther Flottant de Célestia & Bois Millénaire',
    dominantFaction: 'Ordre Céleste & Conseil de Veridia',
    color: '#38bdf8',
    borderColor: 'border-cyan-400',
    bgGrad: 'from-cyan-950/40 via-blue-950/20 to-black',
    description: 'Monde océanique enchanteur abritant les cités célestes flottantes de Célestia, les forêts millénaires et les calottes polaires immaculées.',
    internalLayers: [
      { name: 'Noyau Fer-Nickel', thickness: '0 - 0.40 R', desc: 'Noyau solide en rotation assurant la stabilité gravitationnelle.' },
      { name: 'Manteau Océanique', thickness: '0.40 - 0.92 R', desc: 'Roches magmatiques sous-marines et fosses hydrothermales.' },
      { name: 'Hydrosphère & Citadelles', thickness: '0.92 - 1.00 R', desc: 'Océans profonds recouvrant 72% de la surface de la planète.' },
    ],
  },
  {
    id: 'aethelgard',
    name: 'AETHELGARD',
    subtitle: 'La Forge Volcanique',
    type: 'Planète Volcanique',
    class: 'Class V (Volcanique)',
    diameterKm: 1019.4,
    scaleRelative: '0.80x Aethelia (509.7 km R)',
    radiusUnits: 80,
    massKg: '3.82 × 10²² kg',
    densityGcm3: 5.62,
    surfaceGravity: '0.78 m/s² (0.08g)',
    orbitalDistanceMkm: 152.1,
    orbitalVelocityKmS: 28.95,
    orbitalPeriodDays: 378,
    rotationPeriodHours: 26.2,
    surfaceTemp: '12°C à 118°C (Moy: 46°C)',
    atmosphere: ['Dioxyde de Carbone (82%)', 'Soufre (12%)', 'Azote (5%)', 'Vapeur de Magma (1%)'],
    surfacePressure: '2.45 atm',
    habitabilityScore: 42,
    primaryResource: 'Métaux Lourds, Adamantine & Magma Pyrogène',
    dominantFaction: 'Forge de Braise & Conseil de Séraphina',
    color: '#ef4444',
    borderColor: 'border-red-500',
    bgGrad: 'from-red-950/40 via-amber-950/20 to-black',
    description: 'Planète jumelle d’Aethelia aux paysages volcaniques titanesques, parsemée de failles de lave rougeoyantes et de déserts de cendres.',
    internalLayers: [
      { name: 'Cœur Magmatique Supercritique', thickness: '0 - 0.50 R', desc: 'Noyau de fer en fusion à haute température.' },
      { name: 'Manteau Volcanique Actif', thickness: '0.50 - 0.95 R', desc: 'Courants de convection magmatiques perpétuels.' },
      { name: 'Écorce Pyroclastique', thickness: '0.95 - 1.00 R', desc: 'Failles basaltiques et dômes de lave ardente.' },
    ],
  },
  {
    id: 'luna_nova',
    name: 'LUNA NOVA',
    subtitle: 'Lune Tellurique Verrouillée',
    type: 'Lune Tellurique',
    class: 'Class L (Lunaire)',
    diameterKm: 546.0,
    scaleRelative: '0.43x Aethelia (273 km R - 1737 km équiv)',
    radiusUnits: 27.3,
    massKg: '7.34 × 10²¹ kg',
    densityGcm3: 3.34,
    surfaceGravity: '1.62 m/s² (0.16g)',
    orbitalDistanceMkm: 0.384,
    orbitalVelocityKmS: 1.02,
    orbitalPeriodDays: 27.3,
    rotationPeriodHours: 655.2,
    surfaceTemp: '-130°C à +120°C (Moy: -20°C)',
    atmosphere: ['Exosphère ténue (Hélium, Néon, Argon < 10⁻¹² atm)'],
    surfacePressure: '0.0000001 atm',
    habitabilityScore: 18,
    primaryResource: 'Glace de Cratère & Régolithe Titanifère',
    dominantFaction: 'Garnison Lunaire & Pionniers du Crépuscule',
    color: '#c084fc',
    borderColor: 'border-purple-400',
    bgGrad: 'from-purple-950/40 via-indigo-950/20 to-black',
    description: 'Satellite naturel en rotation synchrone autour d’Aethelia. Ses cratères d’impact anciens abritent des observatoires d’écoute stellaire.',
    internalLayers: [
      { name: 'Noyau Métallique Rigide', thickness: '0 - 0.20 R', desc: 'Noyau partiellement solidifié à faible activité.' },
      { name: 'Manteau Rocheux Anorthositique', thickness: '0.20 - 0.85 R', desc: 'Silicates denses et basaltes lunaires.' },
      { name: 'Régolithe & Cratères d’Impact', thickness: '0.85 - 1.00 R', desc: 'Poussière fine d’impacts météoritiques millénaires.' },
    ],
  },
];

export const PlanetaryCompareModal: React.FC<PlanetaryCompareModalProps> = ({
  isOpen,
  onClose,
  params,
  onSelectTarget,
}) => {
  const [activeBodyId, setActiveBodyId] = useState<EnvironmentalParams['selectedTarget']>('gaia');
  const [selectedTab, setSelectedTab] = useState<'specs' | 'scale' | 'geology' | 'factions'>('specs');

  if (!isOpen) return null;

  const currentBody = CELESTIAL_SPECS.find(b => b.id === activeBodyId) || CELESTIAL_SPECS[1];

  const handleSelectPlanet = (id: EnvironmentalParams['selectedTarget']) => {
    cosmicAudio.playBeep(660, 0.08);
    setActiveBodyId(id);
  };

  const handleWarpToTarget = (id: EnvironmentalParams['selectedTarget']) => {
    cosmicAudio.playTransitChime();
    onSelectTarget(id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md font-mono select-none animate-fadeIn">
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-[#07090e] border border-white/20 shadow-2xl flex flex-col overflow-hidden">
        {/* Header Bar */}
        <div className="h-12 border-b border-white/10 px-5 flex items-center justify-between bg-black/60 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-amber-400 rounded-full animate-ping shadow-[0_0_12px_#fbbf24]"></div>
            <span className="font-bold text-sm text-white uppercase tracking-widest flex items-center gap-2">
              <Orbit className="w-4 h-4 text-amber-400" />
              ENCYCLOPÉDIE_ASTROPHYSIQUE_&_COMPARATEUR // AETHELIA_SYSTEM
            </span>
          </div>

          <button
            onClick={() => {
              cosmicAudio.playBeep(440, 0.05);
              onClose();
            }}
            className="p-1.5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Celestial Body Quick Selector Tabs */}
        <div className="flex border-b border-white/10 overflow-x-auto bg-black/40 shrink-0 p-1.5 gap-1.5">
          {CELESTIAL_SPECS.map(body => {
            const isActive = activeBodyId === body.id;
            return (
              <button
                key={body.id}
                onClick={() => handleSelectPlanet(body.id)}
                className={`flex-1 py-2 px-3 border text-xs font-bold uppercase transition-all flex items-center justify-center gap-2 min-w-[130px] ${
                  isActive
                    ? `${body.borderColor} bg-white/10 text-white shadow-lg`
                    : 'border-white/5 bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80'
                }`}
                style={{ borderColor: isActive ? body.color : undefined }}
              >
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: body.color }}
                />
                <span className="truncate">{body.name}</span>
              </button>
            );
          })}
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex border-b border-white/10 px-5 py-2 bg-black/20 text-xs gap-4 shrink-0">
          <button
            onClick={() => setSelectedTab('specs')}
            className={`pb-1 uppercase font-bold tracking-wider transition-colors flex items-center gap-1.5 ${
              selectedTab === 'specs' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-white/40 hover:text-white/80'
            }`}
          >
            <Activity className="w-3.5 h-3.5" /> Données Physiques & Atmosphère
          </button>
          <button
            onClick={() => setSelectedTab('scale')}
            className={`pb-1 uppercase font-bold tracking-wider transition-colors flex items-center gap-1.5 ${
              selectedTab === 'scale' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-white/40 hover:text-white/80'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> Comparateur d’Échelle Relatif
          </button>
          <button
            onClick={() => setSelectedTab('geology')}
            className={`pb-1 uppercase font-bold tracking-wider transition-colors flex items-center gap-1.5 ${
              selectedTab === 'geology' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-white/40 hover:text-white/80'
            }`}
          >
            <Globe className="w-3.5 h-3.5" /> Coupe Géologique & Noyaux
          </button>
          <button
            onClick={() => setSelectedTab('factions')}
            className={`pb-1 uppercase font-bold tracking-wider transition-colors flex items-center gap-1.5 ${
              selectedTab === 'factions' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-white/40 hover:text-white/80'
            }`}
          >
            <Shield className="w-3.5 h-3.5" /> Factions & Ressources
          </button>
        </div>

        {/* Main Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: SPECS & PHYSICAL PARAMETERS */}
          {selectedTab === 'specs' && (
            <div className="space-y-6">
              {/* Hero Planet Overview Banner */}
              <div className={`p-5 border ${currentBody.borderColor} bg-gradient-to-r ${currentBody.bgGrad} flex flex-col md:flex-row items-start md:items-center justify-between gap-4`}>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 bg-black/60 border border-white/20 uppercase font-bold tracking-widest text-white/80">
                      {currentBody.class}
                    </span>
                    <span className="text-[10px] text-white/50 uppercase">
                      ID: {currentBody.id.toUpperCase()}
                    </span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    {currentBody.name}
                  </h2>
                  <p className="text-xs text-white/70 italic max-w-xl">
                    {currentBody.description}
                  </p>
                </div>

                <button
                  onClick={() => handleWarpToTarget(currentBody.id)}
                  className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-black font-bold uppercase text-xs flex items-center gap-2 transition-transform active:scale-95 shrink-0 shadow-lg shadow-amber-400/20"
                >
                  <Compass className="w-4 h-4" /> Cibler dans le Viewport 3D
                </button>
              </div>

              {/* Astrophysics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 bg-black/60 border border-white/10 space-y-1">
                  <div className="text-[10px] text-white/40 uppercase">Diamètre Moyen</div>
                  <div className="text-sm font-bold text-cyan-300">{currentBody.diameterKm.toLocaleString()} km</div>
                  <div className="text-[9px] text-white/50">{currentBody.scaleRelative}</div>
                </div>

                <div className="p-3 bg-black/60 border border-white/10 space-y-1">
                  <div className="text-[10px] text-white/40 uppercase">Gravité de Surface</div>
                  <div className="text-sm font-bold text-emerald-300">{currentBody.surfaceGravity}</div>
                  <div className="text-[9px] text-white/50">Masse: {currentBody.massKg}</div>
                </div>

                <div className="p-3 bg-black/60 border border-white/10 space-y-1">
                  <div className="text-[10px] text-white/40 uppercase">Vitesse Orbitale Moy.</div>
                  <div className="text-sm font-bold text-amber-300">{currentBody.orbitalVelocityKmS} km/s</div>
                  <div className="text-[9px] text-white/50">Distance: {currentBody.orbitalDistanceMkm} M km</div>
                </div>

                <div className="p-3 bg-black/60 border border-white/10 space-y-1">
                  <div className="text-[10px] text-white/40 uppercase">Période Orbitale (An)</div>
                  <div className="text-sm font-bold text-purple-300">{currentBody.orbitalPeriodDays} jours</div>
                  <div className="text-[9px] text-white/50">Jour Sidéral: {currentBody.rotationPeriodHours} h</div>
                </div>

                <div className="p-3 bg-black/60 border border-white/10 space-y-1">
                  <div className="text-[10px] text-white/40 uppercase">Plage de Température</div>
                  <div className="text-sm font-bold text-rose-300">{currentBody.surfaceTemp}</div>
                </div>

                <div className="p-3 bg-black/60 border border-white/10 space-y-1">
                  <div className="text-[10px] text-white/40 uppercase">Pression de Surface</div>
                  <div className="text-sm font-bold text-teal-300">{currentBody.surfacePressure}</div>
                </div>

                <div className="p-3 bg-black/60 border border-white/10 space-y-1">
                  <div className="text-[10px] text-white/40 uppercase">Densité Volumique</div>
                  <div className="text-sm font-bold text-blue-300">{currentBody.densityGcm3} g/cm³</div>
                </div>

                <div className="p-3 bg-black/60 border border-white/10 space-y-1">
                  <div className="text-[10px] text-white/40 uppercase">Indice Habitabilité</div>
                  <div className="text-sm font-bold text-lime-300 flex items-center justify-between">
                    <span>{currentBody.habitabilityScore} / 100</span>
                    <span className="text-[9px] px-1.5 py-0.5 bg-lime-950 text-lime-400 border border-lime-800">
                      {currentBody.habitabilityScore > 80 ? 'EXCELLENT' : currentBody.habitabilityScore > 30 ? 'EXTRÊME' : 'STÉRILE'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Atmospheric Composition */}
              <div className="p-4 bg-black/60 border border-white/10 space-y-3">
                <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  SPECTROSCOPIE_ATMOSPHÉRIQUE // COMPOSITION_GAZEUSE
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                  {currentBody.atmosphere.map((gas, idx) => (
                    <div key={idx} className="p-2 bg-white/5 border border-white/10 text-xs text-white/80 font-mono">
                      <span className="text-cyan-400 font-bold mr-2">[{idx + 1}]</span>
                      {gas}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: RELATIVE SCALE COMPARATOR */}
          {selectedTab === 'scale' && (
            <div className="space-y-6">
              <div className="p-4 bg-black/60 border border-cyan-500/30 space-y-2">
                <div className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
                  COMPARAISON_PROPORTIONNELLE_DES_RAYONS (ÉCHELLE 1:1)
                </div>
                <p className="text-xs text-white/60">
                  Visualisation mathématique des diamètres équatoriaux relatifs dans le moteur Vulkan. GAIA est la plus grande planète tellurique vivante (1.75x Aethelia), tandis que Luna Nova orbite comme compagnon synchrone.
                </p>
              </div>

              {/* Scale Bars */}
              <div className="space-y-4 bg-black/40 p-4 border border-white/10">
                {CELESTIAL_SPECS.map(body => {
                  const maxDiam = 28400; // Sun
                  const pct = Math.max(3, (body.diameterKm / maxDiam) * 100);
                  const isCurrent = body.id === activeBodyId;

                  return (
                    <div key={body.id} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold">
                        <div className="flex items-center gap-2">
                          <span style={{ color: body.color }}>{body.name}</span>
                          <span className="text-[10px] text-white/40 font-normal">({body.scaleRelative})</span>
                        </div>
                        <span className="text-white/80">{body.diameterKm.toLocaleString()} km</span>
                      </div>

                      <div className="h-5 bg-white/5 border border-white/10 relative overflow-hidden flex items-center">
                        <div
                          className="h-full transition-all duration-700"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: body.color,
                            boxShadow: isCurrent ? `0 0 15px ${body.color}` : 'none',
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Visual Planet Disk Alignment */}
              <div className="p-6 bg-black/80 border border-white/10 flex flex-wrap items-end justify-center gap-8 min-h-[200px]">
                {CELESTIAL_SPECS.map(body => {
                  // visual circle scale (clamped for readability)
                  const pixelSize = body.id === 'sun' ? 140 : body.id === 'gaia' ? 70 : body.id === 'aethelia' ? 40 : body.id === 'aethelgard' ? 32 : 18;
                  const isCurrent = body.id === activeBodyId;

                  return (
                    <div
                      key={body.id}
                      onClick={() => handleSelectPlanet(body.id)}
                      className="flex flex-col items-center gap-2 cursor-pointer group"
                    >
                      <div
                        className={`rounded-full transition-transform group-hover:scale-110 ${
                          isCurrent ? 'ring-2 ring-white ring-offset-2 ring-offset-black shadow-lg' : 'opacity-80 hover:opacity-100'
                        }`}
                        style={{
                          width: `${pixelSize}px`,
                          height: `${pixelSize}px`,
                          backgroundColor: body.color,
                          boxShadow: `0 0 ${pixelSize / 2}px ${body.color}88`,
                        }}
                      />
                      <span className={`text-[10px] font-bold uppercase ${isCurrent ? 'text-white' : 'text-white/50'}`}>
                        {body.id.replace('_', ' ')}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: GEOLOGY & CRUST CUTAWAYS */}
          {selectedTab === 'geology' && (
            <div className="space-y-6">
              <div className="p-4 bg-black/60 border border-emerald-500/30 space-y-2">
                <div className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
                  GÉOMÉTRIE_INTERNE_&_COUPE_GÉOLOGIQUE : {currentBody.name}
                </div>
                <p className="text-xs text-white/60">
                  Stratigraphie profonde et modélisation thermique du manteau planétaire calculée par le noyau Vulkan GPU.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {currentBody.internalLayers.map((layer, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-black/60 border border-white/10 space-y-2 relative overflow-hidden"
                  >
                    <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">
                      COUCHE_0{idx + 1} // {layer.thickness}
                    </div>
                    <div className="text-sm font-bold text-white uppercase">{layer.name}</div>
                    <p className="text-xs text-white/60 leading-relaxed">{layer.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: FACTIONS & RESOURCES */}
          {selectedTab === 'factions' && (
            <div className="space-y-6">
              <div className="p-4 bg-black/60 border border-purple-500/30 space-y-2">
                <div className="text-xs font-bold text-purple-400 uppercase tracking-widest">
                  GÉOPOLITIQUE_&_RESSOURCES_PLANÉTAIRES : {currentBody.name}
                </div>
                <p className="text-xs text-white/60">
                  Factions politiques souveraines, guildes marchandes et gisements de minéraux stratégiques.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-black/60 border border-white/10 space-y-2">
                  <div className="text-[10px] text-purple-400 uppercase font-bold tracking-widest">FACTIONS SOUVERAINES</div>
                  <div className="text-sm font-bold text-white">{currentBody.dominantFaction}</div>
                  <p className="text-xs text-white/60">
                    Maintient l’ordre colonial et régule les flux commerciaux d’éther et de transport orbital.
                  </p>
                </div>

                <div className="p-4 bg-black/60 border border-white/10 space-y-2">
                  <div className="text-[10px] text-amber-400 uppercase font-bold tracking-widest">RESSOURCES PRIMAIRES</div>
                  <div className="text-sm font-bold text-amber-300">{currentBody.primaryResource}</div>
                  <p className="text-xs text-white/60">
                    Minerais rares utilisés pour la propulsion éthérique, les boucliers à plasma et les réseaux de télécommunication.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="h-12 border-t border-white/10 px-5 flex items-center justify-between bg-black/80 text-[10px] text-white/40 shrink-0">
          <span>BASE_DE_DONNÉES_VULKAN // ASTROPHYSICS_ENGINE_V4.2</span>
          <button
            onClick={() => {
              cosmicAudio.playBeep(440, 0.05);
              onClose();
            }}
            className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white font-bold uppercase transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
