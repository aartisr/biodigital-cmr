import assert from 'node:assert/strict';
import test from 'node:test';
import { createResearchImagingCase } from '../src/services/clinicalImagingCaseService';

test('research imaging cases stay explicitly blocked without a source study', () => {
  const imagingCase = createResearchImagingCase('PATIENT-1');
  assert.equal(imagingCase.caseId, 'research-imaging-PATIENT-1');
  assert.equal(imagingCase.status, 'NO_SOURCE_IMAGES');
  assert.equal(imagingCase.sourceDicomStudyUid, null);
  assert.equal(imagingCase.sourceImagesVerified, false);
  assert.equal(imagingCase.acquisitionQualityApproved, false);
  assert.match(imagingCase.limitations.join(' '), /not a patient-specific reconstruction/i);
});
