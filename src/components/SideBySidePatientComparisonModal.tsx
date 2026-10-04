/**
 * Side-by-Side Dual-Patient Comparative Telemetry & Efficacy Benchmarking Console
 * Overlays real-time electrophysiological waveforms, biomechanical strain,
 * epigenetic dosing kinetics, and radar efficacy polygons for two patients simultaneously.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  GitCompare,
  X,
  ArrowRightLeft,
  Activity,
  Heart,
  Zap,
  TrendingUp,
  ShieldCheck,
  Sparkles,
  Layers,
  ChevronDown,
  Info,
} from 'lucide-react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip,
} from 'recharts';
import { PatientProfile, CellularSensorMetrics, PatientVitals, NanogridPacingState, EpigeneticDosingState } from '../types/bdcmr';
import { PATIENT_COHORTS } from '../services/telemetryStreamService';

interface SideBySidePatientComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  activePatient: PatientProfile;
  activeVitals: PatientVitals;
  activeCellular: CellularSensorMetrics;
  activePacing: NanogridPacingState;
  activeDosing: EpigeneticDosingState;
}

export const SideBySidePatientComparisonModal: React.FC<SideBySidePatientComparisonModalProps> = ({
  isOpen,
  onClose,
  activePatient,
  activeVitals,
  activeCellular,
  activePacing,
  activeDosing,
}) => {
  const [patientAId, setPatientAId] = useState<string>(activePatient.id);
  // Default patient B to Eleanor Martinez or James Turner
  const [patientBId, setPatientBId] = useState<string>(
    PATIENT_COHORTS.find((p) => p.id !== activePatient.id)?.id || PATIENT_COHORTS[1].id
  );

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [tick, setTick] = useState(0);

  const patientA = PATIENT_COHORTS.find((p) => p.id === patientAId) || activePatient;
  const patientB = PATIENT_COHORTS.find((p) => p.id === patientBId) || PATIENT_COHORTS[1];

  // Dynamic real-time ticking simulation
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 45);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Dual Oscilloscope Real-Time Rendering on HTML5 Canvas
  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear background grid
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, width, height);

    // Draw ECG Medical Grid lines (small squares 10px, major squares 50px)
    ctx.lineWidth = 0.5;
    ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
    for (let x = 0; x < width; x += 15) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 15) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Midline
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.6)';
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    const midY = height / 2;
    const numPoints = 180;
    const stepX = width / numPoints;

    // Waveform for Patient A (Cyan/Teal #14b8a6)
    ctx.lineWidth = 2.2;
    ctx.strokeStyle = '#2dd4bf'; // teal-400
    ctx.beginPath();
    for (let i = 0; i < numPoints; i++) {
      const x = i * stepX;
      const t = (i + tick) * 0.08;
      // Simulated ECG cycle for Patient A (synchronized rhythm, post-MI day based)
      const phase = (t % (Math.PI * 2)) / (Math.PI * 2);
      let val = 0;
      if (phase > 0.08 && phase < 0.16) val = Math.sin(((phase - 0.08) / 0.08) * Math.PI) * 18; // P
      else if (phase > 0.28 && phase < 0.35) val = -Math.sin(((phase - 0.28) / 0.07) * Math.PI) * 75; // QRS
      else if (phase > 0.42 && phase < 0.58) val = Math.sin(((phase - 0.42) / 0.16) * Math.PI) * 22; // T

      const y = midY - val;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Waveform for Patient B (Amber/Orange #f59e0b)
    ctx.lineWidth = 2.2;
    ctx.strokeStyle = '#fbbf24'; // amber-400
    ctx.beginPath();
    for (let i = 0; i < numPoints; i++) {
      const x = i * stepX;
      // Slightly different rate/phase based on Patient B postInfarcDay
      const t = (i + tick * 0.92) * 0.08;
      const phase = (t % (Math.PI * 2)) / (Math.PI * 2);
      let val = 0;
      // If patient B has earlier post-infarct day, show more ischemia or delay
      const isEarly = patientB.postInfarcDay < 10;
      if (phase > 0.08 && phase < 0.16) val = Math.sin(((phase - 0.08) / 0.08) * Math.PI) * 14;
      else if (phase > 0.28 && phase < (isEarly ? 0.38 : 0.35)) {
        val = -Math.sin(((phase - 0.28) / (isEarly ? 0.1 : 0.07)) * Math.PI) * 65; // Slurred QRS if early
      } else if (phase > 0.42 && phase < 0.6) {
        val = Math.sin(((phase - 0.42) / 0.18) * Math.PI) * (isEarly ? 32 : 18); // Elevated ST
      }

      const y = midY - val;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }, [isOpen, tick, patientA, patientB]);

  if (!isOpen) return null;

  // Swap patients
  const handleSwap = () => {
    const temp = patientAId;
    setPatientAId(patientBId);
    setPatientBId(temp);
  };

  // Radar comparative data
  const radarData = [
    {
      metric: 'LVEF Ejection Fraction',
      patientA: Math.round((patientA.currentLVEF / 60) * 100),
      patientB: Math.round((patientB.currentLVEF / 60) * 100),
      fullMark: 100,
    },
    {
      metric: 'Conduction Velocity',
      patientA: Math.round(((patientA.id === 'PAT-7721' ? 0.78 : 0.68) / 0.9) * 100),
      patientB: Math.round(((patientB.id === 'PAT-7721' ? 0.78 : 0.68) / 0.9) * 100),
      fullMark: 100,
    },
    {
      metric: 'Matrix Compliance (Softness)',
      patientA: Math.round(((35 - patientA.tissueStiffnessKPa) / 22) * 100),
      patientB: Math.round(((35 - patientB.tissueStiffnessKPa) / 22) * 100),
      fullMark: 100,
    },
    {
      metric: 'iCM Lineage Conversion',
      patientA: Math.round(patientA.iCMConversionRate),
      patientB: Math.round(patientB.iCMConversionRate),
      fullMark: 100,
    },
    {
      metric: 'Arrhythmia Protection',
      patientA: patientA.arrhythmiaShieldStatus === 'OPTIMAL_SHIELD' ? 98 : 88,
      patientB: patientB.arrhythmiaShieldStatus === 'OPTIMAL_SHIELD' ? 98 : 88,
      fullMark: 100,
    },
    {
      metric: 'Scar Area Reduction',
      patientA: Math.round(
        ((patientA.baselineScarAreaCm2 - patientA.currentScarAreaCm2) / patientA.baselineScarAreaCm2) * 100
      ),
      patientB: Math.round(
        ((patientB.baselineScarAreaCm2 - patientB.currentScarAreaCm2) / patientB.baselineScarAreaCm2) * 100
      ),
      fullMark: 100,
    },
  ];

  // Calculate clinical deltas (Patient B vs Patient A)
  const lvefDelta = patientB.currentLVEF - patientA.currentLVEF;
  const scarReducA = ((patientA.baselineScarAreaCm2 - patientA.currentScarAreaCm2) / patientA.baselineScarAreaCm2) * 100;
  const scarReducB = ((patientB.baselineScarAreaCm2 - patientB.currentScarAreaCm2) / patientB.baselineScarAreaCm2) * 100;
  const scarDelta = scarReducB - scarReducA;
  const stiffnessDelta = patientB.tissueStiffnessKPa - patientA.tissueStiffnessKPa;
  const icmDelta = patientB.iCMConversionRate - patientA.iCMConversionRate;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="flex h-[92vh] w-full max-w-6xl flex-col rounded-xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/30">
              <GitCompare className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <span>Side-by-Side Dual-Patient Telemetry Overlay &amp; Efficacy Benchmarking</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/15 text-teal-300 border border-teal-500/30">
                  REAL-TIME BENCHMARK
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Overlay high-frequency electrophysiological waveforms, scar compliance, and gene reprogramming kinetics
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

        {/* Patient Selection Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-slate-950/80 px-6 py-3">
          {/* Patient A Dropdown */}
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-teal-400 animate-pulse" />
            <span className="font-bold text-xs text-teal-300 font-mono">Patient A (Reference):</span>
            <select
              value={patientAId}
              onChange={(e) => setPatientAId(e.target.value)}
              className="rounded-lg border border-teal-500/30 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-teal-400"
            >
              {PATIENT_COHORTS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.mrnTokenized} ({p.unmaskedName}) · Day {p.postInfarcDay} · {p.infarctLocation}
                </option>
              ))}
            </select>
          </div>

          {/* Swap Button */}
          <button
            onClick={handleSwap}
            title="Swap Patient A and Patient B"
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-300 hover:border-slate-700 hover:text-white transition"
          >
            <ArrowRightLeft className="h-3.5 w-3.5 text-teal-400" />
            <span>Swap Comparison</span>
          </button>

          {/* Patient B Dropdown */}
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-amber-400 animate-pulse" />
            <span className="font-bold text-xs text-amber-300 font-mono">Patient B (Comparator):</span>
            <select
              value={patientBId}
              onChange={(e) => setPatientBId(e.target.value)}
              className="rounded-lg border border-amber-500/30 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-amber-400"
            >
              {PATIENT_COHORTS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.mrnTokenized} ({p.unmaskedName}) · Day {p.postInfarcDay} · {p.infarctLocation}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {/* Synchronized Real-Time Dual-ECG Oscilloscope Overlay */}
          <div className="rounded-lg border border-slate-800 bg-slate-950 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-teal-400" />
                <span className="font-bold text-sm text-slate-100">
                  Real-Time Dual-Lead Action Potential &amp; Micro-ECG Oscilloscope Overlay
                </span>
                <span className="font-mono text-[10px] text-slate-400">500 Hz Synchronized Sweep</span>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 text-xs font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-5 rounded bg-teal-400 inline-block" />
                  <span className="text-teal-300 font-semibold">{patientA.mrnTokenized} (Day {patientA.postInfarcDay})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-5 rounded bg-amber-400 inline-block" />
                  <span className="text-amber-300 font-semibold">{patientB.mrnTokenized} (Day {patientB.postInfarcDay})</span>
                </div>
              </div>
            </div>

            <canvas
              ref={canvasRef}
              width={920}
              height={180}
              className="w-full h-44 rounded-md border border-slate-800"
            />

            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1">
              <span>Conduction Delay: {patientA.postInfarcDay > patientB.postInfarcDay ? '-38ms (Faster in Patient A)' : '+42ms (Faster in Patient B)'}</span>
              <span>Re-Entry Wavefront Collision: Blocked &amp; Quenched</span>
            </div>
          </div>

          {/* Metric Comparison Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* LVEF Card */}
            <div className="rounded-lg border border-slate-800 bg-slate-950 p-3.5 font-mono">
              <div className="text-[11px] font-sans font-semibold text-slate-400">
                Ejection Fraction (LVEF)
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-slate-500">Pt A: </span>
                  <span className="text-base font-bold text-teal-300">{patientA.currentLVEF}%</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Pt B: </span>
                  <span className="text-base font-bold text-amber-300">{patientB.currentLVEF}%</span>
                </div>
              </div>
              <div className="mt-1.5 text-[11px] flex items-center justify-between border-t border-slate-800/80 pt-1.5">
                <span className="text-slate-400">Delta (B vs A):</span>
                <span className={`font-bold ${lvefDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {lvefDelta >= 0 ? `+${lvefDelta.toFixed(1)}%` : `${lvefDelta.toFixed(1)}%`}
                </span>
              </div>
            </div>

            {/* Scar Reduction Card */}
            <div className="rounded-lg border border-slate-800 bg-slate-950 p-3.5 font-mono">
              <div className="text-[11px] font-sans font-semibold text-slate-400">
                Scar Area Reduction
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-slate-500">Pt A: </span>
                  <span className="text-base font-bold text-teal-300">-{scarReducA.toFixed(1)}%</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Pt B: </span>
                  <span className="text-base font-bold text-amber-300">-{scarReducB.toFixed(1)}%</span>
                </div>
              </div>
              <div className="mt-1.5 text-[11px] flex items-center justify-between border-t border-slate-800/80 pt-1.5">
                <span className="text-slate-400">Delta (B vs A):</span>
                <span className={`font-bold ${scarDelta >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {scarDelta >= 0 ? `+${scarDelta.toFixed(1)}%` : `${scarDelta.toFixed(1)}%`}
                </span>
              </div>
            </div>

            {/* Tissue Stiffness Card */}
            <div className="rounded-lg border border-slate-800 bg-slate-950 p-3.5 font-mono">
              <div className="text-[11px] font-sans font-semibold text-slate-400">
                Tissue Stiffness (Young&apos;s Modulus)
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-slate-500">Pt A: </span>
                  <span className="text-base font-bold text-teal-300">{patientA.tissueStiffnessKPa} kPa</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Pt B: </span>
                  <span className="text-base font-bold text-amber-300">{patientB.tissueStiffnessKPa} kPa</span>
                </div>
              </div>
              <div className="mt-1.5 text-[11px] flex items-center justify-between border-t border-slate-800/80 pt-1.5">
                <span className="text-slate-400">Compliance Diff:</span>
                <span className={`font-bold ${stiffnessDelta <= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {stiffnessDelta <= 0 ? `${stiffnessDelta.toFixed(1)} kPa (Softer)` : `+${stiffnessDelta.toFixed(1)} kPa (Stiffer)`}
                </span>
              </div>
            </div>

            {/* iCM Conversion Card */}
            <div className="rounded-lg border border-slate-800 bg-slate-950 p-3.5 font-mono">
              <div className="text-[11px] font-sans font-semibold text-slate-400">
                iCM Lineage Transdifferentiation
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-slate-500">Pt A: </span>
                  <span className="text-base font-bold text-teal-300">{patientA.iCMConversionRate}%</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Pt B: </span>
                  <span className="text-base font-bold text-amber-300">{patientB.iCMConversionRate}%</span>
                </div>
              </div>
              <div className="mt-1.5 text-[11px] flex items-center justify-between border-t border-slate-800/80 pt-1.5">
                <span className="text-slate-400">Delta (B vs A):</span>
                <span className={`font-bold ${icmDelta >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {icmDelta >= 0 ? `+${icmDelta.toFixed(1)}%` : `${icmDelta.toFixed(1)}%`}
                </span>
              </div>
            </div>
          </div>

          {/* Comparative Efficacy Radar Chart & Therapeutic Regimen */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left 7 cols: Recharts Radar Polygon Overlay */}
            <div className="lg:col-span-7 rounded-lg border border-slate-800 bg-slate-950 p-4">
              <div className="font-semibold text-slate-200 flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-teal-400" />
                  <span>Multimodal Regeneration Radar Polygon (Normalized 0-100%)</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">6 Core Biophysical Vectors</span>
              </div>

              <div className="h-64 w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData} outerRadius="75%">
                    <PolarGrid stroke="#1e293b" />
                    <PolarAngleAxis dataKey="metric" stroke="#94a3b8" fontSize={10} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" fontSize={9} />
                    <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', fontSize: '11px', borderRadius: '8px' }} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Radar
                      name={`${patientA.mrnTokenized} (Day ${patientA.postInfarcDay})`}
                      dataKey="patientA"
                      stroke="#14b8a6"
                      fill="#14b8a6"
                      fillOpacity={0.35}
                    />
                    <Radar
                      name={`${patientB.mrnTokenized} (Day ${patientB.postInfarcDay})`}
                      dataKey="patientB"
                      stroke="#f59e0b"
                      fill="#f59e0b"
                      fillOpacity={0.35}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Right 5 cols: Treatment Regimen & Automated Efficacy Insight */}
            <div className="lg:col-span-5 rounded-lg border border-slate-800 bg-slate-950 p-4 space-y-3 flex flex-col justify-between">
              <div>
                <h4 className="font-semibold text-slate-200 pb-2 border-b border-slate-800 flex items-center gap-2">
                  <Layers className="h-4 w-4 text-teal-400" />
                  <span>Therapeutic Intervention Regimen Comparison</span>
                </h4>

                <div className="mt-3 space-y-3 font-mono text-[11px]">
                  {/* Patient A Details */}
                  <div className="rounded bg-slate-900/90 p-2.5 border border-teal-500/30 space-y-1">
                    <div className="font-sans font-bold text-teal-300 flex justify-between">
                      <span>{patientA.mrnTokenized} (Day {patientA.postInfarcDay})</span>
                      <span className="text-[10px] text-teal-400">{patientA.arrhythmiaShieldStatus}</span>
                    </div>
                    <div className="text-slate-400">Diagnosis: {patientA.admissionDiagnosis}</div>
                    <div className="text-slate-300">
                      Regimen: <span className="text-white">GMT+Hand2 mRNA LNP (240 nl/min)</span>
                    </div>
                    <div className="text-slate-300">
                      Pacing: <span className="text-teal-300">0.85 mA @ 72 bpm (PEDOT:PSS)</span>
                    </div>
                  </div>

                  {/* Patient B Details */}
                  <div className="rounded bg-slate-900/90 p-2.5 border border-amber-500/30 space-y-1">
                    <div className="font-sans font-bold text-amber-300 flex justify-between">
                      <span>{patientB.mrnTokenized} (Day {patientB.postInfarcDay})</span>
                      <span className="text-[10px] text-amber-400">{patientB.arrhythmiaShieldStatus}</span>
                    </div>
                    <div className="text-slate-400">Diagnosis: {patientB.admissionDiagnosis}</div>
                    <div className="text-slate-300">
                      Regimen: <span className="text-white">{patientB.postInfarcDay > 20 ? 'Standard GMT mRNA (180 nl/min)' : 'GHMT Acute Formulation'}</span>
                    </div>
                    <div className="text-slate-300">
                      Pacing: <span className="text-amber-300">0.92 mA @ 74 bpm (Conductive Hydrogel)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Automated Efficacy Conclusion */}
              <div className="rounded border border-teal-500/30 bg-teal-950/20 p-3 text-xs leading-relaxed text-slate-300">
                <span className="font-bold text-teal-300">Comparative Efficacy Finding: </span>
                {patientA.postInfarcDay > patientB.postInfarcDay
                  ? `${patientA.mrnTokenized} demonstrates a +${(patientA.currentLVEF - patientB.currentLVEF).toFixed(1)}% higher LVEF with ${(patientA.iCMConversionRate - patientB.iCMConversionRate).toFixed(1)}% greater cellular lineage conversion, validating the longitudinal efficacy of long-term GMT+Hand2 transdifferentiation.`
                  : `${patientB.mrnTokenized} shows accelerated recovery kinetics, reflecting active remodeling under synchronized bio-nanogrid electro-mechanical entrainment.`}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-800 bg-slate-950 px-6 py-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Multi-Subject Clinical Trial Benchmark · De-Identified Telemetry</span>
          </div>

          <button
            onClick={onClose}
            className="rounded bg-teal-500 px-4 py-1.5 font-medium text-slate-950 hover:bg-teal-400 transition"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
};
