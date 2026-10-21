/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Bio-Digital Closed-Loop Myocardial Regeneration (BD-CMR)
 * Type Definitions for Quantum-Stochastic Regeneration Engine (QSRE),
 * Electrophysiology Telemetry, Tensor Geometry, and Persona Policies.
 * 
 * Original Authors/Architecture: Ramanjanappa Ravikumar & Aarti S Ravikumar
 */

import type { InfarctPhenotype } from './mi/infarctPhenotype';

export type ClinicalRole = 
  | 'ATTENDING_CARDIOLOGIST'
  | 'CARDIAC_ELECTROPHYSIOLOGIST'
  | 'BIOMEDICAL_ENGINEER'
  | 'CLINICAL_AUDITOR'
  | 'ICU_NURSE'
  | 'IMAGING_REVIEWER'
  | 'RESEARCH_COORDINATOR'
  | 'INTEGRATION_ADMIN';

export type SystemOperatingMode = 
  | 'AUTOMATED_CLOSED_LOOP'
  | 'SUPERVISED_ADAPTIVE'
  | 'MANUAL_OVERRIDE'
  | 'EMERGENCY_REST_MODE';

export type NetworkLatencyProfile = 
  | 'EDGE_LOW_LATENCY'     // < 4ms (Sub-millisecond intra-suite edge)
  | 'HOSPITAL_LAN'         // 12 - 20ms (Hospital intranet FHIR gateway)
  | 'TELEMETRY_WAN'        // 60 - 80ms (Cloud analytics node)
  | 'OFFLINE_AIRGAP';      // Disconnected buffer mode

export interface PatientProfile {
  id: string;
  mrnTokenized: string;          // Safe Harbor tokenized: e.g. "PAT-7721-BC"
  patientFullNameMasked: string; // e.g. "R. C****** (58M)"
  unmaskedName: string;
  age: number;
  gender: 'M' | 'F' | 'Other';
  admissionDiagnosis: string;
  postInfarcDay: number;
  infarctLocation: 'Antero-Apical' | 'Infero-Lateral' | 'Posterior Transmural' | string;
  baselineLVEF: number;          // % (e.g. 26%)
  currentLVEF: number;           // % (e.g. 42%)
  baselineScarAreaCm2: number;   // e.g. 24.6 cm²
  currentScarAreaCm2: number;    // e.g. 11.2 cm²
  iCMConversionRate: number;     // % (e.g. 64.8%)
  tissueStiffnessKPa: number;    // Young's modulus (e.g. 18.4 kPa)
  arrhythmiaShieldStatus: 'OPTIMAL_SHIELD' | 'TRANSIENT_INTERFERENCE' | 'RE_ENTRY_ARRESTED';
  // Patient-Specific 3D Cardiac Anatomical Dimensions (4D Flow MRI / Echo Calibrated)
  lveddMm?: number;              // Left Ventricular End-Diastolic Dimension (e.g. 58 mm, normal 42-52mm)
  lvesdMm?: number;              // Left Ventricular End-Systolic Dimension (e.g. 44 mm, normal 26-36mm)
  septalWallThicknessMm?: number;// Interventricular septum thickness (e.g. 11.4 mm)
  posteriorWallThicknessMm?: number;// Posterior LV wall thickness (e.g. 10.2 mm)
  apicalScarThicknessMm?: number;// Infarct wall thickness (e.g. 4.2 mm, demonstrating ischemic thinning)
  lvedvMl?: number;              // End-Diastolic Volume (e.g. 168 mL)
  lvesvMl?: number;              // End-Systolic Volume (e.g. 98 mL)
  sphericityIndex?: number;      // 0.45 - 0.75 (post-infarct adverse globular remodeling index)
  infarctPhenotype?: InfarctPhenotype; // Versioned phenotype introduced alongside legacy display fields.
}

