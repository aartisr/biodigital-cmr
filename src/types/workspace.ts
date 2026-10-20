export const workspaceIds = [
  'OVERVIEW',
  'MONITORING',
  'MI_SPECTRUM',
  'QSRE_ENGINE',
  'MATH_DEFENSE',
  'IMAGING',
  'THERAPY',
  'REVIEW',
  'INTEGRATION_HUB',
] as const;
export type WorkspaceId = typeof workspaceIds[number];

export const isWorkspaceId = (value: string | null): value is WorkspaceId =>
  value !== null && workspaceIds.includes(value as WorkspaceId);

export const workspaceMetadata: Record<WorkspaceId, { label: string; description: string }> = {
  OVERVIEW: { label: 'Overview', description: 'Priority, key vitals, and recent change' },
  MONITORING: { label: 'Monitoring', description: 'Simulated telemetry and alerts' },
  MI_SPECTRUM: { label: 'MI spectrum', description: 'Simulated myocardial-infarction evidence patterns' },
  QSRE_ENGINE: { label: 'QSRE engine', description: 'Illustrative quantum, stochastic, and tensor models' },
  MATH_DEFENSE: { label: 'Math defense', description: 'Model assumptions, equations, and falsification criteria' },
  IMAGING: { label: 'Imaging', description: 'Anatomy and provenance' },
  THERAPY: { label: 'Therapy', description: 'Protocol and controller review' },
  REVIEW: { label: 'Review', description: 'Trends, reports, and audit context' },
  INTEGRATION_HUB: { label: 'Integration hub', description: 'Plug-and-play React & TypeScript developer export' },
};
