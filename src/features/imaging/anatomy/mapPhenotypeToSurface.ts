import { getMyocardialRegionKey, type InfarctDepth, type MyocardialRegionReference } from '../../../types/mi/infarctPhenotype';
import type { ScarScene } from '../../../types/mi/scarScene';
import type { AnatomyCameraPreset, SegmentSurfaceStrategy } from './segmentSurfaceStrategy';
import {
  getActiveSegmentSurfaceStrategy,
  getSegmentSurfacePlacement,
  projectSegmentSurfacePlacement,
} from './segmentSurfaceStrategy';

export interface SurfacePointDescriptor {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

export interface MappedScarRegionDescriptor {
  readonly regionKey: string;
  readonly region: MyocardialRegionReference;
  readonly center: SurfacePointDescriptor;
  readonly depth: InfarctDepth;
  readonly extentPercent?: number;
  readonly preferredView: AnatomyCameraPreset;
  readonly sourceEvidenceIds: readonly string[];
}

export interface BorderZoneDescriptor {
  readonly regionKey: string;
  readonly center: SurfacePointDescriptor;
  readonly preferredView: AnatomyCameraPreset;
  readonly sourceEvidenceIds: readonly string[];
}

export type PhenotypeSurfaceMapping =
  | {
      readonly status: 'MAPPED';
      readonly strategyId: string;
      readonly strategyVersion: string;
      readonly regions: readonly MappedScarRegionDescriptor[];
      readonly borderZones: readonly BorderZoneDescriptor[];
      readonly missingRegionKeys: readonly [];
      readonly reasons: readonly string[];
    }
  | {
      readonly status: 'UNAVAILABLE';
      readonly regions: readonly [];
      readonly borderZones: readonly [];
      readonly missingRegionKeys: readonly string[];
      readonly reasons: readonly string[];
    };

export interface SurfaceProjectionParameters {
  readonly scaleFactor?: number;
  readonly septalThickness?: number;
  readonly sphericity?: number;
}

export const mapPhenotypeToSurface = (
  scene: ScarScene,
  strategy: SegmentSurfaceStrategy,
  parameters: SurfaceProjectionParameters = {},
): PhenotypeSurfaceMapping => {
  if (scene.status !== 'SUPPORTED') {
    return {
      status: 'UNAVAILABLE',
      regions: [],
      borderZones: [],
      missingRegionKeys: [],
      reasons: scene.reasons,
    };
  }

  const activeStrategy = getActiveSegmentSurfaceStrategy(strategy);
  if (!activeStrategy) {
    return {
      status: 'UNAVAILABLE',
      regions: [],
      borderZones: [],
      missingRegionKeys: [],
      reasons: ['No enabled and reviewed segment-surface strategy is available.'],
    };
  }

  const orderedRegions = [...scene.regions].sort((left, right) =>
    getMyocardialRegionKey(left.region).localeCompare(getMyocardialRegionKey(right.region)));
  const missingRegionKeys = orderedRegions
    .filter(({ region }) => !getSegmentSurfacePlacement(activeStrategy, region))
    .map(({ region }) => getMyocardialRegionKey(region));

  if (missingRegionKeys.length > 0) {
    return {
      status: 'UNAVAILABLE',
      regions: [],
      borderZones: [],
      missingRegionKeys,
      reasons: ['The active segment-surface strategy does not cover every represented scar region.'],
    };
  }

  const regions = Object.freeze(orderedRegions.map((sceneRegion): MappedScarRegionDescriptor => {
    const placement = getSegmentSurfacePlacement(activeStrategy, sceneRegion.region)!;
    const point = projectSegmentSurfacePlacement(
      placement,
      parameters.scaleFactor,
      parameters.septalThickness,
      parameters.sphericity,
    );
    return Object.freeze({
      regionKey: getMyocardialRegionKey(sceneRegion.region),
      region: sceneRegion.region,
      center: Object.freeze({ x: point.x, y: point.y, z: point.z }),
      depth: sceneRegion.depth,
      extentPercent: sceneRegion.extentPercent,
      preferredView: placement.preferredView,
      sourceEvidenceIds: Object.freeze([...sceneRegion.sourceEvidenceIds]),
    });
  }));
  const borderZones = Object.freeze(regions.map(({ regionKey, center, preferredView, sourceEvidenceIds }) => Object.freeze({
    regionKey,
    center,
    preferredView,
    sourceEvidenceIds,
  })));

  return {
    status: 'MAPPED',
    strategyId: activeStrategy.id,
    strategyVersion: activeStrategy.version,
    regions,
    borderZones,
    missingRegionKeys: [],
    reasons: ['Every represented scar region resolved through the active reviewed strategy.'],
  };
};