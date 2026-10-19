import { getLegacyInfarctMapping } from '../../config/mi/legacyInfarctMappings';
import type { PatientProfile } from '../../types/bdcmr';
import {
  INFARCT_PHENOTYPE_SCHEMA_VERSION,
  InfarctPhenotype,
  MyocardialSegmentFinding,
} from '../../types/mi/infarctPhenotype';
import { PhenotypeValidationResult, validateInfarctPhenotype } from './validateInfarctPhenotype';

export const LEGACY_INFARCT_MIGRATION_VERSION = 'legacy-infarct-migration/1.0.0' as const;

export type MigrationEntryStatus = 'COPIED' | 'INFERRED' | 'UNRESOLVED';

export interface LegacyInfarctMigrationEntry {
  targetPath: string;
  status: MigrationEntryStatus;
  sourceField?: keyof PatientProfile;
  message: string;
}

export interface LegacyInfarctMigrationReport {
  migrationVersion: typeof LEGACY_INFARCT_MIGRATION_VERSION;
  patientId: string;
  entries: readonly LegacyInfarctMigrationEntry[];
  validation: PhenotypeValidationResult;
}

export interface LegacyInfarctMigrationResult {
  phenotype: InfarctPhenotype;
  report: LegacyInfarctMigrationReport;
}

type LegacyInfarctPatient = Pick<
  PatientProfile,
  'id' | 'infarctLocation' | 'postInfarcDay' | 'currentScarAreaCm2' | 'apicalScarThicknessMm'
>;

export const migrateLegacyPatientInfarct = (patient: LegacyInfarctPatient): LegacyInfarctMigrationResult => {
  const mapping = getLegacyInfarctMapping(patient.infarctLocation);
  const sourceId = `legacy-patient:${patient.id}`;
  const entries: LegacyInfarctMigrationEntry[] = [
    { targetPath: 'daysSinceIndexEvent', status: 'COPIED', sourceField: 'postInfarcDay', message: 'Copied from the legacy post-infarct day field.' },
    { targetPath: 'totalScarAreaCm2', status: 'COPIED', sourceField: 'currentScarAreaCm2', message: 'Copied from the current legacy scar-area field.' },
    { targetPath: 'phase', status: 'UNRESOLVED', sourceField: 'postInfarcDay', message: 'Phase is not derived from elapsed days without an approved rule.' },
    { targetPath: 'culpritVessels', status: 'UNRESOLVED', sourceField: 'infarctLocation', message: 'A culprit vessel cannot be established from a display location.' },
  ];

  if (mapping) {
    entries.push({
      targetPath: 'segments',
      status: 'INFERRED',
      sourceField: 'infarctLocation',
      message: `Mapped the exact legacy label "${patient.infarctLocation}" through the reviewed migration registry.`,
    });
  } else {
    entries.push({
      targetPath: 'segments',
      status: 'UNRESOLVED',
      sourceField: 'infarctLocation',
      message: `No registered mapping exists for legacy label "${patient.infarctLocation}".`,
    });
  }

  const useLegacyApicalThickness = patient.infarctLocation === 'Antero-Apical' && patient.apicalScarThicknessMm !== undefined;
  entries.push({
    targetPath: 'segments.wallThicknessMm',
    status: useLegacyApicalThickness ? 'COPIED' : 'UNRESOLVED',
    sourceField: 'apicalScarThicknessMm',
    message: useLegacyApicalThickness
      ? 'Copied the apical thickness only because the registered legacy label is antero-apical.'
      : 'The apical-only thickness field was not applied to non-apical or unknown regions.',
  });

  const segments: readonly MyocardialSegmentFinding[] = mapping?.regions.map((region) => ({
    region,
    scarState: 'PRESENT',
    depth: mapping.depth,
    wallThicknessMm: useLegacyApicalThickness ? patient.apicalScarThicknessMm : undefined,
    wallMotion: 'NOT_ASSESSED',
    sourceEvidenceIds: [sourceId],
  })) ?? [];

  const limitations = [
    'Migrated from legacy synthetic display fields; no source imaging is linked.',
    'Infarct phase, culprit vessel, segment extent, and imaging tissue characteristics remain unestablished.',
    ...(mapping?.limitations ?? [`The legacy location "${patient.infarctLocation}" has no registered anatomical mapping.`]),
  ];

  const phenotype: InfarctPhenotype = {
    schemaVersion: INFARCT_PHENOTYPE_SCHEMA_VERSION,
    ventricularInvolvement: mapping?.ventricularInvolvement ?? 'UNKNOWN',
    phase: 'UNKNOWN',
    daysSinceIndexEvent: patient.postInfarcDay,
    coronaryTerritories: ['UNKNOWN'],
    culpritVesselStatus: 'NOT_ESTABLISHED',
    culpritVessels: [],
    segments,
    totalScarAreaCm2: patient.currentScarAreaCm2,
    microvascularObstruction: 'NOT_ASSESSED',
    intramyocardialHemorrhage: 'NOT_ASSESSED',
    edema: 'NOT_ASSESSED',
    viabilityStatus: 'NOT_ASSESSED',
    provenance: [{
      id: sourceId,
      sourceType: 'INFERRED_LEGACY',
      sourceId: patient.id,
      schemaVersion: LEGACY_INFARCT_MIGRATION_VERSION,
      notes: limitations,
    }],
    limitations,
  };

  return {
    phenotype,
    report: {
      migrationVersion: LEGACY_INFARCT_MIGRATION_VERSION,
      patientId: patient.id,
      entries,
      validation: validateInfarctPhenotype(phenotype),
    },
  };
};