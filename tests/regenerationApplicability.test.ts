import assert from 'node:assert/strict';
import test from 'node:test';
import { illustrativeRegenerationModel } from '../src/config/mi/regenerationModels';
import { PATIENT_COHORTS } from '../src/config/patientCohorts';
import { miScenarioPhenotypes } from '../src/config/mi/scenarioPhenotypes';
import { adaptPatientToRegenerationInput } from '../src/services/mi/adaptPatientToRegenerationInput';
import { canRunRegenerationProjection, evaluateRegenerationApplicability } from '../src/services/mi/evaluateRegenerationApplicability';
import type { CellularSensorMetrics, EpigeneticDosingState, NanogridPacingState, PatientProfile } from '../src/types/bdcmr';

const patient = PATIENT_COHORTS[0];
const cellular = { youngsModulusKPa: 18, iCMConversionEstimate: 40 } as CellularSensorMetrics;
const dosing = { infusionRateNlMin: 240 } as EpigeneticDosingState;
const pacing = { subthresholdCurrentMA: 0.85 } as NanogridPacingState;

test('missing structured phenotype suppresses regeneration projection', () => {
  const withoutPhenotype: PatientProfile = { ...patient, infarctPhenotype: undefined };
  const adapted = adaptPatientToRegenerationInput(withoutPhenotype, cellular, dosing, pacing);
  const applicability = evaluateRegenerationApplicability(illustrativeRegenerationModel, adapted.input, adapted.missingInputs);

  assert.equal(applicability.status, 'INSUFFICIENT_INPUTS');
  assert.ok(applicability.missingInputs.includes('phenotype'));
  assert.equal(canRunRegenerationProjection(applicability), false);
});

test('legacy-inferred unknown phenotype facts cannot receive generic defaults', () => {
  const adapted = adaptPatientToRegenerationInput(patient, cellular, dosing, pacing);
  const applicability = evaluateRegenerationApplicability(illustrativeRegenerationModel, adapted.input, adapted.missingInputs);

  assert.equal(applicability.status, 'INSUFFICIENT_INPUTS');
  assert.ok(applicability.missingInputs.includes('phenotype.phase'));
  assert.ok(applicability.missingInputs.includes('phenotype.depth'));
  assert.equal(canRunRegenerationProjection(applicability), false);
});

test('complete subacute LV authored inputs support only an illustrative simulation', () => {
  const fixture = miScenarioPhenotypes.find((candidate) => candidate.id === 'lateral-subacute-v1');
  assert.ok(fixture);
  const adapted = adaptPatientToRegenerationInput({ ...patient, infarctPhenotype: fixture.phenotype }, cellular, dosing, pacing);
  const applicability = evaluateRegenerationApplicability(illustrativeRegenerationModel, adapted.input, adapted.missingInputs);

  assert.equal(illustrativeRegenerationModel.mode, 'ILLUSTRATIVE');
  assert.equal(applicability.status, 'SUPPORTED_SIMULATION');
  assert.equal(canRunRegenerationProjection(applicability), true);
});

test('acute phase and biventricular involvement remain out of scope', () => {
  const fixture = miScenarioPhenotypes.find((candidate) => candidate.id === 'septal-rv-acute-v1');
  assert.ok(fixture);
  const acute = adaptPatientToRegenerationInput({ ...patient, infarctPhenotype: fixture.phenotype }, cellular, dosing, pacing);
  const acuteApplicability = evaluateRegenerationApplicability(illustrativeRegenerationModel, acute.input, acute.missingInputs);
  const biventricular = adaptPatientToRegenerationInput({ ...patient, infarctPhenotype: { ...fixture.phenotype, phase: 'SUBACUTE' } }, cellular, dosing, pacing);
  const biventricularApplicability = evaluateRegenerationApplicability(illustrativeRegenerationModel, biventricular.input, biventricular.missingInputs);

  assert.equal(acuteApplicability.status, 'OUT_OF_SCOPE');
  assert.equal(biventricularApplicability.status, 'OUT_OF_SCOPE');
  assert.equal(canRunRegenerationProjection(acuteApplicability), false);
  assert.equal(canRunRegenerationProjection(biventricularApplicability), false);
});

test('invalid measurements and legacy-inferred provenance remain suppressed', () => {
  const fixture = miScenarioPhenotypes.find((candidate) => candidate.id === 'lateral-subacute-v1');
  assert.ok(fixture);
  const invalid = adaptPatientToRegenerationInput({ ...patient, infarctPhenotype: fixture.phenotype }, { ...cellular, youngsModulusKPa: Number.NaN }, dosing, pacing);
  const invalidApplicability = evaluateRegenerationApplicability(illustrativeRegenerationModel, invalid.input, invalid.missingInputs);
  const inferred = adaptPatientToRegenerationInput({ ...patient, infarctPhenotype: { ...fixture.phenotype, provenance: fixture.phenotype.provenance.map((source) => ({ ...source, sourceType: 'INFERRED_LEGACY' as const })) } }, cellular, dosing, pacing);
  const inferredApplicability = evaluateRegenerationApplicability(illustrativeRegenerationModel, inferred.input, inferred.missingInputs);

  assert.equal(invalidApplicability.status, 'INSUFFICIENT_INPUTS');
  assert.ok(invalidApplicability.missingInputs.includes('tissueStiffnessKPa'));
  assert.equal(inferredApplicability.status, 'PARTIALLY_SUPPORTED');
  assert.equal(canRunRegenerationProjection(invalidApplicability), false);
  assert.equal(canRunRegenerationProjection(inferredApplicability), false);
});