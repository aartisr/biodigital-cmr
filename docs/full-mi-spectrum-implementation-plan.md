# Full Myocardial Infarction Spectrum — Implementation Plan

## Purpose and boundary

Extend BD-CMR with a **simulation-only, research and training experience** for the full myocardial infarction (MI) spectrum. The experience will help users explore how different evidence streams, timelines, and contexts can support or weaken a simulated classification. It must not diagnose, triage, recommend treatment, or present itself as a clinical decision-support system.

The module must make the distinction between **myocardial injury**, **suspected MI**, and a **simulated classification** visible at every relevant decision point. A real MI diagnosis requires clinician assessment and integration of symptoms, serial cardiac troponin, ECG, imaging, angiography, and procedure context.

### Classification model

Use the current clinical grouping as the primary model:

- `PRIMARY`: acute coronary pathology (for example atherothrombosis, vasospasm, embolism, spontaneous coronary artery dissection, or late stent/graft failure).
- `SECONDARY`: oxygen supply–demand imbalance caused by another acute condition, with or without coronary disease.
- `PROCEDURE_RELATED`: events temporally and causally related to PCI or CABG.
- `UNRESOLVED`: insufficient, conflicting, or simulated evidence.
- `NON_ISCHAEMIC_INJURY`: injury pattern without simulated evidence of acute ischaemia; this is intentionally not an MI.

Retain legacy categories (`TYPE_1`, `TYPE_2`, `TYPE_3`, `TYPE_4A`, `TYPE_4B`, `TYPE_4C`, `TYPE_5`) as interoperability labels. Treat STEMI/NSTEMI, silent/recurrent presentation, MINOCA working diagnosis, anatomical territory, and severity as independent descriptors—not mutually exclusive MI types.

## Non-negotiable architecture rules

- Keep the dashboard shell (`App.tsx`) free of MI-specific branching and state.
- Define all shared contracts under `src/types/mi/`; never pass untyped case objects between features.
- Make evidence evaluation deterministic and pure. Services return explanations and evidence gaps; they do not return a diagnosis or therapy recommendation.
- Separate scenario data, classification rules, display configuration, and UI rendering. Any one may be exchanged without changing the others.
- Make every external data source adapter opt-in and disabled by default. The initial module uses local, de-identified simulation scenarios only.
- Keep the current regeneration/therapy simulation clearly separate from MI assessment. MI views must be read-only and must not activate dosing, pacing, or closed-loop controls.
- Lazy-load MI workspaces, visualizations, and overlays through the existing `DashboardWorkspace` / `DashboardOverlays` seams.

## Reuse-first design: build an assessment kernel, not an MI silo

MI must be the first **module configuration**, not the first hard-coded application. The reusable layer is condition-agnostic: it understands cases, time-stamped evidence, evidence states, provenance, confidence, uncertainty, and plugins. The MI layer supplies a taxonomy, fixture packs, evaluation rules, terminology, and domain-specific evidence renderers.

This makes the same foundation reusable for other research simulations such as myocarditis, heart failure decompensation, arrhythmia, pulmonary embolism, or post-procedure follow-up without copying the shell, timeline, tables, badges, missing-data behavior, scenario player, or audit presentation.

### Three explicit layers

| Layer | Owns | Must not own |
| --- | --- | --- |
| Assessment kernel | Generic evidence records, timelines, provenance, confidence, scenario playback, component slots, feature registration, and schema versioning | MI labels, troponin thresholds, ECG interpretation, disease-specific wording, or clinical rules |
| MI module | MI taxonomy, legacy mappings, simulated evidence evaluator, scenario packs, MI-specific charts, and display copy | Dashboard routing, generic modal lifecycle, common evidence table, or transport plumbing |
| Application composition | Persona availability, workspace navigation, feature flags, lazy imports, and top-level policy | Classification logic, scenario data mutation, or disease-specific JSX branches in `App.tsx` |

### Reusable contracts

