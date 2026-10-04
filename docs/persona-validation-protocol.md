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

## Evidence to record

Record participant role, environment, scenario, completion outcome, observed confusion or use error, severity, time to completion, accessibility issue, and proposed remediation. Keep findings de-identified. Do not treat completion as evidence of clinical safety, diagnostic validity, or regulatory clearance.

## Exit criteria

- Every critical task completes without a use error that could be mistaken for a clinical authorization or patient-specific conclusion.
- Denied and unavailable behavior is understandable and keeps protected content unavailable.
- Mobile and keyboard checks pass for the role-specific routes.
- A designated product, privacy, security, and clinical reviewer accept the findings and any open risks.
