import assert from 'node:assert/strict';
import test from 'node:test';
import { miScenarioPhenotypes } from '../src/config/mi/scenarioPhenotypes';
import { personaExperiences } from '../src/config/personaExperiences';
import { deriveInfarctSummary } from '../src/services/mi/deriveInfarctSummary';
import { deriveInfarctSummaryPresentation } from '../src/services/mi/deriveInfarctSummaryPresentation';
import type { PersonaCapability } from '../src/types/persona';

const fixture = miScenarioPhenotypes.find((candidate) => candidate.id === 'lateral-subacute-v1');
assert.ok(fixture);
const summary = deriveInfarctSummary(fixture.phenotype);
const capabilitySets: readonly (readonly PersonaCapability[])[] = [
  ['VIEW_MI_SIMULATION'],
  ['VIEW_MI_SIMULATION', 'VIEW_MI_SEGMENT_DETAIL'],
  ['VIEW_MI_SIMULATION', 'VIEW_MI_PROVENANCE'],
  ['VIEW_MI_SIMULATION', 'VIEW_MI_SEGMENT_DETAIL', 'VIEW_MI_PROVENANCE'],
];

test('capability-driven presentations preserve identical summary facts', () => {
  for (const capabilities of capabilitySets) {
    const presentation = deriveInfarctSummaryPresentation(summary, capabilities);
    assert.deepEqual(new Set(presentation.facts.map(({ id }) => id)), new Set(['location', 'timing', 'morphology', 'extent']));
    for (const { id, fact } of presentation.facts) assert.equal(fact, summary[id]);
  }
});

test('capabilities change emphasis and optional detail without changing facts', () => {
  const general = deriveInfarctSummaryPresentation(summary, ['VIEW_MI_SIMULATION']);
  const imaging = deriveInfarctSummaryPresentation(summary, ['VIEW_MI_SIMULATION', 'VIEW_MI_SEGMENT_DETAIL', 'VIEW_MI_PROVENANCE']);

  assert.equal(general.emphasis, 'GENERAL');
  assert.equal(general.facts[0].id, 'timing');
  assert.equal(general.facts.find(({ id }) => id === 'location')?.showDetail, false);
  assert.equal(general.showProvenance, false);
  assert.equal(imaging.emphasis, 'ANATOMY');
  assert.equal(imaging.facts[0].id, 'location');
  assert.equal(imaging.facts.find(({ id }) => id === 'location')?.showDetail, true);
  assert.equal(imaging.showProvenance, true);
});

test('configured persona presentations all retain the same source facts', () => {
  for (const experience of Object.values(personaExperiences)) {
    const presentation = deriveInfarctSummaryPresentation(summary, experience.capabilities);
    for (const { id, fact } of presentation.facts) assert.equal(fact, summary[id], `${experience.role} changed ${id}`);
  }
});