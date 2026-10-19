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

test('every persona receives one compact summary in its default workspace', () => {
  for (const experience of Object.values(personaExperiences)) {
    assert.ok(experience.capabilities.includes('VIEW_INFARCT_SUMMARY'), `${experience.role} needs compact summary access`);
    const placements = experience.extensions?.filter((extension) => extension.id === 'INFARCT_SUMMARY') ?? [];
    assert.equal(placements.length, 1, `${experience.role} needs exactly one compact summary placement`);
    assert.equal(placements[0].workspace, experience.defaultWorkspace);
  }
});

test('compact summaries do not broaden MI scenario exploration access', () => {
  const rolesWithMiExploration = Object.values(personaExperiences)
    .filter((experience) => experience.capabilities.includes('VIEW_MI_SIMULATION'))
    .map((experience) => experience.role)
    .sort();

  assert.deepEqual(rolesWithMiExploration, ['ATTENDING_CARDIOLOGIST', 'IMAGING_REVIEWER', 'RESEARCH_COORDINATOR']);
});

test('regeneration viewing and what-if control are separate capabilities', () => {
  const viewers = Object.values(personaExperiences)
    .filter((experience) => experience.capabilities.includes('VIEW_REGENERATION_SIMULATION'))
    .map((experience) => experience.role)
    .sort();
  const whatIfRunners = Object.values(personaExperiences)
    .filter((experience) => experience.capabilities.includes('RUN_REGENERATION_WHAT_IF'));

  assert.deepEqual(viewers, ['ATTENDING_CARDIOLOGIST', 'RESEARCH_COORDINATOR']);
  assert.deepEqual(whatIfRunners.map((experience) => experience.role), ['RESEARCH_COORDINATOR']);
  for (const experience of whatIfRunners) assert.ok(experience.capabilities.includes('VIEW_REGENERATION_SIMULATION'));
});
