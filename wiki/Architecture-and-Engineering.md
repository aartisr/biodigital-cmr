# Architecture and Engineering

[Live prototype](https://bdcmr.ai-aarti.com) · [[Home]] · [Architecture source](https://github.com/aartisr/biodigital-cmr/blob/main/docs/architecture.md)

## Design approach

BD-CMR separates presentation, deterministic domain logic, transport boundaries, and typed contracts. This makes assumptions inspectable and reduces the chance that a UI convenience becomes an implicit clinical claim.

```text
React research interface
├── feature components and accessible UI primitives
├── hooks for state and side-effect coordination
├── deterministic domain services and safe adapters
├── typed contracts for cross-feature boundaries
└── tests for safety, provenance, and presentation constraints
```

## Engineering commitments

- TypeScript contracts for domain boundaries.
- Lazy-loaded optional workspaces and overlays.
- Fail-closed external-data and clinical-research gateway adapters.
- CI for typechecking, tests, production build, dependency audit, and SBOM generation.
- Security headers and dependency-update automation.

## Performance

The most computationally intensive Three.js and chart dependencies are isolated from the core application bundle. Performance work remains a continuous responsibility, particularly for research visualizations on resource-constrained devices.

Read the [full architecture guide](https://github.com/aartisr/biodigital-cmr/blob/main/docs/architecture.md) or explore the [live prototype](https://bdcmr.ai-aarti.com).
