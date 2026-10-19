import { getMyocardialRegionLabel } from '../../config/mi/anatomy';
import type { InfarctPhenotype, PhenotypeSourceReference } from '../../types/mi/infarctPhenotype';
import {
  INFARCT_SUMMARY_SCHEMA_VERSION,
  InfarctSummary,
  InfarctSummaryFact,
  SummarySourceState,
} from '../../types/mi/infarctSummary';

const sourceStateFor = (sources: readonly PhenotypeSourceReference[]): SummarySourceState => {
  if (sources.length === 0) return 'UNKNOWN';
  if (sources.some((source) => source.sourceType === 'INFERRED_LEGACY')) return 'INFERRED';
  if (sources.every((source) => source.sourceType === 'AUTHORED_SIMULATION')) return 'AUTHORED_SIMULATION';
  return 'SOURCED';
};

const unknownFact = (label: string, detail: string): InfarctSummaryFact => ({
  sourceState: 'UNKNOWN',
  label,
  detail,
  sourceIds: [],
});

export const deriveInfarctSummary = (phenotype: InfarctPhenotype): InfarctSummary => {
  const sourceState = sourceStateFor(phenotype.provenance);
  const sourceIds = phenotype.provenance.map((source) => source.id);
  const regionLabels = phenotype.segments.map((segment) => getMyocardialRegionLabel(segment.region));
  const depthLabels = [...new Set(phenotype.segments.map((segment) => segment.depth).filter((depth) => depth !== 'NOT_ESTABLISHED'))];

  const location: InfarctSummaryFact = regionLabels.length > 0
    ? {
      sourceState,
      label: `${phenotype.ventricularInvolvement} · ${regionLabels.length} mapped ${regionLabels.length === 1 ? 'region' : 'regions'}`,
      detail: regionLabels.join(', '),
      sourceIds,
    }
    : unknownFact('Location not established', 'No reviewed myocardial region is available.');

  const timing: InfarctSummaryFact = phenotype.daysSinceIndexEvent !== undefined
    ? {
      sourceState,
      label: `Day ${phenotype.daysSinceIndexEvent} since index event`,
      detail: phenotype.phase === 'UNKNOWN' ? 'Healing phase is not established.' : `${phenotype.phase.toLowerCase()} phase`,
      sourceIds,
    }
    : unknownFact('Timing not established', 'No index-event timing is available.');

  const morphology: InfarctSummaryFact = depthLabels.length > 0
    ? {
      sourceState,
      label: depthLabels.map((depth) => depth.toLowerCase().replace('_', ' ')).join(' / '),
      detail: `MVO: ${phenotype.microvascularObstruction.toLowerCase().replace('_', ' ')}; viability: ${phenotype.viabilityStatus.toLowerCase().replace('_', ' ')}.`,
      sourceIds,
    }
    : unknownFact('Depth not established', 'Scar depth and tissue characteristics are not established.');

  const extent: InfarctSummaryFact = phenotype.totalScarAreaCm2 !== undefined || phenotype.lvExtentPercent !== undefined
    ? {
      sourceState,
      label: phenotype.totalScarAreaCm2 !== undefined ? `${phenotype.totalScarAreaCm2} cm² represented scar area` : `${phenotype.lvExtentPercent}% represented LV extent`,
      detail: phenotype.lvExtentPercent !== undefined ? `${phenotype.lvExtentPercent}% of LV represented.` : 'LV percentage is not established.',
      sourceIds,
    }
    : unknownFact('Extent not established', 'No scar area, mass, or LV extent is available.');

  return {
    schemaVersion: INFARCT_SUMMARY_SCHEMA_VERSION,
    location,
    timing,
    morphology,
    extent,
    limitations: phenotype.limitations,
  };
};