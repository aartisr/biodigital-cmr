export const workspaceIds = ['OVERVIEW', 'MONITORING', 'MI_SPECTRUM', 'IMAGING', 'THERAPY', 'REVIEW'] as const;
export type WorkspaceId = typeof workspaceIds[number];

export const isWorkspaceId = (value: string | null): value is WorkspaceId =>
  value !== null && workspaceIds.includes(value as WorkspaceId);

export const workspaceMetadata: Record<WorkspaceId, { label: string; description: string }> = {
  OVERVIEW: { label: 'Overview', description: 'Priority, key vitals, and recent change' },
  MONITORING: { label: 'Monitoring', description: 'Live telemetry and alerts' },
  MI_SPECTRUM: { label: 'MI spectrum', description: 'Simulated myocardial-infarction evidence patterns' },
  IMAGING: { label: 'Imaging', description: 'Anatomy and provenance' },
  THERAPY: { label: 'Therapy', description: 'Protocol and controller review' },
  REVIEW: { label: 'Review', description: 'Trends, reports, and audit context' },
};
