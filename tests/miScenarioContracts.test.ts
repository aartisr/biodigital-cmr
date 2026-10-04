import assert from 'node:assert/strict';
import test from 'node:test';
import { evaluateMiScenario } from '../src/services/mi/evaluateMiScenario';
import { miScenarios } from '../src/services/mi/scenarioRepository';

test('full MI spectrum scenarios cover every legacy MI type and the injury-only boundary', () => {
  const legacyTypes = new Set(miScenarios.flatMap((scenario) => scenario.expectedAssessment.legacyType ? [scenario.expectedAssessment.legacyType] : []));
  for (const type of ['TYPE_1', 'TYPE_2', 'TYPE_3', 'TYPE_4A', 'TYPE_4B', 'TYPE_4C', 'TYPE_5']) {
    assert.ok(legacyTypes.has(type as typeof miScenarios[number]['expectedAssessment']['legacyType']), `missing ${type} scenario`);
  }
  assert.ok(miScenarios.some((scenario) => scenario.expectedAssessment.category === 'NON_ISCHAEMIC_INJURY'));
  assert.ok(miScenarios.some((scenario) => scenario.expectedAssessment.category === 'UNRESOLVED'));
});

test('every MI spectrum scenario is immutable simulation data with an explainable result', () => {
  for (const scenario of miScenarios) {
    const result = evaluateMiScenario(scenario);
    assert.equal(scenario.provenance, 'SIMULATED');
    assert.equal(result.disclaimer, 'SIMULATION_ONLY');
    assert.ok(result.explanation.length > 0);
    assert.ok(result.supportingEvidenceIds.every((id) => scenario.evidence.some((item) => item.id === id)));
  }
});

test('unobserved evidence remains an explicit evidence gap', () => {
  const preBiomarkerScenario = miScenarios.find((scenario) => scenario.id === 'type-3-pre-biomarker');
  assert.ok(preBiomarkerScenario);
  const result = evaluateMiScenario(preBiomarkerScenario);
  assert.ok(result.evidenceGaps.some((gap) => gap.includes('troponin')));
});
