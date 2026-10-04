import assert from 'node:assert/strict';
import test from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { WorkspaceNavigation } from '../src/components/WorkspaceNavigation';
import { PersonaAccessState } from '../src/components/persona/PersonaAccessState';
import { ModalShell } from '../src/components/ui/ModalShell';

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
