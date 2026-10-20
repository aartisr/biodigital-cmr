# Validation, Safety, and Quality

[Live prototype](https://bdcmr.ai-aarti.com) · [[Home]] · [Validation protocol](https://github.com/aartisr/biodigital-cmr/blob/main/docs/persona-validation-protocol.md)

## What is verified in code

The automated suite protects deterministic scenario behavior, evidence/provenance contracts, review gates, safety boundaries, role and workspace limitations, accessible component structure, and simulation-export watermarking.

The public CI pipeline runs type checking, the test suite, a production build, a production dependency audit, and creates a CycloneDX SBOM artifact.

## What remains to be validated

Automated tests cannot establish clinical accuracy, usability in representative care settings, biological plausibility, therapeutic efficacy, equity, privacy compliance, or regulatory authorization.

Before a governed clinical-research release, BD-CMR requires representative-user research, multi-site technical validation, independent reference standards, security review, privacy/data-governance approval, and a defined intended-use assessment.

## Responsible release standard

A successful build is necessary but insufficient. Every material feature must disclose its provenance, assumptions, limitations, verification evidence, and remaining dependencies. Learn more in the [live application](https://bdcmr.ai-aarti.com) and the project’s public documentation.
