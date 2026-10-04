import { Clock3 } from 'lucide-react';
import { AssessmentTimelineEvent } from '../../types/assessment/evidence';

export const EvidenceTimeline = <TDomain extends string>({ events }: { events: readonly AssessmentTimelineEvent<TDomain>[] }) => <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 sm:p-5">
  <div className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-teal-300" /><h2 className="text-base font-bold text-white">Evidence timeline</h2></div>
  <ol className="mt-4 space-y-0">{events.map((item, index) => <li key={item.id} className="relative grid grid-cols-[68px_1fr] gap-3 pb-4 last:pb-0"><span className="pt-0.5 font-mono text-xs text-teal-300">{new Date(item.occurredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span><div className="relative rounded-xl border border-slate-800 bg-slate-950/45 p-3 before:absolute before:-left-[18px] before:top-4 before:h-2.5 before:w-2.5 before:rounded-full before:bg-teal-400"><p className="text-sm font-semibold text-slate-100">{item.title}</p><p className="mt-1 text-xs leading-relaxed text-slate-400">{item.detail}</p></div>{index < events.length - 1 && <span className="absolute bottom-0 left-[72px] top-5 w-px bg-slate-700" />}</li>)}</ol>
</section>;
