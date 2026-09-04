import React, { useState } from 'react';
import { Cpu, Activity, Layers, Maximize2, Minimize2, Eye, Flame, ShieldAlert, Radio, Grid } from 'lucide-react';
import { EnvironmentalParams, VulkanPipelineStats } from '../types';

interface VulkanTelemetryOverlayProps {
  stats: VulkanPipelineStats;
  renderMode: EnvironmentalParams['renderMode'];
  onChangeRenderMode: (mode: EnvironmentalParams['renderMode']) => void;
  unreadAlertCount: number;
  onOpenNotifications: () => void;
  accentColorClass: string;
}

export const VulkanTelemetryOverlay: React.FC<VulkanTelemetryOverlayProps> = ({
  stats,
  renderMode,
  onChangeRenderMode,
  unreadAlertCount,
  onOpenNotifications,
  accentColorClass,
}) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="absolute top-4 left-4 z-20 pointer-events-auto flex flex-col gap-2 max-w-sm font-mono">
      {/* Top Banner Header */}
      <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-none p-3 shadow-2xl text-slate-100 flex items-center justify-between border-l-2 border-l-[#ff3e00]">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-none bg-[#ff3e00]/10 border border-[#ff3e00]/30 text-[#ff3e00]">
            <Flame className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="text-xs font-bold tracking-widest uppercase flex items-center gap-1.5 text-slate-100">
              Vulkan_HUD
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#ff3e00] animate-ping" />
            </div>
            <div className="text-[9px] text-white/50 tracking-tighter">
              AETHELIA_VIEWPORT // 3D_SHADER_CORE
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Notification Bell Badge */}
          <button
            onClick={onOpenNotifications}
            className="relative p-1.5 rounded-none bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 transition-colors"
            title="Alertes Environnementales Critiques"
          >
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            {unreadAlertCount > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[8px] font-bold bg-[#ff3e00] text-black rounded-none font-mono">
                {unreadAlertCount}
              </span>
            )}
          </button>

          {/* Collapse toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-none bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white transition-colors"
          >
            {collapsed ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {!collapsed && (
        <div className="bg-black/70 backdrop-blur-xl border border-white/10 rounded-none p-3.5 shadow-2xl text-slate-200 text-xs flex flex-col gap-3">
          {/* FPS & Frame Time */}
          <div className="grid grid-cols-2 gap-2 bg-black/50 p-2.5 rounded-none border border-white/10">
            <div>
              <div className="text-[9px] text-white/50 uppercase tracking-widest flex items-center gap-1">
                <Activity className="w-3 h-3 text-emerald-400" /> FRAME_RATE
              </div>
              <div className="text-lg font-bold text-emerald-400 mt-0.5 font-mono">
                {stats.fps} <span className="text-[10px] font-normal text-white/40">FPS</span>
              </div>
            </div>
            <div>
              <div className="text-[9px] text-white/50 uppercase tracking-widest flex items-center gap-1">
                <Cpu className="w-3 h-3 text-blue-400" /> FRAME_TIME
              </div>
              <div className="text-lg font-bold text-blue-400 mt-0.5 font-mono">
                {stats.frameTimeMs} <span className="text-[10px] font-normal text-white/40">MS</span>
              </div>
            </div>
          </div>

          {/* Real-time Keplerian Orbital Telemetry */}
          {stats.orbitalVelocities && (
            <div className="bg-black/60 p-2.5 border border-amber-500/40 space-y-2">
              <div className="text-[9px] text-amber-400 uppercase tracking-widest font-bold flex items-center justify-between">
                <span>ORBITAL_VELOCITY_TELEMETRY</span>
                <span className="text-[8px] text-amber-300/60 font-normal">KEPLER_K3</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[10px] font-mono">
                <div className="p-1.5 bg-cyan-950/40 border border-cyan-500/30 text-center">
                  <div className="text-[8px] text-cyan-400/70">AETHELIA</div>
                  <div className="text-xs font-bold text-cyan-300">
                    {(stats.orbitalVelocities.aethelia ?? 0).toFixed(2)}
                  </div>
                  <div className="text-[8px] text-white/40">KM/S</div>
                </div>

                <div className="p-1.5 bg-emerald-950/40 border border-emerald-500/30 text-center">
                  <div className="text-[8px] text-emerald-400/70">AETHELGARD</div>
                  <div className="text-xs font-bold text-emerald-300">
                    {(stats.orbitalVelocities.aethelgard ?? 0).toFixed(2)}
                  </div>
                  <div className="text-[8px] text-white/40">KM/S</div>
                </div>

                <div className="p-1.5 bg-purple-950/40 border border-purple-500/30 text-center">
                  <div className="text-[8px] text-purple-400/70">LUNA_NOVA</div>
                  <div className="text-xs font-bold text-purple-300">
                    {((stats.orbitalVelocities as any).lunaNova ?? (stats.orbitalVelocities as any).luna_nova ?? 0).toFixed(2)}
                  </div>
                  <div className="text-[8px] text-white/40">KM/S</div>
                </div>

                <div className="p-1.5 bg-teal-950/40 border border-teal-500/30 text-center">
                  <div className="text-[8px] text-teal-400/70">GAIA</div>
                  <div className="text-xs font-bold text-teal-300">
                    {((stats.orbitalVelocities as any).gaia ?? 0).toFixed(2)}
                  </div>
                  <div className="text-[8px] text-white/40">KM/S</div>
                </div>
              </div>

              {/* Solar Distance Tracker for Active Target */}
              {stats.activeSolarDistance !== undefined && (
                <div className="pt-1 border-t border-amber-500/20 flex items-center justify-between text-[10px]">
                  <span className="text-white/60">DISTANCE_AU_SOLEIL_CIBLE:</span>
                  <span className="text-amber-400 font-bold font-mono">
                    {(stats.activeSolarDistance ?? 0).toFixed(1)} M km
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Pipeline Mesh & VRAM Metrics */}
          <div className="flex flex-col gap-1.5 text-[11px]">
            <div className="flex justify-between">
              <span className="text-white/50 flex items-center gap-1">
                <Layers className="w-3 h-3 text-indigo-400" /> DRAW_CALLS:
              </span>
              <span className="text-white font-mono">{stats.drawCalls}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">TRIANGLES_COUNT:</span>
              <span className="text-white font-mono">{stats.triangles.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">VRAM_USAGE:</span>
              <span className="text-white font-mono">
                {stats.vramUsedMb}MB / {stats.vramTotalMb}MB
              </span>
            </div>

            {/* VRAM Bar */}
            <div className="w-full bg-white/10 h-1 mt-1 relative overflow-hidden">
              <div
                className="bg-[#ff3e00] h-full transition-all duration-500"
                style={{ width: `${(stats.vramUsedMb / stats.vramTotalMb) * 100}%` }}
              />
            </div>
          </div>

          {/* Vulkan Shader Extensions */}
          <div className="border-t border-white/10 pt-2 flex flex-col gap-1">
            <div className="text-[9px] uppercase text-white/50 tracking-widest flex items-center gap-1">
              <Radio className="w-3 h-3 text-amber-400" /> VULKAN_EXTENSIONS
            </div>
            <div className="flex flex-wrap gap-1 mt-0.5">
              {stats.activeExtensions.map((ext, idx) => (
                <span
                  key={idx}
                  className="px-1.5 py-0.5 text-[8px] rounded-none bg-white/5 border border-white/10 text-white/70"
                >
                  {ext}
                </span>
              ))}
            </div>
          </div>

          {/* View Mode Selector */}
          <div className="border-t border-white/10 pt-2">
            <div className="flex items-center justify-between mb-1.5">
              <div className="text-[9px] uppercase text-white/50 tracking-widest flex items-center gap-1">
                <Eye className="w-3 h-3 text-blue-400" /> SHADER_MODE
              </div>
              <button
                onClick={() => onChangeRenderMode(renderMode === 'wireframe' ? 'full' : 'wireframe')}
                className={`px-2 py-0.5 text-[9px] border font-bold flex items-center gap-1 uppercase transition-all ${
                  renderMode === 'wireframe'
                    ? 'bg-cyan-400 text-black border-cyan-400 shadow-md animate-pulse'
                    : 'bg-white/5 border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/20'
                }`}
              >
                <Grid className="w-3 h-3" />
                {renderMode === 'wireframe' ? 'WIREFRAME_ACTIF' : 'ACTIVER_WIREFRAME'}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {(
                [
                  { id: 'full', label: 'PHOTOREAL' },
                  { id: 'wireframe', label: 'WIREFRAME' },
                  { id: 'rayleigh_pass', label: 'ATMOSPHERE' },
                  { id: 'clouds_only', label: 'VOLUMETRIC' },
                ] as const
              ).map(m => (
                <button
                  key={m.id}
                  onClick={() => onChangeRenderMode(m.id)}
                  className={`px-2 py-1 text-[9px] border text-left font-mono tracking-wider uppercase transition-colors ${
                    renderMode === m.id
                      ? 'bg-[#ff3e00] border-[#ff3e00] text-black font-bold'
                      : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
