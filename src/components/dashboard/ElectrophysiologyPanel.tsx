/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Electrophysiology Telemetry Panel
 * Detailed sub-cellular electrophysiological readouts:
 * V_m, APD90, Conduction Velocity, Intracellular Calcium, and Sarcomere shortening.
 */

import React from 'react';
import { Zap, Heart, Gauge } from 'lucide-react';
import { ElectrophysiologyTelemetry } from '../../types/bdcmr';

interface ElectrophysiologyPanelProps {
  telemetry: ElectrophysiologyTelemetry;
  ejectionFractionPercent: number;
  viabilityPercent: number;
}

export const ElectrophysiologyPanel: React.FC<ElectrophysiologyPanelProps> = ({
  telemetry,
  ejectionFractionPercent,
  viabilityPercent,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-500 shrink-0" />
          <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
            Sub-Cellular Electrophysiology Telemetry
          </h3>
        </div>
        <div className="text-xs text-slate-500 font-mono">
          Sampling: 1.0 kHz · Membrane Model: Ten Tusscher / Luo-Rudy
        </div>
      </div>

      {/* Grid of Key Physiological Quantities */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {/* Metric 1: V_m */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-col justify-between">
          <span className="text-[11px] uppercase tracking-wider text-slate-500 font-mono">
            Membrane Potential (V_m)
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {telemetry.membranePotentialMv > 0 ? `+${telemetry.membranePotentialMv}` : telemetry.membranePotentialMv}
            </span>
            <span className="text-xs font-mono text-slate-500">mV</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1">
            Resting Target: -85.0 mV
          </span>
        </div>

        {/* Metric 2: APD90 */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-col justify-between">
          <span className="text-[11px] uppercase tracking-wider text-slate-500 font-mono">
            APD90 Repolarization
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {telemetry.actionPotentialDuration90Ms}
            </span>
            <span className="text-xs font-mono text-slate-500">ms</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1">
            Refractory: {telemetry.refractoryPeriodMs} ms
          </span>
        </div>

        {/* Metric 3: Conduction Velocity */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-col justify-between">
          <span className="text-[11px] uppercase tracking-wider text-slate-500 font-mono">
            Conduction Velocity (CV)
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-bold font-mono text-sky-700 tabular-nums">
              {telemetry.conductionVelocityCmS}
            </span>
            <span className="text-xs font-mono text-slate-500">cm/s</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1">
            {telemetry.conductionVelocityCmS >= 50 ? '● Normal Syncytial Speed' : '▲ Slowed Border Zone'}
          </span>
        </div>

        {/* Metric 4: [Ca2+]i */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-col justify-between">
          <span className="text-[11px] uppercase tracking-wider text-slate-500 font-mono">
            Intracellular [Ca²⁺]
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {telemetry.calciumTransientPeakUm}
            </span>
            <span className="text-xs font-mono text-slate-500">μM</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1">
            Diastolic baseline ~0.10 μM
          </span>
        </div>

        {/* Metric 5: Sarcomere Shortening */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-col justify-between">
          <span className="text-[11px] uppercase tracking-wider text-slate-500 font-mono">
            Fractional Shortening
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {(telemetry.sarcomereShorteningFraction * 100).toFixed(1)}
            </span>
            <span className="text-xs font-mono text-slate-500">%</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1">
            Microscopic Contractility
          </span>
        </div>

        {/* Metric 6: Ejection Fraction */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-col justify-between">
          <span className="text-[11px] uppercase tracking-wider text-slate-500 font-mono">
            Left Ventricular EF
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-bold font-mono text-emerald-700 tabular-nums">
              {ejectionFractionPercent}
            </span>
            <span className="text-xs font-mono text-slate-500">%</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1">
            Viability: {viabilityPercent}%
          </span>
        </div>
      </div>
    </div>
  );
};
