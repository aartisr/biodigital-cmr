import { Info, ShieldCheck } from 'lucide-react';
import { AssessmentConfidence } from '../../types/assessment/evidence';

const confidenceLabel: Record<AssessmentConfidence, string> = { SUPPORTED: 'Evidence pattern supported', POSSIBLE: 'Possible pattern', INSUFFICIENT_EVIDENCE: 'Evidence incomplete', CONFLICTING_EVIDENCE: 'Evidence conflicts' };

export const AssessmentStatusBanner = ({ label, confidence, tone, evidenceGapCount }: { label: string; confidence: AssessmentConfidence; tone: string; evidenceGapCount: number }) => <section className={`rounded-2xl border p-4 sm:p-5 ${tone}`}>
  <div className="flex flex-wrap items-start justify-between gap-4"><div className="flex min-w-0 gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" /><div><p className="text-xs font-bold uppercase tracking-[0.16em] opacity-75">Simulation-only assessment</p><h2 className="mt-1 text-lg font-bold text-white">{label}</h2><p className="mt-1 text-sm opacity-90">{confidenceLabel[confidence]} · Not a diagnosis or treatment recommendation.</p></div></div><div className="flex items-center gap-2 rounded-lg border border-current/20 bg-slate-950/20 px-3 py-2 text-xs font-semibold"><Info className="h-4 w-4" />{evidenceGapCount === 0 ? 'No authored evidence gaps' : `${evidenceGapCount} evidence gap${evidenceGapCount === 1 ? '' : 's'}`}</div></div>
</section>;
