# Modular Architecture

## Design rules

- **Feature components own presentation; services own deterministic domain work; hooks coordinate state and side effects.** Components must not call transport APIs directly.
- **Types are contracts.** Cross-feature data belongs in `src/types`; do not pass anonymous, loosely shaped objects across a feature boundary.
- **Plugins are additive.** A new capability should be a feature component plus a service contract and an explicit integration point, not a change to the core renderer.
- **Expensive and rarely opened UI is lazy-loaded.** Modal features are loaded with `React.lazy` from `App.tsx`; keep their dependency graph independent.
- **UI primitives are shared.** Use `components/ui/ModalShell` for future dialogs so accessibility, mobile viewport behavior, focus handling upgrades, and visual consistency have one owner.

## Directory intent

```text
src/
  components/       Feature views and ui/ primitives
  hooks/            Stateful coordination between views and services
  services/         Pure domain logic, adapters, and transport boundaries
  types/            Explicit cross-feature contracts
  App.tsx           Composition root only
```

## Extension recipe

1. Define a typed contract in `types/`.
2. Implement pure calculations or I/O adapters in `services/`.
3. Add a focused hook only if state, caching, or effects are needed.
4. Build a feature component with explicit props.
5. Lazy-load non-critical UI from the composition root.
6. Add unit and integration tests before wiring the capability into clinical-facing flows.

## Performance policy

- Avoid React state updates on animation frames; use refs/direct renderer updates for high-frequency visuals.
- Keep Canvas/WebGL lifecycle independent from control state.
- Load heavy drawers, export flows, comparison tools, and full-screen experiences on demand.
- Derive values with pure functions and memoize only after measurement demonstrates value.
- Keep browser bundles free of server secrets and private-registry assumptions.

## Migration backlog

`Real3DHeartCanvas`, `DigitalTwinRemodeling`, and `FullScreenHeartVisualizer` remain large feature components. Split them incrementally into anatomy generation, renderer lifecycle, animation controller, interaction controls, and HUD components. Preserve their public prop contracts during each extraction and add visual regression tests before modifying medical-style visual behavior.
