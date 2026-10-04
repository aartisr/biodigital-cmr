/**
 * Safety Thresholds Configuration & Alarm Event History Modal
 * Provides interactive sliders to calibrate safety envelopes, volume controls,
 * test chime triggers, and an immutable log of past alert events.
 */

import React, { useState } from 'react';
import {
  X,
  Sliders,
  Volume2,
  VolumeX,
  RotateCcw,
  Bell,
  ShieldAlert,
  CheckCircle,
  Play,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { ActiveAlert, AlertRule, AlertSeverity } from '../types/alerts';
import { audioAlarmService } from '../services/audioAlarmService';

interface AlertsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  rules: AlertRule[];
  onUpdateThreshold: (ruleId: string, val: number) => void;
  alertHistory: ActiveAlert[];
  volume: number;
  onChangeVolume: (vol: number) => void;
  soundEnabled: boolean;
  onToggleMute: () => void;
  onTriggerSimulation: (type: 'WALL_STRESS' | 'ARRHYTHMIA_SHIELD' | 'CLEAR') => void;
  /** Presentation mode only; server-side policy must authorize any real configuration. */
  interactionMode?: 'REVIEW' | 'SANDBOX';
}

export const AlertsDrawer: React.FC<AlertsDrawerProps> = ({
  isOpen,
  onClose,
  rules,
  onUpdateThreshold,
  alertHistory,
  volume,
  onChangeVolume,
  soundEnabled,
  onToggleMute,
  onTriggerSimulation,
  interactionMode = 'SANDBOX',
}) => {
  const [activeTab, setActiveTab] = useState<'THRESHOLDS' | 'HISTORY'>('THRESHOLDS');
  const canConfigure = interactionMode === 'SANDBOX';

  if (!isOpen) return null;

  const handleTestChime = (severity: AlertSeverity) => {
    audioAlarmService.enableAudio();
    audioAlarmService.triggerAlarmChime(severity, true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="flex h-[88vh] w-full max-w-4xl flex-col rounded-xl border border-slate-800 bg-slate-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/30">
              <ShieldAlert className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">
                Clinical Safety Thresholds & Alarm Management System
              </h3>
              <p className="text-xs text-slate-400">
                Calibrate IEC 60601-1-8 visual &amp; auditory warning limits and audit past alerts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Switcher & Audio Quick Controls */}
        <div className="flex flex-wrap items-center justify-between border-b border-slate-800 bg-slate-950 px-6 py-2.5 text-xs">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('THRESHOLDS')}
              className={`rounded-md px-3.5 py-1.5 font-medium transition ${
                activeTab === 'THRESHOLDS'
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Configurable Safety Thresholds ({rules.length})
            </button>
            <button
              onClick={() => setActiveTab('HISTORY')}
              className={`rounded-md px-3.5 py-1.5 font-medium transition ${
                activeTab === 'HISTORY'
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Alarm Audit History ({alertHistory.length})
            </button>
          </div>

          {/* Audio Chime Test Buttons */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={onToggleMute}
                className="text-slate-400 hover:text-white transition"
                title={soundEnabled ? 'Mute Chimes' : 'Unmute Chimes'}
              >
                {soundEnabled ? (
                  <Volume2 className="h-4 w-4 text-teal-400" />
                ) : (
                  <VolumeX className="h-4 w-4 text-rose-400" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => onChangeVolume(Number(e.target.value))}
                className="w-20 accent-teal-400 cursor-pointer"
                title={`Volume: ${Math.round(volume * 100)}%`}
              />
            </div>

            {canConfigure && <div className="flex items-center gap-1.5 pl-2 border-l border-slate-800">
              <span className="text-slate-500 text-[11px]">Test Tone:</span>
              <button
                onClick={() => handleTestChime('CRITICAL')}
                className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 transition text-[11px] font-medium"
              >
                Critical (Triad)
              </button>
              <button
                onClick={() => handleTestChime('WARNING')}
                className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 transition text-[11px] font-medium"
              >
                Warning (2-Tone)
              </button>
            </div>}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 text-xs">
          {activeTab === 'THRESHOLDS' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-slate-300 pb-2 border-b border-slate-800">
                <span>{canConfigure ? 'Adjusting these limits alters real-time trigger boundaries for visual banners and harmonic audio alarms.' : 'Configured thresholds are shown for review only in this role experience.'}</span>
                {canConfigure && <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      rules.forEach((r) => onUpdateThreshold(r.id, r.defaultThreshold));
                    }}
                    className="flex items-center gap-1 text-[11px] text-teal-400 hover:text-teal-300 transition"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Reset All to IEC Defaults</span>
                  </button>
                </div>}
              </div>

              {/* Threshold Sliders Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rules.map((rule) => {
                  const isCritical = rule.severity === 'CRITICAL';
                  const min = rule.operator === 'LESS_THAN' ? 0 : rule.defaultThreshold * 0.5;
                  const max = rule.operator === 'LESS_THAN' ? rule.defaultThreshold * 1.5 : rule.defaultThreshold * 2;
                  const step = rule.defaultThreshold > 100 ? 10 : rule.defaultThreshold > 10 ? 1 : 0.05;

                  return (
                    <div
                      key={rule.id}
                      className="rounded-lg border border-slate-800 bg-slate-950 p-3.5 space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-semibold text-slate-200 flex items-center gap-2">
                          <span
                            className={`h-2 w-2 rounded-full ${
                              isCritical ? 'bg-rose-500 animate-pulse' : 'bg-amber-400'
                            }`}
                          />
                          <span>{rule.displayName}</span>
                        </div>
                        <span
                          className={`font-mono text-[11px] font-bold px-1.5 py-0.5 rounded ${
                            isCritical
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {rule.severity}
                        </span>
                      </div>

                      <div className="flex items-baseline justify-between font-mono">
                        <span className="text-slate-400 text-[11px]">
                          Condition: {rule.operator === 'GREATER_THAN' ? '>' : '<'} Limit
                        </span>
                        <span className="text-base font-bold text-teal-300">
                          {rule.currentThreshold} {rule.unit}
                        </span>
                      </div>

                      <input
                        disabled={!canConfigure}
                        type="range"
                        min={min}
                        max={max}
                        step={step}
                        value={rule.currentThreshold}
                        onChange={(e) => onUpdateThreshold(rule.id, Number(e.target.value))}
                        className="w-full accent-teal-400 cursor-pointer disabled:cursor-not-allowed disabled:opacity-55"
                      />

                      <div className="text-[11px] text-slate-400 leading-relaxed italic">
                        {rule.clinicalRationale}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Simulation Sandbox Box */}
              {canConfigure && <div className="mt-6 rounded-lg border border-slate-800 bg-slate-950 p-4">
                <div className="font-semibold text-slate-200 mb-1 flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-teal-400" />
                  <span>Clinical Simulation Sandbox (Instant Test)</span>
                </div>
                <p className="text-slate-400 text-[11px] mb-3">
                  Inject simulated pathological anomalies into the telemetry stream to evaluate ICU clinician response time, visual flashing, and auditory triad harmonics:
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => onTriggerSimulation('WALL_STRESS')}
                    className="rounded bg-rose-500/20 border border-rose-500/40 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/30 transition"
                  >
                    Simulate Acute Wall Stress Surge (23.4 kPa)
                  </button>
                  <button
                    onClick={() => onTriggerSimulation('ARRHYTHMIA_SHIELD')}
                    className="rounded bg-amber-500/20 border border-amber-500/40 px-3 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-500/30 transition"
                  >
                    Simulate Nanogrid Conduction Block (0.32 m/s)
                  </button>
                  <button
                    onClick={() => onTriggerSimulation('CLEAR')}
                    className="rounded border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition"
                  >
                    Clear Active Simulation
                  </button>
                </div>
              </div>}
            </div>
          )}

          {activeTab === 'HISTORY' && (
            <div className="space-y-3">
              <div className="text-slate-300 pb-2 border-b border-slate-800">
                Log of all safety threshold triggers and clinician acknowledgments during this session.
              </div>

              {alertHistory.length === 0 ? (
                <div className="py-12 text-center text-slate-500 font-mono">
                  No alert breach events recorded in active session.
                </div>
              ) : (
                alertHistory.map((item, idx) => (
                  <div
                    key={`${item.id}-${idx}`}
                    className="rounded-lg border border-slate-800 bg-slate-950 p-3 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-2.5 w-2.5 rounded-full ${
                          item.severity === 'CRITICAL' ? 'bg-rose-500' : 'bg-amber-400'
                        }`}
                      />
                      <div>
                        <div className="font-semibold text-slate-200">{item.metricName}</div>
                        <div className="text-slate-400 text-[11px] mt-0.5">{item.message}</div>
                      </div>
                    </div>

                    <div className="text-right font-mono text-[11px] text-slate-400">
                      <div>{new Date(item.timestamp).toLocaleTimeString()}</div>
                      <div className="text-teal-400">{item.severity}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-800 bg-slate-950 px-6 py-3 text-xs text-slate-400">
          <span>Compliant with ANSI/AAMI/IEC 60601-1-8 Medical Device Alarms</span>
          <button
            onClick={onClose}
            className="rounded bg-teal-500 px-4 py-1.5 font-medium text-slate-950 hover:bg-teal-400 transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
