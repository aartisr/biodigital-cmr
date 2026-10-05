import { FileOutput, ShieldCheck } from 'lucide-react';
import { ReactNode } from 'react';

/** Reusable visibly-watermarked frame for exports from any simulation assessment module. */
export const AssessmentExportFrame = ({ title, children }: { title: string; children: ReactNode }) => <section className="relative overflow-hidden rounded-2xl border border-sky-400/30 bg-sky-500/[0.055] p-4 sm:p-5">
  <div aria-hidden="true" className="pointer-events-none absolute -right-6 top-4 -rotate-12 select-none text-2xl font-black tracking-[0.22em] text-sky-300/[0.08] sm:text-4xl">SIMULATED</div>
  <div className="relative"><div className="flex flex-wrap items-start justify-between gap-3"><div className="flex gap-2.5"><div className="rounded-lg bg-sky-400/15 p-2 text-sky-200"><FileOutput className="h-4 w-4" /></div><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-sky-200">Export-ready research artifact</p><h2 className="mt-0.5 text-base font-bold text-white">{title}</h2></div></div><span className="inline-flex items-center gap-1.5 rounded-full border border-sky-300/30 bg-slate-950/30 px-2.5 py-1 text-[11px] font-bold text-sky-100"><ShieldCheck className="h-3.5 w-3.5" />No PHI</span></div>{children}</div>
</section>;
