import React from 'react';
import { ArrowRight, BarChart3, Database, GitCompare, History, Sparkles } from 'lucide-react';

interface ResearchAnalysisPanelProps {
  snapshotCount: number;
  onOpenDatasets: () => void;
  onOpenComparison: () => void;
  onOpenProjection: () => void;
  onOpenSnapshots: () => void;
}

/** Research-only artifact launcher for the outcomes analyst persona. */
export const ResearchAnalysisPanel: React.FC<ResearchAnalysisPanelProps> = ({ snapshotCount, onOpenDatasets, onOpenComparison, onOpenProjection, onOpenSnapshots }) => {
  const actions = [
    ['Public datasets', 'Explore benchmark data sources and research context', Database, onOpenDatasets, 'text-violet-300'],
    ['Compare cases', 'Open a side-by-side simulated case comparison', GitCompare, onOpenComparison, 'text-indigo-300'],
    ['Trend projection', 'Explore a simulated, non-clinical trend projection', Sparkles, onOpenProjection, 'text-emerald-300'],
    ['Session artifacts', `${snapshotCount} saved artifact${snapshotCount === 1 ? '' : 's'} for reproducibility review`, History, onOpenSnapshots, 'text-sky-300'],
  ] as const;

  return (
    <section className="rounded-xl border border-violet-500/25 bg-violet-950/10 p-4">
      <div><p className="text-xs font-semibold uppercase tracking-wide text-violet-300">Research analysis</p><h2 className="mt-1 text-sm font-semibold text-white">Cohort context and reproducibility artifacts</h2><p className="mt-1 max-w-2xl text-xs text-slate-400">Use these tools to inspect de-identified simulated research artifacts. They are not patient-specific evidence or clinical decision support.</p></div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">{actions.map(([label, detail, Icon, onClick, tone]) => <button type="button" key={label} onClick={onClick} className="flex min-h-24 items-start gap-3 rounded-lg border border-slate-800 bg-slate-950/70 p-3 text-left hover:bg-slate-900"><Icon className={`mt-0.5 h-4 w-4 shrink-0 ${tone}`} /><span className="min-w-0 flex-1"><span className="block text-xs font-semibold text-slate-100">{label}</span><span className="mt-1 block text-[11px] leading-relaxed text-slate-500">{detail}</span></span><ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-slate-600" /></button>)}</div>
      <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-relaxed text-amber-100"><BarChart3 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-300" />Research exports need a de-identification and purpose-of-use policy at the server boundary before use outside this demo.</p>
    </section>
  );
};
