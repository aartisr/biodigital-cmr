/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Multi-Period 24-Hour Trend Comparison View
 * Powered by Recharts for multi-cycle cross-correlation of patient vitals
 * and cellular recovery metrics across 24-hour diurnal phases.
 */

import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Brush,
} from 'recharts';
import {
  Activity,
  Layers,
  Calendar,
  Clock,
  TrendingUp,
  TrendingDown,
  Download,
  Info,
  CheckCircle2,
  Sparkles,
  SunMedium,
  Moon,
  Zap,
  HeartPulse,
  Gauge,
  SlidersHorizontal,
  RefreshCw,
} from 'lucide-react';
import { PatientProfile, PatientVitals, CellularSensorMetrics } from '../../types/bdcmr';
import {
  generateMultiPeriodTrendData,
  CircadianCyclePoint,
  LongitudinalPoint,
} from '../../services/multiPeriodTrendService';

export interface MultiPeriodTrendComparisonProps {
  patient: PatientProfile;
  vitals: PatientVitals;
  cellular: CellularSensorMetrics;
  onOpenPrediction?: () => void;
  className?: string;
}

export type TrendDisplayMode = 'CIRCADIAN_OVERLAY' | 'LONGITUDINAL_72H' | 'DELTA_MATRIX';
export type MetricCategory = 'CELLULAR_RECOVERY' | 'PATIENT_VITALS' | 'ELECTROMECHANICAL_COUPLING';

