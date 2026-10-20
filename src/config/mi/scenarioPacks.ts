import { INFARCT_PHENOTYPE_SCHEMA_VERSION } from '../../types/mi/infarctPhenotype';
import type { MiScenarioPackDefinition } from '../../types/mi/scenarioPack';
import { miTaxonomyVersion } from './taxonomy';

const sharedReviewLimitation = 'Synthetic fixtures do not establish clinical correctness.';

export const miScenarioPackDefinitions: readonly MiScenarioPackDefinition[] = [
  {
    id: 'mi-primary-presentations-v1',
    version: '1.0.0',
    title: 'Primary MI presentations',
    learningPurpose: 'Compare authored primary MI evidence patterns, presentations, and event sequence.',
    taxonomyVersion: miTaxonomyVersion,
    phenotypeVersion: INFARCT_PHENOTYPE_SCHEMA_VERSION,
    review: {
      contentOwner: 'BD-CMR research simulation team',
      reviewState: 'REQUIRES_CLINICAL_REVIEW',
      limitations: [sharedReviewLimitation],
    },
    scenarioIds: ['primary-stemi', 'primary-nstemi', 'type-3-pre-biomarker', 'silent-recurrent'],
  },
  {
    id: 'mi-context-boundaries-v1',
    version: '1.0.0',
    title: 'Context and diagnostic boundaries',
    learningPurpose: 'Distinguish secondary MI, myocardial injury, and unresolved mechanism contexts.',
    taxonomyVersion: miTaxonomyVersion,
    phenotypeVersion: INFARCT_PHENOTYPE_SCHEMA_VERSION,
    review: {
      contentOwner: 'BD-CMR research simulation team',
      reviewState: 'REQUIRES_CLINICAL_REVIEW',
      limitations: [sharedReviewLimitation, 'Boundary cases intentionally simplify broader differential evaluation.'],
    },
    scenarioIds: ['secondary-supply-demand', 'injury-not-mi', 'unresolved-minoca'],
  },
  {
    id: 'mi-procedure-related-v1',
    version: '1.0.0',
    title: 'Procedure-related MI contexts',
    learningPurpose: 'Review authored PCI, stent, and CABG evidence contexts.',
    taxonomyVersion: miTaxonomyVersion,
    phenotypeVersion: INFARCT_PHENOTYPE_SCHEMA_VERSION,
    review: {
      contentOwner: 'BD-CMR research simulation team',
      reviewState: 'REQUIRES_CLINICAL_REVIEW',
      limitations: [sharedReviewLimitation, 'Procedure thresholds are simplified synthetic fixtures.'],
    },
    scenarioIds: ['procedure-pci', 'procedure-cabg', 'procedure-stent-thrombosis', 'procedure-stent-restenosis'],
  },
  {
    id: 'mi-representative-anatomy-v1',
    version: '1.0.0',
    title: 'Representative infarct phenotypes',
    learningPurpose: 'Explore a bounded set of authored anatomy, phase, depth, and complication patterns.',
    taxonomyVersion: miTaxonomyVersion,
    phenotypeVersion: INFARCT_PHENOTYPE_SCHEMA_VERSION,
    review: {
      contentOwner: 'BD-CMR research simulation team',
      reviewState: 'REQUIRES_CLINICAL_REVIEW',
      limitations: [sharedReviewLimitation, 'Anatomy and morphology are schematic authored combinations, not prevalence-weighted clinical cases.'],
    },
    scenarioIds: ['anatomy-septal-rv-acute', 'anatomy-lateral-subacute', 'anatomy-posterior-chronic'],
  },
];

export const getMiScenarioPackDefinition = (scenarioId: string): MiScenarioPackDefinition => {
  const definition = miScenarioPackDefinitions.find((pack) => pack.scenarioIds.includes(scenarioId));
  if (!definition) throw new Error(`No MI scenario pack owns ${scenarioId}.`);
  return definition;
};