/**
 * Illustrative Regeneration Projection Engine
 * Generates synthetic 48-hour sensitivity trajectories from fixed equations.
 * It is not a validated patient forecast or treatment model.
 */

import { CellularSensorMetrics, EpigeneticDosingState, NanogridPacingState, PatientProfile, PatientVitals } from '../types/bdcmr';

export interface ProjectionHourPoint {
  hour: number;
  label: string;
  // Tissue Elasticity / Stiffness (Young's Modulus in kPa)
  stiffnessKPaMedian: number;
  stiffnessKPaLowerSensitivity: number;
  stiffnessKPaUpperSensitivity: number;
  // iCM Transdifferentiation Rate (%)
  iCMConversionMedian: number;
  iCMConversionLowerSensitivity: number;
  iCMConversionUpperSensitivity: number;
  // Left Ventricular Ejection Fraction (%)
  lvefMedian: number;
  lvefLowerSensitivity: number;
  lvefUpperSensitivity: number;
  // Active Infarct Scar Area (cm²)
  scarAreaCm2Median: number;
  // Hourly Repair Velocity (% recovery / hr)
  repairVelocityPercentPerHr: number;
}

export interface PredictionSummary {
  patientId: string;
  projectionHorizonHours: number;
  projectedStiffnessDeltaKPa: number;
  projectedICMDeltaPercent: number;
  projectedLvefDeltaPercent: number;
  projectedScarDeltaCm2: number;
  timeToComplianceThresholdHours: number; // Time until Young's modulus < 15.0 kPa
  meanRepairVelocity24h: number; // %/day
  simulationInterpretation: string;
  hourlyPoints: ProjectionHourPoint[];
}

export interface WhatIfParameters {
  infusionRateMultiplier: number; // e.g. 0.8 to 1.3 (relative to nominal)
  pacingCurrentMultiplier: number; // e.g. 0.8 to 1.2
}

/**
 * Computes an illustrative 48-hour trajectory with deterministic sensitivity bounds.
 */
