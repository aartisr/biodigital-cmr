/** Condition-agnostic contracts for simulation and research assessment modules. */
export type EvidenceState = 'PRESENT' | 'ABSENT' | 'INDETERMINATE' | 'NOT_OBSERVED';

export type AssessmentConfidence =
  | 'SUPPORTED'
  | 'POSSIBLE'
  | 'INSUFFICIENT_EVIDENCE'
  | 'CONFLICTING_EVIDENCE';

export interface EvidenceRecord<TDomain extends string = string, TValue = unknown> {
  id: string;
  domain: TDomain;
  state: EvidenceState;
  observedAt: string;
  summary: string;
  value?: TValue;
  provenance: 'SIMULATED' | 'IMPORTED_RESEARCH_DATA';
  limitations: readonly string[];
}

export interface AssessmentTimelineEvent<TDomain extends string = string> {
  id: string;
  occurredAt: string;
  domain: TDomain;
  title: string;
  detail: string;
  evidenceIds: readonly string[];
}

export interface AssessmentResult<TCategory extends string = string> {
  category: TCategory;
  confidence: AssessmentConfidence;
  supportingEvidenceIds: readonly string[];
  conflictingEvidenceIds: readonly string[];
  evidenceGaps: readonly string[];
  disclaimer: 'SIMULATION_ONLY';
}
