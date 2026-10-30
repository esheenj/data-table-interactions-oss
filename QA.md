# Preview validation and open checks

This is an experimental source preview, accepted for publication by the owner on 30 October 2026. That acceptance is not a claim of complete accessibility, browser compatibility or production readiness.

## Evidence

- Dependency-free Node model checks pass; the mobile suite also exercises focus/error recovery through a small DOM harness. Run `npm test` and `npm run demo` from a clean checkout.
- Prior automated Chromium checks covered 320×740, 360×740, 740×360, 740×1100 and 1100×740 CSS-pixel viewports, without observed page errors or unexpected network requests. Those are historical checks, not a repeat against every later revision.
- Owner phone recordings show narrow and expanded layouts, touch selection, Back/input focus and table filter/sort/page-size interactions. The recordings have no audio track and do not establish screen-reader announcements or the entire Finish/Reset journey.
- A recorded dark-mode primary-button contrast problem was corrected with explicit white-on-blue colors and a system forced-colors fallback. Actual corrected device rendering remains an open check.

## Reproduce and contribute evidence

Record the exact commit, device, browser/version, CSS viewport, zoom, keyboard or touch method, and screen reader/version where used. Report observable expected/actual behavior with synthetic data. Do not upload recordings containing private browser tabs, personal data or credentials.

- [ ] Complete and reset the mobile journey on a physical device.
- [ ] Recover from a missing selection and a short label using keyboard and TalkBack/NVDA/VoiceOver.
- [ ] Check announcement order, associated errors and focus visibility.
- [ ] Check portrait/landscape and 200%/400% zoom, including local table scrolling.
- [ ] Check corrected primary-button rendering in light, dark and forced-colors modes.
- [ ] Exercise table empty-state recovery and multiple-page navigation.

Publish only checks actually performed. A numeric color calculation, unit test or owner visual acceptance does not establish WCAG conformance.
