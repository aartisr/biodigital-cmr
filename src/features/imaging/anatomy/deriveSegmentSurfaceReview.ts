import { getMyocardialRegionLabel } from '../../../config/mi/anatomy';
import { getMyocardialRegionKey } from '../../../types/mi/infarctPhenotype';
import type { SegmentSurfaceStrategy } from './segmentSurfaceStrategy';

export interface SegmentSurfaceReviewRow {
  readonly regionKey: string;
  readonly regionLabel: string;
  readonly uNorm: string;
  readonly vNorm: string;
  readonly radialOffset: string;
  readonly preferredView: string;
}

export const deriveSegmentSurfaceReviewRows = (
  strategy: SegmentSurfaceStrategy,
): readonly SegmentSurfaceReviewRow[] => strategy.placements.map((placement) => ({
  regionKey: getMyocardialRegionKey(placement.region),
  regionLabel: getMyocardialRegionLabel(placement.region),
  uNorm: placement.uNorm.toFixed(3),
  vNorm: placement.vNorm.toFixed(3),
  radialOffset: placement.radialOffset.toFixed(3),
  preferredView: placement.preferredView,
}));

export const buildSegmentSurfaceReviewMarkdown = (
  strategy: SegmentSurfaceStrategy,
): string => {
  const rows = deriveSegmentSurfaceReviewRows(strategy);
  return [
    '# MI Segment Surface Strategy Review',
    '',
    '> Candidate schematic coordinates only. This document does not record approval and does not enable rendering.',
    '',
    '## Strategy Metadata',
    '',
    `- Schema: \`${strategy.schemaVersion}\``,
    `- Strategy: \`${strategy.id}\``,
    `- Version: \`${strategy.version}\``,
    `- Enabled: \`${strategy.enabled}\``,
    `- Review state: \`${strategy.review.reviewState}\``,
    `- Content owner: ${strategy.review.contentOwner}`,
    '',
    '## Limitations',
    '',
    ...strategy.review.limitations.map((limitation) => `- ${limitation}`),
    '',
    '## Candidate Placements',
    '',
    '| Region key | Region | u | v | Radial offset | Preferred camera |',
    '| --- | --- | ---: | ---: | ---: | --- |',
    ...rows.map((row) => `| \`${row.regionKey}\` | ${row.regionLabel} | ${row.uNorm} | ${row.vNorm} | ${row.radialOffset} | ${row.preferredView} |`),
    '',
    '## Acceptance Criteria',
    '',
    '- [ ] Coordinate review confirms every LV and RV center follows the intended segmentation convention and contains no duplicate placement.',
    '- [ ] Camera review confirms each preferred view makes the referenced region inspectable without misleading occlusion.',
    '- [ ] Scar-shape review defines explicit rules for visual extent and depth before any mesh dimensions are implemented.',
    '- [ ] Border-zone review defines explicit topology and width rules before border geometry is implemented.',
    '- [ ] Representative-fixture review confirms anterior, inferior, septal, lateral, posterior, apical, multiregion, and RV examples.',
    '- [ ] Governance review records reviewer identity and date before changing the strategy to `REVIEWED`.',
    '- [ ] Runtime rollout is approved separately before changing `enabled` to `true`.',
    '',
    '## Prohibited Until Review',
    '',
    '- Do not derive scar size from segment count.',
    '- Do not derive transmural thickness from the depth label.',
    '- Do not invent border-zone width or morphology.',
    '- Do not connect this strategy to `Real3DHeartCanvas`.',
  ].join('\n');
};