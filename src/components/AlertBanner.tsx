/**
 * Clinical Visual Alert Beacon & Alarm Notification Banner
 * Renders real-time visual alerts when cellular telemetry exceeds critical safety limits.
 * Integrates silence countdown and audio chime controls (IEC 60601-1-8).
 */

import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Bell,
  BellOff,
  Volume2,
  VolumeX,
  ShieldAlert,
  Clock,
  CheckCircle,
  Sliders,
  Flame,
  Volume1,
  Smartphone,
  Vibrate,
} from 'lucide-react';
import { ActiveAlert } from '../types/alerts';
import { hapticFeedbackService } from '../services/hapticFeedbackService';

interface AlertBannerProps {
  activeAlerts: ActiveAlert[];
  isSilenced: boolean;
  silenceCountdown: number;
  soundEnabled: boolean;
  volume: number;
  onToggleMute: () => void;
  onChangeVolume: (vol: number) => void;
  onSilence: (seconds?: number) => void;
  onCancelSilence: () => void;
  onAcknowledge: (alertId: string) => void;
  onOpenAlertsDrawer: () => void;
  onTriggerSimulation: (type: 'WALL_STRESS' | 'ARRHYTHMIA_SHIELD' | 'CLEAR') => void;
  hapticsEnabled?: boolean;
  onToggleHaptics?: () => void;
  isHapticSupported?: boolean;
  /** Presentation mode only; server-side policy must authorize any real alert action. */
  interactionMode?: 'ACKNOWLEDGE' | 'REVIEW' | 'SANDBOX';
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
  activeAlerts,
  isSilenced,
  silenceCountdown,
  soundEnabled,
  volume,
  onToggleMute,
  onChangeVolume,
  onSilence,
  onCancelSilence,
  onAcknowledge,
  onOpenAlertsDrawer,
  onTriggerSimulation,
  hapticsEnabled = true,
  onToggleHaptics,
  isHapticSupported = true,
  interactionMode = 'SANDBOX',
}) => {
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [hapticPulsing, setHapticPulsing] = useState(false);

  // Subscribe to haptic trigger events for visual feedback
  useEffect(() => {
    const unsubscribe = hapticFeedbackService.subscribe(() => {
      setHapticPulsing(true);
      const timer = setTimeout(() => setHapticPulsing(false), 1800);
      return () => clearTimeout(timer);
    });
    return unsubscribe;
  }, []);

  const hasCritical = activeAlerts.some((a) => a.severity === 'CRITICAL');
  const hasWarning = activeAlerts.some((a) => a.severity === 'WARNING');
  const topAlert = activeAlerts[0];
  const canAcknowledge = interactionMode === 'ACKNOWLEDGE';
  const canRunSimulation = interactionMode === 'SANDBOX';

  return (
    <div className="w-full">
      {/* Active Breach Alert Notification Banner */}
      {activeAlerts.length > 0 ? (
        <div
          role="alert"
          aria-live="assertive"
          className={`relative rounded-xl border px-4 py-3 transition-all shadow-xl ${
            hasCritical
              ? 'border-rose-500/80 bg-rose-950/80 text-rose-100 shadow-rose-950/50 animate-pulse'
              : 'border-amber-500/80 bg-amber-950/80 text-amber-100 shadow-amber-950/50'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Left: Alarm Status Icon & Description */}
            <div className="flex items-center gap-3">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border font-bold ${
                  hasCritical
                    ? 'border-rose-400 bg-rose-500 text-white shadow-lg shadow-rose-500/40'
                    : 'border-amber-400 bg-amber-500 text-slate-950'
                }`}
              >
                <ShieldAlert className="h-5 w-5 animate-bounce" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider font-mono">
                    {hasCritical ? 'CRITICAL SAFETY THRESHOLD BREACH' : 'WARNING: TELEMETRY DRIFT'}
                  </span>
                  <span className="text-[11px] opacity-75">
                    ({activeAlerts.length} Active {activeAlerts.length === 1 ? 'Alarm' : 'Alarms'})
                  </span>
                </div>

                <div className="text-sm font-semibold text-white mt-0.5">
                  {topAlert.message}
                </div>
              </div>
            </div>

            {/* Right: Actions (Silence, Acknowledge, Sound, Limits) */}
            <div className="flex items-center gap-2">
              {/* Silence Alarm (120s IEC 60601-1-8 standard) */}
              {isSilenced ? (
                <button
                  onClick={onCancelSilence}
                  className="flex items-center gap-1.5 rounded-lg border border-amber-400/50 bg-amber-500/20 px-3 py-1.5 text-xs font-semibold text-amber-200 hover:bg-amber-500/30 transition"
                  title="Auditory alarms currently silenced"
                >
                  <BellOff className="h-3.5 w-3.5 text-amber-300" />
                  <span>Silenced ({silenceCountdown}s)</span>
                </button>
              ) : (
                <button
                  onClick={() => onSilence(120)}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900/90 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition"
                  title="Silence auditory tone for 120 seconds"
                >
                  <BellOff className="h-3.5 w-3.5 text-slate-300" />
                  <span>Silence 120s</span>
                </button>
              )}

              {/* Acknowledge Button */}
              {canAcknowledge && <button
                onClick={() => onAcknowledge(topAlert.id)}
                className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-slate-950 hover:bg-slate-100 transition shadow"
              >
                Acknowledge
              </button>}

              {/* Sound Toggle & Volume */}
              <div className="relative">
                <button
                  onClick={onToggleMute}
                  className="rounded-lg border border-slate-700 bg-slate-900/90 p-1.5 text-slate-300 hover:text-white transition"
                  title={soundEnabled ? 'Audio Alarm Active' : 'Audio Alarm Muted'}
                >
                  {soundEnabled ? (
                    <Volume2 className="h-4 w-4 text-teal-400" />
                  ) : (
                    <VolumeX className="h-4 w-4 text-rose-400" />
                  )}
                </button>
              </div>

              {/* Haptic Feedback Toggle */}
              {onToggleHaptics && (
                <button
                  onClick={onToggleHaptics}
                  className={`rounded-lg border p-1.5 transition flex items-center gap-1 ${
                    hapticsEnabled
                      ? 'border-sky-500/50 bg-sky-950/70 text-sky-300'
                      : 'border-slate-700 bg-slate-900/90 text-slate-500 hover:text-slate-300'
                  } ${hapticPulsing ? 'ring-2 ring-sky-400 animate-pulse' : ''}`}
                  title={hapticsEnabled ? 'Mobile/Wearable Haptic Feedback Active' : 'Haptic Feedback Disabled'}
                >
                  <Smartphone className="h-4 w-4" />
                  {hapticPulsing && (
                    <span className="text-[10px] font-mono text-sky-200">TACTILE</span>
                  )}
                </button>
              )}

              {/* Configure Thresholds & History Drawer */}
              <button
                onClick={onOpenAlertsDrawer}
                className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900/90 px-3 py-1.5 text-xs font-medium text-slate-200 hover:text-white hover:bg-slate-800 transition"
              >
                <Sliders className="h-3.5 w-3.5 text-teal-400" />
                <span>Limits &amp; Logs</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Reassuring Normal State Bar with Quick Test Simulation Options */
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800/80 bg-slate-900/60 px-4 py-2.5 text-xs">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle className="h-3.5 w-3.5" />
            </div>
            <div>
              <span className="font-semibold text-slate-200">
                Cellular Safety Telemetry: Nominal
              </span>
              <span className="text-slate-400 ml-2 hidden sm:inline">
                All micro-ECG, wall stress, and nanogrid parameters within IEC 60601-1-8 envelopes
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Audio State Indicator & Volume */}
            <div className="flex items-center gap-1.5 text-slate-400">
              <button
                onClick={onToggleMute}
                className="flex items-center gap-1 rounded px-2 py-1 hover:bg-slate-800 text-slate-300 transition"
                title={soundEnabled ? 'Auditory alarm active' : 'Auditory alarm muted'}
              >
                {soundEnabled ? (
                  <Volume2 className="h-3.5 w-3.5 text-teal-400" />
                ) : (
                  <VolumeX className="h-3.5 w-3.5 text-rose-400" />
                )}
                <span className="text-[11px] font-mono">
                  {soundEnabled ? `${Math.round(volume * 100)}%` : 'Muted'}
                </span>
              </button>
            </div>

            {/* Test Simulation Controls */}
            {canRunSimulation && <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase px-1.5 font-mono">Test Alert:</span>
              <button
                onClick={() => onTriggerSimulation('WALL_STRESS')}
                className="rounded px-2 py-0.5 text-[11px] font-medium text-rose-300 hover:bg-rose-950/60 transition"
                title="Simulate acute border zone wall stress breach (> 18.0 kPa)"
              >
                Wall Stress Breach
              </button>
              <button
                onClick={() => onTriggerSimulation('ARRHYTHMIA_SHIELD')}
                className="rounded px-2 py-0.5 text-[11px] font-medium text-amber-300 hover:bg-amber-950/60 transition"
                title="Simulate nanogrid conduction velocity drop (< 0.45 m/s)"
              >
                Conduction Drop
              </button>
            </div>}

            {/* Limits & Logs */}
            <button
              onClick={onOpenAlertsDrawer}
              className="flex items-center gap-1 rounded border border-slate-800 bg-slate-950 px-2.5 py-1 text-slate-300 hover:text-white hover:border-slate-700 transition"
            >
              <Sliders className="h-3 w-3 text-teal-400" />
              <span>Limits &amp; History</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
