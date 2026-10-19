/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Predictive Cellular Recovery Modeling Component
 * Illustrative Recharts sensitivity visualizer. It renders browser-generated
 * trajectories from fixed assumptions; it is not a clinical prediction model.
 */

import React, { useState, useMemo } from 'react';
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
  ReferenceLine,
} from 'recharts';
import {
  TrendingUp,
  Activity,
  Zap,
  Sparkles,
  Layers,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sliders,
  Download,
  Info,
  ShieldCheck,
  Percent,
  Heart,
  Maximize2,
  ArrowUpRight,
  Gauge,
} from 'lucide-react';
import {
  CellularSensorMetrics,
  EpigeneticDosingState,
  NanogridPacingState,
  PatientProfile,
  PatientVitals,
} from '../../types/bdcmr';
import { MathFormula } from '../common/MathFormula';
import { SimulationBoundaryNotice } from '../ui/SimulationBoundaryNotice';

export type ProjectionHorizon = '24H' | '48H' | '7D' | '14D';
export type PredictiveMetric = 'ICM_CONVERSION' | 'STIFFNESS_KPA' | 'LVEF' | 'SCAR_AREA' | 'CONDUCTION_VELOCITY' | 'METABOLIC_ATP';

export interface PredictiveCellularRecoveryModelProps {
  patient: PatientProfile;
  cellular: CellularSensorMetrics;
  pacing: NanogridPacingState;
  dosing: EpigeneticDosingState;
  vitals?: PatientVitals;
  onOpenTherapy?: () => void;
  className?: string;
}

interface HorizonConfig {
  hours: number;
  stepHours: number;
  label: string;
  badge: string;
  description: string;
}

const HORIZON_CONFIGS: Record<ProjectionHorizon, HorizonConfig> = {
  '24H': {
    hours: 24,
    stepHours: 1,
    label: '24 Hours',
    badge: 'Acute Mechanotransduction',
    description: 'Initial electrical synchronization & early transcription activation',
  },
  '48H': {
    hours: 48,
    stepHours: 2,
    label: '48 Hours',
    badge: 'Sarcomeric Reorganization',
    description: 'Accelerated iCM reprogramming & non-equilibrium compliance shift',
  },
  '7D': {
    hours: 168,
    stepHours: 6,
    label: '7 Days',
    badge: 'Syncytial Bridging',
    description: 'Intercellular gap junction (Cx43) assembly and scar contraction',
  },
  '14D': {
    hours: 336,
    stepHours: 12,
    label: '14 Days',
    badge: 'Functional Consolidation',
    description: 'Long-term hemodynamic restoration and ventricular reverse-remodeling',
  },
};

interface MetricConfig {
  label: string;
  unit: string;
  domain: [number, number];
  color: string;
  areaGradientId: string;
  areaColor: string;
  baselineKey: string;
  thresholdValue?: number;
  thresholdLabel?: string;
  thresholdDirection?: 'ABOVE' | 'BELOW';
  formatValue: (v: number) => string;
  description: string;
}

const METRIC_CONFIGS: Record<PredictiveMetric, MetricConfig> = {
  ICM_CONVERSION: {
    label: 'iCM Transdifferentiation Rate',
    unit: '%',
    domain: [0, 100],
    color: '#06b6d4', // cyan-500
    areaGradientId: 'grad-icm',
    areaColor: '#06b6d4',
    baselineKey: 'iCMConversionRate',
    thresholdValue: 75,
    thresholdLabel: 'Therapeutic Transdifferentiation Target (75%)',
    thresholdDirection: 'ABOVE',
    formatValue: (v) => `${v.toFixed(1)}%`,
    description: 'Percentage of non-functional fibrotic fibroblasts reprogrammed into induced cardiomyocytes.',
  },
  STIFFNESS_KPA: {
    label: 'Tissue Compliance (Young\'s Modulus)',
    unit: 'kPa',
    domain: [8, 24],
    color: '#f59e0b', // amber-500
    areaGradientId: 'grad-stiffness',
    areaColor: '#f59e0b',
    baselineKey: 'tissueStiffnessKPa',
    thresholdValue: 15.0,
    thresholdLabel: 'Physiological Compliance Threshold (< 15.0 kPa)',
    thresholdDirection: 'BELOW',
    formatValue: (v) => `${v.toFixed(2)} kPa`,
    description: 'Substrate mechanical stiffness; lower values denote compliant, regenerative myocardium.',
  },
  LVEF: {
    label: 'Left Ventricular Ejection Fraction',
    unit: '%',
    domain: [20, 65],
    color: '#10b981', // emerald-500
    areaGradientId: 'grad-lvef',
    areaColor: '#10b981',
    baselineKey: 'currentLVEF',
    thresholdValue: 50.0,
    thresholdLabel: 'Normal Ventricular Systolic Target (> 50%)',
    thresholdDirection: 'ABOVE',
    formatValue: (v) => `${v.toFixed(1)}%`,
    description: 'Global LV pump function restoring stroke volume and forward cardiac output.',
  },
  SCAR_AREA: {
    label: 'Active Infarct Scar Volume',
    unit: 'cm²',
    domain: [0, 30],
    color: '#ec4899', // pink-500
    areaGradientId: 'grad-scar',
    areaColor: '#ec4899',
    baselineKey: 'currentScarAreaCm2',
    thresholdValue: 10.0,
    thresholdLabel: 'Minimal Residual Scar Target (< 10.0 cm²)',
    thresholdDirection: 'BELOW',
    formatValue: (v) => `${v.toFixed(1)} cm²`,
    description: '4D MRI calibrated late-gadolinium infarct burden undergoing cellular replacement.',
  },
  CONDUCTION_VELOCITY: {
    label: 'Syncytial Conduction Velocity',
    unit: 'm/s',
    domain: [0.3, 1.0],
    color: '#8b5cf6', // purple-500
    areaGradientId: 'grad-cv',
    areaColor: '#8b5cf6',
    baselineKey: 'conductionVelocityMs',
    thresholdValue: 0.70,
    thresholdLabel: 'Arrhythmia-Resistant Syncytial Boundary (0.70 m/s)',
    thresholdDirection: 'ABOVE',
    formatValue: (v) => `${v.toFixed(2)} m/s`,
    description: 'Action potential propagation speed across nanogrid-bridged border zone.',
  },
  METABOLIC_ATP: {
    label: 'Metabolic & ATP Flux Rate',
    unit: 'nmol/mg/h',
    domain: [40, 160],
    color: '#14b8a6', // teal-500
    areaGradientId: 'grad-atp',
    areaColor: '#14b8a6',
    baselineKey: 'atpFlux',
    thresholdValue: 120.0,
    thresholdLabel: 'Optimal Cardiomyocyte Bioenergetic Flux (120 nmol/mg/h)',
    thresholdDirection: 'ABOVE',
    formatValue: (v) => `${v.toFixed(1)} nmol/mg/h`,
    description: 'Mitochondrial oxidative phosphorylation rate supporting electromechanical contraction.',
  },
};

