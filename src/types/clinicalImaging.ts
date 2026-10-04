export type ImagingModality = 'CARDIAC_MR_CINE' | 'CARDIAC_MR_LGE' | 'CARDIAC_CT_CTA' | 'THREE_D_ECHO';
export type ImagingCaseStatus = 'NO_SOURCE_IMAGES' | 'AWAITING_QC' | 'AWAITING_CLINICIAN_REVIEW' | 'RESEARCH_REVIEWED' | 'REJECTED';

export interface ClinicalImagingCase {
  caseId: string;
  patientId: string;
  status: ImagingCaseStatus;
  modality: ImagingModality | null;
  sourceDicomStudyUid: string | null;
  segmentationUid: string | null;
  sourceImagesVerified: boolean;
  acquisitionQualityApproved: boolean;
  clinicianReviewer: string | null;
  reviewedAt: string | null;
  measurementVersion: string | null;
  limitations: string[];
}

export const diagnosticGateLabels = [
  'Original DICOM source study linked and immutable',
  'Acquisition and image-quality review complete',
  'Segmentation stored as a versioned DICOM SEG / label map',
  'Qualified clinician has reviewed and accepted contours',
  'Measurement method and software version are traceable',
  'Clinical validation and regulatory authorization are complete',
] as const;
