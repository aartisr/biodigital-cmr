# MI Segment Surface Strategy Review

> Candidate schematic coordinates only. This document does not record approval and does not enable rendering.

## Strategy Metadata

- Schema: `segment-surface-strategy/1.0.0`
- Strategy: `bdcmr-segment-surface-candidate`
- Version: `0.1.0`
- Enabled: `false`
- Review state: `REQUIRES_CLINICAL_REVIEW`
- Content owner: BD-CMR research simulation team

## Limitations

- Candidate normalized coordinates require clinical and imaging review before renderer activation.
- The strategy is schematic and is not derived from patient source imaging or segmentation.

## Candidate Placements

| Region key | Region | u | v | Radial offset | Preferred camera |
| --- | --- | ---: | ---: | ---: | --- |
| `AHA_17_LV:1` | Basal anterior | 0.020 | 0.240 | 0.080 | SHORT_AXIS |
| `AHA_17_LV:2` | Basal anteroseptal | 0.187 | 0.240 | 0.080 | SHORT_AXIS |
| `AHA_17_LV:3` | Basal inferoseptal | 0.353 | 0.240 | 0.080 | SHORT_AXIS |
| `AHA_17_LV:4` | Basal inferior | 0.520 | 0.240 | 0.080 | SHORT_AXIS |
| `AHA_17_LV:5` | Basal inferolateral | 0.687 | 0.240 | 0.080 | SHORT_AXIS |
| `AHA_17_LV:6` | Basal anterolateral | 0.853 | 0.240 | 0.080 | SHORT_AXIS |
| `AHA_17_LV:7` | Mid anterior | 0.020 | 0.480 | 0.080 | SHORT_AXIS |
| `AHA_17_LV:8` | Mid anteroseptal | 0.187 | 0.480 | 0.080 | SHORT_AXIS |
| `AHA_17_LV:9` | Mid inferoseptal | 0.353 | 0.480 | 0.080 | SHORT_AXIS |
| `AHA_17_LV:10` | Mid inferior | 0.520 | 0.480 | 0.080 | SHORT_AXIS |
| `AHA_17_LV:11` | Mid inferolateral | 0.687 | 0.480 | 0.080 | SHORT_AXIS |
| `AHA_17_LV:12` | Mid anterolateral | 0.853 | 0.480 | 0.080 | SHORT_AXIS |
| `AHA_17_LV:13` | Apical anterior | 0.020 | 0.700 | 0.080 | APICAL |
| `AHA_17_LV:14` | Apical septal | 0.270 | 0.700 | 0.080 | APICAL |
| `AHA_17_LV:15` | Apical inferior | 0.520 | 0.700 | 0.080 | APICAL |
| `AHA_17_LV:16` | Apical lateral | 0.770 | 0.700 | 0.080 | APICAL |
| `AHA_17_LV:17` | Apex | 0.020 | 0.880 | 0.060 | APICAL |
| `SCHEMATIC_RV:RV_BASAL` | Right-ventricular basal region | 0.120 | 0.240 | 0.120 | ANTERIOR |
| `SCHEMATIC_RV:RV_MID` | Right-ventricular mid region | 0.150 | 0.480 | 0.120 | ANTERIOR |
| `SCHEMATIC_RV:RV_APICAL` | Right-ventricular apical region | 0.180 | 0.700 | 0.120 | ANTERIOR |

## Acceptance Criteria

- [ ] Coordinate review confirms every LV and RV center follows the intended segmentation convention and contains no duplicate placement.
- [ ] Camera review confirms each preferred view makes the referenced region inspectable without misleading occlusion.
- [ ] Scar-shape review defines explicit rules for visual extent and depth before any mesh dimensions are implemented.
- [ ] Border-zone review defines explicit topology and width rules before border geometry is implemented.
- [ ] Representative-fixture review confirms anterior, inferior, septal, lateral, posterior, apical, multiregion, and RV examples.
- [ ] Governance review records reviewer identity and date before changing the strategy to `REVIEWED`.
- [ ] Runtime rollout is approved separately before changing `enabled` to `true`.

## Prohibited Until Review

- Do not derive scar size from segment count.
- Do not derive transmural thickness from the depth label.
- Do not invent border-zone width or morphology.
- Do not connect this strategy to `Real3DHeartCanvas`.