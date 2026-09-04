import React, { useState } from 'react';
import {
  Bell,
  ShieldAlert,
  Flame,
  Zap,
  Snowflake,
  Activity,
  X,
  Volume2,
  VolumeX,
  Navigation,
  CheckCircle2,
  PlusCircle
} from 'lucide-react';
import { CriticalAlert } from '../types';

interface NotificationSystemProps {
  alerts: CriticalAlert[];
  isOpen: boolean;
  onClose: () => void;
  onSelectAlertLocation: (lat: number, lng: number, alertId: string) => void;
  onMarkAllRead: () => void;
  onSimulateNewAlert: () => void;
}

export const NotificationSystem: React.FC<NotificationSystemProps> = ({
  alerts,
  isOpen,
  onClose,
  onSelectAlertLocation,
  onMarkAllRead,
  onSimulateNewAlert,
}) => {
  const [soundEnabled, setSoundEnabled] = useState(true);

  if (!isOpen) return null;

  const getAlertIcon = (type: CriticalAlert['iconType']) => {
    switch (type) {
      case 'volcano':
        return <Flame className="w-4 h-4 text-red-400" />;
      case 'magic':
        return <Zap className="w-4 h-4 text-cyan-400" />;
      case 'ice':
        return <Snowflake className="w-4 h-4 text-sky-300" />;
      case 'seismic':
      default:
        return <Activity className="w-4 h-4 text-amber-400" />;
    }
  };

  const getSeverityBadge = (severity: CriticalAlert['severity']) => {
    switch (severity) {
      case 'critical':
        return <span className="px-2 py-0.5 text-[9px] font-bold uppercase rounded bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse">CRITIQUE</span>;
      case 'high':
        return <span className="px-2 py-0.5 text-[9px] font-bold uppercase rounded bg-orange-500/20 text-orange-400 border border-orange-500/40">ÉLEVÉ</span>;
      case 'warning':
      default:
        return <span className="px-2 py-0.5 text-[9px] font-bold uppercase rounded bg-amber-500/20 text-amber-400 border border-amber-500/40">AVERTISSEMENT</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-auto bg-black/70 backdrop-blur-md flex justify-center items-start pt-16 px-4 font-mono">
      <div className="bg-black/90 border border-white/10 rounded-none w-full max-w-lg shadow-2xl text-slate-200 overflow-hidden flex flex-col max-h-[80vh] border-l-2 border-l-[#ff3e00]">
        {/* Header */}
        <div className="p-3 border-b border-white/10 bg-black flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-[#ff3e00]/10 border border-[#ff3e00]/30 text-[#ff3e00]">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-xs tracking-widest uppercase">ALERT_CENTER // AETHELIA</h3>
              <p className="text-[9px] text-white/40">PUSH_NOTIFICATION_VULKAN_STREAM</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1.5 bg-white/5 hover:bg-white/10 text-white/80 transition-colors"
              title={soundEnabled ? 'Alerte Sonore Activée' : 'Alerte Sonore Muette'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-white/40" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="px-3 py-2 border-b border-white/10 bg-black/40 flex items-center justify-between text-[10px]">
          <button
            onClick={onSimulateNewAlert}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-[#ff3e00] text-black font-bold uppercase transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            SIMULER_EVENEMENT
          </button>

          <button
            onClick={onMarkAllRead}
            className="flex items-center gap-1.5 text-white/50 hover:text-white transition-colors uppercase"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            TOUT_MARQUER_LU
          </button>
        </div>

        {/* Alerts List */}
        <div className="p-3 overflow-y-auto space-y-2.5 font-mono">
          {alerts.length === 0 ? (
            <div className="text-center py-8 text-white/40 text-xs">
              Aucune alerte environnementale enregistrée.
            </div>
          ) : (
            alerts.map(alert => (
              <div
                key={alert.id}
                className={`p-3 border transition-all ${
                  alert.isRead
                    ? 'bg-black/40 border-white/10 text-white/40'
                    : 'bg-white/5 border-[#ff3e00]/50 text-white'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    {getAlertIcon(alert.iconType)}
                    <span className="font-bold text-xs uppercase">{alert.title}</span>
                  </div>
                  {getSeverityBadge(alert.severity)}
                </div>

                <div className="text-[10px] text-white/60 mb-1 flex items-center gap-1">
                  📍 {alert.locationName}
                  <span className="text-[9px] text-white/40 font-mono">({alert.timestamp})</span>
                </div>

                <p className="text-xs text-white/80 leading-relaxed mb-3">{alert.message}</p>

                <button
                  onClick={() => onSelectAlertLocation(alert.lat, alert.lng, alert.id)}
                  className="w-full py-1.5 px-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[10px] uppercase font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <Navigation className="w-3.5 h-3.5 text-[#ff3e00]" />
                  CENTER_CAMERA_ON_EVENT
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
