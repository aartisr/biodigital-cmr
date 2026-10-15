import type { ComponentType } from 'react';
import { Activity, Atom, BookOpen, FileCheck2, HeartPulse, Layers3, Package, SlidersHorizontal, Stethoscope } from 'lucide-react';
import type { WorkspaceId } from '../types/workspace';

export type WorkspaceNavigationGroup = 'CORE' | 'RESEARCH' | 'SYSTEM';

export interface WorkspaceNavigationDefinition {
  icon: ComponentType<{ className?: string }>;
  group: WorkspaceNavigationGroup;
}

/** Presentation metadata is central so new workspaces do not require editing navigation behavior. */
export const workspaceNavigation: Record<WorkspaceId, WorkspaceNavigationDefinition> = {
  OVERVIEW: { icon: HeartPulse, group: 'CORE' },
  MONITORING: { icon: Activity, group: 'CORE' },
  MI_SPECTRUM: { icon: Stethoscope, group: 'RESEARCH' },
  QSRE_ENGINE: { icon: Atom, group: 'RESEARCH' },
  MATH_DEFENSE: { icon: BookOpen, group: 'RESEARCH' },
  IMAGING: { icon: Layers3, group: 'CORE' },
  THERAPY: { icon: SlidersHorizontal, group: 'CORE' },
  REVIEW: { icon: FileCheck2, group: 'CORE' },
  INTEGRATION_HUB: { icon: Package, group: 'SYSTEM' },
};
