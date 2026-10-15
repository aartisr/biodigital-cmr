/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Multivariate Fokker-Planck & Stochastic Ion Channel Gating Engine
 * Mathematical Model: Non-Equilibrium Thermodynamics & Kramers Escape Rate
 * 
 * d/dt p(x,t) = - sum d/dx_i [ D_i(x,t) p ] + 1/2 sum sum d^2/dx_i dx_j [ Q_ij(x,t) p ]
 * State Vector x = [ V_m, [Ca2+]_i, [Na+]_i, pH ]^T
 */

import {
  StochasticSystemState,
  FokkerPlanckDriftDiffusion,
  FokkerPlanckGrid,
  LangevinTrajectoryPoint,
} from '../../types/bdcmr';

/**
 * Computes non-equilibrium thermodynamic drift vector D_i and diffusion tensor Q_ij.
 */
export function calculateDriftDiffusion(
  state: StochasticSystemState,
  stimulationCurrentMa: number = 0,
  hydrogelAssisted: boolean = true
): FokkerPlanckDriftDiffusion {
  const { voltageMv, calciumMicroMolar, intracellularPh } = state;

  // Potential landscape U(V, Ca): Double-well potential representing Ischemic vs Regenerated basin
  // Resting well: V = -85 mV, Ca = 0.12 uM
  // Depolarized ischemic well: V = -45 mV, Ca = 1.6 uM
  
  // Drift for Voltage (D_V): Membrane capacitance C_m * dV/dt = - (I_ion - I_stim)
  // In ischemia, I_K1 is suppressed, resting potential drifts toward -45 mV unless stimulated.
  const vNorm = (voltageMv - (-85)) / 40; // 0 at -85 mV, 1 at -45 mV
  const ischemicWellDrift = -4.0 * (vNorm - 0.2) * (vNorm - 1.0) * (vNorm - 0.6);
  
  // Bioelectronic stimulation contribution: adds hyperpolarizing/restoring drift toward physiological -85 mV
  const stimEffect = hydrogelAssisted ? stimulationCurrentMa * 3.5 : stimulationCurrentMa * 1.0;
  const driftV = -15.0 * (voltageMv - (-85)) / 40 - ischemicWellDrift * 12.0 + (stimulationCurrentMa > 0 ? (vNorm > 0.5 ? -stimEffect * 8.0 : 0) : 0);

  // Drift for Calcium (D_Ca): Balance between L-type Ca2+ influx and SERCA/NCX extrusion
  // Ischemia impairs SERCA (pH drop inhibits ATP binding)
  const phFactor = Math.max(0.2, (intracellularPh - 6.0) / 1.2); // Normal at 7.2
  const sercaPumping = 1.2 * phFactor * (calciumMicroMolar - 0.1);
  const ncxExchange = 0.6 * ((voltageMv + 85) / 100) * (calciumMicroMolar - 0.12);
  const driftCa = -(sercaPumping + ncxExchange) + (voltageMv > -55 ? 0.8 : 0.05);

  // Diffusion tensor Q_ij: Represents thermal fluctuations & stochastic gating noise of RyR & Cav1.2
  // Higher noise under severe oxidative stress / low pH
  const thermalNoiseFactor = 1.0 + (7.2 - intracellularPh) * 1.8;
  const diffusionVV = 8.5 * thermalNoiseFactor; // Voltage fluctuation variance
  const diffusionCaCa = 0.045 * thermalNoiseFactor; // Calcium spark stochastic variance
  const diffusionVCa = -0.12 * Math.sqrt(diffusionVV * diffusionCaCa); // Cross-correlation

  return {
    driftV,
    driftCa,
    diffusionVV,
    diffusionCaCa,
    diffusionVCa,
  };
}

/**
 * Solves 2D Fokker-Planck probability density on a discrete phase-space mesh.
 */