Put generic contracts in `src/types/assessment/`; reserve `src/types/mi/` for MI-only extensions.

```ts
export type EvidenceState = 'PRESENT' | 'ABSENT' | 'INDETERMINATE' | 'NOT_OBSERVED';
export type AssessmentConfidence = 'SUPPORTED' | 'POSSIBLE' | 'INSUFFICIENT_EVIDENCE' | 'CONFLICTING_EVIDENCE';

export interface EvidenceRecord<TDomain extends string = string, TValue = unknown> {
  id: string;
  domain: TDomain;
  state: EvidenceState;
  observedAt: string;
  value?: TValue;
  summary: string;
  provenance: 'SIMULATED' | 'IMPORTED_RESEARCH_DATA';
  limitations: readonly string[];
}

export interface AssessmentResult<TCategory extends string = string> {
  category: TCategory;
  confidence: AssessmentConfidence;
  supportingEvidenceIds: readonly string[];
  conflictingEvidenceIds: readonly string[];
  evidenceGaps: readonly string[];
  disclaimer: 'SIMULATION_ONLY';
}

export interface AssessmentModule<TCase, TCategory extends string, TDomain extends string> {
  id: string;
  version: string;
  title: string;
  evaluate: (caseData: TCase) => AssessmentResult<TCategory>;
  getEvidence: (caseData: TCase) => readonly EvidenceRecord<TDomain>[];
  getTimeline: (caseData: TCase) => readonly AssessmentTimelineEvent<TDomain>[];
}
```

`MiScenarioCase`, `MiAssessment`, and `MiEvidenceItem` become narrow aliases/extensions of these generic types. The kernel has no clinical terminology and can be unit tested without any medical fixture.

### Reusable visual primitives

Build these under `src/components/assessment/`, then compose them in `src/components/mi/`:

- `AssessmentStatusBanner` — disclaimer, category label, confidence, and evidence-gap count.
- `EvidenceStateBadge` — consistent present/absent/unknown treatment, including accessible text.
- `EvidenceMatrix` — generic grouped evidence table with render slots per domain.
- `EvidenceTimeline` — ordered time series with filtering, range selection, and event disclosure.
- `EvidenceGapPanel` — missing/conflicting evidence and source limitations.
- `ProvenanceCallout` — source, simulation state, data limitations, and schema version.
- `ScenarioPlayer` — pure play/pause/seek/reset behavior driven by a timestamped event sequence.
- `CaseComparison` — generic two-column comparison using keyed panel slots.
- `AssessmentExportFrame` — consistent simulation watermark, metadata, and print layout.
- `PluginSlot` — lazy, error-isolated renderer boundary for extension panels.

MI wrappers provide only domain naming and specialized visualizations:

- `MiTroponinTrend` adapts a generic `QuantitativeTrendChart`.
- `MiEcgEvidencePanel` supplies the ECG renderer to `PluginSlot`.
- `MiImagingEvidencePanel` supplies imaging-specific findings to the generic evidence-detail shell.
- `MiClassificationPanel` maps generic result fields to MI taxonomy text.

No MI component may reimplement status badges, filtering, loading/empty/error states, focus handling, provenance, comparison layout, or scenario playback.

### Extension registration and composition

Use a single declarative registry. Adding a module must be configuration plus isolated files, not edits across the dashboard.

```ts
export interface AssessmentModuleDefinition<TCase, TCategory extends string, TDomain extends string> {
  module: AssessmentModule<TCase, TCategory, TDomain>;
  workspace: { id: string; label: string; description: string };
  scenarioPacks: readonly ScenarioPack<TCase>[];
  panels: readonly EvidenceRendererPlugin<TCase, TDomain>[];
  allowedPersonaCapabilities: readonly string[];
}

export const assessmentModuleRegistry = [miModuleDefinition] as const;
```

`DashboardWorkspace` receives an `AssessmentWorkspaceHost` once. The host resolves a registered definition and mounts its lazy workspace. It must not import `mi` directly. The MI definition becomes the first registry item; a future condition registers itself without changing the host.

