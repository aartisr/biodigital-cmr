import assert from 'node:assert/strict';
import test from 'node:test';
import { miCoverageManifest } from '../src/config/mi/coverageManifest';
import { miScenarioPhenotypes } from '../src/config/mi/scenarioPhenotypes';
import { miScenarios } from '../src/services/mi/scenarioRepository';
import { validateMiCoverageManifest } from '../src/services/mi/validateMiCoverageManifest';

test('the MI coverage manifest is internally consistent with current scenarios', () => {
  assert.deepEqual(validateMiCoverageManifest(miCoverageManifest, miScenarios, miScenarioPhenotypes), { valid: true, issues: [] });
});

test('anatomy, morphology, complications, and phase remain explicitly unsupported or partial', () => {
  const anatomyClaims = miCoverageManifest.claims.filter((claim) => ['territory', 'ventricularInvolvement', 'depth', 'phase', 'microvascularObstruction', 'intramyocardialHemorrhage'].includes(claim.dimension));
  assert.ok(anatomyClaims.length > 0);
  assert.ok(anatomyClaims.every((claim) => claim.status !== 'REPRESENTED'));
  assert.ok(anatomyClaims.some((claim) => claim.status === 'UNSUPPORTED'));
});

test('coverage validation rejects a structured fact mismatch', () => {
  const mismatchedManifest = {
    ...miCoverageManifest,
    claims: [...miCoverageManifest.claims, {
      dimension: 'eventSequence' as const,
      value: 'RECURRENT' as const,
      status: 'REPRESENTED' as const,
      scenarioIds: ['primary-stemi'],
      notes: [],
    }],
  };
  const result = validateMiCoverageManifest(mismatchedManifest, miScenarios, miScenarioPhenotypes);
  assert.equal(result.valid, false);
  assert.ok(result.issues.some((issue) => issue.code === 'DUPLICATE_CLAIM'));
  assert.ok(result.issues.some((issue) => issue.code === 'FACT_MISMATCH'));
});

test('unreviewed structured anatomy cannot be promoted to represented coverage', () => {
  const promotedManifest = {
    ...miCoverageManifest,
    claims: miCoverageManifest.claims.map((claim) => claim.dimension === 'territory' && claim.value === 'ANTERIOR'
      ? { ...claim, status: 'REPRESENTED' as const }
      : claim),
  };
  const result = validateMiCoverageManifest(promotedManifest, miScenarios, miScenarioPhenotypes);

  assert.equal(result.valid, false);
  assert.ok(result.issues.some((issue) => issue.code === 'REVIEW_REQUIRED'));
});

test('anatomy coverage must match the referenced structured phenotype', () => {
  const mismatchedManifest = {
    ...miCoverageManifest,
    claims: miCoverageManifest.claims.map((claim) => claim.dimension === 'territory' && claim.value === 'ANTERIOR'
      ? { ...claim, scenarioIds: ['primary-nstemi'] }
      : claim),
  };
  const result = validateMiCoverageManifest(mismatchedManifest, miScenarios, miScenarioPhenotypes);

  assert.equal(result.valid, false);
  assert.ok(result.issues.some((issue) => issue.code === 'FACT_MISMATCH'));
});