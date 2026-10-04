import React, { ReactNode } from 'react';
import { Activity, AlertTriangle, Clock3, Radio } from 'lucide-react';
import { ActiveAlert } from '../types/alerts';

export const MonitoringWorkspace: React.FC<{ timestamp: number; alerts: ActiveAlert[]; onReviewAlerts: () => void; children: ReactNode }> = ({ timestamp, alerts, onReviewAlerts, children }) => {
  const unacknowledged = alerts.filter((alert) => !alert.isAcknowledged);
  const freshnessSeconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  return <div className="space-y-4">
    <section className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/70 p-3 sm:p-4">
      <div className="flex items-center gap-3"><div className="rounded-lg bg-teal-500/10 p-2 text-teal-300"><Radio className="h-4 w-4" /></div><div><h2 className="text-sm font-semibold text-white">Live monitoring</h2><p className="mt-0.5 text-xs text-slate-400">Telemetry, ECG, and safety review in one focused workspace.</p></div></div>
      <div className="flex items-center gap-3 text-xs"><span className="flex items-center gap-1.5 font-mono text-slate-400"><Clock3 className="h-3.5 w-3.5 text-teal-300" />{freshnessSeconds === 0 ? 'Live now' : `${freshnessSeconds}s ago`}</span><button onClick={onReviewAlerts} className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 font-semibold ${unacknowledged.length ? 'border-amber-500/40 bg-amber-500/10 text-amber-200' : 'border-slate-700 bg-slate-950 text-slate-300'}`}><AlertTriangle className="h-3.5 w-3.5" />{unacknowledged.length ? `${unacknowledged.length} to review` : 'Alerts clear'}</button></div>
    </section>
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-12"><div className="xl:col-span-12">{children}</div></div>
    <div className="flex items-center gap-2 text-xs text-slate-500"><Activity className="h-3.5 w-3.5 text-teal-400" />Use Monitoring to assess live state; open Therapy only after reviewing data and rationale.</div>
  </div>;
};
