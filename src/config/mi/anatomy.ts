import type { LeftVentricularSegmentId, MyocardialRegionReference, RightVentricularRegionId } from '../../types/mi/infarctPhenotype';

const leftVentricularSegmentLabels: Record<LeftVentricularSegmentId, string> = {
  1: 'Basal anterior',
  2: 'Basal anteroseptal',
  3: 'Basal inferoseptal',
  4: 'Basal inferior',
  5: 'Basal inferolateral',
  6: 'Basal anterolateral',
  7: 'Mid anterior',
  8: 'Mid anteroseptal',
  9: 'Mid inferoseptal',
  10: 'Mid inferior',
  11: 'Mid inferolateral',
  12: 'Mid anterolateral',
  13: 'Apical anterior',
  14: 'Apical septal',
  15: 'Apical inferior',
  16: 'Apical lateral',
  17: 'Apex',
};

const rightVentricularRegionLabels: Record<RightVentricularRegionId, string> = {
  RV_BASAL: 'Right-ventricular basal region',
  RV_MID: 'Right-ventricular mid region',
  RV_APICAL: 'Right-ventricular apical region',
};

export const getMyocardialRegionLabel = (region: MyocardialRegionReference): string =>
  region.scheme === 'AHA_17_LV'
    ? leftVentricularSegmentLabels[region.segmentId]
    : rightVentricularRegionLabels[region.segmentId];