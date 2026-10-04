import { AssessmentResult, AssessmentTimelineEvent, EvidenceRecord } from './evidence';

/** A self-contained module that the dashboard can render without condition-specific shell code. */
export interface AssessmentModule<TCase, TCategory extends string, TDomain extends string> {
  id: string;
  version: string;
  title: string;
  evaluate: (caseData: TCase) => AssessmentResult<TCategory>;
  getEvidence: (caseData: TCase) => readonly EvidenceRecord<TDomain>[];
  getTimeline: (caseData: TCase) => readonly AssessmentTimelineEvent<TDomain>[];
}
