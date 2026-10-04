/**
 * Patient Trend Analysis Dashboard Component
 * Powered by Recharts for 24-Hour Historical Cellular Telemetry & Regenerative Drift Detection.
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
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Layers,
  Zap,
  Gauge,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Download,
  Info,
  Clock,
  Sparkles,
} from 'lucide-react';
import { PatientProfile } from '../types/bdcmr';
import { generate24HourTrendData, HourlyTelemetryPoint } from '../services/trendAnalysisService';

interface PatientTrendAnalysisProps {
  patient: PatientProfile;
  onOpenPrediction?: () => void;
}

export const PatientTrendAnalysis: React.FC<PatientTrendAnalysisProps> = ({
  patient,
  onOpenPrediction,
}) => {
  const [activeMetricView, setActiveMetricView] = useState<'REMODELING' | 'ELECTROMECHANICAL' | 'DOSING_CORRELATION'>('REMODELING');
  const [timeWindowHours, setTimeWindowHours] = useState<24 | 12 | 6>(24);
  const [simulateDrift, setSimulateDrift] = useState<boolean>(false);
  const [showTooltipInfo, setShowTooltipInfo] = useState<boolean>(false);

  // Generate 24-hour trend series
  const { points: allPoints, summary } = useMemo(() => {
    return generate24HourTrendData(patient, simulateDrift);
  }, [patient, simulateDrift]);

  // Filter according to selected time window (24, 12, or 6 hours)
  const chartData = useMemo(() => {
    if (timeWindowHours === 24) return allPoints;
    return allPoints.slice(allPoints.length - timeWindowHours);
  }, [allPoints, timeWindowHours]);

  const handleExportCSV = () => {
    const headers = [
      'Timestamp',
      'TimeLabel',
      'YoungsModulusKPa',
      'ProjectedStiffnessKPa',
      'iCMConversionRate',
      'ProjectedConversionRate',
      'ConductionVelocityMs',
      'SingleCellImpedanceOhms',
      'WallStressKPa',
      'LNPInfusionRateNlMin',
      'DriftDeviationPercent',
    ];
    const rows = chartData.map((p) => [
      new Date(p.timestamp).toISOString(),
      p.timeLabel,
      p.youngsModulusKPa,
      p.projectedStiffnessKPa,
      p.iCMConversionRate,
      p.projectedConversionRate,
      p.conductionVelocityMs,
      p.singleCellImpedanceOhms,
      p.wallStressKPa,
      p.lnpInfusionRateNlMin,
      p.driftDeviationPercent,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `BDCMR-Trend-24h-${patient.mrnTokenized}-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // Custom Dark Clinical Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-slate-800 bg-slate-950/95 p-3 text-xs shadow-2xl backdrop-blur-md">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 font-mono text-[11px] text-slate-400">
            <span>Time: {label}</span>
            <span className="text-teal-400 font-semibold">{patient.mrnTokenized}</span>
          </div>
          <div className="mt-2 space-y-1 font-mono">
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
    <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-teal-400" />
            <h3 className="text-sm font-semibold text-slate-100">
              Patient Trend Analysis &amp; Regenerative Drift Monitoring
            </h3>
            <button
              onClick={() => setShowTooltipInfo(!showTooltipInfo)}
              className="text-slate-400 hover:text-slate-200 transition"
              title="Electrophysiology & Drift Info"
            >
              <Info className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="text-xs text-slate-400 mt-0.5">
            Continuous 24-hour longitudinal tracking of cellular transdifferentiation and tissue elasticity kinetics
          </div>
        </div>

        {/* Top Controls: Metric Tabs & Time Window */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Metric View Tabs */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setActiveMetricView('REMODELING')}
              className={`px-3 py-1 font-medium rounded transition ${
                activeMetricView === 'REMODELING'
                  ? 'bg-slate-800 text-teal-300'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Remodeling Kinetics
            </button>
            <button
              onClick={() => setActiveMetricView('ELECTROMECHANICAL')}
              className={`px-3 py-1 font-medium rounded transition ${
                activeMetricView === 'ELECTROMECHANICAL'
                  ? 'bg-slate-800 text-teal-300'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Nanogrid &amp; Impedance
            </button>
            <button
              onClick={() => setActiveMetricView('DOSING_CORRELATION')}
              className={`px-3 py-1 font-medium rounded transition ${
                activeMetricView === 'DOSING_CORRELATION'
                  ? 'bg-slate-800 text-teal-300'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              LNP Dosing vs Stress
            </button>
          </div>

          {/* Time Window Buttons */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 font-mono">
            {([24, 12, 6] as (24 | 12 | 6)[]).map((hr) => (
              <button
                key={hr}
                onClick={() => setTimeWindowHours(hr)}
                className={`px-2 py-0.5 rounded transition ${
                  timeWindowHours === hr
                    ? 'bg-teal-500/20 text-teal-300 font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {hr}h
              </button>
            ))}
          </div>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            title="Export 24-hour time series as CSV"
            className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1 text-slate-300 hover:border-slate-700 hover:text-white transition"
          >
            <Download className="h-3.5 w-3.5 text-teal-400" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          {/* Project 48h Outcome Forecast */}
          {onOpenPrediction && (
            <button
              onClick={onOpenPrediction}
              title="Project 48-Hour Regenerative Velocity & Outcome Trajectory"
              className="flex items-center gap-1 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-emerald-300 hover:bg-emerald-500/20 hover:text-white transition font-medium"
            >
              <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
              <span>Project 48h Velocity</span>
            </button>
          )}
        </div>
      </div>

      {showTooltipInfo && (
        <div className="my-3 rounded-lg border border-teal-500/20 bg-teal-950/20 p-3 text-xs text-slate-300 leading-relaxed">
          <div className="font-semibold text-teal-300 mb-1">
            Section 3.3 Clinical Drift Detection (Phase C Structural Monitoring)
          </div>
          Compares patient-specific tissue remodeling against the Physics-Informed Neural Network (PINN) projected recovery curve. Deviations in slope indicate either epigenetic stagnation (requiring cocktail recalibration) or transient mechanical wall stress spikes requiring sub-threshold pacing modulation.
        </div>
      )}

      {/* KPI & Regenerative Drift Status Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-3 text-xs">
        {/* Trajectory Status */}
        <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-2.5">
          <div className="text-slate-400 text-[11px]">24-Hour Drift Trajectory</div>
          <div className="mt-1 flex items-center gap-1.5 font-semibold text-sm">
            {summary.driftStatus === 'OPTIMAL_TRAJECTORY' ? (
              <>
                <CheckCircle className="h-4 w-4 text-emerald-400" />
                <span className="text-emerald-400 font-mono">Aligned (+{summary.driftScorePercent}%)</span>
              </>
            ) : (
              <>
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                <span className="text-amber-400 font-mono">Drift Drift ({summary.driftScorePercent}%)</span>
              </>
            )}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">PINN Model Residual: &lt; 2.1%</div>
        </div>

        {/* Conversion Velocity */}
        <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-2.5">
          <div className="text-slate-400 text-[11px]">iCM Lineage Velocity</div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-lg font-bold font-mono text-emerald-400">
              +{summary.conversionVelocityPerHour}
            </span>
            <span className="text-xs text-slate-400 font-mono">% / hr</span>
          </div>
          <div className="text-[10px] text-teal-400 mt-0.5 font-mono">Nominal Range: 0.40 - 0.75</div>
        </div>

        {/* Stiffness Decay Rate */}
        <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-2.5">
          <div className="text-slate-400 text-[11px]">Stiffness Softening Rate</div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-lg font-bold font-mono text-amber-300">
              -{summary.stiffnessDecayRatePerHour}
            </span>
            <span className="text-xs text-slate-400 font-mono">kPa / hr</span>
          </div>
          <div className="text-[10px] text-emerald-400 mt-0.5">Continuous collagen matrix turnover</div>
        </div>

        {/* Target Forecast */}
        <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-2.5">
          <div className="text-slate-400 text-[11px]">Estimated to 75% Remodeling</div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-lg font-bold font-mono text-teal-300">
              ~{summary.targetAchievementEstimateHours}
            </span>
            <span className="text-xs text-slate-400 font-mono">hours</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Phase B Target Trajectory</div>
        </div>
      </div>

      {/* Main Recharts Container */}
      <div className="relative mt-2 h-72 w-full rounded-lg border border-slate-800/80 bg-slate-950/90 p-2">
        <ResponsiveContainer width="100%" height="100%">
          {activeMetricView === 'REMODELING' ? (
            /* View 1: Remodeling Kinetics (iCM Conversion % vs Young's Modulus Stiffness kPa) */
            <ComposedChart data={chartData} margin={{ top: 10, right: 25, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="icmAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="stiffnessAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="timeLabel" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis
                yAxisId="left"
                stroke="#10b981"
                fontSize={11}
                domain={[0, 90]}
                unit="%"
                tickLine={false}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#f59e0b"
                fontSize={11}
                domain={[10, 40]}
                unit=" kPa"
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: 8, fontSize: 11 }}
              />
              <ReferenceLine
                yAxisId="right"
                y={14.0}
                label={{ value: 'Target Compliance (14 kPa)', fill: '#14b8a6', fontSize: 10, position: 'insideBottomRight' }}
                stroke="#14b8a6"
                strokeDasharray="4 4"
              />
              {/* Actual iCM Lineage Conversion */}
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="iCMConversionRate"
                name="Actual iCM Conversion"
                stroke="#10b981"
                strokeWidth={2.5}
                fill="url(#icmAreaGrad)"
                unit="%"
              />
              {/* PINN Model Target Conversion */}
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="projectedConversionRate"
                name="PINN Projected iCM"
                stroke="#38bdf8"
                strokeWidth={1.8}
                strokeDasharray="4 4"
                dot={false}
                unit="%"
              />
              {/* Actual Young's Modulus Stiffness */}
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="youngsModulusKPa"
                name="Tissue Stiffness"
                stroke="#f59e0b"
                strokeWidth={2.2}
                dot={{ r: 2.5, fill: '#f59e0b' }}
                unit=" kPa"
              />
              {/* Projected Stiffness Decoupling */}
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="projectedStiffnessKPa"
                name="Projected Stiffness"
                stroke="#fb923c"
                strokeWidth={1.5}
                strokeDasharray="3 3"
                dot={false}
                unit=" kPa"
              />
            </ComposedChart>
          ) : activeMetricView === 'ELECTROMECHANICAL' ? (
            /* View 2: Nanogrid Conduction Velocity vs Single-Cell Membrane Impedance */
            <ComposedChart data={chartData} margin={{ top: 10, right: 25, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="impedanceAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="timeLabel" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis
                yAxisId="left"
                stroke="#14b8a6"
                fontSize={11}
                domain={[0.3, 0.9]}
                unit=" m/s"
                tickLine={false}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#38bdf8"
                fontSize={11}
                domain={[1000, 1600]}
                unit=" Ω"
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: 8, fontSize: 11 }}
              />
              <ReferenceLine
                yAxisId="left"
                y={0.70}
                label={{ value: 'Physiological Conduction (> 0.70 m/s)', fill: '#10b981', fontSize: 10 }}
                stroke="#10b981"
                strokeDasharray="4 4"
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="singleCellImpedanceOhms"
                name="Membrane Impedance |Z|"
                stroke="#38bdf8"
                strokeWidth={2}
                fill="url(#impedanceAreaGrad)"
                unit=" Ω"
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="conductionVelocityMs"
                name="Nanogrid Velocity"
                stroke="#14b8a6"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#14b8a6' }}
                unit=" m/s"
              />
            </ComposedChart>
          ) : (
            /* View 3: LNP Infusion Rate (nl/min) vs Systolic Wall Stress (kPa) */
            <ComposedChart data={chartData} margin={{ top: 10, right: 25, left: -10, bottom: 0 }}>
              <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="timeLabel" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis
                yAxisId="left"
                stroke="#38bdf8"
                fontSize={11}
                domain={[100, 240]}
                unit=" nl/min"
                tickLine={false}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#f43f5e"
                fontSize={11}
                domain={[8, 22]}
                unit=" kPa"
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: 8, fontSize: 11 }}
              />
              <Bar
                yAxisId="left"
                dataKey="lnpInfusionRateNlMin"
                name="LNP Infusion Rate"
                fill="#0284c7"
                opacity={0.7}
                unit=" nl/min"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="wallStressKPa"
                name="Systolic Wall Stress"
                stroke="#f43f5e"
                strokeWidth={2.2}
                dot={{ r: 2.5, fill: '#f43f5e' }}
                unit=" kPa"
              />
            </ComposedChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Bottom Sandbox Drift Simulator Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pt-3 border-t border-slate-800/80 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Clinical Recommendation:</span>
          <span className="text-slate-200 font-medium">{summary.recommendation}</span>
        </div>

        {/* Toggle to simulate drift for demonstration */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSimulateDrift(!simulateDrift)}
            className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-[11px] font-medium transition ${
              simulateDrift
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <AlertTriangle className="h-3 w-3" />
            <span>{simulateDrift ? 'Clear Drift Simulation' : 'Simulate 8h Drift Anomaly'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
