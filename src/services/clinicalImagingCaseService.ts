import { ClinicalImagingCase } from '../types/clinicalImaging';

/**
 * Creates a deliberately blocked research case. This application does not
 * ingest, retain, or interpret DICOM yet, so no simulated dashboard value can
 * be promoted to a diagnostic measurement.
 */
export function createResearchImagingCase(patientId: string): ClinicalImagingCase {
  return {
    caseId: `research-imaging-${patientId}`,
    patientId,
    status: 'NO_SOURCE_IMAGES',
    modality: null,
    sourceDicomStudyUid: null,
    segmentationUid: null,
    sourceImagesVerified: false,
    acquisitionQualityApproved: false,
    clinicianReviewer: null,
    reviewedAt: null,
    measurementVersion: null,
    limitations: [
      'No source DICOM study has been ingested.',
      'Current anatomy is a procedural visualization, not a patient-specific reconstruction.',
      'Diagnostic use is blocked pending validation, governance, and regulatory authorization.',
    ],
  };
}