export interface EpigeneticDosingState {
  formulation: 'GMT' | 'GHMT' | 'GHMT_MIR1_133'; // Gata4, Mef2c, Tbx5, Hand2 + microRNAs
  infusionRateNlMin: number;                     // 0 - 500 nl/min
  targetInfusionRateNlMin: number;
  totalDeliveredUl: number;                      // µl
  deliveryVector: 'Fibroblast-Targeted LNP (mRNA)';
  lastDoseAdjustmentTimestamp: string;
  adjustmentReason: string;
  safetyCapNlMin: number;
  pidOutputEffort: number;                       // 0 - 100%
}

export interface NanogridPacingState {
  activePacingEnabled: boolean;
  meshMaterial: 'PEDOT:PSS / Graphene-Elastomer';
  subthresholdCurrentMA: number;                 // e.g. 0.85 mA
  pulseFrequencyBpm: number;                     // e.g. 72 bpm
  pulseWidthMs: number;                          // e.g. 1.2 ms
  conductionVelocityMs: number;                  // e.g. 0.74 m/s (healthy is > 0.7)
  impedanceOhms: number;                         // e.g. 420 Ω
  reentrySuppressionRate: number;                // e.g. 99.8%
  activeElectrodeChannels: number;               // 16 of 16
  syncWithSinoatrialNode: boolean;
}

export interface CellularSensorMetrics {
  timestamp: number;
  singleCellImpedanceMagnitude: number;          // Ω (membrane integrity & density)
  singleCellImpedancePhaseDeg: number;           // Degrees (capacitance)
  youngsModulusKPa: number;                      // Tissue elasticity (kPa)
  wallStressKPa: number;                         // Local systolic wall stress
  wallStrainPercent: number;                     // Local systolic circumferential strain (%)
  iCMConversionEstimate: number;                 // % transdifferentiated cells
  actionPotentialDuration90Ms: number;           // APD90 in ms (e.g. 290ms)
  calciumTransientAmplitude: number;             // ΔF/F0 relative fluorescence
  microECGNativeMv: number;                      // mV
  microECGShieldedMv: number;                    // mV (after nanogrid conduction bridge)
}

export interface PatientVitals {
  heartRateBpm: number;
  systolicBp: number;
  diastolicBp: number;
  meanArterialPressure: number;
  spO2Percent: number;
  cardiacOutputLMin: number;
  cardiacIndexLMinM2: number;
  serumPotassiumMmolL: number;
  cardiacTroponinNgMl: number;
  temperatureCelsius: number;
}

export interface TelemetryPacket {
  packetId: string;
  timestamp: number;
  patientId: string;
  cellular: CellularSensorMetrics;
  vitals: PatientVitals;
  dosing: EpigeneticDosingState;
  pacing: NanogridPacingState;
  cryptographicHash: string;
  syncedToHospitalEhr: boolean;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userRole: ClinicalRole;
  action: string;
  details: string;
  previousHash: string;
  blockHash: string;
  phiCategory: 'DE-IDENTIFIED' | 'AUTHORIZED_ACCESS';
  verifiedBySecOfficer: boolean;
}

export interface HospitalIntegrationConfig {
  fhirEndpoint: string;
  epicCosmosEnabled: boolean;
  cernerMillenniumEnabled: boolean;
  dicomExportStream: boolean;
  omopCdmExport: boolean;
  tlsVersion: string;
  hipaaSafeHarborEnforced: boolean;
  auditChainLength: number;
}

export interface ClinicalSnapshot {
  id: string;
  timestamp: string; // ISO-8601 string
  displayTime: string; // e.g. "03:58:12"
  label: string;
  notes?: string;
  patientId: string;
  patientMrn: string;
  cellular: CellularSensorMetrics;
  pacing: NanogridPacingState;
  dosing: EpigeneticDosingState;
  vitals: PatientVitals;
  operatingMode: SystemOperatingMode;
}

export type PersonaType = 'cardiologist' | 'bioelectronics_engineer' | 'quantum_biophysicist' | 'regulatory_auditor';

export interface PersonaProfile {
  id: PersonaType;
  title: string;
  role: string;
  focusArea: string;
  primaryKPIs: string[];
  safetyThreshold: string;
  description: string;
}

