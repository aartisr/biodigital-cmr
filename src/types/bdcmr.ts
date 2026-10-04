/**
 * Bio-Digital Closed-Loop Myocardial Regeneration (BD-CMR)
 * Type Definitions & Data Contracts
 * Fully compliant with HL7 FHIR R4 DeviceMetric and HIPAA Safe Harbor
 */

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
