import assert from 'node:assert/strict';
import test from 'node:test';
import { miScenarioPackDefinitions } from '../src/config/mi/scenarioPacks';
import { miScenarioPhenotypes } from '../src/config/mi/scenarioPhenotypes';
import { miScenarios } from '../src/services/mi/scenarioRepository';
import { validateMiScenarioPhenotypes } from '../src/services/mi/validateMiScenarioPhenotypes';

test('scenario phenotype references resolve to valid authored fixtures', () => {
  assert.deepEqual(
    validateMiScenarioPhenotypes(miScenarioPackDefinitions, miScenarios, miScenarioPhenotypes),
    { valid: true, issues: [] },
  );
  assert.ok(miScenarioPhenotypes.every((fixture) => fixture.review.reviewState === 'REQUIRES_CLINICAL_REVIEW'));
});

test('representative phenotypes span the planned anatomy and morphology dimensions', () => {
  const territories = new Set(miScenarioPhenotypes.flatMap((fixture) => fixture.territories));
  const phenotypes = miScenarioPhenotypes.map((fixture) => fixture.phenotype);
  const depths = new Set(phenotypes.flatMap((phenotype) => phenotype.segments.map((segment) => segment.depth)));

  for (const territory of ['SEPTAL', 'LATERAL', 'POSTERIOR'] as const) assert.ok(territories.has(territory));
  for (const phase of ['ACUTE', 'SUBACUTE', 'CHRONIC'] as const) assert.ok(phenotypes.some((phenotype) => phenotype.phase === phase));
  for (const depth of ['SUBENDOCARDIAL', 'TRANSMURAL', 'MIXED'] as const) assert.ok(depths.has(depth));
  assert.ok(phenotypes.some((phenotype) => phenotype.ventricularInvolvement === 'BIVENTRICULAR'));
  assert.ok(phenotypes.some((phenotype) => phenotype.microvascularObstruction === 'PRESENT'));
  assert.ok(phenotypes.some((phenotype) => phenotype.intramyocardialHemorrhage === 'PRESENT'));
});

test('scenario phenotype validation rejects missing references', () => {
  const scenarios = miScenarios.map((scenario) => scenario.id === 'primary-stemi'
    ? { ...scenario, phenotypeId: 'missing-phenotype' }
    : scenario);
  const result = validateMiScenarioPhenotypes(miScenarioPackDefinitions, scenarios, miScenarioPhenotypes);

  assert.equal(result.valid, false);
  assert.ok(result.issues.some((issue) => issue.code === 'MISSING_FIXTURE'));
  assert.ok(result.issues.some((issue) => issue.code === 'UNREFERENCED_FIXTURE'));
});

test('scenario phenotype validation rejects invalid and non-authored fixtures', () => {
  const invalidFixtures = miScenarioPhenotypes.map((fixture) => fixture.id === 'primary-stemi-anterior-v1'
    ? { ...fixture, phenotype: { ...fixture.phenotype, provenance: [] } }
    : fixture);
  const result = validateMiScenarioPhenotypes(miScenarioPackDefinitions, miScenarios, invalidFixtures);

  assert.equal(result.valid, false);
  assert.ok(result.issues.some((issue) => issue.code === 'INVALID_PHENOTYPE'));
  assert.ok(result.issues.some((issue) => issue.code === 'INVALID_PROVENANCE'));
});