// ==========================================
// 1. Quantum Tunneling & Hamiltonian Types
// ==========================================
export interface QuantumTunnelingParams {
  barrierDistanceNm: number; // Barrier thickness d in nanometers (0.5 to 5.0 nm)
  barrierPotentialEv: number; // Barrier height V_0 in electron-volts (1.0 to 4.5 eV)
  carrierEnergyEv: number; // Electron energy E in eV (0.2 to 2.5 eV)
  couplingMatrixElement: number; // <psi_f | H' | psi_i> in eV (0.01 to 0.5)
  densityOfStates: number; // rho(E) in states/eV
  effectiveMassRatio: number; // m* / m_e (e.g. 0.8 for conductive polymers)
}

export interface QuantumTunnelingState {
  probability: number; // P_if (dimensionless transmission coefficient, 0 to 1)
  electronFluxPicoAmps: number; // Tunneling current flux across hydrogel-mitochondrial interface
  wavefunctionDecayLengthNm: number; // 1 / kappa where kappa = sqrt(2m*(V0 - E))/hbar
  coherenceTimeFs: number; // Quantum phase coherence time in femtoseconds
  protonHoppingRateThz: number; // Grotthuss proton hopping rate in THz
}

// ==========================================
// 2. Multivariate Fokker-Planck Stochastic Types
// ==========================================
export interface StochasticSystemState {
  voltageMv: number; // V in mV (-90 to +30)
  calciumMicroMolar: number; // [Ca2+]_i in uM (0.08 to 2.5)
  sodiumMilliMolar: number; // [Na+]_i in mM (8 to 20)
  intracellularPh: number; // pH (6.6 in ischemia to 7.2 in recovery)
}

export interface FokkerPlanckDriftDiffusion {
  driftV: number; // D_V(x, t) deterministic ionic driving force
  driftCa: number; // D_Ca(x, t) SERCA & NCX driving force
  diffusionVV: number; // Q_VV thermal & gating noise
  diffusionCaCa: number; // Q_CaCa stochastic Ryanodine receptor noise
  diffusionVCa: number; // Q_VCa cross-fluctuation coupling
}

export interface FokkerPlanckGrid {
  voltageAxis: number[]; // e.g. 25 points from -90 to +30 mV
  calciumAxis: number[]; // e.g. 25 points from 0.05 to 2.5 uM
  densityMatrix: number[][]; // p(V, Ca) normalized probability 2D array
  metastableBasins: {
    ischemicBasinWeight: number; // Probability of trapping in ischemic arrhythmogenic basin
    regeneratedBasinWeight: number; // Probability of transitioning to healthy syncytial basin
    escapeRateHz: number; // Kramers escape rate across activation barrier
  };
}

export interface LangevinTrajectoryPoint {
  timeMs: number;
  voltageMv: number;
  calciumMicroMolar: number;
  gatingFlickerNoise: number;
}

// ==========================================
// 3. Tensor Deformation & Differential Geometry
// ==========================================
export interface MetricTensor2D {
  g11: number; // Longitudinal myofibril metric component
  g12: number; // Shear/cross-fiber metric coupling
  g21: number;
  g22: number; // Transverse metric component
  determinant: number; // det(g)
  ricciScalar: number; // Gaussian / Ricci curvature R (non-Euclidean distortion)
}

export interface ChristoffelSymbols2D {
  gamma1_11: number;
  gamma1_12: number;
  gamma1_22: number;
  gamma2_11: number;
  gamma2_12: number;
  gamma2_22: number;
}

export interface TissueTensorPoint {
  x: number; // Coordinates in myocardial tissue frame
  y: number;
  zone: 'remote_healthy' | 'border_zone' | 'infarct_core' | 'hydrogel_patch';
  metric: MetricTensor2D;
  anisotropicConductivityRatio: number; // sigma_longitudinal / sigma_transverse
  mechanicalStrainKPa: number; // Wall stress
  geodesicDeviationAngleRad: number; // Deflection of electrical wavefront
}

