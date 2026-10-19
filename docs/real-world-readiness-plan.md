# BD-CMR Real-World Readiness Plan

## Purpose and current boundary

BD-CMR is ready to mature into a governed research product, but it is not yet ready for patient-facing or clinical use. Its best first real-world use is a narrow, clinician-reviewed cardiac-MR research workflow—not automated diagnosis, treatment, or closed-loop control.

The repository already has valuable foundations: simulation disclosures, fail-closed anatomy gates, typed contracts, and provenance-oriented exports. These do not by themselves establish clinical safety, security authorization, privacy compliance, or regulatory clearance.

## 1. Establish two separate product tracks

The project must not combine a synthetic demonstration with a real-data application in the same runtime, URL, export type, or access model.

| Track | First deliverable | Data allowed | Claims |
| --- | --- | --- | --- |
| Education and research simulation | Hosted prototype with reproducible synthetic scenarios | Synthetic and de-identified public data only | Learning and hypothesis generation |
| Clinical research imaging | Clinician-reviewed cardiac-MR viewer | Governed, de-identified research studies first | Research visualization and measurement verification only |

For the real-data product, remove or quarantine clinical-looking simulation features—including treatment controls, simulated alerts, regenerative predictions, and official-looking reports—behind unmistakable simulation-only boundaries.

## 2. Define and approve the intended use

Before building integrations, a clinical lead, imaging lead, privacy officer, security lead, regulatory counsel, product owner, and patient/community representative must approve:

- One narrow workflow, initially: research review of accepted cine cardiac-MR segmentations and derived LV/RV volume measurements.
- Specific users, sites, scanners, study types, population, inputs, outputs, exclusions, and failure states.
- Human responsibility: a credentialed reviewer accepts or rejects contours; the system cannot finalize a segmentation or recommend care.
- A claims register mapping every screen, export, marketing statement, and model output to an approved claim and its supporting evidence.

