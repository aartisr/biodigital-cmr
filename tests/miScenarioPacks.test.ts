import assert from 'node:assert/strict';
import test from 'node:test';
import { miScenarioPackDefinitions } from '../src/config/mi/scenarioPacks';
import { miScenarios } from '../src/services/mi/scenarioRepository';
import { validateMiScenarioPacks } from '../src/services/mi/validateMiScenarioPacks';

test('versioned MI scenario packs own every scenario exactly once', () => {
  assert.deepEqual(validateMiScenarioPacks(miScenarioPackDefinitions, miScenarios), { valid: true, issues: [] });
  assert.ok(miScenarioPackDefinitions.every((pack) => pack.version && pack.taxonomyVersion && pack.phenotypeVersion));
  assert.ok(miScenarioPackDefinitions.every((pack) => pack.review.reviewState === 'REQUIRES_CLINICAL_REVIEW'));
});

test('scenario pack validation rejects duplicate ownership and incomplete review metadata', () => {
  const duplicatePack = {
    ...miScenarioPackDefinitions[0],
    id: 'duplicate-primary-pack',
    review: { ...miScenarioPackDefinitions[0].review, contentOwner: '', limitations: [] },
  };
  const result = validateMiScenarioPacks([...miScenarioPackDefinitions, duplicatePack], miScenarios);

  assert.equal(result.valid, false);
  assert.ok(result.issues.some((issue) => issue.code === 'DUPLICATE_SCENARIO_OWNERSHIP'));
  assert.ok(result.issues.some((issue) => issue.code === 'INVALID_REVIEW_METADATA'));
});