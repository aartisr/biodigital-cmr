import { lazy } from 'react';
import type { AssessmentWorkspaceModuleDefinition } from '../../types/assessment/module';
import type { WorkspaceId } from '../../types/workspace';

const MiSpectrumWorkspace = lazy(() => import('../../components/mi/MiSpectrumWorkspace').then(({ MiSpectrumWorkspace: Component }) => ({ default: Component })));

/**
 * Condition modules register here. Dashboard composition only knows that a workspace hosts
 * an assessment module; it has no direct dependency on any condition implementation.
 */
export const assessmentWorkspaceModules: readonly AssessmentWorkspaceModuleDefinition[] = [
  {
    id: 'mi-spectrum', version: '1.0.0', title: 'Full MI spectrum', workspace: 'MI_SPECTRUM',
    requiredCapability: 'VIEW_MI_SIMULATION', scenarioPackIds: ['full-mi-spectrum-core-v1'], Component: MiSpectrumWorkspace,
  },
];

export const getAssessmentModuleForWorkspace = (workspace: WorkspaceId) =>
  assessmentWorkspaceModules.find((module) => module.workspace === workspace);
