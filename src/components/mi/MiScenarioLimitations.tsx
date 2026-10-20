import { AlertTriangle } from 'lucide-react';
import type { MiScenarioLimitations as MiScenarioLimitationsContract } from '../../types/mi/classification';
import type { MiScenarioReviewMetadata } from '../../types/mi/scenarioPack';

const reviewLabels = {
  DRAFT: 'Draft content',
  REQUIRES_CLINICAL_REVIEW: 'Clinical review required',
  REVIEWED: 'Reviewed content',
} as const;

export const MiScenarioLimitations = ({
  limitations,
  review,
}: {
  limitations: MiScenarioLimitationsContract;
  review: MiScenarioReviewMetadata;
}) => <section aria-labelledby="mi-scenario-limitations-title" className="rounded-2xl border border-amber-400/25 bg-amber-500/6 p-4 sm:p-5">
  <div className="flex flex-wrap items-start justify-between gap-3">
    <div className="flex items-center gap-2 text-amber-100">
      <AlertTriangle className="h-4 w-4" aria-hidden="true" />
      <h2 id="mi-scenario-limitations-title" className="text-sm font-bold">Why this simulation is not enough</h2>
    </div>
    <span className="rounded-md border border-amber-300/30 bg-slate-950/50 px-2 py-1 text-xs font-semibold text-amber-100">{reviewLabels[review.reviewState]}</span>
  </div>
  <p className="mt-3 text-sm text-slate-300">Use this case to learn from an authored evidence pattern—not to make a decision about a person.</p>
  <details className="mt-3 border-t border-amber-300/15 pt-3"><summary className="cursor-pointer text-xs font-semibold text-amber-100">Read the evidence limits and unsupported uses</summary><ul className="mt-3 grid gap-2 text-sm leading-relaxed text-slate-300 lg:grid-cols-2">{limitations.whyInsufficient.map((limitation) => <li key={limitation} className="border-l-2 border-amber-300/30 pl-3">{limitation}</li>)}</ul><p className="mt-4 text-xs font-bold uppercase text-slate-400">Unsupported uses</p><ul className="mt-2 space-y-1 text-xs leading-relaxed text-slate-400">{limitations.unsupportedUses.map((limitation) => <li key={limitation}>• {limitation}</li>)}</ul></details>
</section>;
