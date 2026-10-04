import { useCallback, useMemo, useState } from 'react';

export const dashboardOverlayIds = ['alerts', 'fhir', 'audit', 'offline', 'heart', 'pdf', 'datasets', 'comparison', 'prediction', 'snapshots', 'imagingReadiness'] as const;
export type DashboardOverlayId = typeof dashboardOverlayIds[number];
export type DashboardOverlayState = Record<DashboardOverlayId, boolean>;

const createClosedOverlayState = (): DashboardOverlayState => Object.fromEntries(dashboardOverlayIds.map((id) => [id, false])) as DashboardOverlayState;

/** One typed, replaceable state boundary for optional dashboard tools. */
export const useDashboardOverlays = () => {
  const [overlay, setOverlay] = useState<DashboardOverlayState>(createClosedOverlayState);
  const open = useCallback((id: DashboardOverlayId) => setOverlay((current) => ({ ...current, [id]: true })), []);
  const close = useCallback((id: DashboardOverlayId) => setOverlay((current) => ({ ...current, [id]: false })), []);
  const closeAll = useCallback(() => setOverlay(createClosedOverlayState()), []);
  return useMemo(() => ({ overlay, open, close, closeAll }), [overlay, open, close, closeAll]);
};
