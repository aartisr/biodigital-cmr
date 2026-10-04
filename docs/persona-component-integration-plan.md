# Persona and Component Integration Plan

## Purpose and safety boundary

BD-CMR is currently a research demo with simulated telemetry. Persona-specific views can make the interface more coherent, but they must not imply that the app is cleared for diagnosis, treatment planning, device control, or patient-specific anatomy. Every persona view must retain the research-only notice, data provenance, session identity, and audit context.

This plan uses a least-privilege view of access. HHS describes the HIPAA minimum-necessary principle as limiting access to the people, data categories, and conditions required for the function; it does not make a client-side role picker a security boundary. [HHS minimum necessary guidance](https://www.hhs.gov/hipaa/for-professionals/privacy/guidance/minimum-necessary-requirement/index.html)

The persona work should be tested with representative users in representative environments. FDA human-factors guidance treats intended users, use environments, and the interface as a single system and stresses reducing use-related hazards by improving the interface rather than relying on training alone. [FDA human factors considerations](https://www.fda.gov/medical-devices/human-factors-and-medical-devices/human-factors-considerations)

## Component inventory

| Task area | Existing reusable components | Supporting services/contracts |
| --- | --- | --- |
| Live surveillance | `MonitoringWorkspace`, `VitalsMonitor`, `CellularMetricsGrid`, `MicroECGCanvas`, `AlertBanner`, `AlertsDrawer` | `useBdcmrTelemetry`, `useClinicalAlerts`, `telemetryStreamService`, `audioAlarmService` |
| Clinical overview | `OverviewWorkspace`, `WorkspaceNavigation`, `Header` | `PatientProfile`, `PatientVitals`, `CellularSensorMetrics` |
| Anatomy and provenance | `ImagingWorkspace`, `DigitalTwinRemodeling`, `FullScreenHeartVisualizer`, `ClinicalImagingReadinessModal` | `clinicalImagingCaseService`, `clinicalImaging.ts` |
| Protocol interaction | `TherapyWorkspace`, `ClosedLoopController`, `ClinicalProtocolReference` | dosing/pacing contracts, `hipaaSecurityEngine` |
| Review and evidence | `ReviewWorkspace`, `PatientTrendAnalysis`, `QuickSaveSnapshotModal`, `SignedPdfExportModal`, `AuditLogModal` | `trendAnalysisService`, `clinicalPdfReportService`, `ClinicalSnapshot` |
| Data/integration | `HospitalIntegrationModal`, `OpenSourceDatasetBenchmarkingModal`, `SideBySidePatientComparisonModal`, `OfflineReplayModal` | `hospitalAdapter`, `openSourceDatasets`, `offlineSyncEngine` |

## Personas

### 1. Attending cardiologist — existing role

**Primary goal:** rapidly understand the current simulated patient state, determine whether an alert needs review, and communicate an accountable plan.

**Default landing view:** `OverviewWorkspace`, with one priority, key measures, freshness, and a single route to Monitoring. Do not open on the controller.

**Component bundle:**

- Primary: `OverviewWorkspace`, `MonitoringWorkspace`, `AlertBanner`, `AlertsDrawer`, `PatientTrendAnalysis`, `ClinicalProtocolReference`.
- On demand: `TherapyWorkspace` and read-only `ClosedLoopController` context; `ReviewWorkspace`, signed report, snapshots, audit trail.
- Header: patient selector, privacy state, connection, alarms, Rest Mode, Clinical tools, Review & export.

**Allowed intent:** acknowledge simulated alerts, review trends, create snapshots/reports, and propose or approve research-session parameter changes with rationale.

**Required guardrails:** show a rationale and current monitoring review before a proposed change; require a confirmation and auditable actor/action/reason; label every output as simulated/research-only.

**Plug-in work:** add `AttendingHome` as a composition of existing Overview/Monitoring summary cards; make `ClosedLoopController` accept an explicit `permission="propose" | "approve" | "read"` prop instead of inferring rights from the rendered role label.

### 2. Cardiac electrophysiologist — existing role

**Primary goal:** assess rhythm, conduction, pacing context, and potential safety signals without scanning unrelated data.

**Default landing view:** `MonitoringWorkspace`, anchored on `MicroECGCanvas`, alert state, pacing status, and recent rhythm-related trend.

**Component bundle:**

- Primary: `MicroECGCanvas`, `VitalsMonitor`, `CellularMetricsGrid`, `AlertBanner`, `AlertsDrawer`.
- Secondary: `TherapyWorkspace`, `ClosedLoopController` pacing subsection, `PatientTrendAnalysis`, snapshots.
- Usually hidden from first view: PDF export, open-source datasets, broad anatomy explorer.

**Allowed intent:** inspect simulated rhythm and pacing state; propose a research-session pacing adjustment with a rationale; compare a saved state.

**Required guardrails:** no dose-specific action in the rhythm workspace; keep alarm acknowledgement separate from any parameter-change action; require explicit explanation of what changed and why.

**Plug-in work:** extract `PacingReviewPanel` from `ClosedLoopController`; add an `ElectrophysiologyWorkspace` that reuses it with `MicroECGCanvas` and an `AlertSummaryCard` derived from the existing alerts components.

### 3. Biomedical systems engineer — existing role

**Primary goal:** verify simulated telemetry integrity, network/offline state, system configuration, and reproducibility of a session.

**Default landing view:** a new `SystemHealthWorkspace`, not the patient overview.

**Component bundle:**

- Primary: `OfflineReplayModal`, `HospitalIntegrationModal`, `AlertsDrawer` technical thresholds, `AuditLogModal`, `QuickSaveSnapshotModal`.
- Secondary: compact, de-identified `MonitoringWorkspace` telemetry summary and `ClinicalImagingReadinessModal` provenance status.
- Hidden by default: unmasked patient identity, signed clinical report, therapy controls.

**Allowed intent:** inspect connection condition, trigger clearly marked simulations in a sandbox, manage offline replay, export de-identified diagnostic logs, and review audit integrity.

**Required guardrails:** never use the engineer role to authorize clinical decisions; destructive test actions need a sandbox/environment badge and a confirmation; use tokenized patient identifiers by default.

**Plug-in work:** introduce `SystemHealthWorkspace`, `ConnectionHealthCard`, and `SimulationControlPanel`; split simulation triggers out of `AlertsDrawer` so clinical users do not see engineering test controls.

### 4. Clinical auditor / privacy officer — existing role

**Primary goal:** establish who accessed what, when, under which role, and whether exports and privacy states comply with policy.

**Default landing view:** `ReviewWorkspace` with `AuditLogModal` opened as its primary artifact.

**Component bundle:**

- Primary: `AuditLogModal`, `QuickSaveSnapshotModal` metadata, `SignedPdfExportModal` metadata, `HospitalIntegrationModal` configuration, header privacy-state control.
- Secondary: read-only patient and trend summaries; no high-frequency rendering required.
- Hidden/disabled: `ClosedLoopController`, live-heart control, simulated breach controls, patient comparison unless specifically authorized.

**Allowed intent:** review audit events, inspect access/export metadata, review masking state, and export an audit-oriented report.

**Required guardrails:** client-side concealment is insufficient; PHI unmasking needs server-authorized claims, an access reason, timeout, and immutable audit logging.

**Plug-in work:** add `AuditWorkspace`, `AccessEventFilter`, and `ExportLedger`; extend `AuditLogEntry` with resource type, action outcome, session ID, and reason-for-access fields before treating it as an audit record.

### 5. ICU nurse / bedside care coordinator — new role

**Primary goal:** recognize the active patient, freshness, and actionable alert state quickly during a busy shift.

**Default landing view:** a new `BedsideMonitoringWorkspace` with a short alert queue, vitals, data freshness, and escalation/contact path.

**Component bundle:**

- Primary: `VitalsMonitor`, `AlertBanner`, `AlertsDrawer`, simplified `MonitoringWorkspace`, patient switcher.
- Secondary: `MicroECGCanvas` compact view, snapshot capture, handoff/export summary.
- Excluded: therapy controller, parameter modifications, experimental datasets, technical simulation controls.

**Allowed intent:** acknowledge receipt of a simulated alert, open alarm detail, add a session snapshot/handoff note, and escalate to a provider.

**Required guardrails:** distinguish acknowledge, silence, and resolve; do not allow alert acknowledgement to imply resolution; use large targets, high contrast, and a one-handed mobile layout.

**Plug-in work:** add `ClinicalRole` value `ICU_NURSE`, a `BedsideAlertQueue`, `HandoffSnapshotForm`, and an `EscalationCard`. Keep all alert state shared through `useClinicalAlerts`; do not fork alert logic.

### 6. Cardiac imaging specialist / imaging reviewer — new role

**Primary goal:** determine whether source imaging is eligible for research rendering and document provenance/review status.

**Default landing view:** `ImagingWorkspace`, with the research-only gate before any 3D preview.

**Component bundle:**

- Primary: `ClinicalImagingReadinessModal`, `ImagingWorkspace`, `DigitalTwinRemodeling`, `FullScreenHeartVisualizer`.
- Secondary: patient context, source-study metadata, snapshot/audit linkage.
- Excluded: controller, alarm-simulation tools, dosing and pacing controls.

**Allowed intent:** review source study linkage, quality/segmentation status, provenance, and visual rendering; create a review artifact.

**Required guardrails:** do not call the 3D model patient-specific until source-study linkage, segmentation, review, validation, and intended-use gates are completed. Measurements need provenance, units, reviewer identity, and versioned segmentation/model references.

**Plug-in work:** add `IMAGING_REVIEWER` role, `ImagingCaseSummary`, `SegmentationReviewChecklist`, and a typed `ImagingReviewDecision` service. Expand `clinicalImaging.ts` rather than adding free-form state in the UI.

### 7. Research coordinator / outcomes analyst — new role

**Primary goal:** compare de-identified simulated cohorts, analyze trends, prepare research artifacts, and track reproducibility.

**Default landing view:** `ReviewWorkspace` with trends, saved snapshots, dataset context, and a de-identified cohort indicator.

**Component bundle:**

- Primary: `PatientTrendAnalysis`, `SideBySidePatientComparisonModal`, `OpenSourceDatasetBenchmarkingModal`, `RegenerativePredictionModal`, `QuickSaveSnapshotModal`.
- Secondary: `SignedPdfExportModal` in a clearly labeled research-output mode; `AuditLogModal` for provenance.
- Excluded: PHI unmasking, emergency action, controller writes, production EHR actions.

**Allowed intent:** inspect cohort trends, create non-clinical analysis snapshots, compare simulated cases, and export appropriately labeled research artifacts.

**Required guardrails:** no patient-identifiable export by default; prohibit clinical adjectives such as “diagnosis,” “treatment recommendation,” or “outcome prediction” in generated artifacts unless the underlying intended-use and validation status changes.

**Plug-in work:** add `RESEARCH_COORDINATOR` role, `CohortAnalysisWorkspace`, `ResearchExportBanner`, and `DeIdentifiedExportPolicy` in the PDF/report service.

### 8. Integration administrator — new role

**Primary goal:** validate adapter configuration, test connectivity in a non-production context, and monitor sync/replay health.

**Default landing view:** `SystemHealthWorkspace` with `HospitalIntegrationModal` and `OfflineReplayModal` summary cards.

**Component bundle:**

- Primary: `HospitalIntegrationModal`, `OfflineReplayModal`, `AuditLogModal`, de-identified connection metrics.
- Secondary: `ClinicalImagingReadinessModal` interface status and a compact telemetry receipt indicator.
- Excluded: patient comparison, therapy controls, signed clinical report, PHI unmasking by default.

**Allowed intent:** inspect adapter health and schema status, verify sync/replay behavior, and export operational diagnostics.

**Required guardrails:** separate test endpoints from production endpoints; do not expose credentials in browser bundles; require environment badges and audit every configuration change.

**Plug-in work:** add `INTEGRATION_ADMIN` role, typed `IntegrationHealth` contract, `AdapterStatusCard`, and a server-side command/API boundary for configuration changes.

## Personas intentionally not enabled yet

### Patient or family caregiver

Do not expose the present UI to patients or caregivers. It uses technical language, simulated physiologic data, alerts, and experimental constructs that are not suitable for patient-directed interpretation. A future patient-facing experience needs separate content, readability/usability research, consent, plain-language education, a clinician-approved data model, and a distinct risk assessment.

### Unauthenticated viewer

Do not offer anonymous dashboard access. If a public demonstration is required, create a separate static demo with synthetic data embedded at build time, no real authentication behavior, no unmask control, and no action/export services.

## Permission model

`ClinicalRole` is presently a UI selection type, not authorization. Replace it with a shared permission model.

| Capability | Attending | EP | Nurse | Imaging | Engineer | Auditor | Research | Integration admin |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| View de-identified telemetry | Yes | Yes | Yes | Context only | Context only | Summary | Yes | Health only |
| Acknowledge alert | Yes | Yes | Receipt only | No | Sandbox only | No | No | No |
| Propose simulated pacing/dose change | Yes | Pacing only | No | No | No | No | No | No |
| Approve simulated change | Policy-defined | No | No | No | No | No | No | No |
| View/prepare research export | Yes | Scoped | Handoff only | Imaging artifact | Diagnostics | Audit only | Yes | Diagnostics |
| PHI unmask request | Policy-defined | Policy-defined | Policy-defined | Policy-defined | No | Policy-defined | No | No |
| Integration configuration | No | No | No | No | Sandbox only | Read only | No | Yes |

“Yes” means the server grants the action after authentication, scope, environment, and audit checks—not that the frontend merely renders a button.

## Architecture for plug-in persona experiences

```text
Authenticated claims + environment
  → server-enforced capability policy
  → PersonaSession (role, permissions, data scope, training status)
  → PersonaWorkspaceShell
      → allowed workspace navigation
      → role home composition
      → component adapters: read / propose / approve / admin
      → shared audit and provenance boundary
```

### New contracts

1. Create `src/types/persona.ts`: `PersonaId`, `Capability`, `DataScope`, `PersonaSession`, and `PermissionDecision`.
2. Create `src/config/personaCapabilities.ts`: declarative default navigation, component modes, and copy. This config is for presentation only.
3. Add a server/API policy decision endpoint or claims-backed authorization layer. It is the enforcement point for every write, export, and PHI access request.
4. Add `src/hooks/usePersonaSession.ts` to fetch and cache the server-approved session. It must expose loading, expired-session, and forbidden states.
5. Add `src/components/persona/PersonaWorkspaceShell.tsx` to compose existing workspaces from an explicit capability set.
6. Add component mode props rather than copying components: `read`, `acknowledge`, `propose`, `approve`, `sandbox`, and `admin`.

### Component adapter examples

| Existing component | New adapter/prop | Result |
| --- | --- | --- |
| `ClosedLoopController` | `mode: 'read' | 'propose' | 'approve'` | Same controller visual, no duplicate control logic; writes hidden or gated by capability. |
| `AlertsDrawer` | `interaction: 'review' | 'acknowledge' | 'sandbox'` | Nurse sees receipt/escalation; engineer sees test-only controls; auditor sees history. |
| `DigitalTwinRemodeling` | `provenanceMode: 'viewer' | 'reviewer'` | Imaging reviewer receives case/provenance checklist without granting therapy access. |
| `SignedPdfExportModal` | `artifactKind: 'research' | 'handoff' | 'audit'` | Copy, included fields, and export policy match persona purpose. |
| `Header` | `capabilities` and `toolGroups` | Header displays only actions server-approved for the current persona while retaining visible alarms/rest action when relevant. |
| `WorkspaceNavigation` | `availableWorkspaces` | Role has an intentional, short navigation model instead of hidden-but-mounted pages. |

## Delivery sequence

### Phase 1 — foundation

1. Confirm intended users, environments, critical tasks, and prohibited actions with stakeholders.
2. Define the permission vocabulary and server enforcement design.
3. Add `PersonaSession` and capability contracts; retain current four roles as mappings during migration.
4. Add audit fields for capability decision, reason, environment, and outcome.

**Exit:** no action is authorized solely by the client role picker.

### Phase 2 — existing-role pilot

1. Pilot Attending, EP, Biomedical Engineer, and Auditor only.
2. Implement read/propose/approve modes on shared components.
3. Add persona-specific defaults and navigation while preserving an administrator-supported “all workspaces” development mode.
4. Conduct usability sessions against critical tasks.

**Exit:** each existing role can complete its primary task without unrelated controls competing for attention.

### Phase 3 — operational roles

1. Add ICU nurse, Imaging Reviewer, Research Coordinator, and Integration Administrator only after their workflows and data scopes are approved.
2. Extract the planned `PacingReviewPanel`, `SystemHealthWorkspace`, and imaging review components.
3. Build environment separation and server-backed export/integration controls.

**Exit:** every added role has a defined capability matrix, representative task test, and audit policy.

### Phase 4 — validation and governance

1. Test each critical task with representative users under realistic conditions: interruptions, low light, alarms, poor connectivity, mobile use, and handoffs.
2. Record use errors, close calls, task time, assistance, and comprehension; prioritize interface fixes before added training material.
3. Review privacy, security, and export controls; validate minimum necessary data for each role.
4. Maintain a traceability matrix from persona → task → component → hazard → control → verification.

**Exit:** a documented decision exists for each persona and no view claims clinical or regulatory status it does not have.

## Success metrics

- Primary-task completion and time by persona.
- Critical-task use errors and recoveries, particularly alert handling, privacy state, export scope, and attempted parameter changes.
- Number of controls visible on the initial role home versus required to complete the primary task.
- Rate of denied/blocked actions with an understandable reason.
- Data-scope and audit coverage for every export, unmask request, and configuration change.
