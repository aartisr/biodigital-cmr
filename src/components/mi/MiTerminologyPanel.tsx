import { BookMarked } from 'lucide-react';
import { legacyTypeLabels, miGroupMetadata } from '../../config/mi/taxonomy';

const mappings = [
  ['Primary MI', 'Legacy Type 1 and Type 3 descriptors may appear where applicable.'],
  ['Secondary MI', `Legacy ${legacyTypeLabels.TYPE_2} descriptor.`],
  ['Procedure-related MI', `Legacy ${legacyTypeLabels.TYPE_4A}, ${legacyTypeLabels.TYPE_4B}, ${legacyTypeLabels.TYPE_4C}, and ${legacyTypeLabels.TYPE_5} descriptors.`],
  ['Myocardial injury, not MI', 'A simulated injury pattern without evidence of acute ischaemia.'],
  ['Unresolved pattern', 'A working scenario label when simulated mechanism evidence is incomplete.'],
] as const;

export const MiTerminologyPanel = () => <details className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3">
  <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-semibold text-slate-200"><BookMarked className="h-4 w-4 text-violet-300" />How this learning module organizes MI patterns</summary>
  <div className="mt-3 grid gap-2 border-t border-slate-800 pt-3 lg:grid-cols-2">{mappings.map(([label, detail]) => <div key={label} className="rounded-lg bg-slate-950/50 p-3"><p className="text-xs font-bold text-violet-200">{label}</p><p className="mt-1 text-xs leading-relaxed text-slate-400">{detail}</p></div>)}</div><p className="mt-3 text-xs leading-relaxed text-slate-500">ST-elevation, non-ST-elevation, silent/recurrent presentation, anatomy, and severity are shown as descriptors. They are not interchangeable with the learning module’s primary/secondary/procedure-related grouping.</p>
</details>;
