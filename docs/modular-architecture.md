# Modular architecture standard

## Boundaries

- `components/ui/` contains presentation-only primitives with no domain imports.
- `components/<feature>/` contains feature composition and visualization.
- `features/` owns workspace composition, lazy-loading, and feature error boundaries.
- `services/` contains deterministic domain calculations and adapters; it must not import React.
- `config/` contains declarative copy, navigation metadata, scenario fixtures, and feature policy. `workspaceNavigation.ts` is the single registry for workspace presentation metadata.
- `types/` contains contracts shared across layers.

## Reuse rules

1. Extract a component when the same visual/interaction pattern appears in two features or has a stable domain-neutral contract.
2. Keep a component local when extraction would create a prop bag or hide meaningful domain language.
3. Use a configuration object for repeated labels, tabs, metrics, or menu actions; use components for behavior and accessibility.
4. Prefer explicit typed props over ambient globals. Feature components receive data and callbacks; they do not reach into unrelated application state.
5. Keep model functions deterministic and independently testable. Rendering components may schedule animation, but calculations belong in `services/`.

## Performance rules

- Lazy-load workspace-only features at the dashboard boundary.
- Put every lazy feature behind `Suspense` and `FeatureErrorBoundary`.
- Memoize leaf presentation components only when their props are stable and the parent can re-render frequently; do not use memo as a substitute for fixing expensive calculations.
- Compute derived values with `useMemo` only where profiling or a stable expensive calculation justifies it.
- Keep canvas, D3, and chart mutations localized to their feature component and clean up subscriptions/animation frames.

## Extension recipe

1. Add the domain contract in `types/` and a deterministic implementation in `services/`.
2. Add an isolated feature component under the appropriate feature folder.
3. Register the feature in workspace metadata, `workspaceNavigation.ts`, and capability policy; then lazy-load it from the workspace compositor.
4. Add an explicit research/simulation disclosure when a user might interpret output as real-world measurement or advice.
5. Add focused unit tests for the service and component contract before wiring it into the dashboard.
