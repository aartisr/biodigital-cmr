import type { FindingState, InfarctDepth, InfarctPhase, VentricularInvolvement } from './infarctPhenotype';
import type { MiClinicalGroup, MiEventSequence, MiLegacyType, MiPresentation } from './classification';

export type MiAnatomicalTerritory = 'ANTERIOR' | 'SEPTAL' | 'LATERAL' | 'INFERIOR' | 'POSTERIOR' | 'APICAL' | 'MULTITERRITORY' | 'UNKNOWN';
export type MiCoverageStatus = 'REPRESENTED' | 'PARTIAL' | 'UNSUPPORTED';

export interface MiCoverageDimensionMap {
  assessmentGroup: MiClinicalGroup;
  definitionType: MiLegacyType;
  presentation: MiPresentation;
  eventSequence: MiEventSequence;
  territory: MiAnatomicalTerritory;
  ventricularInvolvement: VentricularInvolvement;
  depth: InfarctDepth;
  phase: InfarctPhase;
  microvascularObstruction: FindingState;
  intramyocardialHemorrhage: FindingState;
}

export type MiCoverageDimension = keyof MiCoverageDimensionMap;

export type MiCoverageClaim = {
  [Dimension in MiCoverageDimension]: {
    dimension: Dimension;
    value: MiCoverageDimensionMap[Dimension];
    status: MiCoverageStatus;
    scenarioIds: readonly string[];
    notes: readonly string[];
  }
}[MiCoverageDimension];

export interface MiCoverageManifest {
  id: string;
  version: string;
  taxonomyVersion: string;
  scenarioPackIds: readonly string[];
  claims: readonly MiCoverageClaim[];
}