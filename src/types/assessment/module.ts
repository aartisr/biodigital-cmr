import { AssessmentResult, AssessmentTimelineEvent, EvidenceRecord } from './evidence';
import type { ComponentType } from 'react';
import type { PersonaCapability } from '../persona';
import type { WorkspaceId } from '../workspace';

/** A self-contained module that the dashboard can render without condition-specific shell code. */
export interface AssessmentModule<TCase, TCategory extends string, TDomain extends string> {
  id: string;
  version: string;
  title: string;
  evaluate: (caseData: TCase) => AssessmentResult<TCategory>;
  getEvidence: (caseData: TCase) => readonly EvidenceRecord<TDomain>[];
  getTimeline: (caseData: TCase) => readonly AssessmentTimelineEvent<TDomain>[];
}

/** Declarative dashboard registration for a self-contained assessment workspace. */
export interface AssessmentWorkspaceModuleDefinition {
  id: string;
  version: string;
  title: string;
  workspace: WorkspaceId;
  requiredCapability: PersonaCapability;
  scenarioPackIds: readonly string[];
  Component: ComponentType;
}
