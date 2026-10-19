import React from 'react';
import { ArrowRight, FileText, History, ShieldCheck } from 'lucide-react';

interface AuditEvidencePanelProps {
  snapshotCount: number;
  onOpenAudit: () => void;
  onOpenSnapshots: () => void;
  onOpenReport: () => void;
}

/** Read-only evidence entry point for the clinical auditor persona. */
export const AuditEvidencePanel: React.FC<AuditEvidencePanelProps> = ({ snapshotCount, onOpenAudit, onOpenSnapshots, onOpenReport }) => {
  const actions = [
    ['Audit trail', 'Review session access and recorded activity', ShieldCheck, onOpenAudit, 'text-emerald-300'],
    ['Session snapshots', `${snapshotCount} saved session artifact${snapshotCount === 1 ? '' : 's'} available`, History, onOpenSnapshots, 'text-sky-300'],
    ['Research report', 'Inspect the generated research-session artifact', FileText, onOpenReport, 'text-teal-300'],
  ] as const;

  return (
    <section className="rounded-xl border border-emerald-500/25 bg-emerald-950/10 p-4">
      <div><p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">Audit evidence</p><h2 className="mt-1 text-sm font-semibold text-white">Access, artifacts, and provenance review</h2><p className="mt-1 max-w-2xl text-xs text-slate-400">Use the linked artifacts to review this simulated session. This role cannot change controller state, telemetry, or privacy scope.</p></div>
      <div className="mt-4 grid gap-2 sm:grid-cols-3">{actions.map(([label, detail, Icon, onClick, tone]) => <button type="button" key={label} onClick={onClick} className="flex min-h-24 items-start gap-3 rounded-lg border border-slate-800 bg-slate-950/70 p-3 text-left hover:bg-slate-900"><Icon className={`mt-0.5 h-4 w-4 shrink-0 ${tone}`} /><span className="min-w-0 flex-1"><span className="block text-xs font-semibold text-slate-100">{label}</span><span className="mt-1 block text-[11px] leading-relaxed text-slate-500">{detail}</span></span><ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-slate-600" /></button>)}</div>
      <p className="mt-3 text-[11px] leading-relaxed text-amber-100">Audit visibility here is a research-demo presentation. Immutable, server-generated access and export records remain required for compliance use.</p>
    </section>
  );
};
