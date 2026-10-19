# Persona Validation Protocol

## Status

Not yet executed. This is the remaining validation slice; no representative-user results are claimed by the repository.

## Participants and environment

Recruit representative intended users for all eight personas: attending cardiologist, cardiac electrophysiologist, biomedical systems engineer, clinical auditor, ICU nurse/bedside coordinator, imaging reviewer, research coordinator, and integration administrator. Test in representative desktop and narrow mobile environments using de-identified simulated data only.

## Task checks

For each role, confirm the participant can:

1. Identify the active role, research-only state, patient context, and data freshness.
2. Reach the intended default workspace and complete its primary review task without seeing unrelated high-risk controls.
3. Distinguish review, acknowledgement, simulation, and therapy-context states.
4. Recover from loading, denied, and unavailable persona-session states without exposing cached clinical data.
5. Use keyboard navigation, visible focus, and mobile targets without loss of an available action.

Run role-specific scenarios for alert review/handoff (attending, EP, ICU), connection/replay integrity (engineer, integration administrator), audit/export provenance (auditor), imaging readiness (imaging reviewer), and de-identified research artifacts (research coordinator).

## MI summary comprehension checks

Using the same active simulated patient, ask every participant to answer without coaching:

1. What location, timing, tissue pattern, and extent does the summary represent?
2. Which facts are source-backed, authored simulation, legacy inference, or unknown?
3. Which facts are explicitly not established, and why must they remain unknown?
4. What do the listed limitations prevent the participant from concluding about diagnosis, prognosis, treatment, or patient-specific anatomy?
5. Is the summary a read-only representation, MI scenario exploration, or a regeneration simulation?

Run additional capability-boundary checks:

- ICU participants must complete the task using plain-language facts without segment labels, source identifiers, therapy suggestions, or outcome claims.
- Imaging participants may inspect segment labels and source references but must identify that inferred or authored anatomy is not equivalent to reviewed patient imaging.
- Engineering, audit, integration, and research participants must locate provenance while preserving the same location, timing, morphology, extent, and unknown states shown to other personas.
- Attending participants may inspect an eligible illustrative projection but must not receive model-input sliders.
- Research participants may distinguish projection viewing from the separately permitted what-if sensitivity controls.
- Participants without MI scenario access must not confuse the compact summary with permission to open the MI learning module.

## Evidence to record

Record participant role, environment, scenario, answers to each comprehension question, completion outcome, observed confusion or use error, severity, time to completion, accessibility issue, and proposed remediation. Record whether each answer was correct, incorrect, or required coaching. Keep findings de-identified. Do not treat completion as evidence of clinical safety, diagnostic validity, or regulatory clearance.

## Exit criteria

- Every critical task completes without a use error that could be mistaken for a clinical authorization or patient-specific conclusion.
- Denied and unavailable behavior is understandable and keeps protected content unavailable.
- Mobile and keyboard checks pass for the role-specific routes.
- Every participant correctly distinguishes established, inferred, authored, and unknown MI facts without converting an unknown into a clinical conclusion.
- Every participant correctly distinguishes compact summary access, MI scenario exploration, projection viewing, and what-if control permission.
- A designated product, privacy, security, and clinical reviewer accept the findings and any open risks.
