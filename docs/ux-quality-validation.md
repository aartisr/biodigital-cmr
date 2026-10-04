# UX Quality Validation

## Scope

Stage 7 verifies the workspace shell against the UX redesign acceptance criteria. This demo remains research-only and must not be interpreted as patient-specific diagnostic software.

## Implemented quality safeguards

- The workspace switcher uses the WAI-ARIA tab pattern: selected state, tab panel relationship, roving tab stop, and `ArrowLeft`, `ArrowRight`, `Home`, and `End` navigation.
- At narrow widths the five workspace choices use an icon-only, five-column layout with accessible names and native titles. At `sm` and above, labels return. This prevents the primary navigation from requiring horizontal scrolling at 320–375 px.
- Interactive elements receive a high-contrast visible focus ring when navigated by keyboard.
- Users who request reduced motion receive effectively disabled transitions and animations.
- A keyboard-visible “Skip to active workspace” link bypasses the persistent header and navigation directly to the active tab panel.
- The shared `ModalShell` now moves focus into its dialog, traps `Tab` navigation, supports `Escape`, and restores the invoking control on close.
- Asynchronous workspace modules and overlays announce loading through a polite status region.
- Snapshot confirmation uses a polite live status region.
- Heavy workspace panels and modal features mount only when their workspace or overlay is opened, preserving lazy loading rather than merely declaring lazy imports.
- Optional Monitoring, Imaging, Therapy, and Review features are isolated by recoverable error boundaries, so an individual feature failure does not unmount the clinical shell.
- The application remembers the selected workspace only. The preference is guarded for privacy-restricted browsers and does not persist patient, telemetry, dosing, pacing, or other clinical data.

## Automated verification

| Check | Result |
| --- | --- |
| TypeScript (`npm run lint`) | Passing |
| Production bundle (`npm run build`) | Passing |
| Initial entry bundle | 380.67 kB / 113.24 kB gzip |
| 3D anatomy chunk | 572.77 kB / 145.97 kB gzip, loaded only from Imaging/full-screen anatomy |

## Manual validation still required

No browser surface was available in this environment, so the following checks require execution in a real browser before a clinical-facing release:

1. At 320, 375, 768, 1024, and 1440 px, confirm there is no horizontal page scroll and every workspace action remains visible and usable.
2. Use only the keyboard: tab through controls, change workspaces with arrow keys, and verify focus remains visible and expected after each overlay opens and closes.
3. Test with VoiceOver, NVDA, or equivalent: confirm workspace labels, status announcements, dialog titles, and research-only messaging are announced coherently.
4. Execute clinician task tests: identify the patient and freshness, review an alert, inspect the 3D provenance gate, review therapy context, save a snapshot, and prepare a report. Record time, errors, and ambiguity.
5. Run a device-network performance profile, including cold start and opening 3D anatomy. The large 3D chunk is an optimization target only if its on-demand experience is unacceptable.

## Known limitations

- Visual responsive and assistive-technology testing have not been performed in this environment.
- The project contains simulated telemetry and is not validated for clinical diagnosis, treatment, or production medical-device use.
