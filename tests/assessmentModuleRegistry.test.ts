import assert from 'node:assert/strict';
import test from 'node:test';
import { assessmentWorkspaceModules, getAssessmentModuleForWorkspace } from '../src/config/assessment/moduleRegistry';
import { personaCapabilities } from '../src/types/persona';
import { workspaceIds } from '../src/types/workspace';

test('assessment workspace modules have unique IDs, valid workspaces, and known capabilities', () => {
  const ids = new Set<string>();
  const workspaces = new Set<string>();
  for (const module of assessmentWorkspaceModules) {
    assert.ok(!ids.has(module.id), `duplicate module id: ${module.id}`);
    assert.ok(!workspaces.has(module.workspace), `duplicate assessment workspace: ${module.workspace}`);
    assert.ok(workspaceIds.includes(module.workspace));
    assert.ok(personaCapabilities.includes(module.requiredCapability));
    assert.ok(module.version.length > 0);
    ids.add(module.id);
    workspaces.add(module.workspace);
  }
});

test('MI spectrum resolves through the generic assessment registry', () => {
  assert.equal(getAssessmentModuleForWorkspace('MI_SPECTRUM')?.id, 'mi-spectrum');
});
