import { illustrativeRegenerationModel } from '../../config/mi/regenerationModels';
import type {
  CellularSensorMetrics,
  EpigeneticDosingState,
  NanogridPacingState,
  PatientProfile,
  PatientVitals,
} from '../../types/bdcmr';
import type { ModelApplicability, RegenerationModelDescriptor } from '../../types/mi/regeneration';
import {
  calculate48HourRegenerativeProjection,
  type PredictionSummary,
  type WhatIfParameters,
} from '../regenerativePredictionEngine';
import { adaptPatientToRegenerationInput } from './adaptPatientToRegenerationInput';
import { canRunRegenerationProjection, evaluateRegenerationApplicability } from './evaluateRegenerationApplicability';

export interface RegenerationProjectionResult {
  descriptor: RegenerationModelDescriptor;
  applicability: ModelApplicability;
  projection?: PredictionSummary;
}

export type RegenerationProjectionCalculator = typeof calculate48HourRegenerativeProjection;

export const createRegenerationProjectionService = (
  calculateProjection: RegenerationProjectionCalculator = calculate48HourRegenerativeProjection,
) => ({
  project(
    patient: PatientProfile,
    cellular: CellularSensorMetrics,
    vitals: PatientVitals,
    dosing: EpigeneticDosingState,
    pacing: NanogridPacingState,
    whatIf?: WhatIfParameters,
  ): RegenerationProjectionResult {
    const adapted = adaptPatientToRegenerationInput(patient, cellular, dosing, pacing);
    const applicability = evaluateRegenerationApplicability(
      illustrativeRegenerationModel,
      adapted.input,
      adapted.missingInputs,
    );

    if (!canRunRegenerationProjection(applicability)) {
      return { descriptor: illustrativeRegenerationModel, applicability };
    }

    return {
      descriptor: illustrativeRegenerationModel,
      applicability,
      projection: calculateProjection(patient, cellular, vitals, dosing, pacing, whatIf),
    };
  },
});

export const regenerationProjectionService = createRegenerationProjectionService();