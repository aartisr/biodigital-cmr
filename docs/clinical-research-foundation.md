# Clinical-Research Foundation

## Status

This document records engineering contracts that prepare BD-CMR for a future governed clinical-research application. They do not enable patient-data import, storage, viewing, inference, or clinical use. The browser implementation intentionally fails closed.

## Current implementation

- `ClinicalResearchGateway` specifies the server boundary for policy evaluation, immutable study-manifest retrieval, and audit-event recording.
- The only browser implementation is `createUnavailableClinicalResearchGateway`; it returns `UNAVAILABLE`, returns no manifest, and persists nothing.
- The gateway carries only governance references and identifiers. It does not define a client-side DICOM, FHIR, PHI, credential, or access-token transport.

## Required server-side replacement criteria

An approved backend implementation may replace the unavailable adapter only when all of these are evidenced:

1. Hospital-managed identity, MFA, server-enforced role/site/study/consent/purpose-of-use policy, and session controls.
2. A DICOMweb gateway with least-privilege access; raw study payloads must not be copied into browser storage.
3. Immutable manifests connecting case, source study, de-identification evidence, segmentation, review, measurement, software version, and export.
4. Append-only audit records, monitoring, retention policy, backups, incident response, and access review.
5. Privacy, security, clinical safety, legal/regulatory, and data-governance approval for the specific pilot.
6. Technical, usability, and clinical validation appropriate to the approved intended use.

## Non-negotiable boundary

No environment variable, frontend feature flag, or client-side role may promote this simulation into a clinical-research system. Activation requires an approved server deployment and governance evidence, not a browser configuration change.
