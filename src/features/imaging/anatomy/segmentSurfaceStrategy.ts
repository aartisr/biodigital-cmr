import type {
  LeftVentricularSegmentId,
  MyocardialRegionReference,
  RightVentricularRegionId,
} from '../../../types/mi/infarctPhenotype';
import { getMyocardialRegionKey } from '../../../types/mi/infarctPhenotype';
import type { MiScenarioReviewMetadata } from '../../../types/mi/scenarioPack';
import { getAnatomicalHeartPoint } from './heartSurfaceGeometry';

export type AnatomyCameraPreset = 'ANTERIOR' | 'POSTERIOR' | 'APICAL' | 'SHORT_AXIS';
export const SEGMENT_SURFACE_STRATEGY_SCHEMA_VERSION = 'segment-surface-strategy/1.0.0' as const;

export interface SegmentSurfacePlacement {
  region: MyocardialRegionReference;
  uNorm: number;
  vNorm: number;
  radialOffset: number;
  preferredView: AnatomyCameraPreset;
}

export interface SegmentSurfaceStrategy {
  schemaVersion: typeof SEGMENT_SURFACE_STRATEGY_SCHEMA_VERSION;
  id: string;
  version: string;
  enabled: boolean;
  review: MiScenarioReviewMetadata;
  placements: readonly SegmentSurfacePlacement[];
}

export const SUPPORTED_MYOCARDIAL_REGIONS: readonly MyocardialRegionReference[] = Object.freeze([
  ...Array.from({ length: 17 }, (_, index) => ({
    scheme: 'AHA_17_LV' as const,
    segmentId: (index + 1) as LeftVentricularSegmentId,
  })),
  { scheme: 'SCHEMATIC_RV', segmentId: 'RV_BASAL' },
  { scheme: 'SCHEMATIC_RV', segmentId: 'RV_MID' },
  { scheme: 'SCHEMATIC_RV', segmentId: 'RV_APICAL' },
]);

const ringPlacements = (
  segmentIds: readonly LeftVentricularSegmentId[],
  vNorm: number,
  preferredView: AnatomyCameraPreset,
  offset = 0,
): readonly SegmentSurfacePlacement[] => segmentIds.map((segmentId, index) => ({
  region: { scheme: 'AHA_17_LV', segmentId },
  uNorm: (offset + index / segmentIds.length) % 1,
  vNorm,
  radialOffset: 0.08,
  preferredView,
}));

const rvPlacement = (
  segmentId: RightVentricularRegionId,
  uNorm: number,
  vNorm: number,
): SegmentSurfacePlacement => ({
  region: { scheme: 'SCHEMATIC_RV', segmentId },
  uNorm,
  vNorm,
  radialOffset: 0.12,
  preferredView: 'ANTERIOR',
});

export const candidateSegmentSurfaceStrategy: SegmentSurfaceStrategy = {
  schemaVersion: SEGMENT_SURFACE_STRATEGY_SCHEMA_VERSION,
  id: 'bdcmr-segment-surface-candidate',
  version: '0.1.0',
  enabled: false,
  review: {
    contentOwner: 'BD-CMR research simulation team',
    reviewState: 'REQUIRES_CLINICAL_REVIEW',
    limitations: [
      'Candidate normalized coordinates require clinical and imaging review before renderer activation.',
      'The strategy is schematic and is not derived from patient source imaging or segmentation.',
    ],
  },
  placements: [
    ...ringPlacements([1, 2, 3, 4, 5, 6], 0.24, 'SHORT_AXIS', 0.02),
    ...ringPlacements([7, 8, 9, 10, 11, 12], 0.48, 'SHORT_AXIS', 0.02),
    ...ringPlacements([13, 14, 15, 16], 0.70, 'APICAL', 0.02),
    {
      region: { scheme: 'AHA_17_LV', segmentId: 17 },
      uNorm: 0.02,
      vNorm: 0.88,
      radialOffset: 0.06,
      preferredView: 'APICAL',
    },
    rvPlacement('RV_BASAL', 0.12, 0.24),
    rvPlacement('RV_MID', 0.15, 0.48),
    rvPlacement('RV_APICAL', 0.18, 0.70),
  ],
};

export const getSegmentSurfacePlacement = (
  strategy: SegmentSurfaceStrategy,
  region: MyocardialRegionReference,
): SegmentSurfacePlacement | undefined => strategy.placements.find(
  (placement) => getMyocardialRegionKey(placement.region) === getMyocardialRegionKey(region),
);

export const getActiveSegmentSurfaceStrategy = (
  strategy: SegmentSurfaceStrategy = candidateSegmentSurfaceStrategy,
): SegmentSurfaceStrategy | undefined =>
  strategy.enabled && strategy.review.reviewState === 'REVIEWED' && strategy.review.reviewedAt
    ? strategy
    : undefined;

export const projectSegmentSurfacePlacement = (
  placement: SegmentSurfacePlacement,
  scaleFactor = 1,
  septalThickness = 11.2,
  sphericity = 0.62,
) => getAnatomicalHeartPoint(
  placement.uNorm,
  placement.vNorm,
  placement.radialOffset,
  scaleFactor,
  septalThickness,
  sphericity,
);