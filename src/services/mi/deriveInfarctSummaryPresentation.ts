import type { PersonaCapability } from '../../types/persona';
import type { InfarctSummary, InfarctSummaryFact } from '../../types/mi/infarctSummary';

export type InfarctSummaryFactId = 'location' | 'timing' | 'morphology' | 'extent';

export interface PresentedInfarctSummaryFact {
  id: InfarctSummaryFactId;
  fact: InfarctSummaryFact;
  showDetail: boolean;
}

export interface InfarctSummaryPresentation {
  facts: readonly PresentedInfarctSummaryFact[];
  showProvenance: boolean;
  emphasis: 'ANATOMY' | 'GENERAL';
}

const generalOrder: readonly InfarctSummaryFactId[] = ['timing', 'location', 'extent', 'morphology'];
const anatomyOrder: readonly InfarctSummaryFactId[] = ['location', 'morphology', 'extent', 'timing'];

export const deriveInfarctSummaryPresentation = (
  summary: InfarctSummary,
  capabilities: readonly PersonaCapability[],
): InfarctSummaryPresentation => {
  const showSegmentDetail = capabilities.includes('VIEW_MI_SEGMENT_DETAIL');
  const order = showSegmentDetail ? anatomyOrder : generalOrder;

  return {
    facts: order.map((id) => ({
      id,
      fact: summary[id],
      showDetail: id !== 'location' || showSegmentDetail,
    })),
    showProvenance: capabilities.includes('VIEW_MI_PROVENANCE'),
    emphasis: showSegmentDetail ? 'ANATOMY' : 'GENERAL',
  };
};