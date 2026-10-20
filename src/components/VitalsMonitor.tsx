/**
 * Patient Hemodynamics & Clinical Remodeling Vitals Bar
 * Displays real-time hemodynamics, cardiac output, LVEF recovery,
 * and scar contraction metrics.
 */

import React from 'react';
import { Heart, Activity, Droplets, Thermometer, ArrowUpRight } from 'lucide-react';
import { PatientProfile, PatientVitals } from '../types/bdcmr';

interface VitalsMonitorProps {
  vitals: PatientVitals;
  patient: PatientProfile;
}

export const VitalsMonitor: React.FC<VitalsMonitorProps> = ({ vitals, patient }) => {
  const lvefDelta = patient.currentLVEF - patient.baselineLVEF;
  const scarReductionPercent = (
    ((patient.baselineScarAreaCm2 - patient.currentScarAreaCm2) / patient.baselineScarAreaCm2) *
    100
  ).toFixed(1);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div>
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <Heart className="h-4 w-4 text-rose-500 animate-pulse" />
            <span>Hemodynamics & Functional Ventricular Recovery</span>
          </h3>
          <div className="text-xs text-slate-400 mt-0.5">
            Continuous ICU telemetry synchronized to bedside invasive arterial line & pulmonary catheter
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-400">Post-Infarct Day:</span>
          <span className="font-semibold text-teal-300">Day {patient.postInfarcDay}</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span className="text-slate-400">Scar Contraction:</span>
          <span className="text-emerald-400 font-semibold">-{scarReductionPercent}%</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-3">
        {/* Heart Rate */}
        <div className="rounded-lg bg-slate-950 p-2.5 border border-slate-800">
          <div className="text-[11px] text-slate-400">Heart Rate (HR)</div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono text-emerald-400">
              {vitals.heartRateBpm}
            </span>
            <span className="text-xs text-slate-400 font-mono">BPM</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Sinus Synchronized</div>
        </div>

        {/* Arterial Blood Pressure & MAP */}
        <div className="rounded-lg bg-slate-950 p-2.5 border border-slate-800">
          <div className="text-[11px] text-slate-400">Arterial BP / MAP</div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono text-slate-100">
              {vitals.systolicBp}/{vitals.diastolicBp}
            </span>
            <span className="text-xs text-slate-400 font-mono">mmHg</span>
          </div>
          <div className="text-[10px] text-teal-400 font-mono mt-0.5">
            MAP: {vitals.meanArterialPressure} mmHg
          </div>
        </div>

        {/* Ejection Fraction (LVEF) Recovery */}
        <div className="rounded-lg bg-slate-950 p-2.5 border border-slate-800">
          <div className="text-[11px] text-slate-400">Ejection Fraction (LVEF)</div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono text-emerald-400">
              {patient.currentLVEF}%
            </span>
            <span className="text-xs font-mono text-emerald-400 flex items-center">
              (+{lvefDelta.toFixed(1)}%)
            </span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Baseline: {patient.baselineLVEF}%
          </div>
        </div>

        {/* Cardiac Output & Index */}
        <div className="rounded-lg bg-slate-950 p-2.5 border border-slate-800">
          <div className="text-[11px] text-slate-400">Cardiac Output (CO)</div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono text-teal-300">
              {vitals.cardiacOutputLMin}
            </span>
            <span className="text-xs text-slate-400 font-mono">L/min</span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
            CI: {vitals.cardiacIndexLMinM2} L/min/m²
          </div>
        </div>

        {/* Scar Core Area (Remodeling Tracking) */}
        <div className="rounded-lg bg-slate-950 p-2.5 border border-slate-800">
          <div className="text-[11px] text-slate-400">Scar Core Area</div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono text-amber-300">
              {patient.currentScarAreaCm2}
            </span>
            <span className="text-xs text-slate-400 font-mono">cm²</span>
          </div>
          <div className="text-[10px] text-emerald-400 mt-0.5 font-mono">
            Orig: {patient.baselineScarAreaCm2} cm²
          </div>
        </div>

        {/* Biomarkers / Serum K+ & Troponin */}
        <div className="rounded-lg bg-slate-950 p-2.5 border border-slate-800">
          <div className="text-[11px] text-slate-400">Biomarkers (K+ / cTnI)</div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono text-sky-300">
              {vitals.serumPotassiumMmolL}
            </span>
            <span className="text-xs text-slate-400 font-mono">mmol/L</span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
            cTnI: {vitals.cardiacTroponinNgMl} ng/mL
          </div>
        </div>
      </div>
    </div>
  );
};
