import React, { ReactNode } from 'react';
import { FileSearch, LockKeyhole, Maximize2, ScanLine } from 'lucide-react';

export const ImagingWorkspace: React.FC<{ onOpenReadiness: () => void; onOpenFullscreen: () => void; children: ReactNode }> = ({ onOpenReadiness, onOpenFullscreen, children }) => (
  <div className="space-y-4">
    <section className="grid gap-3 lg:grid-cols-[1.4fr_1fr]">
      <div className="rounded-2xl border border-amber-500/40 bg-amber-950/20 p-4 sm:p-5"><div className="flex gap-3"><div className="rounded-xl bg-amber-500/10 p-2 text-amber-300"><LockKeyhole className="h-5 w-5" /></div><div><p className="text-xs font-semibold uppercase tracking-wide text-amber-200">Research-only anatomy</p><h2 className="mt-1 text-base font-semibold text-white">No patient-specific source imaging is linked</h2><p className="mt-1 text-xs leading-relaxed text-slate-300">This visualization is procedural. It must not be used for diagnostic measurement, treatment decisions, or patient-specific interpretation until the DICOM, segmentation, review, and validation gates are complete.</p></div></div></div>
      <div className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/70 p-4"><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Imaging workflow</p><p className="mt-2 text-sm text-slate-200">Link study → quality check → segment → clinician review → render.</p></div><button onClick={onOpenReadiness} className="mt-4 flex w-fit items-center gap-2 rounded-lg border border-teal-500/40 bg-teal-500/10 px-3 py-2 text-xs font-semibold text-teal-200 hover:bg-teal-500/20"><ScanLine className="h-4 w-4" />Open imaging gate</button></div>
    </section>
    <section className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/50 p-3"><div className="flex items-center gap-2 text-xs text-slate-400"><FileSearch className="h-4 w-4 text-sky-300" />Anatomy preview is separated from provenance and acceptance records.</div><button onClick={onOpenFullscreen} className="flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700"><Maximize2 className="h-4 w-4" />Explore 3D anatomy</button></section>
    {children}
  </div>
);