### Plug-and-play acceptance criteria

A module is considered plug-and-play only if it can be added by:

1. Defining domain contracts and a module definition.
2. Providing a scenario pack and pure evaluator.
3. Registering optional domain-panel plugins.
4. Adding one declarative workspace/persona configuration entry.

It must require **zero edits** to `App.tsx`, shared assessment primitives, the scenario player, the generic comparison view, or another condition module. Any required change in those areas is a kernel capability gap and should be designed generically before it is implemented.

### Versioning and compatibility

- Every module, taxonomy, scenario pack, evaluator, and adapter declares an immutable semantic version.
- Every case records its `moduleId`, `taxonomyVersion`, `scenarioPackId`, and `schemaVersion`.
- The kernel validates a scenario before rendering it and places incompatible fixtures in a non-interactive error state.
- Migration functions are pure and version-to-version; never mutate persisted fixtures in place.
- Exported snapshots include all four version identifiers so a scenario can be reproduced.

## Target module layout

```text
src/
  types/assessment/
    evidence.ts             # condition-agnostic evidence, confidence and provenance contracts
    case.ts                 # generic scenario/timeline aggregate
    module.ts               # module, plugin and compatibility contracts
  types/mi/
    classification.ts       # taxonomy, descriptors, confidence and evidence contracts
    evidence.ts             # ECG, troponin, symptoms, imaging, angiography and procedure facts
    case.ts                 # immutable scenario/case aggregate and timeline events
    plugin.ts               # extension-point contracts
  config/mi/
    taxonomy.ts             # labels, descriptions, badges and display order
    featureRegistry.ts      # enabled panels and scenario packs; no clinical logic
  config/assessment/
    moduleRegistry.ts       # condition-module definitions and generic workspace metadata
  services/mi/
    evaluateEvidence.ts     # deterministic evidence matrix and evidence gaps
    classifyScenario.ts     # simulated classification candidate generator
    scenarioRepository.ts   # local scenario lookup and selection
    timelineService.ts      # ordered event construction and trend helpers
    adapters/               # future FHIR/DICOM/import adapters, disabled by default
  hooks/
    useMiCase.ts            # selected case, filters and derived evaluation state
    useMiScenario.ts        # simulation play/pause/seek lifecycle
  components/mi/
    MiStatusBanner.tsx
    MiCaseSummary.tsx
    MiEvidenceMatrix.tsx
    MiTimeline.tsx
    MiTroponinTrend.tsx
    MiEcgEvidencePanel.tsx
    MiImagingEvidencePanel.tsx
    MiCoronaryProcedurePanel.tsx
    MiClassificationPanel.tsx
    MiEvidenceGapPanel.tsx
    MiScenarioControls.tsx
    MiComparisonTable.tsx
    MiTerminologyPanel.tsx
  components/assessment/
    AssessmentStatusBanner.tsx
    EvidenceStateBadge.tsx
    EvidenceMatrix.tsx
    EvidenceTimeline.tsx
    EvidenceGapPanel.tsx
    ProvenanceCallout.tsx
    ScenarioPlayer.tsx
    CaseComparison.tsx
    PluginSlot.tsx
  features/assessment/
    AssessmentWorkspaceHost.tsx
  features/mi/
    MiSpectrumWorkspace.tsx
    MiCaseComparisonOverlay.tsx
    MiScenarioLabOverlay.tsx
  tests/
    miEvidence.test.ts
    miClassification.test.ts
    miScenarioRepository.test.ts
    miWorkspaceContracts.test.tsx
```

`src/components/assessment` contains condition-agnostic reusable presentation components. `src/components/mi` contains only MI adapters and specialized visualizations. `src/features/assessment` hosts registered modules, while `src/features/mi` owns MI composition only. Neither may reach directly into telemetry transport, hospital adapters, or therapy controls.

## Domain contracts

### Core types

