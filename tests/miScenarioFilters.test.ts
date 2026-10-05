import assert from 'node:assert/strict';
import test from 'node:test';
import { defaultMiScenarioFilters, filterMiScenarios } from '../src/services/mi/filterMiScenarios';
import { miScenarios } from '../src/services/mi/scenarioRepository';

test('MI scenario filters compose group, presentation, evidence domain, and text query', () => {
  assert.ok(filterMiScenarios(miScenarios, { ...defaultMiScenarioFilters, group: 'PROCEDURE_RELATED' }).every((item) => item.expectedAssessment.category === 'PROCEDURE_RELATED'));
  assert.deepEqual(filterMiScenarios(miScenarios, { ...defaultMiScenarioFilters, presentation: 'SILENT_OR_UNRECOGNIZED' }).map((item) => item.id), ['silent-recurrent']);
  assert.ok(filterMiScenarios(miScenarios, { ...defaultMiScenarioFilters, evidenceDomain: 'ANGIOGRAPHY' }).every((item) => item.evidence.some((evidence) => evidence.domain === 'ANGIOGRAPHY')));
  assert.deepEqual(filterMiScenarios(miScenarios, { ...defaultMiScenarioFilters, query: 'CABG' }).map((item) => item.id), ['procedure-cabg']);
});
