import assert from 'node:assert/strict';
import test from 'node:test';
import { miScenarioPhenotypes } from '../src/config/mi/scenarioPhenotypes';
import { createRegenerationProjectionService, type RegenerationProjectionCalculator } from '../src/services/mi/runRegenerationProjection';
import type { CellularSensorMetrics, EpigeneticDosingState, NanogridPacingState, PatientProfile, PatientVitals } from '../src/types/bdcmr';

const patient = {
  id: 'guard-test',
  currentLVEF: 42,
  currentScarAreaCm2: 18,
} as PatientProfile;
const cellular = { youngsModulusKPa: 19, iCMConversionEstimate: 28 } as CellularSensorMetrics;
const vitals = {} as PatientVitals;
const dosing = { infusionRateNlMin: 240 } as EpigeneticDosingState;
const pacing = { subthresholdCurrentMA: 0.85 } as NanogridPacingState;

const projection = {
  patientId: patient.id,
  projectionHorizonHours: 48,
  projectedStiffnessDeltaKPa: -1,
  projectedICMDeltaPercent: 1,
  projectedLvefDeltaPercent: 1,
  projectedScarDeltaCm2: -1,
  timeToComplianceThresholdHours: 48,
  meanRepairVelocity24h: 1,
  simulationInterpretation: 'Illustrative test projection.',
  hourlyPoints: [],
};

test('guard does not invoke the calculator for an unsupported patient', () => {
  let invocationCount = 0;
  const calculator: RegenerationProjectionCalculator = () => {
    invocationCount += 1;
    return projection;
  };
  const result = createRegenerationProjectionService(calculator).project(patient, cellular, vitals, dosing, pacing);

  assert.equal(result.applicability.status, 'INSUFFICIENT_INPUTS');
  assert.equal(result.projection, undefined);
  assert.equal(invocationCount, 0);
});

test('guard invokes the calculator once for supported illustrative inputs', () => {
  const fixture = miScenarioPhenotypes.find((candidate) => candidate.id === 'lateral-subacute-v1');
  assert.ok(fixture);
  let invocationCount = 0;
  const calculator: RegenerationProjectionCalculator = () => {
    invocationCount += 1;
    return projection;
  };
  const result = createRegenerationProjectionService(calculator).project(
    { ...patient, infarctPhenotype: fixture.phenotype },
    cellular,
    vitals,
    dosing,
    pacing,
  );

  assert.equal(result.descriptor.modelId, 'bdcmr-fixed-48h-sensitivity');
  assert.equal(result.applicability.status, 'SUPPORTED_SIMULATION');
  assert.equal(result.projection, projection);
  assert.equal(invocationCount, 1);
});