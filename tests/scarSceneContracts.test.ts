import assert from 'node:assert/strict';
import test from 'node:test';
import { miScenarioPhenotypes } from '../src/config/mi/scenarioPhenotypes';
import { deriveScarScene } from '../src/services/mi/deriveScarScene';

test('missing or unresolved anatomy uses an explicit unknown schematic fallback', () => {
  const scene = deriveScarScene(undefined);

  assert.equal(scene.status, 'UNKNOWN');
  assert.equal(scene.renderMode, 'SCHEMATIC_FALLBACK');
  assert.deepEqual(scene.regions, []);
});

test('every current unreviewed phenotype is blocked from anatomy-driven rendering', () => {
  for (const fixture of miScenarioPhenotypes) {
    const scene = deriveScarScene(fixture.phenotype, fixture.review);
    assert.equal(scene.status, 'UNAVAILABLE', fixture.id);
    assert.equal(scene.renderMode, 'SCHEMATIC_FALLBACK', fixture.id);
    assert.deepEqual(scene.regions, [], fixture.id);
  }
});

test('a valid phenotype requires explicit completed review before regions are supported', () => {
  const fixture = miScenarioPhenotypes.find((candidate) => candidate.id === 'lateral-subacute-v1');
  assert.ok(fixture);
  const scene = deriveScarScene(fixture.phenotype, {
    ...fixture.review,
    reviewState: 'REVIEWED',
    reviewedAt: '2026-10-14',
  });

  assert.equal(scene.status, 'SUPPORTED');
  assert.equal(scene.renderMode, 'PHENOTYPE_REGIONS');
  assert.deepEqual(scene.regions.map(({ region }) => region), fixture.phenotype.segments.map(({ region }) => region));
});