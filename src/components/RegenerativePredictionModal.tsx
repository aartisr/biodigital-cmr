/**
 * Illustrative regeneration projection and sensitivity controls.
 */

import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Sliders,
  RotateCcw,
  ShieldCheck,
  Zap,
  Activity,
  Calendar,
  CheckCircle,
  Clock,
  ArrowRight,
  Info,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  CellularSensorMetrics,
  EpigeneticDosingState,
  NanogridPacingState,
  PatientProfile,
  PatientVitals,
} from '../types/bdcmr';
import {
  WhatIfParameters,
} from '../services/regenerativePredictionEngine';
import { regenerationProjectionService } from '../services/mi/runRegenerationProjection';
import { SimulationBoundaryNotice } from './ui/SimulationBoundaryNotice';
import { ModalShell } from './ui/ModalShell';

interface RegenerativePredictionModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: PatientProfile;
  cellular: CellularSensorMetrics;
  vitals: PatientVitals;
  dosing: EpigeneticDosingState;
  pacing: NanogridPacingState;
  allowWhatIf?: boolean;
}

const regenerationInputLabels: Readonly<Record<string, string>> = {
  phenotype: 'Structured infarct phenotype',
  validPhenotype: 'Valid structured infarct phenotype',
  'phenotype.phase': 'Established infarct phase',
  'phenotype.anatomy': 'Established ventricular anatomy',
  'phenotype.depth': 'Established infarct depth',
  currentLvefPercent: 'Current LVEF measurement',
  currentScarAreaCm2: 'Current scar-area measurement',
  tissueStiffnessKPa: 'Finite tissue-stiffness measurement',
  icmConversionPercent: 'Finite iCM conversion measurement',
  infusionRateNlMin: 'Positive infusion-rate setting',
  pacingCurrentMa: 'Positive pacing-current setting',
};

const displayInputName = (inputId: string): string => regenerationInputLabels[inputId] ?? inputId;

