import assert from 'node:assert/strict';
import test from 'node:test';
import { validateInfarctPhenotype } from '../src/services/mi/validateInfarctPhenotype';
import { INFARCT_PHENOTYPE_SCHEMA_VERSION, InfarctPhenotype } from '../src/types/mi/infarctPhenotype';

const validPhenotype = (): InfarctPhenotype => ({
  schemaVersion: INFARCT_PHENOTYPE_SCHEMA_VERSION,
  ventricularInvolvement: 'LV',
  phase: 'SUBACUTE',
  daysSinceIndexEvent: 14,
  coronaryTerritories: ['LAD'],
  culpritVesselStatus: 'SUSPECTED',
  culpritVessels: ['LAD'],
  segments: [{
    region: { scheme: 'AHA_17_LV', segmentId: 13 },
    scarState: 'PRESENT',
    depth: 'TRANSMURAL',
    extentPercent: 62,
    wallThicknessMm: 4.1,
    wallMotion: 'AKINETIC',
    sourceEvidenceIds: ['synthetic-case'],
  }],
  totalScarAreaCm2: 10.4,
  lvExtentPercent: 18,
  microvascularObstruction: 'NOT_ASSESSED',
  intramyocardialHemorrhage: 'NOT_ASSESSED',
  edema: 'NOT_ASSESSED',
  viabilityStatus: 'INDETERMINATE',
  provenance: [{ id: 'synthetic-case', sourceType: 'AUTHORED_SIMULATION', sourceId: 'PAT-7721' }],
  limitations: ['Synthetic phenotype for contract validation.'],
});

test('a sourced, versioned infarct phenotype passes structural validation', () => {
  assert.deepEqual(validateInfarctPhenotype(validPhenotype()), { valid: true, issues: [] });
});

test('validation accumulates duplicate, range, source, and consistency issues', () => {
  const phenotype = validPhenotype();
  const result = validateInfarctPhenotype({
    ...phenotype,
    daysSinceIndexEvent: -1,
    segments: [
      { ...phenotype.segments[0], extentPercent: 120, sourceEvidenceIds: ['missing-source'] },
      { ...phenotype.segments[0], scarState: 'ABSENT' },
    ],
  });

  assert.equal(result.valid, false);
  assert.ok(result.issues.some((issue) => issue.code === 'INVALID_NUMBER' && issue.path === 'daysSinceIndexEvent'));
  assert.ok(result.issues.some((issue) => issue.code === 'DUPLICATE_REGION'));
  assert.ok(result.issues.some((issue) => issue.code === 'MISSING_SOURCE'));
  assert.ok(result.issues.some((issue) => issue.code === 'INCONSISTENT_FINDING'));
});

test('unknown anatomy remains valid without fabricated segment defaults', () => {
  const phenotype: InfarctPhenotype = {
    ...validPhenotype(),
    ventricularInvolvement: 'UNKNOWN',
    phase: 'UNKNOWN',
    daysSinceIndexEvent: undefined,
    coronaryTerritories: ['UNKNOWN'],
    culpritVesselStatus: 'NOT_ESTABLISHED',
    culpritVessels: [],
    segments: [],
  };

  assert.equal(validateInfarctPhenotype(phenotype).valid, true);
});