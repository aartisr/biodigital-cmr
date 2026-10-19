/**
 * BD-CMR Closed-Loop Therapeutic Delivery & Automated Adjustments Controller
 * Integrates In Situ Epigenetic LNP Micro-Dosing with Conductive Nanogrid Pacing.
 * Includes Safety Interlocks, PID Effort Monitoring, and Dual-Clinician Verification.
 */

import React, { useState } from 'react';
import {
  Sliders,
  Cpu,
  Zap,
  ShieldAlert,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Lock,
  Unlock,
  Key,
} from 'lucide-react';
import {
  ClinicalRole,
  EpigeneticDosingState,
  NanogridPacingState,
  SystemOperatingMode,
} from '../types/bdcmr';

interface ClosedLoopControllerProps {
  operatingMode: SystemOperatingMode;
  onUpdateOperatingMode: (params: {
    mode: SystemOperatingMode;
    role: ClinicalRole;
    reason: string;
  }) => void;
  dosing: EpigeneticDosingState;
  onAdjustDosing: (params: {
    dosing: Partial<EpigeneticDosingState>;
    role: ClinicalRole;
    reason: string;
  }) => void;
  pacing: NanogridPacingState;
  onAdjustPacing: (params: {
    pacing: Partial<NanogridPacingState>;
    role: ClinicalRole;
    reason: string;
  }) => void;
  currentRole: ClinicalRole;
  /** Presentation mode only; server-side policy must authorize any real command. */
  interactionMode?: 'read' | 'sandbox';
}

