import { regenerationMeasurementIds } from '../../config/mi/regenerationModels';
import type { ModelApplicability, RegenerationModelDescriptor, RegenerationModelInput } from '../../types/mi/regeneration';
import { validateInfarctPhenotype } from './validateInfarctPhenotype';

const measurementIsValid = (measurementId: string, value: unknown): boolean => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return false;
  switch (measurementId) {
    case regenerationMeasurementIds.currentLvefPercent:
    case regenerationMeasurementIds.icmConversionPercent:
      return value >= 0 && value <= 100;
    case regenerationMeasurementIds.currentScarAreaCm2:
      return value >= 0;
    default:
      return value > 0;
  }
};

export const evaluateRegenerationApplicability = (
  descriptor: RegenerationModelDescriptor,
  input: RegenerationModelInput | undefined,
  adapterMissingInputs: readonly string[] = [],
): ModelApplicability => {
  if (!input) {
    return {
      status: 'INSUFFICIENT_INPUTS',
      reasons: ['A structured infarct phenotype is required.'],
      missingInputs: adapterMissingInputs.length ? adapterMissingInputs : ['phenotype'],
      omittedFactors: descriptor.omittedFactors,
    };
  }

  const missingInputs = [...new Set([
    ...adapterMissingInputs,
    ...descriptor.requiredInputs.filter((measurementId) => !measurementIsValid(measurementId, input.measurements[measurementId])),
  ])];
  const phenotypeValidation = validateInfarctPhenotype(input.phenotype);
  if (!phenotypeValidation.valid) missingInputs.push('validPhenotype');
  if (input.phenotype.phase === 'UNKNOWN') missingInputs.push('phenotype.phase');
  if (input.phenotype.ventricularInvolvement === 'UNKNOWN' || input.phenotype.segments.length === 0) missingInputs.push('phenotype.anatomy');
  if (descriptor.requiresEstablishedDepth && input.phenotype.segments.some((segment) => segment.depth === 'NOT_ESTABLISHED')) missingInputs.push('phenotype.depth');

  if (missingInputs.length > 0) {
    return {
      status: 'INSUFFICIENT_INPUTS',
      reasons: ['Required structured phenotype facts or finite model measurements are unavailable.'],
      missingInputs: [...new Set(missingInputs)],
      omittedFactors: descriptor.omittedFactors,
    };
  }

  if (!descriptor.supportedPhases.includes(input.phenotype.phase)) {
    return {
      status: 'OUT_OF_SCOPE',
      reasons: [`The ${input.phenotype.phase.toLowerCase()} infarct phase is outside this model's configured scope.`],
      missingInputs: [],
      omittedFactors: descriptor.omittedFactors,
    };
  }
  if (!descriptor.supportedVentricularInvolvement.includes(input.phenotype.ventricularInvolvement)) {
    return {
      status: 'OUT_OF_SCOPE',
      reasons: [`${input.phenotype.ventricularInvolvement} involvement is outside this model's configured scope.`],
      missingInputs: [],
      omittedFactors: descriptor.omittedFactors,
    };
  }

  const unsupportedSources = input.phenotype.provenance.filter((source) => !descriptor.supportedSourceTypes.includes(source.sourceType));
  if (unsupportedSources.length > 0) {
    return {
      status: 'PARTIALLY_SUPPORTED',
      reasons: ['The phenotype contains legacy-inferred or otherwise unsupported provenance.'],
      missingInputs: [],
      omittedFactors: descriptor.omittedFactors,
    };
  }

  return {
    status: 'SUPPORTED_SIMULATION',
    reasons: ['Inputs satisfy the configured scope for this illustrative simulation.'],
    missingInputs: [],
    omittedFactors: descriptor.omittedFactors,
  };
};

export const canRunRegenerationProjection = (applicability: ModelApplicability): boolean =>
  applicability.status === 'SUPPORTED_SIMULATION';