import React from 'react';
import { Activity, ArrowRight, Radio, ShieldCheck, Zap } from 'lucide-react';
import { CellularSensorMetrics, NanogridPacingState } from '../../types/bdcmr';

interface ElectrophysiologyFocusPanelProps {
  cellular: CellularSensorMetrics;
  pacing: NanogridPacingState;
  onOpenTherapy: () => void;
}

/** A focused monitoring summary for the electrophysiology persona. */
export const ElectrophysiologyFocusPanel: React.FC<ElectrophysiologyFocusPanelProps> = ({ cellular, pacing, onOpenTherapy }) => {
  const measures = [
    ['Pacing rate', `${pacing.pulseFrequencyBpm}`, 'bpm', Radio, 'text-sky-300'],
    ['Pulse current', pacing.subthresholdCurrentMA.toFixed(2), 'mA', Zap, 'text-teal-300'],
    ['Conduction', pacing.conductionVelocityMs.toFixed(2), 'm/s', Activity, 'text-emerald-300'],
    ['APD90', cellular.actionPotentialDuration90Ms.toFixed(0), 'ms', ShieldCheck, 'text-amber-300'],
  ] as const;

  return (
    <section className="rounded-xl border border-sky-500/25 bg-sky-950/10 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><p className="text-xs font-semibold uppercase tracking-wide text-sky-300">Electrophysiology focus</p><h2 className="mt-1 text-sm font-semibold text-white">Rhythm and conduction review</h2><p className="mt-1 max-w-2xl text-xs text-slate-400">Review the live waveform and pacing context before opening the simulated therapy controls.</p></div>
        <button type="button" onClick={onOpenTherapy} className="flex min-h-11 items-center gap-2 rounded-lg border border-sky-400/35 bg-sky-500/10 px-3 text-xs font-semibold text-sky-100 hover:bg-sky-500/20">Open pacing review <ArrowRight className="h-4 w-4" /></button>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">{measures.map(([label, value, unit, Icon, tone]) => <div key={label} className="rounded-lg border border-slate-800 bg-slate-950/70 p-3"><div className="flex items-center justify-between text-[11px] text-slate-400"><span>{label}</span><Icon className={`h-3.5 w-3.5 ${tone}`} /></div><div className={`mt-1 font-mono text-lg font-semibold ${tone}`}>{value}<span className="ml-1 text-[11px] font-normal text-slate-500">{unit}</span></div></div>)}</div>
      <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-relaxed text-amber-100"><ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-300" />Values are simulated research telemetry and not diagnostic rhythm interpretation or treatment guidance.</p>
    </section>
  );
};
