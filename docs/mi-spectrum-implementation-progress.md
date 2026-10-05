# Full MI Spectrum — Implementation Progress

## Scope and safety boundary

The MI Spectrum experience is a **simulation-only research and learning module**. It is not a diagnostic, triage, treatment, or clinical decision-support tool. All current cases are authored synthetic scenarios with explicit evidence limitations.

## Delivery progress

| Plan stage | Status | Delivered work |
| --- | --- | --- |
| Stage 0 — scope and safety baseline | Complete | Simulation-only framing, taxonomy version, evidence limitations, and non-diagnostic language are embedded in the module and plan. |
| Stage 1 — contracts and registry foundation | Complete for the first module | Generic assessment evidence/module contracts, a declarative module registry, and a generic capability-gated workspace host are complete. |
| Stage 2 — deterministic evidence engine | Complete for synthetic cases | `evaluateMiScenario` deterministically exposes authored assessment explanation and evidence gaps; it does not diagnose. |
| Stage 3 — representative scenario pack | Complete for core spectrum | Includes primary, secondary, legacy Types 1–5 (including 4a/4b/4c), injury without MI, unresolved/non-obstructive-coronary context, silent, and recurrent context. |
| Stage 4 — reusable evidence components | Complete for first vertical slice | Generic status banner, evidence badge/matrix, timeline, and comparison table; MI-specific troponin and classification adapters. |
| Stage 5 — workspace/persona composition | Complete for first vertical slice | Lazy read-only `MI_SPECTRUM` workspace for attending cardiologist, imaging reviewer, and research coordinator personas. |
| Stage 6 — scenario controls, comparison, and discovery | Complete for first vertical slice | Deterministic playback/reveal, side-by-side comparison, and persisted scenario filters are complete. Export remains queued. |
| Stage 7 — external/research adapters | Not started — intentionally gated | No EHR, FHIR, DICOM, PHI, or production endpoints are connected. |
| Stage 8 — quality and release readiness | In progress | Contract tests are present. Full local lint/build is blocked until local dependencies are restored; Vercel clean builds remain the integration check. |

## Completed commits

| Commit | Slice |
| --- | --- |
| `6f49545` | Modular MI spectrum workspace, generic assessment primitives, complete core scenario pack, contracts, tests, and plan. |
| `7732592` | Reusable deterministic evidence playback controls and synchronized MI timeline/trend reveal. |
| `1585810` | Generic side-by-side comparison and this progress tracker. |
| `3d67873` | Declarative assessment-module registry, generic capability-gated workspace host, and registry contract tests. |
| Current working slice | Persisted scenario discovery filters, pure filter service, reusable filter chips, and filter contract tests. |

## Current UX capabilities

- Clear “simulation-only” status at the point of assessment.
- Compact scenario library with recognisable clinical-pattern grouping.
- Evidence-first playback with keyboard-accessible play, pause, next, previous, and reset controls.
- Explicit present/absent/indeterminate/not-observed states; absence is never displayed as a zero measurement.
- Timeline, evidence matrix, troponin trend, descriptor chips, and explanation remain visually separated so users can understand why a scenario is framed as it is.
- Side-by-side comparison isolates differences in evidence coverage, presentation, legacy mapping, troponin pattern, gaps, and learning objective.
- Search and filter controls narrow the synthetic library by pattern, presentation, evidence domain, or learning objective; these non-sensitive display preferences persist locally.

## Next queued slice

1. Add a simulation-watermarked export frame for comparison and scenario review; no PHI or live telemetry export.
2. Restore local dependencies and run lint, unit tests, production build, responsive QA, and accessibility review.

## Known limits

- The evaluator presents authored simulation outcomes and limitations; it does not implement clinical classification rules for real-world use.
- Comparison is between static synthetic scenarios only.
- The current progress does not authorize data ingestion or healthcare integration work.