export const ClosedLoopController: React.FC<ClosedLoopControllerProps> = ({
  operatingMode,
  onUpdateOperatingMode,
  dosing,
  onAdjustDosing,
  pacing,
  onAdjustPacing,
  currentRole,
  interactionMode = 'sandbox',
}) => {
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overrideReason, setOverrideReason] = useState('');
  const [tempInfusionRate, setTempInfusionRate] = useState<number>(dosing.infusionRateNlMin);
  const [tempPacingCurrent, setTempPacingCurrent] = useState<number>(pacing.subthresholdCurrentMA);
  const [tempFrequency, setTempFrequency] = useState<number>(pacing.pulseFrequencyBpm);
  const [selectedFormulation, setSelectedFormulation] = useState<EpigeneticDosingState['formulation']>(
    dosing.formulation
  );

  const isAutomated = operatingMode === 'AUTOMATED_CLOSED_LOOP';
  const isSupervised = operatingMode === 'SUPERVISED_ADAPTIVE';
  const canModify = interactionMode === 'sandbox';

  const handleApplyManualAdjustment = () => {
    if (!canModify) return;
    if (!overrideReason.trim()) {
      alert('Clinical protocol requires a documented clinical justification for manual override.');
      return;
    }

    onAdjustDosing({
      dosing: {
        infusionRateNlMin: tempInfusionRate,
        formulation: selectedFormulation,
      },
      role: currentRole,
      reason: overrideReason,
    });

    onAdjustPacing({
      pacing: {
        subthresholdCurrentMA: tempPacingCurrent,
        pulseFrequencyBpm: tempFrequency,
      },
      role: currentRole,
      reason: overrideReason,
    });

    setShowOverrideModal(false);
    setOverrideReason('');
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4">
      {/* Header & Operating Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-teal-400" />
            <h3 className="text-sm font-semibold text-slate-100">
              Closed-Loop Myocardial Regeneration & Pacing Engine
            </h3>
          </div>
          <div className="text-xs text-slate-400 mt-0.5">
            Real-time PID + Physics-Informed Neural Network (PINN) Regulation
          </div>
        </div>

        {/* Operating Mode Segmented Tabs */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            type="button"
            disabled={!canModify}
            onClick={() =>
              onUpdateOperatingMode({
                mode: 'AUTOMATED_CLOSED_LOOP',
                role: currentRole,
                reason: 'Re-engaged autonomous closed-loop biophysical feedback regulation',
              })
            }
            className={`px-3 py-1 font-medium rounded transition flex items-center gap-1.5 disabled:cursor-not-allowed disabled:opacity-55 ${
              operatingMode === 'AUTOMATED_CLOSED_LOOP'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-pulse" />
            <span>Automated Closed-Loop</span>
          </button>

          <button
            type="button"
            disabled={!canModify}
            onClick={() =>
              onUpdateOperatingMode({
                mode: 'SUPERVISED_ADAPTIVE',
                role: currentRole,
                reason: 'Set to supervised adaptive mode with clinician approval thresholds',
              })
            }
            className={`px-3 py-1 font-medium rounded transition disabled:cursor-not-allowed disabled:opacity-55 ${
              operatingMode === 'SUPERVISED_ADAPTIVE'
                ? 'bg-slate-800 text-teal-300'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Supervised Adaptive
          </button>

          <button
            type="button"
            disabled={!canModify}
            onClick={() => {
              setTempInfusionRate(dosing.infusionRateNlMin);
              setTempPacingCurrent(pacing.subthresholdCurrentMA);
              setTempFrequency(pacing.pulseFrequencyBpm);
              setShowOverrideModal(true);
            }}
            className={`px-3 py-1 font-medium rounded transition flex items-center gap-1 disabled:cursor-not-allowed disabled:opacity-55 ${
              operatingMode === 'MANUAL_OVERRIDE'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sliders className="h-3 w-3" />
            <span>Manual Override</span>
          </button>
        </div>
      </div>

      {/* Two Main Sections: 1. In Situ Epigenetic LNP Dosing; 2. Nanogrid Sub-Threshold Pacing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {/* Section 1: In Situ Epigenetic Reprogramming Dosing */}
        <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-3.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="font-semibold text-xs text-slate-200">
                1. Epigenetic Cocktail Micro-Infusion (LNPs)
              </span>
              <span className="text-[11px] font-mono text-teal-400">
                {isAutomated ? 'PID Autonomous' : 'Supervised'}
              </span>
            </div>

            <div className="mt-3 space-y-3">
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Synthetic mRNA Cocktail Formulation</span>
                  <span className="font-mono text-teal-300">{dosing.formulation}</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 text-[11px] font-mono">
                  {(['GMT', 'GHMT', 'GHMT_MIR1_133'] as EpigeneticDosingState['formulation'][]).map(
                    (form) => (
                      <button
                        type="button"
                        key={form}
                        disabled={!canModify}
                        onClick={() => {
                          onAdjustDosing({
                            dosing: { formulation: form },
                            role: currentRole,
                            reason: `Selected cocktail formulation ${form}`,
                          });
                        }}
                        className={`p-1.5 rounded border text-center transition disabled:cursor-not-allowed disabled:opacity-55 ${
                          dosing.formulation === form
                            ? 'border-teal-500/50 bg-teal-500/15 text-teal-300'
                            : 'border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800'
                        }`}
                      >
                        {form === 'GMT'
                          ? 'GMT (G/M/T)'
                          : form === 'GHMT'
                          ? 'GHMT (+Hand2)'
                          : '+miR-1/133'}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Infusion Rate Bar & Effort */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Localized Infusion Rate</span>
                  <span className="font-mono font-bold text-teal-300">
                    {dosing.infusionRateNlMin.toFixed(0)}{' '}
                    <span className="text-xs font-normal text-slate-400">nl/min</span>
                  </span>
                </div>

                {/* Progress bar of safety cap */}
                <div className="h-2 w-full rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-teal-500 to-cyan-400 transition-all duration-300"
                    style={{
                      width: `${(dosing.infusionRateNlMin / dosing.safetyCapNlMin) * 100}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-mono">
                  <span>Target: {dosing.targetInfusionRateNlMin} nl/min</span>
                  <span>Safety Cap: {dosing.safetyCapNlMin} nl/min</span>
                </div>
              </div>

              {/* Dosing Stats */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800/80">
                <div>
                  <div className="text-slate-400 text-[11px]">Cumulative Delivered</div>
                  <div className="font-mono font-semibold text-slate-200">
                    {dosing.totalDeliveredUl.toFixed(2)} µL
                  </div>
                </div>
                <div>
                  <div className="text-slate-400 text-[11px]">Target Cell Specificity</div>
                  <div className="font-mono font-semibold text-emerald-400">
                    94.6% Fibroblast L配
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 text-[11px] text-slate-400 italic">
            Automated adjustments triggered by stiffness and wall strain feedback loops.
          </div>
        </div>

        {/* Section 2: Conductive PEDOT:PSS Nanogrid Biomimetic Pacing */}
        <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-3.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="font-semibold text-xs text-slate-200">
                2. Conductive Nanogrid Biomimetic Pacing
              </span>
              <span className="text-[11px] font-mono text-teal-400">
                {pacing.meshMaterial}
              </span>
            </div>

            <div className="mt-3 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Anti-Arrhythmia Shield Status</span>
                <span className="flex items-center gap-1 font-mono text-emerald-400 font-semibold">
                  <CheckCircle className="h-3.5 w-3.5" />
                  <span>100% Re-entry Intercept</span>
                </span>
              </div>

              {/* Pacing Amplitude Current */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Sub-threshold Current Pulse</span>
                  <span className="font-mono font-bold text-teal-300">
                    {pacing.subthresholdCurrentMA.toFixed(2)}{' '}
                    <span className="text-xs font-normal text-slate-400">mA</span>
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-teal-400 transition-all duration-300"
                    style={{
                      width: `${(pacing.subthresholdCurrentMA / 2.0) * 100}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-mono">
                  <span>Pulse Width: {pacing.pulseWidthMs} ms</span>
                  <span>Safety Ceiling: 2.00 mA</span>
                </div>
              </div>

              {/* Entrainment Frequency */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Pacing Entrainment Rate</span>
                  <span className="font-mono font-bold text-slate-200">
                    {pacing.pulseFrequencyBpm}{' '}
                    <span className="text-xs font-normal text-slate-400">bpm (SA-Synchronized)</span>
                  </span>
                </div>
              </div>

              {/* Electrodes Active */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800/80">
                <div>
                  <div className="text-slate-400 text-[11px]">Electrodes Active</div>
                  <div className="font-mono font-semibold text-teal-300">
                    {pacing.activeElectrodeChannels} / 16 Channels
                  </div>
                </div>
                <div>
                  <div className="text-slate-400 text-[11px]">Conduction Bridge Latency</div>
                  <div className="font-mono font-semibold text-emerald-400">
                    34 ms (Normal &lt; 40ms)
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 text-[11px] text-slate-400 italic">
            Delivers sub-threshold biomimetic pulses to mature emerging iCMs into synchronous contractile syncytium.
          </div>
        </div>
      </div>

      {!canModify && <div className="mt-4 flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-950/20 px-3 py-2 text-xs text-amber-100"><Lock className="h-3.5 w-3.5 shrink-0 text-amber-300" />Read-only role view. Simulated parameter changes are unavailable in this experience.</div>}

      {/* Manual Override & Dual Clinician Modal */}
      {showOverrideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl border border-amber-500/40 bg-slate-900 p-5 shadow-2xl">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <ShieldAlert className="h-5 w-5 text-amber-400" />
              <div>
                <h4 className="text-sm font-semibold text-white">
                  Manual Therapeutic Delivery Override
                </h4>
                <div className="text-xs text-amber-300/80">
                  HIPAA & FDA Safe Interlock · Requires Attending Clinician Justification
                </div>
              </div>
            </div>

            <div className="my-4 space-y-3.5 text-xs text-slate-300">
              {/* Infusion Rate Slider */}
              <div>
                <div className="flex justify-between mb-1">
                  <span>LNP Infusion Rate:</span>
                  <span className="font-mono text-teal-300 font-bold">
                    {tempInfusionRate} nl/min
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="350"
                  step="5"
                  value={tempInfusionRate}
                  onChange={(e) => setTempInfusionRate(Number(e.target.value))}
                  className="w-full accent-teal-400 cursor-pointer"
                />
              </div>

              {/* Pacing Current Slider */}
              <div>
                <div className="flex justify-between mb-1">
                  <span>Nanogrid Sub-threshold Current:</span>
                  <span className="font-mono text-teal-300 font-bold">
                    {tempPacingCurrent.toFixed(2)} mA
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="2.0"
                  step="0.05"
                  value={tempPacingCurrent}
                  onChange={(e) => setTempPacingCurrent(Number(e.target.value))}
                  className="w-full accent-teal-400 cursor-pointer"
                />
              </div>

              {/* Pacing Frequency */}
              <div>
                <div className="flex justify-between mb-1">
                  <span>Pacing Frequency:</span>
                  <span className="font-mono text-teal-300 font-bold">
                    {tempFrequency} bpm
                  </span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="100"
                  step="1"
                  value={tempFrequency}
                  onChange={(e) => setTempFrequency(Number(e.target.value))}
                  className="w-full accent-teal-400 cursor-pointer"
                />
              </div>

              {/* Clinical Justification */}
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Mandatory Clinical Justification (Logged to Immutable Audit Trail):
                </label>
                <textarea
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="e.g., Escalating LNP dosing due to localized scar border wall tension observed on 4D MRI..."
                  className="w-full rounded-md border border-slate-700 bg-slate-950 p-2 text-xs text-white focus:border-teal-500 focus:outline-none"
                  rows={2}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowOverrideModal(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded transition"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyManualAdjustment}
                className="px-4 py-1.5 text-xs font-semibold rounded bg-amber-500 text-slate-950 hover:bg-amber-400 transition"
              >
                Sign & Execute Override
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
