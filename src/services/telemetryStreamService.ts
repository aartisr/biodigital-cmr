/**
 * BD-CMR High-Frequency Real-Time Biophysical Telemetry Engine
 * Simulates micro-ECG waveforms, nanogrid electrical bridging,
 * cellular impedance spectroscopy, and tissue stiffness remodeling.
 */

import {
  CellularSensorMetrics,
  EpigeneticDosingState,
  NanogridPacingState,
  PatientProfile,
  PatientVitals,
  SystemOperatingMode,
  TelemetryPacket,
} from '../types/bdcmr';
import { computeSha256 } from './hipaaSecurityEngine';

export const PATIENT_COHORTS: PatientProfile[] = [
  {
    id: 'PAT-7721',
    mrnTokenized: 'PAT-7721-BC',
    patientFullNameMasked: 'R. C****** (58M)',
    unmaskedName: 'Robert Vance (58M)',
    age: 58,
    gender: 'M',
    admissionDiagnosis: 'Post-Anterior STEMI with Dense Apical Scar',
    postInfarcDay: 14,
    infarctLocation: 'Antero-Apical',
    baselineLVEF: 27,
    currentLVEF: 43.5,
    baselineScarAreaCm2: 24.6,
    currentScarAreaCm2: 10.4,
    iCMConversionRate: 67.2,
    tissueStiffnessKPa: 16.8,
    arrhythmiaShieldStatus: 'OPTIMAL_SHIELD',
    lveddMm: 58.4,
    lvesdMm: 44.2,
    septalWallThicknessMm: 11.2,
    posteriorWallThicknessMm: 10.4,
    apicalScarThicknessMm: 4.1,
    lvedvMl: 168,
    lvesvMl: 95,
    sphericityIndex: 0.62,
  },
  {
    id: 'PAT-6291',
    mrnTokenized: 'PAT-6291-KR',
    patientFullNameMasked: 'E. M****** (64F)',
    unmaskedName: 'Eleanor Martinez (64F)',
    age: 64,
    gender: 'F',
    admissionDiagnosis: 'Ischemic Dilated Cardiomyopathy with Fibrotic Remodeling',
    postInfarcDay: 42,
    infarctLocation: 'Infero-Lateral',
    baselineLVEF: 22,
    currentLVEF: 38.0,
    baselineScarAreaCm2: 31.0,
    currentScarAreaCm2: 15.8,
    iCMConversionRate: 59.4,
    tissueStiffnessKPa: 21.2,
    arrhythmiaShieldStatus: 'OPTIMAL_SHIELD',
    lveddMm: 63.8,
    lvesdMm: 50.1,
    septalWallThicknessMm: 9.8,
    posteriorWallThicknessMm: 8.6,
    apicalScarThicknessMm: 3.8,
    lvedvMl: 198,
    lvesvMl: 122,
    sphericityIndex: 0.71,
  },
  {
    id: 'PAT-9103',
    mrnTokenized: 'PAT-9103-NX',
    patientFullNameMasked: 'J. T****** (52M)',
    unmaskedName: 'James Turner (52M)',
    age: 52,
    gender: 'M',
    admissionDiagnosis: 'Acute Recurrent Ventricular Tachycardia Scar Border Zone',
    postInfarcDay: 4,
    infarctLocation: 'Posterior Transmural',
    baselineLVEF: 31,
    currentLVEF: 34.2,
    baselineScarAreaCm2: 19.4,
    currentScarAreaCm2: 17.6,
    iCMConversionRate: 18.5,
    tissueStiffnessKPa: 34.2,
    arrhythmiaShieldStatus: 'RE_ENTRY_ARRESTED',
    lveddMm: 55.0,
    lvesdMm: 43.6,
    septalWallThicknessMm: 12.8,
    posteriorWallThicknessMm: 11.8,
    apicalScarThicknessMm: 5.2,
    lvedvMl: 152,
    lvesvMl: 100,
    sphericityIndex: 0.54,
  },
];