// ==========================================
// 4. Combinatorial Topology & Syncytium Graph
// ==========================================
export type TissueNodeType = 'cardiomyocyte' | 'fibroblast_scar' | 'ischemic_border' | 'biomesh_electrode';

export interface SyncytiumNode {
  id: string;
  x: number; // 0 to 1 normalized coordinate
  y: number;
  type: TissueNodeType;
  actionPotentialMv: number;
  viabilityScore: number; // 0 (dead scar) to 1.0 (fully functional)
  gapJunctionConductanceNsiemens: number; // Connexin-43 conductance
}

export interface SyncytiumEdge {
  id: string;
  source: string;
  target: string;
  weight: number; // Distance or electrical resistance
  conductionProbability: number; // P_conduction(e)
  isActiveMeshBridge: boolean; // True if augmented by conductive hydrogel patch
}

export interface SyncytialTopologyMetrics {
  totalNodes: number;
  totalEdges: number;
  activeMeshBridges: number;
  conductionFidelity: number; // F(S) = sum w_uv * prod P_conduction
  syncytialPercolationThreshold: number; // Critical threshold for macroscopic wave propagation
  isPercolationAchieved: boolean;
  maxReentryCycleRisk: number; // 0 (safe) to 1 (high ventricular tachycardia risk)
}

// ==========================================
// 5. Electrophysiology Telemetry & ECG
// ==========================================
export interface ElectrophysiologyTelemetry {
  membranePotentialMv: number; // Current V_m
  restingPotentialMv: number; // Baseline target (-85 mV)
  actionPotentialDuration90Ms: number; // APD90 (healthy: 260-320 ms)
  conductionVelocityCmS: number; // CV (healthy: 50-70 cm/s, ischemic: 10-25 cm/s)
  calciumTransientPeakUm: number; // Healthy ~1.5 uM
  sarcomereShorteningFraction: number; // Fractional shortening (contractility)
  refractoryPeriodMs: number;
}

export interface ECGDataPoint {
  timestampMs: number;
  voltageMv: number; // Lead II potential
  stElevationMv: number; // ST segment deviation (positive = acute STEMI, 0 = normal)
  isPacedBeat: boolean;
}

// ==========================================
// 6. Soft Bioelectronics & Hydrogel Patch
// ==========================================
export interface BioelectronicsStimulatorConfig {
  isEnabled: boolean;
  closedLoopAutoTune: boolean;
  currentAmplitudeMa: number; // 0.1 to 5.0 mA
  pulseWidthMs: number; // 0.2 to 2.0 ms
  frequencyHz: number; // 1.0 to 3.5 Hz (60 to 210 bpm)
  waveform: 'biphasic_symmetric' | 'monophasic_cathodic' | 'quantum_stochastic_adaptive';
  hydrogelConductivitySiemensM: number; // e.g. 120 S/m for PEDOT:PSS hydrogel
  contactImpedanceOhmCm: number; // e.g. 45 Ohm*cm
  chargeInjectionLimitMicroCoulomb: number; // Safety threshold
}

// ==========================================
// 7. Closed-Loop Global Engine State
// ==========================================
export interface BDCMREngineState {
  simulationTimeMs: number;
  isRunning: boolean;
  heartRateBpm: number;
  infarctRescueProgressPercent: number; // 0% (acute MI) to 100% (regenerated syncytium)
  myocardialViabilityPercent: number;
  stElevationMv: number;
  ejectionFractionPercent: number; // Healthy ~55-65%, post-MI ~25-35%
  arrhythmiaRiskScore: number; // 0 to 100
  quantumTunneling: QuantumTunnelingState;
  quantumParams: QuantumTunnelingParams;
  stochasticState: StochasticSystemState;
  fokkerPlanckGrid: FokkerPlanckGrid;
  tensorDeformation: {
    averageRicciCurvature: number;
    anisotropyRatio: number;
    peakWallStrainKPa: number;
  };
  topologyMetrics: SyncytialTopologyMetrics;
  telemetry: ElectrophysiologyTelemetry;
  stimulator: BioelectronicsStimulatorConfig;
  activePersona: PersonaType;
}
