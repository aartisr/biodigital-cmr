import type { MiScenarioLimitations } from '../../types/mi/classification';
import type { MiScenarioPackDefinition } from '../../types/mi/scenarioPack';

export const createMiScenarioLimitations = (
  pack: MiScenarioPackDefinition,
  hasPhenotype: boolean,
): MiScenarioLimitations => ({
  whyInsufficient: [
    'This is one authored evidence pattern and cannot represent every presentation, timing, comorbidity, or alternative explanation.',
    ...pack.review.limitations,
    ...(hasPhenotype ? ['The attached anatomy is schematic authored content, not patient-specific imaging.'] : ['No structured anatomy is asserted for this scenario.']),
  ],
  unsupportedUses: [
    'Do not use this scenario to diagnose, exclude, or classify a real myocardial infarction.',
    'Do not use this scenario to select treatment, estimate prognosis, or infer population frequency.',
  ],
});