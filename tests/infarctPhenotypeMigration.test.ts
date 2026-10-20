import assert from 'node:assert/strict';
import test from 'node:test';
import { PATIENT_COHORTS } from '../src/config/patientCohorts';
import { migrateLegacyPatientInfarct } from '../src/services/mi/migrateLegacyPatientInfarct';

test('all legacy synthetic cohorts migrate to valid, provenance-aware phenotypes', () => {
  for (const patient of PATIENT_COHORTS) {
    const result = migrateLegacyPatientInfarct(patient);
    assert.deepEqual(patient.infarctPhenotype, result.phenotype);
    assert.equal(result.report.validation.valid, true, `${patient.id} migration should validate`);
    assert.equal(result.phenotype.provenance[0].sourceType, 'INFERRED_LEGACY');
    assert.equal(result.phenotype.phase, 'UNKNOWN');
    assert.equal(result.phenotype.culpritVesselStatus, 'NOT_ESTABLISHED');
    assert.ok(result.report.entries.some((entry) => entry.status === 'UNRESOLVED'));
  }
});

test('legacy apical thickness is not copied onto non-apical segment mappings', () => {
  const anterior = migrateLegacyPatientInfarct(PATIENT_COHORTS[0]);
  const inferolateral = migrateLegacyPatientInfarct(PATIENT_COHORTS[1]);
  assert.ok(anterior.phenotype.segments.every((segment) => segment.wallThicknessMm === PATIENT_COHORTS[0].apicalScarThicknessMm));
  assert.ok(inferolateral.phenotype.segments.every((segment) => segment.wallThicknessMm === undefined));
});

test('an unregistered location remains unknown instead of receiving guessed anatomy', () => {
  const result = migrateLegacyPatientInfarct({
    ...PATIENT_COHORTS[0],
    id: 'PAT-UNKNOWN',
    infarctLocation: 'Unreviewed Custom Location',
  });
  assert.equal(result.phenotype.ventricularInvolvement, 'UNKNOWN');
  assert.deepEqual(result.phenotype.segments, []);
  assert.equal(result.report.validation.valid, true);
  assert.ok(result.report.entries.some((entry) => entry.targetPath === 'segments' && entry.status === 'UNRESOLVED'));
});