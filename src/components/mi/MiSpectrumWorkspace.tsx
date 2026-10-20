import { useEffect, useMemo, useState } from 'react';
import { FileOutput, FlaskConical, GitCompareArrows, Tags, X } from 'lucide-react';
import { AssessmentStatusBanner } from '../assessment/AssessmentStatusBanner';
import { EvidenceMatrix } from '../assessment/EvidenceMatrix';
import { EvidenceTimeline } from '../assessment/EvidenceTimeline';
import { ScenarioPlaybackControls } from '../assessment/ScenarioPlaybackControls';
import { ProvenanceCallout } from '../assessment/ProvenanceCallout';
import { miGroupMetadata } from '../../config/mi/taxonomy';
import { miCoverageManifest } from '../../config/mi/coverageManifest';
import { getMiScenarioPhenotype } from '../../config/mi/scenarioPhenotypes';
import { useScenarioPlayback } from '../../hooks/useScenarioPlayback';
import { useLocalStorageState } from '../../hooks/useLocalStorageState';
import { evaluateMiScenario } from '../../services/mi/evaluateMiScenario';
import { deriveMiCoverageDisplay } from '../../services/mi/deriveMiCoverageDisplay';
import { deriveInfarctSummary } from '../../services/mi/deriveInfarctSummary';
import { defaultMiScenarioFilters, filterMiScenarios, MiScenarioFilters as ScenarioFilters } from '../../services/mi/filterMiScenarios';
import { getMiScenario, miScenarios } from '../../services/mi/scenarioRepository';
import { MiEvidenceDomain } from '../../types/mi/classification';
import type { AssessmentWorkspaceModuleProps } from '../../types/assessment/module';
import { SimulationBoundaryNotice } from '../ui/SimulationBoundaryNotice';
import { InfarctSummaryPanel } from './InfarctSummaryPanel';
import { MiClassificationPanel } from './MiClassificationPanel';
import { MiCoverageBoundary } from './MiCoverageBoundary';
import { MiScenarioComparison } from './MiScenarioComparison';
import { MiScenarioFilters } from './MiScenarioFilters';
import { MiScenarioLimitations } from './MiScenarioLimitations';
import { MiScenarioExport } from './MiScenarioExport';
import { MiScenarioPicker } from './MiScenarioPicker';
import { MiTerminologyPanel } from './MiTerminologyPanel';
import { MiTroponinTrend } from './MiTroponinTrend';

const domainLabels: Record<MiEvidenceDomain, string> = { SYMPTOMS: 'Symptoms', TROPONIN: 'Troponin', ECG: 'ECG', IMAGING: 'Imaging', ANGIOGRAPHY: 'Angiography', PROCEDURE: 'Procedure', CONTEXT: 'Context' };
const coverageDisplay = deriveMiCoverageDisplay(miCoverageManifest);

