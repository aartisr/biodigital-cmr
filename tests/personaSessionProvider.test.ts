import assert from 'node:assert/strict';
import test from 'node:test';
import { createHttpPersonaSessionProvider, demoPersonaSessionProvider, PersonaSessionProviderError } from '../src/services/personaSessionProvider';

const role = 'ATTENDING_CARDIOLOGIST' as const;
const originalFetch = globalThis.fetch;

test.after(() => { globalThis.fetch = originalFetch; });

test('demo provider mirrors the declarative experience without claiming server authorization', async () => {
  const session = await demoPersonaSessionProvider.resolve(role);
  assert.equal(session.source, 'DEMO');
  assert.equal(session.role, role);
  assert.equal(session.defaultWorkspace, 'OVERVIEW');
  assert.ok(session.capabilities.includes('VIEW_LIVE_TELEMETRY'));
});

test('HTTP provider posts the selected presentation role and filters unknown capabilities', async () => {
  let request: RequestInit | undefined;
  globalThis.fetch = async (_url, init) => {
    request = init;
    return new Response(JSON.stringify({
      capabilities: ['VIEW_LIVE_TELEMETRY', 'NOT_A_CAPABILITY'],
      availableWorkspaces: ['OVERVIEW', 'NOT_A_WORKSPACE'],
      defaultWorkspace: 'OVERVIEW',
      dataScope: 'SCOPED_RESEARCH',
    }), { status: 200 });
  };
  const session = await createHttpPersonaSessionProvider('/persona-session').resolve(role);
  assert.equal(request?.method, 'POST');
  assert.deepEqual(JSON.parse(String(request?.body)), { requestedRole: role });
  assert.deepEqual(session.capabilities, ['VIEW_LIVE_TELEMETRY']);
  assert.deepEqual(session.availableWorkspaces, ['OVERVIEW']);
  assert.equal(session.dataScope, 'SCOPED_RESEARCH');
});

test('HTTP provider rejects incomplete workspace scope and authorization failures', async () => {
  globalThis.fetch = async () => new Response(JSON.stringify({ availableWorkspaces: ['OVERVIEW'], defaultWorkspace: 'MONITORING' }), { status: 200 });
  await assert.rejects(() => createHttpPersonaSessionProvider('/persona-session').resolve(role), (error: unknown) => error instanceof PersonaSessionProviderError && error.state === 'UNAVAILABLE');
  globalThis.fetch = async () => new Response(null, { status: 403 });
  await assert.rejects(() => createHttpPersonaSessionProvider('/persona-session').resolve(role), (error: unknown) => error instanceof PersonaSessionProviderError && error.state === 'DENIED');
});