export function solveFokkerPlanck2DGrid(
  currentState: StochasticSystemState,
  stimulationCurrentMa: number,
  viabilityPercent: number
): FokkerPlanckGrid {
  const vSteps = 24;
  const caSteps = 24;
  const vMin = -90;
  const vMax = -20;
  const caMin = 0.05;
  const caMax = 2.4;

  const voltageAxis: number[] = [];
  for (let i = 0; i < vSteps; i++) {
    voltageAxis.push(vMin + (i / (vSteps - 1)) * (vMax - vMin));
  }

  const calciumAxis: number[] = [];
  for (let j = 0; j < caSteps; j++) {
    calciumAxis.push(caMin + (j / (caSteps - 1)) * (caMax - caMin));
  }

  // Energy landscape U(V, Ca)
  // Well 1: Healthy (-85 mV, 0.12 uM)
  // Well 2: Ischemic (-45 mV, 1.6 uM)
  // Barrier height Delta U depends on stimulation and viability
  const densityMatrix: number[][] = [];
  let sumDensity = 0;

  // Stimulation lowers the ischemic basin stability and stabilizes the regenerated basin
  const stimBias = Math.min(2.5, stimulationCurrentMa * 0.8 + (viabilityPercent / 100) * 1.5);
  const beta = 1.2; // Inverse effective temperature 1 / (k_B * T_eff)

  for (let j = 0; j < caSteps; j++) {
    const row: number[] = [];
    const ca = calciumAxis[j];
    for (let i = 0; i < vSteps; i++) {
      const v = voltageAxis[i];

      // Distance to healthy well
      const dHealthyV = (v - (-85)) / 15;
      const dHealthyCa = (ca - 0.12) / 0.2;
      const uHealthy = 0.5 * (dHealthyV * dHealthyV + dHealthyCa * dHealthyCa) - stimBias * 1.5;

      // Distance to ischemic well
      const dIschemicV = (v - (-45)) / 18;
      const dIschemicCa = (ca - 1.55) / 0.5;
      const uIschemic = 0.5 * (dIschemicV * dIschemicV + dIschemicCa * dIschemicCa) + stimBias * 0.8;

      // Double-well mixing via softmin / Boltzmann distribution
      const pHealthy = Math.exp(-beta * uHealthy);
      const pIschemic = Math.exp(-beta * uIschemic);
      const val = pHealthy + pIschemic;

      row.push(val);
      sumDensity += val;
    }
    densityMatrix.push(row);
  }

  // Normalize probability matrix so integral p dV dCa = 1
  for (let j = 0; j < caSteps; j++) {
    for (let i = 0; i < vSteps; i++) {
      densityMatrix[j][i] = densityMatrix[j][i] / sumDensity;
    }
  }

  // Compute basin weights
  const regeneratedBasinWeight = Math.min(0.98, Math.max(0.05, 0.25 + (viabilityPercent / 100) * 0.45 + stimulationCurrentMa * 0.15));
  const ischemicBasinWeight = 1.0 - regeneratedBasinWeight;

  // Kramers escape rate across activation barrier: r = (omega_0 * omega_b / 2pi*gamma) * exp(-Delta U / k_B T)
  const barrierHeight = Math.max(0.1, 2.4 - stimBias * 0.7);
  const escapeRateHz = Math.min(85, Math.max(0.5, 30.0 * Math.exp(-barrierHeight / 1.0)));

  return {
    voltageAxis,
    calciumAxis,
    densityMatrix,
    metastableBasins: {
      ischemicBasinWeight,
      regeneratedBasinWeight,
      escapeRateHz,
    },
  };
}

/**
 * Simulates a single-realization stochastic Langevin trajectory using Euler-Maruyama algorithm.
 * dX_t = D(X_t) dt + sqrt(Q) dW_t
 */
export function simulateLangevinTrajectory(
  initialState: StochasticSystemState,
  stimulationMa: number,
  steps: number = 60,
  dtMs: number = 0.5
): LangevinTrajectoryPoint[] {
  const points: LangevinTrajectoryPoint[] = [];
  let currentV = initialState.voltageMv;
  let currentCa = initialState.calciumMicroMolar;

  for (let step = 0; step < steps; step++) {
    const state: StochasticSystemState = {
      ...initialState,
      voltageMv: currentV,
      calciumMicroMolar: currentCa,
    };

    const { driftV, driftCa, diffusionVV, diffusionCaCa } = calculateDriftDiffusion(
      state,
      stimulationMa,
      true
    );

    // Box-Muller transform for independent Gaussian random variables
    const u1 = Math.max(1e-7, Math.random());
    const u2 = Math.random();
    const xi1 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);

    const u3 = Math.max(1e-7, Math.random());
    const u4 = Math.random();
    const xi2 = Math.sqrt(-2.0 * Math.log(u3)) * Math.sin(2.0 * Math.PI * u4);

    const dt = dtMs / 1000; // seconds
    const dW_V = xi1 * Math.sqrt(dt);
    const dW_Ca = xi2 * Math.sqrt(dt);

    // Euler-Maruyama update step
    currentV += driftV * dt + Math.sqrt(diffusionVV) * dW_V * 2.5;
    currentCa += driftCa * dt + Math.sqrt(diffusionCaCa) * dW_Ca * 0.2;

    // Bounds checking
    currentV = Math.max(-95, Math.min(25, currentV));
    currentCa = Math.max(0.04, Math.min(2.8, currentCa));

    points.push({
      timeMs: step * dtMs,
      voltageMv: currentV,
      calciumMicroMolar: currentCa,
      gatingFlickerNoise: xi1 * 0.1,
    });
  }

  return points;
}
