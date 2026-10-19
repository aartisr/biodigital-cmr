import assert from 'node:assert/strict';
import test from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { PatientInfarctSummaryPanel } from '../src/components/persona/PatientInfarctSummaryPanel';
import { PATIENT_COHORTS } from '../src/config/patientCohorts';

const patient = PATIENT_COHORTS[0];

test('bedside compact summary stays read-only and withholds segment and source detail', () => {
  const html = renderToStaticMarkup(<PatientInfarctSummaryPanel patient={patient} capabilities={['VIEW_INFARCT_SUMMARY']} />);

  assert.match(html, /Structured phenotype · read-only summary/);
  assert.match(html, /Legacy inference/);
  assert.match(html, /Known limitations/);
  assert.doesNotMatch(html, /Source references/);
  assert.doesNotMatch(html, /Basal anterior/);
  assert.doesNotMatch(html, /<button/);
});

test('provenance-capable compact summary exposes source references without controls', () => {
  const html = renderToStaticMarkup(<PatientInfarctSummaryPanel patient={patient} capabilities={['VIEW_INFARCT_SUMMARY', 'VIEW_MI_PROVENANCE']} />);

  assert.match(html, /Source references/);
  assert.match(html, /legacy-patient:PAT-7721/);
  assert.doesNotMatch(html, /<button/);
});

test('invalid patient phenotype renders unavailable instead of legacy fallback facts', () => {
  assert.ok(patient.infarctPhenotype);
  const html = renderToStaticMarkup(<PatientInfarctSummaryPanel
    patient={{ ...patient, infarctPhenotype: { ...patient.infarctPhenotype, daysSinceIndexEvent: -1 } }}
    capabilities={['VIEW_INFARCT_SUMMARY', 'VIEW_MI_PROVENANCE']}
  />);

  assert.match(html, /Infarct phenotype summary unavailable/);
  assert.match(html, /Legacy display text was not used as a substitute/);
  assert.doesNotMatch(html, /legacy-patient:PAT-7721/);
});