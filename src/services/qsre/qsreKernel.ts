/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Unified QSRE & BD-CMR Kernel
 * Couples Quantum Tunneling, Stochastic Fokker-Planck,
 * Riemannian Metric Tensors, and Combinatorial Syncytial Graphs
 * in a real-time closed-loop control system.
 */

import {
  BDCMREngineState,
} from '../../types/bdcmr';
import {
  calculateQuantumTunneling,
  DEFAULT_QUANTUM_PARAMS,
} from './quantumTunnelingEngine';
import { solveFokkerPlanck2DGrid } from './stochasticFokkerPlanck';
import { generateTissueTensorField } from './tensorDeformationField';
import { buildMyocardialSyncytiumGraph } from './combinatorialTopology';
import { computeCardiacTelemetryStep } from '../telemetry/electrophysiologySim';

export function createInitialBDCMRState(): BDCMREngineState {
  const quantumParams = { ...DEFAULT_QUANTUM_PARAMS };
  const quantumTunneling = calculateQuantumTunneling(quantumParams);

  const initialStochasticState = {
    voltageMv: -62.0, // Mildly depolarized border zone
    calciumMicroMolar: 1.15, // Elevated diastolic calcium overload
    sodiumMilliMolar: 14.5,
    intracellularPh: 6.82, // Acidotic ischemic baseline
  };

  const fokkerPlanckGrid = solveFokkerPlanck2DGrid(initialStochasticState, 1.2, 35);
  const topology = buildMyocardialSyncytiumGraph(true, 0.75);
  const tensorPoints = generateTissueTensorField(7, true);

  const avgRicci = tensorPoints.reduce((acc, p) => acc + p.metric.ricciScalar, 0) / tensorPoints.length;
  const avgAnisotropy = tensorPoints.reduce((acc, p) => acc + p.anisotropicConductivityRatio, 0) / tensorPoints.length;

  const { telemetry } = computeCardiacTelemetryStep(0, 72, 0.65, 35, true);

  return {
    simulationTimeMs: 0,
    isRunning: true,
    heartRateBpm: 72,
    infarctRescueProgressPercent: 35, // Started at 35% rescued
    myocardialViabilityPercent: 58,
    stElevationMv: 0.28, // 0.28 mV STEMI elevation
    ejectionFractionPercent: 38, // Impaired post-MI EF
    arrhythmiaRiskScore: 62, // Moderate-high risk
    quantumParams,
    quantumTunneling,
    stochasticState: initialStochasticState,
    fokkerPlanckGrid,
    tensorDeformation: {
      averageRicciCurvature: Number(avgRicci.toFixed(2)),
      anisotropyRatio: Number(avgAnisotropy.toFixed(2)),
      peakWallStrainKPa: 95,
    },
    topologyMetrics: topology.metrics,
    telemetry,
    stimulator: {
      isEnabled: true,
      closedLoopAutoTune: true,
      currentAmplitudeMa: 1.8,
      pulseWidthMs: 0.8,
      frequencyHz: 1.2,
      waveform: 'quantum_stochastic_adaptive',
      hydrogelConductivitySiemensM: 145,
      contactImpedanceOhmCm: 42,
      chargeInjectionLimitMicroCoulomb: 30,
    },
    activePersona: 'cardiologist',
  };
}

/**
 * Step function advancing the physical state of the simulation.
 */
export function stepBDCMREngine(
  prevState: BDCMREngineState,
  deltaMs: number = 33 // ~30 fps
): BDCMREngineState {
  if (!prevState.isRunning) return prevState;

  const simTime = prevState.simulationTimeMs + deltaMs;
  let rescueProgress = prevState.infarctRescueProgressPercent;
  let stim = { ...prevState.stimulator };

  // Closed-loop auto-tune feedback control:
  // If ST-elevation is high or conduction velocity is sluggish, adapt current and pulse
  if (stim.isEnabled && stim.closedLoopAutoTune) {
    if (prevState.stElevationMv > 0.08) {
      // Need more therapeutic rescue stimulation
      stim.currentAmplitudeMa = Math.min(3.2, stim.currentAmplitudeMa + 0.002);
      // Promote gradual myocardial recovery
      rescueProgress = Math.min(96, rescueProgress + 0.025);
    } else {
      // Stabilized: taper stimulation to maintenance level
      stim.currentAmplitudeMa = Math.max(0.6, stim.currentAmplitudeMa - 0.001);
      rescueProgress = Math.min(96, rescueProgress + 0.005);
    }
  } else if (!stim.isEnabled) {
    // If stimulator is switched off, tissue viability slowly degrades
    rescueProgress = Math.max(15, rescueProgress - 0.03);
  }

  // Update quantum parameters with potential bio-mesh modulation
  const quantumTunneling = calculateQuantumTunneling(prevState.quantumParams);

  // Update stochastic state variables toward recovery or degradation
  const targetPh = 6.6 + (rescueProgress / 100) * 0.6; // 6.6 -> 7.2
  const currentPh = prevState.stochasticState.intracellularPh + (targetPh - prevState.stochasticState.intracellularPh) * 0.02;

  const stochasticState = {
    voltageMv: -55 - (rescueProgress / 100) * 30, // -55 to -85 mV
    calciumMicroMolar: Math.max(0.1, 1.8 - (rescueProgress / 100) * 1.68),
    sodiumMilliMolar: Math.max(9.0, 16.0 - (rescueProgress / 100) * 6.5),
    intracellularPh: Number(currentPh.toFixed(3)),
  };

  // Re-evaluate Fokker-Planck density on periodic cycles (every ~200ms to save CPU)
  let fokkerGrid = prevState.fokkerPlanckGrid;
  if (simTime % 180 < deltaMs) {
    fokkerGrid = solveFokkerPlanck2DGrid(
      stochasticState,
      stim.isEnabled ? stim.currentAmplitudeMa : 0,
      rescueProgress
    );
  }

  // Calculate electrophysiology step
  const { telemetry, ecgPoint } = computeCardiacTelemetryStep(
    simTime,
    prevState.heartRateBpm,
    0.7, // Base transmural infarct
    rescueProgress,
    stim.isEnabled
  );

  // Derive macroscopic clinical markers
  const ejectionFraction = Number((28 + (rescueProgress / 100) * 32).toFixed(1)); // 28% -> 60%
  const stElevation = ecgPoint.stElevationMv;
  const arrhythmiaRisk = Math.max(5, Math.round(85 - rescueProgress * 0.8));

  // Topology metrics
  const topologyMetrics = {
    ...prevState.topologyMetrics,
    conductionFidelity: Number((0.25 + (rescueProgress / 100) * 0.65).toFixed(3)),
    isPercolationAchieved: rescueProgress > 45,
    maxReentryCycleRisk: Number((0.85 - (rescueProgress / 100) * 0.75).toFixed(3)),
  };

  return {
    ...prevState,
    simulationTimeMs: simTime,
    infarctRescueProgressPercent: Number(rescueProgress.toFixed(1)),
    myocardialViabilityPercent: Number((40 + rescueProgress * 0.58).toFixed(1)),
    stElevationMv: stElevation,
    ejectionFractionPercent: ejectionFraction,
    arrhythmiaRiskScore: arrhythmiaRisk,
    quantumTunneling,
    stochasticState,
    fokkerPlanckGrid: fokkerGrid,
    topologyMetrics,
    telemetry,
    stimulator: stim,
  };
}
