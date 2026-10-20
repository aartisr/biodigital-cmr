import assert from 'node:assert/strict';
import test from 'node:test';
import { PATIENT_COHORTS } from '../src/config/patientCohorts';
import { deriveInfarctSummary } from '../src/services/mi/deriveInfarctSummary';
import { migrateLegacyPatientInfarct } from '../src/services/mi/migrateLegacyPatientInfarct';

test('summary exposes migrated facts as inferred rather than established', () => {
  const { phenotype } = migrateLegacyPatientInfarct(PATIENT_COHORTS[0]);
  const summary = deriveInfarctSummary(phenotype);
  assert.equal(summary.location.sourceState, 'INFERRED');
  assert.match(summary.location.label, /LV · 5 mapped regions/);
  assert.match(summary.timing.label, /Day 14/);
  assert.match(summary.timing.detail, /not established/);
  assert.match(summary.extent.label, /10.4 cm² represented scar area/);
});

test('summary preserves unknown location and morphology without display defaults', () => {
  const { phenotype } = migrateLegacyPatientInfarct({
    ...PATIENT_COHORTS[0],
    id: 'PAT-UNKNOWN-SUMMARY',
    infarctLocation: 'Unreviewed Custom Location',
  });
  const summary = deriveInfarctSummary(phenotype);
  assert.equal(summary.location.sourceState, 'UNKNOWN');
  assert.equal(summary.location.label, 'Location not established');
  assert.equal(summary.morphology.sourceState, 'UNKNOWN');
  assert.equal(summary.morphology.label, 'Depth not established');
});

test('summary uses centralized anatomical labels', () => {
  const { phenotype } = migrateLegacyPatientInfarct(PATIENT_COHORTS[2]);
  const summary = deriveInfarctSummary(phenotype);
  assert.match(summary.location.detail, /Basal inferior/);
  assert.match(summary.location.detail, /Mid inferolateral/);
  assert.equal(summary.morphology.label, 'transmural');
});