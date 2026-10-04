import { getPersonaExperience } from '../config/personaExperiences';
import { ClinicalRole } from '../types/bdcmr';
import { personaCapabilities, PersonaCapability, PersonaSession, PersonaSessionProvider } from '../types/persona';
import { isWorkspaceId } from '../types/workspace';

const isPersonaCapability = (value: unknown): value is PersonaCapability =>
  typeof value === 'string' && (personaCapabilities as readonly string[]).includes(value);

/** Default for this static demo. It is deliberately not an authorization mechanism. */
export const demoPersonaSessionProvider: PersonaSessionProvider = {
  async resolve(requestedRole) {
    const experience = getPersonaExperience(requestedRole);
    return {
      state: 'ACTIVE', role: requestedRole, capabilities: experience.capabilities,
      availableWorkspaces: experience.availableWorkspaces, defaultWorkspace: experience.defaultWorkspace,
      dataScope: 'DE_IDENTIFIED', source: 'DEMO',
    };
  },
};

/** Adapter for a future authenticated policy-decision endpoint. */
export const createHttpPersonaSessionProvider = (endpoint: string): PersonaSessionProvider => ({
  async resolve(requestedRole, signal) {
    const response = await fetch(endpoint, {
      method: 'POST', credentials: 'include', signal,
      headers: { 'content-type': 'application/json' }, body: JSON.stringify({ requestedRole }),
    });
    if (response.status === 401 || response.status === 403) throw new PersonaSessionProviderError('DENIED', 'Your session is not authorized for this role.');
    if (!response.ok) throw new PersonaSessionProviderError('UNAVAILABLE', 'The persona policy service is unavailable.');
    const payload: unknown = await response.json();
    if (!payload || typeof payload !== 'object') throw new PersonaSessionProviderError('UNAVAILABLE', 'The persona policy response was invalid.');
    const record = payload as Record<string, unknown>;
    const capabilities = Array.isArray(record.capabilities) ? record.capabilities.filter(isPersonaCapability) : [];
    const availableWorkspaces = Array.isArray(record.availableWorkspaces) ? record.availableWorkspaces.filter(isWorkspaceId) : [];
    const defaultWorkspace = typeof record.defaultWorkspace === 'string' && isWorkspaceId(record.defaultWorkspace) ? record.defaultWorkspace : undefined;
    if (!availableWorkspaces.length || !defaultWorkspace || !availableWorkspaces.includes(defaultWorkspace)) throw new PersonaSessionProviderError('UNAVAILABLE', 'The persona policy response did not contain a valid workspace scope.');
    return {
      state: 'ACTIVE', role: requestedRole, capabilities, availableWorkspaces, defaultWorkspace,
      dataScope: record.dataScope === 'SCOPED_RESEARCH' ? 'SCOPED_RESEARCH' : 'DE_IDENTIFIED', source: 'SERVER',
      expiresAt: typeof record.expiresAt === 'string' ? record.expiresAt : undefined,
    };
  },
});

export class PersonaSessionProviderError extends Error {
  constructor(public readonly state: 'DENIED' | 'UNAVAILABLE', message: string) { super(message); }
}

export const getPersonaSessionProvider = (): PersonaSessionProvider => {
  const endpoint = import.meta.env.VITE_PERSONA_SESSION_ENDPOINT as string | undefined;
  return endpoint ? createHttpPersonaSessionProvider(endpoint) : demoPersonaSessionProvider;
};
