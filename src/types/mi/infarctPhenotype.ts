export const INFARCT_PHENOTYPE_SCHEMA_VERSION = 'infarct-phenotype/1.0.0' as const;

export type LeftVentricularSegmentId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17;
export type RightVentricularRegionId = 'RV_BASAL' | 'RV_MID' | 'RV_APICAL';

export type MyocardialRegionReference =
  | { scheme: 'AHA_17_LV'; segmentId: LeftVentricularSegmentId }
  | { scheme: 'SCHEMATIC_RV'; segmentId: RightVentricularRegionId };

export type VentricularInvolvement = 'LV' | 'RV' | 'BIVENTRICULAR' | 'UNKNOWN';
export type InfarctPhase = 'ACUTE' | 'SUBACUTE' | 'CHRONIC' | 'UNKNOWN';
export type InfarctDepth = 'SUBENDOCARDIAL' | 'TRANSMURAL' | 'MIXED' | 'NOT_ESTABLISHED';
export type FindingState = 'PRESENT' | 'ABSENT' | 'INDETERMINATE' | 'NOT_ASSESSED';
export type WallMotionState = 'NORMAL' | 'HYPOKINETIC' | 'AKINETIC' | 'DYSKINETIC' | 'NOT_ASSESSED';
export type ViabilityStatus = 'VIABLE' | 'MIXED' | 'NON_VIABLE' | 'INDETERMINATE' | 'NOT_ASSESSED';
export type CulpritVesselStatus = 'ESTABLISHED' | 'SUSPECTED' | 'NOT_ESTABLISHED';
export type CoronaryTerritoryId = 'LAD' | 'RCA' | 'LCX' | 'LEFT_MAIN' | 'MULTIVESSEL' | 'NON_OBSTRUCTIVE' | 'UNKNOWN';

export type PhenotypeSourceType =
  | 'AUTHORED_SIMULATION'
  | 'SOURCE_IMAGING'
  | 'IMPORTED_RESEARCH_DATA'
  | 'INFERRED_LEGACY';

export interface PhenotypeSourceReference {
  id: string;
  sourceType: PhenotypeSourceType;
  sourceId?: string;
  observedAt?: string;
  schemaVersion?: string;
  notes?: readonly string[];
}

export interface MyocardialSegmentFinding {
  region: MyocardialRegionReference;
  scarState: FindingState;
  depth: InfarctDepth;
  extentPercent?: number;
  wallThicknessMm?: number;
  wallMotion: WallMotionState;
  sourceEvidenceIds: readonly string[];
}

export interface InfarctPhenotype {
  schemaVersion: typeof INFARCT_PHENOTYPE_SCHEMA_VERSION;
  ventricularInvolvement: VentricularInvolvement;
  phase: InfarctPhase;
  daysSinceIndexEvent?: number;
  coronaryTerritories: readonly CoronaryTerritoryId[];
  culpritVesselStatus: CulpritVesselStatus;
  culpritVessels: readonly CoronaryTerritoryId[];
  segments: readonly MyocardialSegmentFinding[];
  totalScarAreaCm2?: number;
  scarMassGrams?: number;
  lvExtentPercent?: number;
  microvascularObstruction: FindingState;
  intramyocardialHemorrhage: FindingState;
  edema: FindingState;
  viabilityStatus: ViabilityStatus;
  provenance: readonly PhenotypeSourceReference[];
  limitations: readonly string[];
}

export const getMyocardialRegionKey = (region: MyocardialRegionReference): string =>
  `${region.scheme}:${region.segmentId}`;