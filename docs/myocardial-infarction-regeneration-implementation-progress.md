# Myocardial Infarction Representation and Regeneration Progress

## Purpose

This document tracks implementation of `docs/myocardial-infarction-regeneration-implementation-plan.md`. It records delivered behavior, validation evidence, open risks, and the next bounded slice. It does not replace the implementation plan or expand the research-only intended use.

**Started:** 2026-10-14

**Current stage:** Stage 6 automated and browser validation in progress; Stage 4 external review pending

**Overall status:** In progress

## Stage status

| Stage | Status | Outcome |
| --- | --- | --- |
| Stage 0 - terminology and immediate safety | Complete | Shared simulation boundaries are visible across MI assessment, regeneration, and schematic anatomy surfaces. Unsupported confidence and absolute outcome claims were removed. |
| Stage 1 - typed infarct phenotype foundation | Complete | Versioned contracts, validation, pure legacy migration, embedded cohort phenotypes, migration reports, and persona-neutral summary derivation are available. |
| Stage 2 - scenario and coverage expansion | Engineering complete; review pending | Representative anatomy, chamber, depth, phase, MVO, and hemorrhage fixtures are implemented and remain partial until expert review. |
| Stage 3 - regeneration applicability boundary | Complete | A versioned illustrative model, phenotype-only adapter, pure applicability evaluator, guarded engine, unavailable UI, and suppression tests are implemented. |
| Stage 4 - segment-aware visualization | Engineering prepared; review blocked | Scene contracts, extracted geometry, mapping, validation, and a synchronized review artifact are implemented. The complete LV/RV strategy remains disabled pending clinical/imaging review. |
| Stage 5 - persona integration | Engineering complete | Every persona receives a compact read-only summary in its default workspace; facts, detail, provenance, MI exploration, regeneration viewing, and what-if controls are independently capability-governed. Human comprehension validation remains in Stage 6. |
| Stage 6 - validation and governance | In progress | Automated contracts, the compact-summary viewport matrix, and unavailable-projection dialog keyboard/browser checks pass. Full workspace/overlay, eligible-projection browser, assistive-technology, representative-user, and expert-review evidence remain. |

## Completed work

### Stage 0 - reusable safety boundary

Added a domain-neutral simulation disclosure pattern:

- `src/config/simulationBoundary.ts`
  - Defines assessment, regeneration, and schematic-anatomy disclosure strategies.
  - Keeps approved copy out of feature components.
  - Provides one typed extension point for future simulation domains.
- `src/components/ui/SimulationBoundaryNotice.tsx`
  - Renders the configured disclosure with accessible landmark labeling.
  - Supports standard and compact composition without duplicating content.
- `tests/componentStructure.test.tsx`
  - Verifies domain-specific copy and compact rendering behavior.

Integrated the shared notice into:

- `src/components/mi/MiSpectrumWorkspace.tsx`
- `src/components/RegenerativePredictionModal.tsx`
- `src/components/DigitalTwinRemodeling.tsx`
- `src/components/FullScreenHeartVisualizer.tsx`

Corrected user-facing scope:

- Renamed the workspace display label from "Full MI spectrum" to "MI classification spectrum."
- Renamed the regeneration feature to an illustrative sensitivity simulator.
- Replaced forecast language with simulation language.
- Removed the fixed model-confidence percentage.
- Replaced Bayesian credible-interval labels with deterministic sensitivity-range labels.
- Removed cure, guaranteed protection, and zero-arrhythmia claims.
- Replaced physician guidance with a model narrative.
- Marked the current parameter set as synthetic and not clinically validated.

Corrected the regeneration output contract:

- Sensitivity fields now describe what the implementation computes.
- `clinicalInterpretation` became `simulationInterpretation`.
- `modelConfidenceScore` was removed.
- The calculation itself was intentionally left unchanged during this safety slice.

### Stage 1 - contract foundation delivered so far

Added `src/types/mi/infarctPhenotype.ts`:

- Immutable schema version identifier.
- Discriminated LV and RV region references.
- Explicit unknown and not-assessed states.
- Separate ventricular involvement, phase, depth, wall motion, coronary territory, culprit status, imaging findings, and viability fields.
- Segment-level extent, wall thickness, motion, and source evidence.
- Provenance source types for authored simulation, source imaging, imported research data, and legacy inference.
- A stable myocardial-region key helper.

Added `src/types/mi/regeneration.ts`:

- Model mode and applicability status contracts.
- Versioned model descriptor and parameter-source metadata.
- Validation-summary boundary for future evidence-backed research models.
- Generic model input, output series, sensitivity range, assumptions, omissions, and simulation disclaimer contracts.

Added `src/services/mi/validateInfarctPhenotype.ts`:

