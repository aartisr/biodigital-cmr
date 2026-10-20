# Architecture and Engineering Standard

## Purpose

This document describes the implementation boundary that makes BD-CMR inspectable and extensible without allowing prototype behavior to be mistaken for clinical capability. The architecture protects research clarity: contracts make assumptions reviewable, deterministic services make simulations testable, and composition boundaries prevent role-specific or domain-specific logic from leaking through the application shell.

## Design rules

- **Feature components own presentation; services own deterministic domain work; hooks coordinate state and side effects.** Components must not call transport APIs directly.
- **Types are contracts.** Cross-feature data belongs in `src/types`; do not pass anonymous, loosely shaped objects across a feature boundary.
- **Plugins are additive.** A new capability should be a feature component plus a service contract and an explicit integration point, not a change to the core renderer.
- **Expensive and rarely opened UI is lazy-loaded.** Workspace and overlay features are loaded through their dedicated dashboard composition boundaries; keep their dependency graphs independent.
- **UI primitives are shared.** Use `components/ui/ModalShell` for future dialogs so accessibility, mobile viewport behavior, focus handling upgrades, and visual consistency have one owner.

## Directory intent

```text
src/
  components/       Feature views and ui/ primitives
  hooks/            Stateful coordination between views and services
  services/         Pure domain logic, adapters, and transport boundaries
  types/            Explicit cross-feature contracts
  features/         Workspace and overlay composition boundaries
  App.tsx           Application assembly and session coordination only
```

## Extension recipe

1. Define a typed contract in `types/`.
2. Implement pure calculations or I/O adapters in `services/`.
3. Add a focused hook only if state, caching, or effects are needed.
4. Build a feature component with explicit props.
5. Lazy-load non-critical UI from the relevant workspace or overlay boundary.
6. Add unit and integration tests before wiring the capability into research-facing flows.
7. State the input provenance, review condition, and non-goals at the feature boundary whenever output could be misread as a clinical fact.

## Performance policy

- Avoid React state updates on animation frames; use refs/direct renderer updates for high-frequency visuals.
- Keep Canvas/WebGL lifecycle independent from control state.
- Load heavy drawers, export flows, comparison tools, and full-screen experiences on demand.
- Derive values with pure functions and memoize only after measurement demonstrates value.
- Keep browser bundles free of server secrets and private-registry assumptions.

## Migration backlog

`Real3DHeartCanvas`, `DigitalTwinRemodeling`, and `FullScreenHeartVisualizer` remain large feature components. Split them incrementally into anatomy generation, renderer lifecycle, animation controller, interaction controls, and HUD components. Preserve their public prop contracts during each extraction and add visual regression tests before modifying medical-style visual behavior. No extraction may remove provenance, review, or simulation disclosures.