export interface TelemetryState {
  currentPatient: PatientProfile;
  operatingMode: SystemOperatingMode;
  dosing: EpigeneticDosingState;
  pacing: NanogridPacingState;
  vitals: PatientVitals;
  cellular: CellularSensorMetrics;
  latestPackets: TelemetryPacket[];
  isClosedLoopActive: boolean;
}

export class TelemetryStreamManager {
  private patient: PatientProfile;
  private operatingMode: SystemOperatingMode = 'AUTOMATED_CLOSED_LOOP';
  private dosing: EpigeneticDosingState;
  private pacing: NanogridPacingState;
  private vitals: PatientVitals;
  private cellular: CellularSensorMetrics;
  private packetsBuffer: TelemetryPacket[] = [];
  private listeners: Set<(state: TelemetryState) => void> = new Set();
  private timerId: number | null = null;
  private tickCount: number = 0;

  constructor(initialPatient: PatientProfile = PATIENT_COHORTS[0]) {
    this.patient = initialPatient;

    this.dosing = {
      formulation: 'GHMT_MIR1_133',
      infusionRateNlMin: 165,
      targetInfusionRateNlMin: 165,
      totalDeliveredUl: 24.8,
      deliveryVector: 'Fibroblast-Targeted LNP (mRNA)',
      lastDoseAdjustmentTimestamp: new Date().toISOString(),
      adjustmentReason: 'Closed-loop automated maintenance for target iCM transition curve',
      safetyCapNlMin: 350,
      pidOutputEffort: 54,
    };

    this.pacing = {
      activePacingEnabled: true,
      meshMaterial: 'PEDOT:PSS / Graphene-Elastomer',
      subthresholdCurrentMA: 0.85,
      pulseFrequencyBpm: 72,
      pulseWidthMs: 1.2,
      conductionVelocityMs: 0.74,
      impedanceOhms: 418,
      reentrySuppressionRate: 99.8,
      activeElectrodeChannels: 16,
      syncWithSinoatrialNode: true,
    };

    this.vitals = {
      heartRateBpm: 72,
      systolicBp: 118,
      diastolicBp: 76,
      meanArterialPressure: 90,
      spO2Percent: 98.4,
      cardiacOutputLMin: 4.8,
      cardiacIndexLMinM2: 2.65,
      serumPotassiumMmolL: 4.2,
      cardiacTroponinNgMl: 0.04,
      temperatureCelsius: 36.8,
    };

    this.cellular = {
      timestamp: Date.now(),
      singleCellImpedanceMagnitude: 1420,
      singleCellImpedancePhaseDeg: -32.4,
      youngsModulusKPa: initialPatient.tissueStiffnessKPa,
      wallStressKPa: 12.4,
      wallStrainPercent: -14.6,
      iCMConversionEstimate: initialPatient.iCMConversionRate,
      actionPotentialDuration90Ms: 295,
      calciumTransientAmplitude: 1.48,
      microECGNativeMv: 0.42,
      microECGShieldedMv: 1.15,
    };

    this.startStreaming();
  }

  public setPatient(patient: PatientProfile) {
    this.patient = patient;
    this.cellular.youngsModulusKPa = patient.tissueStiffnessKPa;
    this.cellular.iCMConversionEstimate = patient.iCMConversionRate;
    this.notify();
  }

  public setOperatingMode(mode: SystemOperatingMode) {
    this.operatingMode = mode;
    if (mode === 'EMERGENCY_REST_MODE') {
      this.dosing.infusionRateNlMin = 0;
      this.pacing.subthresholdCurrentMA = 0.1;
      this.pacing.reentrySuppressionRate = 95.0;
    } else if (mode === 'AUTOMATED_CLOSED_LOOP') {
      this.dosing.infusionRateNlMin = this.dosing.targetInfusionRateNlMin;
    }
    this.notify();
  }

  public updateDosing(newDosing: Partial<EpigeneticDosingState>) {
    this.dosing = { ...this.dosing, ...newDosing };
    this.notify();
  }

  public updatePacing(newPacing: Partial<NanogridPacingState>) {
    this.pacing = { ...this.pacing, ...newPacing };
    this.notify();
  }