- Pure, side-effect-free structural validation.
- Accumulates typed issues rather than throwing on the first error.
- Validates schema version, ranges, duplicate sources, duplicate regions, provenance references, contradictory absent-scar depth, and missing known anatomy.
- Preserves an empty unknown-anatomy phenotype as valid instead of fabricating defaults.

Added `tests/infarctPhenotypeContracts.test.ts`:

- Valid sourced phenotype case.
- Multi-error accumulation case.
- Unknown-anatomy case with no fabricated segment values.

### Stage 1 - migration and summary completion

Added `src/config/mi/legacyInfarctMappings.ts`:

- Exact-match registry for the three existing synthetic location labels.
- Region and depth mappings remain configuration, not parser logic.
- Every mapping carries a review limitation.
- Unregistered strings receive no guessed anatomy.

Added `src/services/mi/migrateLegacyPatientInfarct.ts`:

- Pure migration from legacy patient fields to phenotype version 1.
- Machine-readable `COPIED`, `INFERRED`, and `UNRESOLVED` report entries.
- `INFERRED_LEGACY` provenance on every migrated phenotype.
- Phase and culprit vessel remain unresolved rather than derived from display data.
- Apical thickness is copied only for the exact antero-apical mapping and is withheld from inferolateral, posterior, and unknown regions.
- Every generated phenotype is structurally validated before the report is returned.

Added `src/config/mi/anatomy.ts`, `src/types/mi/infarctSummary.ts`, and `src/services/mi/deriveInfarctSummary.ts`:

- One centralized anatomical label registry.
- One persona-neutral summary contract for location, timing, morphology, extent, limitations, and source state.
- Source states distinguish sourced data, authored simulation, legacy inference, and unknown facts.
- Unknown facts render explicit labels instead of display defaults.

Extracted `src/config/patientCohorts.ts` from `telemetryStreamService`:

- Domain tests can import synthetic fixtures without starting the browser telemetry singleton.
- `telemetryStreamService` re-exports the fixture for compatibility.
- Cohort arrays and Header consumers now use read-only contracts.
- All three cohorts carry a migrated phenotype alongside their legacy fields.

Added focused migration and summary suites:

- `tests/infarctPhenotypeMigration.test.ts`
- `tests/infarctSummary.test.ts`

### Stage 2 - event sequence and coverage boundary

Separated event sequence from presentation:

- `MiScenarioCase.eventSequence` records index, recurrent, or unknown sequence independently.
- Scenario filtering now composes event sequence with assessment group, presentation, evidence domain, and search text.
- The silent recurrent fixture is explicitly recurrent; all current index fixtures retain their prior presentation and ordering.

Added `src/types/mi/coverage.ts`, `src/config/mi/coverageManifest.ts`, and `src/services/mi/validateMiCoverageManifest.ts`:

- The mapped-union manifest keeps each dimension paired with its valid value type.
- Claims distinguish `REPRESENTED`, `PARTIAL`, and `UNSUPPORTED` coverage.
- Classification groups, legacy Types 1-5, presentations, and current event sequences are represented by structured scenario facts.
- Anterior and inferior territory remain partial because they exist only as text descriptors.
- Other territory, ventricular involvement, depth, and phase claims are explicitly unsupported.
- Validation rejects duplicate claims, invalid status/fixture combinations, missing scenarios, undeclared packs, structured fact mismatches, and unclaimed scenarios.
- Negative tests prove a scenario cannot be relabeled recurrent through the manifest when its structured fixture says index event.

### Stage 2 - versioned scenario-pack governance

Added `src/types/mi/scenarioPack.ts` and `src/config/mi/scenarioPacks.ts`:

- Three packs group primary presentations, context boundaries, and procedure-related learning objectives.
- Each pack declares a stable ID, semantic version, taxonomy version, phenotype schema version, content owner, review state, and limitations.
- Every existing scenario ID has exactly one pack owner while public scenario ordering and selectors remain compatible.
- Scenario construction resolves pack metadata from the registry rather than duplicating ownership fields in each fixture.
- The assessment module and coverage manifest declare the new versioned pack IDs.
- All packs remain `REQUIRES_CLINICAL_REVIEW`; no review date or approval is fabricated.

Added `src/services/mi/validateMiScenarioPacks.ts` and `tests/miScenarioPacks.test.ts`:

- Validation detects duplicate pack IDs, duplicate scenario ownership, missing or unowned scenarios, metadata mismatches, and incomplete review records.
- A `REVIEWED` pack must carry a review date.
- Negative tests verify duplicate ownership and incomplete governance metadata are rejected.

### Stage 2 - authored scenario phenotypes and review gate

