import assert from 'node:assert/strict';
import test from 'node:test';
import { personaExperiences } from '../src/config/personaExperiences';
import { personaCapabilities } from '../src/types/persona';
import { workspaceIds, workspaceMetadata } from '../src/types/workspace';

test('every persona has a valid default workspace and only known capabilities', () => {
  for (const experience of Object.values(personaExperiences)) {
    assert.ok(experience.availableWorkspaces.length > 0, `${experience.role} needs a workspace`);
    assert.ok(experience.availableWorkspaces.includes(experience.defaultWorkspace), `${experience.role} default must be available`);
    for (const workspace of experience.availableWorkspaces) assert.ok(workspaceIds.includes(workspace));
    for (const capability of experience.capabilities) assert.ok(personaCapabilities.includes(capability));
    for (const extension of experience.extensions ?? []) assert.ok(experience.availableWorkspaces.includes(extension.workspace), `${experience.role} extension must target an available workspace`);
  }
});

test('every workspace has stable display metadata', () => {
  for (const workspace of workspaceIds) {
    assert.ok(workspaceMetadata[workspace].label.length > 0);
    assert.ok(workspaceMetadata[workspace].description.length > 0);
  }
});
