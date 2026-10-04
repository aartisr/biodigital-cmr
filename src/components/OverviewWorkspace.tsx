import React from 'react';
import { Activity, ArrowRight, CheckCircle2, HeartPulse, ShieldAlert, TrendingDown, Waves } from 'lucide-react';
import { ActiveAlert } from '../types/alerts';
import { CellularSensorMetrics, PatientProfile, PatientVitals } from '../types/bdcmr';

export const OverviewWorkspace: React.FC<{ patient: PatientProfile; vitals: PatientVitals; cellular: CellularSensorMetrics; alerts: ActiveAlert[]; onOpenMonitoring: () => void; onReviewAlerts: () => void }> = ({ patient, vitals, cellular, alerts, onOpenMonitoring, onReviewAlerts }) => {
  const priority = alerts.find((alert) => !alert.isAcknowledged) ?? alerts[0];
  const scarChange = ((patient.baselineScarAreaCm2 - patient.currentScarAreaCm2) / patient.baselineScarAreaCm2) * 100;
  const metrics = [
    ['Heart rate', `${vitals.heartRateBpm}`, 'BPM', HeartPulse, 'text-emerald-300'],
    ['Mean pressure', `${vitals.meanArterialPressure}`, 'mmHg', Activity, 'text-sky-300'],
    ['Ejection fraction', `${patient.currentLVEF}`, '%', HeartPulse, 'text-teal-300'],
    ['Tissue stiffness', cellular.youngsModulusKPa.toFixed(1), 'kPa', Waves, 'text-amber-300'],
  ] as const;
  return <div className="space-y-4">
    <section className={`rounded-2xl border p-4 sm:p-5 ${priority ? priority.severity === 'CRITICAL' ? 'border-rose-500/50 bg-rose-950/25' : 'border-amber-500/40 bg-amber-950/20' : 'border-emerald-500/30 bg-emerald-950/15'}`}>
      <div className="flex flex-wrap items-start justify-between gap-4"><div className="flex gap-3">{priority ? <ShieldAlert className="mt-0.5 h-5 w-5 text-amber-300" /> : <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-300" />}<div><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Needs attention</p><h2 className="mt-1 text-base font-semibold text-white">{priority ? priority.message : 'No unacknowledged safety alerts'}</h2><p className="mt-1 text-xs text-slate-400">{priority ? `${priority.metricName}: ${priority.currentValue} ${priority.unit} · threshold ${priority.thresholdValue} ${priority.unit}` : 'Continue routine monitoring; review live telemetry when needed.'}</p></div></div><button onClick={priority ? onReviewAlerts : onOpenMonitoring} className="flex items-center gap-2 rounded-lg bg-teal-500 px-3 py-2 text-xs font-semibold text-slate-950 hover:bg-teal-400">{priority ? 'Review alert' : 'Open monitoring'}<ArrowRight className="h-4 w-4" /></button></div>
    </section>
    <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">{metrics.map(([label, value, unit, Icon, tone]) => <div key={label} className="rounded-xl border border-slate-800 bg-slate-900/70 p-3"><div className="flex items-center justify-between text-xs text-slate-400"><span>{label}</span><Icon className={`h-4 w-4 ${tone}`} /></div><div className={`mt-2 font-mono text-2xl font-bold ${tone}`}>{value}<span className="ml-1 text-xs font-medium text-slate-500">{unit}</span></div></div>)}</section>
    <section className="grid gap-3 lg:grid-cols-[1.3fr_1fr]"><div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4"><div className="flex items-center gap-2 text-sm font-semibold text-white"><TrendingDown className="h-4 w-4 text-emerald-300" />Recent change</div><p className="mt-2 text-sm text-slate-300">Scar area is {scarChange.toFixed(1)}% below baseline; ejection fraction is {(patient.currentLVEF - patient.baselineLVEF).toFixed(1)} points above baseline.</p><button onClick={onOpenMonitoring} className="mt-3 text-xs font-semibold text-teal-300 hover:text-teal-200">View live trend →</button></div><div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Next safe action</p><p className="mt-2 text-sm font-medium text-slate-100">Review the live telemetry workspace before changing any protocol.</p><button onClick={onOpenMonitoring} className="mt-3 text-xs font-semibold text-teal-300 hover:text-teal-200">Go to monitoring →</button></div></section>
  </div>;
};
