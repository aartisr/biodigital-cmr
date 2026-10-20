# Security policy

## Scope

BD-CMR is a simulation-only research prototype. It must not receive, store, or transmit PHI, DICOM studies, clinical credentials, or production access tokens. Reports of a suspected exposure or a path that could enable one are security issues.

## Reporting

Do not open a public issue for a potential vulnerability. Contact the project owner privately with:

- a concise description and affected file or feature;
- reproduction steps or a proof of concept that does not use real patient data; and
- the potential impact and any suggested mitigation.

The project will acknowledge reports, investigate, and coordinate a fix before public disclosure. Do not use a suspected vulnerability to access data, disrupt service, or attempt access beyond the minimum needed to demonstrate the issue.

## Production boundary

Any future clinical-research deployment requires its own security program: threat modeling, vendor review, identity and access controls, audit monitoring, penetration testing, incident response, and an approved healthcare environment. This static repository is not that deployment.