export const RegenerativePredictionModal: React.FC<RegenerativePredictionModalProps> = ({
  isOpen,
  onClose,
  patient,
  cellular,
  vitals,
  dosing,
  pacing,
  allowWhatIf = false,
}) => {
  const [horizonHours, setHorizonHours] = useState<number>(48);
  const [activeMetricTab, setActiveMetricTab] = useState<'STIFFNESS' | 'ICM' | 'LVEF'>('STIFFNESS');
  const [whatIf, setWhatIf] = useState<WhatIfParameters>({
    infusionRateMultiplier: 1.0,
    pacingCurrentMultiplier: 1.0,
  });

  const projectionResult = useMemo(() => {
    return regenerationProjectionService.project(patient, cellular, vitals, dosing, pacing, whatIf);
  }, [patient, cellular, vitals, dosing, pacing, whatIf]);
  const prediction = projectionResult.projection;

  if (!isOpen) return null;

  // Filter hourly points based on chosen horizon
  const filteredHourlyPoints = prediction?.hourlyPoints.filter((p) => p.hour <= horizonHours) ?? [];

  const handleResetWhatIf = () => {
    setWhatIf({ infusionRateMultiplier: 1.0, pacingCurrentMultiplier: 1.0 });
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="Regeneration Sensitivity Simulator (48-Hour)"
      description={`Patient ${patient.mrnTokenized} (${patient.patientFullNameMasked}) · Day ${patient.postInfarcDay} · ${patient.infarctLocation}`}
      maxWidthClassName="h-[92vh] max-w-5xl"
      labelledBy="regeneration-simulator-title"
    >
      <div className="bg-slate-900">
        <div className="border-b border-slate-800 bg-slate-950/70 px-6 py-2 text-right">
          <span className="rounded border border-emerald-500/30 bg-emerald-500/15 px-2 py-0.5 font-mono text-[10px] text-emerald-300">
            {projectionResult.descriptor.mode} · v{projectionResult.descriptor.modelVersion}
          </span>
        </div>

        {/* Prediction Parameter Toolbar */}
        {prediction && <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-slate-950/70 px-6 py-3 text-xs">
          {/* Horizon Selector */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-semibold flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-teal-400" />
              <span>Simulation Horizon:</span>
            </span>
            <div className="flex rounded-md border border-slate-800 bg-slate-900 p-0.5 font-mono">
              {[12, 24, 36, 48].map((h) => (
                <button
                  key={h}
                  onClick={() => setHorizonHours(h)}
                  className={`px-2.5 py-1 rounded text-xs transition ${
                    horizonHours === h
                      ? 'bg-teal-500 font-bold text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  +{h}h
                </button>
              ))}
            </div>
          </div>

          {/* Metric View Tabs */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-semibold mr-1">Trajectory:</span>
            <button
              onClick={() => setActiveMetricTab('STIFFNESS')}
              className={`px-3 py-1 rounded-md border text-xs font-medium transition ${
                activeMetricTab === 'STIFFNESS'
                  ? 'border-teal-500/50 bg-teal-500/15 text-teal-300'
                  : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              Tissue Softening (kPa)
            </button>
            <button
              onClick={() => setActiveMetricTab('ICM')}
              className={`px-3 py-1 rounded-md border text-xs font-medium transition ${
                activeMetricTab === 'ICM'
                  ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-300'
                  : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              iCM Transdifferentiation (%)
            </button>
            <button
              onClick={() => setActiveMetricTab('LVEF')}
              className={`px-3 py-1 rounded-md border text-xs font-medium transition ${
                activeMetricTab === 'LVEF'
                  ? 'border-sky-500/50 bg-sky-500/15 text-sky-300'
                  : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              Contractile Ejection (LVEF)
            </button>
          </div>
        </div>}

        {/* Modal Body */}
        <div className="space-y-4 p-6 text-xs">
          <SimulationBoundaryNotice kind="REGENERATION" />
          {!prediction ? (
            <section aria-labelledby="regeneration-unavailable-title" className="space-y-4 rounded-lg border border-amber-500/30 bg-amber-950/15 p-5">
              <div className="flex items-start gap-3">
                <Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
                <div className="space-y-1">
                  <h4 id="regeneration-unavailable-title" className="text-sm font-semibold text-amber-200">
                    Projection unavailable for this case
                  </h4>
                  <p className="text-slate-300">
                    No generic regeneration trajectory was generated. This model runs only when its structured scope and input requirements are satisfied.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h5 className="mb-1 font-semibold text-slate-200">Why it is unavailable</h5>
                  <ul className="list-disc space-y-1 pl-4 text-slate-300">
                    {projectionResult.applicability.reasons.map((reason) => <li key={reason}>{reason}</li>)}
                  </ul>
                </div>
                {projectionResult.applicability.missingInputs.length > 0 && (
                  <div>
                    <h5 className="mb-1 font-semibold text-slate-200">Information needed</h5>
                    <ul className="list-disc space-y-1 pl-4 text-slate-300">
                      {projectionResult.applicability.missingInputs.map((inputId) => <li key={inputId}>{displayInputName(inputId)}</li>)}
                    </ul>
                  </div>
                )}
              </div>

              <details className="border-t border-slate-800 pt-3 text-slate-300">
                <summary className="cursor-pointer font-semibold text-slate-200">Factors this model does not include</summary>
                <ul className="mt-2 list-disc space-y-1 pl-4">
                  {projectionResult.applicability.omittedFactors.map((factor) => <li key={factor}>{factor}</li>)}
                </ul>
              </details>

              <p className="font-mono text-[10px] text-slate-500">
                Model {projectionResult.descriptor.modelId} · Version {projectionResult.descriptor.modelVersion} · Status {projectionResult.applicability.status}
              </p>
            </section>
          ) : <>
          {/* Top 4 Predictive KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono">
            {/* KPI 1: Tissue Softening */}
            <div className="rounded-lg border border-slate-800 bg-slate-950 p-3.5 space-y-1">
              <div className="text-[10px] font-sans text-slate-400 font-medium">
                Projected 48h Softening
              </div>
              <div className="text-lg font-bold text-teal-300">
                {prediction.projectedStiffnessDeltaKPa} kPa
              </div>
              <div className="text-[10px] text-slate-400">
                {cellular.youngsModulusKPa.toFixed(1)} →{' '}
                <span className="text-emerald-400 font-bold">
                  {(cellular.youngsModulusKPa + prediction.projectedStiffnessDeltaKPa).toFixed(1)} kPa
                </span>
              </div>
              <div className="text-[9px] text-teal-400 pt-0.5">
                Target (&lt;15 kPa) in ~{prediction.timeToComplianceThresholdHours}h
              </div>
            </div>

            {/* KPI 2: iCM Lineage Conversion */}
            <div className="rounded-lg border border-slate-800 bg-slate-950 p-3.5 space-y-1">
              <div className="text-[10px] font-sans text-slate-400 font-medium">
                Projected iCM Conversion Gain
              </div>
              <div className="text-lg font-bold text-emerald-400">
                +{prediction.projectedICMDeltaPercent}%
              </div>
              <div className="text-[10px] text-slate-400">
                {cellular.iCMConversionEstimate.toFixed(1)}% →{' '}
                <span className="text-emerald-400 font-bold">
                  {(cellular.iCMConversionEstimate + prediction.projectedICMDeltaPercent).toFixed(1)}%
                </span>
              </div>
              <div className="text-[9px] text-emerald-400 pt-0.5">
                Velocity: {prediction.meanRepairVelocity24h}% / 24h
              </div>
            </div>

            {/* KPI 3: LVEF Recovery */}
            <div className="rounded-lg border border-slate-800 bg-slate-950 p-3.5 space-y-1">
              <div className="text-[10px] font-sans text-slate-400 font-medium">
                Projected Stroke Gain (LVEF)
              </div>
              <div className="text-lg font-bold text-sky-400">
                +{prediction.projectedLvefDeltaPercent}%
              </div>
              <div className="text-[10px] text-slate-400">
                {patient.currentLVEF}% →{' '}
                <span className="text-sky-300 font-bold">
                  {(patient.currentLVEF + prediction.projectedLvefDeltaPercent).toFixed(1)}%
                </span>
              </div>
              <div className="text-[9px] text-sky-400 pt-0.5">
                Scar: {prediction.projectedScarDeltaCm2} cm²
              </div>
            </div>

          </div>

          {/* Interactive What-If Sensitivity Adjuster */}
          {allowWhatIf && <div className="rounded-lg border border-slate-800 bg-slate-950 p-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <Sliders className="h-4 w-4 text-teal-400" />
                <span className="font-semibold text-slate-200">
                  What-If Therapeutic Sensitivity Simulator
                </span>
                <span className="text-[10px] text-slate-400">
                  (Adjust infusion or pacing to evaluate prospective repair velocity shifts)
                </span>
              </div>
              {(whatIf.infusionRateMultiplier !== 1.0 || whatIf.pacingCurrentMultiplier !== 1.0) && (
                <button
                  onClick={handleResetWhatIf}
                  className="flex items-center gap-1 text-[11px] text-teal-400 hover:text-teal-300"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Reset to Prescribed</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 text-xs">
              {/* Slider 1: LNP Infusion Rate Multiplier */}
              <div className="space-y-1.5">
                <div className="flex justify-between font-mono">
                  <span className="text-slate-400">LNP Infusion Rate:</span>
                  <span className="text-teal-300 font-bold">
                    {(dosing.infusionRateNlMin * whatIf.infusionRateMultiplier).toFixed(0)} nl/min (
                    {(whatIf.infusionRateMultiplier * 100).toFixed(0)}%)
                  </span>
                </div>
                <input
                  type="range"
                  min="0.8"
                  max="1.3"
                  step="0.05"
                  value={whatIf.infusionRateMultiplier}
                  onChange={(e) =>
                    setWhatIf((prev) => ({
                      ...prev,
                      infusionRateMultiplier: parseFloat(e.target.value),
                    }))
                  }
                  className="w-full accent-teal-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Slider 2: Nanogrid Pacing Current Multiplier */}
              <div className="space-y-1.5">
                <div className="flex justify-between font-mono">
                  <span className="text-slate-400">Sub-threshold Pacing Current:</span>
                  <span className="text-amber-300 font-bold">
                    {(pacing.subthresholdCurrentMA * whatIf.pacingCurrentMultiplier).toFixed(2)} mA (
                    {(whatIf.pacingCurrentMultiplier * 100).toFixed(0)}%)
                  </span>
                </div>
                <input
                  type="range"
                  min="0.8"
                  max="1.2"
                  step="0.05"
                  value={whatIf.pacingCurrentMultiplier}
                  onChange={(e) =>
                    setWhatIf((prev) => ({
                      ...prev,
                      pacingCurrentMultiplier: parseFloat(e.target.value),
                    }))
                  }
                  className="w-full accent-amber-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>}

          {/* Main trajectory chart with deterministic sensitivity bounds */}
          <div className="rounded-lg border border-slate-800 bg-slate-950 p-4 space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="font-semibold text-slate-200 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-teal-400" />
                <span>
                  {activeMetricTab === 'STIFFNESS' && 'Tissue Stiffness (Young\'s Modulus kPa) Forward Relaxation Curve'}
                  {activeMetricTab === 'ICM' && 'iCM Transdifferentiation Rate (%) Saturation Trajectory'}
                  {activeMetricTab === 'LVEF' && 'Left Ventricular Ejection Fraction (%) Dynamic Recovery Curve'}
                </span>
              </div>
              <div className="text-[10px] font-mono text-slate-400">
                Shaded area: illustrative sensitivity range
              </div>
            </div>

            <div className="h-64 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={filteredHourlyPoints} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" stroke="#64748b" fontSize={11} tickLine={false} />

                  {activeMetricTab === 'STIFFNESS' && (
                    <>
                      <YAxis stroke="#64748b" fontSize={11} domain={[10, 24]} unit=" kPa" tickLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', fontSize: '11px', borderRadius: '8px' }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                      <Area
                        type="monotone"
                        dataKey="stiffnessKPaUpperSensitivity"
                        name="Upper Sensitivity Bound"
                        stroke="transparent"
                        fill="#14b8a6"
                        fillOpacity={0.15}
                      />
                      <Area
                        type="monotone"
                        dataKey="stiffnessKPaLowerSensitivity"
                        name="Lower Sensitivity Bound"
                        stroke="transparent"
                        fill="#020617"
                        fillOpacity={0.9}
                      />
                      <Line
                        type="monotone"
                        dataKey="stiffnessKPaMedian"
                        name="Median Projected Stiffness (kPa)"
                        stroke="#14b8a6"
                        strokeWidth={2.5}
                        dot={{ r: 3, fill: '#14b8a6' }}
                      />
                    </>
                  )}

                  {activeMetricTab === 'ICM' && (
                    <>
                      <YAxis stroke="#64748b" fontSize={11} domain={[50, 95]} unit=" %" tickLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', fontSize: '11px', borderRadius: '8px' }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                      <Area
                        type="monotone"
                        dataKey="iCMConversionUpperSensitivity"
                        name="Upper Sensitivity Bound"
                        stroke="transparent"
                        fill="#10b981"
                        fillOpacity={0.18}
                      />
                      <Area
                        type="monotone"
                        dataKey="iCMConversionLowerSensitivity"
                        name="Lower Sensitivity Bound"
                        stroke="transparent"
                        fill="#020617"
                        fillOpacity={0.9}
                      />
                      <Line
                        type="monotone"
                        dataKey="iCMConversionMedian"
                        name="Median Projected iCM Conversion (%)"
                        stroke="#10b981"
                        strokeWidth={2.5}
                        dot={{ r: 3, fill: '#10b981' }}
                      />
                    </>
                  )}

                  {activeMetricTab === 'LVEF' && (
                    <>
                      <YAxis stroke="#64748b" fontSize={11} domain={[30, 55]} unit=" %" tickLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', fontSize: '11px', borderRadius: '8px' }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                      <Area
                        type="monotone"
                        dataKey="lvefUpperSensitivity"
                        name="Upper Sensitivity Bound"
                        stroke="transparent"
                        fill="#38bdf8"
                        fillOpacity={0.18}
                      />
                      <Area
                        type="monotone"
                        dataKey="lvefLowerSensitivity"
                        name="Lower Sensitivity Bound"
                        stroke="transparent"
                        fill="#020617"
                        fillOpacity={0.9}
                      />
                      <Line
                        type="monotone"
                        dataKey="lvefMedian"
                        name="Median Projected LVEF (%)"
                        stroke="#38bdf8"
                        strokeWidth={2.5}
                        dot={{ r: 3, fill: '#38bdf8' }}
                      />
                    </>
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Biological Milestone Timeline */}
          <div className="rounded-lg border border-slate-800 bg-slate-950 p-4 space-y-2">
            <h4 className="font-semibold text-slate-200 flex items-center gap-1.5 pb-2 border-b border-slate-800">
              <Calendar className="h-4 w-4 text-teal-400" />
              <span>Illustrative 48-Hour Model Assumptions</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 pt-1 font-mono text-[11px]">
              <div className="rounded bg-slate-900/80 p-2.5 border border-slate-800 space-y-1">
                <div className="font-bold text-teal-300">T+12h: Matrix Relaxation</div>
                <div className="text-slate-400 text-[10px]">
                  The scenario assumes modeled matrix relaxation during this interval; it is not an observed biological event.
                </div>
              </div>

              <div className="rounded bg-slate-900/80 p-2.5 border border-slate-800 space-y-1">
                <div className="font-bold text-emerald-300">T+24h: Sarcomere Assembly</div>
                <div className="text-slate-400 text-[10px]">
                  The scenario assumes a change in its synthetic conversion measure; no cellular outcome is established.
                </div>
              </div>

              <div className="rounded bg-slate-900/80 p-2.5 border border-slate-800 space-y-1">
                <div className="font-bold text-sky-300">T+36h: Gap Junction Coupling</div>
                <div className="text-slate-400 text-[10px]">
                  The scenario assumes improved coupling; it does not establish arrhythmia prevention or clinical protection.
                </div>
              </div>

              <div className="rounded bg-slate-900/80 p-2.5 border border-slate-800 space-y-1">
                <div className="font-bold text-indigo-300">T+48h: Synchronized Ejection</div>
                <div className="text-slate-400 text-[10px]">
                  The equations produce a modeled +{prediction.projectedLvefDeltaPercent}% LVEF change under the selected settings.
                </div>
              </div>
            </div>
          </div>

          {/* Simulation interpretation banner */}
          <div className="rounded-lg border border-teal-500/30 bg-teal-950/20 p-3.5 text-xs text-slate-300 leading-relaxed">
            <span className="font-bold text-teal-300">Model narrative: </span>
            {prediction.simulationInterpretation}
          </div>
          </>}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-800 bg-slate-950 px-6 py-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Synthetic parameters · Not clinically validated</span>
          </div>

          <button
            onClick={onClose}
            className="rounded bg-teal-500 px-4 py-1.5 font-medium text-slate-950 hover:bg-teal-400 transition"
          >
            Close Simulation
          </button>
        </div>
      </div>
    </ModalShell>
  );
};
