import React from 'react';
import { ArrowRight, CheckCircle2, Clock3, FileCheck2, ShieldAlert } from 'lucide-react';
import { ActiveAlert } from '../../types/alerts';

interface AttendingDecisionPanelProps {
  alerts: ActiveAlert[];
  telemetryTimestamp: number;
  snapshotCount: number;
  onOpenMonitoring: () => void;
  onOpenReview: () => void;
}

/** Compact accountability layer that complements, rather than replaces, Overview. */
export const AttendingDecisionPanel: React.FC<AttendingDecisionPanelProps> = ({ alerts, telemetryTimestamp, snapshotCount, onOpenMonitoring, onOpenReview }) => {
  const unacknowledged = alerts.filter((alert) => !alert.isAcknowledged).length;
  const freshnessSeconds = Math.max(0, Math.floor((Date.now() - telemetryTimestamp) / 1000));
  const readyForReview = unacknowledged === 0 && freshnessSeconds < 10;
  const checks = [
    ['Safety review', unacknowledged ? `${unacknowledged} alert${unacknowledged === 1 ? '' : 's'} to review` : 'No unacknowledged alerts', ShieldAlert, unacknowledged ? 'text-amber-300' : 'text-emerald-300'],
    ['Data freshness', freshnessSeconds === 0 ? 'Live now' : `${freshnessSeconds}s since update`, Clock3, freshnessSeconds < 10 ? 'text-teal-300' : 'text-amber-300'],
    ['Evidence context', `${snapshotCount} saved artifact${snapshotCount === 1 ? '' : 's'}`, FileCheck2, 'text-sky-300'],
  ] as const;

  return (
    <section className="rounded-xl border border-teal-500/25 bg-teal-950/10 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wide text-teal-300">Attending decision context</p><h2 className="mt-1 text-sm font-semibold text-white">Review status before a simulated protocol decision</h2><p className="mt-1 text-xs text-slate-400">This is an accountability cue, not diagnostic or treatment guidance.</p></div><span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${readyForReview ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200' : 'border-amber-500/30 bg-amber-500/10 text-amber-100'}`}>{readyForReview ? <CheckCircle2 className="h-3.5 w-3.5" /> : <ShieldAlert className="h-3.5 w-3.5" />}{readyForReview ? 'Review context current' : 'Review attention items'}</span></div>
      <div className="mt-4 grid gap-2 sm:grid-cols-3">{checks.map(([label, value, Icon, tone]) => <div key={label} className="rounded-lg border border-slate-800 bg-slate-950/70 p-3"><div className="flex items-center gap-2 text-[11px] text-slate-400"><Icon className={`h-3.5 w-3.5 ${tone}`} />{label}</div><p className={`mt-1 text-xs font-semibold ${tone}`}>{value}</p></div>)}</div>
      <div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={onOpenMonitoring} className="flex min-h-11 items-center gap-2 rounded-lg border border-teal-500/35 bg-teal-500/10 px-3 text-xs font-semibold text-teal-100 hover:bg-teal-500/20">Review live monitoring <ArrowRight className="h-4 w-4" /></button><button type="button" onClick={onOpenReview} className="flex min-h-11 items-center gap-2 rounded-lg border border-slate-700 bg-slate-950 px-3 text-xs font-semibold text-slate-200 hover:bg-slate-900">Open evidence review <ArrowRight className="h-4 w-4" /></button></div>
    </section>
  );
};
