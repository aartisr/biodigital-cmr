import type {
  InfarctDepth,
  MyocardialRegionReference,
  VentricularInvolvement,
} from '../../types/mi/infarctPhenotype';

export interface LegacyInfarctMapping {
  ventricularInvolvement: VentricularInvolvement;
  regions: readonly MyocardialRegionReference[];
  depth: InfarctDepth;
  limitations: readonly string[];
}

const lvRegions = (segmentIds: readonly (1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17)[]): readonly MyocardialRegionReference[] =>
  segmentIds.map((segmentId) => ({ scheme: 'AHA_17_LV', segmentId }));

export const legacyInfarctMappings: Readonly<Record<string, LegacyInfarctMapping>> = {
  'Antero-Apical': {
    ventricularInvolvement: 'LV',
    regions: lvRegions([7, 8, 13, 14, 17]),
    depth: 'NOT_ESTABLISHED',
    limitations: ['Segment regions were inferred from the legacy antero-apical display label and require content review.'],
  },
  'Infero-Lateral': {
    ventricularInvolvement: 'LV',
    regions: lvRegions([4, 5, 10, 11, 15, 16]),
    depth: 'NOT_ESTABLISHED',
    limitations: ['Segment regions were inferred from the legacy infero-lateral display label and require content review.'],
  },
  'Posterior Transmural': {
    ventricularInvolvement: 'LV',
    regions: lvRegions([4, 5, 10, 11]),
    depth: 'TRANSMURAL',
    limitations: ['Segment regions and depth were inferred from the legacy posterior-transmural display label and require content review.'],
  },
};

export const getLegacyInfarctMapping = (location: string): LegacyInfarctMapping | undefined =>
  legacyInfarctMappings[location];