Processing medical images or physiological signals for clinical use can make a function device software. Review the [FDA Clinical Decision Support Software Navigator](https://www.fda.gov/medical-devices/digital-health-center-excellence/step-6-software-function-intended-provide-clinical-decision-support) with regulatory counsel before any clinical claim or deployment.

## 3. Replace the static-browser architecture for real-data use

Keep React as the viewer, but make it a thin client. The real-data product needs an approved backend and identity boundary:

```text
Hospital IdP → server-side authorization → research-case API
PACS/VNA → DICOMweb gateway → encrypted object store + immutable manifest
                         → QC service → segmentation service
                         → clinician-review service → versioned measurements
                         → viewer / export API → immutable audit store
```

Required platform capabilities:

- SSO with MFA; no selectable demo roles when real data is enabled.
- Server-enforced RBAC/ABAC, including site, study, consent, role, and purpose-of-use checks.
- DICOMweb intake and FHIR links where appropriate; no raw studies, UIDs, or identifiers in browser storage.
- Versioned case, study, segmentation, mesh, measurement, reviewer, model, and export identifiers.
- Append-only audit events for access, viewing, changes, acceptance, export, and administrative action.
- Separate development, validation, staging, and production environments.
- Encryption in transit and at rest, managed secrets, key rotation, backups, retention/deletion controls, and tested disaster recovery.

HIPAA requires appropriate administrative, physical, and technical safeguards for electronic protected health information. See the [HHS Security Rule overview](https://www.hhs.gov/hipaa/for-professionals/security/laws-regulations/index.html).

## 4. Build the first narrow imaging workflow

Use the [patient-specific diagnostic anatomy pathway](./patient-specific-diagnostic-pathway.md) as the implementation backbone:

1. Import a de-identified cine CMR study through an authenticated DICOMweb gateway.
2. Validate modality, orientation, spacing, phase coverage, completeness, and image-quality criteria.
3. Generate an LV/RV/myocardium candidate segmentation.
4. Give a credentialed imaging reviewer source-image, multiplanar, overlay, contour-edit, reject, and acceptance tools.
5. Persist accepted masks as DICOM SEG or label-map objects with full source-study references.
6. Generate a mesh only from an accepted segmentation.
7. Compute a deliberately small measurement set, starting with LV/RV volumes, with units, method, version, quality flag, and provenance.
8. Export a research artifact only after review; do not initially create a signed clinical report or push to an EHR.

Scar characterization, CTA, predictive models, alerts, regenerative projections, and treatment controls are later workstreams, not prerequisites for this first useful release.

## 5. Create quality, safety, and regulatory discipline

Build the quality-management program before pilot work involving patient data:

- Product requirements, design history, architecture, traceability, verification/validation evidence, release approval, and corrective-action process.
- Hazard analysis covering wrong-patient, wrong-study, geometry/orientation errors, silent QC failures, stale data, incorrect measurements, unauthorized access, export leakage, model drift, outages, and usability confusion.
- A clinical safety review board with stop and rollback authority.
- Software bill of materials, dependency scanning, threat modeling, penetration testing, vulnerability-response service levels, and incident drills.
- Change control: no model, workflow, threshold, or visualization change reaches production without risk assessment and validation evidence.
- Regulatory assessment for every function and jurisdiction before any diagnostic, clinical-decision, or marketing claim.

For any device-scope release, align cybersecurity evidence with [FDA cybersecurity guidance](https://www.fda.gov/regulatory-information/search-fda-guidance-documents/cybersecurity-medical-devices-quality-management-system-considerations-and-content-premarket).

## 6. Make validation measurable

Validation must answer specific questions rather than merely demonstrate that the interface works.

- **Technical:** import correctness, UID/reference integrity, QC sensitivity, segmentation reliability, contour persistence, calculation accuracy, audit completeness, access-control denial, backup restore, and downtime recovery.
- **Clinical:** independent reference-standard comparisons, prespecified acceptance criteria, multi-reader agreement, and multi-scanner/multi-site external validation.
- **Human factors:** representative users complete review, correction, acceptance, provenance inspection, error recovery, and export tasks without dangerous misunderstanding.
- **Equity:** stratify performance and usability across sites, scanners, protocols, age, sex, relevant disease states, and accessibility needs; publish limitations.
- **Security and privacy:** tabletop incidents, access reviews, vendor reviews, penetration tests, and audit reconciliation.
- **Operations:** monitor failures, overrides, reviewer disagreement, turnaround, drift, accessibility issues, and support incidents.

The existing [persona validation protocol](./persona-validation-protocol.md) is a useful starting point, but it needs execution with representative users and formal success criteria.

## 7. Delivery roadmap and release gates

### Phase 0 — product decision and safety reset (4–8 weeks)

Approve the intended use, claims register, risk register, data-flow map, governance charter, and a real-data feature flag that disables unsafe simulation/control surfaces.

### Phase 1 — secure research foundation (2–4 months)

Implement identity, server authorization, case API, audit logging, environment isolation, CI/CD, SBOM/scanning, observability, and synthetic end-to-end test fixtures. Complete security and privacy design review before any data connection.

### Phase 2 — de-identified CMR pilot (3–6 months)

Integrate DICOMweb; implement QC, reviewed segmentation, accepted-mask rendering, basic measurements, and research-only exports. Validate against an independent reference set before pilot use.

### Phase 3 — controlled multi-site research (3–6 months)

Run prospective usability and technical validation at two or three representative sites. Do not support care decisions, EHR write-back, or patient-specific predictive claims. Use findings to refine the workflow and quality system.

### Phase 4 — evidence-supported clinical pathway

Decide whether to remain research-only or pursue a clinical-device path. If clinical, complete the jurisdiction-specific regulatory strategy, formal verification and validation, cybersecurity evidence, labeling, training, support, post-deployment surveillance, and controlled rollout.

## 8. Immediate repository backlog

1. Rename or remove `clinicalPdfReportService` and official/tamper-evident clinical-report semantics from the prototype.
2. Disable or de-scope simulated therapy, dosing, closed-loop, and alarming controls in every non-demo build.
3. Add CI that runs typecheck, tests, build, dependency audit, license/SBOM generation, and browser accessibility tests.
4. Add end-to-end tests for denied access, stale-data behavior, feature-flag isolation, audit-event completeness, and export labeling.
5. Add a content/clinical-review registry instead of relying only on source-code flags.
6. Set performance budgets; the production build currently reports a large 3D viewer chunk warning.
7. Create runbooks for outage, audit request, breach, vulnerability, bad-model/measurement finding, rollback, and support escalation.
8. Keep Vercel only for the public synthetic demo; deploy the governed research product inside an approved healthcare cloud or tenant.

## Release criterion

The first meaningful real-world milestone is not connecting an EHR. It is proving that a trained reviewer can safely review one accepted, provenance-linked, de-identified CMR case end-to-end, while the system makes unsafe states impossible to mistake for valid findings.
