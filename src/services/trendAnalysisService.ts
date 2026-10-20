/**
 * Historical 24-Hour Cellular Telemetry & Regenerative Drift Analytics Service
 * Generates continuous hourly time-series data for myocardial tissue remodeling.
 */

import { PatientProfile } from '../types/bdcmr';

export interface HourlyTelemetryPoint {
  timeLabel: string;             // e.g. "T-24h", "T-18h", ... "Now"
  hourOffset: number;            // -24 to 0
  timestamp: number;
  youngsModulusKPa: number;      // Actual stiffness
  projectedStiffnessKPa: number; // Ideal model trajectory
  iCMConversionRate: number;     // Actual % transdifferentiated
  projectedConversionRate: number;// Expected %
  conductionVelocityMs: number;  // m/s
  singleCellImpedanceOhms: number; // Ω
  wallStressKPa: number;         // kPa
  lnpInfusionRateNlMin: number;  // nl/min
  driftDeviationPercent: number; // % deviation from PINN model
}

export interface RegenerativeDriftSummary {
  driftStatus: 'OPTIMAL_TRAJECTORY' | 'MILD_DRIFT_SLOWED' | 'FIBROTIC_PLATEAU_DETECTED';
  driftScorePercent: number;     // e.g. +1.8% deviation
  conversionVelocityPerHour: number; // % / hr
  stiffnessDecayRatePerHour: number; // kPa / hr
  targetAchievementEstimateHours: number; // estimated hours until target
  recommendation: string;
}

export function generate24HourTrendData(
  patient: PatientProfile,
  hasSimulatedDrift: boolean = false
): { points: HourlyTelemetryPoint[]; summary: RegenerativeDriftSummary } {
  const points: HourlyTelemetryPoint[] = [];
  const now = Date.now();

  const currentStiffness = patient.tissueStiffnessKPa;
  const currentConversion = patient.iCMConversionRate;

  // 24 hours ago baseline values
  const startStiffness = currentStiffness + 5.8;
  const startConversion = Math.max(5, currentConversion - 14.5);
  const startVelocity = 0.52;
  const startImpedance = 1180;

  for (let i = 24; i >= 0; i--) {
    const progressFraction = (24 - i) / 24;
    const hourTimestamp = now - i * 3600 * 1000;
    const timeLabel = i === 0 ? 'Now' : `-${i}h`;

    // Mathematical progression models (exponential decay of stiffness, sigmoidal growth of iCMs)
    let actualStiffness = startStiffness - (startStiffness - currentStiffness) * Math.pow(progressFraction, 0.85);
    let projectedStiffness = startStiffness - (startStiffness - currentStiffness) * progressFraction;

    let actualConversion = startConversion + (currentConversion - startConversion) * Math.pow(progressFraction, 0.9);
    let projectedConversion = startConversion + (currentConversion - startConversion) * progressFraction;

    // Simulate transient drift in last 8 hours if toggle active
    if (hasSimulatedDrift && i <= 8) {
      actualConversion -= 3.8 * Math.sin(((8 - i) / 8) * Math.PI);
      actualStiffness += 2.4 * Math.sin(((8 - i) / 8) * Math.PI);
    }

    // Physiological micro-oscillations (circadian / metabolic)
    const diurnalNoise = Math.sin(i * 0.4) * 0.3;
    actualStiffness = Number((actualStiffness + diurnalNoise).toFixed(1));
    projectedStiffness = Number(projectedStiffness.toFixed(1));

    actualConversion = Number((actualConversion + Math.cos(i * 0.4) * 0.25).toFixed(1));
    projectedConversion = Number(projectedConversion.toFixed(1));

    const conductionVelocity = Number((startVelocity + (0.74 - startVelocity) * progressFraction + Math.sin(i * 0.5) * 0.02).toFixed(2));
    const singleCellImpedance = Math.round(startImpedance + (1420 - startImpedance) * progressFraction + Math.cos(i * 0.3) * 15);
    const wallStress = Number((14.8 - progressFraction * 2.4 + Math.sin(i * 0.6) * 0.8).toFixed(1));
    const lnpInfusion = Math.round(140 + (actualStiffness > 20 ? 35 : 0) + Math.sin(i * 0.7) * 20);

    const driftDeviationPercent = Number(((actualConversion - projectedConversion) / projectedConversion * 100).toFixed(1));

    points.push({
      timeLabel,
      hourOffset: -i,
      timestamp: hourTimestamp,
      youngsModulusKPa: actualStiffness,
      projectedStiffnessKPa: projectedStiffness,
      iCMConversionRate: actualConversion,
      projectedConversionRate: projectedConversion,
      conductionVelocityMs: conductionVelocity,
      singleCellImpedanceOhms: singleCellImpedance,
      wallStressKPa: wallStress,
      lnpInfusionRateNlMin: lnpInfusion,
      driftDeviationPercent,
    });
  }

  // Summary statistics
  const conversionVelocity = Number(((currentConversion - startConversion) / 24).toFixed(2));
  const stiffnessDecayRate = Number(((startStiffness - currentStiffness) / 24).toFixed(2));

  let driftStatus: RegenerativeDriftSummary['driftStatus'] = 'OPTIMAL_TRAJECTORY';
  let recommendation = 'Reprogramming kinetics strictly aligned with PINN biophysical model. Maintain automated dosing schedule.';

  if (hasSimulatedDrift) {
    driftStatus = 'MILD_DRIFT_SLOWED';
    recommendation = 'Transient stagnation in iCM conversion velocity observed in T-8h window. Recommend closed-loop micro-dosing boost +15 nl/min.';
  }

  const summary: RegenerativeDriftSummary = {
    driftStatus,
    driftScorePercent: hasSimulatedDrift ? -4.6 : +1.4,
    conversionVelocityPerHour: conversionVelocity,
    stiffnessDecayRatePerHour: stiffnessDecayRate,
    targetAchievementEstimateHours: Math.round((75 - currentConversion) / (conversionVelocity || 0.5)),
    recommendation,
  };

  return { points, summary };
}
