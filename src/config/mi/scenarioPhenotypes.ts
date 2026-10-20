import {
  INFARCT_PHENOTYPE_SCHEMA_VERSION,
  type InfarctPhenotype,
  type InfarctDepth,
  type InfarctPhase,
  type LeftVentricularSegmentId,
  type RightVentricularRegionId,
  type VentricularInvolvement,
} from '../../types/mi/infarctPhenotype';
import type { MiScenarioPhenotypeFixture } from '../../types/mi/scenarioPhenotype';

const review = {
  contentOwner: 'BD-CMR research simulation team',
  reviewState: 'REQUIRES_CLINICAL_REVIEW' as const,
  limitations: ['Authored schematic anatomy requires clinical and imaging content review.'],
};

const authoredPhenotype = (
  sourceId: string,
  segmentIds: readonly LeftVentricularSegmentId[],
  limitations: readonly string[],
  options: {
    ventricularInvolvement?: VentricularInvolvement;
    phase?: InfarctPhase;
    depth?: InfarctDepth;
    rvRegions?: readonly RightVentricularRegionId[];
    microvascularObstruction?: InfarctPhenotype['microvascularObstruction'];
    intramyocardialHemorrhage?: InfarctPhenotype['intramyocardialHemorrhage'];
  } = {},
): InfarctPhenotype => ({
  schemaVersion: INFARCT_PHENOTYPE_SCHEMA_VERSION,
  ventricularInvolvement: options.ventricularInvolvement ?? 'LV',
  phase: options.phase ?? 'ACUTE',
  coronaryTerritories: ['UNKNOWN'],
  culpritVesselStatus: 'NOT_ESTABLISHED',
  culpritVessels: [],
  segments: [...segmentIds.map((segmentId) => ({
    region: { scheme: 'AHA_17_LV' as const, segmentId },
    scarState: 'PRESENT' as const,
    depth: options.depth ?? 'NOT_ESTABLISHED',
    wallMotion: 'HYPOKINETIC' as const,
    sourceEvidenceIds: [sourceId],
  })), ...(options.rvRegions ?? []).map((segmentId) => ({
    region: { scheme: 'SCHEMATIC_RV' as const, segmentId },
    scarState: 'PRESENT' as const,
    depth: options.depth ?? 'NOT_ESTABLISHED',
    wallMotion: 'HYPOKINETIC' as const,
    sourceEvidenceIds: [sourceId],
  }))],
  microvascularObstruction: options.microvascularObstruction ?? 'NOT_ASSESSED',
  intramyocardialHemorrhage: options.intramyocardialHemorrhage ?? 'NOT_ASSESSED',
  edema: 'NOT_ASSESSED',
  viabilityStatus: 'NOT_ASSESSED',
  provenance: [{
    id: sourceId,
    sourceType: 'AUTHORED_SIMULATION',
    schemaVersion: INFARCT_PHENOTYPE_SCHEMA_VERSION,
    notes: ['Authored for scenario coverage; not derived from a patient study.'],
  }],
  limitations,
});

export const miScenarioPhenotypes: readonly MiScenarioPhenotypeFixture[] = [
  {
    id: 'primary-stemi-anterior-v1',
    version: '1.0.0',
    territories: ['ANTERIOR'],
    phenotype: authoredPhenotype('scenario-primary-stemi-anatomy', [1, 2, 7, 8, 13, 14, 17], [
      'Segment assignment is an authored schematic representation of an anterior pattern.',
      'Extent, depth, culprit vessel, and patient-specific measurements are not established.',
    ]),
    review,
  },
  {
    id: 'primary-nstemi-inferior-v1',
    version: '1.0.0',
    territories: ['INFERIOR'],
    phenotype: authoredPhenotype('scenario-primary-nstemi-anatomy', [4, 10, 15], [
      'Segment assignment is an authored schematic representation of an inferior pattern.',
      'Extent, depth, culprit vessel, and patient-specific measurements are not established.',
    ]),
    review,
  },
  {
    id: 'septal-rv-acute-v1',
    version: '1.0.0',
    territories: ['SEPTAL'],
    phenotype: authoredPhenotype('scenario-septal-rv-acute-anatomy', [2, 3, 8, 9, 14], [
      'Septal and RV regions, depth, MVO, and hemorrhage are authored representative content.',
      'No patient-specific extent, mass, or culprit vessel is established.',
    ], { ventricularInvolvement: 'BIVENTRICULAR', phase: 'ACUTE', depth: 'SUBENDOCARDIAL', rvRegions: ['RV_MID'], microvascularObstruction: 'PRESENT', intramyocardialHemorrhage: 'PRESENT' }),
    review,
  },
  {
    id: 'lateral-subacute-v1',
    version: '1.0.0',
    territories: ['LATERAL'],
    phenotype: authoredPhenotype('scenario-lateral-subacute-anatomy', [5, 6, 11, 12, 16], [
      'Lateral regions, phase, mixed depth, and absent selected complications are authored representative content.',
      'No patient-specific extent, mass, or culprit vessel is established.',
    ], { phase: 'SUBACUTE', depth: 'MIXED', microvascularObstruction: 'ABSENT', intramyocardialHemorrhage: 'ABSENT' }),
    review,
  },
  {
    id: 'posterior-chronic-v1',
    version: '1.0.0',
    territories: ['POSTERIOR'],
    phenotype: authoredPhenotype('scenario-posterior-chronic-anatomy', [4, 5, 10, 11], [
      'Posterior regions, chronic phase, and transmural depth are authored representative content.',
      'The original event timing, sequence, mechanism, and patient-specific measurements are not established.',
    ], { phase: 'CHRONIC', depth: 'TRANSMURAL' }),
    review,
  },
];

export const getMiScenarioPhenotype = (id: string): MiScenarioPhenotypeFixture | undefined =>
  miScenarioPhenotypes.find((fixture) => fixture.id === id);