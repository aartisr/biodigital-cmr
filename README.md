# BD-CMR

## Bio-Digital Closed-Loop Myocardial Regeneration

> A bold research prototype for a simple question: can damaged heart tissue someday be repaired with safer, smarter feedback systems?

**BD-CMR** is a research prototype inspired by a big cardiology idea. It asks whether a future platform could bring together three things: scar-targeted cell repair, soft conductive materials, and a living digital model of the heart.

This repository explores the software experience and safety rules around that idea. It is not a medical device. It does not use real clinical imaging or control treatment. It must not be used to diagnose, treat, or make decisions about a real person.

The goal is Nobel-scale in its ambition, but modest in its claims. BD-CMR is a place to ask better questions, build better safeguards, and earn better evidence.

## The research vision

The cardiology proposal behind this project has three connected ideas:

1. **Cell repair** — could scar-related cells someday be guided toward heart-muscle-like states?
2. **Soft bioelectronics** — could gentle conductive meshes or hydrogels help electrical signals cross injured tissue?
3. **Smart feedback** — could signals, tissue data, and imaging models help researchers learn and respond safely over time?

The proposal imagines a future flow: map the heart, study an intervention, and monitor change. This repository only builds a simulated interface and a systems-design layer for that flow. It does not prove cell repair, prevent arrhythmias, create patient-specific twins, or validate dosing or pacing. Those claims would need extensive lab work, clinical studies, governance, and regulatory review.

## What this repository contains

- A fast, responsive React/Vite dashboard with simulated signals, alerts, trends, imaging gates, therapy context, and saved session artifacts.
- Eight focused experiences for clinicians, engineers, auditors, researchers, and administrators.
- One central place to define each persona’s workspaces, tools, safety notes, and optional panels.
- A clear demo mode today and a path to an authenticated policy service later.
- Lazy-loaded tools, reusable components, accessible navigation, and regression tests.
- Clear documentation of the gap between a procedural visualization and a future, clinically validated patient-specific workflow.

## Architecture at a glance

```text
App shell
├── telemetry + alert hooks
├── persona session and policy-aware navigation
├── DashboardWorkspace      → workspace composition
├── DashboardOverlays       → optional lazy tools
└── PersonaExtensionSlot    → persona-specific panels from central rules
```

The rule is simple: the app assembles, features render, services decide, configuration declares, and tests protect the promises.

For extension conventions, see [the extensibility architecture guide](./docs/extensibility-architecture.md).

## Run locally

### Requirements

- Node.js `>=22.6.0 <23`
- npm

### Install and start

```bash
npm install
npm run dev
```

The development server listens on `http://localhost:3000`.

### Verify

```bash
npm run lint
npm test
npm run build
```

## Configure persona policy (optional)

By default, the app uses a clearly labeled **demo** persona provider. It changes the view; it does not grant real access.

To connect an authenticated policy service, set:

```bash
VITE_PERSONA_SESSION_ENDPOINT="https://your-approved-service.example/api/persona-session"
```

The service contract and security rules are in [persona-session-provider.md](./docs/persona-session-provider.md). A real server must authenticate users and approve every protected request or action.

## Safety and reality check

- Everything in this repository—signals, alerts, patient context, predictions, and anatomy—is simulated or procedural.
- No DICOM study is linked. The 3D heart is not a reconstruction of a real patient’s heart.
- Hiding a button in a browser is not security. Real use would need server-side authorization, audits, limited data access, clinical validation, and regulatory review.
- This work needs many disciplines: cardiology, electrophysiology, regenerative biology, biomaterials, engineering, informatics, human factors, privacy, and regulatory science.

See [patient-specific-diagnostic-pathway.md](./docs/patient-specific-diagnostic-pathway.md) and [persona-validation-protocol.md](./docs/persona-validation-protocol.md) for the explicitly documented gaps and validation work.

## Credits

**Author and creator:** [Aarti S. Ravikumar](https://ai-aarti.com)  
**School:** Pioneer Charter School of Science II

BD-CMR is a personal research vision by Aarti S. Ravikumar. It is for the clinicians, scientists, engineers, educators, and patients who make brave cardiovascular research possible—and who insist that it is done responsibly.

## License and contributions

No license has been declared. Before reusing, sharing, or building on this work, please contact the author. Contributions must preserve the research-only boundary and never overstate clinical readiness.
