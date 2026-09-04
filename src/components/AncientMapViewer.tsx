import React, { useState } from 'react';
import { X, MapPin, ZoomIn, ZoomOut, Compass, Globe, Sparkles, Navigation } from 'lucide-react';
import { GAIA_LOCATIONS, AETHELIA_LOCATIONS } from '../data/locations';
import { LocationPOI, EnvironmentalParams } from '../types';
import { cosmicAudio } from '../utils/audioEngine';

interface AncientMapViewerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (location: LocationPOI) => void;
  onChangeTargetPlanet: (target: EnvironmentalParams['selectedTarget']) => void;
}

export const AncientMapViewer: React.FC<AncientMapViewerProps> = ({
  isOpen,
  onClose,
  onSelectLocation,
  onChangeTargetPlanet,
}) => {
  const [selectedPlanetFilter, setSelectedPlanetFilter] = useState<'gaia' | 'aethelia'>('gaia');
  const [activePOI, setActivePOI] = useState<LocationPOI | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  if (!isOpen) return null;

  const currentLocations = selectedPlanetFilter === 'gaia' ? GAIA_LOCATIONS : AETHELIA_LOCATIONS;

  const handleSelectPOI = (poi: LocationPOI) => {
    cosmicAudio.playBeep(780, 0.08);
    setActivePOI(poi);
  };

  const handleWarpTo3D = (poi: LocationPOI) => {
    cosmicAudio.playTransitChime();
    onChangeTargetPlanet(selectedPlanetFilter === 'gaia' ? 'gaia' : 'aethelia');
    onSelectLocation(poi);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md font-mono select-none animate-fadeIn">
      <div className="relative w-full max-w-5xl max-h-[92vh] bg-[#16120c] border-2 border-[#b89758]/60 shadow-[0_0_50px_rgba(184,151,88,0.25)] flex flex-col overflow-hidden text-[#e6d5b8]">
        {/* Antique Header */}
        <div className="h-12 border-b border-[#b89758]/40 px-5 flex items-center justify-between bg-[#1f1910] shrink-0">
          <div className="flex items-center space-x-3">
            <Compass className="w-5 h-5 text-[#d4af37] animate-spin" style={{ animationDuration: '30s' }} />
            <span className="font-serif font-bold text-sm text-[#f3e5ab] tracking-widest uppercase flex items-center gap-2">
              CARTE ANCIENNE & ATLAS CARTOGRAPHIQUE DU MONDE DE {selectedPlanetFilter.toUpperCase()}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-[#2a2215] border border-[#b89758]/40 p-0.5">
              <button
                onClick={() => {
                  cosmicAudio.playBeep(520, 0.05);
                  setSelectedPlanetFilter('gaia');
                  setActivePOI(null);
                }}
                className={`px-3 py-1 text-xs font-serif font-bold transition-all ${
                  selectedPlanetFilter === 'gaia'
                    ? 'bg-[#b89758] text-[#120d07] shadow-sm'
                    : 'text-[#d4af37] hover:text-[#fff]'
                }`}
              >
                GAÏA (La Vivante)
              </button>
              <button
                onClick={() => {
                  cosmicAudio.playBeep(520, 0.05);
                  setSelectedPlanetFilter('aethelia');
                  setActivePOI(null);
                }}
                className={`px-3 py-1 text-xs font-serif font-bold transition-all ${
                  selectedPlanetFilter === 'aethelia'
                    ? 'bg-[#b89758] text-[#120d07] shadow-sm'
                    : 'text-[#d4af37] hover:text-[#fff]'
                }`}
              >
                AETHELIA (Océanique)
              </button>
            </div>

            <button
              onClick={() => {
                cosmicAudio.playBeep(440, 0.05);
                onClose();
              }}
              className="p-1.5 hover:bg-[#b89758]/20 text-[#d4af37] hover:text-[#fff] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Parchment Canvas Area */}
        <div className="flex-1 relative overflow-hidden bg-[#1c160e] flex flex-col md:flex-row">
          {/* 2D Interactive Antique Map Projection */}
          <div className="flex-1 relative overflow-hidden p-4 flex items-center justify-center bg-[#151009]">
            {/* Parchment Texture Overlay & Map Border */}
            <div
              className="relative w-full h-[360px] sm:h-[460px] max-w-3xl border-2 border-[#b89758]/80 bg-[#241c12] shadow-inner overflow-hidden flex items-center justify-center transition-transform duration-300"
              style={{
                backgroundImage: `radial-gradient(ellipse at center, #2e2316 0%, #1c150c 100%)`,
                transform: `scale(${zoomLevel})`,
              }}
            >
              {/* Antique Navigation Rhumb Lines & Compass Grids */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-25" xmlns="http://www.w3.org/2000/svg">
                <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#d4af37" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#d4af37" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="0" y1="0" x2="100%" y2="100%" stroke="#d4af37" strokeWidth="0.5" strokeDasharray="2 4" />
                <line x1="100%" y1="0" x2="0" y2="100%" stroke="#d4af37" strokeWidth="0.5" strokeDasharray="2 4" />
                <circle cx="50%" cy="50%" r="35%" fill="none" stroke="#d4af37" strokeWidth="1" strokeDasharray="6 6" />
                <circle cx="50%" cy="50%" r="48%" fill="none" stroke="#d4af37" strokeWidth="0.5" />
              </svg>

              {/* Central Compass Rose (Rose des Vents) */}
              <div className="absolute top-4 right-4 pointer-events-none opacity-40">
                <div className="w-16 h-16 rounded-full border border-[#d4af37] flex items-center justify-center text-[9px] font-serif text-[#d4af37] font-bold">
                  <span>N</span>
                </div>
              </div>

              {/* Antique Latitude/Longitude Border Ticks */}
              <div className="absolute top-1 left-2 text-[9px] font-serif text-[#b89758]/60 uppercase tracking-widest">
                Lat: 90°N / 90°S // Meridian Prime
              </div>

              {/* Geographic Coastline / Continents Mock Silhouette Background */}
              <div className="absolute inset-4 border border-[#b89758]/30 rounded opacity-20 pointer-events-none flex items-center justify-center">
                <span className="font-serif italic text-3xl text-[#d4af37]/40 tracking-widest uppercase">
                  {selectedPlanetFilter === 'gaia' ? 'ORBIS TERRARUM GAÏA' : 'OCEANUS AETHELIA'}
                </span>
              </div>

              {/* Interactive POI Pins positioned by (lat, lng) */}
              {currentLocations.map(poi => {
                // Convert (lat [-90..90], lng [-180..180]) to Percentage X/Y on 2D map
                const xPct = ((poi.lng + 180) / 360) * 100;
                const yPct = ((90 - poi.lat) / 180) * 100;
                const isSelected = activePOI?.id === poi.id;

                return (
                  <button
                    key={poi.id}
                    onClick={() => handleSelectPOI(poi)}
                    className={`absolute transform -translate-x-1/2 -translate-y-1/2 group transition-all ${
                      isSelected ? 'z-30 scale-125' : 'z-20 hover:scale-110'
                    }`}
                    style={{ left: `${xPct}%`, top: `${yPct}%` }}
                  >
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shadow-lg transition-all ${
                          isSelected
                            ? 'bg-[#d4af37] border-[#fff] shadow-[0_0_12px_#d4af37]'
                            : 'bg-[#5c4623] border-[#b89758] group-hover:bg-[#8a6834]'
                        }`}
                      >
                        <MapPin className={`w-2.5 h-2.5 ${isSelected ? 'text-black' : 'text-[#f3e5ab]'}`} />
                      </div>

                      {/* Map Label in Calligraphic Style */}
                      <span
                        className={`mt-1 text-[9px] font-serif tracking-tight whitespace-nowrap px-1.5 py-0.5 rounded transition-all ${
                          isSelected
                            ? 'bg-[#b89758] text-[#120d07] font-bold shadow-md'
                            : 'bg-[#1a140b]/80 text-[#f3e5ab]/90 border border-[#b89758]/30 group-hover:bg-[#2b2012]'
                        }`}
                      >
                        {poi.name}
                      </span>
                    </div>
                  </button>
                );
              })}

              {/* Map Zoom Controls */}
              <div className="absolute bottom-3 left-3 flex gap-1 z-30">
                <button
                  onClick={() => setZoomLevel(prev => Math.min(1.6, prev + 0.2))}
                  className="p-1.5 bg-[#2a2014] border border-[#b89758]/40 hover:bg-[#3d2f1e] text-[#d4af37]"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setZoomLevel(prev => Math.max(0.8, prev - 0.2))}
                  className="p-1.5 bg-[#2a2014] border border-[#b89758]/40 hover:bg-[#3d2f1e] text-[#d4af37]"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setZoomLevel(1)}
                  className="px-2 py-1 bg-[#2a2014] border border-[#b89758]/40 hover:bg-[#3d2f1e] text-[#d4af37] text-[10px]"
                >
                  100%
                </button>
              </div>
            </div>
          </div>

          {/* Right Lore & POI Inspector Sidebar */}
          <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-[#b89758]/30 bg-[#1a140b] p-4 flex flex-col justify-between overflow-y-auto">
            {activePOI ? (
              <div className="space-y-4">
                <div className="space-y-1 border-b border-[#b89758]/30 pb-3">
                  <span className="text-[10px] uppercase tracking-widest text-[#d4af37] font-serif">
                    {activePOI.region}
                  </span>
                  <h3 className="text-lg font-serif font-bold text-[#f3e5ab] uppercase leading-tight">
                    {activePOI.name}
                  </h3>
                  <div className="text-[10px] text-[#b89758] flex items-center gap-2">
                    <span>Lat: {activePOI.lat}°</span>
                    <span>•</span>
                    <span>Lng: {activePOI.lng}°</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-[10px] uppercase font-bold text-[#d4af37] font-serif">
                    CHRONIQUE & TOPOGRAPHIE :
                  </div>
                  <p className="text-xs font-serif leading-relaxed text-[#e6d5b8]/90 italic bg-[#261d11] p-3 border border-[#b89758]/30">
                    "{activePOI.description}"
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-serif">
                  <div className="p-2 bg-[#261d11] border border-[#b89758]/20">
                    <div className="text-[9px] text-[#b89758] uppercase">Faction</div>
                    <div className="font-bold text-[#f3e5ab] text-[11px] truncate">{activePOI.faction || 'Gardiens'}</div>
                  </div>
                  <div className="p-2 bg-[#261d11] border border-[#b89758]/20">
                    <div className="text-[9px] text-[#b89758] uppercase">Climat</div>
                    <div className="font-bold text-[#f3e5ab] text-[11px] truncate">{activePOI.climate || 'Tempéré'}</div>
                  </div>
                </div>

                <button
                  onClick={() => handleWarpTo3D(activePOI)}
                  className="w-full py-2.5 bg-[#b89758] hover:bg-[#d4af37] text-[#120d07] font-serif font-bold uppercase text-xs flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
                >
                  <Navigation className="w-4 h-4" /> Aligner le Globe 3D sur ce Lieu
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-6 space-y-3 h-full">
                <Globe className="w-12 h-12 text-[#b89758]/40 animate-pulse" />
                <p className="text-xs font-serif italic text-[#b89758]">
                  Cliquez sur un symbole de la carte cartographique pour révéler les chroniques de Gaïa & Aethelia.
                </p>
              </div>
            )}

            <div className="pt-4 border-t border-[#b89758]/20 text-[9px] text-[#b89758]/60 font-serif text-center">
              ARCHIVES CARTOGRAPHIQUES ANTIQUES // SYSTEM_AETHELIA
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