Added `src/types/mi/scenarioPhenotype.ts` and `src/config/mi/scenarioPhenotypes.ts`:

- Scenarios can optionally reference a versioned phenotype without making anatomy mandatory for classification-only objectives.
- The primary STEMI and NSTEMI scenarios reference authored anterior and inferior LV fixtures.
- Fixtures use `AUTHORED_SIMULATION` provenance and explicitly state that they are not derived from a patient study.
- Depth, extent, culprit vessel, measurements, viability, MVO, hemorrhage, and edema are not fabricated.
- Both fixtures remain `REQUIRES_CLINICAL_REVIEW` and carry review limitations.

Added `src/services/mi/validateMiScenarioPhenotypes.ts` and `tests/miScenarioPhenotypes.test.ts`:

- Validation rejects duplicate or missing fixture IDs, orphan fixtures, invalid phenotype structures, schema drift, non-authored provenance, and incomplete review metadata.
- Coverage validation now resolves structured phenotype territory instead of trusting display descriptors.
- Partial anatomy claims must match the referenced phenotype.
- Anatomy cannot move to `REPRESENTED` until both scenario and phenotype review states are `REVIEWED`.
- Negative tests cover missing references, invalid provenance, territory mismatch, and attempted unreviewed promotion.

### Stage 2 - shared scenario limitations

Added `src/config/mi/scenarioLimitations.ts` and `MiScenarioCase.limitations`:

- Every scenario receives structured `whyInsufficient` and `unsupportedUses` content through the shared scenario factory.
- Pack review limitations flow into each scenario without duplicating policy text across fixtures.
- Scenarios with authored phenotypes explicitly state that anatomy is schematic; scenarios without phenotypes explicitly state that no structured anatomy is asserted.
- Unsupported uses prohibit real-patient diagnosis, exclusion, classification, treatment selection, prognosis, and population inference.

Added `src/components/mi/MiScenarioLimitations.tsx` and reused the same contract in scenario export:

- The selected scenario shows an accessible "Why this simulation is not enough" section.
- Review state is visible in plain language for all personas.
- Text exports contain the same limitations and unsupported uses as the workspace.
- Contract and server-render tests require non-empty limitations and verify visible review-state language.

### Stage 2 - persona-readable coverage boundary

Added `src/config/mi/coverageLabels.ts` and `src/services/mi/deriveMiCoverageDisplay.ts`:

- Human-readable labels cover every manifest dimension and value without changing the machine-readable contract.
- A pure view model preserves every claim, status, note, and scenario count from the manifest.
- Represented, partial, and unsupported claims remain distinct and testable.

Added `src/components/mi/MiCoverageBoundary.tsx` to the MI workspace:

- All personas see represented, partial, and unsupported totals near terminology and provenance context.
- Expandable detail lists every coverage value by dimension, including unsupported anatomy, chamber, depth, and phase combinations.
- Copy explicitly distinguishes authored simulation coverage from diagnostic completeness or clinical validation.
- Server-render and derivation tests verify plain-language labels and unsupported values remain visible.

### Stage 2 - representative anatomy and morphology pack

Extracted `src/services/mi/scenarios/scenarioFactory.ts` and added `representativeAnatomyScenarios.ts`:

- Existing scenario construction behavior remains centralized and compatible.
- A separate `mi-representative-anatomy-v1` pack owns three bounded learning cases.
- Acute septal plus RV involvement covers biventricular anatomy, subendocardial depth, MVO, and intramyocardial hemorrhage.
- Subacute lateral involvement covers mixed depth and explicitly absent selected complications.
- Chronic posterior scar covers transmural depth while leaving original event sequence and mechanism unresolved.
- Every new case carries structured limitations and remains `REQUIRES_CLINICAL_REVIEW`.

Expanded `scenarioPhenotypes.ts` and the coverage manifest:

- Territory now includes partial anterior, inferior, septal, lateral, and posterior fixtures.
- Ventricular involvement includes partial LV and biventricular fixtures; isolated RV remains unsupported.
- Subendocardial, transmural, mixed, and explicitly not-established depth states are partial.
- Acute, subacute, and chronic phases are partial; unknown phase remains unsupported.
- MVO and intramyocardial hemorrhage are typed manifest dimensions with present, absent, not-assessed, and unsupported indeterminate states.
- All anatomy and morphology claims remain blocked from `REPRESENTED` status until expert review is recorded.

### Stage 3 - regeneration applicability foundation

Added a versioned illustrative model boundary:

- `src/config/mi/regenerationModels.ts` registers the current fixed-parameter sensitivity model as `ILLUSTRATIVE` with explicit supported phase, chamber, depth, measurement, and provenance requirements.
- `src/services/mi/adaptPatientToRegenerationInput.ts` adapts structured phenotype and explicit measurements without reading legacy location text or fabricating defaults.
- `src/services/mi/evaluateRegenerationApplicability.ts` returns structured applicability, missing inputs, unsupported reasons, and omitted factors before projection execution.
- Only `SUPPORTED_SIMULATION` is executable; partial, out-of-scope, and insufficient-input states are suppressed.

Added `tests/regenerationApplicability.test.ts`:

- Missing phenotype and unresolved legacy facts cannot receive generic regeneration defaults.
- Acute phase and biventricular involvement remain explicitly out of scope.
- Invalid measurements and legacy-inferred provenance remain suppressed.
- A complete authored subacute LV fixture is eligible only for an illustrative simulation.

Completed guarded runtime and UI integration:

- `src/services/mi/runRegenerationProjection.ts` owns adaptation, applicability evaluation, and conditional engine execution behind one stable result contract.
- The legacy calculator is invoked only for `SUPPORTED_SIMULATION`; injectable calculator tests verify zero calls for unsupported cases.
- Silent nominal fallbacks for missing infusion and pacing values were removed from `regenerativePredictionEngine.ts`.
- `RegenerativePredictionModal.tsx` consumes only the guarded result and hides controls, KPIs, charts, assumptions, and model narrative when no projection exists.
- The unavailable state explains reasons, missing information, omitted factors, model ID, model version, mode, and applicability status in shared plain language.
- Server-rendered UI coverage verifies unsupported patients cannot see projection controls or values.

### Stage 4 - review-safe scar scene boundary

Added `src/types/mi/scarScene.ts` and `src/services/mi/deriveScarScene.ts`:

- Renderer-neutral `SUPPORTED`, `UNKNOWN`, and `UNAVAILABLE` scene states are distinct from Three.js implementation details.
- Missing or unresolved anatomy yields an explicit schematic fallback without fabricated regions.
- Invalid phenotypes and fixtures without recorded `REVIEWED` metadata cannot drive scar placement.
- Only valid, reviewed phenotypes expose structured myocardial regions to a future geometry strategy.

Hardened the existing `Real3DHeartCanvas.tsx` fallback:

- Fixed apical geometry no longer consumes patient scar area or apical thickness.
- Tooltip, anatomy readout, and legend identify the scar as a generic schematic example rather than patient-specific anatomy.
- The fallback remains visible for orientation while segment-aware geometry stays blocked by review.

Added `tests/scarSceneContracts.test.ts`:

- Unknown anatomy remains an empty schematic fallback.
- Every current unreviewed phenotype is blocked from anatomy-driven rendering.
- A valid fixture becomes scene-eligible only when explicit completed-review metadata is supplied in the test boundary.

Completed non-activating geometry preparation:

- `src/features/imaging/anatomy/heartSurfaceGeometry.ts` owns the existing heart-surface coordinate and mesh-buffer algorithms outside React.
- `Real3DHeartCanvas.tsx` consumes the extracted builders without activating segment-driven scar placement.
- `src/features/imaging/anatomy/segmentSurfaceStrategy.ts` defines a versioned candidate for all 17 AHA LV segments and three schematic RV regions.
- The candidate is `REQUIRES_CLINICAL_REVIEW`, explicitly disabled, and activates only when both enablement and recorded completed review are present.
- Normalized placements project through the same surface function as the renderer, preserving one coordinate system.
- Focused tests cover deterministic mesh integrity, complete region ownership, finite and bounded coordinates, uniqueness, and the two-key activation gate.

Completed pure phenotype-to-surface mapping:

- `ScarSceneRegion` now preserves source-evidence IDs through the visualization boundary.
- `src/features/imaging/anatomy/mapPhenotypeToSurface.ts` combines only a supported scar scene and an active reviewed strategy.
- Mapping returns runtime-frozen plain descriptors for region key, center, depth, extent, preferred camera, and provenance without constructing Three.js meshes.
- Border-zone descriptors derive one-to-one from the same mapped regions and centers, preventing placement drift.
- Regions are sorted deterministically; a disabled strategy, unsupported scene, or any missing placement fails closed with no partial descriptors.
- Focused tests cover multi-region facts, provenance, immutable output, deterministic ordering, disabled fallback, and missing-placement reporting.

Completed the Stage 4 review package:

- The strategy contract now has an explicit schema version and one exported source of truth for all supported LV/RV regions.
- `validateSegmentSurfaceStrategy.ts` accumulates schema, metadata, review, activation, ownership, coordinate, and camera issues.
- The current disabled review-pending candidate validates cleanly; malformed strategies report all applicable issue categories in one pass.
- `deriveSegmentSurfaceReview.ts` generates a deterministic table with centralized human-readable anatomy labels.
- `docs/mi-segment-surface-strategy-review.md` lists all 20 candidate placements, limitations, acceptance criteria, and prohibited assumptions.
- An exact-file test prevents the reviewer artifact from drifting from the versioned strategy configuration.

