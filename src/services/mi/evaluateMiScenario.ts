import { MiAssessment, MiScenarioCase } from '../../types/mi/classification';

/**
 * Deterministic simulation evaluator. It reports the authored learning scenario and makes
 * absent/indeterminate evidence explicit; it never diagnoses a real patient.
 */
export const evaluateMiScenario = (scenario: MiScenarioCase): MiAssessment => {
  const observedGaps = scenario.evidence
    .filter((item) => item.state === 'INDETERMINATE' || item.state === 'NOT_OBSERVED')
    .map((item) => `${item.domain.replace('_', ' ').toLowerCase()}: ${item.summary}`);
  const evidenceGaps = [...new Set([...scenario.expectedAssessment.evidenceGaps, ...observedGaps])];
  return { ...scenario.expectedAssessment, evidenceGaps, disclaimer: 'SIMULATION_ONLY' };
};
