/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Top Telemetry Ribbon & Persona Policy Bar
 * Precision scientific instrument header displaying simulation run-time,
 * physiological telemetry KPIs, and clinical persona selection.
 */

import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  UserCheck,
} from 'lucide-react';
import { BDCMREngineState, PersonaType } from '../../types/bdcmr';

interface TopTelemetryRibbonProps {
  state: BDCMREngineState;
  onTogglePlay: () => void;
  onResetSimulation: () => void;
  onSelectPersona: (persona: PersonaType) => void;
}

export const TopTelemetryRibbon: React.FC<TopTelemetryRibbonProps> = ({
  state,
  onTogglePlay,
  onResetSimulation,
  onSelectPersona,
}) => {
  // Format elapsed time in mm:ss.s
  const elapsedSec = (state.simulationTimeMs / 1000).toFixed(1);

  return (
    <div className="w-full bg-slate-900 text-slate-100 border-b border-slate-800 px-4 py-2.5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-mono">
      {/* Zone 1: Run State & Elapsed Time */}
      <div className="flex items-center gap-3 shrink-0 flex-wrap">
        <div className="flex items-center gap-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              state.isRunning ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
            }`}
          />
          <span className="font-semibold text-white tracking-wider uppercase text-[11px]">
            {state.isRunning ? 'CLOSED-LOOP RUNTIME' : 'SIMULATION FROZEN'}
          </span>
          <span className="text-slate-400">·</span>
          <span className="text-slate-300 tabular-nums">T+{elapsedSec}s</span>
        </div>

        <div className="flex items-center gap-1.5 ml-2">
          <button
            onClick={onTogglePlay}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded border border-slate-700 flex items-center gap-1 transition-colors"
          >
            {state.isRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            {state.isRunning ? 'Pause' : 'Resume'}
          </button>
          <button
            onClick={onResetSimulation}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded border border-slate-700 flex items-center gap-1 transition-colors"
            title="Reset to acute STEMI infarct baseline"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        </div>
      </div>

      {/* Zone 2: Real-Time Physiological Telemetry Strip */}
      <div className="flex items-center gap-4 text-xs overflow-x-auto py-1">
        <div className="flex items-baseline gap-1">
          <span className="text-slate-400 text-[10px] uppercase">HR:</span>
          <span className="font-bold text-white tabular-nums">{state.heartRateBpm}</span>
          <span className="text-slate-500 text-[10px]">BPM</span>
        </div>

        <div className="flex items-baseline gap-1">
          <span className="text-slate-400 text-[10px] uppercase">ΔST:</span>
          <span
            className={`font-bold tabular-nums ${
              state.stElevationMv > 0.15
                ? 'text-rose-400'
                : state.stElevationMv > 0.05
                ? 'text-amber-400'
                : 'text-emerald-400'
            }`}
          >
            {state.stElevationMv > 0 ? `+${state.stElevationMv.toFixed(2)}` : state.stElevationMv.toFixed(2)}
          </span>
          <span className="text-slate-500 text-[10px]">mV</span>
        </div>

        <div className="flex items-baseline gap-1">
          <span className="text-slate-400 text-[10px] uppercase">EF:</span>
          <span className="font-bold text-sky-400 tabular-nums">
            {state.ejectionFractionPercent}%
          </span>
        </div>

        <div className="flex items-baseline gap-1">
          <span className="text-slate-400 text-[10px] uppercase">Rescue:</span>
          <span className="font-bold text-emerald-400 tabular-nums">
            {state.infarctRescueProgressPercent}%
          </span>
        </div>

        <div className="flex items-baseline gap-1">
          <span className="text-slate-400 text-[10px] uppercase">Tunnel Flux:</span>
          <span className="font-bold text-teal-400 tabular-nums">
            {state.quantumTunneling.electronFluxPicoAmps.toFixed(1)}
          </span>
          <span className="text-slate-500 text-[10px]">pA</span>
        </div>
      </div>

      {/* Zone 3: Active Persona Switcher */}
      <div className="flex items-center gap-1.5 shrink-0 bg-slate-800/80 p-1 rounded-lg border border-slate-700">
        <UserCheck className="w-3.5 h-3.5 text-slate-400 ml-1" />
        <span className="text-[11px] text-slate-400 uppercase hidden sm:inline">Persona:</span>
        {(
          [
            { id: 'cardiologist', label: 'Cardiologist' },
            { id: 'bioelectronics_engineer', label: 'Bioelectronics' },
            { id: 'quantum_biophysicist', label: 'Biophysicist' },
            { id: 'regulatory_auditor', label: 'Auditor' },
          ] as const
        ).map((p) => (
          <button
            key={p.id}
            onClick={() => onSelectPersona(p.id)}
            className={`px-2 py-0.5 text-[11px] font-medium rounded transition-colors whitespace-nowrap ${
              state.activePersona === p.id
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
};
