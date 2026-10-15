# Header Redesign Research and Decision Record

## Problem observed

The prior header treated more than a dozen unrelated actions as equal-priority, always-visible buttons. It forced horizontal density, made scanning difficult, and created small adjacent touch targets. This is especially risky in a clinical-style interface: safety status competes with exports, dataset exploration, comparison, and session tools.

## Evidence applied

- AHRQ identifies clinical workflow and cognitive load as core dimensions of health-IT design; an interface should provide task-relevant information and avoid graphics or text that do not add value. [AHRQ: provider burden and health-IT design](https://digital.ahrq.gov/national-webinars/reducing-provider-burden-through-better-health-it-design), [AHRQ: EHR usability](https://digital.ahrq.gov/file/26269/download?token=KqxW_WMc)
- HealthIT guidance cautions that alerts should be used sparingly for imminent risk, because excessive false alarms desensitize users. The redesign therefore keeps the alarm control continuously visible but does not make ordinary tools look like alarms. [HealthIT: integrating clinical decision support into workflows](https://www.healthit.gov/sites/default/files/clinical-decision-support-0913.pdf)
- WCAG reflow calls for preserving information and functionality at the equivalent of 320 CSS pixels without two-dimensional scrolling for normal content. [W3C: Understanding Reflow](https://www.w3.org/WAI/WCAG21/Understanding/reflow)
- W3C’s target-size guidance uses a 44 × 44 CSS-pixel example for touch targets and notes the benefit for touch, tremor, and one-handed use. [W3C: Understanding Target Size](https://www.w3.org/WAI/WCAG21/Understanding/target-size)
- The grouped tool controls use a disclosure pattern, not an ARIA `menu`, because these commands are ordinary buttons rather than a desktop-style menu widget. W3C notes that typical navigation should not use menu roles unless it implements the associated complex behavior. [W3C: Disclosure navigation pattern](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/)

## Implemented information architecture

```text
Always visible
  Brand + active patient + masking + connection + alarms + emergency rest

Clinical tools
  Live heart, imaging gate

Review & export
  Save snapshot, saved snapshots, signed report, audit trail

Data & analysis
  FHIR/EHR, public datasets, compare patients, 48-hour projection
```

Desktop presents the three task groups as named disclosures. Mobile exposes alarms and emergency rest in the compact first row, keeps patient context/masking/connection in the second row, and opens the same complete action set in a vertically reflowing tools panel. Every mobile action has a minimum 44 px target area.

## Accessibility behavior

- Disclosure controls report expanded state and the controlled region.
- Escape closes open patient, role, and tool disclosures.
- Each action remains a native button, preserving normal Tab and Enter/Space behavior.
- The header inherits the application-wide visible focus ring and reduced-motion preference handling.

## Acceptance checks for a real browser

1. At 320, 375, 768, 1024, and 1440 px, verify no header content is clipped and no horizontal page scrolling is introduced.
2. At 200% and 400% browser zoom, verify patient context, alarm count, rest mode, and mobile tools remain operable.
3. With keyboard only, open and close every disclosure with Enter/Space and Escape; verify focus visibility.
4. With a screen reader, verify the mobile tools, patient switcher, role switcher, alarm count, and masking state have useful names and states.
5. Have representative users time the following: identify active patient and connection, open imaging provenance, save a snapshot, prepare a report, and access audit history.

## Safety limitation

This research-demo UI must not be used for clinical diagnosis, patient-specific treatment, or medical-device control. The header organization does not change that limitation.
