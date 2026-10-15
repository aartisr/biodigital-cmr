/**
 * BD-CMR Clinical Protocol & Breakthrough Architecture Reference
 * Displays Phase A, B, C platform lifecycles and Standard of Care comparative matrix.
 */

import React, { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp, Check, Shield, Dna, Zap, Cpu } from 'lucide-react';

export const ClinicalProtocolReference: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 transition-all">
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex cursor-pointer items-center justify-between gap-3 select-none"
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/30">
            <BookOpen className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-100">
              BD-CMR Clinical Protocol & Regenerative Lifecycle Architecture
            </h4>
            <div className="text-xs text-slate-400">
              Phase A (Target Mapping) · Phase B (Intervention & Pacing) · Phase C (Structural Monitoring)
            </div>
          </div>
        </div>

        <button className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition">
          <span>{isExpanded ? 'Hide Protocol Details' : 'View Protocol Details'}</span>
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-4 text-xs text-slate-300">
          {/* Phase A, B, C Lifecycle */}
          <div>
            <div className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-2">
              System Architecture & Platform Lifecycle
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
                <div className="flex items-center gap-1.5 font-semibold text-teal-300 mb-1">
                  <Cpu className="h-3.5 w-3.5" />
                  <span>Phase A: Target Mapping</span>
                </div>
                <div className="text-[11px] text-slate-400 mb-2">
                  Inputs: 4D Cardiac MRI, Speckle-Tracking Echo, Spatial Transcriptomics
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  PINN algorithms construct patient-specific cardiac digital twins, modeling mechanical wall strain, stress tensors, and pinpointing millimeter-scale border zones for LNP coordinates and nanogrid alignment.
                </p>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
                <div className="flex items-center gap-1.5 font-semibold text-teal-300 mb-1">
                  <Zap className="h-3.5 w-3.5" />
                  <span>Phase B: Intervention</span>
                </div>
                <div className="text-[11px] text-slate-400 mb-2">
                  Inputs: Micro-ECG, localized impedance, wall strain analytics
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  Real-time telemetry regulates synthetic mRNA LNP micro-dosing (GMT/GHMT) while the soft PEDOT:PSS nanogrid delivers sub-threshold biomimetic pacing to condition emerging iCMs into synchronous beating.
                </p>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
                <div className="flex items-center gap-1.5 font-semibold text-teal-300 mb-1">
                  <Dna className="h-3.5 w-3.5" />
                  <span>Phase C: Structural Monitoring</span>
                </div>
                <div className="text-[11px] text-slate-400 mb-2">
                  Inputs: Tissue stiffness (Young&apos;s Modulus), velocity vector imaging
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  Predictive engine continuously tracks the rate at which dense collagenous scar converts into functional contractile muscle, adjusting electrical and biochemical stimuli daily without manual recalibration.
                </p>
              </div>
            </div>
          </div>

          {/* Paradigm Shift Comparison Matrix */}
          <div>
            <div className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-2">
              Paradigm Shift: Current Standard vs. BD-CMR System
            </div>
            <div className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-950">
              <table className="w-full text-left text-[11px]">
                <thead className="border-b border-slate-800 bg-slate-900/60 font-medium text-slate-300">
                  <tr>
                    <th className="py-2 px-3">Dimension</th>
                    <th className="py-2 px-3 text-slate-400">Current Standard of Care</th>
                    <th className="py-2 px-3 text-teal-300">BD-CMR Breakthrough System</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                  <tr>
                    <td className="py-2 px-3 font-sans font-medium text-slate-400">Primary Objective</td>
                    <td className="py-2 px-3 text-slate-400">Disease management; slowing post-MI failure progression</td>
                    <td className="py-2 px-3 text-teal-300">Active tissue reversal; structural regeneration of myocardium</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-sans font-medium text-slate-400">Cellular Target</td>
                    <td className="py-2 px-3 text-slate-400">Systemic neurohormonal blockade (Beta-blockers, ACEi)</td>
                    <td className="py-2 px-3 text-teal-300">Direct in situ reprogramming of scar fibroblasts to iCMs</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-sans font-medium text-slate-400">Delivery & Arrhythmia Risk</td>
                    <td className="py-2 px-3 text-slate-400">Low stem cell engraftment (&lt;1%), high ventricular arrhythmia risk</td>
                    <td className="py-2 px-3 text-teal-300">Non-viral LNP mRNA backed by active conductive nanogrid shield</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-sans font-medium text-slate-400">Feedback Mechanism</td>
                    <td className="py-2 px-3 text-slate-400">Open-loop care; static doses with periodic clinic visits</td>
                    <td className="py-2 px-3 text-teal-300">Closed-loop adaptive care; continuous single-cell sensing &amp; micro-dosing</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
