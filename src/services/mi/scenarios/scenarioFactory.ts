import { createMiScenarioLimitations } from '../../../config/mi/scenarioLimitations';
import { getMiScenarioPackDefinition } from '../../../config/mi/scenarioPacks';
import type { MiEvidenceDomain, MiScenarioCase } from '../../../types/mi/classification';

export const at = (hour: number, minute = 0) => `2026-10-04T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00Z`;

export const evidence = (
  id: string,
  domain: MiEvidenceDomain,
  state: 'PRESENT' | 'ABSENT' | 'INDETERMINATE' | 'NOT_OBSERVED',
  observedAt: string,
  summary: string,
  limitations: readonly string[] = [],
) => ({ id, domain, state, observedAt, summary, provenance: 'SIMULATED' as const, limitations });

export const event = (
  id: string,
  hour: number,
  domain: MiEvidenceDomain,
  title: string,
  detail: string,
  evidenceIds: readonly string[],
) => ({ id, occurredAt: at(hour), domain, title, detail, evidenceIds });

type ScenarioInput = Omit<MiScenarioCase, 'eventSequence' | 'scenarioPackId' | 'taxonomyVersion' | 'provenance' | 'review' | 'limitations'> & {
  eventSequence?: MiScenarioCase['eventSequence'];
};

export const createMiScenario = (input: ScenarioInput): MiScenarioCase => {
  const pack = getMiScenarioPackDefinition(input.id);
  return {
    ...input,
    eventSequence: input.eventSequence ?? 'INDEX',
    scenarioPackId: pack.id,
    taxonomyVersion: pack.taxonomyVersion,
    provenance: 'SIMULATED',
    review: pack.review,
    limitations: createMiScenarioLimitations(pack, Boolean(input.phenotypeId)),
  };
};