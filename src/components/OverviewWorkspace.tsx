import React, { memo } from 'react';
import { Activity, ArrowRight, CheckCircle2, HeartPulse, ShieldAlert, TrendingDown, Waves } from 'lucide-react';
import { ActiveAlert } from '../types/alerts';
import { CellularSensorMetrics, PatientProfile, PatientVitals } from '../types/bdcmr';
import { MetricTile, SectionHeading, Surface } from './ui/Surface';

export const OverviewWorkspace = memo(({ patient, vitals, cellular, alerts, onOpenMonitoring, onReviewAlerts }: { patient: PatientProfile; vitals: PatientVitals; cellular: CellularSensorMetrics; alerts: ActiveAlert[]; onOpenMonitoring: () => void; onReviewAlerts: () => void }) => {
  const priority = alerts.find((alert) => !alert.isAcknowledged) ?? alerts[0];
  const scarChange = ((patient.baselineScarAreaCm2 - patient.currentScarAreaCm2) / patient.baselineScarAreaCm2) * 100;
  const metrics = [
    ['Modeled heart rate', `${vitals.heartRateBpm}`, 'BPM', HeartPulse, 'text-emerald-300'],
    ['Modeled mean pressure', `${vitals.meanArterialPressure}`, 'mmHg', Activity, 'text-sky-300'],
    ['Scenario ejection fraction', `${patient.currentLVEF}`, '%', HeartPulse, 'text-teal-300'],
    ['Modeled tissue stiffness', cellular.youngsModulusKPa.toFixed(1), 'kPa', Waves, 'text-amber-300'],
  ] as const;
  return <div className="space-y-4">
    <Surface className={`p-4 sm:p-5 ${priority ? priority.severity === 'CRITICAL' ? 'border-rose-500/50 bg-rose-950/25' : 'border-amber-500/40 bg-amber-950/20' : 'border-emerald-500/30 bg-emerald-950/15'}`}>
      <SectionHeading icon={priority ? ShieldAlert : CheckCircle2} eyebrow="Scenario status" title={priority ? priority.message : 'No unacknowledged simulated alerts'} description={priority ? `${priority.metricName}: ${priority.currentValue} ${priority.unit} · configured threshold ${priority.thresholdValue} ${priority.unit}` : 'Explore the simulated monitoring view when you need more detail.'} action={<button onClick={priority ? onReviewAlerts : onOpenMonitoring} className="flex items-center gap-2 rounded-lg bg-teal-500 px-3 py-2 text-xs font-semibold text-slate-950 hover:bg-teal-400">{priority ? 'Review alert' : 'Open monitoring'}<ArrowRight className="h-4 w-4" /></button>} />
    </Surface>
    <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">{metrics.map(([label, value, unit, Icon, tone]) => <MetricTile key={label} label={label} value={value} unit={unit} icon={Icon} tone={tone} />)}</section>
    <section className="grid gap-3 lg:grid-cols-[1.3fr_1fr]"><Surface className="p-4"><SectionHeading icon={TrendingDown} title="Scenario change" description={<span className="text-sm text-slate-300">In this synthetic scenario, scar area is {scarChange.toFixed(1)}% below baseline and ejection fraction is {(patient.currentLVEF - patient.baselineLVEF).toFixed(1)} points above baseline.</span>} /><button onClick={onOpenMonitoring} className="mt-3 text-xs font-semibold text-teal-300 hover:text-teal-200">View modeled trend →</button></Surface><Surface className="p-4"><SectionHeading eyebrow="Suggested next step" title="Inspect the assumptions" description={<span className="text-sm font-medium text-slate-100">Open monitoring to inspect the simulated values and configured assumptions.</span>} /><button onClick={onOpenMonitoring} className="mt-3 text-xs font-semibold text-teal-300 hover:text-teal-200">Go to monitoring →</button></Surface></section>
  </div>;
});
OverviewWorkspace.displayName = 'OverviewWorkspace';
