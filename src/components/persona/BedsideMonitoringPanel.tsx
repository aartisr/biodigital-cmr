import React from 'react';
import { ArrowRight, BellRing, CheckCircle2, Clock3, UserRound } from 'lucide-react';
import { ActiveAlert } from '../../types/alerts';
import { PatientProfile } from '../../types/bdcmr';

interface BedsideMonitoringPanelProps {
  patient: PatientProfile;
  alerts: ActiveAlert[];
  telemetryTimestamp: number;
  onOpenAlerts: () => void;
  onOpenReview: () => void;
}

/** Compact handoff and escalation context for the ICU nurse persona. */
export const BedsideMonitoringPanel: React.FC<BedsideMonitoringPanelProps> = ({ patient, alerts, telemetryTimestamp, onOpenAlerts, onOpenReview }) => {
  const unacknowledged = alerts.filter((alert) => !alert.isAcknowledged).length;
  const freshnessSeconds = Math.max(0, Math.floor((Date.now() - telemetryTimestamp) / 1000));

  return (
    <section className="rounded-xl border border-cyan-500/25 bg-cyan-950/10 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wide text-cyan-300">Bedside monitoring</p><h2 className="mt-1 text-sm font-semibold text-white">Patient, alert, and handoff context</h2><p className="mt-1 text-xs text-slate-400">Use this simulated workspace to review safety signals and prepare a handoff. It does not provide diagnosis or treatment direction.</p></div><button type="button" onClick={onOpenAlerts} className="flex min-h-11 items-center gap-2 rounded-lg border border-cyan-400/35 bg-cyan-500/10 px-3 text-xs font-semibold text-cyan-100 hover:bg-cyan-500/20">Review alerts <ArrowRight className="h-4 w-4" /></button></div>
      <div className="mt-4 grid gap-2 sm:grid-cols-3"><div className="rounded-lg border border-slate-800 bg-slate-950/70 p-3"><div className="flex items-center gap-2 text-[11px] text-slate-400"><UserRound className="h-3.5 w-3.5 text-cyan-300" />Active patient</div><p className="mt-1 font-mono text-xs font-semibold text-cyan-200">{patient.mrnTokenized}</p><p className="mt-0.5 text-[11px] text-slate-500">Day {patient.postInfarcDay} · {patient.infarctLocation}</p></div><div className="rounded-lg border border-slate-800 bg-slate-950/70 p-3"><div className="flex items-center gap-2 text-[11px] text-slate-400"><BellRing className="h-3.5 w-3.5 text-amber-300" />Safety queue</div><p className={`mt-1 text-xs font-semibold ${unacknowledged ? 'text-amber-200' : 'text-emerald-300'}`}>{unacknowledged ? `${unacknowledged} item${unacknowledged === 1 ? '' : 's'} to review` : 'No unacknowledged items'}</p><p className="mt-0.5 text-[11px] text-slate-500">Receipt is not resolution</p></div><div className="rounded-lg border border-slate-800 bg-slate-950/70 p-3"><div className="flex items-center gap-2 text-[11px] text-slate-400"><Clock3 className="h-3.5 w-3.5 text-teal-300" />Data freshness</div><p className="mt-1 text-xs font-semibold text-teal-200">{freshnessSeconds === 0 ? 'Live now' : `${freshnessSeconds}s since update`}</p><p className="mt-0.5 text-[11px] text-slate-500">Confirm before handoff</p></div></div>
      <div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={onOpenReview} className="flex min-h-11 items-center gap-2 rounded-lg border border-slate-700 bg-slate-950 px-3 text-xs font-semibold text-slate-200 hover:bg-slate-900"><CheckCircle2 className="h-4 w-4 text-teal-300" />Open handoff artifacts <ArrowRight className="h-4 w-4" /></button></div>
    </section>
  );
};