### Stage 5 - capability-driven infarct summary

Added `src/services/mi/deriveInfarctSummaryPresentation.ts`:

- The adapter accepts only the persona-neutral `InfarctSummary` and presentation capabilities; it does not branch on persona names.
- Every mode retains the same location, timing, morphology, and extent fact objects.
- Segment-detail capability changes ordering and location detail visibility without deriving or rewriting facts.
- Provenance capability controls source-reference visibility independently from anatomy detail.

Added `src/components/mi/InfarctSummaryPanel.tsx` and integrated it through the generic assessment module boundary:

- `AssessmentWorkspaceHost` passes presentation capabilities into registered modules without importing condition-specific behavior.
- `MiSpectrumWorkspace` resolves only explicit `phenotypeId` references and calls `deriveInfarctSummary` as the sole factual derivation service.
- Classification-only scenarios show an explicit no-structured-phenotype state and prohibit inference from titles or free text.
- All enabled views show source state, known limitations, review state, and explicit unknown timing or extent in plain language.
- Segment labels and source identifiers remain independently capability-gated.

Added `VIEW_MI_SEGMENT_DETAIL` and `VIEW_MI_PROVENANCE` presentation capabilities:

- Attending and imaging experiences receive structured segment detail.
- Imaging and research experiences receive source-reference detail.
- The HTTP persona provider continues to filter against the shared capability vocabulary; these capabilities do not replace server authorization.

Added cross-persona and server-rendered tests:

- Every capability combination preserves identical underlying fact objects and explicit unknowns.
- General presentation withholds segment labels and source identifiers.
- Detail presentation exposes only the corresponding structured supporting data.
- Missing phenotype rendering remains accessible and does not fabricate anatomy.

Completed compact default-workspace integration:

- Added `VIEW_INFARCT_SUMMARY` and one declarative `INFARCT_SUMMARY` extension placement in every persona's default workspace.
- `PatientInfarctSummaryPanel.tsx` reuses the shared summary panel and active patient context without granting MI scenario exploration.
- `resolvePatientInfarctSummary.ts` prefers a valid structured phenotype, uses only the exact legacy migration boundary when structured data is absent, and fails closed when structured data is invalid.
- Bedside presentation remains read-only, contains no therapy or outcome controls, and withholds segment and source-reference detail.
- Engineering, audit, research, and integration experiences receive provenance detail through `VIEW_MI_PROVENANCE` without receiving different source facts.
- Tests require exactly one default-workspace placement per persona and prove that only attending, imaging, and research personas retain MI scenario exploration.

Separated regeneration presentation capabilities:

- `VIEW_REGENERATION_SIMULATION` controls header and review-workspace triggers and is rechecked before the lazy overlay mounts.
- `RUN_REGENERATION_WHAT_IF` independently controls infusion and pacing sensitivity sliders; viewing a supported projection no longer implies permission to alter model inputs.
- Attending and research experiences may view eligible illustrative output; only the research experience receives what-if controls.
- Unauthorized review workspaces omit projection triggers, and changing to a persona without view capability removes an already-requested projection overlay.
- Tests prove viewer-only output contains no range controls and unsupported patients remain suppressed regardless of presentation capability.

### Stage 6 - initial browser and comprehension validation

Completed compact-summary browser checks at 320, 375, 390, 768, 1024, and 1440 px:

- Compact summary bounds remained within the viewport with no document-level or visible-element horizontal overflow.
- No duplicate IDs were present on the inspected route.
- Segment labels, source states, and long limitations wrapped without overlap down to 320 px.
- Keyboard traversal showed a visible 3 px focus outline; reduced-motion emulation preserved content and layout.
- Live ICU and Research role transitions confirmed detail suppression, provenance visibility, read-only summary behavior, and default-workspace routing.

Corrected one accessibility defect found during keyboard validation:

- The trend methodology icon-only button now has an accessible name, `aria-expanded`, and an `aria-controls` relationship.
- A server-rendered regression test protects the disclosure semantics.

Corrected two responsive defects found during the viewport matrix:

- Footer metadata now wraps at 320 px instead of increasing the document width by 8 px.
- The header retains its compact composition from 1024 through 1279 px instead of squeezing the patient selector to 24 px.
- Retesting reports exact document width and no visible overflow at every compact-summary matrix width.

Completed unavailable-projection dialog accessibility validation:

- `RegenerativePredictionModal` now uses the shared `ModalShell` instead of duplicating an unlabeled overlay frame.
- The dialog has a resolvable accessible title, `aria-modal`, a labelled close control, viewport-safe scrolling, and no duplicate nested scroll container.
- The shared shell now keeps its focus and keyboard lifecycle stable when live telemetry rerenders its parent, and initial focus no longer depends on animation-frame scheduling.
- Browser checks confirmed initial focus on the close control, forward and reverse focus wrapping, Escape close, and restoration to the invoking Projection control.
- At 320 x 700 px, the dialog remained within 8 px side margins, reported zero internal horizontal overflow, and retained a vertically scrollable body.
- The active patient correctly displayed the unavailable state, missing structured inputs, model identifier, version, and `INSUFFICIENT_INPUTS` status without exposing projection or what-if controls.
- Eligible viewer-only and what-if-enabled states remain covered by server-rendered contracts; eligible-state browser execution remains open because the active browser cohort is ineligible.

Expanded `docs/persona-validation-protocol.md`:

- Every persona receives the same MI comprehension questions for location, timing, morphology, extent, source state, unknown facts, limitations, and simulation boundaries.
- Role-specific checks cover bedside detail suppression, imaging/research provenance, projection viewing, what-if controls, and the distinction between compact summary and MI exploration access.
- The protocol remains explicitly unexecuted; no representative-user comprehension result is claimed.

## Architecture decisions

| Decision | Reason | Consequence |
| --- | --- | --- |
| Configuration strategy for simulation disclosures | Copy and domain policy should not be repeated across large feature components. | New simulation domains register content once and reuse one UI component. |
| Discriminated myocardial region references | A free-form location string cannot safely drive rendering or model behavior. | LV and RV region schemes remain explicit and independently extensible. |
| Explicit unknown states | Missing clinical or research data must not become a plausible-looking default. | Consumers must handle unknown and not-assessed states deliberately. |
| Provenance IDs on segment findings | Anatomy without a source can imply unsupported patient specificity. | Validation can reject dangling evidence references before rendering. |
| Accumulating validator | Importers and fixture authors need a complete correction report. | Adapters can quarantine invalid data without exception-driven control flow. |
| Separate model descriptor and projection | Model metadata changes more slowly than an individual run. | Future model plugins can share applicability and projection contracts. |
| Review-gated renderer input | Structured anatomy is not equivalent to approved visual placement. | Only valid phenotypes with recorded completed review can expose regions to a geometry strategy. |
| Separate review and enablement gates | Review approval and runtime rollout are different decisions. | A reviewed candidate remains inactive until it is also explicitly enabled. |
| Atomic surface mapping | Partially mapped scar could look complete and misrepresent anatomy. | Any missing region rejects the entire mapping; no partial scar or border descriptors are emitted. |
| Generated review artifact | Hand-maintained coordinates and review documentation can drift. | Tests require the committed reviewer table and strategy configuration to match exactly. |
| Pure fixture configuration | Importing telemetry fixtures previously started a browser-only singleton and broke Node tests. | Domain services and tests can consume cohort data without browser side effects. |
| Exact legacy mapping registry | Free-text anatomical parsing would create silent and unreviewable inferences. | Only registered labels map to regions; every other label remains unknown. |
| Persona-neutral summary view model | Persona components must not derive or reinterpret clinical-style facts independently. | Future persona modes can change emphasis while preserving identical source facts. |
| Capability-driven summary adapter | Persona names are not an authorization or presentation policy boundary. | Fact order, segment detail, and provenance visibility derive from explicit capabilities while the source facts remain unchanged. |
| Fail-closed patient summary resolution | Invalid structured data must not be concealed by a plausible legacy fallback. | Structured phenotype validation failure produces an unavailable summary; exact legacy migration runs only when structured data is absent. |
| Separate regeneration view and what-if capabilities | Inspecting model output and changing model inputs are distinct presentation permissions. | Triggers, overlay mounting, and sensitivity controls enforce separate capabilities at multiple UI boundaries. |
| Executable coverage manifest | Broad product labels are not sufficient evidence that a dimension is represented. | Coverage claims are machine-checked against structured fixtures and unsupported dimensions remain visible. |
| Recurrence independent from presentation | Silent presentation and recurrent-event sequence describe different axes. | Filters and future summaries can compose both without overloading presentation labels. |
| Declarative scenario-pack registry | Fixture ownership, versioning, and review state must be inspectable without parsing scenario content. | New packs can be registered independently while validators enforce complete and unique ownership. |
| Optional scenario phenotype reference | Classification scenarios should not require anatomy when anatomy is outside the learning objective. | Anatomy-focused fixtures gain structured, validated references without inventing anatomy for every scenario. |
| Review-gated anatomy coverage | Implemented structure is not equivalent to expert-approved clinical content. | Authored anatomy remains partial until scenario and phenotype reviews are recorded. |
| Shared limitation contract | Safety limitations must remain consistent across personas, workspace views, and exports. | Pack policy generates scenario facts once; UI and export surfaces consume the same immutable content. |
| Manifest-derived coverage UI | Product claims and displayed scope must not drift apart. | The workspace derives its coverage boundary directly from the validated manifest. |
| Sparse representative phenotype pack | A Cartesian product would be unreviewable and misleading. | Three bounded fixtures exercise planned dimensions while unsupported combinations remain explicit. |
| Shared scenario factory | Pack extraction must not duplicate evidence, timeline, provenance, or limitation policy. | New physical pack modules reuse one typed construction boundary. |

