import { miTaxonomyVersion } from './taxonomy';
import type { MiCoverageClaim, MiCoverageManifest } from '../../types/mi/coverage';

const claim = <Claim extends MiCoverageClaim>(value: Claim): Claim => value;
const unsupportedNotes = ['No structured, reviewed scenario fixture currently supports this coverage claim.'] as const;

export const miCoverageManifest: MiCoverageManifest = {
  id: 'mi-classification-coverage',
  version: '1.0.0',
  taxonomyVersion: miTaxonomyVersion,
  scenarioPackIds: ['mi-primary-presentations-v1', 'mi-context-boundaries-v1', 'mi-procedure-related-v1', 'mi-representative-anatomy-v1'],
  claims: [
    claim({ dimension: 'assessmentGroup', value: 'PRIMARY', status: 'REPRESENTED', scenarioIds: ['primary-stemi', 'primary-nstemi', 'type-3-pre-biomarker', 'silent-recurrent', 'anatomy-septal-rv-acute', 'anatomy-lateral-subacute'], notes: [] }),
    claim({ dimension: 'assessmentGroup', value: 'SECONDARY', status: 'REPRESENTED', scenarioIds: ['secondary-supply-demand'], notes: [] }),
    claim({ dimension: 'assessmentGroup', value: 'PROCEDURE_RELATED', status: 'REPRESENTED', scenarioIds: ['procedure-pci', 'procedure-cabg', 'procedure-stent-thrombosis', 'procedure-stent-restenosis'], notes: [] }),
    claim({ dimension: 'assessmentGroup', value: 'UNRESOLVED', status: 'REPRESENTED', scenarioIds: ['unresolved-minoca', 'anatomy-posterior-chronic'], notes: [] }),
    claim({ dimension: 'assessmentGroup', value: 'NON_ISCHAEMIC_INJURY', status: 'REPRESENTED', scenarioIds: ['injury-not-mi'], notes: [] }),

    claim({ dimension: 'definitionType', value: 'TYPE_1', status: 'REPRESENTED', scenarioIds: ['primary-stemi', 'primary-nstemi', 'silent-recurrent', 'anatomy-septal-rv-acute', 'anatomy-lateral-subacute'], notes: [] }),
    claim({ dimension: 'definitionType', value: 'TYPE_2', status: 'REPRESENTED', scenarioIds: ['secondary-supply-demand'], notes: [] }),
    claim({ dimension: 'definitionType', value: 'TYPE_3', status: 'REPRESENTED', scenarioIds: ['type-3-pre-biomarker'], notes: [] }),
    claim({ dimension: 'definitionType', value: 'TYPE_4A', status: 'REPRESENTED', scenarioIds: ['procedure-pci'], notes: [] }),
    claim({ dimension: 'definitionType', value: 'TYPE_4B', status: 'REPRESENTED', scenarioIds: ['procedure-stent-thrombosis'], notes: [] }),
    claim({ dimension: 'definitionType', value: 'TYPE_4C', status: 'REPRESENTED', scenarioIds: ['procedure-stent-restenosis'], notes: [] }),
    claim({ dimension: 'definitionType', value: 'TYPE_5', status: 'REPRESENTED', scenarioIds: ['procedure-cabg'], notes: [] }),

    claim({ dimension: 'presentation', value: 'STEMI', status: 'REPRESENTED', scenarioIds: ['primary-stemi'], notes: [] }),
    claim({ dimension: 'presentation', value: 'NSTEMI', status: 'REPRESENTED', scenarioIds: ['primary-nstemi', 'secondary-supply-demand', 'procedure-stent-thrombosis', 'procedure-stent-restenosis', 'unresolved-minoca', 'anatomy-septal-rv-acute', 'anatomy-lateral-subacute'], notes: [] }),
    claim({ dimension: 'presentation', value: 'SILENT_OR_UNRECOGNIZED', status: 'REPRESENTED', scenarioIds: ['silent-recurrent', 'anatomy-posterior-chronic'], notes: [] }),
    claim({ dimension: 'presentation', value: 'UNKNOWN', status: 'REPRESENTED', scenarioIds: ['procedure-pci', 'procedure-cabg', 'type-3-pre-biomarker', 'injury-not-mi'], notes: [] }),

    claim({ dimension: 'eventSequence', value: 'INDEX', status: 'REPRESENTED', scenarioIds: ['primary-stemi', 'primary-nstemi', 'secondary-supply-demand', 'procedure-pci', 'procedure-cabg', 'procedure-stent-thrombosis', 'procedure-stent-restenosis', 'type-3-pre-biomarker', 'injury-not-mi', 'unresolved-minoca', 'anatomy-septal-rv-acute', 'anatomy-lateral-subacute'], notes: [] }),
    claim({ dimension: 'eventSequence', value: 'RECURRENT', status: 'REPRESENTED', scenarioIds: ['silent-recurrent'], notes: [] }),
    claim({ dimension: 'eventSequence', value: 'UNKNOWN', status: 'REPRESENTED', scenarioIds: ['anatomy-posterior-chronic'], notes: [] }),

    claim({ dimension: 'territory', value: 'ANTERIOR', status: 'PARTIAL', scenarioIds: ['primary-stemi'], notes: ['An authored structured phenotype is attached but still requires expert review.'] }),
    claim({ dimension: 'territory', value: 'INFERIOR', status: 'PARTIAL', scenarioIds: ['primary-nstemi'], notes: ['An authored structured phenotype is attached but still requires expert review.'] }),
    claim({ dimension: 'territory', value: 'SEPTAL', status: 'PARTIAL', scenarioIds: ['anatomy-septal-rv-acute'], notes: ['Authored representative fixture requires expert review.'] }),
    claim({ dimension: 'territory', value: 'LATERAL', status: 'PARTIAL', scenarioIds: ['anatomy-lateral-subacute'], notes: ['Authored representative fixture requires expert review.'] }),
    claim({ dimension: 'territory', value: 'POSTERIOR', status: 'PARTIAL', scenarioIds: ['anatomy-posterior-chronic'], notes: ['Authored representative fixture requires expert review.'] }),
    ...(['APICAL', 'MULTITERRITORY', 'UNKNOWN'] as const).map((value) => claim({ dimension: 'territory', value, status: 'UNSUPPORTED', scenarioIds: [], notes: unsupportedNotes })),

    claim({ dimension: 'ventricularInvolvement', value: 'LV', status: 'PARTIAL', scenarioIds: ['primary-stemi', 'primary-nstemi', 'anatomy-lateral-subacute', 'anatomy-posterior-chronic'], notes: ['Authored fixtures require expert review.'] }),
    claim({ dimension: 'ventricularInvolvement', value: 'BIVENTRICULAR', status: 'PARTIAL', scenarioIds: ['anatomy-septal-rv-acute'], notes: ['Authored RV involvement requires expert review.'] }),
    ...(['RV', 'UNKNOWN'] as const).map((value) => claim({ dimension: 'ventricularInvolvement', value, status: 'UNSUPPORTED', scenarioIds: [], notes: unsupportedNotes })),

    claim({ dimension: 'depth', value: 'SUBENDOCARDIAL', status: 'PARTIAL', scenarioIds: ['anatomy-septal-rv-acute'], notes: ['Authored depth requires expert review.'] }),
    claim({ dimension: 'depth', value: 'TRANSMURAL', status: 'PARTIAL', scenarioIds: ['anatomy-posterior-chronic'], notes: ['Authored depth requires expert review.'] }),
    claim({ dimension: 'depth', value: 'MIXED', status: 'PARTIAL', scenarioIds: ['anatomy-lateral-subacute'], notes: ['Authored depth requires expert review.'] }),
    claim({ dimension: 'depth', value: 'NOT_ESTABLISHED', status: 'PARTIAL', scenarioIds: ['primary-stemi', 'primary-nstemi'], notes: ['Structured fixtures explicitly leave depth unresolved.'] }),

    claim({ dimension: 'phase', value: 'ACUTE', status: 'PARTIAL', scenarioIds: ['primary-stemi', 'primary-nstemi', 'anatomy-septal-rv-acute'], notes: ['Authored phase requires expert review.'] }),
    claim({ dimension: 'phase', value: 'SUBACUTE', status: 'PARTIAL', scenarioIds: ['anatomy-lateral-subacute'], notes: ['Authored phase requires expert review.'] }),
    claim({ dimension: 'phase', value: 'CHRONIC', status: 'PARTIAL', scenarioIds: ['anatomy-posterior-chronic'], notes: ['Authored phase requires expert review.'] }),
    claim({ dimension: 'phase', value: 'UNKNOWN', status: 'UNSUPPORTED', scenarioIds: [], notes: unsupportedNotes }),

    claim({ dimension: 'microvascularObstruction', value: 'PRESENT', status: 'PARTIAL', scenarioIds: ['anatomy-septal-rv-acute'], notes: ['Authored complication state requires expert review.'] }),
    claim({ dimension: 'microvascularObstruction', value: 'ABSENT', status: 'PARTIAL', scenarioIds: ['anatomy-lateral-subacute'], notes: ['Authored complication state requires expert review.'] }),
    claim({ dimension: 'microvascularObstruction', value: 'INDETERMINATE', status: 'UNSUPPORTED', scenarioIds: [], notes: unsupportedNotes }),
    claim({ dimension: 'microvascularObstruction', value: 'NOT_ASSESSED', status: 'PARTIAL', scenarioIds: ['anatomy-posterior-chronic'], notes: ['Fixture explicitly leaves MVO unassessed.'] }),

    claim({ dimension: 'intramyocardialHemorrhage', value: 'PRESENT', status: 'PARTIAL', scenarioIds: ['anatomy-septal-rv-acute'], notes: ['Authored complication state requires expert review.'] }),
    claim({ dimension: 'intramyocardialHemorrhage', value: 'ABSENT', status: 'PARTIAL', scenarioIds: ['anatomy-lateral-subacute'], notes: ['Authored complication state requires expert review.'] }),
    claim({ dimension: 'intramyocardialHemorrhage', value: 'INDETERMINATE', status: 'UNSUPPORTED', scenarioIds: [], notes: unsupportedNotes }),
    claim({ dimension: 'intramyocardialHemorrhage', value: 'NOT_ASSESSED', status: 'PARTIAL', scenarioIds: ['anatomy-posterior-chronic'], notes: ['Fixture explicitly leaves hemorrhage unassessed.'] }),
  ],
};