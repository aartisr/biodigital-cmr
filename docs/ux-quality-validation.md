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
| Initial entry bundle | 394.01 kB / 117.41 kB gzip |
| 3D anatomy chunk | 572.85 kB / 145.97 kB gzip, loaded only from Imaging/full-screen anatomy |

## Browser validation completed on 2026-10-14

- At 320, 375, 390, 768, 1024, and 1440 px, the compact infarct summary remained inside the viewport with no document-level horizontal overflow.
- The inspected summary contained one labelled region, no duplicate element IDs, and no interactive controls.
- Long segment labels, source-state labels, and multi-line limitations wrapped without overlap down to 320 px.
- Keyboard traversal across the research review workspace retained a visible native 3 px focus outline.
- Browser emulation with reduced motion enabled completed without hidden summary content or layout displacement.
- Live role transitions confirmed ICU presentation suppresses segment and source-reference detail while Research presentation exposes source references without changing the underlying facts.
- The trend methodology icon was discovered as an unnamed keyboard target, corrected with an accessible name and disclosure semantics, and protected by an automated rendering test.
- The 320 px footer initially overflowed by 8 px; both metadata groups now wrap and the viewport retest passes.
- The 1024 px desktop header initially squeezed the patient selector to 24 px; the header now retains its compact composition until the xl breakpoint and the retest passes with no visible overflow.
- The regeneration projection surface now uses the shared labelled dialog shell. Its unavailable state exposes the reasons, required information, model identifier, version, and status without rendering projection controls.
- Live browser checks confirmed initial focus on the labelled close control, focus wrapping from first to last and last to first, Escape close, and restoration to the invoking Projection control while telemetry continued updating.
- At 320 x 700 px, the projection dialog remained between x=8 and x=312, had zero internal horizontal overflow, and retained a vertically scrollable body.
- Eligible viewer-only output and research what-if controls pass server-rendered capability tests. Eligible projection behavior has not yet been exercised in the browser because the active browser cohort is intentionally ineligible.

## Manual validation still required

The following checks still require execution before a clinical-facing release:

1. Extend the completed compact-summary viewport matrix to every workspace and overlay; the summary path itself passes at 320, 375, 390, 768, 1024, and 1440 px.
2. Complete keyboard opening, trapping, closing, and focus restoration for every remaining overlay; the regeneration projection overlay now passes this lifecycle.
3. Test with VoiceOver, NVDA, or equivalent: confirm workspace labels, summary source states, status announcements, dialog titles, and research-only messaging are announced coherently.
4. Execute clinician task tests: identify the patient and freshness, review an alert, inspect the 3D provenance gate, review therapy context, save a snapshot, and prepare a report. Record time, errors, and ambiguity.
5. Run a device-network performance profile, including cold start and opening 3D anatomy. The large 3D chunk is an optimization target only if its on-demand experience is unacceptable.

## Known limitations

- Responsive browser checks cover the compact summary across the full planned width matrix and the unavailable projection dialog at 320 and 1440 px; the full workspace/overlay matrix, eligible projection browser state, and assistive-technology testing remain open.
- The project contains simulated telemetry and is not validated for clinical diagnosis, treatment, or production medical-device use.
