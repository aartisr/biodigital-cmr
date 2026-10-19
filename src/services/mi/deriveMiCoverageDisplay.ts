import { getMiCoverageValueLabel, miCoverageDimensionLabels } from '../../config/mi/coverageLabels';
import type { MiCoverageDimension, MiCoverageManifest, MiCoverageStatus } from '../../types/mi/coverage';

export interface MiCoverageDisplayItem {
  value: string;
  label: string;
  status: MiCoverageStatus;
  scenarioCount: number;
  notes: readonly string[];
}

export interface MiCoverageDisplayGroup {
  dimension: MiCoverageDimension;
  label: string;
  items: readonly MiCoverageDisplayItem[];
}

const dimensionOrder: readonly MiCoverageDimension[] = [
  'assessmentGroup',
  'definitionType',
  'presentation',
  'eventSequence',
  'territory',
  'ventricularInvolvement',
  'depth',
  'phase',
  'microvascularObstruction',
  'intramyocardialHemorrhage',
];

export const deriveMiCoverageDisplay = (manifest: MiCoverageManifest): readonly MiCoverageDisplayGroup[] =>
  dimensionOrder.map((dimension) => ({
    dimension,
    label: miCoverageDimensionLabels[dimension],
    items: manifest.claims
      .filter((claim) => claim.dimension === dimension)
      .map((claim) => ({
        value: claim.value,
        label: getMiCoverageValueLabel(claim.value),
        status: claim.status,
        scenarioCount: claim.scenarioIds.length,
        notes: claim.notes,
      })),
  }));