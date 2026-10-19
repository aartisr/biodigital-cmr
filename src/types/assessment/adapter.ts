/**
 * Contracts only: adapters are deliberately disabled until an approved backend, identity,
 * audit, privacy, governance, and clinical-validation program exists.
 */
export interface AssessmentImportRequest<TInput> {
  source: 'FHIR' | 'DICOM' | 'RESEARCH_FILE';
  payload: TInput;
  provenance: 'IMPORTED_RESEARCH_DATA';
}

export type AssessmentImportResult<TCase> =
  | { status: 'BLOCKED'; reason: string }
  | { status: 'ACCEPTED_FOR_VALIDATION'; caseData: TCase };

export interface AssessmentDataAdapter<TInput, TCase> {
  id: string;
  version: string;
  import: (request: AssessmentImportRequest<TInput>) => Promise<AssessmentImportResult<TCase>>;
}
