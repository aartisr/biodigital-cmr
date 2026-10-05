import assert from 'node:assert/strict';
import test from 'node:test';
import { buildSimulationExportText } from '../src/services/assessment/simulationExport';

test('simulation exports are watermarked and include reproducibility metadata', () => {
  const output = buildSimulationExportText({ title: 'Synthetic case', moduleId: 'module', moduleVersion: '1.0.0', taxonomyVersion: 'taxonomy-v1', scenarioPackId: 'pack-v1', sections: [{ heading: 'Evidence', lines: ['Synthetic only'] }] });
  assert.match(output, /SIMULATION-ONLY/);
  assert.match(output, /Not a diagnosis/);
  assert.match(output, /Module: module v1.0.0/);
  assert.match(output, /Taxonomy: taxonomy-v1/);
  assert.match(output, /Synthetic only/);
});
