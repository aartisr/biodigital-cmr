/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Quantum Tunneling Engine for BD-CMR
 * Mathematical Model: Coupled Bioelectronic Hydrogel - Myocardial Interface
 * Hamiltonian: H(t) = H_myo + H_hydrogel + V_coupling(t)
 * Bardeen-Condon Tunneling Rate & Wavefunction Decay
 */

import { QuantumTunnelingParams, QuantumTunnelingState } from '../../types/bdcmr';

// Physical Constants in SI and Atomic units
export const HBAR = 1.054571817e-34; // Reduced Planck constant (J*s)
export const ELECTRON_MASS = 9.1093837e-31; // kg
export const EV_TO_JOULE = 1.602176634e-19; // J/eV
export const BOLTZMANN_K = 1.380649e-23; // J/K
export const ELEMENTARY_CHARGE = 1.602176634e-19; // Coulombs

export const DEFAULT_QUANTUM_PARAMS: QuantumTunnelingParams = {
  barrierDistanceNm: 1.8, // 1.8 nm fibrotic collagen interface width
  barrierPotentialEv: 2.8, // 2.8 eV potential barrier
  carrierEnergyEv: 1.2, // 1.2 eV electron energy in conductive hydrogel
  couplingMatrixElement: 0.12, // 0.12 eV perturbation matrix element
  densityOfStates: 1.45, // 1.45 states/eV at Fermi edge
  effectiveMassRatio: 0.85, // m* / m_e in PEDOT:PSS / CNT matrix
};

/**
 * Computes exact Bardeen-Condon electron transfer probability and quantum flux.
 * 
 * Formula:
 * P_if = (2 * pi / hbar) * |<psi_f|H'|psi_i>|^2 * rho(E) * exp(- (2 * d / hbar) * sqrt(2 * m* * (V_0 - E)))
 */
export function calculateQuantumTunneling(
  params: QuantumTunnelingParams,
  temperatureKelvin: number = 310.15 // Human physiological temperature 37°C
): QuantumTunnelingState {
  const {
    barrierDistanceNm,
    barrierPotentialEv,
    carrierEnergyEv,
    couplingMatrixElement,
    densityOfStates,
    effectiveMassRatio,
  } = params;

  // Potential difference (V_0 - E)
  const deltaE_eV = Math.max(0.01, barrierPotentialEv - carrierEnergyEv);
  const deltaE_J = deltaE_eV * EV_TO_JOULE;

  // Effective mass
  const mStar = effectiveMassRatio * ELECTRON_MASS;

  // Barrier width in meters
  const d_m = barrierDistanceNm * 1e-9;

  // Attenuation coefficient kappa = sqrt(2 * m* * (V_0 - E)) / hbar
  const kappa = Math.sqrt(2 * mStar * deltaE_J) / HBAR; // in m^-1

  // Decay length in nm = 1 / kappa * 1e9
  const decayLengthNm = (1 / kappa) * 1e9;

  // Exponential tunneling decay factor: exp(-2 * kappa * d)
  const tunnelingExponent = -2 * kappa * d_m;
  const barrierTransmissionFactor = Math.exp(Math.max(-80, tunnelingExponent));

  // Perturbation matrix element squared in Joules^2
  const couplingJoule = couplingMatrixElement * EV_TO_JOULE;
  const matrixElementSq = couplingJoule * couplingJoule;

  // Density of states in states / Joule
  const rhoJoule = densityOfStates / EV_TO_JOULE;

  // Transition rate W_if = (2 * pi / hbar) * |H'|^2 * rho(E) * barrierFactor
  const transitionRatePerSec = (2 * Math.PI / HBAR) * matrixElementSq * rhoJoule * barrierTransmissionFactor;

  // Normalized transmission probability per collision attempt (dimensionless, 0 to 1)
  const probability = Math.min(1.0, barrierTransmissionFactor * (4 * carrierEnergyEv * deltaE_eV) / Math.pow(carrierEnergyEv + deltaE_eV, 2));

  // Electron tunneling flux in picoAmperes (pA)
  // J = e * W_if * localized_carrier_density
  const electronFluxPicoAmps = Math.min(5000, transitionRatePerSec * ELEMENTARY_CHARGE * 1e12 * 0.05);

  // Quantum phase coherence time: tau = hbar / (k_B * T + dephasing)
  const thermalEnergyJ = BOLTZMANN_K * temperatureKelvin;
  const dephasingEnergyJ = 0.005 * EV_TO_JOULE; // Scattering with polymer phonons
  const coherenceTimeFs = (HBAR / (thermalEnergyJ + dephasingEnergyJ)) * 1e15;

  // Grotthuss proton hopping rate across hydrogen-bonded water/hydrogel network:
  // nu_proton = nu_0 * exp(-Delta G / k_B T) * tunneling_correction
  const deltaG_J = 0.15 * EV_TO_JOULE; // 0.15 eV activation energy for Grotthuss hopping
  const baseFreqThz = 10.0; // 10 THz O-H stretch frequency
  const classicalHopping = baseFreqThz * Math.exp(-deltaG_J / thermalEnergyJ);
  const protonHoppingRateThz = classicalHopping * (1 + 0.3 * probability);

  return {
    probability,
    electronFluxPicoAmps,
    wavefunctionDecayLengthNm: decayLengthNm,
    coherenceTimeFs,
    protonHoppingRateThz,
  };
}

