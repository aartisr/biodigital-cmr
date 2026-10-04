import React, { ReactNode } from 'react';
import { ClipboardCheck, Clock3, ShieldCheck, Stethoscope } from 'lucide-react';
import { EpigeneticDosingState, SystemOperatingMode } from '../types/bdcmr';

const modeLabel: Record<SystemOperatingMode, string> = {
  AUTOMATED_CLOSED_LOOP: 'Automated closed loop',
  SUPERVISED_ADAPTIVE: 'Supervised adaptive',
  MANUAL_OVERRIDE: 'Manual override',
  EMERGENCY_REST_MODE: 'Emergency rest mode',
};

export const TherapyWorkspace: React.FC<{ operatingMode: SystemOperatingMode; dosing: EpigeneticDosingState; onOpenMonitoring: () => void; children: ReactNode }> = ({ operatingMode, dosing, onOpenMonitoring, children }) => (
  <div className="space-y-4">
    <section className="grid gap-3 lg:grid-cols-[1.2fr_1fr]">
      <div className="rounded-2xl border border-teal-500/30 bg-teal-950/15 p-4 sm:p-5"><div className="flex gap-3"><div className="rounded-xl bg-teal-500/10 p-2 text-teal-300"><ShieldCheck className="h-5 w-5" /></div><div><p className="text-xs font-semibold uppercase tracking-wide text-teal-300">Current operating state</p><h2 className="mt-1 text-base font-semibold text-white">{modeLabel[operatingMode]}</h2><p className="mt-1 text-xs leading-relaxed text-slate-300">Any parameter change must have a documented rationale, a visible safety cap, and a current monitoring review.</p></div></div></div>
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4"><div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500"><ClipboardCheck className="h-4 w-4 text-sky-300" />Change context</div><p className="mt-2 text-sm text-slate-200">{dosing.adjustmentReason}</p><p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500"><Clock3 className="h-3.5 w-3.5" />Last adjustment: {new Date(dosing.lastDoseAdjustmentTimestamp).toLocaleString()}</p></div>
    </section>
    <section className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-500/30 bg-amber-950/15 p-3"><div className="flex items-center gap-2 text-xs text-amber-100"><Stethoscope className="h-4 w-4 text-amber-300" />Review live telemetry before modifying the controller.</div><button onClick={onOpenMonitoring} className="rounded-lg border border-amber-500/40 px-3 py-2 text-xs font-semibold text-amber-200 hover:bg-amber-500/10">Open monitoring</button></section>
    {children}
  </div>
);
