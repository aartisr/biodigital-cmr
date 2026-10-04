# UX Redesign Implementation Plan

## Objective

Transform the current all-in-one clinical demo into a low-cognitive-load, responsive, role-aware workspace. The default experience must answer: **what needs attention, what is changing, and what is the next safe action?**

## Guardrails

- Preserve the research-only / non-diagnostic status.
- Do not hide critical safety state behind navigation.
- Keep patient identity, data freshness, and provenance visible in clinical workspaces.
- Validate each stage with type-checking, production builds, keyboard checks, and responsive breakpoints.
- Prefer additive, reversible feature modules over a one-time rewrite.

## Stages

| Stage | Deliverable | Exit criteria |
| --- | --- | --- |
| 0. Baseline | UX audit, task map, performance baseline, page inventory | Current behavior documented; tests/build pass |
| 1. Shell | App navigation model, responsive desktop rail/mobile bar, page contracts | A selected workspace has one clear information hierarchy |
| 2. Overview | Calm patient overview: status, needs-attention, key vitals, one trend, next action | No duplicate control surfaces; action priority is obvious |
| 3. Monitoring | Dedicated vitals, ECG, trends, and alert review workspace | Monitoring tasks work without opening unrelated tools |
| 4. Imaging | Dedicated anatomy/imaging workspace with provenance gate | Visualization is separated from research/diagnostic safeguards |
| 5. Therapy | Dedicated therapy and closed-loop review workspace | Changes have visible rationale and review path |
| 6. Review | Reports, snapshots, audit trail, exports, datasets | Historical/review work is isolated from live care workflow |
| 7. Quality | Responsive, keyboard, screen-reader, performance and task-based QA | Acceptance criteria and known limitations documented |
| 8. Resilience | Recoverable optional-feature failures and safe session continuity | A feature failure does not take down the workspace shell; no clinical data is persisted for navigation convenience |
| 9. Header IA | Task-grouped command access with a responsive safety-first header | Every existing header capability remains reachable; critical safety state stays visible; mobile controls reflow without horizontal scrolling |
| 10. Persona experience | Role-specific homes, navigation, and component modes backed by server-enforced capabilities | Every persona has a validated primary task, least-privilege data scope, and auditable action policy |

## Page model

```text
Overview → Monitoring → Imaging → Therapy → Review
```

The shell owns navigation. Each workspace owns only its task-specific panels. Full-screen tools and exports remain lazy-loaded feature overlays.

## Acceptance criteria

- At 320, 375, 768, 1024, and 1440 px widths, no primary workflow is clipped or requires horizontal scrolling.
- A first-time clinician can identify the active patient, data freshness, one priority, and one next action within five seconds.
- Every interactive control is keyboard reachable with a visible focus state.
- Lazy feature chunks remain separate from the initial dashboard bundle.
- No page presents simulated data as patient-specific diagnostic evidence.
