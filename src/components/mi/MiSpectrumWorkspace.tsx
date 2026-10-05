import { useEffect, useMemo, useState } from 'react';
import { FlaskConical, GitCompareArrows, RotateCcw, Tags, X } from 'lucide-react';
import { AssessmentStatusBanner } from '../assessment/AssessmentStatusBanner';
import { EvidenceMatrix } from '../assessment/EvidenceMatrix';
import { EvidenceTimeline } from '../assessment/EvidenceTimeline';
import { ScenarioPlaybackControls } from '../assessment/ScenarioPlaybackControls';
import { miGroupMetadata } from '../../config/mi/taxonomy';
import { useScenarioPlayback } from '../../hooks/useScenarioPlayback';
import { useLocalStorageState } from '../../hooks/useLocalStorageState';
import { evaluateMiScenario } from '../../services/mi/evaluateMiScenario';
import { defaultMiScenarioFilters, filterMiScenarios, MiScenarioFilters as ScenarioFilters } from '../../services/mi/filterMiScenarios';
import { getMiScenario, miScenarios } from '../../services/mi/scenarioRepository';
import { MiEvidenceDomain } from '../../types/mi/classification';
import { MiClassificationPanel } from './MiClassificationPanel';
import { MiScenarioComparison } from './MiScenarioComparison';
import { MiScenarioFilters } from './MiScenarioFilters';
import { MiScenarioPicker } from './MiScenarioPicker';
import { MiTroponinTrend } from './MiTroponinTrend';

const domainLabels: Record<MiEvidenceDomain, string> = { SYMPTOMS: 'Symptoms', TROPONIN: 'Troponin', ECG: 'ECG', IMAGING: 'Imaging', ANGIOGRAPHY: 'Angiography', PROCEDURE: 'Procedure', CONTEXT: 'Context' };

