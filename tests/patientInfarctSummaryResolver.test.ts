import assert from 'node:assert/strict';
import test from 'node:test';
import { PATIENT_COHORTS } from '../src/config/patientCohorts';
import { resolvePatientInfarctSummary } from '../src/services/mi/resolvePatientInfarctSummary';

const patient = PATIENT_COHORTS[0];

test('valid structured phenotype is preferred over legacy display fields', () => {
  const result = resolvePatientInfarctSummary({ ...patient, infarctLocation: 'Unregistered display label' });

  assert.equal(result.state, 'AVAILABLE');
  if (result.state !== 'AVAILABLE') return;
  assert.equal(result.phenotypeSource, 'STRUCTURED');
  assert.match(result.summary.location.label, /mapped regions/);
  assert.equal(result.summary.location.sourceState, 'INFERRED');
});

test('absent structured phenotype uses only the exact legacy migration boundary', () => {
  const result = resolvePatientInfarctSummary({ ...patient, infarctPhenotype: undefined });

  assert.equal(result.state, 'AVAILABLE');
  if (result.state !== 'AVAILABLE') return;
  assert.equal(result.phenotypeSource, 'EXACT_LEGACY_MIGRATION');
  assert.equal(result.summary.timing.label, `Day ${patient.postInfarcDay} since index event`);
});

test('invalid structured phenotype fails closed instead of falling back to legacy text', () => {
  assert.ok(patient.infarctPhenotype);
  const result = resolvePatientInfarctSummary({
    ...patient,
    infarctPhenotype: { ...patient.infarctPhenotype, daysSinceIndexEvent: -1 },
  });

  assert.equal(result.state, 'UNAVAILABLE');
  if (result.state !== 'UNAVAILABLE') return;
  assert.ok(result.reasons.some((reason) => reason.includes('daysSinceIndexEvent')));
});