interface ForecastDataPoint {
  hour: number;
  timeLabel: string;
  // Selected metric fields
  projectedMedian: number;
  projectedLower95: number;
  projectedUpper95: number;
  uncoupledNoPacing: number;
  counterfactualNoTherapy: number;
  // All metrics for normalized comparison
  icmNorm: number;
  stiffnessNorm: number;
  lvefNorm: number;
  scarNorm: number;
  // Efficacy telemetry at that timestamp
  instantaneousVelocity: number;
  instantaneousSynergy: number;
}

export const PredictiveCellularRecoveryModel: React.FC<PredictiveCellularRecoveryModelProps> = ({
  patient,
  cellular,
  pacing,
  dosing,
  vitals,
  onOpenTherapy,
  className = '',
}) => {
  // State for horizon and metric selection
  const [horizon, setHorizon] = useState<ProjectionHorizon>('48H');
  const [metric, setMetric] = useState<PredictiveMetric>('ICM_CONVERSION');
  const [viewMode, setViewMode] = useState<'SINGLE_METRIC' | 'MULTI_TRACK_NORMALIZED'>('SINGLE_METRIC');
  const [showSensitivityEnvelope, setShowSensitivityEnvelope] = useState<boolean>(true);
  const [showCounterfactuals, setShowCounterfactuals] = useState<boolean>(true);
  const [showMathFormula, setShowMathFormula] = useState<boolean>(false);

  // Interactive What-If simulation tuning state
  const [whatIfActive, setWhatIfActive] = useState<boolean>(false);
  const [simInfusionRate, setSimInfusionRate] = useState<number>(dosing.infusionRateNlMin);
  const [simPacingCurrent, setSimPacingCurrent] = useState<number>(pacing.subthresholdCurrentMA);
  const [simFormulation, setSimFormulation] = useState<EpigeneticDosingState['formulation']>(dosing.formulation);
  const [simPacingActive, setSimPacingActive] = useState<boolean>(pacing.activePacingEnabled);

  // Active efficacy parameters (either live or what-if)
  const activeInfusion = whatIfActive ? simInfusionRate : dosing.infusionRateNlMin;
  const activeCurrent = whatIfActive ? simPacingCurrent : pacing.subthresholdCurrentMA;
  const activeFormulation = whatIfActive ? simFormulation : dosing.formulation;
  const activePacing = whatIfActive ? simPacingActive : pacing.activePacingEnabled;

  // Efficacy Factors Calculation
  const efficacySummary = useMemo(() => {
    // 1. Pacing Efficacy Factor (eta_pace):
    // Optimal subthreshold current is ~0.85 mA with high conduction velocity and intact channels
    let pacingFactor = 0.15;
    if (activePacing) {
      const currentRatio = Math.min(2.0, Math.max(0.1, activeCurrent / 0.85));
      // Optimal range between 0.75 and 1.25 mA
      const currentEfficacy = currentRatio <= 1.2
        ? 0.5 + 0.5 * currentRatio
        : Math.max(0.6, 1.1 - (currentRatio - 1.2) * 0.4); // High current causes mild micro-reentry risk

      const velocityEfficacy = Math.min(1.3, Math.max(0.6, pacing.conductionVelocityMs / 0.74));
      const channelRatio = (pacing.activeElectrodeChannels || 16) / 16;
      pacingFactor = Number((currentEfficacy * velocityEfficacy * channelRatio).toFixed(3));
    }

    // 2. Dosing Efficacy Factor (eta_dose):
    const rateRatio = Math.min(1.8, Math.max(0.2, activeInfusion / 240));
    const formulationMultiplier = activeFormulation === 'GHMT_MIR1_133'
      ? 1.48
      : activeFormulation === 'GHMT'
      ? 1.25
      : 1.0;
    const pidMultiplier = 0.85 + (dosing.pidOutputEffort / 100) * 0.25;
    const dosingFactor = Number((rateRatio * formulationMultiplier * pidMultiplier).toFixed(3));

    // 3. Bio-Coupled Electromechanical Synergy Multiplier (chi_synergy):
    // Electrical pacing opens voltage-dependent membrane permeabilization, enhancing LNP mRNA transdifferentiation
    const synergyMultiplier = Number((1.0 + 0.65 * (activePacing ? pacingFactor : 0.08) * dosingFactor).toFixed(3));

    // Overall Integrated Model Efficacy Index (0-100%)
    const modelEfficacyPercent = Number(
      Math.min(99.4, Math.max(12.0, ((pacingFactor * 0.4 + dosingFactor * 0.6) * synergyMultiplier * 52))).toFixed(1)
    );

    return {
      pacingFactor,
      dosingFactor,
      synergyMultiplier,
      modelEfficacyPercent,
    };
  }, [
    activePacing,
    activeCurrent,
    activeInfusion,
    activeFormulation,
    pacing.conductionVelocityMs,
    pacing.activeElectrodeChannels,
    dosing.pidOutputEffort,
  ]);

  // Generate Recharts timeline series based on chosen horizon and efficacy
  const { dataPoints, milestoneComplianceHour, finalGains } = useMemo(() => {
    const config = HORIZON_CONFIGS[horizon];
    const totalHours = config.hours;
    const step = config.stepHours;

    const baseStiffness = cellular.youngsModulusKPa || patient.tissueStiffnessKPa || 18.4;
    const baseICM = cellular.iCMConversionEstimate || patient.iCMConversionRate || 64.8;
    const baseLVEF = patient.currentLVEF || 42.0;
    const baseScar = patient.currentScarAreaCm2 || 11.2;
    const baseCV = pacing.conductionVelocityMs || 0.74;
    const baseATP = 82.0 + (patient.iCMConversionRate * 0.45);

    // Theoretical asymptotic targets
    const targetStiffness = 11.2; // Healthy compliance (kPa)
    const targetICM = 94.0;       // Max conversion (%)
    const targetLVEF = 56.0;      // Normal systolic ejection (%)
    const targetScar = 3.5;       // Residual micro-scar (cm²)
    const targetCV = 0.84;        // Native Purkinje/myocardial syncytium (m/s)
    const targetATP = 145.0;      // Cellular ATP throughput

    // Kinetic rate constants scaled by efficacy factors
    const kStiffness = 0.016 * efficacySummary.dosingFactor * efficacySummary.synergyMultiplier;
    const kICM = 0.022 * efficacySummary.dosingFactor * (efficacySummary.pacingFactor * 0.5 + 0.5) * efficacySummary.synergyMultiplier;
    const kLVEF = 0.011 * efficacySummary.synergyMultiplier * Math.sqrt(efficacySummary.pacingFactor);
    const kScar = 0.014 * efficacySummary.dosingFactor * efficacySummary.synergyMultiplier;
    const kCV = 0.020 * (activePacing ? efficacySummary.pacingFactor : 0.05);
    const kATP = 0.018 * efficacySummary.synergyMultiplier;

    // Uncoupled kinetics (Dosing without pacing)
    const kStiffnessUncoupled = kStiffness * 0.58;
    const kICMUncoupled = kICM * 0.52;
    const kLVEFUncoupled = kLVEF * 0.44;
    const kScarUncoupled = kScar * 0.60;
    const kCVUncoupled = 0.002;
    const kATPUncoupled = kATP * 0.55;

    // Counterfactual drift (No treatment: progressive adverse remodeling & fibrotic stiffening)
    const kDriftStiffness = 0.0035; // Progressive stiffening
    const kDriftLVEF = -0.0025;      // Progressive pump failure

    const points: ForecastDataPoint[] = [];
    let complianceHour: number | null = null;

    for (let h = 0; h <= totalHours; h += step) {
      // Sensitivity band grows with sqrt of time (Bayesian credible interval)
      const uncertainty = Math.sqrt(h) * 0.14;

      // 1. ICM Conversion
      const icmMedian = Math.min(targetICM, baseICM + (targetICM - baseICM) * (1 - Math.exp(-kICM * h)));
      const icmLower = Math.max(baseICM, icmMedian - uncertainty * 2.8);
      const icmUpper = Math.min(99.0, icmMedian + uncertainty * 2.5);
      const icmUncoupled = Math.min(targetICM, baseICM + (targetICM - baseICM) * (1 - Math.exp(-kICMUncoupled * h)));
      const icmCounterfactual = Math.max(30.0, baseICM - 0.015 * h);

      // 2. Tissue Stiffness (Young's modulus in kPa)
      const stiffnessMedian = targetStiffness + (baseStiffness - targetStiffness) * Math.exp(-kStiffness * h);
      const stiffnessLower = Math.max(targetStiffness - 0.8, stiffnessMedian - uncertainty * 1.6);
      const stiffnessUpper = Math.min(26.0, stiffnessMedian + uncertainty * 1.8);
      const stiffnessUncoupled = targetStiffness + (baseStiffness - targetStiffness) * Math.exp(-kStiffnessUncoupled * h);
      const stiffnessCounterfactual = Math.min(28.0, baseStiffness + (28.0 - baseStiffness) * (1 - Math.exp(-kDriftStiffness * h)));

      if (complianceHour === null && stiffnessMedian <= 15.0) {
        complianceHour = h;
      }

      // 3. LVEF
      const lvefMedian = Math.min(targetLVEF, baseLVEF + (targetLVEF - baseLVEF) * (1 - Math.exp(-kLVEF * h)));
      const lvefLower = Math.max(baseLVEF, lvefMedian - uncertainty * 1.4);
      const lvefUpper = Math.min(64.0, lvefMedian + uncertainty * 1.4);
      const lvefUncoupled = Math.min(targetLVEF, baseLVEF + (targetLVEF - baseLVEF) * (1 - Math.exp(-kLVEFUncoupled * h)));
      const lvefCounterfactual = Math.max(18.0, baseLVEF * Math.exp(kDriftLVEF * h));

      // 4. Scar Area
      const scarMedian = Math.max(targetScar, targetScar + (baseScar - targetScar) * Math.exp(-kScar * h));
      const scarLower = Math.max(2.0, scarMedian - uncertainty * 0.9);
      const scarUpper = Math.min(32.0, scarMedian + uncertainty * 0.9);
      const scarUncoupled = Math.max(targetScar, targetScar + (baseScar - targetScar) * Math.exp(-kScarUncoupled * h));
      const scarCounterfactual = Math.min(30.0, baseScar + 0.01 * h);

      // 5. Conduction Velocity
      const cvMedian = Math.min(targetCV, baseCV + (targetCV - baseCV) * (1 - Math.exp(-kCV * h)));
      const cvLower = Math.max(0.35, cvMedian - uncertainty * 0.035);
      const cvUpper = Math.min(0.95, cvMedian + uncertainty * 0.035);
      const cvUncoupled = Math.min(targetCV, baseCV + (targetCV - baseCV) * (1 - Math.exp(-kCVUncoupled * h)));
      const cvCounterfactual = Math.max(0.30, baseCV - 0.0008 * h);

      // 6. Metabolic ATP
      const atpMedian = Math.min(targetATP, baseATP + (targetATP - baseATP) * (1 - Math.exp(-kATP * h)));
      const atpLower = Math.max(45.0, atpMedian - uncertainty * 3.2);
      const atpUpper = Math.min(170.0, atpMedian + uncertainty * 3.2);
      const atpUncoupled = Math.min(targetATP, baseATP + (targetATP - baseATP) * (1 - Math.exp(-kATPUncoupled * h)));
      const atpCounterfactual = Math.max(35.0, baseATP - 0.08 * h);

      // Select active metric projection
      let activeMedian = icmMedian;
      let activeLower = icmLower;
      let activeUpper = icmUpper;
      let activeUncoupled = icmUncoupled;
      let activeCounterfactual = icmCounterfactual;

      if (metric === 'STIFFNESS_KPA') {
        activeMedian = stiffnessMedian;
        activeLower = stiffnessLower;
        activeUpper = stiffnessUpper;
        activeUncoupled = stiffnessUncoupled;
        activeCounterfactual = stiffnessCounterfactual;
      } else if (metric === 'LVEF') {
        activeMedian = lvefMedian;
        activeLower = lvefLower;
        activeUpper = lvefUpper;
        activeUncoupled = lvefUncoupled;
        activeCounterfactual = lvefCounterfactual;
      } else if (metric === 'SCAR_AREA') {
        activeMedian = scarMedian;
        activeLower = scarLower;
        activeUpper = scarUpper;
        activeUncoupled = scarUncoupled;
        activeCounterfactual = scarCounterfactual;
      } else if (metric === 'CONDUCTION_VELOCITY') {
        activeMedian = cvMedian;
        activeLower = cvLower;
        activeUpper = cvUpper;
        activeUncoupled = cvUncoupled;
        activeCounterfactual = cvCounterfactual;
      } else if (metric === 'METABOLIC_ATP') {
        activeMedian = atpMedian;
        activeLower = atpLower;
        activeUpper = atpUpper;
        activeUncoupled = atpUncoupled;
        activeCounterfactual = atpCounterfactual;
      }

      // Normalized recovery score (0 to 100%)
      const icmNorm = Math.min(100, Math.max(0, ((icmMedian - baseICM) / (targetICM - baseICM)) * 100));
      const stiffnessNorm = Math.min(100, Math.max(0, ((baseStiffness - stiffnessMedian) / (baseStiffness - targetStiffness)) * 100));
      const lvefNorm = Math.min(100, Math.max(0, ((lvefMedian - baseLVEF) / (targetLVEF - baseLVEF)) * 100));
      const scarNorm = Math.min(100, Math.max(0, ((baseScar - scarMedian) / (baseScar - targetScar)) * 100));

      const timeLabel = h === 0 ? 'T+0' : h < 72 ? `T+${h}h` : `T+${(h / 24).toFixed(1)}d`;

      points.push({
        hour: h,
        timeLabel,
        projectedMedian: Number(activeMedian.toFixed(2)),
        projectedLower95: Number(activeLower.toFixed(2)),
        projectedUpper95: Number(activeUpper.toFixed(2)),
        uncoupledNoPacing: Number(activeUncoupled.toFixed(2)),
        counterfactualNoTherapy: Number(activeCounterfactual.toFixed(2)),
        icmNorm: Number(icmNorm.toFixed(1)),
        stiffnessNorm: Number(stiffnessNorm.toFixed(1)),
        lvefNorm: Number(lvefNorm.toFixed(1)),
        scarNorm: Number(scarNorm.toFixed(1)),
        instantaneousVelocity: Number((kICM * Math.exp(-0.01 * h) * 100).toFixed(2)),
        instantaneousSynergy: efficacySummary.synergyMultiplier,
      });
    }

    const firstPt = points[0];
    const lastPt = points[points.length - 1];

    const finalGains = {
      deltaValue: Number((lastPt.projectedMedian - firstPt.projectedMedian).toFixed(2)),
      deltaPercent: Number((((lastPt.projectedMedian - firstPt.projectedMedian) / (firstPt.projectedMedian || 1)) * 100).toFixed(1)),
      synergyAdvantagePercent: Number((((lastPt.projectedMedian - lastPt.uncoupledNoPacing) / (lastPt.uncoupledNoPacing || 1)) * 100).toFixed(1)),
    };

    return {
      dataPoints: points,
      milestoneComplianceHour: complianceHour,
      finalGains,
    };
  }, [horizon, metric, cellular, patient, pacing, efficacySummary, activePacing]);

  // Preset Scenario Handlers
  const handleApplyPreset = (scenario: 'NOMINAL' | 'HIGH_SYNERGY' | 'ENERGY_SAVER' | 'UNCOUPLED_DOSING' | 'RESET') => {
    if (scenario === 'RESET') {
      setWhatIfActive(false);
      setSimInfusionRate(dosing.infusionRateNlMin);
      setSimPacingCurrent(pacing.subthresholdCurrentMA);
      setSimFormulation(dosing.formulation);
      setSimPacingActive(pacing.activePacingEnabled);
      return;
    }

    setWhatIfActive(true);
    if (scenario === 'NOMINAL') {
      setSimInfusionRate(240);
      setSimPacingCurrent(0.85);
      setSimFormulation('GHMT');
      setSimPacingActive(true);
    } else if (scenario === 'HIGH_SYNERGY') {
      setSimInfusionRate(360);
      setSimPacingCurrent(1.05);
      setSimFormulation('GHMT_MIR1_133');
      setSimPacingActive(true);
    } else if (scenario === 'ENERGY_SAVER') {
      setSimInfusionRate(180);
      setSimPacingCurrent(0.55);
      setSimFormulation('GMT');
      setSimPacingActive(true);
    } else if (scenario === 'UNCOUPLED_DOSING') {
      setSimInfusionRate(280);
      setSimPacingCurrent(0.0);
      setSimFormulation('GHMT');
      setSimPacingActive(false);
    }
  };

  // Export Forecast Data as CSV
  const handleExportCSV = () => {
    const activeConfig = METRIC_CONFIGS[metric];
    const headers = [
      'Hour',
      'TimeLabel',
      `Median_${metric}_${activeConfig.unit}`,
      'Lower95_Sensitivity',
      'Upper95_Sensitivity',
      'Uncoupled_NoPacing',
      'Counterfactual_NoTherapy',
      'Normalized_Recovery_Percent',
    ];
    const rows = dataPoints.map((pt) => [
      pt.hour,
      pt.timeLabel,
      pt.projectedMedian,
      pt.projectedLower95,
      pt.projectedUpper95,
      pt.uncoupledNoPacing,
      pt.counterfactualNoTherapy,
      pt.icmNorm,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `BDCMR_Predictive_${metric}_${horizon}_${patient.mrnTokenized}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const metricConfig = METRIC_CONFIGS[metric];
  const horizonConfig = HORIZON_CONFIGS[horizon];

  return (
    <div className={`bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-2xl backdrop-blur-sm ${className}`}>
      {/* Header bar with clinical title & badge */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <TrendingUp className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-white tracking-tight">
                  Illustrative Cellular-State Sensitivity Model
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-teal-950 text-teal-300 border border-teal-800/80">
                  SYNTHETIC SENSITIVITY MODEL
                </span>
                {whatIfActive && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800 animate-pulse">
                    WHAT-IF SIMULATION ACTIVE
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Browser-generated trajectories parameterized by simulated pacing (<span className="text-teal-300 font-mono font-semibold">{activeCurrent.toFixed(2)} mA</span>) and dosing inputs (<span className="text-sky-300 font-mono font-semibold">{activeInfusion} nl/min</span> {activeFormulation}); these are not calibrated patient forecasts.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls: Horizon & CSV Export */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Horizon Selector */}
          <div className="flex items-center bg-slate-950/80 rounded-lg p-1 border border-slate-800 text-xs">
            {(['24H', '48H', '7D', '14D'] as ProjectionHorizon[]).map((h) => (
              <button
                key={h}
                onClick={() => setHorizon(h)}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                  horizon === h
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {h}
              </button>
            ))}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-950/80 rounded-lg p-1 border border-slate-800 text-xs">
            <button
              onClick={() => setViewMode('SINGLE_METRIC')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                viewMode === 'SINGLE_METRIC'
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Focused Metric
            </button>
            <button
              onClick={() => setViewMode('MULTI_TRACK_NORMALIZED')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                viewMode === 'MULTI_TRACK_NORMALIZED'
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Multi-Track Overview
            </button>
          </div>

          {/* Export Forecast CSV */}
          <button
            onClick={handleExportCSV}
            title="Export projection timeseries to CSV"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition"
          >
            <Download className="w-3.5 h-3.5 text-teal-400" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      <div className="mt-4">
        <SimulationBoundaryNotice kind="REGENERATION" />
      </div>

      {/* Real-time Efficacy & Synergy Indicator Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-4">
        {/* Pacing Efficacy */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-teal-400" /> Pacing Efficacy (η<sub>pace</sub>)
            </span>
            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${activePacing ? 'bg-teal-950 text-teal-300' : 'bg-rose-950 text-rose-300'}`}>
              {activePacing ? 'ACTIVE' : 'UNPACED'}
            </span>
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-white">{(efficacySummary.pacingFactor * 100).toFixed(0)}%</span>
            <span className="text-[11px] text-slate-400 font-mono">({activeCurrent} mA @ {pacing.pulseFrequencyBpm} bpm)</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-teal-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, efficacySummary.pacingFactor * 100)}%` }}
            />
          </div>
        </div>

        {/* Dosing Efficacy */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" /> Dosing Efficacy (η<sub>dose</sub>)
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-sky-950 text-sky-300">
              {activeFormulation}
            </span>
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-white">{(efficacySummary.dosingFactor * 100).toFixed(0)}%</span>
            <span className="text-[11px] text-slate-400 font-mono">({activeInfusion} nl/min)</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-sky-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, efficacySummary.dosingFactor * 100)}%` }}
            />
          </div>
        </div>

        {/* Synergistic Coupling Multiplier */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-emerald-400" /> Coupled Synergy (χ<sub>syn</sub>)
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300">
              +{((efficacySummary.synergyMultiplier - 1) * 100).toFixed(0)}% BOOST
            </span>
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-emerald-400">{efficacySummary.synergyMultiplier.toFixed(2)}×</span>
            <span className="text-[11px] text-slate-400">vs isolated mono-delivery</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (efficacySummary.synergyMultiplier / 2.0) * 100)}%` }}
            />
          </div>
        </div>

        {/* Key Milestone Indicator */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-400" /> Compliance Milestone
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-950 text-amber-300">
              {'< 15.0 kPa'}
            </span>
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-amber-300">
              {milestoneComplianceHour !== null ? `T+${milestoneComplianceHour}h` : 'Reached'}
            </span>
            <span className="text-[11px] text-slate-400">
              {milestoneComplianceHour !== null ? `(~${(milestoneComplianceHour / 24).toFixed(1)} days)` : 'Compliant'}
            </span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1 truncate">
            Target LV wall stress normalization
          </p>
        </div>
      </div>

      {/* Metric Selector Tabs (Single Metric View) */}
      {viewMode === 'SINGLE_METRIC' && (
        <div className="flex flex-wrap gap-1.5 mb-4 p-1 bg-slate-950/80 rounded-lg border border-slate-800">
          {(Object.keys(METRIC_CONFIGS) as PredictiveMetric[]).map((key) => {
            const cfg = METRIC_CONFIGS[key];
            const isSelected = metric === key;
            return (
              <button
                key={key}
                onClick={() => setMetric(key)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: cfg.color }}
                />
                <span>{cfg.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Recharts Trajectory Visualizer */}
      <div className="relative bg-slate-950/70 border border-slate-800/90 rounded-xl p-4">
        {/* Chart Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3 text-xs">
          <div>
            <span className="text-slate-300 font-medium">
              {viewMode === 'SINGLE_METRIC' ? metricConfig.label : 'Normalized Multi-Track Recovery Timelines (0-100%)'}
            </span>
            <span className="text-slate-500 ml-2">
              Horizon: <strong className="text-white">{horizonConfig.label}</strong> ({horizonConfig.badge})
            </span>
          </div>

          {/* Visibility toggles */}
          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            {viewMode === 'SINGLE_METRIC' && (
              <>
                <label className="flex items-center gap-1.5 cursor-pointer hover:text-slate-200">
                  <input
                    type="checkbox"
                    checked={showSensitivityEnvelope}
                    onChange={(e) => setShowSensitivityEnvelope(e.target.checked)}
                    className="rounded border-slate-700 text-teal-600 focus:ring-0"
                  />
                  <span>95% Credible Envelope</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer hover:text-slate-200">
                  <input
                    type="checkbox"
                    checked={showCounterfactuals}
                    onChange={(e) => setShowCounterfactuals(e.target.checked)}
                    className="rounded border-slate-700 text-teal-600 focus:ring-0"
                  />
                  <span>Counterfactual Baselines</span>
                </label>
              </>
            )}
            <button
              onClick={() => setShowMathFormula(!showMathFormula)}
              className="text-teal-400 hover:text-teal-300 flex items-center gap-1 transition"
            >
              <Info className="w-3.5 h-3.5" />
              <span>{showMathFormula ? 'Hide Formula' : 'Equations'}</span>
            </button>
          </div>
        </div>

        {/* Mathematical Formulation Explainer Drawer */}
        {showMathFormula && (
          <div className="mb-4 p-3 bg-slate-900 border border-teal-500/30 rounded-lg text-xs text-slate-300 animate-fadeIn">
            <div className="font-semibold text-teal-300 mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Closed-Loop Pacing & Epigenetic Recovery Formulation</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] font-mono text-slate-400">
              <div className="p-2 bg-slate-950 rounded border border-slate-800">
                <span className="text-teal-400 font-bold block mb-1">1. Coupled Synergy Formulation:</span>
                <p className="leading-relaxed">
                  χ<sub>syn</sub> = 1.0 + 0.65 · η<sub>pace</sub>(I<sub>sub</sub>, v<sub>c</sub>) · η<sub>dose</sub>(R<sub>inf</sub>, Φ<sub>form</sub>)
                </p>
                <span className="text-[10px] text-slate-500 block mt-1">
                  Accounts for voltage-gated nanogap electroporation accelerating mRNA LNP capture.
                </span>
              </div>
              <div className="p-2 bg-slate-950 rounded border border-slate-800">
                <span className="text-sky-400 font-bold block mb-1">2. Kinetic Relaxation Equation:</span>
                <p className="leading-relaxed">
                  y(t) = y<sub>∞</sub> + (y<sub>0</sub> - y<sub>∞</sub>) · exp(-k · χ<sub>syn</sub> · t) ± δ<sub>Bayes</sub>(t)
                </p>
                <span className="text-[10px] text-slate-500 block mt-1">
                  Nonlinear asymptotic saturation with Bayesian credible sensitivity bounds δ<sub>Bayes</sub>(t) ∝ √(t).
                </span>
              </div>
            </div>
          </div>
        )}

        {/* The Recharts Container */}
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {viewMode === 'SINGLE_METRIC' ? (
              <ComposedChart
                data={dataPoints}
                margin={{ top: 10, right: 25, left: -10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id={metricConfig.areaGradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={metricConfig.areaColor} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={metricConfig.areaColor} stopOpacity={0.02} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />

                <XAxis
                  dataKey="timeLabel"
                  stroke="#94a3b8"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  tickLine={{ stroke: '#475569' }}
                />

                <YAxis
                  domain={metricConfig.domain}
                  stroke="#94a3b8"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  tickLine={{ stroke: '#475569' }}
                  tickFormatter={(val) => `${val}${metricConfig.unit}`}
                />

                {/* 95% Bayesian Credible Sensitivity Area */}
                {showSensitivityEnvelope && (
                  <Area
                    type="monotone"
                    dataKey="projectedUpper95"
                    stroke="none"
                    fill={`url(#${metricConfig.areaGradientId})`}
                    name="95% Bayesian Confidence Envelope"
                  />
                )}

                {/* Counterfactual Drift (No Therapy) */}
                {showCounterfactuals && (
                  <Line
                    type="monotone"
                    dataKey="counterfactualNoTherapy"
                    stroke="#ef4444"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    dot={false}
                    name="Counterfactual (No Therapy / Drift)"
                  />
                )}

                {/* Uncoupled Dosing (No Bio-Mesh Pacing) */}
                {showCounterfactuals && (
                  <Line
                    type="monotone"
                    dataKey="uncoupledNoPacing"
                    stroke="#94a3b8"
                    strokeWidth={1.5}
                    strokeDasharray="2 2"
                    dot={false}
                    name="Uncoupled Dosing (No Pacing)"
                  />
                )}

                {/* Main Projected Trajectory Line */}
                <Line
                  type="monotone"
                  dataKey="projectedMedian"
                  stroke={metricConfig.color}
                  strokeWidth={2.8}
                  dot={{ r: 3, fill: metricConfig.color, stroke: '#0f172a', strokeWidth: 1.5 }}
                  activeDot={{ r: 6, fill: '#ffffff', stroke: metricConfig.color, strokeWidth: 2 }}
                  name="Projected Trajectory (Coupled Active)"
                />

                {/* Clinical Target Reference Line */}
                {metricConfig.thresholdValue !== undefined && (
                  <ReferenceLine
                    y={metricConfig.thresholdValue}
                    stroke="#f59e0b"
                    strokeDasharray="5 5"
                    strokeWidth={1.5}
                    label={{
                      value: metricConfig.thresholdLabel || 'Target',
                      fill: '#fbbf24',
                      fontSize: 10,
                      position: 'insideTopRight',
                    }}
                  />
                )}

                {/* Tooltip */}
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload || !payload.length) return null;
                    const data = payload[0].payload as ForecastDataPoint;
                    return (
                      <div className="bg-slate-950/95 border border-slate-700/80 rounded-lg p-3 shadow-2xl backdrop-blur-md text-xs max-w-xs z-50">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2">
                          <span className="font-semibold text-white">{label}</span>
                          <span className="text-[10px] font-mono text-teal-400 bg-teal-950/80 px-1.5 py-0.5 rounded border border-teal-800/80">
                            {data.hour} Hours Post-T+0
                          </span>
                        </div>
                        <div className="space-y-1.5 font-mono text-[11px]">
                          <div className="flex items-center justify-between text-white">
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: metricConfig.color }} />
                              <span>Projected Expectation:</span>
                            </span>
                            <span className="font-bold text-teal-300">
                              {data.projectedMedian} {metricConfig.unit}
                            </span>
                          </div>
                          {showSensitivityEnvelope && (
                            <div className="flex items-center justify-between text-slate-400 text-[10px]">
                              <span>95% Credible Bounds:</span>
                              <span>[{data.projectedLower95} - {data.projectedUpper95}] {metricConfig.unit}</span>
                            </div>
                          )}
                          {showCounterfactuals && (
                            <>
                              <div className="flex items-center justify-between text-slate-400 text-[10px]">
                                <span>Uncoupled (No Pacing):</span>
                                <span>{data.uncoupledNoPacing} {metricConfig.unit}</span>
                              </div>
                              <div className="flex items-center justify-between text-rose-400 text-[10px]">
                                <span>Natural Drift (No Rx):</span>
                                <span>{data.counterfactualNoTherapy} {metricConfig.unit}</span>
                              </div>
                            </>
                          )}
                          <div className="pt-1.5 mt-1 border-t border-slate-800 flex items-center justify-between text-[10px] text-emerald-400">
                            <span>Coupled Synergy Gain:</span>
                            <span>+{(data.projectedMedian - data.uncoupledNoPacing).toFixed(2)} {metricConfig.unit}</span>
                          </div>
                        </div>
                      </div>
                    );
                  }}
                />

                <Legend
                  verticalAlign="top"
                  align="right"
                  height={28}
                  iconType="plainline"
                  wrapperStyle={{ fontSize: 11, paddingBottom: 6 }}
                />
              </ComposedChart>
            ) : (
              /* Multi-Track Normalized Recovery Curves (0 - 100% Normalized) */
              <ComposedChart
                data={dataPoints}
                margin={{ top: 10, right: 25, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                <XAxis
                  dataKey="timeLabel"
                  stroke="#94a3b8"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  tickLine={{ stroke: '#475569' }}
                />
                <YAxis
                  domain={[0, 100]}
                  stroke="#94a3b8"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  tickLine={{ stroke: '#475569' }}
                  tickFormatter={(val) => `${val}%`}
                />
                <Line
                  type="monotone"
                  dataKey="icmNorm"
                  stroke="#06b6d4"
                  strokeWidth={2.2}
                  dot={false}
                  name="iCM Conversion Rate"
                />
                <Line
                  type="monotone"
                  dataKey="stiffnessNorm"
                  stroke="#f59e0b"
                  strokeWidth={2.2}
                  dot={false}
                  name="Compliance Restoration"
                />
                <Line
                  type="monotone"
                  dataKey="lvefNorm"
                  stroke="#10b981"
                  strokeWidth={2.2}
                  dot={false}
                  name="LVEF Normalization"
                />
                <Line
                  type="monotone"
                  dataKey="scarNorm"
                  stroke="#ec4899"
                  strokeWidth={2.2}
                  dot={false}
                  name="Scar Burden Reduction"
                />
                <ReferenceLine
                  y={100}
                  stroke="#64748b"
                  strokeDasharray="4 4"
                  label={{ value: '100% Functional Recovery Target', fill: '#94a3b8', fontSize: 10 }}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload || !payload.length) return null;
                    const data = payload[0].payload as ForecastDataPoint;
                    return (
                      <div className="bg-slate-950/95 border border-slate-700/80 rounded-lg p-3 shadow-2xl backdrop-blur-md text-xs max-w-xs z-50">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-1 mb-2">
                          <span className="font-semibold text-white">{label}</span>
                          <span className="text-[10px] font-mono text-teal-400">Normalized Progress</span>
                        </div>
                        <div className="space-y-1 font-mono text-[11px]">
                          <div className="flex justify-between text-cyan-300">
                            <span>iCM Transdifferentiation:</span>
                            <span>{data.icmNorm}%</span>
                          </div>
                          <div className="flex justify-between text-amber-300">
                            <span>Tissue Compliance:</span>
                            <span>{data.stiffnessNorm}%</span>
                          </div>
                          <div className="flex justify-between text-emerald-300">
                            <span>LVEF Pump Recovery:</span>
                            <span>{data.lvefNorm}%</span>
                          </div>
                          <div className="flex justify-between text-pink-300">
                            <span>Scar Area Reduction:</span>
                            <span>{data.scarNorm}%</span>
                          </div>
                        </div>
                      </div>
                    );
                  }}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  height={28}
                  iconType="plainline"
                  wrapperStyle={{ fontSize: 11, paddingBottom: 6 }}
                />
              </ComposedChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Bottom projection summary stats */}
        <div className="mt-3 pt-3 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-teal-500/10 text-teal-400">
              <ArrowUpRight className="w-4 h-4" />
            </span>
            <div>
              <span className="text-slate-400 block text-[11px]">Projected Horizon Gain</span>
              <span className="text-white font-mono font-semibold">
                {finalGains.deltaValue >= 0 ? `+${finalGains.deltaValue}` : finalGains.deltaValue} {metricConfig.unit}{' '}
                <span className="text-teal-400 font-normal">({finalGains.deltaPercent >= 0 ? `+${finalGains.deltaPercent}%` : `${finalGains.deltaPercent}%`})</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-emerald-500/10 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <div>
              <span className="text-slate-400 block text-[11px]">Bio-Mesh Coupled Advantage</span>
              <span className="text-emerald-300 font-mono font-semibold">
                +{finalGains.synergyAdvantagePercent}% accelerated
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-sky-500/10 text-sky-400">
              <Heart className="w-4 h-4" />
            </span>
            <div>
              <span className="text-slate-400 block text-[11px]">Target Infarct Substrate</span>
              <span className="text-slate-200 font-mono text-[11px] truncate">
                {patient.infarctLocation} ({patient.mrnTokenized})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive What-If Pacing & Dosing Simulation Controls */}
      <div className="mt-4 bg-slate-950/60 border border-slate-800 rounded-xl p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-teal-400" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white">
              Interactive Efficacy Sensitivity & What-If Sandbox
            </h4>
            <span className="text-[10px] text-slate-500">
              (Adjust parameters to evaluate timeline impact)
            </span>
          </div>

          {/* Quick Scenario Preset Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
            <span className="text-slate-500 mr-1">Presets:</span>
            <button
              onClick={() => handleApplyPreset('NOMINAL')}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              Nominal
            </button>
            <button
              onClick={() => handleApplyPreset('HIGH_SYNERGY')}
              className="px-2 py-0.5 rounded bg-teal-950 hover:bg-teal-900 text-teal-300 border border-teal-800/80 transition"
            >
              High Synergy
            </button>
            <button
              onClick={() => handleApplyPreset('ENERGY_SAVER')}
              className="px-2 py-0.5 rounded bg-amber-950 hover:bg-amber-900 text-amber-300 border border-amber-800/80 transition"
            >
              Conservative
            </button>
            <button
              onClick={() => handleApplyPreset('UNCOUPLED_DOSING')}
              className="px-2 py-0.5 rounded bg-purple-950 hover:bg-purple-900 text-purple-300 border border-purple-800/80 transition"
            >
              Uncoupled
            </button>
            {whatIfActive && (
              <button
                onClick={() => handleApplyPreset('RESET')}
                className="px-2 py-0.5 rounded bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 transition flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset to Live</span>
              </button>
            )}
          </div>
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Subthreshold Pacing Current */}
          <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-slate-300 font-medium">Subthreshold Current:</span>
              <span className="font-mono font-bold text-teal-300">{activeCurrent.toFixed(2)} mA</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="2.0"
              step="0.05"
              value={activeCurrent}
              onChange={(e) => {
                setWhatIfActive(true);
                setSimPacingCurrent(parseFloat(e.target.value));
              }}
              className="w-full accent-teal-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
              <span>0.0 (Off)</span>
              <span>0.85 (Optimum)</span>
              <span>2.0 mA</span>
            </div>
          </div>

          {/* Epigenetic Infusion Rate */}
          <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-slate-300 font-medium">LNP Infusion Rate:</span>
              <span className="font-mono font-bold text-sky-300">{activeInfusion} nl/min</span>
            </div>
            <input
              type="range"
              min="0"
              max="450"
              step="10"
              value={activeInfusion}
              onChange={(e) => {
                setWhatIfActive(true);
                setSimInfusionRate(parseInt(e.target.value, 10));
              }}
              className="w-full accent-sky-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
              <span>0 nl/min</span>
              <span>240 (Nominal)</span>
              <span>450 (Max Cap)</span>
            </div>
          </div>

          {/* Vector Formulation */}
          <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
            <span className="text-slate-300 font-medium block mb-1.5">Epigenetic Formulation:</span>
            <select
              value={activeFormulation}
              onChange={(e) => {
                setWhatIfActive(true);
                setSimFormulation(e.target.value as EpigeneticDosingState['formulation']);
              }}
              className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-xs text-white font-mono focus:border-teal-500 focus:outline-none"
            >
              <option value="GMT">GMT (Gata4/Mef2c/Tbx5 - 1.0×)</option>
              <option value="GHMT">GHMT (+ Hand2 - 1.25×)</option>
              <option value="GHMT_MIR1_133">GHMT + miR-1/133 (1.48×)</option>
            </select>
            <span className="text-[10px] text-slate-500 mt-1 block">
              Vector potency modifier
            </span>
          </div>

          {/* Active Pacing Toggle & Therapy Link */}
          <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="text-slate-300 font-medium block mb-1">Bio-Mesh Pacing:</span>
              <label className="flex items-center gap-2 cursor-pointer mt-1">
                <input
                  type="checkbox"
                  checked={activePacing}
                  onChange={(e) => {
                    setWhatIfActive(true);
                    setSimPacingActive(e.target.checked);
                  }}
                  className="rounded border-slate-700 text-teal-600 focus:ring-0"
                />
                <span className={`text-xs font-semibold ${activePacing ? 'text-teal-300' : 'text-slate-400'}`}>
                  {activePacing ? 'Conductive Shielding Active' : 'Passive (No Stimulation)'}
                </span>
              </label>
            </div>
            {onOpenTherapy && (
              <button
                onClick={onOpenTherapy}
                className="mt-2 text-left text-[11px] text-teal-400 hover:text-teal-300 underline underline-offset-2 flex items-center gap-1"
              >
                <span>Open Therapy Workspace</span>
                <span>→</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
