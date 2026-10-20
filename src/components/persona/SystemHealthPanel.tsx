import React from 'react';
import { Activity, ArrowRight, Database, HardDrive, ShieldCheck, Wifi, WifiOff } from 'lucide-react';
import { SyncEngineStatus } from '../../services/offlineSyncEngine';

interface SystemHealthPanelProps {
  syncStatus: SyncEngineStatus;
  onOpenSyncConsole: () => void;
  onOpenIntegration: () => void;
  onOpenAudit: () => void;
  mode?: 'ENGINEERING' | 'INTEGRATION';
}

/** Reusable operational summary for the biomedical systems engineer persona. */
export const SystemHealthPanel: React.FC<SystemHealthPanelProps> = ({ syncStatus, onOpenSyncConsole, onOpenIntegration, onOpenAudit, mode = 'ENGINEERING' }) => {
  const statusLabel = syncStatus.isOnline ? 'Connected' : 'Air-gapped';
  const StatusIcon = syncStatus.isOnline ? Wifi : WifiOff;
  const lastSync = new Date(syncStatus.lastSyncTimestamp).toLocaleTimeString();
  const integrationMode = mode === 'INTEGRATION';
  const copy = integrationMode
    ? { eyebrow: 'Integration health', title: 'Adapter and transport posture', description: 'Inspect simulated connection, replay, and adapter status. Production configuration remains outside this browser experience.', primary: 'Open transport console', adapter: 'Inspect adapter posture', notice: 'This panel does not expose production endpoint configuration, credentials, or clinical control.' }
    : { eyebrow: 'System health', title: 'Telemetry and integration posture', description: 'Operational context is de-identified by default. Use the linked consoles for simulated transport and adapter inspection.', primary: 'Open sync console', adapter: 'Inspect adapter status', notice: 'This panel does not authorize production configuration changes or clinical actions. It summarizes the local simulated session only.' };
  const checks = [
    ['Transport', statusLabel, syncStatus.isOnline ? `${syncStatus.simulatedLatencyMs.toFixed(1)} ms` : `${syncStatus.bufferedPacketsCount} buffered`, StatusIcon, syncStatus.isOnline ? 'text-teal-300' : 'text-amber-300'],
    ['Integrity', syncStatus.dataIntegrityOk ? 'Verified' : 'Attention', 'Session checksum state', ShieldCheck, syncStatus.dataIntegrityOk ? 'text-emerald-300' : 'text-amber-300'],
    ['Replay queue', `${syncStatus.bufferedPacketsCount}`, syncStatus.syncInProgress ? 'Replaying' : 'Packets buffered', HardDrive, 'text-sky-300'],
    ['Telemetry', `${syncStatus.totalSyncedPackets.toLocaleString()}`, `Last sync ${lastSync}`, Activity, 'text-violet-300'],
  ] as const;

  return (
    <section className="rounded-xl border border-violet-500/25 bg-violet-950/10 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wide text-violet-300">{copy.eyebrow}</p><h2 className="mt-1 text-sm font-semibold text-white">{copy.title}</h2><p className="mt-1 max-w-2xl text-xs text-slate-400">{copy.description}</p></div><button type="button" onClick={onOpenSyncConsole} className="flex min-h-11 items-center gap-2 rounded-lg border border-violet-400/35 bg-violet-500/10 px-3 text-xs font-semibold text-violet-100 hover:bg-violet-500/20">{copy.primary} <ArrowRight className="h-4 w-4" /></button></div>
      <div className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-4">{checks.map(([label, value, detail, Icon, tone]) => <div key={label} className="rounded-lg border border-slate-800 bg-slate-950/70 p-3"><div className="flex items-center justify-between text-[11px] text-slate-400"><span>{label}</span><Icon className={`h-3.5 w-3.5 ${tone}`} /></div><div className={`mt-1 font-mono text-lg font-semibold ${tone}`}>{value}</div><p className="mt-0.5 truncate text-[11px] text-slate-500">{detail}</p></div>)}</div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2"><button type="button" onClick={onOpenIntegration} className="flex min-h-11 items-center justify-between rounded-lg border border-slate-800 bg-slate-950 px-3 text-left text-xs text-slate-200 hover:bg-slate-900"><span className="flex items-center gap-2"><Database className="h-4 w-4 text-teal-300" />{copy.adapter}</span><ArrowRight className="h-4 w-4 text-slate-500" /></button><button type="button" onClick={onOpenAudit} className="flex min-h-11 items-center justify-between rounded-lg border border-slate-800 bg-slate-950 px-3 text-left text-xs text-slate-200 hover:bg-slate-900"><span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-teal-300" />Review session audit</span><ArrowRight className="h-4 w-4 text-slate-500" /></button></div>
      <p className="mt-3 text-[11px] leading-relaxed text-amber-100">{copy.notice}</p>
    </section>
  );
};
