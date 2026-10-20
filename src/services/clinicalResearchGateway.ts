import {
  ClinicalResearchAccessRequest,
  ClinicalResearchAccessResult,
  ClinicalResearchAuditEvent,
  ClinicalResearchGateway,
  ImmutableStudyManifest,
} from '../types/clinicalResearch';

const unavailableReason = 'Clinical-research access is unavailable in this static simulation. No clinical case, study manifest, or audit event is transported or retained.';

/**
 * Safe default for all browser builds. Replacing this adapter requires an
 * approved server implementation; browser code must never become the policy
 * decision point or a store for clinical data.
 */
export const createUnavailableClinicalResearchGateway = (): ClinicalResearchGateway => ({
  async authorize(_request: ClinicalResearchAccessRequest): Promise<ClinicalResearchAccessResult> {
    return { decision: 'UNAVAILABLE', reason: unavailableReason, policyVersion: null };
  },
  async getStudyManifest(_caseId: string): Promise<ImmutableStudyManifest | null> {
    return null;
  },
  async recordAuditEvent(_event: ClinicalResearchAuditEvent): Promise<void> {
    // Intentionally no-op: a browser cannot provide an immutable clinical audit trail.
  },
});