export const MiSpectrumWorkspace = ({ capabilities }: AssessmentWorkspaceModuleProps) => {
  const [scenarioId, setScenarioId] = useState(miScenarios[0].id);
  const [isComparing, setIsComparing] = useState(false);
  const [comparisonId, setComparisonId] = useState(miScenarios[1].id);
  const [isExporting, setIsExporting] = useState(false);
  const [filters, setFilters] = useLocalStorageState<ScenarioFilters>('bdcmr_mi_scenario_filters_v1', defaultMiScenarioFilters);
  const filteredScenarios = useMemo(() => filterMiScenarios(miScenarios, filters), [filters]);
  const scenario = useMemo(() => getMiScenario(scenarioId), [scenarioId]);
  const phenotypeFixture = useMemo(() => scenario.phenotypeId ? getMiScenarioPhenotype(scenario.phenotypeId) : undefined, [scenario.phenotypeId]);
  const infarctSummary = useMemo(() => phenotypeFixture ? deriveInfarctSummary(phenotypeFixture.phenotype) : undefined, [phenotypeFixture]);
  const comparisonScenario = useMemo(() => getMiScenario(comparisonId), [comparisonId]);
  const effectiveComparisonScenario = comparisonScenario.id === scenario.id ? miScenarios.find((item) => item.id !== scenario.id) ?? scenario : comparisonScenario;
  const assessment = useMemo(() => evaluateMiScenario(scenario), [scenario]);
  const playback = useScenarioPlayback(scenario.id, scenario.timeline);
  const group = miGroupMetadata[assessment.category];
  const visibleEvidence = scenario.evidence.filter((item) => playback.visibleEvidenceIds.has(item.id));

  useEffect(() => {
    if (comparisonId === scenarioId) setComparisonId(miScenarios.find((item) => item.id !== scenarioId)?.id ?? scenarioId);
  }, [comparisonId, scenarioId]);
  useEffect(() => {
    if (filteredScenarios.length > 0 && !filteredScenarios.some((item) => item.id === scenarioId)) setScenarioId(filteredScenarios[0].id);
  }, [filteredScenarios, scenarioId]);

  return <div className="space-y-4">
    <section className="rounded-2xl border border-teal-400/25 bg-gradient-to-br from-teal-500/10 via-slate-900 to-slate-950 p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-4"><div className="flex gap-3"><div className="rounded-xl bg-teal-400/15 p-2.5 text-teal-200"><FlaskConical className="h-5 w-5" /></div><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-200">Research learning module</p><h1 className="mt-1 text-xl font-bold text-white">MI spectrum, one case at a time</h1><p className="mt-1 max-w-3xl text-sm text-slate-300">Choose a synthetic case, follow its evidence in order, and inspect only the detail that helps your learning goal.</p></div></div><SimulationBoundaryNotice kind="ASSESSMENT" compact /></div>
    </section>

    <details className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3"><summary className="cursor-pointer text-sm font-semibold text-slate-200">About this learning library: terminology, provenance, and scope</summary><div className="mt-3 grid gap-3 border-t border-slate-800 pt-3 xl:grid-cols-2"><MiTerminologyPanel /><ProvenanceCallout source={scenario.provenance} taxonomyVersion={scenario.taxonomyVersion} scenarioPackId={scenario.scenarioPackId} /><div className="xl:col-span-2"><MiCoverageBoundary groups={coverageDisplay} /></div></div></details>

    <div className="grid gap-4 xl:grid-cols-[290px_minmax(0,1fr)]">
      <aside className="space-y-3"><MiScenarioPicker scenarios={filteredScenarios} selectedId={scenarioId} onSelect={setScenarioId} /><MiScenarioFilters filters={filters} resultCount={filteredScenarios.length} onChange={setFilters} onReset={() => setFilters(defaultMiScenarioFilters)} /></aside>
      <main className="min-w-0 space-y-4" aria-label="Selected MI learning scenario">
        {filteredScenarios.length === 0 ? <section className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/60 p-8 text-center"><h2 className="text-base font-bold text-white">No scenarios match these filters</h2><p className="mt-2 text-sm text-slate-400">Clear filters to return to the synthetic scenario library.</p><button type="button" onClick={() => setFilters(defaultMiScenarioFilters)} className="mt-4 rounded-lg bg-teal-400 px-3 py-2 text-xs font-bold text-slate-950 hover:bg-teal-300">Clear filters</button></section> : <>
          <AssessmentStatusBanner label={assessment.label} confidence={assessment.confidence} tone={group.tone} evidenceGapCount={assessment.evidenceGaps.length} />
          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 sm:p-5"><p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Selected case · start here</p><h2 className="mt-1 text-lg font-bold text-white">{scenario.title}</h2><p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-200">{scenario.learningObjective}</p><div className="mt-4 flex flex-wrap gap-2"><Tags className="mt-1 h-3.5 w-3.5 text-slate-500" />{scenario.descriptors.map((descriptor) => <span className="rounded-full border border-slate-700 bg-slate-950 px-2.5 py-1 text-xs text-slate-300" key={descriptor}>{descriptor}</span>)}</div></section>
          <MiScenarioLimitations limitations={scenario.limitations} review={scenario.review} />
          <InfarctSummaryPanel summary={infarctSummary} capabilities={capabilities} review={phenotypeFixture?.review} />
          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 sm:p-5"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-teal-300">1. Follow the evidence</p><h2 className="mt-1 text-base font-bold text-white">Reveal one event at a time</h2><p className="mt-1 text-sm text-slate-400">Pause whenever you want to consider what is known, absent, or still uncertain.</p></div><div className="mt-4"><ScenarioPlaybackControls isPlaying={playback.isPlaying} stepIndex={playback.stepIndex} stepCount={playback.stepCount} canGoNext={playback.canGoNext} canGoPrevious={playback.canGoPrevious} onTogglePlaying={playback.togglePlaying} onNext={playback.next} onPrevious={playback.previous} onReset={playback.reset} /></div></section>
          <div className="grid gap-4 2xl:grid-cols-2"><MiClassificationPanel assessment={assessment} /><MiTroponinTrend points={scenario.troponinSeries.filter((point) => !playback.currentEvent || point.occurredAt <= playback.currentEvent.occurredAt)} /></div>
          <details open className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 sm:p-5"><summary className="cursor-pointer text-sm font-bold text-white">2. Inspect the evidence revealed so far</summary><div className="mt-4"><EvidenceMatrix evidence={visibleEvidence} domainLabels={domainLabels} /></div></details>
          <details className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 sm:p-5"><summary className="cursor-pointer text-sm font-bold text-white">See the event timeline</summary><div className="mt-4"><EvidenceTimeline events={playback.visibleEvents} /></div></details>
          <details className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 sm:p-5"><summary className="cursor-pointer text-sm font-bold text-white">Optional tools: compare or export this synthetic case</summary><div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={() => setIsComparing((value) => !value)} aria-pressed={isComparing} className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-xs font-bold transition ${isComparing ? 'border-violet-400/60 bg-violet-500/15 text-violet-100' : 'border-slate-700 bg-slate-950 text-slate-200 hover:border-violet-400/60 hover:text-violet-100'}`}>{isComparing ? <X className="h-4 w-4" /> : <GitCompareArrows className="h-4 w-4" />}{isComparing ? 'Close comparison' : 'Compare scenarios'}</button><button type="button" onClick={() => setIsExporting((value) => !value)} aria-pressed={isExporting} className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-xs font-bold transition ${isExporting ? 'border-sky-300/60 bg-sky-500/15 text-sky-100' : 'border-slate-700 bg-slate-950 text-slate-200 hover:border-sky-300/60 hover:text-sky-100'}`}><FileOutput className="h-4 w-4" />{isExporting ? 'Close export' : 'Export scenario'}</button></div>{isComparing && <section className="mt-4 space-y-3 rounded-2xl border border-violet-400/25 bg-violet-500/[0.04] p-3 sm:p-4"><label className="block text-xs font-semibold text-slate-300"><span className="block">Compare with</span><select value={effectiveComparisonScenario.id} onChange={(event) => setComparisonId(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-300/20">{miScenarios.filter((item) => item.id !== scenario.id).map((item) => <option value={item.id} key={item.id}>{item.title}</option>)}</select></label><MiScenarioComparison primary={scenario} comparison={effectiveComparisonScenario} /></section>}{isExporting && <div className="mt-4"><MiScenarioExport scenario={scenario} assessment={assessment} /></div>}</details>
        </>}
      </main>
    </div>
  </div>;
};
