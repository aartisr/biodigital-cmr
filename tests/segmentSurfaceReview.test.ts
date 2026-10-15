import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { buildSegmentSurfaceReviewMarkdown, deriveSegmentSurfaceReviewRows } from '../src/features/imaging/anatomy/deriveSegmentSurfaceReview';
import { candidateSegmentSurfaceStrategy } from '../src/features/imaging/anatomy/segmentSurfaceStrategy';

test('review table exposes every candidate region with stable human-readable fields', () => {
  const rows = deriveSegmentSurfaceReviewRows(candidateSegmentSurfaceStrategy);

  assert.equal(rows.length, 20);
  assert.equal(rows[0].regionLabel, 'Basal anterior');
  assert.equal(rows[19].regionLabel, 'Right-ventricular apical region');
  assert.ok(rows.every((row) => /^\d\.\d{3}$/.test(row.uNorm) && /^\d\.\d{3}$/.test(row.vNorm)));
});

test('committed reviewer artifact exactly matches the versioned candidate strategy', () => {
  const artifact = readFileSync(new URL('../docs/mi-segment-surface-strategy-review.md', import.meta.url), 'utf8');

  assert.equal(artifact, buildSegmentSurfaceReviewMarkdown(candidateSegmentSurfaceStrategy));
});