export const MiSpectrumWorkspace = () => {
  const [scenarioId, setScenarioId] = useState(miScenarios[0].id);
  const [isComparing, setIsComparing] = useState(false);
  const [comparisonId, setComparisonId] = useState(miScenarios[1].id);
  const [filters, setFilters] = useLocalStorageState<ScenarioFilters>('bdcmr_mi_scenario_filters_v1', defaultMiScenarioFilters);
  const filteredScenarios = useMemo(() => filterMiScenarios(miScenarios, filters), [filters]);
  const scenario = useMemo(() => getMiScenario(scenarioId), [scenarioId]);
  const comparisonScenario = useMemo(() => getMiScenario(comparisonId), [comparisonId]);
  const effectiveComparisonScenario = comparisonScenario.id === scenario.id ? miScenarios.find((item) => item.id !== scenario.id) ?? scenario : comparisonScenario;
  useEffect(() => {
    if (comparisonId === scenarioId) setComparisonId(miScenarios.find((item) => item.id !== scenarioId)?.id ?? scenarioId);
  }, [comparisonId, scenarioId]);
  useEffect(() => {
    if (filteredScenarios.length > 0 && !filteredScenarios.some((item) => item.id === scenarioId)) setScenarioId(filteredScenarios[0].id);
  }, [filteredScenarios, scenarioId]);
  const assessment = useMemo(() => evaluateMiScenario(scenario), [scenario]);
  const playback = useScenarioPlayback(scenario.id, scenario.timeline);
  const group = miGroupMetadata[assessment.category];
  const visibleEvidence = scenario.evidence.filter((item) => playback.visibleEvidenceIds.has(item.id));
  return <div className="space-y-4"><section className="rounded-2xl border border-teal-400/25 bg-gradient-to-br from-teal-500/10 via-slate-900 to-slate-950 p-4 sm:p-5"><div className="flex flex-wrap items-start justify-between gap-4"><div className="flex gap-3"><div className="rounded-xl bg-teal-400/15 p-2.5 text-teal-200"><FlaskConical className="h-5 w-5" /></div><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-200">Research learning module</p><h1 className="mt-1 text-xl font-bold text-white">Full MI spectrum</h1><p className="mt-1 max-w-3xl text-sm text-slate-300">Explore synthetic evidence patterns across primary, secondary, procedure-related, unresolved, and non-ischaemic myocardial-injury scenarios.</p></div></div><span className="rounded-lg border border-teal-300/25 bg-slate-950/40 px-3 py-2 text-xs font-semibold text-teal-100">Simulation-only · read-only</span></div></section>
    <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]"><div className="space-y-4"><MiScenarioFilters filters={filters} resultCount={filteredScenarios.length} onChange={setFilters} onReset={() => setFilters(defaultMiScenarioFilters)} /><MiScenarioPicker scenarios={filteredScenarios} selectedId={scenarioId} onSelect={setScenarioId} /></div><div className="min-w-0 space-y-4">{filteredScenarios.length === 0 ? <section className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/60 p-8 text-center"><h2 className="text-base font-bold text-white">No scenarios match these filters</h2><p className="mt-2 text-sm text-slate-400">Clear one or more filters to return to the full synthetic scenario library.</p><button type="button" onClick={() => setFilters(defaultMiScenarioFilters)} className="mt-4 rounded-lg bg-teal-400 px-3 py-2 text-xs font-bold text-slate-950 hover:bg-teal-300">Clear filters</button></section> : <><AssessmentStatusBanner label={assessment.label} confidence={assessment.confidence} tone={group.tone} evidenceGapCount={assessment.evidenceGaps.length} /><section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 sm:p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Selected simulation</p><h2 className="mt-1 text-lg font-bold text-white">{scenario.title}</h2><p className="mt-1 text-sm text-slate-300">{scenario.learningObjective}</p></div><button type="button" onClick={() => setScenarioId(filteredScenarios[0]?.id ?? scenarioId)} className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-semibold text-slate-200 hover:border-teal-400/60 hover:text-teal-100"><RotateCcw className="h-3.5 w-3.5" />Reset scenario</button></div><div className="mt-4 flex flex-wrap gap-2"><Tags className="mt-1 h-3.5 w-3.5 text-slate-500" />{scenario.descriptors.map((descriptor) => <span className="rounded-full border border-slate-700 bg-slate-950 px-2.5 py-1 text-xs text-slate-300" key={descriptor}>{descriptor}</span>)}</div></section>
      <div className="grid gap-3 lg:grid-cols-[1fr_auto]"><ScenarioPlaybackControls isPlaying={playback.isPlaying} stepIndex={playback.stepIndex} stepCount={playback.stepCount} canGoNext={playback.canGoNext} canGoPrevious={playback.canGoPrevious} onTogglePlaying={playback.togglePlaying} onNext={playback.next} onPrevious={playback.previous} onReset={playback.reset} /><button type="button" onClick={() => setIsComparing((value) => !value)} aria-pressed={isComparing} className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-xs font-bold transition ${isComparing ? 'border-violet-400/60 bg-violet-500/15 text-violet-100' : 'border-slate-700 bg-slate-950 text-slate-200 hover:border-violet-400/60 hover:text-violet-100'}`}>{isComparing ? <X className="h-4 w-4" /> : <GitCompareArrows className="h-4 w-4" />}{isComparing ? 'Close comparison' : 'Compare scenarios'}</button></div>
      {isComparing && <section className="space-y-3 rounded-2xl border border-violet-400/25 bg-violet-500/[0.04] p-3 sm:p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-violet-200">Comparison case</p><p className="mt-1 text-sm text-slate-300">Choose a second synthetic scenario to compare against the active case.</p></div><label className="flex min-w-[250px] flex-col gap-1 text-xs font-semibold text-slate-300"><span className="sr-only">Comparison scenario</span><select value={effectiveComparisonScenario.id} onChange={(event) => setComparisonId(event.target.value)} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-300/20">{miScenarios.filter((item) => item.id !== scenario.id).map((item) => <option value={item.id} key={item.id}>{item.title}</option>)}</select></label></div><MiScenarioComparison primary={scenario} comparison={effectiveComparisonScenario} /></section>}
      <div className="grid gap-4 2xl:grid-cols-2"><MiClassificationPanel assessment={assessment} /><MiTroponinTrend points={scenario.troponinSeries.filter((point) => !playback.currentEvent || point.occurredAt <= playback.currentEvent.occurredAt)} /></div><div className="grid gap-4 2xl:grid-cols-2"><EvidenceMatrix evidence={visibleEvidence} domainLabels={domainLabels} /><EvidenceTimeline events={playback.visibleEvents} /></div></>}</div></div>
  </div>;
};
