# Publishing the fictional Data Table demo with GitHub Pages

This is an original public, dependency-free ESM browser demo. The offline project does **not** gain a live website merely because its repository is public.

## Exact static bundle, locally

```sh
npm test
node scripts/stage-pages.mjs dist/pages
TABLE_DEMO_ROOT=dist/pages python3 tests/browser_table.py
```

The browser check needs Chrome/Chromium and the pinned **test-only** Playwright dependency from `tests/browser-requirements.txt`; the GitHub CI job installs it. The staged artifact contains only `index.html`, three `src/*.mjs` files, one `examples/data.mjs` and `.nojekyll`, with no repository history, internal instructions or unrelated files. The stage operation refuses existing folders and refuses unallowlisted files.

## One-time Pages setup

With GitHub repository admin rights: **Settings → Pages → Build and deployment → Source → GitHub Actions** for `esheenj/data-table-interactions-oss`.

The trusted `Publish CI-verified fictional data table` workflow waits for a **successful `Offline checks` main-push run**, checks out its exact SHA, rejects an outdated source commit if `main` moved, verifies Pages is enabled and configured for Actions, then uploads only the reviewed public static bundle using GitHub first-party Pages actions. No pull request deployment and no broad administrator token in CI.

A green source CI run **does not** prove publication. GitHub's built-in `GITHUB_TOKEN` cannot switch on Pages using `configure-pages`; admin configuration is needed once. If the workflow reports Pages disabled, enable it and make another tested main source commit to trigger an authentic new deployment.

## Live acceptance

Confirm the deployment job succeeded and inspect its actual `page_url`, then open that HTTPS URL in a browser. Verify a synthetic name filter, category and numerical sort, empty-state reset, download of **all** filtered rows, and layout/keyboard navigation at 320px and desktop. Record the actual URL and limitations before advertising a live demo.

The CSV prefix strategy mitigates common spreadsheet-formula triggers but **cannot guarantee** safety across spreadsheet tools. No real records, server-side actions or account handling exist. Real browser checks are not WCAG certification or independent screen-reader proof.

Rollback by reverting the public source and passing exact-head CI again; an admin may disable Pages in Settings if necessary. R0 additional recurring infrastructure cost.