Create discriminated unions rather than stringly typed properties.

```ts
export type MiClinicalGroup =
  | 'PRIMARY'
  | 'SECONDARY'
  | 'PROCEDURE_RELATED'
  | 'UNRESOLVED'
  | 'NON_ISCHAEMIC_INJURY';

export type MiLegacyType =
  | 'TYPE_1' | 'TYPE_2' | 'TYPE_3'
  | 'TYPE_4A' | 'TYPE_4B' | 'TYPE_4C' | 'TYPE_5';

export type MiPresentation = 'STEMI' | 'NSTEMI' | 'SILENT_OR_UNRECOGNIZED' | 'UNKNOWN';
export type MiEvidenceStatus = 'PRESENT' | 'ABSENT' | 'INDETERMINATE' | 'NOT_OBSERVED';
export type MiConfidence = 'SUPPORTED' | 'POSSIBLE' | 'INSUFFICIENT_EVIDENCE' | 'CONFLICTING_EVIDENCE';

export interface MiEvidenceItem {
  id: string;
  domain: 'SYMPTOMS' | 'TROPONIN' | 'ECG' | 'IMAGING' | 'ANGIOGRAPHY' | 'PROCEDURE' | 'CONTEXT';
  status: MiEvidenceStatus;
  observedAt: string;
  summary: string;
  provenance: 'SIMULATED' | 'IMPORTED_RESEARCH_DATA';
  limitations: string[];
}

export interface MiAssessment {
  clinicalGroup: MiClinicalGroup;
  legacyType?: MiLegacyType;
  presentation: MiPresentation;
  confidence: MiConfidence;
  supportingEvidenceIds: string[];
  conflictingEvidenceIds: string[];
  evidenceGaps: string[];
  disclaimer: 'SIMULATION_ONLY';
}
```

The case aggregate must be immutable at the service boundary: `MiScenarioCase` owns identifiers, synthetic demographics, event timeline, evidence items, provenance, and an expected simulation outcome. Never mix it into the current `PatientProfile`; create an adapter only where a visual component needs a small compatible projection.

### Evidence model

Define dedicated types for:

- serial troponin values with assay metadata, units, reference limit, and measurement time;
- ECG observations with lead coverage, interpretation label, onset time, and missing-lead state;
- symptoms and symptom absence, including timing and reliability;
- imaging findings (modality, new regional wall-motion/viability finding, territory, limitations);
- angiographic/coronary findings (thrombus, obstruction, dissection, embolism, vasospasm, or no obstructive finding);
- PCI/CABG procedure context, time from procedure, and complications;
- supply–demand context (for example anaemia, tachyarrhythmia, hypoxaemia, hypotension, hypertension, or sepsis) as **simulated context**, not causal proof.

All units must be explicit. A display formatter is responsible for locale formatting; classification services receive normalized values only.

## Plug-in model

Use typed registries so additional MI phenotypes, evidence renderers, scenario packs, or research adapters can be added without editing the workspace core.

```ts
export interface MiEvidenceRendererPlugin {
  id: string;
  domain: MiEvidenceItem['domain'];
  isAvailable: (caseData: MiScenarioCase) => boolean;
  render: React.ComponentType<{ caseData: MiScenarioCase; assessment: MiAssessment }>;
}

export interface MiScenarioPackPlugin {
  id: string;
  label: string;
  version: string;
  provenance: 'SIMULATED' | 'IMPORTED_RESEARCH_DATA';
  getCases: () => readonly MiScenarioCase[];
}

export interface MiRuleSetPlugin {
  id: string;
  taxonomyVersion: string;
  evaluate: (caseData: MiScenarioCase) => MiAssessment;
}
```

The initial registry is static and compile-time only. A future remote registry requires version pinning, schema validation, audit records, feature flags, integrity checks, and security review before it is enabled.

## Delivery stages

### Stage 0 — scope, terminology, and safety baseline

Deliverables:

