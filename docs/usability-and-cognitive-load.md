# Usability and cognitive-load standard

## Product boundary

BD-CMR is a research prototype. It uses synthetic scenarios, browser-generated telemetry, and illustrative mathematical models. It is not clinical decision support, a medical device, or a connection to a clinical system.

## Design decisions

- Show the current workspace, a short purpose statement, and the synthetic-data boundary before detailed content.
- Keep workspace navigation in one consistent, labelled order. On narrow screens it scrolls horizontally instead of hiding labels or rearranging tasks.
- Use one primary next step per overview card. Secondary tools live in named menus.
- Label every generated value as `modeled`, `scenario`, `simulated`, or `illustrative` where a reader could mistake it for a measurement.
- Put equations, assumptions, sensitivity settings, and model limitations in the model workspace instead of asking every user to parse them on the overview screen.
- Support keyboard focus and `prefers-reduced-motion`; decorative animation must never be the only carrier of status.

## Model disclosure map

| Area | What the user sees | What it is |
| --- | --- | --- |
| Overview and monitoring | Vitals, alerts, trends | Browser-generated scenario state, not acquired telemetry. |
| Imaging | Heart anatomy and infarct views | Procedural/schematic rendering, not patient-specific imaging. |
| QSRE explorer | Quantum, Fokker–Planck, tensor, graph, entropy, and ECG displays | Illustrative equations and generated visualizations; not calibrated biological measurements. |
| Prediction views | Sensitivity trajectories and what-if controls | Fixed-assumption synthetic projections, not patient forecasts or treatment recommendations. |
| Math Defense | Equations, assumptions, and falsifiable predictions | A hypothesis/specification layer; not proof of safety or efficacy. |

## Research basis

The interface follows the principles of clear language, short content blocks, whitespace, and avoiding unnecessary numerical or mathematical burden from [W3C Cognitive Accessibility guidance](https://www.w3.org/WAI/WCAG2/supplemental/objectives/o3-clear-content/). It uses consistent navigation and labels in line with [W3C guidance on predictable interfaces](https://www.w3.org/WAI/WCAG22/Understanding/predictable), and reduced interfaces/progressive disclosure as described by [W3C’s presentation guidance](https://www.w3.org/WAI/people-use-web/tools-techniques/presentation/).

For a future regulated product, usability claims require formative and simulated-use evaluation with representative users and risk-based review; this follows the scope of the [FDA human-factors and usability-engineering guidance](https://www.fda.gov/regulatory-information/search-fda-guidance-documents/applying-human-factors-and-usability-engineering-medical-devices). This repository has not completed that evaluation.

## Required validation before claiming usability

1. Recruit representative research users and define their top tasks (orient, inspect a scenario, compare a model, export a research artifact).
2. Run moderated cognitive walkthroughs to identify terminology, navigation, and handoff failures.
3. Run task-based usability sessions across desktop, tablet, keyboard-only, zoom, and reduced-motion settings.
4. Measure task completion, time, critical misunderstandings, navigation errors, and post-task confidence. Do not claim “10/10” without a predefined target and evidence.
5. Prioritize and retest issues, then retain the evidence and trace each critical task to the corresponding interface controls.
