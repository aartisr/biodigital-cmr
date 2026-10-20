import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createSculptedCardiacGeometry,
  DEFAULT_HEART_SURFACE_PARAMETERS,
  getAnatomicalHeartPoint,
} from '../src/features/imaging/anatomy/heartSurfaceGeometry';

test('heart surface coordinates are deterministic and finite across normalized bounds', () => {
  const samples = [0, 0.25, 0.5, 0.75, 1].flatMap((uNorm) =>
    [0, 0.25, 0.5, 0.75, 1].map((vNorm) => getAnatomicalHeartPoint(uNorm, vNorm)),
  );
  const repeated = getAnatomicalHeartPoint(0.25, 0.75);

  assert.ok(samples.every((point) => [point.x, point.y, point.z].every(Number.isFinite)));
  assert.deepEqual(repeated, getAnatomicalHeartPoint(0.25, 0.75));
  assert.ok(samples.every((point) => point.y >= -9 && point.y <= 3.05));
});

test('sculpted geometry has complete finite positions, UVs, indices, and normals', () => {
  const geometry = createSculptedCardiacGeometry(
    DEFAULT_HEART_SURFACE_PARAMETERS.lveddMm,
    DEFAULT_HEART_SURFACE_PARAMETERS.septalThicknessMm,
    DEFAULT_HEART_SURFACE_PARAMETERS.sphericity,
  );
  const positions = geometry.getAttribute('position');
  const textureCoordinates = geometry.getAttribute('uv');
  const normals = geometry.getAttribute('normal');

  assert.equal(positions.count, 57 * 57 + 1);
  assert.equal(textureCoordinates.count, positions.count);
  assert.equal(normals.count, positions.count);
  assert.ok(geometry.index);
  assert.ok(Array.from(positions.array).every(Number.isFinite));
  assert.ok(Array.from(textureCoordinates.array).every((value) => Number.isFinite(value) && value >= 0 && value <= 1));
  assert.ok(Array.from(geometry.index.array).every((value) => value >= 0 && value < positions.count));
});