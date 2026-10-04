# Patient-Specific Diagnostic Anatomy Pathway

## Status and scope

This repository currently provides a **research-only, simulated visualization**. It does not ingest DICOM, create a patient-derived segmentation, calculate validated measurements, or have regulatory authorization for diagnostic use. No current screen, report, model, or treatment recommendation may be used for diagnosis or patient management.

The application now includes a visible imaging-readiness gate. It deliberately blocks diagnostic status until every release criterion below is fulfilled and evidenced.

## Intended-use decision (must precede development)

Write and approve one narrow intended-use statement. Start with clinician-reviewed visualization from a specified modality; do not begin with autonomous diagnosis or treatment guidance. Define the users, care setting, target population, input modality, outputs, known failure modes, and human review responsibility.

Processing or analyzing medical images can place software within medical-device oversight. Regulatory counsel and a clinical safety lead must determine the applicable jurisdictional pathway before clinical deployment.

## Target architecture

```text
PACS / VNA → authenticated DICOMweb gateway → immutable study manifest
          → acquisition QC → segmentation service → DICOM SEG / label map
          → clinician contour review + acceptance → versioned mesh + measurements
          → research viewer / approved clinical workflow
```

Keep the original study, segmentation, measurement version, model version, reviewer, timestamps, and rendered output linked by immutable identifiers. Use DICOM references rather than copying identity or image payloads into browser state.

## Required implementation work

1. **DICOM intake** — authenticated, least-privilege PACS/DICOMweb integration; validate study, series, orientation, spacing, and modality-specific acquisition requirements.
2. **Image-quality control** — make incomplete coverage, motion artifact, poor contrast, wrong phase, and invalid geometry explicit failures rather than silently rendering a model.
3. **Segmentation** — create LV/RV blood-pool, myocardium, atria, scar, and optionally coronary labels. Persist masks as DICOM Segmentation or Label Map objects; retain their source-study references.
4. **Clinician review** — provide multi-planar source images with editable contours, overlay comparison, acceptance/rejection, reviewer identity, and reason for change. A model may propose contours; it must not finalize them.
5. **Patient-specific reconstruction** — generate a mesh only from an accepted segmentation. Preserve physical units, orientation, smoothing parameters, and mesh version. Never overwrite the raw study or accepted mask.
6. **Measurements** — compute only documented, modality-appropriate measures and display method, units, confidence/quality flag, software version, and source references beside every number.
7. **Interoperability and auditability** — link the case to DICOM Study/Series/Instance UIDs and, where applicable, FHIR ImagingStudy and DiagnosticReport resources. Record viewing, edits, acceptance, exports, and access events.

## Evidence and safety gates

Before a diagnostic release, the organization must establish and approve:

- modality-specific ground truth and independent test data;
- representative multi-site validation across scanners, patient populations, and relevant disease states;
- segmentation agreement and measurement accuracy acceptance criteria set by clinical leadership;
- human-factors validation for the clinician-review workflow;
- risk management, software verification/validation, cybersecurity, privacy, incident response, and change control;
- regulatory assessment and, if required, authorization before marketing or diagnostic use;
- post-deployment monitoring, rollback, and model-change governance.

## Initial narrow milestone

Build a research-only cine cardiac MR workflow first:

1. ingest a de-identified study through an approved DICOMweb gateway;
2. perform source-image QC;
3. create LV/RV/myocardium segmentations;
4. require a credentialed clinician to correct and accept contours;
5. render only the accepted mesh and LV/RV volume measurements with full provenance;
6. compare measurements against an independently reviewed reference set.

Only after this sequence is validated should scar imaging, cardiac CTA, automated segmentation, or any diagnostic claim be considered.

## References

- FDA, [Clinical Decision Support policy navigator — medical-image analysis](https://www.fda.gov/medical-devices/digital-health-center-excellence/step-6-software-function-intended-provide-clinical-decision-support)
- DICOM, [Segmentation and Label Map Storage SOP Classes](https://dicom.nema.org/medical/dicom/2024d/output/chtml/part04/sect_B.5.html)
- FDA, [Good Machine Learning Practice guiding principles](https://www.fda.gov/medical-devices/software-medical-device-samd/good-machine-learning-practice-medical-device-development-guiding-principles)
