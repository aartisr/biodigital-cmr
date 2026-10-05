import { DatabaseZap, ShieldCheck } from 'lucide-react';

/** Shared disclosure for provenance and data-boundary information in assessment modules. */
export const ProvenanceCallout = ({ source, taxonomyVersion, scenarioPackId }: { source: 'SIMULATED' | 'IMPORTED_RESEARCH_DATA'; taxonomyVersion: string; scenarioPackId: string }) => <details className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3">
  <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-semibold text-slate-200"><DatabaseZap className="h-4 w-4 text-sky-300" />Data provenance and limitations</summary>
  <div className="mt-3 grid gap-2 border-t border-slate-800 pt-3 text-xs text-slate-400 sm:grid-cols-3"><p><span className="font-semibold text-slate-200">Source</span><br />{source === 'SIMULATED' ? 'Synthetic scenario fixture' : 'Imported research data'}</p><p><span className="font-semibold text-slate-200">Taxonomy</span><br />{taxonomyVersion}</p><p><span className="font-semibold text-slate-200">Scenario pack</span><br />{scenarioPackId}</p></div><p className="mt-3 flex items-start gap-2 rounded-lg border border-sky-400/20 bg-sky-500/[0.06] p-2.5 text-xs leading-relaxed text-sky-100"><ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />This view contains no live patient data and does not provide diagnosis, triage, or treatment guidance.</p>
</details>;
