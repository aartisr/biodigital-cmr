import assert from 'node:assert/strict';
import test from 'node:test';
import { miScenarioPhenotypes } from '../src/config/mi/scenarioPhenotypes';
import { mapPhenotypeToSurface } from '../src/features/imaging/anatomy/mapPhenotypeToSurface';
import { candidateSegmentSurfaceStrategy } from '../src/features/imaging/anatomy/segmentSurfaceStrategy';
import { deriveScarScene } from '../src/services/mi/deriveScarScene';

const reviewedMetadata = {
  contentOwner: 'Test review boundary',
  reviewState: 'REVIEWED' as const,
  reviewedAt: '2026-10-14',
  limitations: ['Test-only completed review metadata.'],
};
const activeStrategy = {
  ...candidateSegmentSurfaceStrategy,
  enabled: true,
  review: reviewedMetadata,
};

test('multi-region mapping preserves depth, extent, provenance, and deterministic ordering', () => {
  const fixture = miScenarioPhenotypes.find((candidate) => candidate.id === 'lateral-subacute-v1');
  assert.ok(fixture);
  const phenotype = {
    ...fixture.phenotype,
    segments: fixture.phenotype.segments.map((segment, index) => index === 0 ? { ...segment, extentPercent: 37 } : segment),
  };
  const scene = deriveScarScene(phenotype, reviewedMetadata);
  const mapping = mapPhenotypeToSurface(scene, activeStrategy);

  assert.equal(mapping.status, 'MAPPED');
  const regionKeys = mapping.regions.map(({ regionKey }) => regionKey);
  assert.deepEqual(regionKeys, [...regionKeys].sort());
  assert.equal(mapping.regions[0].depth, 'MIXED');
  assert.ok(mapping.regions.some(({ extentPercent }) => extentPercent === 37));
  assert.ok(mapping.regions.every(({ sourceEvidenceIds }) => sourceEvidenceIds.length > 0));
  assert.equal(Object.isFrozen(mapping.regions), true);
  assert.equal(Object.isFrozen(mapping.borderZones), true);
  assert.ok(mapping.regions.every((region) => Object.isFrozen(region) && Object.isFrozen(region.center) && Object.isFrozen(region.sourceEvidenceIds)));
  assert.deepEqual(
    mapping.borderZones.map(({ regionKey, center }) => ({ regionKey, center })),
    mapping.regions.map(({ regionKey, center }) => ({ regionKey, center })),
  );
});

test('disabled strategy and unsupported scenes fail closed without partial descriptors', () => {
  const fixture = miScenarioPhenotypes.find((candidate) => candidate.id === 'lateral-subacute-v1');
  assert.ok(fixture);
  const supportedScene = deriveScarScene(fixture.phenotype, reviewedMetadata);
  const disabled = mapPhenotypeToSurface(supportedScene, candidateSegmentSurfaceStrategy);
  const unknown = mapPhenotypeToSurface(deriveScarScene(undefined), activeStrategy);

  assert.equal(disabled.status, 'UNAVAILABLE');
  assert.deepEqual(disabled.regions, []);
  assert.equal(unknown.status, 'UNAVAILABLE');
  assert.deepEqual(unknown.borderZones, []);
});

test('a missing placement rejects the whole mapping and reports its region key', () => {
  const fixture = miScenarioPhenotypes.find((candidate) => candidate.id === 'posterior-chronic-v1');
  assert.ok(fixture);
  const scene = deriveScarScene(fixture.phenotype, reviewedMetadata);
  assert.equal(scene.status, 'SUPPORTED');
  const omittedRegionKey = `AHA_17_LV:${fixture.phenotype.segments[0].region.segmentId}`;
  const incompleteStrategy = {
    ...activeStrategy,
    placements: activeStrategy.placements.filter(({ region }) =>
      !(region.scheme === fixture.phenotype.segments[0].region.scheme && region.segmentId === fixture.phenotype.segments[0].region.segmentId)),
  };
  const mapping = mapPhenotypeToSurface(scene, incompleteStrategy);

  assert.equal(mapping.status, 'UNAVAILABLE');
  assert.deepEqual(mapping.regions, []);
  assert.deepEqual(mapping.missingRegionKeys, [omittedRegionKey]);
});