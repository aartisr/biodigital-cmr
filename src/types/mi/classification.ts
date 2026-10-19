import { AssessmentResult, AssessmentTimelineEvent, EvidenceRecord } from '../assessment/evidence';
import type { MiScenarioReviewMetadata } from './scenarioPack';

export type MiClinicalGroup =
  | 'PRIMARY'
  | 'SECONDARY'
  | 'PROCEDURE_RELATED'
  | 'UNRESOLVED'
  | 'NON_ISCHAEMIC_INJURY';

export type MiLegacyType = 'TYPE_1' | 'TYPE_2' | 'TYPE_3' | 'TYPE_4A' | 'TYPE_4B' | 'TYPE_4C' | 'TYPE_5';
export type MiPresentation = 'STEMI' | 'NSTEMI' | 'SILENT_OR_UNRECOGNIZED' | 'UNKNOWN';
export type MiEventSequence = 'INDEX' | 'RECURRENT' | 'UNKNOWN';
export type MiEvidenceDomain = 'SYMPTOMS' | 'TROPONIN' | 'ECG' | 'IMAGING' | 'ANGIOGRAPHY' | 'PROCEDURE' | 'CONTEXT';

export interface MiAssessment extends AssessmentResult<MiClinicalGroup> {
  legacyType?: MiLegacyType;
  presentation: MiPresentation;
  label: string;
  explanation: string;
}

export interface MiTroponinPoint {
  occurredAt: string;
  value: number;
  unit: 'ng/L';
  upperReferenceLimit: number;
}

export interface MiScenarioLimitations {
  whyInsufficient: readonly string[];
  unsupportedUses: readonly string[];
}

export interface MiScenarioCase {
  id: string;
  title: string;
  learningObjective: string;
  descriptors: readonly string[];
  eventSequence: MiEventSequence;
  scenarioPackId: string;
  taxonomyVersion: string;
  provenance: 'SIMULATED';
  review: MiScenarioReviewMetadata;
  phenotypeId?: string;
  limitations: MiScenarioLimitations;
  evidence: readonly EvidenceRecord<MiEvidenceDomain>[];
  timeline: readonly AssessmentTimelineEvent<MiEvidenceDomain>[];
  troponinSeries: readonly MiTroponinPoint[];
  expectedAssessment: MiAssessment;
}
