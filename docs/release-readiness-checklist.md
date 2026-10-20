# Research Prototype Release Checklist

This checklist is for the public synthetic-data demo only. Passing it does not establish clinical readiness.

## Before every release

- [ ] Confirm no PHI, DICOM studies, credentials, private URLs, or access tokens are committed or embedded in the bundle.
- [ ] Run `npm ci`, `npm run lint`, `npm test`, and `npm run build`.
- [ ] Run `npm run audit:production`; review results and document any accepted risk.
- [ ] Review the CI-generated CycloneDX production SBOM with release evidence.
- [ ] Confirm the simulation-only disclosure remains visible in the initial experience and all export flows.
- [ ] Confirm clinical-data import remains blocked and no browser configuration enables it.
- [ ] Test keyboard navigation, dialogs, reduced motion, and narrow viewport behavior.
- [ ] Review the bundle report and investigate material size regressions.
- [ ] Verify Vercel security headers after deployment.

## Before publishing a substantive research feature

- [ ] Document provenance, assumptions, limitations, and non-goals.
- [ ] Add or update contract tests for safety boundaries and deterministic domain logic.
- [ ] Get domain-content review for any anatomy, measurement, or clinical-style language.
- [ ] Ensure labels do not imply diagnosis, treatment efficacy, patient specificity, or an active hospital integration.

## Explicitly outside this checklist

Clinical data processing, patient-specific output, clinical decision support, diagnostic claims, treatment suggestions, and EHR/PACS connectivity require the separate governance and validation gates in the [real-world readiness plan](./real-world-readiness-plan.md).