## Requirement traceability

| Requirement | Status | Evidence |
| --- | --- | --- |
| MI-REP-001 - separate classification, presentation, event sequence, and anatomy | Implemented at contract level | Phenotype is separate from classification; event sequence is a distinct scenario field and filter. |
| MI-REP-002 - structured anatomy and explicit unknown states | Engineering complete; review pending | Representative territory, chamber, depth, phase, and complication fixtures exist; unsupported combinations remain explicit. |
| MI-REP-003 - source or inferred marker for phenotype facts | Implemented for current cohorts | Segment findings reference `INFERRED_LEGACY` provenance and migration reports. |
| MI-REP-004 - do not infer depth, territory, or culprit from presentation | Implemented at contract level | Independent fields with no derivation service. |
| MI-REG-001 - output carries model and parameter versions | Implemented | The guarded result always returns the versioned model descriptor and parameter-source metadata. |
| MI-REG-002 - unsupported inputs suppress projection | Implemented | Only `SUPPORTED_SIMULATION` invokes the calculator; all other states omit projection output and controls. |
| MI-REG-003 - no clinical-confidence language for illustrative model | Implemented in current UI | Unsafe fields and labels removed. |
| MI-REG-004 - uncertainty label matches method | Implemented for current UI | Deterministic values are labeled sensitivity bounds. |
| MI-VIS-001 - phenotype-driven scar placement | Mapping complete; rendering review blocked | Reviewed phenotype regions map deterministically to immutable scar and border descriptors; Three.js activation remains blocked. |
| MI-VIS-002 - explicit unknown anatomy rendering | Partial | Unknown and unavailable scene states exist, and the current fallback is explicitly generic rather than patient-specific. |
| MI-PER-001 - consistent summary for enabled personas | Engineering implemented | Every persona receives the shared compact panel in its default workspace; human comprehension testing remains. |
| MI-PER-002 - persona modes preserve source facts | Implemented for summary presentation | Cross-persona tests require every adapter output to retain the same four fact objects and unknown states. |
| MI-PER-003 - capabilities govern detail and controls | Implemented at presentation layer | Summary, segment detail, provenance, MI exploration, projection viewing, and what-if controls use explicit capabilities. Server authorization remains authoritative. |
| MI-VAL-001 - approved coverage manifest | Partial | Typed manifest and automated validation are implemented; expert approval and reviewed fixtures remain. |
| MI-VAL-002 - recorded expert review | Foundation only | Review contracts and validation exist; every current pack explicitly requires clinical review. |

## Validation evidence

Validated on 2026-10-14:

- `npm run lint` - passed.
- `npm test` - passed: 83 tests, 0 failures.
- `npm run build` - passed.
- Targeted unsafe-terminology search - no remaining matches for removed confidence, Bayesian, cure, guaranteed-protection, or old workspace-title phrases in `src/`.
- Focused phenotype contract suite - passed: 3 tests, 0 failures.
- Focused phenotype migration suite - passed: 3 tests, 0 failures.
- Focused infarct summary suite - passed: 3 tests, 0 failures.
- Focused shared-component suite - passed: 8 tests, 0 failures.
- Focused coverage-display suite - passed: 2 tests, 0 failures.
- Focused scenario filter and contract suite - passed: 4 tests, 0 failures.
- Focused coverage-manifest suite - passed: 5 tests, 0 failures.
- Focused scenario-pack governance suite - passed: 2 tests, 0 failures.
- Focused scenario-phenotype suite - passed: 4 tests, 0 failures.
- Focused regeneration-applicability suite - passed: 5 tests, 0 failures.
- Focused guarded-projection suite - passed: 2 tests, 0 failures.
- Focused regeneration-modal applicability suite - passed: 3 tests, 0 failures, including dialog semantics, unsupported suppression, viewer-only output, and what-if controls.
- Focused scar-scene contract suite - passed: 3 tests, 0 failures.
- Focused heart-surface geometry suite - passed: 2 tests, 0 failures.
- Focused segment-surface strategy suite - passed: 4 tests, 0 failures.
- Focused phenotype-to-surface mapping suite - passed: 3 tests, 0 failures.
- Focused segment-surface review suite - passed: 2 tests, 0 failures.
- Focused infarct-summary presentation suite - passed: 3 tests, 0 failures.
- Focused infarct-summary panel suite - passed: 3 tests, 0 failures.
- Focused patient-summary resolver suite - passed: 3 tests, 0 failures.
- Focused patient-summary panel suite - passed: 3 tests, 0 failures.
- Focused configured-persona fact-preservation and placement checks - passed.
- Focused regeneration capability-separation checks - passed for hidden triggers, viewer-only output, and what-if-enabled output.
- Initial browser validation - passed at 320, 375, 390, 768, 1024, and 1440 px for summary overflow and wrapping; duplicate IDs, role transitions, reduced motion, visible keyboard focus, and unavailable-projection dialog focus lifecycle also passed on sampled routes.
- Post-extraction desktop visual check - generic schematic label visible; composited canvas crop nonblank with 24,794 colored samples out of 50,463.
- Post-extraction mobile visual check - rendered heart and wrapped generic-scar legend visible; canvas nonblank with 5,568 colored samples out of 30,240.
- `git diff --check` - passed.

