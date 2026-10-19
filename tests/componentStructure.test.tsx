import assert from 'node:assert/strict';
import test from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { WorkspaceNavigation } from '../src/components/WorkspaceNavigation';
import { PersonaAccessState } from '../src/components/persona/PersonaAccessState';
import { ModalShell } from '../src/components/ui/ModalShell';
import { SimulationBoundaryNotice } from '../src/components/ui/SimulationBoundaryNotice';
import { MiScenarioLimitations } from '../src/components/mi/MiScenarioLimitations';
import { MiCoverageBoundary } from '../src/components/mi/MiCoverageBoundary';
import { miCoverageManifest } from '../src/config/mi/coverageManifest';
import { deriveMiCoverageDisplay } from '../src/services/mi/deriveMiCoverageDisplay';
import { ReviewWorkspace } from '../src/components/ReviewWorkspace';
import { PatientTrendAnalysis } from '../src/components/PatientTrendAnalysis';
import { PATIENT_COHORTS } from '../src/config/patientCohorts';
import { workspaceNavigation } from '../src/config/workspaceNavigation';
import { workspaceIds } from '../src/types/workspace';
import { MiScenarioPicker } from '../src/components/mi/MiScenarioPicker';
import { miScenarios } from '../src/services/mi/scenarioRepository';

test('workspace navigation metadata is complete and independently configurable', () => {
  assert.deepEqual(Object.keys(workspaceNavigation).sort(), [...workspaceIds].sort());
  assert.equal(workspaceNavigation.QSRE_ENGINE.group, 'RESEARCH');
  assert.equal(workspaceNavigation.OVERVIEW.group, 'CORE');
});

test('workspace navigation emits an accessible, role-scoped tab list', () => {
  const html = renderToStaticMarkup(<WorkspaceNavigation activeWorkspace="MONITORING" onChange={() => undefined} workspaces={['MONITORING', 'REVIEW']} />);
  assert.match(html, /role="tablist"/);
  assert.match(html, /workspace-tab-MONITORING/);
  assert.match(html, /aria-selected="true"/);
  assert.doesNotMatch(html, /workspace-tab-THERAPY/);
});

test('persona access states do not render workspace content while unavailable', () => {
  const html = renderToStaticMarkup(<PersonaAccessState state="UNAVAILABLE" failure={{ state: 'UNAVAILABLE', message: 'Policy offline' }} onRetry={() => undefined} />);
  assert.match(html, /Role profile unavailable/);
  assert.match(html, /Retry role profile/);
});

test('shared modal shell exposes dialog semantics and a labelled close control', () => {
  const html = renderToStaticMarkup(<ModalShell isOpen onClose={() => undefined} title="Test tool"><p>Body</p></ModalShell>);
  assert.match(html, /role="dialog"/);
  assert.match(html, /aria-modal="true"/);
  assert.match(html, /aria-label="Close Test tool"/);
});

test('shared simulation notice renders domain-specific safety boundaries', () => {
  const regeneration = renderToStaticMarkup(<SimulationBoundaryNotice kind="REGENERATION" />);
  const anatomy = renderToStaticMarkup(<SimulationBoundaryNotice kind="SCHEMATIC_ANATOMY" compact />);
  assert.match(regeneration, /Illustrative model/);
  assert.match(regeneration, /not a validated patient forecast/);
  assert.match(anatomy, /Schematic anatomy/);
  assert.doesNotMatch(anatomy, /not patient-specific anatomy/);
});

test('MI scenario limitations expose insufficiency, unsupported uses, and review state', () => {
  const html = renderToStaticMarkup(<MiScenarioLimitations
    limitations={{ whyInsufficient: ['One pattern is not comprehensive.'], unsupportedUses: ['Do not diagnose a real patient.'] }}
    review={{ contentOwner: 'Test owner', reviewState: 'REQUIRES_CLINICAL_REVIEW', limitations: ['Review pending.'] }}
  />);
  assert.match(html, /Why this simulation is not enough/);
  assert.match(html, /Unsupported uses/);
  assert.match(html, /Clinical review required/);
});

test('MI coverage boundary exposes represented, partial, and unsupported dimensions', () => {
  const html = renderToStaticMarkup(<MiCoverageBoundary groups={deriveMiCoverageDisplay(miCoverageManifest)} />);
  assert.match(html, /Coverage boundary/);
  assert.match(html, /Represented:/);
  assert.match(html, /Partial:/);
  assert.match(html, /Unsupported:/);
  assert.match(html, /Anatomical territory/);
  assert.match(html, /Posterior/);
});

test('MI scenario picker prioritizes one selected case and progressively discloses the library', () => {
  const html = renderToStaticMarkup(<MiScenarioPicker scenarios={miScenarios.slice(0, 2)} selectedId={miScenarios[0].id} onSelect={() => undefined} />);
  assert.match(html, /Choose a learning case/);
  assert.match(html, /Choose a synthetic MI scenario/);
  assert.match(html, /Browse all 2 available cases/);
  assert.match(html, /<details/);
});

test('review workspace omits the projection trigger without view capability', () => {
  const withoutProjection = renderToStaticMarkup(<ReviewWorkspace snapshotsCount={0} onOpenSnapshots={() => undefined} onOpenAudit={() => undefined} onOpenReport={() => undefined}><p>Review body</p></ReviewWorkspace>);
  const withProjection = renderToStaticMarkup(<ReviewWorkspace snapshotsCount={0} onOpenSnapshots={() => undefined} onOpenAudit={() => undefined} onOpenReport={() => undefined} onOpenPrediction={() => undefined}><p>Review body</p></ReviewWorkspace>);

  assert.doesNotMatch(withoutProjection, />Projection</);
  assert.match(withProjection, />Projection</);
});

test('trend methodology disclosure has an accessible name and controlled region', () => {
  const html = renderToStaticMarkup(<PatientTrendAnalysis patient={PATIENT_COHORTS[0]} />);

  assert.match(html, /aria-label="Show trend analysis methodology"/);
  assert.match(html, /aria-controls="trend-analysis-methodology"/);
  assert.match(html, /aria-expanded="false"/);
});
