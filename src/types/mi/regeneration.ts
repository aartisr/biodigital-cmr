import type { InfarctPhase, InfarctPhenotype, PhenotypeSourceType, VentricularInvolvement } from './infarctPhenotype';

export type RegenerationModelMode = 'ILLUSTRATIVE' | 'EVIDENCE_BACKED_RESEARCH';
export type ModelApplicabilityStatus = 'SUPPORTED_SIMULATION' | 'PARTIALLY_SUPPORTED' | 'OUT_OF_SCOPE' | 'INSUFFICIENT_INPUTS';

export interface ModelParameterSource {
  parameterId: string;
  version: string;
  citation?: string;
  rationale: string;
}

export interface ModelValidationSummary {
  population: string;
  sampleSize: number;
  endpoints: readonly string[];
  limitations: readonly string[];
  reviewedAt: string;
}

export interface RegenerationModelDescriptor {
  modelId: string;
  modelVersion: string;
  mode: RegenerationModelMode;
  supportedPhases: readonly InfarctPhase[];
  supportedVentricularInvolvement: readonly VentricularInvolvement[];
  supportedSourceTypes: readonly PhenotypeSourceType[];
  requiresEstablishedDepth: boolean;
  requiredInputs: readonly string[];
  parameterSources: readonly ModelParameterSource[];
  omittedFactors: readonly string[];
  validationSummary?: ModelValidationSummary;
}

export interface RegenerationModelInput {
  phenotype: InfarctPhenotype;
  measurements: Readonly<Record<string, number | string | boolean | null>>;
}

export interface ModelApplicability {
  status: ModelApplicabilityStatus;
  reasons: readonly string[];
  missingInputs: readonly string[];
  omittedFactors: readonly string[];
}

export interface ProjectionSeriesPoint {
  elapsedHours: number;
  value: number;
  lowerSensitivity?: number;
  upperSensitivity?: number;
}

export interface ProjectionSeries {
  metricId: string;
  unit: string;
  points: readonly ProjectionSeriesPoint[];
}

export interface RegenerationProjection {
  modelId: string;
  modelVersion: string;
  applicability: ModelApplicability;
  assumptions: readonly string[];
  outputs: readonly ProjectionSeries[];
  disclaimer: 'SIMULATION_ONLY';
}