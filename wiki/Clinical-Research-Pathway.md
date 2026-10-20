# Clinical-Research Pathway

[Live prototype](https://bdcmr.ai-aarti.com) · [[Home]] · [Creator: Aarti Sri Ravikumar](https://ai-aarti.com)

## A deliberate sequence

The responsible route to real-world usefulness begins with a narrow, clinician-reviewed research workflow—not autonomous diagnosis or treatment control.

1. Define one intended use, users, inputs, outputs, exclusions, and human-review responsibility.
2. Establish approved identity, server authorization, audit, privacy, security, and governance controls.
3. Start with de-identified cine cardiac-MR studies through an approved DICOMweb gateway.
4. Require image-quality checks and qualified clinician acceptance of segmentation before rendering or measurement.
5. Validate measurements against independent reference standards and representative sites.
6. Decide whether clinical use is warranted only after evidence, governance, and regulatory assessment support it.

## Current implementation boundary

The browser application intentionally has no clinical transport. Its clinical-research gateway fails closed; it cannot authorize access, retrieve a study manifest, or create an immutable audit trail. That behavior is a safety feature, not a missing demo interaction.

Visit the [live research prototype](https://bdcmr.ai-aarti.com) for the current, simulation-only experience.