- A terminology map linking primary/secondary/procedure-related grouping to legacy Type 1–5 labels.
- Simulation-only copy standards, disclaimer placement, and prohibited language list (`diagnosis`, `treatment recommendation`, `rule out`, and urgent-action language).
- A scenario content rubric requiring provenance, synthetic/de-identified status, evidence limitations, and expected learning objective.
- A decision record documenting that the module is not a clinical decision-support feature.

Exit criteria: clinical/content reviewers agree on taxonomy version, descriptor definitions, evidence labels, and safety language.

### Stage 1 — contracts and registry foundation

Deliverables:

- `src/types/mi/*` contracts and schema-level tests.
- Static taxonomy, rule-set, scenario-pack, and evidence-renderer registries.
- Empty `MiSpectrumWorkspace` behind a feature flag, with a clear simulation-only banner.
- A scenario repository interface with an in-memory implementation.

Exit criteria: TypeScript prevents invalid group/type pairings, missing provenance, untyped evidence, and plugins without IDs or versions.

### Stage 2 — deterministic evidence engine

Deliverables:

- `evaluateEvidence` to construct a domain-by-domain evidence matrix.
- `classifyScenario` to produce candidate simulated classifications, confidence, evidence gaps, and conflicts.
- No probabilistic scores, autonomous alerts, or treatment actions.
- Exhaustive table-driven unit tests for injury-only, unresolved, primary, secondary, and procedure-related patterns.

Exit criteria: every outcome has explainable evidence IDs and every absent/unknown signal remains distinguishable.

### Stage 3 — representative scenario pack

Create synthetic cases covering at minimum:

1. Primary MI with STEMI presentation and thrombotic coronary evidence.
2. Primary MI with NSTEMI presentation.
3. Secondary MI with supply–demand context and serial injury evidence.
4. Procedure-related PCI case, including legacy 4a context.
5. Procedure-related CABG case, including legacy 5 context.
6. Myocardial injury without ischaemic evidence.
7. Unresolved case with incomplete serial data.
8. MINOCA working-diagnosis case, deliberately labelled unresolved pending cause.
9. Silent/unrecognized simulated presentation.
10. Recurrent MI scenario with a prior-event timeline.

Each scenario must include a “why this is not enough” section so the UI teaches evidence limitations rather than false certainty.

Exit criteria: scenario fixtures validate against contracts and snapshot tests cover taxonomy labels, timeline ordering, and missing-data states.

### Stage 4 — reusable evidence components

Build independent, prop-driven components in this order:

1. `MiStatusBanner` — simulation disclaimer, group, confidence, and evidence-gap count.
2. `MiCaseSummary` — descriptors, context, and provenance.
3. `MiEvidenceMatrix` — compact all-domain status view.
4. `MiTimeline` and `MiTroponinTrend` — time-aware evidence exploration.
5. `MiEcgEvidencePanel`, `MiImagingEvidencePanel`, and `MiCoronaryProcedurePanel` — lazy-loaded detailed panels.
6. `MiClassificationPanel` and `MiEvidenceGapPanel` — explainability, not conclusion automation.

Exit criteria: components render from fixtures alone, have loading/error/empty states, and are accessible by keyboard and screen reader.

### Stage 5 — workspace composition and personas

Deliverables:

- Add `MI_SPECTRUM` to `WorkspaceId` metadata and compose `MiSpectrumWorkspace` in `DashboardWorkspace`.
- Grant initial read-only availability to attending cardiologist, imaging reviewer, research coordinator, and clinical auditor personas through the declarative persona registry.
- Keep therapy workspace controls isolated; the MI workspace can link to monitoring/review but cannot issue dose, pacing, or mode-change callbacks.
- Add optional comparison and scenario-lab overlays via `DashboardOverlays`.

Exit criteria: `App.tsx` receives no MI state fields; persona/workspace contract tests pass; unavailable roles are redirected by existing workspace policy.

### Stage 6 — simulation controls and comparison

Deliverables:

- Deterministic replay controls: play, pause, seek, speed, reset, and “reveal next evidence.”
- Side-by-side comparison of two scenarios using the same component tree and normalized time axis.
- Scenario filters by group, presentation, legacy label, evidence domain, and learning objective.
- Snapshot/export view labelled simulated and containing no personal health information.

Exit criteria: replay is deterministic from a scenario seed; no control mutates a source fixture; comparison is responsive and keyboard operable.

### Stage 7 — adapters and research-data ingestion (future, gated)

Deliverables:

- Adapter interfaces for FHIR observations, diagnostic reports, procedure records, and imaging metadata.
- Strict runtime validation and mapping reports that preserve original source/provenance.
- De-identification gate, consent/governance checklist, and an import quarantine state.
- No production EHR endpoints or PHI in browser state.

Exit criteria: synthetic fixtures remain the default. Any non-simulated import is blocked unless a separate approved backend, identity, audit, privacy, and security design exists.

### Stage 8 — quality, safety, and release readiness

Deliverables:

- Contract, unit, integration, accessibility, and visual regression tests.
- Content review for each scenario and terminology label.
- Threat model and privacy review for future adapters.
- Documentation for known limitations and a release checklist.

Exit criteria: all automated checks pass; reviewers confirm the UI does not imply diagnosis or treatment guidance; feature flag is enabled only for the intended demo/research audience.

## Integration map

| Existing seam | MI integration | Constraint |
| --- | --- | --- |
| `src/types` | Add `types/mi` contracts | No modifications to existing telemetry contracts in the first phase. |
| `src/services` | Pure evidence, classification, timeline, and repository services | No network I/O inside rules. |
| `src/hooks` | Case selection and simulation lifecycle | Do not share therapy control state. |
| `DashboardWorkspace` | One lazy MI workspace branch | It composes; it does not classify. |
| `DashboardOverlays` | Scenario lab and comparison overlays | Registered IDs plus lazy imports only. |
| `personaExperiences` | Read-only workspace capability metadata | Registry is not authorization. |
| `components/ui` | Shared tabs, disclosure, table, chart-shell primitives when broadly useful | Do not create MI-specific primitives here. |

## Test plan

### Unit tests

- Every taxonomy group and legacy label maps to valid display metadata.
- Evidence evaluator preserves `ABSENT`, `INDETERMINATE`, and `NOT_OBSERVED` distinctly.
- Classification outputs always include a simulation disclaimer and explanation references.
- Timeline ordering is stable for equal timestamps.
- Scenario repository returns immutable copies or readonly fixtures.

### Component and integration tests

- Every evidence panel renders present, absent, indeterminate, loading, and error states.
- The workspace does not render therapy actions or action-capable alerts.
- Changing persona availability changes navigation, not MI evaluation output.
- A scenario replay reset returns exactly to its seed state.
- Comparison renders two independent cases without state leakage.

### Manual QA

- Keyboard traversal, focus restoration for overlays, high contrast, and 320px through desktop layouts.
- Verify simulated/disclaimer labels are visible before assessment details and in exports.
- Check each scenario against its approved content rubric.
- Confirm no browser bundle includes credentials, EHR endpoints, or identifiable clinical data.

## Implementation order for the next coding pass

1. Add Stage 0 decision record and copy constants.
2. Add `types/mi` and static taxonomy registry with tests.
3. Build two minimal synthetic cases: primary MI and myocardial injury without MI.
4. Implement the pure evidence evaluator and classification explanation contract.
5. Create `MiStatusBanner`, `MiCaseSummary`, and `MiEvidenceMatrix` from fixtures.
6. Register the lazy, read-only `MI_SPECTRUM` workspace for the research coordinator only.
7. Add the remaining scenario pack and evidence-specific panels after the first vertical slice is reviewed.

This sequence gives a complete, safe vertical slice early while preserving the ability to add new clinical taxonomies, scenario packs, evidence modalities, or research adapters without rewriting the dashboard shell.
