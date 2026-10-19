import assert from 'node:assert/strict';
import test from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { InfarctSummaryPanel } from '../src/components/mi/InfarctSummaryPanel';
import { miScenarioPhenotypes } from '../src/config/mi/scenarioPhenotypes';
import { deriveInfarctSummary } from '../src/services/mi/deriveInfarctSummary';

const fixture = miScenarioPhenotypes.find((candidate) => candidate.id === 'primary-stemi-anterior-v1');
assert.ok(fixture);
const summary = deriveInfarctSummary(fixture.phenotype);

test('general summary is plain-language and withholds segment and provenance detail', () => {
  const html = renderToStaticMarkup(<InfarctSummaryPanel summary={summary} capabilities={['VIEW_MI_SIMULATION']} review={fixture.review} />);

  assert.match(html, /Infarct phenotype summary/);
  assert.match(html, /Clinical review required/);
  assert.match(html, /Authored simulation/);
  assert.match(html, /Timing not established/);
  assert.match(html, /Extent not established/);
  assert.match(html, /Known limitations/);
  assert.doesNotMatch(html, /Basal anterior/);
  assert.doesNotMatch(html, /scenario-primary-stemi-anatomy/);
  assert.doesNotMatch(html, /Source references/);
});

test('detail capabilities disclose segment labels and structured source references', () => {
  const html = renderToStaticMarkup(<InfarctSummaryPanel
    summary={summary}
    capabilities={['VIEW_MI_SIMULATION', 'VIEW_MI_SEGMENT_DETAIL', 'VIEW_MI_PROVENANCE']}
    review={fixture.review}
  />);

  assert.match(html, /Basal anterior/);
  assert.match(html, /Source references/);
  assert.match(html, /scenario-primary-stemi-anatomy/);
});

test('missing phenotype state refuses to infer anatomy from classification text', () => {
  const html = renderToStaticMarkup(<InfarctSummaryPanel capabilities={['VIEW_MI_SIMULATION']} />);

  assert.match(html, /No structured infarct phenotype is available/);
  assert.match(html, /not inferred from its title or free text/);
});