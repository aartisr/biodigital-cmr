import React, { ReactNode } from 'react';
import { BadgeInfo, ShieldCheck } from 'lucide-react';
import { PersonaExperience } from '../../types/persona';

interface PersonaWorkspaceShellProps {
  experience: PersonaExperience;
  children: ReactNode;
}

/** Presentation-level role context. Permission enforcement belongs to the server boundary. */
export const PersonaWorkspaceShell: React.FC<PersonaWorkspaceShellProps> = ({ experience, children }) => (
  <>
    <section className="rounded-xl border border-slate-800 bg-slate-900/55 p-3 sm:flex sm:items-center sm:justify-between sm:gap-4">
      <div className="flex items-start gap-2.5"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-teal-300" /><div><p className="text-xs font-semibold text-slate-100">{experience.label} experience</p><p className="mt-0.5 text-xs text-slate-400">{experience.summary}</p></div></div>
      <div className="mt-2 flex items-start gap-1.5 text-[11px] text-amber-200 sm:mt-0 sm:max-w-sm"><BadgeInfo className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-300" />{experience.safetyNote}</div>
    </section>
    {children}
  </>
);
