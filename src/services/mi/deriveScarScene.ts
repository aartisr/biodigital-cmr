import type { InfarctPhenotype } from '../../types/mi/infarctPhenotype';
import type { ScarScene } from '../../types/mi/scarScene';
import type { MiScenarioReviewMetadata } from '../../types/mi/scenarioPack';
import { validateInfarctPhenotype } from './validateInfarctPhenotype';

export const deriveScarScene = (
  phenotype: InfarctPhenotype | undefined,
  review?: MiScenarioReviewMetadata,
): ScarScene => {
  if (!phenotype || phenotype.ventricularInvolvement === 'UNKNOWN' || phenotype.segments.length === 0) {
    return {
      status: 'UNKNOWN',
      renderMode: 'SCHEMATIC_FALLBACK',
      regions: [],
      reasons: ['Structured myocardial scar anatomy is not established for this case.'],
    };
  }

  if (!validateInfarctPhenotype(phenotype).valid) {
    return {
      status: 'UNAVAILABLE',
      renderMode: 'SCHEMATIC_FALLBACK',
      regions: [],
      reasons: ['The structured infarct phenotype is invalid and cannot drive scar placement.'],
    };
  }

  if (review?.reviewState !== 'REVIEWED' || !review.reviewedAt) {
    return {
      status: 'UNAVAILABLE',
      renderMode: 'SCHEMATIC_FALLBACK',
      regions: [],
      reasons: ['Structured scar anatomy requires recorded clinical and imaging content review before visualization.'],
    };
  }

  const regions = phenotype.segments
    .filter((segment) => segment.scarState === 'PRESENT')
    .map((segment) => ({
      region: segment.region,
      depth: segment.depth,
      extentPercent: segment.extentPercent,
      sourceEvidenceIds: segment.sourceEvidenceIds,
    }));

  if (regions.length === 0) {
    return {
      status: 'UNAVAILABLE',
      renderMode: 'SCHEMATIC_FALLBACK',
      regions: [],
      reasons: ['No reviewed segment with represented scar is available for visualization.'],
    };
  }

  return {
    status: 'SUPPORTED',
    renderMode: 'PHENOTYPE_REGIONS',
    regions,
    totalScarAreaCm2: phenotype.totalScarAreaCm2,
    reasons: ['Reviewed structured myocardial regions are available for phenotype-driven visualization.'],
  };
};