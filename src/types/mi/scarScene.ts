import type { InfarctDepth, MyocardialRegionReference } from './infarctPhenotype';

export type ScarSceneStatus = 'SUPPORTED' | 'UNKNOWN' | 'UNAVAILABLE';
export type ScarSceneRenderMode = 'PHENOTYPE_REGIONS' | 'SCHEMATIC_FALLBACK';

export interface ScarSceneRegion {
  region: MyocardialRegionReference;
  depth: InfarctDepth;
  extentPercent?: number;
  sourceEvidenceIds: readonly string[];
}

export type ScarScene =
  | {
      status: 'SUPPORTED';
      renderMode: 'PHENOTYPE_REGIONS';
      regions: readonly ScarSceneRegion[];
      totalScarAreaCm2?: number;
      reasons: readonly string[];
    }
  | {
      status: 'UNKNOWN' | 'UNAVAILABLE';
      renderMode: 'SCHEMATIC_FALLBACK';
      regions: readonly [];
      reasons: readonly string[];
    };