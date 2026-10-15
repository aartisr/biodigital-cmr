import type { PatientProfile } from '../../types/bdcmr';
import type { InfarctSummary } from '../../types/mi/infarctSummary';
import { deriveInfarctSummary } from './deriveInfarctSummary';
import { migrateLegacyPatientInfarct } from './migrateLegacyPatientInfarct';
import { validateInfarctPhenotype } from './validateInfarctPhenotype';

export type PatientInfarctSummaryResult =
  | {
    state: 'AVAILABLE';
    summary: InfarctSummary;
    phenotypeSource: 'STRUCTURED' | 'EXACT_LEGACY_MIGRATION';
  }
  | {
    state: 'UNAVAILABLE';
    reasons: readonly string[];
  };

export const resolvePatientInfarctSummary = (patient: PatientProfile): PatientInfarctSummaryResult => {
  if (patient.infarctPhenotype) {
    const validation = validateInfarctPhenotype(patient.infarctPhenotype);
    if (!validation.valid) {
      return {
        state: 'UNAVAILABLE',
        reasons: validation.issues.map((issue) => `Structured phenotype ${issue.path}: ${issue.message}`),
      };
    }

    return {
      state: 'AVAILABLE',
      summary: deriveInfarctSummary(patient.infarctPhenotype),
      phenotypeSource: 'STRUCTURED',
    };
  }

  const migration = migrateLegacyPatientInfarct(patient);
  if (!migration.report.validation.valid) {
    return {
      state: 'UNAVAILABLE',
      reasons: migration.report.validation.issues.map((issue) => `Migrated phenotype ${issue.path}: ${issue.message}`),
    };
  }

  return {
    state: 'AVAILABLE',
    summary: deriveInfarctSummary(migration.phenotype),
    phenotypeSource: 'EXACT_LEGACY_MIGRATION',
  };
};