import type { MiScenarioCase } from './classification';

export type MiScenarioReviewState = 'DRAFT' | 'REQUIRES_CLINICAL_REVIEW' | 'REVIEWED';

export interface MiScenarioReviewMetadata {
  contentOwner: string;
  reviewState: MiScenarioReviewState;
  reviewedAt?: string;
  limitations: readonly string[];
}

export interface MiScenarioPack {
  id: string;
  version: string;
  title: string;
  learningPurpose: string;
  taxonomyVersion: string;
  phenotypeVersion: string;
  review: MiScenarioReviewMetadata;
  scenarios: readonly MiScenarioCase[];
}

export interface MiScenarioPackDefinition extends Omit<MiScenarioPack, 'scenarios'> {
  scenarioIds: readonly string[];
}