/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Electrophysiology & Multi-Lead Telemetry Synthesizer
 * Simulates cellular action potential V_m(t), calcium transients,
 * and clinical Lead II ECG with dynamic ST-elevation / recovery dynamics.
 */

import { ElectrophysiologyTelemetry, ECGDataPoint } from '../../types/bdcmr';

export interface CardiacCycleState {
  cyclePhaseTimeMs: number; // 0 to cycleLengthMs
  cycleLengthMs: number; // 60000 / BPM (e.g. 800 ms at 75 BPM)
  isDepolarizing: boolean;
  isRepolarizing: boolean;
  leadIIVoltageMv: number;
  membranePotentialMv: number;
  intracellularCalciumUm: number;
}

/**
 * Computes instantaneous cellular and macroscopic ECG signals given the current cardiac cycle phase.
 */
export function computeCardiacTelemetryStep(
  cycleTimeMs: number,
  bpm: number,
  infarctSeverity: number, // 0 (healthy) to 1.0 (severe transmural MI)
  rescueProgressPercent: number, // 0 to 100%
  isBioMeshStimActive: boolean
): { telemetry: ElectrophysiologyTelemetry; ecgPoint: ECGDataPoint } {
  const cycleLengthMs = 60000 / bpm;
  const t = cycleTimeMs % cycleLengthMs;

  // Effective ischemic injury factor (mitigated by rescue progress and active bio-mesh)
  const effectiveInfarct = Math.max(0, infarctSeverity * (1.0 - rescueProgressPercent / 100) * (isBioMeshStimActive ? 0.45 : 1.0));

  // Cellular action potential V_m(t)
  // Healthy: Resting -85 mV, Peak +25 mV, Plateau ~200 ms, APD90 ~310 ms
  // Ischemic: Resting -55 mV, Peak +5 mV, APD shortened or alternans, slow upstroke
  const baseResting = -85 + effectiveInfarct * 30; // -85 to -55 mV
  const basePeak = 25 - effectiveInfarct * 22; // 25 to +3 mV
  const apd90 = Math.max(160, 310 - effectiveInfarct * 110 + (isBioMeshStimActive ? 40 : 0));

  let vM = baseResting;
  let calciumUm = 0.1 + effectiveInfarct * 0.4; // Diastolic Ca

  // Cardiac activation sequence timing (in ms)
  const pStart = 40;
  const pDuration = 80;
  const qrsStart = 160;
  const qrsDuration = 85 + effectiveInfarct * 45; // QRS widening in bundle branch block / ischemia
  const stTStart = qrsStart + qrsDuration;
  const tDuration = 180;

  // Lead II ECG Voltage (in mV, standard 1 mV calibration)
  let ecgMv = 0;

  // 1. P-Wave (Atrial Depolarization)
  if (t >= pStart && t < pStart + pDuration) {
    const phase = (t - pStart) / pDuration;
    ecgMv += 0.15 * Math.sin(Math.PI * phase);
  }

  // 2. QRS Complex (Ventricular Depolarization)
  if (t >= qrsStart && t < qrsStart + qrsDuration) {
    const phase = (t - qrsStart) / qrsDuration;
    // Q dip
    if (phase < 0.18) {
      ecgMv -= 0.12 * Math.sin((Math.PI * phase) / 0.18);
    }
    // R peak (tall spike, attenuated by transmural scar)
    else if (phase >= 0.18 && phase < 0.65) {
      const rPhase = (phase - 0.18) / (0.65 - 0.18);
      const rAmplitude = 1.35 * (1.0 - effectiveInfarct * 0.55);
      ecgMv += rAmplitude * Math.sin(Math.PI * rPhase);
      
      // Fast cellular upstroke (Phase 0)
      vM = baseResting + (basePeak - baseResting) * Math.sin((Math.PI * rPhase) / 2);
      calciumUm += 1.4 * (1.0 - effectiveInfarct * 0.5) * rPhase;
    }
    // S wave
    else {
      const sPhase = (phase - 0.65) / (1.0 - 0.65);
      ecgMv -= (0.35 + effectiveInfarct * 0.25) * Math.sin(Math.PI * sPhase);
    }
  }

  // 3. ST Segment & T-Wave (Ventricular Repolarization)
  // ST elevation is the hallmark of acute transmural myocardial ischemia (STEMI)
  const stElevation = effectiveInfarct * 0.42; // Up to 0.42 mV (4.2 mm) ST elevation!
  
  if (t >= stTStart && t < stTStart + tDuration + 80) {
    const stPhase = (t - stTStart) / (tDuration + 80);
    
    // Cellular plateau and repolarization (Phases 2 & 3)
    if (stPhase < 0.6) {
      vM = basePeak * 0.6 * (1.0 - stPhase * 0.5);
      calciumUm = Math.max(0.12, 1.2 * (1.0 - stPhase * 0.8));
    } else {
      vM = baseResting + (basePeak * 0.3) * Math.exp(-(stPhase - 0.6) * 6.0);
      calciumUm = Math.max(0.1, 0.3 * Math.exp(-(stPhase - 0.6) * 5.0));
    }

    // Macroscopic ST segment deviation
    if (stPhase < 0.35) {
      ecgMv += stElevation;
    } else {
      // T-wave (often inverted or peaked in severe ischemia, normalized by BD-CMR)
      const tPhase = (stPhase - 0.35) / (1.0 - 0.35);
      const tAmp = effectiveInfarct > 0.6 ? -0.22 : 0.32;
      ecgMv += stElevation * Math.exp(-tPhase * 2.5) + tAmp * Math.sin(Math.PI * tPhase);
    }
  } else if (t < qrsStart) {
    // Diastolic resting phase
    vM = baseResting;
    calciumUm = 0.08 + effectiveInfarct * 0.05;
  }

  // Conduction velocity (CV): Normal 65 cm/s, ischemic drops to ~18 cm/s
  const cv = Math.max(15, 65 - effectiveInfarct * 45 + (isBioMeshStimActive ? 18 : 0));

  // Sarcomere fractional shortening: contractility ~0.18 normal, drops to 0.04 in scar
  const sarcomereShortening = Math.max(0.03, 0.19 * (1.0 - effectiveInfarct * 0.75) * (calciumUm / 1.5));

  const telemetry: ElectrophysiologyTelemetry = {
    membranePotentialMv: Number(vM.toFixed(1)),
    restingPotentialMv: Number(baseResting.toFixed(1)),
    actionPotentialDuration90Ms: Number(apd90.toFixed(0)),
    conductionVelocityCmS: Number(cv.toFixed(1)),
    calciumTransientPeakUm: Number(calciumUm.toFixed(2)),
    sarcomereShorteningFraction: Number(sarcomereShortening.toFixed(3)),
    refractoryPeriodMs: Number((apd90 * 0.85).toFixed(0)),
  };

  const ecgPoint: ECGDataPoint = {
    timestampMs: Date.now(),
    voltageMv: Number(ecgMv.toFixed(3)),
    stElevationMv: Number(stElevation.toFixed(3)),
    isPacedBeat: isBioMeshStimActive,
  };

  return { telemetry, ecgPoint };
}