Editor-only Tailwind suggestions remain in pre-existing long components. They are not TypeScript failures and were not changed because they are unrelated to this slice.

## Performance baseline

The production build preserves lazy feature chunks. The new shared notice builds as a small independent chunk of approximately 1.24 kB uncompressed / 0.73 kB gzip.

The build continues to warn that `Real3DHeartCanvas` is approximately 572.85 kB uncompressed / 145.97 kB gzip. Extraction preserved lazy loading but did not materially reduce the Three.js feature chunk, which remains a tracked blocker for the "super performing" goal.

Fifty deterministic mesh constructions averaged 2.52 ms in the local Node benchmark. This is an engineering baseline only, not a browser frame-time or low-end-device guarantee.

Planned performance work before Stage 4 completion:

1. Measure parse, initialization, first-render, and interaction cost before refactoring.
2. Extract static anatomy definitions and pure geometry builders from the React component.
3. Keep Three.js and renderer code behind the existing lazy imaging boundary.
4. Avoid rebuilding scene objects when only controls or telemetry change.
5. Evaluate manual chunking only after dependency analysis; do not split code solely to silence the warning.
6. Add desktop/mobile canvas-pixel and frame-time checks for supported scenes.

## Open risks

1. The fallback scar remains fixed and apical, but it is now constant generic geometry and no longer claims to represent the selected patient's scar measurements or location.
2. The regeneration equations remain illustrative and use fixed synthetic parameters, though their execution is now constrained to the descriptor's explicit scope.
3. `PatientProfile` still exposes free-form `infarctLocation`, misspelled `postInfarcDay`, and apical-only scar thickness during compatibility migration.
4. Current segment mappings are explicitly inferred and require clinical/imaging content review before they can be treated as approved fixtures.
5. All authored scenario phenotypes remain unreviewed and therefore partial coverage only.
6. Some mechanistic labels elsewhere in the dashboard may still imply biological observation; a broader reviewed copy inventory is required.
7. Automated tests do not establish clinical correctness.

## Next implementation slice

Begin the review-independent portion of Stage 6:

1. Complete keyboard, focus-order, landmark, label, contrast, zoom, and reduced-motion checks for the MI workspace and eligible projection state; the compact summary and unavailable projection dialog checks pass.
2. Add desktop and mobile visual checks for each summary detail mode and confirm long limitations and source identifiers wrap without overlap.
3. Create a persona comprehension protocol using representative tasks for location, timing, source state, unknown facts, limitations, simulation status, and unavailable output.
4. Record browser performance for MI workspace loading and compact-summary rendering without conflating it with the existing Three.js chunk baseline.
5. Keep clinical/imaging content approval and segment-rendering activation blocked until designated external reviewers record evidence.

The Stage 2 clinical/imaging review gate remains open. Review dates and `REVIEWED` status must only be added by the designated content-review process.

Stage 4 must remain blocked until inferred segment mappings receive content review and approved fixtures replace migration-only anatomy.

## Change discipline

- Keep each stage independently buildable and releasable.
- Add focused tests before wiring a new contract into large components.
- Prefer pure functions and immutable inputs at domain boundaries.
- Keep rendering, model policy, data migration, and persona composition in separate modules.
- Preserve legacy compatibility until all consumers and persisted artifacts have an explicit migration path.
- Do not introduce a framework, state library, or abstraction unless it removes demonstrated complexity or matches an established repository pattern.
