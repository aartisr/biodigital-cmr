import { ClinicalRole } from './bdcmr';
import { WorkspaceId } from './workspace';

/** Presentation capabilities only. Server authorization must enforce real access. */
export const personaCapabilities = [
  'VIEW_LIVE_TELEMETRY', 'REVIEW_ALERTS', 'VIEW_IMAGING', 'VIEW_THERAPY_CONTEXT',
  'PROPOSE_PACING_CHANGE', 'REVIEW_AUDIT', 'EXPORT_RESEARCH_ARTIFACT',
  'VIEW_INTEGRATION_HEALTH', 'RUN_SANDBOX_SIMULATION', 'VIEW_SESSION_ARTIFACTS',
  'VIEW_RESEARCH_ANALYSIS',
] as const;
export type PersonaCapability = typeof personaCapabilities[number];
export type PersonaSessionState = 'LOADING' | 'ACTIVE' | 'DENIED' | 'UNAVAILABLE';
export type PersonaExtensionId =
  | 'ATTENDING_DECISION'
  | 'ELECTROPHYSIOLOGY_FOCUS'
  | 'SYSTEM_HEALTH'
  | 'AUDIT_EVIDENCE'
  | 'BEDSIDE_MONITORING'
  | 'IMAGING_PROVENANCE'
  | 'RESEARCH_ANALYSIS';

export interface PersonaExtensionPlacement {
  id: PersonaExtensionId;
  workspace: WorkspaceId;
}

export interface PersonaExperience {
  role: ClinicalRole;
  label: string;
  summary: string;
  defaultWorkspace: WorkspaceId;
  availableWorkspaces: readonly WorkspaceId[];
  capabilities: readonly PersonaCapability[];
  extensions?: readonly PersonaExtensionPlacement[];
  safetyNote: string;
}

/** A policy result from an authenticated server, or the explicitly labeled demo provider. */
export interface PersonaSession {
  state: 'ACTIVE';
  role: ClinicalRole;
  capabilities: readonly PersonaCapability[];
  availableWorkspaces: readonly WorkspaceId[];
  defaultWorkspace: WorkspaceId;
  dataScope: 'DE_IDENTIFIED' | 'SCOPED_RESEARCH';
  source: 'DEMO' | 'SERVER';
  expiresAt?: string;
}

export interface PersonaSessionProvider {
  resolve(requestedRole: ClinicalRole, signal?: AbortSignal): Promise<PersonaSession>;
}

export interface PersonaSessionFailure {
  state: Exclude<PersonaSessionState, 'LOADING' | 'ACTIVE'>;
  message: string;
}
