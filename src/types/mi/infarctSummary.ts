export const INFARCT_SUMMARY_SCHEMA_VERSION = 'infarct-summary/1.0.0' as const;

export type SummarySourceState = 'SOURCED' | 'AUTHORED_SIMULATION' | 'INFERRED' | 'UNKNOWN';

export interface InfarctSummaryFact {
  sourceState: SummarySourceState;
  label: string;
  detail: string;
  sourceIds: readonly string[];
}

export interface InfarctSummary {
  schemaVersion: typeof INFARCT_SUMMARY_SCHEMA_VERSION;
  location: InfarctSummaryFact;
  timing: InfarctSummaryFact;
  morphology: InfarctSummaryFact;
  extent: InfarctSummaryFact;
  limitations: readonly string[];
}