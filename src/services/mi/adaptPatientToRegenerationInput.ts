import { regenerationMeasurementIds } from '../../config/mi/regenerationModels';
import type { CellularSensorMetrics, EpigeneticDosingState, NanogridPacingState, PatientProfile } from '../../types/bdcmr';
import type { RegenerationModelInput } from '../../types/mi/regeneration';

export interface RegenerationInputAdapterResult {
  input?: RegenerationModelInput;
  missingInputs: readonly string[];
}

const finiteOrNull = (value: number): number | null => Number.isFinite(value) ? value : null;

export const adaptPatientToRegenerationInput = (
  patient: PatientProfile,
  cellular: CellularSensorMetrics,
  dosing: EpigeneticDosingState,
  pacing: NanogridPacingState,
): RegenerationInputAdapterResult => {
  if (!patient.infarctPhenotype) return { missingInputs: ['phenotype'] };

  const measurements = {
    [regenerationMeasurementIds.currentLvefPercent]: finiteOrNull(patient.currentLVEF),
    [regenerationMeasurementIds.currentScarAreaCm2]: finiteOrNull(patient.currentScarAreaCm2),
    [regenerationMeasurementIds.tissueStiffnessKPa]: finiteOrNull(cellular.youngsModulusKPa),
    [regenerationMeasurementIds.icmConversionPercent]: finiteOrNull(cellular.iCMConversionEstimate),
    [regenerationMeasurementIds.infusionRateNlMin]: finiteOrNull(dosing.infusionRateNlMin),
    [regenerationMeasurementIds.pacingCurrentMa]: finiteOrNull(pacing.subthresholdCurrentMA),
  };
  const missingInputs = Object.entries(measurements)
    .filter(([, value]) => value === null)
    .map(([measurementId]) => measurementId);

  return {
    input: { phenotype: patient.infarctPhenotype, measurements },
    missingInputs,
  };
};