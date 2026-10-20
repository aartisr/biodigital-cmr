import { BookOpenCheck, ChevronRight } from 'lucide-react';
import { miGroupMetadata } from '../../config/mi/taxonomy';
import { MiScenarioCase } from '../../types/mi/classification';

export const MiScenarioPicker = ({ scenarios, selectedId, onSelect }: { scenarios: readonly MiScenarioCase[]; selectedId: string; onSelect: (id: string) => void }) => {
  const selected = scenarios.find((scenario) => scenario.id === selectedId);

  return <aside className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3 sm:p-4">
    <div className="flex items-center gap-2"><BookOpenCheck className="h-4 w-4 text-teal-300" /><div><h2 className="text-sm font-bold text-white">Choose a learning case</h2><p className="text-xs text-slate-400">One synthetic scenario at a time</p></div></div>
    <label className="mt-3 block"><span className="sr-only">Choose a synthetic MI scenario</span><select value={selectedId} onChange={(event) => onSelect(event.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-teal-300 focus:ring-2 focus:ring-teal-300/20">{scenarios.map((scenario) => <option value={scenario.id} key={scenario.id}>{scenario.title}</option>)}</select></label>
    {selected && <div className="mt-3 rounded-xl border border-teal-400/20 bg-teal-500/[0.06] p-3"><p className="text-xs font-bold uppercase tracking-wide text-teal-200">Current pattern</p><p className="mt-1 text-sm font-semibold text-slate-100">{miGroupMetadata[selected.expectedAssessment.category].label}</p></div>}
    <details className="mt-3 border-t border-slate-800 pt-3"><summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-xs font-semibold text-slate-300">Browse all {scenarios.length} available cases <ChevronRight className="h-3.5 w-3.5" /></summary><div className="mt-3 grid gap-1.5">{scenarios.map((scenario) => { const active = scenario.id === selectedId; const group = miGroupMetadata[scenario.expectedAssessment.category]; return <button key={scenario.id} type="button" onClick={() => onSelect(scenario.id)} aria-pressed={active} className={`rounded-lg border px-2.5 py-2 text-left text-xs transition focus:outline-none focus:ring-2 focus:ring-teal-300 ${active ? 'border-teal-400/60 bg-teal-500/10 text-teal-100' : 'border-slate-800 bg-slate-950/35 text-slate-300 hover:border-slate-600'}`}><span className="font-semibold">{scenario.title}</span><span className="ml-2 text-slate-500">{group.label}</span></button>; })}</div></details>
  </aside>;
};
