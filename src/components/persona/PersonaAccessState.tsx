import React from 'react';
import { LockKeyhole, RefreshCw, ShieldAlert } from 'lucide-react';
import { PersonaSessionFailure, PersonaSessionState } from '../../types/persona';

interface PersonaAccessStateProps { state: PersonaSessionState; failure: PersonaSessionFailure | null; onRetry: () => void; }

/** Clear, reusable state for a missing or denied server persona session. */
export const PersonaAccessState: React.FC<PersonaAccessStateProps> = ({ state, failure, onRetry }) => {
  if (state === 'ACTIVE') return null;
  if (state === 'LOADING') return <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-300" role="status" aria-live="polite">Resolving role profile…</section>;
  const denied = state === 'DENIED';
  return <section className="rounded-xl border border-amber-500/35 bg-amber-950/20 p-5" role="alert"><div className="flex items-start gap-3">{denied ? <LockKeyhole className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" /> : <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />}<div><h2 className="text-sm font-semibold text-amber-100">{denied ? 'Role access denied' : 'Role profile unavailable'}</h2><p className="mt-1 text-xs leading-relaxed text-slate-300">{failure?.message}</p><p className="mt-2 text-[11px] text-slate-400">No clinical data or permissions are cached locally. Choose another role or retry after the policy service is available.</p><button type="button" onClick={onRetry} className="mt-3 flex min-h-11 items-center gap-2 rounded-lg border border-amber-400/40 px-3 text-xs font-semibold text-amber-100 hover:bg-amber-500/10"><RefreshCw className="h-4 w-4" />Retry role profile</button></div></div></section>;
};
