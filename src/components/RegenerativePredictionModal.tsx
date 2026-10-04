/**
 * Regenerative Outcome Prediction & Tissue Repair Velocity Modal
 * Displays 48-hour forward projection curves, 95% Bayesian credible intervals,
 * and what-if sensitivity modeling for LNP dosing and nanogrid pacing.
 */

import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  X,
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
  calculate48HourRegenerativeProjection,
  WhatIfParameters,
} from '../services/regenerativePredictionEngine';

interface RegenerativePredictionModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: PatientProfile;
  cellular: CellularSensorMetrics;
  vitals: PatientVitals;
  dosing: EpigeneticDosingState;
  pacing: NanogridPacingState;
}

export const RegenerativePredictionModal: React.FC<RegenerativePredictionModalProps> = ({
  isOpen,
  onClose,
  patient,
  cellular,
  vitals,
  dosing,
  pacing,
}) => {
  const [horizonHours, setHorizonHours] = useState<number>(48);
  const [activeMetricTab, setActiveMetricTab] = useState<'STIFFNESS' | 'ICM' | 'LVEF'>('STIFFNESS');
  const [whatIf, setWhatIf] = useState<WhatIfParameters>({
    infusionRateMultiplier: 1.0,
    pacingCurrentMultiplier: 1.0,
  });

  const prediction = useMemo(() => {
    return calculate48HourRegenerativeProjection(patient, cellular, vitals, dosing, pacing, whatIf);
  }, [patient, cellular, vitals, dosing, pacing, whatIf]);

  if (!isOpen) return null;

  // Filter hourly points based on chosen horizon
  const filteredHourlyPoints = prediction.hourlyPoints.filter((p) => p.hour <= horizonHours);

  const handleResetWhatIf = () => {
    setWhatIf({ infusionRateMultiplier: 1.0, pacingCurrentMultiplier: 1.0 });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="flex h-[92vh] w-full max-w-5xl flex-col rounded-xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/30">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <span>Regenerative Outcome Prediction Engine (48-Hour Velocity)</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  ODE BIOPHYSICS FORECAST
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Patient {patient.mrnTokenized} ({patient.patientFullNameMasked}) · Day {patient.postInfarcDay} · {patient.infarctLocation}
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

        {/* Prediction Parameter Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-slate-950/70 px-6 py-3 text-xs">
          {/* Horizon Selector */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-semibold flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-teal-400" />
              <span>Forecast Horizon:</span>
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
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {/* Top 4 Predictive KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono">
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

            {/* KPI 4: Bayesian Confidence */}
            <div className="rounded-lg border border-slate-800 bg-slate-950 p-3.5 space-y-1">
              <div className="text-[10px] font-sans text-slate-400 font-medium">
                Model Prediction Confidence
              </div>
              <div className="text-lg font-bold text-indigo-300">
                {prediction.modelConfidenceScore}%
              </div>
              <div className="text-[10px] text-slate-400">
                Bayesian Credible Band
              </div>
              <div className="text-[9px] text-indigo-400 pt-0.5">
                ±1.8σ Uncertainty Bounds
              </div>
            </div>
          </div>

          {/* Interactive What-If Sensitivity Adjuster */}
          <div className="rounded-lg border border-slate-800 bg-slate-950 p-3.5">
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
          </div>

          {/* Main Trajectory Chart with 95% Confidence Band */}
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
                Shaded Area: 95% Bayesian Credible Interval
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
                        dataKey="stiffnessKPaUpper95"
                        name="Upper 95% Bound"
                        stroke="transparent"
                        fill="#14b8a6"
                        fillOpacity={0.15}
                      />
                      <Area
                        type="monotone"
                        dataKey="stiffnessKPaLower95"
                        name="Lower 95% Bound"
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
                        dataKey="iCMConversionUpper95"
                        name="Upper 95% Bound"
                        stroke="transparent"
                        fill="#10b981"
                        fillOpacity={0.18}
                      />
                      <Area
                        type="monotone"
                        dataKey="iCMConversionLower95"
                        name="Lower 95% Bound"
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
                        dataKey="lvefUpper95"
                        name="Upper 95% Bound"
                        stroke="transparent"
                        fill="#38bdf8"
                        fillOpacity={0.18}
                      />
                      <Area
                        type="monotone"
                        dataKey="lvefLower95"
                        name="Lower 95% Bound"
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
              <span>Anticipated 48-Hour Mechanistic &amp; Clinical Milestones</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 pt-1 font-mono text-[11px]">
              <div className="rounded bg-slate-900/80 p-2.5 border border-slate-800 space-y-1">
                <div className="font-bold text-teal-300">T+12h: Matrix Relaxation</div>
                <div className="text-slate-400 text-[10px]">
                  MMP-9 activation degrades dense Type-I collagen fibers, initiating significant softening of akinetic scar margin.
                </div>
              </div>

              <div className="rounded bg-slate-900/80 p-2.5 border border-slate-800 space-y-1">
                <div className="font-bold text-emerald-300">T+24h: Sarcomere Assembly</div>
                <div className="text-slate-400 text-[10px]">
                  De novo expression of alpha-cardiac actin (ACTC1) and cardiac troponin-T2 yields nascent spontaneous myofibril twitches.
                </div>
              </div>

              <div className="rounded bg-slate-900/80 p-2.5 border border-slate-800 space-y-1">
                <div className="font-bold text-sky-300">T+36h: Gap Junction Coupling</div>
                <div className="text-slate-400 text-[10px]">
                  Connexin-43 plaques form intercalated disc bridges with host cardiomyocytes, preventing micro-reentry circuit triggers.
                </div>
              </div>

              <div className="rounded bg-slate-900/80 p-2.5 border border-slate-800 space-y-1">
                <div className="font-bold text-indigo-300">T+48h: Synchronized Ejection</div>
                <div className="text-slate-400 text-[10px]">
                  Restored compliant compliance (&lt;15 kPa) contributes active wall thickening and +{prediction.projectedLvefDeltaPercent}% LVEF gain.
                </div>
              </div>
            </div>
          </div>

          {/* Clinical Interpretation Banner */}
          <div className="rounded-lg border border-teal-500/30 bg-teal-950/20 p-3.5 text-xs text-slate-300 leading-relaxed">
            <span className="font-bold text-teal-300">Physician Guidance: </span>
            {prediction.clinicalInterpretation}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-800 bg-slate-950 px-6 py-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Validated Against PINN Mechanics &amp; Human Heart Cell Atlas Reprogramming Kinetics</span>
          </div>

          <button
            onClick={onClose}
            className="rounded bg-teal-500 px-4 py-1.5 font-medium text-slate-950 hover:bg-teal-400 transition"
          >
            Close Predictor
          </button>
        </div>
      </div>
    </div>
  );
};
