import { PersonaExperience } from '../types/persona';

export const personaExperiences: Record<PersonaExperience['role'], PersonaExperience> = {
  ATTENDING_CARDIOLOGIST: {
    role: 'ATTENDING_CARDIOLOGIST', label: 'Attending cardiologist',
    summary: 'Prioritize safety state, trend review, and accountable research-session decisions.',
    defaultWorkspace: 'OVERVIEW', availableWorkspaces: ['OVERVIEW', 'MONITORING', 'MI_SPECTRUM', 'QSRE_ENGINE', 'MATH_DEFENSE', 'IMAGING', 'THERAPY', 'REVIEW', 'INTEGRATION_HUB'],
    capabilities: ['VIEW_LIVE_TELEMETRY', 'REVIEW_ALERTS', 'VIEW_IMAGING', 'VIEW_THERAPY_CONTEXT', 'REVIEW_AUDIT', 'EXPORT_RESEARCH_ARTIFACT', 'VIEW_SESSION_ARTIFACTS', 'VIEW_INFARCT_SUMMARY', 'VIEW_MI_SIMULATION', 'VIEW_MI_SEGMENT_DETAIL', 'VIEW_REGENERATION_SIMULATION'],
    extensions: [{ id: 'ATTENDING_DECISION', workspace: 'OVERVIEW' }, { id: 'INFARCT_SUMMARY', workspace: 'OVERVIEW' }],
    safetyNote: 'Review live telemetry and rationale before considering any simulated protocol adjustment.',
  },
  CARDIAC_ELECTROPHYSIOLOGIST: {
    role: 'CARDIAC_ELECTROPHYSIOLOGIST', label: 'Cardiac electrophysiologist',
    summary: 'Focus on rhythm, conduction, pacing context, and safety signals.',
    defaultWorkspace: 'MONITORING', availableWorkspaces: ['MONITORING', 'QSRE_ENGINE', 'MATH_DEFENSE', 'THERAPY', 'REVIEW', 'INTEGRATION_HUB'],
    capabilities: ['VIEW_LIVE_TELEMETRY', 'REVIEW_ALERTS', 'VIEW_THERAPY_CONTEXT', 'PROPOSE_PACING_CHANGE', 'REVIEW_AUDIT', 'VIEW_SESSION_ARTIFACTS', 'VIEW_INFARCT_SUMMARY'],
    extensions: [{ id: 'ELECTROPHYSIOLOGY_FOCUS', workspace: 'MONITORING' }, { id: 'INFARCT_SUMMARY', workspace: 'MONITORING' }],
    safetyNote: 'Pacing review is simulated and must remain separate from dose-specific actions.',
  },
  BIOMEDICAL_ENGINEER: {
    role: 'BIOMEDICAL_ENGINEER', label: 'Biomedical systems engineer',
    summary: 'Verify telemetry integrity, simulated connection state, and session reproducibility.',
    defaultWorkspace: 'MONITORING', availableWorkspaces: ['MONITORING', 'QSRE_ENGINE', 'MATH_DEFENSE', 'IMAGING', 'REVIEW', 'INTEGRATION_HUB'],
    capabilities: ['VIEW_LIVE_TELEMETRY', 'VIEW_IMAGING', 'REVIEW_AUDIT', 'VIEW_INTEGRATION_HEALTH', 'RUN_SANDBOX_SIMULATION', 'VIEW_INFARCT_SUMMARY', 'VIEW_MI_PROVENANCE'],
    extensions: [{ id: 'SYSTEM_HEALTH', workspace: 'MONITORING' }, { id: 'INFARCT_SUMMARY', workspace: 'MONITORING' }],
    safetyNote: 'Engineering simulations are not clinical actions and must use de-identified context by default.',
  },
  CLINICAL_AUDITOR: {
    role: 'CLINICAL_AUDITOR', label: 'Clinical auditor',
    summary: 'Review access, exports, session provenance, and audit evidence.',
    defaultWorkspace: 'REVIEW', availableWorkspaces: ['REVIEW', 'MATH_DEFENSE', 'INTEGRATION_HUB'],
    capabilities: ['REVIEW_AUDIT', 'EXPORT_RESEARCH_ARTIFACT', 'VIEW_SESSION_ARTIFACTS', 'VIEW_INFARCT_SUMMARY', 'VIEW_MI_PROVENANCE'],
    extensions: [{ id: 'AUDIT_EVIDENCE', workspace: 'REVIEW' }, { id: 'INFARCT_SUMMARY', workspace: 'REVIEW' }],
    safetyNote: 'This is a review-only experience; it does not authorize treatment, telemetry control, or PHI access.',
  },
  ICU_NURSE: {
    role: 'ICU_NURSE', label: 'ICU nurse / bedside coordinator',
    summary: 'Identify the active simulated patient, data freshness, and safety items that need escalation.',
    defaultWorkspace: 'MONITORING', availableWorkspaces: ['MONITORING', 'MATH_DEFENSE', 'REVIEW'],
    capabilities: ['VIEW_LIVE_TELEMETRY', 'REVIEW_ALERTS', 'EXPORT_RESEARCH_ARTIFACT', 'VIEW_SESSION_ARTIFACTS', 'VIEW_INFARCT_SUMMARY'],
    extensions: [{ id: 'BEDSIDE_MONITORING', workspace: 'MONITORING' }, { id: 'INFARCT_SUMMARY', workspace: 'MONITORING' }],
    safetyNote: 'Alert acknowledgement records receipt in this demo; it does not resolve an alert or authorize a protocol change.',
  },
  IMAGING_REVIEWER: {
    role: 'IMAGING_REVIEWER', label: 'Cardiac imaging reviewer',
    summary: 'Review research imaging provenance, source readiness, and rendered anatomy limitations.',
    defaultWorkspace: 'IMAGING', availableWorkspaces: ['IMAGING', 'MI_SPECTRUM', 'QSRE_ENGINE', 'MATH_DEFENSE', 'REVIEW'],
    capabilities: ['VIEW_IMAGING', 'REVIEW_AUDIT', 'VIEW_INFARCT_SUMMARY', 'VIEW_MI_SIMULATION', 'VIEW_MI_SEGMENT_DETAIL', 'VIEW_MI_PROVENANCE'],
    extensions: [{ id: 'IMAGING_PROVENANCE', workspace: 'IMAGING' }, { id: 'INFARCT_SUMMARY', workspace: 'IMAGING' }],
    safetyNote: 'The anatomy preview is procedural only; no patient-specific interpretation is available without validated source imaging and review.',
  },
  RESEARCH_COORDINATOR: {
    role: 'RESEARCH_COORDINATOR', label: 'Research coordinator / outcomes analyst',
    summary: 'Review de-identified simulated trends, cohort artifacts, and reproducibility context.',
    defaultWorkspace: 'REVIEW', availableWorkspaces: ['MI_SPECTRUM', 'QSRE_ENGINE', 'MATH_DEFENSE', 'REVIEW', 'INTEGRATION_HUB'],
    capabilities: ['REVIEW_AUDIT', 'EXPORT_RESEARCH_ARTIFACT', 'VIEW_SESSION_ARTIFACTS', 'VIEW_RESEARCH_ANALYSIS', 'VIEW_INFARCT_SUMMARY', 'VIEW_MI_SIMULATION', 'VIEW_MI_PROVENANCE', 'VIEW_REGENERATION_SIMULATION', 'RUN_REGENERATION_WHAT_IF'],
    extensions: [{ id: 'RESEARCH_ANALYSIS', workspace: 'REVIEW' }, { id: 'INFARCT_SUMMARY', workspace: 'REVIEW' }],
    safetyNote: 'Outputs are research artifacts only and must not be framed as clinical predictions, diagnoses, or treatment recommendations.',
  },
  INTEGRATION_ADMIN: {
    role: 'INTEGRATION_ADMIN', label: 'Integration administrator',
    summary: 'Inspect simulated adapter, transport, replay, and audit posture without clinical control access.',
    defaultWorkspace: 'MONITORING', availableWorkspaces: ['MONITORING', 'MATH_DEFENSE', 'REVIEW', 'INTEGRATION_HUB'],
    capabilities: ['VIEW_INTEGRATION_HEALTH', 'REVIEW_AUDIT', 'RUN_SANDBOX_SIMULATION', 'VIEW_INFARCT_SUMMARY', 'VIEW_MI_PROVENANCE'],
    extensions: [{ id: 'SYSTEM_HEALTH', workspace: 'MONITORING' }, { id: 'INFARCT_SUMMARY', workspace: 'MONITORING' }],
    safetyNote: 'Production endpoint configuration and credentials must be controlled by a server-side administrative boundary, never this browser demo.',
  },
};

export const getPersonaExperience = (role: PersonaExperience['role']) => personaExperiences[role];
