import assert from 'node:assert/strict';
import test from 'node:test';
import { createDisabledImportAdapter } from '../src/services/assessment/disabledImportAdapter';

test('external assessment adapters remain blocked in the browser simulation', async () => {
  const adapter = createDisabledImportAdapter<{ sourceUrl: string }, { id: string }>('fhir-research');
  const result = await adapter.import({ source: 'FHIR', payload: { sourceUrl: 'https://example.invalid/fhir' }, provenance: 'IMPORTED_RESEARCH_DATA' });
  assert.equal(result.status, 'BLOCKED');
  assert.match(result.reason, /disabled/i);
});