export interface WavefunctionProfilePoint {
  xNm: number; // Position from -2 nm to + (barrierDistance + 2) nm
  psiIncident: number;
  psiReflected: number;
  psiTransmitted: number;
  psiMagnitudeSquared: number;
  potentialBarrierEv: number;
  region: 'donor_electrode' | 'fibrotic_barrier' | 'mitochondrial_acceptor';
}

/**
 * Computes spatial profile of the electron wavefunction across the bioelectronic-tissue interface.
 */
export function generateWavefunctionProfile(
  dNm: number,
  V0_eV: number,
  E_eV: number,
  numPoints: number = 100
): WavefunctionProfilePoint[] {
  const points: WavefunctionProfilePoint[] = [];
  const deltaE_eV = Math.max(0.01, V0_eV - E_eV);
  const mStar = 0.85 * ELECTRON_MASS;
  const kappaNm = (Math.sqrt(2 * mStar * deltaE_eV * EV_TO_JOULE) / HBAR) * 1e-9;
  const kLeftNm = (Math.sqrt(2 * mStar * E_eV * EV_TO_JOULE) / HBAR) * 1e-9;

  const xMin = -2.0;
  const xMax = dNm + 2.0;
  const step = (xMax - xMin) / (numPoints - 1);

  // Amplitudes
  const A = 1.0;
  const transmissionCoeff = Math.exp(-kappaNm * dNm);
  const reflectionCoeff = Math.max(0, 1.0 - transmissionCoeff);

  for (let i = 0; i < numPoints; i++) {
    const x = xMin + i * step;
    let psiInc = 0;
    let psiRef = 0;
    let psiTrans = 0;
    let psiSq = 0;
    let pot = 0;
    let region: 'donor_electrode' | 'fibrotic_barrier' | 'mitochondrial_acceptor';

    if (x < 0) {
      region = 'donor_electrode';
      pot = 0;
      psiInc = A * Math.cos(kLeftNm * x);
      psiRef = reflectionCoeff * Math.cos(-kLeftNm * x);
      psiSq = Math.pow(psiInc + psiRef, 2);
    } else if (x <= dNm) {
      region = 'fibrotic_barrier';
      pot = V0_eV;
      const decay = A * Math.exp(-kappaNm * x);
      psiSq = decay * decay;
    } else {
      region = 'mitochondrial_acceptor';
      pot = 0.2; // Slight potential offset in mitochondrial matrix
      const xRel = x - dNm;
      psiTrans = transmissionCoeff * Math.cos(kLeftNm * xRel);
      psiSq = psiTrans * psiTrans;
    }

    points.push({
      xNm: Number(x.toFixed(3)),
      psiIncident: psiInc,
      psiReflected: psiRef,
      psiTransmitted: psiTrans,
      psiMagnitudeSquared: Math.min(1.5, psiSq),
      potentialBarrierEv: pot,
      region,
    });
  }

  return points;
}