export function calculate48HourRegenerativeProjection(
  patient: PatientProfile,
  cellular: CellularSensorMetrics,
  vitals: PatientVitals,
  dosing: EpigeneticDosingState,
  pacing: NanogridPacingState,
  whatIf: WhatIfParameters = { infusionRateMultiplier: 1.0, pacingCurrentMultiplier: 1.0 }
): PredictionSummary {
  const currentStiffness = cellular.youngsModulusKPa;
  const currentICM = cellular.iCMConversionEstimate;
  const currentLVEF = patient.currentLVEF;
  const currentScar = patient.currentScarAreaCm2;

  // Kinetic parameters influenced by LNP rate and Nanogrid conduction
  const effectiveInfusionRate = dosing.infusionRateNlMin * whatIf.infusionRateMultiplier;
  const effectivePacingCurrent = pacing.subthresholdCurrentMA * whatIf.pacingCurrentMultiplier;

  // LNP delivery potency index (1.0 = nominal 240 nl/min)
  const lnpPotency = Math.min(1.4, Math.max(0.6, effectiveInfusionRate / 240));
  // Electromechanical sync factor based on subthreshold current and conduction velocity
  const pacingSyncFactor = Math.min(1.3, Math.max(0.7, effectivePacingCurrent / 0.85));

  // Decay constants for 48h horizon
  const stiffnessDecayRatePerHour = 0.0075 * lnpPotency * (pacingSyncFactor * 0.5 + 0.5);
  const asymptoticStiffness = 11.5; // Compliant healthy myocardial stiffness (10-12 kPa)

  const icmGrowthRatePerHour = 0.42 * lnpPotency;
  const lvefGrowthRatePerHour = 0.082 * lnpPotency * pacingSyncFactor;
  const scarShrinkRatePerHour = 0.058 * lnpPotency;

  const hourlyPoints: ProjectionHourPoint[] = [];

  for (let h = 0; h <= 48; h += 4) {
    const timeRatio = h / 48;
    const sensitivityBand = Math.sqrt(h) * 0.18;

    // Exponential relaxation of Young's Modulus towards healthy baseline
    const stiffness = asymptoticStiffness + (currentStiffness - asymptoticStiffness) * Math.exp(-stiffnessDecayRatePerHour * h);
    const stiffnessMedian = Number(stiffness.toFixed(2));
    const stiffnessLower = Number(Math.max(asymptoticStiffness - 0.5, stiffness - sensitivityBand * 1.8).toFixed(2));
    const stiffnessUpper = Number((stiffness + sensitivityBand * 1.8).toFixed(2));

    // iCM conversion kinetics (sigmoidal/saturating growth)
    const icmGain = icmGrowthRatePerHour * h * (1 - (currentICM + icmGrowthRatePerHour * h) / 105);
    const icmMedian = Number(Math.min(96, currentICM + icmGain).toFixed(1));
    const icmLower = Number(Math.max(currentICM, icmMedian - sensitivityBand * 2.2).toFixed(1));
    const icmUpper = Number(Math.min(99, icmMedian + sensitivityBand * 2.2).toFixed(1));

    // LVEF trajectory
    const lvefGain = lvefGrowthRatePerHour * h;
    const lvefMedian = Number(Math.min(58, currentLVEF + lvefGain).toFixed(1));
    const lvefLower = Number(Math.max(currentLVEF, lvefMedian - sensitivityBand * 1.2).toFixed(1));
    const lvefUpper = Number(Math.min(62, lvefMedian + sensitivityBand * 1.2).toFixed(1));

    // Scar area reduction
    const scarMedian = Number(Math.max(4.0, currentScar - scarShrinkRatePerHour * h).toFixed(1));

    // Instantaneous repair velocity (%/hr)
    const repairVelocity = Number((0.38 * lnpPotency * Math.exp(-0.012 * h)).toFixed(2));

    hourlyPoints.push({
      hour: h,
      label: h === 0 ? 'Now (T+0)' : `T+${h}h`,
      stiffnessKPaMedian: stiffnessMedian,
      stiffnessKPaLowerSensitivity: stiffnessLower,
      stiffnessKPaUpperSensitivity: stiffnessUpper,
      iCMConversionMedian: icmMedian,
      iCMConversionLowerSensitivity: icmLower,
      iCMConversionUpperSensitivity: icmUpper,
      lvefMedian: lvefMedian,
      lvefLowerSensitivity: lvefLower,
      lvefUpperSensitivity: lvefUpper,
      scarAreaCm2Median: scarMedian,
      repairVelocityPercentPerHr: repairVelocity,
    });
  }

  const finalPoint = hourlyPoints[hourlyPoints.length - 1];
  const projectedStiffnessDeltaKPa = Number((finalPoint.stiffnessKPaMedian - currentStiffness).toFixed(2));
  const projectedICMDeltaPercent = Number((finalPoint.iCMConversionMedian - currentICM).toFixed(1));
  const projectedLvefDeltaPercent = Number((finalPoint.lvefMedian - currentLVEF).toFixed(1));
  const projectedScarDeltaCm2 = Number((finalPoint.scarAreaCm2Median - currentScar).toFixed(1));

  // Calculate hours until stiffness drops below 15.0 kPa (target physiological threshold)
  let timeToCompliance = 48;
  const foundPoint = hourlyPoints.find((p) => p.stiffnessKPaMedian <= 15.0);
  if (foundPoint) {
    timeToCompliance = foundPoint.hour;
  } else if (currentStiffness <= 15.0) {
    timeToCompliance = 0;
  }

  const meanRepairVelocity24h = Number(((projectedICMDeltaPercent / 2) * 1.1).toFixed(1));
  return {
    patientId: patient.id,
    projectionHorizonHours: 48,
    projectedStiffnessDeltaKPa,
    projectedICMDeltaPercent,
    projectedLvefDeltaPercent,
    projectedScarDeltaCm2,
    timeToComplianceThresholdHours: timeToCompliance,
    meanRepairVelocity24h,
    simulationInterpretation:
      projectedStiffnessDeltaKPa <= -2.5
        ? `In this illustrative scenario, modeled stiffness crosses the configured threshold (<15.0 kPa) within ~${timeToCompliance} hours while modeled LVEF changes by +${projectedLvefDeltaPercent}%.`
        : `In this illustrative scenario, the fixed equations produce a +${projectedICMDeltaPercent}% change in the modeled iCM conversion measure over 48 hours.`,
    hourlyPoints,
  };
}
