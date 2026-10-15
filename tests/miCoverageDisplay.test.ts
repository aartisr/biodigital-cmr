import assert from 'node:assert/strict';
import test from 'node:test';
import { miCoverageManifest } from '../src/config/mi/coverageManifest';
import { deriveMiCoverageDisplay } from '../src/services/mi/deriveMiCoverageDisplay';

test('coverage display preserves every manifest claim with human-readable labels', () => {
  const groups = deriveMiCoverageDisplay(miCoverageManifest);
  const items = groups.flatMap((group) => group.items);

  assert.equal(groups.length, 10);
  assert.equal(items.length, miCoverageManifest.claims.length);
  assert.ok(groups.every((group) => group.label.length > 0 && group.items.length > 0));
  assert.ok(items.every((item) => item.label.length > 0));
});

test('coverage display keeps represented, partial, and unsupported states distinct', () => {
  const items = deriveMiCoverageDisplay(miCoverageManifest).flatMap((group) => group.items);
  assert.ok(items.some((item) => item.status === 'REPRESENTED'));
  assert.ok(items.some((item) => item.status === 'PARTIAL'));
  assert.ok(items.some((item) => item.status === 'UNSUPPORTED'));
  assert.ok(items.filter((item) => item.status === 'UNSUPPORTED').every((item) => item.scenarioCount === 0));
});