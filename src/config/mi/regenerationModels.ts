import type { RegenerationModelDescriptor } from '../../types/mi/regeneration';

export const regenerationMeasurementIds = {
  currentLvefPercent: 'currentLvefPercent',
  currentScarAreaCm2: 'currentScarAreaCm2',
  tissueStiffnessKPa: 'tissueStiffnessKPa',
  icmConversionPercent: 'icmConversionPercent',
  infusionRateNlMin: 'infusionRateNlMin',
  pacingCurrentMa: 'pacingCurrentMa',
} as const;

export const illustrativeRegenerationModel: RegenerationModelDescriptor = {
  modelId: 'bdcmr-fixed-48h-sensitivity',
  modelVersion: '1.0.0',
  mode: 'ILLUSTRATIVE',
  supportedPhases: ['SUBACUTE'],
  supportedVentricularInvolvement: ['LV'],
  supportedSourceTypes: ['AUTHORED_SIMULATION', 'SOURCE_IMAGING', 'IMPORTED_RESEARCH_DATA'],
  requiresEstablishedDepth: true,
  requiredInputs: Object.values(regenerationMeasurementIds),
  parameterSources: [{
    parameterId: 'fixed-synthetic-kinetics',
    version: '1.0.0',
    rationale: 'Synthetic constants retained from the existing deterministic sensitivity simulator; not clinically calibrated.',
  }],
  omittedFactors: [
    'Coronary reperfusion status and residual ischaemia',
    'Infarct age beyond the coarse phase label',
    'Segment-specific scar extent and viability',
    'Comorbidities, medications, renal function, and loading conditions',
    'Treatment response uncertainty and adverse events',
  ],
};