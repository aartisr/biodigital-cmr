# Extensibility Architecture

## Design rule

The application shell coordinates state and policy only. Reusable UI belongs in `src/components`, role-specific compositions in `src/components/persona`, optional dashboard tools in `src/features/dashboard`, and data or policy decisions in `src/services` and `src/config`.

## Add a persona

1. Add the typed role to `ClinicalRole` in `src/types/bdcmr.ts`.
2. Add one declarative experience in `src/config/personaExperiences.ts` with a default workspace, allowed workspace list, capability list, and safety note.
3. Add a small lazy-loaded panel under `src/components/persona` only if the shared workspaces cannot express the persona’s primary task.
4. Declare its `PersonaExtensionPlacement` in `src/config/personaExperiences.ts`, then register its typed renderer once in `src/components/persona/PersonaExtensionSlot.tsx`. The app shell must not branch on the persona role.
5. Add or extend contract tests in `tests/personaAndWorkspaceContracts.test.ts`.

The client role selector is presentation-only. Real access remains enforced by the `PersonaSessionProvider` server contract. The registry is a composition mechanism, not an authorization mechanism.

## Add a workspace or feature

1. Define the workspace ID and display metadata in `src/types/workspace.ts`.
2. Build a focused workspace component with an explicit props contract.
3. Register it in the dashboard workspace composition and declare which persona experiences may reach it.
4. Put a full-screen tool or modal in `src/features/dashboard/DashboardOverlays.tsx`. Add one ID to `dashboardOverlayIds`, one lazy import, and one typed render branch. `useDashboardOverlays` supplies open/close/reset behavior automatically; `App.tsx` needs no new state field or reset logic.
5. Add a regression test for the workspace contract or server-rendered structure.

## Reuse boundaries

- `components/ui`: interaction primitives shared by unrelated features.
- `components/persona`: small role adapters; no duplicated data engines.
- `features/dashboard/DashboardOverlays`: optional/lazy overlays and their typed integration surface.
- `features/dashboard/DashboardWorkspace`: workspace assembly and typed workspace actions; it keeps visual composition out of `App.tsx`.
- `config`: declarative policy-free presentation configuration.
- `services`: data creation, transport adapters, and policy clients; no JSX.
- `hooks`: lifecycle and state orchestration; no visual layout.

## Regression checks

Run these before merging a feature:

```bash
npm run lint
npm test
npm run build
```

The test suite covers persona and workspace invariants, server-policy response validation, blocked imaging defaults, and reusable accessibility structure. Browser/device, assistive-technology, and representative-user validation remain separate release activities.
