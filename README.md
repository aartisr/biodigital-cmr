# BD-CMR

[Visit the live research prototype](https://bdcmr.ai-aarti.com) · [Created by Aarti S Ravikumar](https://ai-aarti.com)

## A transparent research prototype for bio-digital cardiovascular inquiry

BD-CMR (Bio-Digital Closed-Loop Myocardial Regeneration) is an open, browser-based research prototype for examining how a future cardiovascular research environment might make simulated evidence, uncertainty, provenance, role-specific views, and safety boundaries visible together.

It is deliberately ambitious about the questions it frames and conservative about the claims it makes. The repository does **not** demonstrate myocardial regeneration, validate a therapeutic intervention, reconstruct a patient's anatomy, or provide clinical decision support. It is not a medical device, a clinical system, or a source of diagnostic or treatment advice.

## Why this work matters

Cardiovascular innovation is not only a question of biology or algorithms. It is also a question of whether researchers can inspect assumptions, distinguish observations from simulations, understand uncertainty, and prevent exploratory interfaces from being mistaken for clinical tools. BD-CMR treats those obligations as first-class design requirements.

The prototype explores a future-facing research question: how might regenerative-biology hypotheses, soft-bioelectronic concepts, and computational models be represented in an interface that remains explicit about what is known, what is simulated, and what requires independent validation?

## What is implemented

- A React/Vite research interface with simulated telemetry, trends, alerts, procedural anatomy, and reproducible research-session artifacts.
- A simulation-only myocardial-infarction learning workspace with versioned, authored scenarios; evidence gaps; provenance; deterministic evaluation; and watermarked exports.
- Eight role-oriented interface configurations, with typed capabilities, presentation boundaries, and an optional server-policy adapter.
- Explicit safeguards that block external clinical-data ingestion in the browser simulation and require reviewed metadata before anatomy-driven rendering can be enabled.
- Accessible interaction foundations: keyboard-operable workspace navigation, focus-managed dialogs, reduced-motion support, lazy loading, and recoverable feature boundaries.
- Automated contracts that protect scenario provenance, review gates, role/workspace boundaries, export watermarking, and safe failure behavior.

## Research integrity at a glance

| Claim area | Current status |
| --- | --- |
| Data | Authored synthetic scenarios and browser-generated state; no EHR, FHIR, DICOM, PHI, or production endpoint is connected. |
| Anatomy | Procedural/schematic; not a patient-specific reconstruction or measurement tool. |
| MI experience | A learning and research simulation that presents authored outcomes and limitations; not a diagnostic classifier. |
| Regeneration projections | Illustrative, fixed-assumption simulations; not efficacy evidence, patient forecasts, or treatment recommendations. |
| Access control | Demo role selection is presentation-only. A real deployment requires authenticated, server-enforced policy decisions. |
| Clinical readiness | Not established. Clinical use would require a defined intended use, evidence program, security and privacy controls, usability validation, and applicable regulatory review. |

## Evidence discipline

The project is designed so that uncertainty is displayed rather than concealed:

- Every scenario carries source state, limitations, and review status.
- Unreviewed or incomplete anatomy fails closed rather than receiving inferred clinical detail.
- Synthetic exports carry simulation and version metadata.
- Client-side visibility rules are never represented as authorization.
- External data import is intentionally disabled until an approved backend, governance, privacy, audit, security, validation, and regulatory program exists.

This is the standard for this codebase: compelling interfaces must be earned by inspectable evidence, not by visual confidence.

## A path toward real-world usefulness

If this work ever moves beyond simulation, it should begin with a narrow, clinician-reviewed research workflow—not an autonomous diagnostic or treatment system. A responsible sequence could be:

1. Partner with hospitals, imaging centers, and research institutions to define one intended use and the clinical question it is meant to support.
2. Connect only through approved, authenticated interoperability services—for example, DICOMweb for imaging studies and FHIR-based services where appropriate—while applying minimum-necessary access, de-identification, and immutable audit records.
3. Require source-image quality checks, clinician review and acceptance, versioned measurements, and traceable provenance before any patient-specific visualization is shown.
4. Validate performance, usability, fairness, security, privacy, workflow impact, and failure handling across representative sites and populations.
5. Establish clinical governance, change control, post-deployment monitoring, and the applicable regulatory path before making any clinical-use claim.

In real life, a validated descendant of this project could help a care or research team review accepted cardiac-imaging artifacts, inspect the assumptions behind a research model, compare de-identified cohorts, or prepare an auditable research artifact. It must never replace clinical judgment, silently automate high-stakes decisions, or widen access to health data without authorization. The detailed pathway is in [patient-specific diagnostic anatomy pathway](./docs/patient-specific-diagnostic-pathway.md).

## Build this with the community

BD-CMR is an invitation to build knowledge in public and to make sophisticated cardiovascular research easier to inspect, question, learn from, and improve. Its value will come from a community that is broader than software:

- **Patients, families, and advocates:** challenge whether the language is understandable, respectful, and oriented toward real needs.
- **Clinicians and imaging specialists:** define meaningful workflows, review boundaries, and failure modes before functionality expands.
- **Researchers and data stewards:** contribute reproducible methods, transparent evidence standards, de-identified learning materials, and critical review.
- **Engineers, designers, and accessibility practitioners:** make the interface resilient, understandable, inclusive, and usable across devices and assistive technologies.
- **Students, educators, and community organizations:** use the prototype to learn, teach, ask better questions, and carry cardiovascular knowledge beyond traditional gatekeepers.

The goal is not to centralize expertise or promise a miracle. It is to democratize access to understandable research tools and methods while protecting people from overclaiming, exclusion, and misuse. Constructive issues, evidence-backed critiques, accessibility feedback, and ideas for equitable collaboration are welcome. Every contribution should preserve privacy, provenance, safety, and the distinction between a research prototype and validated care.

## Architecture

```text
Research interface
├── typed scenario, persona, and workspace contracts
├── deterministic simulation and assessment services
├── provenance, review, and applicability gates
├── role-aware presentation composition
├── lazy-loaded research workspaces and overlays
└── automated contract and accessibility-structure tests
```

The application separates composition, domain logic, presentation configuration, and transport boundaries. See the [architecture guide](./docs/architecture.md), [extensibility guide](./docs/extensibility-architecture.md), and the [documentation index](./docs/README.md).

## Run locally

**Requirements:** Node.js `>=22.6.0 <23` and npm.

```bash
npm ci
npm run dev
```

The development server is available at `http://localhost:3000`.

Verify a change before sharing it:

```bash
npm run lint
npm test
npm run build
```

For the static Vercel deployment configuration, see [Vercel deployment](./docs/vercel-deployment.md).

## Documentation

The [documentation index](./docs/README.md) distinguishes implementation evidence, architectural standards, research roadmaps, validation protocols, and deployment guidance. It also records what has not yet been validated—a necessary part of credible research communication.

For a concise public orientation, see the [public knowledge-base and backlink standard](./docs/public-knowledge-base.md). The canonical live site is [bdcmr.ai-aarti.com](https://bdcmr.ai-aarti.com).

## Authorship

Created and led by [Aarti S Ravikumar](https://ai-aarti.com), student at [Pioneer Charter School of Science II (PCSS II)](https://saugus.pioneercss.org).

## Contribution and reuse

No license has been declared. Contact the author before reuse or redistribution. Contributions must preserve the simulation-only boundary, document assumptions and limitations, and never imply clinical validation that has not occurred.
