import assert from 'node:assert/strict';
import test from 'node:test';
import {
  candidateSegmentSurfaceStrategy,
  getActiveSegmentSurfaceStrategy,
  getSegmentSurfacePlacement,
  projectSegmentSurfacePlacement,
  SUPPORTED_MYOCARDIAL_REGIONS,
} from '../src/features/imaging/anatomy/segmentSurfaceStrategy';
import { validateSegmentSurfaceStrategy } from '../src/features/imaging/anatomy/validateSegmentSurfaceStrategy';
import { getMyocardialRegionKey } from '../src/types/mi/infarctPhenotype';

test('candidate strategy covers every LV and schematic RV region exactly once', () => {
  const keys = candidateSegmentSurfaceStrategy.placements.map(({ region }) => getMyocardialRegionKey(region));

  assert.equal(keys.length, SUPPORTED_MYOCARDIAL_REGIONS.length);
  assert.equal(new Set(keys).size, keys.length);
  assert.deepEqual(new Set(keys), new Set(SUPPORTED_MYOCARDIAL_REGIONS.map(getMyocardialRegionKey)));
  assert.ok(SUPPORTED_MYOCARDIAL_REGIONS.every((region) => getSegmentSurfacePlacement(candidateSegmentSurfaceStrategy, region)));
  assert.deepEqual(validateSegmentSurfaceStrategy(candidateSegmentSurfaceStrategy), { valid: true, issues: [] });
});

test('candidate normalized and projected coordinates are finite, bounded, and unique', () => {
  const projectedKeys = new Set<string>();

  for (const placement of candidateSegmentSurfaceStrategy.placements) {
    assert.ok(placement.uNorm >= 0 && placement.uNorm <= 1);
    assert.ok(placement.vNorm >= 0 && placement.vNorm <= 1);
    assert.ok(Number.isFinite(placement.radialOffset));
    const point = projectSegmentSurfacePlacement(placement);
    assert.ok([point.x, point.y, point.z].every(Number.isFinite));
    assert.ok(point.y >= -9 && point.y <= 3.05);
    projectedKeys.add(`${point.x.toFixed(5)}:${point.y.toFixed(5)}:${point.z.toFixed(5)}`);
  }

  assert.equal(projectedKeys.size, candidateSegmentSurfaceStrategy.placements.length);
});

test('candidate strategy cannot activate without both enablement and completed review', () => {
  assert.equal(getActiveSegmentSurfaceStrategy(), undefined);
  assert.equal(getActiveSegmentSurfaceStrategy({
    ...candidateSegmentSurfaceStrategy,
    review: {
      ...candidateSegmentSurfaceStrategy.review,
      reviewState: 'REVIEWED',
      reviewedAt: '2026-10-14',
    },
  }), undefined);

  const reviewedAndEnabled = {
    ...candidateSegmentSurfaceStrategy,
    enabled: true,
    review: {
      ...candidateSegmentSurfaceStrategy.review,
      reviewState: 'REVIEWED' as const,
      reviewedAt: '2026-10-14',
    },
  };
  assert.equal(getActiveSegmentSurfaceStrategy(reviewedAndEnabled), reviewedAndEnabled);
});

test('strategy validation accumulates metadata, review, ownership, coordinate, and camera issues', () => {
  const malformed = {
    ...candidateSegmentSurfaceStrategy,
    schemaVersion: 'segment-surface-strategy/0.0.0',
    id: ' ',
    version: 'draft',
    enabled: true,
    review: { contentOwner: '', reviewState: 'DRAFT' as const, limitations: [] },
    placements: [
      { ...candidateSegmentSurfaceStrategy.placements[0], uNorm: Number.NaN, preferredView: 'INVALID' },
      { ...candidateSegmentSurfaceStrategy.placements[0], vNorm: 1.2 },
    ],
  } as unknown as typeof candidateSegmentSurfaceStrategy;
  const result = validateSegmentSurfaceStrategy(malformed);
  const codes = new Set(result.issues.map(({ code }) => code));

  assert.equal(result.valid, false);
  for (const code of ['INVALID_SCHEMA_VERSION', 'INVALID_METADATA', 'INVALID_REVIEW_METADATA', 'ACTIVE_WITHOUT_REVIEW', 'DUPLICATE_REGION', 'MISSING_REGION', 'INVALID_COORDINATE', 'INVALID_CAMERA_PRESET']) {
    assert.ok(codes.has(code as never), code);
  }
});