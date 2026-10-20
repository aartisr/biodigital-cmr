/**
 * Contracts for the future clinical-research boundary. They deliberately model
 * governance and evidence state, not transport credentials or patient payloads.
 */
export type ClinicalResearchAccessDecision = 'ALLOW' | 'DENY' | 'UNAVAILABLE';

export interface ClinicalResearchAccessRequest {
  actorId: string;
  purposeOfUse: 'RESEARCH';
  siteId: string;
  requestedCaseId: string;
}

export interface ClinicalResearchAccessResult {
  decision: ClinicalResearchAccessDecision;
  reason: string;
  policyVersion: string | null;
}

export interface ImmutableStudyManifest {
  caseId: string;
  sourceStudyReference: string;
  sourceStudyDigest: string;
  modality: 'CARDIAC_MR_CINE';
  consentOrIrbReference: string;
  deidentificationVerifiedAt: string;
  createdAt: string;
}

export interface ClinicalResearchAuditEvent {
  eventType: 'ACCESS_REQUESTED' | 'ACCESS_DENIED' | 'CASE_VIEWED' | 'EXPORT_REQUESTED';
  occurredAt: string;
  actorId: string;
  caseId: string;
  purposeOfUse: 'RESEARCH';
  outcome: 'ALLOWED' | 'DENIED';
}

export interface ClinicalResearchGateway {
  authorize(request: ClinicalResearchAccessRequest): Promise<ClinicalResearchAccessResult>;
  getStudyManifest(caseId: string): Promise<ImmutableStudyManifest | null>;
  recordAuditEvent(event: ClinicalResearchAuditEvent): Promise<void>;
}
