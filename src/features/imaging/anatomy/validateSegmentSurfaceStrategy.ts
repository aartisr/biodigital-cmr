import { getMyocardialRegionKey } from '../../../types/mi/infarctPhenotype';
import {
  SEGMENT_SURFACE_STRATEGY_SCHEMA_VERSION,
  SUPPORTED_MYOCARDIAL_REGIONS,
  type AnatomyCameraPreset,
  type SegmentSurfaceStrategy,
} from './segmentSurfaceStrategy';

export type SegmentSurfaceStrategyIssueCode =
  | 'INVALID_SCHEMA_VERSION'
  | 'INVALID_METADATA'
  | 'INVALID_REVIEW_METADATA'
  | 'ACTIVE_WITHOUT_REVIEW'
  | 'DUPLICATE_REGION'
  | 'MISSING_REGION'
  | 'UNSUPPORTED_REGION'
  | 'INVALID_COORDINATE'
  | 'INVALID_CAMERA_PRESET';

export interface SegmentSurfaceStrategyIssue {
  code: SegmentSurfaceStrategyIssueCode;
  path: string;
  message: string;
}

export interface SegmentSurfaceStrategyValidationResult {
  valid: boolean;
  issues: readonly SegmentSurfaceStrategyIssue[];
}

const cameraPresets = new Set<AnatomyCameraPreset>(['ANTERIOR', 'POSTERIOR', 'APICAL', 'SHORT_AXIS']);
const expectedRegionKeys = new Set(SUPPORTED_MYOCARDIAL_REGIONS.map(getMyocardialRegionKey));
const semanticVersionPattern = /^\d+\.\d+\.\d+$/;

export const validateSegmentSurfaceStrategy = (
  strategy: SegmentSurfaceStrategy,
): SegmentSurfaceStrategyValidationResult => {
  const issues: SegmentSurfaceStrategyIssue[] = [];

  if (strategy.schemaVersion !== SEGMENT_SURFACE_STRATEGY_SCHEMA_VERSION) {
    issues.push({ code: 'INVALID_SCHEMA_VERSION', path: 'schemaVersion', message: `Expected ${SEGMENT_SURFACE_STRATEGY_SCHEMA_VERSION}.` });
  }
  if (!strategy.id.trim() || !semanticVersionPattern.test(strategy.version)) {
    issues.push({ code: 'INVALID_METADATA', path: 'id|version', message: 'Strategy ID and semantic version are required.' });
  }
  if (!strategy.review.contentOwner.trim() || strategy.review.limitations.length === 0 || (strategy.review.reviewState === 'REVIEWED' && !strategy.review.reviewedAt)) {
    issues.push({ code: 'INVALID_REVIEW_METADATA', path: 'review', message: 'Review owner, limitations, and reviewed date when applicable are required.' });
  }
  if (strategy.enabled && (strategy.review.reviewState !== 'REVIEWED' || !strategy.review.reviewedAt)) {
    issues.push({ code: 'ACTIVE_WITHOUT_REVIEW', path: 'enabled', message: 'An enabled strategy requires recorded completed review.' });
  }

  const seenRegionKeys = new Set<string>();
  strategy.placements.forEach((placement, index) => {
    const path = `placements.${index}`;
    const regionKey = getMyocardialRegionKey(placement.region);
    if (seenRegionKeys.has(regionKey)) {
      issues.push({ code: 'DUPLICATE_REGION', path: `${path}.region`, message: `${regionKey} has more than one placement.` });
    }
    seenRegionKeys.add(regionKey);
    if (!expectedRegionKeys.has(regionKey)) {
      issues.push({ code: 'UNSUPPORTED_REGION', path: `${path}.region`, message: `${regionKey} is not supported by this strategy schema.` });
    }
    if (![placement.uNorm, placement.vNorm, placement.radialOffset].every(Number.isFinite)
      || placement.uNorm < 0 || placement.uNorm > 1 || placement.vNorm < 0 || placement.vNorm > 1) {
      issues.push({ code: 'INVALID_COORDINATE', path, message: `${regionKey} must use finite normalized surface coordinates.` });
    }
    if (!cameraPresets.has(placement.preferredView)) {
      issues.push({ code: 'INVALID_CAMERA_PRESET', path: `${path}.preferredView`, message: `${regionKey} has an unsupported camera preset.` });
    }
  });

  expectedRegionKeys.forEach((regionKey) => {
    if (!seenRegionKeys.has(regionKey)) {
      issues.push({ code: 'MISSING_REGION', path: 'placements', message: `${regionKey} has no placement.` });
    }
  });

  return { valid: issues.length === 0, issues };
};