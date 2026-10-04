import React, { KeyboardEvent } from 'react';
import { Activity, FileCheck2, HeartPulse, Layers3, SlidersHorizontal, Stethoscope } from 'lucide-react';
import { WorkspaceId, workspaceIds, workspaceMetadata } from '../types/workspace';

const icons: Record<WorkspaceId, React.ComponentType<{ className?: string }>> = {
  OVERVIEW: HeartPulse,
  MONITORING: Activity,
  MI_SPECTRUM: Stethoscope,
  IMAGING: Layers3,
  THERAPY: SlidersHorizontal,
  REVIEW: FileCheck2,
};

export const WorkspaceNavigation: React.FC<{ activeWorkspace: WorkspaceId; onChange: (workspace: WorkspaceId) => void; workspaces?: readonly WorkspaceId[] }> = ({ activeWorkspace, onChange, workspaces = workspaceIds }) => {
  const moveFocus = (workspace: WorkspaceId) => {
    onChange(workspace);
    requestAnimationFrame(() => document.getElementById(`workspace-tab-${workspace}`)?.focus());
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, workspace: WorkspaceId) => {
    const currentIndex = workspaces.indexOf(workspace);
    let nextIndex = currentIndex;
    if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % workspaces.length;
    if (event.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + workspaces.length) % workspaces.length;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = workspaces.length - 1;
    if (nextIndex === currentIndex) return;
    event.preventDefault();
    moveFocus(workspaces[nextIndex]);
  };

  return (
    <nav aria-label="Clinical workspace" className="border-b border-slate-800 bg-slate-950/95 px-2 sm:px-6">
      <div className={`mx-auto grid max-w-[1600px] gap-1 py-2 sm:flex ${workspaces.length === 1 ? 'grid-cols-1' : workspaces.length === 2 ? 'grid-cols-2' : workspaces.length === 3 ? 'grid-cols-3' : workspaces.length === 4 ? 'grid-cols-4' : workspaces.length === 5 ? 'grid-cols-5' : 'grid-cols-3'}`} role="tablist" aria-orientation="horizontal">
        {workspaces.map((workspace) => {
          const Icon = icons[workspace];
          const active = workspace === activeWorkspace;
          const label = workspaceMetadata[workspace].label;
          return (
            <button
              key={workspace}
              id={`workspace-tab-${workspace}`}
              type="button"
              role="tab"
              aria-selected={active}
              aria-controls="workspace-panel"
              aria-label={label}
              title={label}
              tabIndex={active ? 0 : -1}
              onClick={() => onChange(workspace)}
              onKeyDown={(event) => handleKeyDown(event, workspace)}
              className={`flex min-w-0 items-center justify-center gap-2 rounded-lg px-2 py-2 text-xs font-medium transition sm:px-3 ${active ? 'bg-teal-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100'}`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
