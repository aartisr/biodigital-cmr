import { Suspense } from 'react';
import { LockKeyhole, Puzzle } from 'lucide-react';
import { getAssessmentModuleForWorkspace } from '../../config/assessment/moduleRegistry';
import { FeatureLoading } from '../../components/ui/FeatureLoading';
import type { PersonaCapability } from '../../types/persona';
import type { WorkspaceId } from '../../types/workspace';

/** Generic host for registered condition modules. It owns discovery and capability gating only. */
export const AssessmentWorkspaceHost = ({ workspace, capabilities }: { workspace: WorkspaceId; capabilities: readonly PersonaCapability[] }) => {
  const module = getAssessmentModuleForWorkspace(workspace);
  if (!module) return <section className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 p-6 text-center"><Puzzle className="mx-auto h-6 w-6 text-slate-500" /><h2 className="mt-3 text-sm font-semibold text-slate-200">Assessment module unavailable</h2><p className="mt-1 text-xs text-slate-400">No module is registered for this workspace.</p></section>;
  if (!capabilities.includes(module.requiredCapability)) return <section className="rounded-2xl border border-amber-400/25 bg-amber-500/[0.06] p-6 text-center"><LockKeyhole className="mx-auto h-6 w-6 text-amber-300" /><h2 className="mt-3 text-sm font-semibold text-amber-100">Read-only module access is unavailable</h2><p className="mt-1 text-xs text-amber-100/75">This simulated learning module requires the {module.requiredCapability} presentation capability.</p></section>;
  const ModuleComponent = module.Component;
  return <Suspense fallback={<FeatureLoading />}><ModuleComponent /></Suspense>;
};
