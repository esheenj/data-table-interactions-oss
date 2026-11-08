# Preview validation and open checks

This is an experimental source preview, accepted for publication by the owner on 30 October 2026. That acceptance is not a claim of complete accessibility, browser compatibility or production readiness.

## Evidence

- Dependency-free Node model checks pass; the mobile suite also exercises focus/error recovery through a small DOM harness. Run `npm test` and `npm run demo` from a clean checkout.
- Prior automated Chromium checks covered 320×740, 360×740, 740×360, 740×1100 and 1100×740 CSS-pixel viewports, without observed page errors or unexpected network requests. Those are historical checks, not a repeat against every later revision.
- Owner phone recordings show narrow and expanded layouts, touch selection, Back/input focus and table filter/sort/page-size interactions. The recordings have no audio track and do not establish screen-reader announcements or the entire Finish/Reset journey.
- A recorded dark-mode primary-button contrast problem was corrected with explicit white-on-blue colors and a system forced-colors fallback. Actual corrected device rendering remains an open check.

## Reproduce and contribute evidence

### Current automated browser regression

`python3 -m pip install -r tests/browser-requirements.txt` followed by
`python3 tests/browser_table.py` uses an installed Chrome/Chromium (override with
`BROWSER_EXECUTABLE`). Python 3.10+ is required. Playwright is MIT-licensed and
test-only; no application runtime dependency or browser download is added.

The existing PR workflow runs four real-browser cases alongside the retained
Node 20/22/24 isolated model suites. Cases exercise actual Tab/Enter sorting and
focus, combined filters, empty recovery, pagination reset, an actual local CSV
download containing rows beyond the visible page, and keyboard table scrolling
at 320px. Layouts also cover 375/812/1440px. A loopback static server and fresh
browser contexts isolate synthetic fixtures; unexpected external page requests
or script errors fail the test. Network installation of the test driver is
separate from page-level request checks and the existing isolated Node tests.

Falsifiable alternative: DOM-harness/model tests pass while real native controls,
focus, scrolling or browser downloads fail. These cases independently check the
rendered adapter. They do not establish screen-reader announcements, real-device,
actual browser zoom, forced-colors behavior, spreadsheet safety or WCAG compliance.

### Independent checks still needed

Record the exact commit, device, browser/version, CSS viewport, zoom, keyboard or touch method, and screen reader/version where used. Report observable expected/actual behavior with synthetic data. Do not upload recordings containing private browser tabs, personal data or credentials.

- [ ] Complete and reset the mobile journey on a physical device.
- [ ] Recover from a missing selection and a short label using keyboard and TalkBack/NVDA/VoiceOver.
- [ ] Check announcement order, associated errors and focus visibility.
- [ ] Check portrait/landscape and 200%/400% zoom, including local table scrolling.
- [ ] Check corrected primary-button rendering in light, dark and forced-colors modes.
- [ ] Exercise table empty-state recovery and multiple-page navigation.

Publish only checks actually performed. A numeric color calculation, unit test or owner visual acceptance does not establish WCAG conformance.

