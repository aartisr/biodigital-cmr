import assert from 'node:assert/strict';
import test from 'node:test';
import { createUnavailableClinicalResearchGateway } from '../src/services/clinicalResearchGateway';

test('static clinical-research gateway fails closed and retains no manifest', async () => {
  const gateway = createUnavailableClinicalResearchGateway();
  const result = await gateway.authorize({
    actorId: 'demo-user', purposeOfUse: 'RESEARCH', siteId: 'demo-site', requestedCaseId: 'case-1',
  });

  assert.equal(result.decision, 'UNAVAILABLE');
  assert.equal(result.policyVersion, null);
  assert.match(result.reason, /static simulation/i);
  assert.equal(await gateway.getStudyManifest('case-1'), null);
});
