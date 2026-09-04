import React from 'react';
import { MapPin, Thermometer, Wind, Cpu, Layers, X, Navigation } from 'lucide-react';
import { LocationPOI } from '../types';

interface LocationDetailsCardProps {
  location: LocationPOI | null;
  onClose: () => void;
}

export const LocationDetailsCard: React.FC<LocationDetailsCardProps> = ({ location, onClose }) => {
  if (!location) return null;

  return (
    <div className="absolute bottom-12 left-4 z-20 pointer-events-auto max-w-sm w-full bg-black/80 backdrop-blur-xl border border-white/10 rounded-none p-3.5 shadow-2xl text-slate-100 font-mono border-l-2 border-l-[#ff3e00]">
      <div className="flex items-start justify-between border-b border-white/10 pb-2.5 mb-2.5">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-[#ff3e00]/10 border border-[#ff3e00]/30 text-[#ff3e00]">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-xs text-white uppercase tracking-wider">{location.name}</h3>
            <p className="text-[10px] text-[#ff3e00] font-mono">{location.region}</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <p className="text-xs text-white/80 leading-relaxed mb-3">{location.description}</p>

      {/* Climate & Faction Info */}
      <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
        <div className="bg-black/50 p-2 border border-white/10">
          <div className="text-[9px] text-white/50 flex items-center gap-1 uppercase tracking-wider">
            <Thermometer className="w-3 h-3 text-amber-400" /> TEMPERATURE
          </div>
          <div className="font-bold text-white mt-0.5 font-mono">{location.temperature || '21°C'}</div>
        </div>

        <div className="bg-black/50 p-2 border border-white/10">
          <div className="text-[9px] text-white/50 flex items-center gap-1 uppercase tracking-wider">
            <Wind className="w-3 h-3 text-blue-400" /> CLIMAT & VENTS
          </div>
          <div className="font-bold text-white mt-0.5 font-mono truncate">{location.climate || 'Tempéré'}</div>
        </div>
      </div>

      {/* Vulkan Region Render Pipeline Telemetry */}
      {location.vulkanShaderStats && (
        <div className="bg-black/70 p-2 border border-white/10 font-mono text-[10px] space-y-1">
          <div className="text-[9px] text-white/50 uppercase tracking-widest mb-1 flex items-center gap-1">
            <Cpu className="w-3 h-3 text-[#ff3e00]" /> TELEMETRIE_SHADER_REGION
          </div>
          <div className="flex justify-between">
            <span className="text-white/50">DRAW_CALLS:</span>
            <span className="text-white font-mono">{location.vulkanShaderStats.drawCalls}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/50">VERTICES_SURFACE:</span>
            <span className="text-white font-mono">{location.vulkanShaderStats.vertexCount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/50">POLY_RENDER:</span>
            <span className="text-white font-mono">{location.vulkanShaderStats.triangleCount.toLocaleString()}</span>
          </div>
        </div>
      )}
    </div>
  );
};
