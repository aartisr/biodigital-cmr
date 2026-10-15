import type { PersonaCapability } from '../../types/persona';
import type { InfarctSummary, SummarySourceState } from '../../types/mi/infarctSummary';
import type { MiScenarioReviewMetadata } from '../../types/mi/scenarioPack';
import { deriveInfarctSummaryPresentation, type InfarctSummaryFactId } from '../../services/mi/deriveInfarctSummaryPresentation';

const factLabels: Record<InfarctSummaryFactId, string> = {
  location: 'Location',
  timing: 'Timing',
  morphology: 'Tissue pattern',
  extent: 'Extent',
};

const sourceLabels: Record<SummarySourceState, string> = {
  SOURCED: 'Source-backed',
  AUTHORED_SIMULATION: 'Authored simulation',
  INFERRED: 'Legacy inference',
  UNKNOWN: 'Unknown',
};

const reviewLabels: Record<MiScenarioReviewMetadata['reviewState'], string> = {
  DRAFT: 'Draft content',
  REQUIRES_CLINICAL_REVIEW: 'Clinical review required',
  REVIEWED: 'Reviewed content',
};

export interface InfarctSummaryPanelProps {
  summary?: InfarctSummary;
  capabilities: readonly PersonaCapability[];
  review?: MiScenarioReviewMetadata;
  compact?: boolean;
}

export const InfarctSummaryPanel = ({ summary, capabilities, review, compact = false }: InfarctSummaryPanelProps) => {
  if (!summary) return <section aria-labelledby="infarct-summary-title" className="border-y border-slate-800 py-4">
    <h2 id="infarct-summary-title" className="text-sm font-bold text-white">Infarct phenotype summary</h2>
    <p className="mt-2 text-sm text-slate-300">No structured infarct phenotype is available for this classification scenario. Anatomy, tissue pattern, timing, and extent are not inferred from its title or free text.</p>
  </section>;

  const presentation = deriveInfarctSummaryPresentation(summary, capabilities);
  const sourceIds = [...new Set(presentation.facts.flatMap(({ fact }) => fact.sourceIds))];

  return <section aria-labelledby="infarct-summary-title" className="border-y border-slate-800 py-4">
    <div className="flex flex-wrap items-start justify-between gap-2">
      <div><h2 id="infarct-summary-title" className="text-sm font-bold text-white">Infarct phenotype summary</h2>{!compact && <p className="mt-1 text-xs text-slate-400">The same structured facts are shown for every persona; capabilities only change emphasis and supporting detail.</p>}</div>
      {review && <span className="rounded-md border border-amber-400/30 bg-amber-500/10 px-2 py-1 text-xs font-semibold text-amber-200">{reviewLabels[review.reviewState]}</span>}
    </div>
    <div className={`mt-4 grid gap-x-5 gap-y-4 sm:grid-cols-2 ${compact ? '2xl:grid-cols-4' : ''}`}>
      {presentation.facts.map(({ id, fact, showDetail }) => <article key={id} className="border-l-2 border-slate-700 pl-3">
        <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-xs font-bold uppercase text-slate-400">{factLabels[id]}</h3><span className="text-xs font-semibold text-teal-200">{sourceLabels[fact.sourceState]}</span></div>
        <p className="mt-1 text-sm font-semibold text-slate-100">{fact.label}</p>
        {showDetail && <p className="mt-1 text-xs leading-relaxed text-slate-400">{fact.detail}</p>}
      </article>)}
    </div>
    <div className="mt-4 border-t border-slate-800 pt-3"><h3 className="text-xs font-bold uppercase text-slate-400">Known limitations</h3>{summary.limitations.length > 0 ? <ul className="mt-2 space-y-1 text-xs text-slate-300">{summary.limitations.map((limitation) => <li key={limitation}>• {limitation}</li>)}</ul> : <p className="mt-2 text-xs text-slate-400">No additional limitations were recorded.</p>}</div>
    {presentation.showProvenance && <div className="mt-4 border-t border-slate-800 pt-3"><h3 className="text-xs font-bold uppercase text-slate-400">Source references</h3><p className="mt-2 wrap-break-word text-xs text-slate-300">{sourceIds.length > 0 ? sourceIds.join(', ') : 'No source reference identifiers were recorded.'}</p></div>}
  </section>;
};