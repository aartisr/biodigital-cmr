import { useMemo, useState } from 'react';
import { FlaskConical, RotateCcw, Tags } from 'lucide-react';
import { AssessmentStatusBanner } from '../assessment/AssessmentStatusBanner';
import { EvidenceMatrix } from '../assessment/EvidenceMatrix';
import { EvidenceTimeline } from '../assessment/EvidenceTimeline';
import { miGroupMetadata } from '../../config/mi/taxonomy';
import { evaluateMiScenario } from '../../services/mi/evaluateMiScenario';
import { getMiScenario, miScenarios } from '../../services/mi/scenarioRepository';
import { MiEvidenceDomain } from '../../types/mi/classification';
import { MiClassificationPanel } from './MiClassificationPanel';
import { MiScenarioPicker } from './MiScenarioPicker';
import { MiTroponinTrend } from './MiTroponinTrend';

const domainLabels: Record<MiEvidenceDomain, string> = { SYMPTOMS: 'Symptoms', TROPONIN: 'Troponin', ECG: 'ECG', IMAGING: 'Imaging', ANGIOGRAPHY: 'Angiography', PROCEDURE: 'Procedure', CONTEXT: 'Context' };

export const MiSpectrumWorkspace = () => {
  const [scenarioId, setScenarioId] = useState(miScenarios[0].id);
  const scenario = useMemo(() => getMiScenario(scenarioId), [scenarioId]);
  const assessment = useMemo(() => evaluateMiScenario(scenario), [scenario]);
  const group = miGroupMetadata[assessment.category];
  return <div className="space-y-4"><section className="rounded-2xl border border-teal-400/25 bg-gradient-to-br from-teal-500/10 via-slate-900 to-slate-950 p-4 sm:p-5"><div className="flex flex-wrap items-start justify-between gap-4"><div className="flex gap-3"><div className="rounded-xl bg-teal-400/15 p-2.5 text-teal-200"><FlaskConical className="h-5 w-5" /></div><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-200">Research learning module</p><h1 className="mt-1 text-xl font-bold text-white">Full MI spectrum</h1><p className="mt-1 max-w-3xl text-sm text-slate-300">Explore synthetic evidence patterns across primary, secondary, procedure-related, unresolved, and non-ischaemic myocardial-injury scenarios.</p></div></div><span className="rounded-lg border border-teal-300/25 bg-slate-950/40 px-3 py-2 text-xs font-semibold text-teal-100">Simulation-only · read-only</span></div></section>
    <div className="grid gap-4 xl:grid-cols-[300px_minmax(0,1fr)]"><MiScenarioPicker scenarios={miScenarios} selectedId={scenarioId} onSelect={setScenarioId} /><div className="min-w-0 space-y-4"><AssessmentStatusBanner label={assessment.label} confidence={assessment.confidence} tone={group.tone} evidenceGapCount={assessment.evidenceGaps.length} /><section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 sm:p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Selected simulation</p><h2 className="mt-1 text-lg font-bold text-white">{scenario.title}</h2><p className="mt-1 text-sm text-slate-300">{scenario.learningObjective}</p></div><button type="button" onClick={() => setScenarioId(miScenarios[0].id)} className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-semibold text-slate-200 hover:border-teal-400/60 hover:text-teal-100"><RotateCcw className="h-3.5 w-3.5" />Reset scenario</button></div><div className="mt-4 flex flex-wrap gap-2"><Tags className="mt-1 h-3.5 w-3.5 text-slate-500" />{scenario.descriptors.map((descriptor) => <span className="rounded-full border border-slate-700 bg-slate-950 px-2.5 py-1 text-xs text-slate-300" key={descriptor}>{descriptor}</span>)}</div></section>
      <div className="grid gap-4 2xl:grid-cols-2"><MiClassificationPanel assessment={assessment} /><MiTroponinTrend points={scenario.troponinSeries} /></div><div className="grid gap-4 2xl:grid-cols-2"><EvidenceMatrix evidence={scenario.evidence} domainLabels={domainLabels} /><EvidenceTimeline events={scenario.timeline} /></div></div></div>
  </div>;
};
