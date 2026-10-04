import { useCallback, useEffect, useState } from 'react';
import { ClinicalRole } from '../types/bdcmr';
import { getPersonaSessionProvider, PersonaSessionProviderError } from '../services/personaSessionProvider';
import { PersonaSession, PersonaSessionFailure, PersonaSessionState } from '../types/persona';

interface PersonaSessionResult {
  state: PersonaSessionState;
  session: PersonaSession | null;
  failure: PersonaSessionFailure | null;
  retry: () => void;
}

/** Resolves a role profile without persisting permissions or clinical data in the browser. */
export const usePersonaSession = (requestedRole: ClinicalRole): PersonaSessionResult => {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<PersonaSessionState>('LOADING');
  const [session, setSession] = useState<PersonaSession | null>(null);
  const [failure, setFailure] = useState<PersonaSessionFailure | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setState('LOADING'); setSession(null); setFailure(null);
    getPersonaSessionProvider().resolve(requestedRole, controller.signal)
      .then((result) => { if (!controller.signal.aborted) { setSession(result); setState('ACTIVE'); } })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        const known = error instanceof PersonaSessionProviderError;
        setState(known ? error.state : 'UNAVAILABLE');
        setFailure({ state: known ? error.state : 'UNAVAILABLE', message: known ? error.message : 'The persona session could not be resolved.' });
      });
    return () => controller.abort();
  }, [requestedRole, attempt]);

  return { state, session, failure, retry: useCallback(() => setAttempt((value) => value + 1), []) };
};
