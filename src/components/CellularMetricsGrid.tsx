/**
 * Cellular Activity & Structural Remodeling Parameters Grid
 * Displays real-time biophysical telemetry of cellular reprogramming,
 * single-cell impedance spectroscopy, and tissue elasticity kinetics.
 */

import React from 'react';
import {
  TrendingDown,
  TrendingUp,
  Activity,
  Gauge,
  Zap,
  Target,
  Waves,
  HeartPulse,
} from 'lucide-react';
import { CellularSensorMetrics, PatientProfile } from '../types/bdcmr';

interface CellularMetricsGridProps {
  cellular: CellularSensorMetrics;
  patient: PatientProfile;
}

export const CellularMetricsGrid: React.FC<CellularMetricsGridProps> = ({
  cellular,
  patient,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {/* 1. Tissue Stiffness (Young's Modulus) */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Tissue Stiffness</span>
            <Gauge className="h-3.5 w-3.5 text-amber-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xl font-bold font-mono text-amber-300">
              {cellular.youngsModulusKPa.toFixed(1)}
            </span>
            <span className="text-xs text-slate-400">kPa</span>
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
          <span className="text-slate-400">Baseline: 34.0</span>
          <span className="text-emerald-400 flex items-center gap-0.5">
            <TrendingDown className="h-3 w-3" />
            <span>Softening</span>
          </span>
        </div>
      </div>

      {/* 2. iCM Transdifferentiation Rate */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>iCM Lineage Conversion</span>
            <Target className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xl font-bold font-mono text-emerald-400">
              {cellular.iCMConversionEstimate.toFixed(1)}
            </span>
            <span className="text-xs text-slate-400">%</span>
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
          <span className="text-slate-400">Target: 75%</span>
          <span className="text-teal-400 flex items-center gap-0.5">
            <TrendingUp className="h-3 w-3" />
            <span>Reprogramming</span>
          </span>
        </div>
      </div>

      {/* 3. Single-Cell Impedance Magnitude */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Cellular Impedance |Z|</span>
            <Waves className="h-3.5 w-3.5 text-teal-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xl font-bold font-mono text-teal-300">
              {cellular.singleCellImpedanceMagnitude}
            </span>
            <span className="text-xs text-slate-400">Ω</span>
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
          <span className="text-slate-400">Phase: {cellular.singleCellImpedancePhaseDeg}°</span>
          <span className="text-teal-400 font-mono">Cx43 Formed</span>
        </div>
      </div>

      {/* 4. Local Systolic Wall Stress */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Systolic Wall Stress</span>
            <Activity className="h-3.5 w-3.5 text-sky-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xl font-bold font-mono text-sky-300">
              {cellular.wallStressKPa.toFixed(1)}
            </span>
            <span className="text-xs text-slate-400">kPa</span>
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
          <span className="text-slate-400">Strain: {cellular.wallStrainPercent}%</span>
          <span className="text-emerald-400">Unloaded</span>
        </div>
      </div>

      {/* 5. Action Potential Duration (APD90) */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Action Potential APD90</span>
            <Zap className="h-3.5 w-3.5 text-purple-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xl font-bold font-mono text-purple-300">
              {cellular.actionPotentialDuration90Ms}
            </span>
            <span className="text-xs text-slate-400">ms</span>
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
          <span className="text-slate-400">Normal: 280-310</span>
          <span className="text-purple-400">Synchronous</span>
        </div>
      </div>

      {/* 6. Intracellular Calcium Flux (ΔF/F0) */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Calcium Transient (Ca²⁺)</span>
            <HeartPulse className="h-3.5 w-3.5 text-rose-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xl font-bold font-mono text-rose-300">
              {cellular.calciumTransientAmplitude.toFixed(2)}
            </span>
            <span className="text-xs text-slate-400">ΔF/F₀</span>
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
          <span className="text-slate-400">E-C Coupling:</span>
          <span className="text-emerald-400">Active Beats</span>
        </div>
      </div>
    </div>
  );
};