  public subscribe(listener: (state: TelemetryState) => void): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getState(): TelemetryState {
    return {
      currentPatient: this.patient,
      operatingMode: this.operatingMode,
      dosing: { ...this.dosing },
      pacing: { ...this.pacing },
      vitals: { ...this.vitals },
      cellular: { ...this.cellular },
      latestPackets: [...this.packetsBuffer.slice(-30)],
      isClosedLoopActive: this.operatingMode === 'AUTOMATED_CLOSED_LOOP',
    };
  }

  private startStreaming() {
    if (this.timerId !== null) return;
    // 50ms tick rate (20Hz high-frequency aggregate telemetry updates)
    this.timerId = window.setInterval(() => {
      this.tick();
    }, 50);
  }

  public stopStreaming() {
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  public loadExternalDatasetPatient(patientOverride: Partial<PatientProfile>) {
    this.patient = {
      ...this.patient,
      ...patientOverride,
    };
    if (patientOverride.tissueStiffnessKPa !== undefined) {
      this.cellular.youngsModulusKPa = patientOverride.tissueStiffnessKPa;
    }
    if (patientOverride.iCMConversionRate !== undefined) {
      this.cellular.iCMConversionEstimate = patientOverride.iCMConversionRate;
    }
    if (patientOverride.currentLVEF !== undefined) {
      this.patient.currentLVEF = patientOverride.currentLVEF;
    }
    this.notify();
  }

  private tick() {
    this.tickCount++;
    const now = Date.now();
    const phase = (this.tickCount % 60) / 60; // Cardiac cycle phase (0 to 1)

    // Micro-ECG biophysical wave calculation
    // Native (unshielded scar): conduction block, fragmented QRS, ST elevation
    let nativeEcg = 0.05 * Math.sin(phase * Math.PI * 2);
    // P wave at 0.1
    if (phase > 0.08 && phase < 0.16) {
      nativeEcg += 0.12 * Math.sin(((phase - 0.08) / 0.08) * Math.PI);
    }
    // Fragmented ischemic QRS at 0.3 - 0.44 (slurred, delayed)
    if (phase > 0.3 && phase < 0.44) {
      const qrsT = (phase - 0.3) / 0.14;
      nativeEcg += Math.sin(qrsT * Math.PI * 4) * 0.4 - 0.2;
    }
    // Pathological ST elevation
    if (phase > 0.44 && phase < 0.6) {
      nativeEcg += 0.22;
    }

    // Shielded Nanogrid ECG: Rapid action potential bridging via PEDOT:PSS mesh
    let shieldedEcg = 0.02 * Math.sin(phase * Math.PI * 2);
    if (phase > 0.1 && phase < 0.18) {
      shieldedEcg += 0.16 * Math.sin(((phase - 0.1) / 0.08) * Math.PI); // Crisp P-wave
    }
    if (phase > 0.28 && phase < 0.34) {
      // Normal narrow synchronized QRS (R-peak)
      const qrsT = (phase - 0.28) / 0.06;
      if (qrsT < 0.2) shieldedEcg -= 0.15;
      else if (qrsT < 0.6) shieldedEcg += 1.45;
      else shieldedEcg -= 0.35;
    }
    if (phase > 0.48 && phase < 0.62) {
      // Clean repolarization T-wave
      shieldedEcg += 0.32 * Math.sin(((phase - 0.48) / 0.14) * Math.PI);
    }

    // Closed-loop automated PID regulation
    if (this.operatingMode === 'AUTOMATED_CLOSED_LOOP') {
      // If tissue stiffness > 15 kPa, gently ramp LNP micro-dosing
      const targetStiffness = 14.0;
      const stiffnessError = this.cellular.youngsModulusKPa - targetStiffness;
      if (stiffnessError > 0) {
        const calculatedRate = Math.min(
          this.dosing.safetyCapNlMin,
          Math.max(80, 140 + stiffnessError * 2.8)
        );
        // Smooth adjustment
        this.dosing.infusionRateNlMin += (calculatedRate - this.dosing.infusionRateNlMin) * 0.02;
        this.dosing.pidOutputEffort = Math.round((this.dosing.infusionRateNlMin / this.dosing.safetyCapNlMin) * 100);
      }

      // Nanogrid conduction velocity regulation
      if (this.pacing.activePacingEnabled) {
        this.pacing.conductionVelocityMs = 0.74 + 0.03 * Math.sin(this.tickCount * 0.05);
        this.pacing.reentrySuppressionRate = 99.85 - 0.05 * Math.random();
      }
    }

    // Cumulative delivered volume (nl/min to ul)
    const ulPerTick = (this.dosing.infusionRateNlMin / 60000) * 0.05;
    this.dosing.totalDeliveredUl += ulPerTick;

    // Gradual regenerative remodeling progress
    const remodelingRate = (this.dosing.infusionRateNlMin / 200) * 0.0002;
    if (this.cellular.youngsModulusKPa > 14.2) {
      this.cellular.youngsModulusKPa = Math.max(14.0, this.cellular.youngsModulusKPa - remodelingRate);
      this.patient.tissueStiffnessKPa = Number(this.cellular.youngsModulusKPa.toFixed(2));
    }
    if (this.cellular.iCMConversionEstimate < 82.0) {
      this.cellular.iCMConversionEstimate = Math.min(82.0, this.cellular.iCMConversionEstimate + remodelingRate * 1.5);
      this.patient.iCMConversionRate = Number(this.cellular.iCMConversionEstimate.toFixed(1));
    }

    // Update cellular parameters with physiological micro-fluctuations
    this.cellular.timestamp = now;
    this.cellular.microECGNativeMv = nativeEcg;
    this.cellular.microECGShieldedMv = shieldedEcg;
    this.cellular.singleCellImpedanceMagnitude = Math.round(1415 + 15 * Math.sin(this.tickCount * 0.08) + (Math.random() - 0.5) * 4);
    this.cellular.singleCellImpedancePhaseDeg = Number((-32.2 + 0.5 * Math.cos(this.tickCount * 0.06)).toFixed(1));
    this.cellular.wallStressKPa = Number((12.2 + 0.4 * Math.sin(this.tickCount * 0.1)).toFixed(1));
    this.cellular.wallStrainPercent = Number((-14.8 + 0.3 * Math.sin(this.tickCount * 0.12)).toFixed(1));
    this.cellular.calciumTransientAmplitude = Number((1.48 + 0.04 * Math.sin(phase * Math.PI * 2)).toFixed(2));

    // Vitals micro-fluctuations
    this.vitals.heartRateBpm = Math.round(72 + 2 * Math.sin(this.tickCount * 0.03));
    this.vitals.systolicBp = Math.round(118 + 3 * Math.sin(this.tickCount * 0.04));
    this.vitals.diastolicBp = Math.round(76 + 2 * Math.cos(this.tickCount * 0.04));
    this.vitals.meanArterialPressure = Math.round((this.vitals.systolicBp + 2 * this.vitals.diastolicBp) / 3);
    this.vitals.cardiacOutputLMin = Number((4.8 + 0.15 * Math.sin(this.tickCount * 0.05)).toFixed(2));

    // Create telemetry packet every 10 ticks (500ms)
    if (this.tickCount % 10 === 0) {
      const packet: TelemetryPacket = {
        packetId: `PKT-${now}-${Math.floor(Math.random() * 1000)}`,
        timestamp: now,
        patientId: this.patient.id,
        cellular: { ...this.cellular },
        vitals: { ...this.vitals },
        dosing: { ...this.dosing },
        pacing: { ...this.pacing },
        cryptographicHash: `sha256-${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`,
        syncedToHospitalEhr: true,
      };

      this.packetsBuffer.push(packet);
      if (this.packetsBuffer.length > 200) {
        this.packetsBuffer.shift();
      }
    }

    this.notify();
  }

  private notify() {
    const state = this.getState();
    this.listeners.forEach((listener) => listener(state));
  }
}

// Global Singleton Instance
export const telemetryStreamService = new TelemetryStreamManager();
