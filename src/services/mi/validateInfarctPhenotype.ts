import {
  getMyocardialRegionKey,
  INFARCT_PHENOTYPE_SCHEMA_VERSION,
  InfarctPhenotype,
} from '../../types/mi/infarctPhenotype';

export type PhenotypeValidationIssueCode =
  | 'UNSUPPORTED_SCHEMA'
  | 'INVALID_NUMBER'
  | 'DUPLICATE_REGION'
  | 'DUPLICATE_SOURCE'
  | 'MISSING_SOURCE'
  | 'INCONSISTENT_FINDING'
  | 'MISSING_ANATOMY';

export interface PhenotypeValidationIssue {
  code: PhenotypeValidationIssueCode;
  path: string;
  message: string;
}

export interface PhenotypeValidationResult {
  valid: boolean;
  issues: readonly PhenotypeValidationIssue[];
}

const isFiniteInRange = (value: number, minimum: number, maximum?: number) =>
  Number.isFinite(value) && value >= minimum && (maximum === undefined || value <= maximum);

export const validateInfarctPhenotype = (phenotype: InfarctPhenotype): PhenotypeValidationResult => {
  const issues: PhenotypeValidationIssue[] = [];
  const addIssue = (code: PhenotypeValidationIssueCode, path: string, message: string) => issues.push({ code, path, message });

  if (phenotype.schemaVersion !== INFARCT_PHENOTYPE_SCHEMA_VERSION) {
    addIssue('UNSUPPORTED_SCHEMA', 'schemaVersion', `Expected ${INFARCT_PHENOTYPE_SCHEMA_VERSION}.`);
  }

  if (phenotype.daysSinceIndexEvent !== undefined && (!Number.isInteger(phenotype.daysSinceIndexEvent) || phenotype.daysSinceIndexEvent < 0)) {
    addIssue('INVALID_NUMBER', 'daysSinceIndexEvent', 'Days since the index event must be a non-negative integer.');
  }

  const optionalMeasurements: ReadonlyArray<[keyof InfarctPhenotype, number | undefined, number | undefined]> = [
    ['totalScarAreaCm2', phenotype.totalScarAreaCm2, undefined],
    ['scarMassGrams', phenotype.scarMassGrams, undefined],
    ['lvExtentPercent', phenotype.lvExtentPercent, 100],
  ];
  for (const [path, value, maximum] of optionalMeasurements) {
    if (value !== undefined && !isFiniteInRange(value, 0, maximum)) {
      addIssue('INVALID_NUMBER', path, `${path} is outside its supported range.`);
    }
  }

  const sourceIds = new Set<string>();
  phenotype.provenance.forEach((source, index) => {
    if (!source.id || sourceIds.has(source.id)) {
      addIssue('DUPLICATE_SOURCE', `provenance.${index}.id`, 'Provenance source IDs must be non-empty and unique.');
    }
    sourceIds.add(source.id);
  });

  const regionKeys = new Set<string>();
  phenotype.segments.forEach((segment, index) => {
    const path = `segments.${index}`;
    const regionKey = getMyocardialRegionKey(segment.region);
    if (regionKeys.has(regionKey)) addIssue('DUPLICATE_REGION', `${path}.region`, `Duplicate myocardial region ${regionKey}.`);
    regionKeys.add(regionKey);

    if (segment.extentPercent !== undefined && !isFiniteInRange(segment.extentPercent, 0, 100)) {
      addIssue('INVALID_NUMBER', `${path}.extentPercent`, 'Segment extent must be between 0 and 100 percent.');
    }
    if (segment.wallThicknessMm !== undefined && !isFiniteInRange(segment.wallThicknessMm, 0)) {
      addIssue('INVALID_NUMBER', `${path}.wallThicknessMm`, 'Wall thickness must be a non-negative finite value.');
    }
    if (segment.scarState === 'ABSENT' && segment.depth !== 'NOT_ESTABLISHED') {
      addIssue('INCONSISTENT_FINDING', `${path}.depth`, 'An absent scar cannot have an established infarct depth.');
    }
    segment.sourceEvidenceIds.forEach((sourceId) => {
      if (!sourceIds.has(sourceId)) addIssue('MISSING_SOURCE', `${path}.sourceEvidenceIds`, `Unknown provenance source ${sourceId}.`);
    });
  });

  if (phenotype.ventricularInvolvement !== 'UNKNOWN' && phenotype.segments.length === 0) {
    addIssue('MISSING_ANATOMY', 'segments', 'Known ventricular involvement requires at least one myocardial region.');
  }

  return { valid: issues.length === 0, issues };
};