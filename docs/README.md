# BD-CMR Research Documentation

This directory is a working research dossier for BD-CMR. It separates what the prototype currently implements from proposed work, validation still required, and non-negotiable safety boundaries. A plan is not evidence of completion; a successful build is not clinical validation.

## Start here

| Document | Use it for |
| --- | --- |
| [Architecture](./architecture.md) | Current code boundaries, extension conventions, performance expectations, and maintenance constraints. |
| [Extensibility architecture](./extensibility-architecture.md) | Adding a persona, workspace, or optional feature without weakening the composition boundary. |
| [Myocardial infarction representation and regeneration plan](./myocardial-infarction-regeneration-implementation-plan.md) | Research scope, data model, safety controls, phased delivery, and traceability. |
| [MI representation and regeneration progress](./myocardial-infarction-regeneration-implementation-progress.md) | Delivered safeguards, validation evidence, known risks, and next work. |
| [Full MI spectrum plan](./full-mi-spectrum-implementation-plan.md) | Reusable assessment-kernel design and the simulation-only MI learning module. |
| [MI spectrum progress](./mi-spectrum-implementation-progress.md) | Implemented module capabilities and intentionally gated future integration work. |
| [Patient-specific diagnostic anatomy pathway](./patient-specific-diagnostic-pathway.md) | What would be required before any patient-specific imaging claim is appropriate. |
| [Persona integration plan](./persona-component-integration-plan.md) | Role model, least-privilege presentation, and delivery sequence. |
| [Persona session provider](./persona-session-provider.md) | Server contract required for real authorization. |
| [Persona validation protocol](./persona-validation-protocol.md) | Representative-user, accessibility, and data-scope validation protocol. |
| [UX quality validation](./ux-quality-validation.md) | Implemented accessibility safeguards, validation results, and open manual work. |
| [Usability and cognitive-load standard](./usability-and-cognitive-load.md) | Interface disclosure rules and evidence required before usability claims. |
| [Vercel deployment](./vercel-deployment.md) | Static build and release checks. |
| [Research prototype release checklist](./release-readiness-checklist.md) | Repeatable public-demo release gate. |
| [Clinical-research foundation](./clinical-research-foundation.md) | Safe server-boundary contracts and required backend activation evidence. |
| [Discoverability and attribution](./discoverability.md) | Public-search, AI-readable context, creator attribution, and production sitemap activation. |
| [GitHub Pages and Wiki publishing](./github-pages-and-wiki.md) | Secondary public mirror, Wiki source set, and canonical-site backlink standard. |

## Decision records and implementation history

- [Header redesign research](./header-redesign-research.md)
- [MI segment surface strategy review](./mi-segment-surface-strategy-review.md)
- [Persona implementation progress](./persona-implementation-progress.md)
- [UX redesign plan](./ux-redesign-plan.md)
- [UX redesign progress](./ux-redesign-progress.md)

## Documentation standards

Every material change should state:

1. Its intended research purpose and explicit non-goals.
2. Whether inputs are observed, imported, inferred, or simulated.
3. Assumptions, uncertainty, provenance, and review state.
4. What verification ran and what remains unverified.
5. Any safety, privacy, accessibility, security, governance, or regulatory dependency.

Do not use the documentation to imply biological efficacy, patient specificity, diagnostic performance, treatment safety, clinical authorization, or regulatory clearance unless the repository contains traceable evidence for that claim.

## Community commitment

BD-CMR aims to make research methods and questions more legible to the communities they are meant to serve. Community review, patient and family perspectives, clinical expertise, accessibility practice, reproducible research, and equity-focused validation are all necessary inputs—not afterthoughts. See the [patient-specific diagnostic anatomy pathway](./patient-specific-diagnostic-pathway.md) for the safety-gated hospital-integration and community-partnership framework.

## Authorship

BD-CMR was created and is led by [Aarti S. Ravikumar](https://ai-aarti.com), student at [Pioneer Charter School of Science II (PCSS II)](https://saugus.pioneercss.org).