export const MultiPeriodTrendComparison: React.FC<MultiPeriodTrendComparisonProps> = ({
  patient,
  vitals,
  cellular,
  onOpenPrediction,
  className = '',
}) => {
  // Navigation & filtering state
  const [displayMode, setDisplayMode] = useState<TrendDisplayMode>('CIRCADIAN_OVERLAY');
  const [metricCategory, setMetricCategory] = useState<MetricCategory>('CELLULAR_RECOVERY');
  const [showCycle1, setShowCycle1] = useState<boolean>(true);
  const [showCycle2, setShowCycle2] = useState<boolean>(true);
  const [showCycle3, setShowCycle3] = useState<boolean>(true);
  const [showPhysiologicalTarget, setShowPhysiologicalTarget] = useState<boolean>(true);
  const [showMethodologyInfo, setShowMethodologyInfo] = useState<boolean>(false);
  const [selectedCircadianPhase, setSelectedCircadianPhase] = useState<string>('ALL');

  // Compute 24-hour multi-period datasets
  const { circadianPoints, longitudinalPoints, summary } = useMemo(() => {
    return generateMultiPeriodTrendData(patient, vitals, cellular);
  }, [patient, vitals, cellular]);

  // Filtered circadian points if phase zoom selected
  const filteredCircadianPoints = useMemo(() => {
    if (selectedCircadianPhase === 'ALL') return circadianPoints;
    return circadianPoints.filter((p) => p.circadianPhase === selectedCircadianPhase);
  }, [circadianPoints, selectedCircadianPhase]);

  // Handle CSV Export of multi-cycle telemetry
  const handleExportCSV = () => {
    const headers = [
      'CircadianHour',
      'TimeLabel',
      'CircadianPhase',
      'iCM_Cycle1_Percent',
      'iCM_Cycle2_Percent',
      'iCM_Cycle3_Percent',
      'Stiffness_Cycle1_kPa',
      'Stiffness_Cycle2_kPa',
      'Stiffness_Cycle3_kPa',
      'HeartRate_Cycle1_BPM',
      'HeartRate_Cycle2_BPM',
      'HeartRate_Cycle3_BPM',
      'MAP_Cycle1_mmHg',
      'MAP_Cycle2_mmHg',
      'MAP_Cycle3_mmHg',
      'CardiacOutput_Cycle1_LMin',
      'CardiacOutput_Cycle2_LMin',
      'CardiacOutput_Cycle3_LMin',
      'ATPFlux_Cycle3_pmol',
      'Conduction_Cycle3_ms',
    ];

    const rows = circadianPoints.map((p) => [
      p.hour,
      p.timeLabel,
      p.circadianPhase,
      p.icmCycle1,
      p.icmCycle2,
      p.icmCycle3,
      p.stiffnessCycle1,
      p.stiffnessCycle2,
      p.stiffnessCycle3,
      p.hrCycle1,
      p.hrCycle2,
      p.hrCycle3,
      p.mapCycle1,
      p.mapCycle2,
      p.mapCycle3,
      p.coCycle1,
      p.coCycle2,
      p.coCycle3,
      p.atpFluxCycle3,
      p.conductionCycle3,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `BDCMR-MultiPeriod-24h-${patient.mrnTokenized}-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // Custom Glassmorphism Tooltip for Circadian Multi-Period Overlay
  const CustomCircadianTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const point = payload[0]?.payload as CircadianCyclePoint;
      return (
        <div className="rounded-xl border border-slate-700 bg-slate-950/95 p-3 text-xs shadow-2xl backdrop-blur-md max-w-xs sm:max-w-sm">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 font-mono text-[11px]">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Clock className="h-3.5 w-3.5 text-teal-400" />
              <span>Circadian Phase: <strong>{label}</strong></span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] bg-slate-900 border border-slate-800 text-teal-400 font-semibold">
              {point?.circadianPhase?.replace('_', ' ') || 'Phase'}
            </span>
          </div>

          <div className="mt-2.5 space-y-1.5 font-mono text-[11px]">
            {payload.map((item: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-1.5 text-slate-400 truncate">
                  <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="truncate">{item.name}:</span>
                </span>
                <span className="font-semibold text-slate-100 flex-shrink-0">
                  {item.value} {item.unit || ''}
                </span>
              </div>
            ))}
          </div>

          {point && metricCategory === 'CELLULAR_RECOVERY' && (
            <div className="mt-2.5 pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 flex justify-between">
              <span>Cycle 3 vs 1 Transdifferentiation:</span>
              <span className="text-emerald-400 font-semibold font-mono">
                +{(point.icmCycle3 - point.icmCycle1).toFixed(1)}% gain
              </span>
            </div>
          )}

          {point && metricCategory === 'PATIENT_VITALS' && (
            <div className="mt-2.5 pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 flex justify-between">
              <span>Hemodynamic Stability Variance:</span>
              <span className="text-teal-300 font-semibold font-mono">
                {(point.mapCycle1 - point.mapCycle3).toFixed(0)} mmHg normalization
              </span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  // Custom Tooltip for 72-Hour Longitudinal View
  const CustomLongitudinalTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const point = payload[0]?.payload as LongitudinalPoint;
      return (
        <div className="rounded-xl border border-slate-700 bg-slate-950/95 p-3 text-xs shadow-2xl backdrop-blur-md">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 font-mono text-[11px]">
            <span className="text-slate-300">Timeline: {label} ({point?.cycleLabel})</span>
            <span className="text-teal-400 font-semibold">T-{Math.abs(point?.hourOffset || 0)}h</span>
          </div>
          <div className="mt-2 space-y-1 font-mono text-[11px]">
            {payload.map((item: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.name}:</span>
                </span>
                <span className="font-semibold text-slate-100">
                  {item.value} {item.unit || ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`rounded-2xl border border-slate-800 bg-slate-900/90 p-4 sm:p-5 shadow-xl ${className}`}>
      {/* Header & Control Deck */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400">
              <Calendar className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-semibold text-white">
                  Multi-Period 24-Hour Trend Comparison
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 className="h-3 w-3" />
                  3 Cycles Synchronized
                </span>
                <button
                  onClick={() => setShowMethodologyInfo(!showMethodologyInfo)}
                  className="text-slate-400 hover:text-slate-200 transition"
                  title="Multi-Period Circadian Analysis Methodology"
                  aria-label="Toggle methodology info"
                >
                  <Info className="h-4 w-4" />
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Superimposed diurnal analysis correlating hemodynamic vitals with micro-cellular tissue recovery kinetics over 24-hour cycles.
              </p>
            </div>
          </div>
        </div>

        {/* Global Toolbar Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Display Mode Tabs */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setDisplayMode('CIRCADIAN_OVERLAY')}
              className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
                displayMode === 'CIRCADIAN_OVERLAY'
                  ? 'bg-slate-800 text-teal-300 shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>24h Circadian Overlay</span>
            </button>
            <button
              onClick={() => setDisplayMode('LONGITUDINAL_72H')}
              className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
                displayMode === 'LONGITUDINAL_72H'
                  ? 'bg-slate-800 text-teal-300 shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Activity className="h-3.5 w-3.5" />
              <span>72h Multi-Cycle Sequence</span>
            </button>
            <button
              onClick={() => setDisplayMode('DELTA_MATRIX')}
              className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
                displayMode === 'DELTA_MATRIX'
                  ? 'bg-slate-800 text-teal-300 shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Delta Variance</span>
            </button>
          </div>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            title="Export 24-hour multi-cycle comparative timeseries"
            className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-slate-300 hover:border-slate-700 hover:text-white transition"
          >
            <Download className="h-3.5 w-3.5 text-teal-400" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          {/* Prediction Modal Trigger */}
          {onOpenPrediction && (
            <button
              onClick={onOpenPrediction}
              className="flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-300 hover:bg-emerald-500/20 hover:text-white transition font-medium"
            >
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
              <span>Outcome Forecast</span>
            </button>
          )}
        </div>
      </div>

      {/* Methodology Collapsible Info */}
      {showMethodologyInfo && (
        <div className="my-4 rounded-xl border border-teal-500/30 bg-teal-950/25 p-4 text-xs text-slate-300 leading-relaxed space-y-2">
          <div className="flex items-center gap-2 font-semibold text-teal-300">
            <Zap className="h-4 w-4" />
            <span>Circadian Multi-Period Telemetry Architecture (Clinical Standard 4.2)</span>
          </div>
          <p>
            Cardiac cellular reprogramming exhibits pronounced diurnal sensitivity: nocturnal vagal dominance promotes mitochondrial ATP replenishment and gap-junction formation, whereas morning sympathetic surges elevate myocardial wall stress. By superimposing consecutive 24-hour cycles (<strong>Cycle 1: Post-Infarction Baseline</strong>, <strong>Cycle 2: Epigenetic Transition</strong>, and <strong>Cycle 3: Current Mature Syncytium</strong>), clinicians can identify whether recovery rates are accelerating, stagnating, or decoupled from autonomic rhythms.
          </p>
        </div>
      )}

      {/* Sub-Deck: Metric Category Selector & Cycle Visibility Toggles */}
      <div className="flex flex-wrap items-center justify-between gap-3 my-4 py-2 bg-slate-950/80 px-3 rounded-xl border border-slate-800/80 text-xs">
        {/* Metric Category Selector */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 font-medium mr-1 hidden sm:inline">Domain:</span>
          <button
            onClick={() => setMetricCategory('CELLULAR_RECOVERY')}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              metricCategory === 'CELLULAR_RECOVERY'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                : 'text-slate-400 hover:text-white border border-transparent'
            }`}
          >
            Cellular Recovery Metrics
          </button>
          <button
            onClick={() => setMetricCategory('PATIENT_VITALS')}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              metricCategory === 'PATIENT_VITALS'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                : 'text-slate-400 hover:text-white border border-transparent'
            }`}
          >
            Patient Hemodynamic Vitals
          </button>
          <button
            onClick={() => setMetricCategory('ELECTROMECHANICAL_COUPLING')}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              metricCategory === 'ELECTROMECHANICAL_COUPLING'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                : 'text-slate-400 hover:text-white border border-transparent'
            }`}
          >
            Vitals-Cellular Coupling
          </button>
        </div>

        {/* Cycle Filter Badges (Toggles) */}
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <button
            onClick={() => setShowCycle1(!showCycle1)}
            className={`px-2 py-0.5 rounded border transition flex items-center gap-1 ${
              showCycle1
                ? 'bg-indigo-950/70 border-indigo-500/40 text-indigo-300'
                : 'bg-slate-900 border-slate-800 text-slate-500 line-through'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-indigo-400" />
            Cycle 1 (Day 1)
          </button>
          <button
            onClick={() => setShowCycle2(!showCycle2)}
            className={`px-2 py-0.5 rounded border transition flex items-center gap-1 ${
              showCycle2
                ? 'bg-amber-950/70 border-amber-500/40 text-amber-300'
                : 'bg-slate-900 border-slate-800 text-slate-500 line-through'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            Cycle 2 (Day 2)
          </button>
          <button
            onClick={() => setShowCycle3(!showCycle3)}
            className={`px-2 py-0.5 rounded border transition flex items-center gap-1 ${
              showCycle3
                ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-900 border-slate-800 text-slate-500 line-through'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Cycle 3 (Current)
          </button>
          <button
            onClick={() => setShowPhysiologicalTarget(!showPhysiologicalTarget)}
            className={`px-2 py-0.5 rounded border transition hidden md:flex items-center gap-1 ${
              showPhysiologicalTarget
                ? 'bg-teal-950/70 border-teal-500/40 text-teal-300'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            Target Baseline
          </button>
        </div>
      </div>

      {/* KPI Delta Cards: Multi-Period Progress Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 text-xs">
        {/* Net iCM Conversion Gain */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span>Net Transdifferentiation Gain</span>
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-bold font-mono text-emerald-400">
              +{summary.deltaIcmNetPercent}%
            </span>
            <span className="text-[10px] text-slate-500">C3 vs C1</span>
          </div>
          <div className="text-[10px] text-teal-300/80 mt-1 font-mono">
            Cycle 1: {summary.cycle1AvgCellular.icm}% → Cycle 3: {summary.cycle3AvgCellular.icm}%
          </div>
        </div>

        {/* Stiffness Softening */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span>Compliance Recovery (Stiffness)</span>
            <TrendingDown className="h-3.5 w-3.5 text-amber-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-bold font-mono text-amber-300">
              -{summary.deltaStiffnessReductionKPa} kPa
            </span>
            <span className="text-[10px] text-slate-500">Decay</span>
          </div>
          <div className="text-[10px] text-amber-400/80 mt-1 font-mono">
            {summary.cycle1AvgCellular.stiffness} kPa → {summary.cycle3AvgCellular.stiffness} kPa (Target: 14)
          </div>
        </div>

        {/* MAP Hemodynamic Stability */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span>Hemodynamic Normalization</span>
            <HeartPulse className="h-3.5 w-3.5 text-sky-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-bold font-mono text-sky-300">
              {summary.cycle3AvgVitals.map} mmHg
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">
              (-{summary.deltaMAPStabilityPercent}%)
            </span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1 font-mono">
            Sympathetic surge dampened
          </div>
        </div>

        {/* Cardiac Output Perfusion */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span>Systemic Perfusion Gain</span>
            <Gauge className="h-3.5 w-3.5 text-teal-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-bold font-mono text-teal-300">
              +{summary.deltaCardiacOutputLMin} L/min
            </span>
            <span className="text-[10px] text-slate-500">Reserve</span>
          </div>
          <div className="text-[10px] text-teal-400/80 mt-1 font-mono">
            Circadian adherence: {summary.circadianSyncScore}%
          </div>
        </div>
      </div>

      {/* Main Recharts Visual Display */}
      {displayMode === 'DELTA_MATRIX' ? (
        /* View 3: Delta Variance Table & Matrix */
        <div className="rounded-xl border border-slate-800 bg-slate-950/90 p-4 font-mono text-xs overflow-x-auto">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
            <div className="font-semibold text-slate-200 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-teal-400" />
              <span>Multi-Cycle Recovery Delta &amp; Variance Matrix</span>
            </div>
            <span className="text-[11px] text-slate-400 font-sans">
              Statistical comparison across consecutive 24h treatment cycles
            </span>
          </div>

          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                <th className="py-2.5 px-3">Metric Dimension</th>
                <th className="py-2.5 px-3">Cycle 1 (Day 1 Baseline)</th>
                <th className="py-2.5 px-3">Cycle 2 (Day 2 Transition)</th>
                <th className="py-2.5 px-3">Cycle 3 (Current Mature)</th>
                <th className="py-2.5 px-3">C3 vs C1 Net Delta</th>
                <th className="py-2.5 px-3">Clinical Trajectory</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-[11px]">
              <tr>
                <td className="py-2 px-3 text-slate-200 font-sans font-medium flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  iCM Transdifferentiation Rate
                </td>
                <td className="py-2 px-3 text-slate-400">{summary.cycle1AvgCellular.icm}%</td>
                <td className="py-2 px-3 text-slate-300">{summary.cycle2AvgCellular.icm}%</td>
                <td className="py-2 px-3 text-emerald-400 font-bold">{summary.cycle3AvgCellular.icm}%</td>
                <td className="py-2 px-3 text-emerald-400">+{summary.deltaIcmNetPercent}%</td>
                <td className="py-2 px-3 text-emerald-400 font-sans">Optimal Lineage Maturation</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-slate-200 font-sans font-medium flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-400" />
                  Tissue Elasticity (Young's Modulus)
                </td>
                <td className="py-2 px-3 text-amber-400/80">{summary.cycle1AvgCellular.stiffness} kPa</td>
                <td className="py-2 px-3 text-amber-400">{summary.cycle2AvgCellular.stiffness} kPa</td>
                <td className="py-2 px-3 text-amber-300 font-bold">{summary.cycle3AvgCellular.stiffness} kPa</td>
                <td className="py-2 px-3 text-teal-300">-{summary.deltaStiffnessReductionKPa} kPa</td>
                <td className="py-2 px-3 text-teal-300 font-sans">Fibrotic Matrix Decoupling</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-slate-200 font-sans font-medium flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-rose-400" />
                  Heart Rate (Circadian Mean)
                </td>
                <td className="py-2 px-3 text-slate-400">{summary.cycle1AvgVitals.hr} BPM</td>
                <td className="py-2 px-3 text-slate-300">{summary.cycle2AvgVitals.hr} BPM</td>
                <td className="py-2 px-3 text-rose-300 font-bold">{summary.cycle3AvgVitals.hr} BPM</td>
                <td className="py-2 px-3 text-sky-400">
                  {(summary.cycle3AvgVitals.hr - summary.cycle1AvgVitals.hr).toFixed(0)} BPM
                </td>
                <td className="py-2 px-3 text-sky-300 font-sans">Autonomic Tone Balanced</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-slate-200 font-sans font-medium flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-sky-400" />
                  Mean Arterial Pressure (MAP)
                </td>
                <td className="py-2 px-3 text-slate-400">{summary.cycle1AvgVitals.map} mmHg</td>
                <td className="py-2 px-3 text-slate-300">{summary.cycle2AvgVitals.map} mmHg</td>
                <td className="py-2 px-3 text-sky-400 font-bold">{summary.cycle3AvgVitals.map} mmHg</td>
                <td className="py-2 px-3 text-sky-400">-{summary.deltaMAPStabilityPercent}%</td>
                <td className="py-2 px-3 text-sky-300 font-sans">Afterload Normalized</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-slate-200 font-sans font-medium flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-teal-400" />
                  Cardiac Output (Perfusion)
                </td>
                <td className="py-2 px-3 text-slate-400">{summary.cycle1AvgVitals.co} L/min</td>
                <td className="py-2 px-3 text-slate-300">{summary.cycle2AvgVitals.co} L/min</td>
                <td className="py-2 px-3 text-teal-300 font-bold">{summary.cycle3AvgVitals.co} L/min</td>
                <td className="py-2 px-3 text-teal-300">+{summary.deltaCardiacOutputLMin} L/min</td>
                <td className="py-2 px-3 text-teal-300 font-sans">Ejection Velocity Restored</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-slate-200 font-sans font-medium flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-violet-400" />
                  Conduction Velocity (Bio-Mesh)
                </td>
                <td className="py-2 px-3 text-slate-400">{summary.cycle1AvgCellular.conduction} m/s</td>
                <td className="py-2 px-3 text-slate-300">{summary.cycle2AvgCellular.conduction} m/s</td>
                <td className="py-2 px-3 text-violet-300 font-bold">{summary.cycle3AvgCellular.conduction} m/s</td>
                <td className="py-2 px-3 text-violet-400">
                  +{(summary.cycle3AvgCellular.conduction - summary.cycle1AvgCellular.conduction).toFixed(2)} m/s
                </td>
                <td className="py-2 px-3 text-violet-300 font-sans">Re-entry Shielding Active</td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : displayMode === 'LONGITUDINAL_72H' ? (
        /* View 2: 72-Hour Continuous Multi-Cycle Sequence */
        <div className="relative mt-2 h-80 sm:h-96 min-h-[380px] w-full rounded-xl border border-slate-800/80 bg-slate-950/90 p-2 sm:p-3">
          <ResponsiveContainer width="100%" height="100%" minHeight={350}>
            <ComposedChart data={longitudinalPoints} margin={{ top: 12, right: 30, left: 0, bottom: 25 }}>
              <defs>
                <linearGradient id="longIcmGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="timeLabel" stroke="#64748b" fontSize={11} tickLine={false} />
              
              {metricCategory === 'CELLULAR_RECOVERY' ? (
                <>
                  <YAxis yAxisId="left" stroke="#10b981" fontSize={11} domain={[0, 90]} unit="%" tickLine={false} />
                  <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" fontSize={11} domain={[10, 35]} unit=" kPa" tickLine={false} />
                  <ReferenceLine x="-48h" stroke="#6366f1" strokeDasharray="4 4" label={{ value: 'Cycle 2 Transition', fill: '#818cf8', fontSize: 10, position: 'top' }} />
                  <ReferenceLine x="-24h" stroke="#10b981" strokeDasharray="4 4" label={{ value: 'Cycle 3 Transition', fill: '#34d399', fontSize: 10, position: 'top' }} />
                  {showPhysiologicalTarget && (
                    <ReferenceLine yAxisId="right" y={14} stroke="#14b8a6" strokeDasharray="3 3" label={{ value: 'Target Compliance (14 kPa)', fill: '#14b8a6', fontSize: 10 }} />
                  )}
                  <Area yAxisId="left" type="monotone" dataKey="iCMConversionRate" name="iCM Conversion %" stroke="#10b981" strokeWidth={2.5} fill="url(#longIcmGrad)" unit="%" />
                  <Line yAxisId="right" type="monotone" dataKey="youngsModulusKPa" name="Tissue Stiffness" stroke="#f59e0b" strokeWidth={2.2} dot={false} unit=" kPa" />
                </>
              ) : metricCategory === 'PATIENT_VITALS' ? (
                <>
                  <YAxis yAxisId="left" stroke="#f43f5e" fontSize={11} domain={[50, 120]} unit=" BPM" tickLine={false} />
                  <YAxis yAxisId="right" orientation="right" stroke="#38bdf8" fontSize={11} domain={[60, 120]} unit=" mmHg" tickLine={false} />
                  <ReferenceLine x="-48h" stroke="#6366f1" strokeDasharray="4 4" />
                  <ReferenceLine x="-24h" stroke="#10b981" strokeDasharray="4 4" />
                  <Line yAxisId="left" type="monotone" dataKey="heartRate" name="Heart Rate" stroke="#f43f5e" strokeWidth={2} dot={false} unit=" BPM" />
                  <Line yAxisId="right" type="monotone" dataKey="meanArterialPressure" name="Mean Arterial Pressure" stroke="#38bdf8" strokeWidth={2.2} dot={false} unit=" mmHg" />
                </>
              ) : (
                <>
                  <YAxis yAxisId="left" stroke="#38bdf8" fontSize={11} domain={[60, 120]} unit=" mmHg" tickLine={false} />
                  <YAxis yAxisId="right" orientation="right" stroke="#10b981" fontSize={11} domain={[0, 90]} unit="%" tickLine={false} />
                  <ReferenceLine x="-48h" stroke="#6366f1" strokeDasharray="4 4" />
                  <ReferenceLine x="-24h" stroke="#10b981" strokeDasharray="4 4" />
                  <Line yAxisId="left" type="monotone" dataKey="meanArterialPressure" name="MAP (Stability)" stroke="#38bdf8" strokeWidth={2} dot={false} unit=" mmHg" />
                  <Line yAxisId="right" type="monotone" dataKey="iCMConversionRate" name="iCM Conversion %" stroke="#10b981" strokeWidth={2.5} dot={false} unit="%" />
                </>
              )}

              <Tooltip content={<CustomLongitudinalTooltip />} />
              <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: 8, fontSize: 11 }} />
              <Brush dataKey="timeLabel" height={22} stroke="#334155" fill="#020617" tickFormatter={() => ''} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      ) : (
        /* View 1: 24-Hour Circadian Superimposed Overlay (Primary Default Mode) */
        <div className="relative mt-2 h-80 sm:h-96 min-h-[380px] w-full rounded-xl border border-slate-800/80 bg-slate-950/90 p-2 sm:p-3">
          {/* Circadian Diurnal Phase Markers */}
          <div className="absolute top-2 left-4 z-10 flex items-center gap-3 font-mono text-[10px] text-slate-500 pointer-events-none">
            <span className="flex items-center gap-1 text-indigo-400/80">
              <Moon className="h-3 w-3" /> 00:00-06:00 Vagal Rest
            </span>
            <span className="hidden sm:flex items-center gap-1 text-amber-400/80">
              <SunMedium className="h-3 w-3" /> 06:00-18:00 Metabolic Peak
            </span>
            <span className="hidden md:flex items-center gap-1 text-teal-400/80">
              <RefreshCw className="h-3 w-3" /> 18:00-24:00 Sync Recovery
            </span>
          </div>

          <ResponsiveContainer width="100%" height="100%" minHeight={350}>
            {metricCategory === 'CELLULAR_RECOVERY' ? (
              /* Sub-View: Cellular Recovery Kinetics (iCM % vs Stiffness kPa across 3 Cycles) */
              <ComposedChart data={filteredCircadianPoints} margin={{ top: 22, right: 30, left: -5, bottom: 10 }}>
                <defs>
                  <linearGradient id="cycle3IcmArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="timeLabel" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis yAxisId="left" stroke="#10b981" fontSize={11} domain={[0, 90]} unit="%" tickLine={false} />
                <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" fontSize={11} domain={[10, 35]} unit=" kPa" tickLine={false} />
                
                {showPhysiologicalTarget && (
                  <ReferenceLine
                    yAxisId="right"
                    y={14}
                    stroke="#14b8a6"
                    strokeDasharray="4 4"
                    label={{ value: 'Normative Compliance (14 kPa)', fill: '#14b8a6', fontSize: 10, position: 'insideBottomRight' }}
                  />
                )}

                {/* Cycle 1 (Baseline Day 1) */}
                {showCycle1 && (
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="icmCycle1"
                    name="Cycle 1: iCM (Day 1 Baseline)"
                    stroke="#818cf8"
                    strokeWidth={1.8}
                    strokeDasharray="4 4"
                    dot={false}
                    unit="%"
                  />
                )}
                {showCycle1 && (
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="stiffnessCycle1"
                    name="Cycle 1: Stiffness (Day 1)"
                    stroke="#94a3b8"
                    strokeWidth={1.5}
                    strokeDasharray="3 3"
                    dot={false}
                    unit=" kPa"
                  />
                )}

                {/* Cycle 2 (Transition Day 2) */}
                {showCycle2 && (
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="icmCycle2"
                    name="Cycle 2: iCM (Day 2 Mid-Therapy)"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    strokeDasharray="5 3"
                    dot={false}
                    unit="%"
                  />
                )}
                {showCycle2 && (
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="stiffnessCycle2"
                    name="Cycle 2: Stiffness (Day 2)"
                    stroke="#fb923c"
                    strokeWidth={1.8}
                    strokeDasharray="4 2"
                    dot={false}
                    unit=" kPa"
                  />
                )}

                {/* Cycle 3 (Current 24h Mature Syncytium) */}
                {showCycle3 && (
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="icmCycle3"
                    name="Cycle 3: iCM (Current Mature)"
                    stroke="#10b981"
                    strokeWidth={2.8}
                    fill="url(#cycle3IcmArea)"
                    dot={{ r: 3, fill: '#10b981' }}
                    unit="%"
                  />
                )}
                {showCycle3 && (
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="stiffnessCycle3"
                    name="Cycle 3: Stiffness (Current)"
                    stroke="#eab308"
                    strokeWidth={2.5}
                    dot={{ r: 2.5, fill: '#eab308' }}
                    unit=" kPa"
                  />
                )}

                <Tooltip content={<CustomCircadianTooltip />} />
                <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: 10, fontSize: 11 }} />
              </ComposedChart>
            ) : metricCategory === 'PATIENT_VITALS' ? (
              /* Sub-View: Patient Hemodynamic Vitals (HR vs MAP across 3 Cycles) */
              <ComposedChart data={filteredCircadianPoints} margin={{ top: 22, right: 30, left: -5, bottom: 10 }}>
                <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="timeLabel" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis yAxisId="left" stroke="#f43f5e" fontSize={11} domain={[50, 120]} unit=" BPM" tickLine={false} />
                <YAxis yAxisId="right" orientation="right" stroke="#38bdf8" fontSize={11} domain={[60, 120]} unit=" mmHg" tickLine={false} />

                {showPhysiologicalTarget && (
                  <ReferenceLine
                    yAxisId="right"
                    y={85}
                    stroke="#38bdf8"
                    strokeDasharray="3 3"
                    label={{ value: 'Target MAP (85 mmHg)', fill: '#38bdf8', fontSize: 10, position: 'insideBottomRight' }}
                  />
                )}

                {/* Cycle 1 (Baseline Day 1) */}
                {showCycle1 && (
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="hrCycle1"
                    name="Cycle 1: HR (BPM)"
                    stroke="#fca5a5"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    dot={false}
                    unit=" BPM"
                  />
                )}
                {showCycle1 && (
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="mapCycle1"
                    name="Cycle 1: MAP (mmHg)"
                    stroke="#93c5fd"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    dot={false}
                    unit=" mmHg"
                  />
                )}

                {/* Cycle 2 (Day 2) */}
                {showCycle2 && (
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="hrCycle2"
                    name="Cycle 2: HR (BPM)"
                    stroke="#f87171"
                    strokeWidth={1.8}
                    strokeDasharray="5 3"
                    dot={false}
                    unit=" BPM"
                  />
                )}
                {showCycle2 && (
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="mapCycle2"
                    name="Cycle 2: MAP (mmHg)"
                    stroke="#60a5fa"
                    strokeWidth={1.8}
                    strokeDasharray="5 3"
                    dot={false}
                    unit=" mmHg"
                  />
                )}

                {/* Cycle 3 (Current Day 3) */}
                {showCycle3 && (
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="hrCycle3"
                    name="Cycle 3: HR (Current)"
                    stroke="#ef4444"
                    strokeWidth={2.6}
                    dot={{ r: 2.5, fill: '#ef4444' }}
                    unit=" BPM"
                  />
                )}
                {showCycle3 && (
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="mapCycle3"
                    name="Cycle 3: MAP (Current)"
                    stroke="#0284c7"
                    strokeWidth={2.6}
                    dot={{ r: 2.5, fill: '#0284c7' }}
                    unit=" mmHg"
                  />
                )}

                <Tooltip content={<CustomCircadianTooltip />} />
                <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: 10, fontSize: 11 }} />
              </ComposedChart>
            ) : (
              /* Sub-View: Cross-Coupling (Hemodynamic MAP vs Cellular iCM Conversion) */
              <ComposedChart data={filteredCircadianPoints} margin={{ top: 22, right: 30, left: -5, bottom: 10 }}>
                <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="timeLabel" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis yAxisId="left" stroke="#38bdf8" fontSize={11} domain={[60, 120]} unit=" mmHg" tickLine={false} />
                <YAxis yAxisId="right" orientation="right" stroke="#10b981" fontSize={11} domain={[0, 90]} unit="%" tickLine={false} />

                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="mapCycle1"
                  name="Baseline MAP (Cycle 1)"
                  stroke="#94a3b8"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={false}
                  unit=" mmHg"
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="mapCycle3"
                  name="Current Stabilized MAP (Cycle 3)"
                  stroke="#38bdf8"
                  strokeWidth={2.5}
                  dot={{ r: 2.5, fill: '#38bdf8' }}
                  unit=" mmHg"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="icmCycle1"
                  name="Baseline iCM % (Cycle 1)"
                  stroke="#6366f1"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={false}
                  unit="%"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="icmCycle3"
                  name="Current Mature iCM % (Cycle 3)"
                  stroke="#10b981"
                  strokeWidth={2.8}
                  dot={{ r: 3, fill: '#10b981' }}
                  unit="%"
                />

                <Tooltip content={<CustomCircadianTooltip />} />
                <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: 10, fontSize: 11 }} />
              </ComposedChart>
            )}
          </ResponsiveContainer>
        </div>
      )}

      {/* Footer & Clinical Translation Callout */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
          <span className="leading-relaxed">
            <strong className="text-slate-200">Clinical Evaluation:</strong> {summary.clinicalInterpretation}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0 font-mono text-[11px]">
          <span className="text-slate-500">Patient: {patient.mrnTokenized}</span>
          <span className="text-slate-700">|</span>
          <span className="text-teal-400 font-semibold">{patient.infarctLocation}</span>
        </div>
      </div>
    </div>
  );
};
