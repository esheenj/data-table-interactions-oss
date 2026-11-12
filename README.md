# Data Table Interactions

**Explore the Esheen Labs gallery:** [Try 30 open-source browser demos and developer playgrounds](https://esheenj.github.io/compound-intelligence-starter/) across nine independent public repositories, now also featuring [Prompt Evaluation Harness](https://esheenj.github.io/prompt-evaluation-harness-oss/) and [Agent Capability Policy Lab](https://esheenj.github.io/agent-capability-policy-lab/). All examples are fictional; 30 pages does **not** mean 30 standalone repos (21 add-ons live within the original seven).

**Who this is for:** Explore search, sorting, filtering and CSV export on safe fictional data.

**[Open the GitHub-deployed synthetic data table and CSV demo](https://esheenj.github.io/data-table-interactions-oss/)** — [GitHub Pages deployment](https://github.com/esheenj/data-table-interactions-oss/actions/runs/42476118286) succeeded on **9 November 2026**. The seven-project collection separately passed a bounded independent public HTTPS Chrome check on 11 November 2026 ([acceptance evidence](https://github.com/esheenj/compound-intelligence-starter/actions/runs/43064815195)); physical-device and assistive-technology acceptance are not claimed.

[![Offline checks](https://github.com/esheenj/data-table-interactions-oss/actions/workflows/test.yml/badge.svg)](https://github.com/esheenj/data-table-interactions-oss/actions/workflows/test.yml)

**Experimental source preview · MIT · zero runtime dependencies**

Offline table filtering, stable sorting and pagination over synthetic rows with semantic HTML.

A small, reusable reference for developers building human-centered interfaces. MIT licensed. No runtime packages, telemetry, account, keys or remote backend.

## Run

Node.js 20+ and Python 3 for the browser demo:

```sh
git clone https://github.com/esheenj/data-table-interactions-oss.git
cd data-table-interactions-oss
npm test
npm run demo
python3 -m http.server 8000 --bind 127.0.0.1
```

Open http://127.0.0.1:8000 on the same computer. No npm install is required. The package is source-only; private:true prevents accidental registry publishing.

## Features

- Combine case-insensitive name search with category filters.
- Stable text/numeric sorting, clamped pagination and empty states.
- Semantic table, sortable headers, live counts and native controls.
- Pure validation/query model, deterministic synthetic demo and regression tests.
- **Download filtered CSV** locally: export every matching row in the selected order, even across pages. No upload, account or backend.

## API v1

| Export | Contract |
| --- | --- |
| assertRows(rows) | Validates at most 1,000 rows; throws TableError |
| deriveTable(rows, options) | Returns rows, total, page, pageCount, pageSize, start, end, hasPrevious, hasNext |
| exportFilteredCSV(rows, options) | Returns `{ rowCount, csv }` for **all** matching rows using the same validated query/sort, irrespective of current page |

Each row: unique lowercase id (1–48 letters/digits/hyphens), name (1–80 characters), category (design/research/engineering), integer score (0–100). Options: search (up to 100 characters), category (or all), sortBy (name/category/score), direction (asc/desc), page (positive integer), pageSize (1–50). Requested pages clamp to the last page. Empty results have pageCount 1 and start/end 0. Sorting preserves equal-value order in either direction. Returned row references are not a privacy sanitizer: supply synthetic or properly authorized data only.

## Minimal query example

```js
import { deriveTable } from './src/table.mjs';
import { sampleRows } from './examples/data.mjs';
const view = deriveTable(sampleRows, {
  category: 'research', sortBy: 'score', direction: 'desc', pageSize: 4
});
console.log(view.rows, view.total, view.hasNext);
```

Keep source rows immutable and derive a new view when controls change. The pure model is independent of the semantic HTML adapter. Arbitrary returned row fields are not stripped or sanitized.

## Local CSV export

Use the **Download filtered CSV** button in the browser demo or call `exportFilteredCSV` from `src/export.mjs`. It includes headers `ID, Name, Category, Score`, follows the search/category/sort controls, and exports all matching records even when the table is paginated. Empty filters produce only the header; the browser disables the download button for zero matches. The browser downloads a local `data:` URL and does not send requests.

Cells are quoted, quotes are doubled, and formula-like strings beginning with `=`, `+`, `-` or `@` (including after whitespace) receive a leading apostrophe. This is **defense in depth, not guaranteed protection across spreadsheet applications or import settings**. Never export secrets, private research, real customer data or unknown spreadsheet formulas from this teaching demo. The CSV serializer intentionally includes only the four documented public fields, even when synthetic input objects have additional fields.

## Public demo readiness and contribution entry

To create the **exact allowlisted static browser bundle**, run `node scripts/stage-pages.mjs dist/pages`. Public CI now tests that staged source with real Chrome, including filtering, sorting, keyboard navigation and an actual synthetic CSV download. [Enable and verify GitHub Pages](docs/PAGES_RELEASE.md) before sharing a hosted URL: GitHub Pages has now deployed successfully; independent browser acceptance remains pending.

New contributors can start from [scoped fictional tasks](docs/GOOD_FIRST_ISSUES.md), follow [CONTRIBUTING.md](CONTRIBUTING.md), and use the structured bug-report and PR templates. Tests do not certify screen-reader or physical-device accessibility.

## Limitations and checks

This is a reference starter, not a production framework or WCAG certification. Unit tests cover model behavior, not every browser or assistive technology. Released as an experimental source preview after maintainer review and owner visual acceptance. Real-phone recordings show narrow and expanded layouts and selected interactions. Automated model/focus checks and prior Chromium checks are distinct evidence; screen-reader announcements, full physical-device journey, high zoom and the corrected button rendering are not fully verified. See [QA.md](QA.md) for the open checks. No production backend, private API gateway or credentials are required or included.

## Contribute

For the optional real Chrome interaction/download regression, see the commands,
test-only dependency and remaining device/accessibility limits in [QA.md](QA.md).
The default `npm test` and runtime still require no dependency installation.

Start with [CONTRIBUTING.md](CONTRIBUTING.md), [AGENTS.md](AGENTS.md), bug reports or feature requests. Useful feedback includes a synthetic reproduction, exact revision and observable expected result. Follow [community conduct](CODE_OF_CONDUCT.md) and [private vulnerability reporting](SECURITY.md).

## Roadmap

Complete the open device/accessibility matrix, improve examples and add focused integration tests based on real use cases. Propose a small synthetic reproduction in Issues. No adoption metrics are claimed.

[License](LICENSE) · [Design System Foundations](https://github.com/esheenj/design-system-foundations-oss)



## For AI-assisted contributions

Read [AGENTS.md](AGENTS.md), [CONTRIBUTING.md](CONTRIBUTING.md) and the machine-readable [project-manifest.json](project-manifest.json). Inspect current source and tests before editing. Keep changes small, fixtures synthetic and verification explicit. The manifest describes this public source; it grants no access or execution authority.

## Related public tools

- [Mobile-first Flow Kit](https://github.com/esheenj/mobile-first-flow-kit-oss)
- [Data Table Interactions](https://github.com/esheenj/data-table-interactions-oss)
- [Design System Foundations](https://github.com/esheenj/design-system-foundations-oss)


## Additional hosted tool: Synthetic Experiment Worksheet

The [fictional offline experiment worksheet](https://esheenj.github.io/data-table-interactions-oss/experiment.html) models two invented cohorts, computes transparent descriptive conversion/error rates and shows an illustrative error guardrail with explicit HOLD and insufficient-sample states. The pure model is in `src/experiment.mjs`, with Node tests at `tests/experiment.test.mjs`, and it is independently exercised by staged Chrome browser QA.

This is not a genuine experiment, randomization, significance test, causal inference or shipping recommendation. No private source, accounts, network, uploads or telemetry. It is an additional public tool inside this existing MIT repository; publishing source and CI does not by itself verify external HTTPS reachability.

## Additional hosted tool: Data Quality Observatory

The [offline Data Quality Observatory](https://esheenj.github.io/data-table-interactions-oss/quality.html) processes only an explicitly supplied small fictional JSON array in the browser. It flags duplicate or missing IDs, missing labels or scores, stale fictional values and example scores outside a documented range, then provides per-record issues. `src/data-quality.mjs` is a strict 1–50-row pure model, with deterministic negative cases and staged real Chrome regression checks. The Pages stager publishes only the enumerated static source files.

No network, accounts, telemetry, private source or actual records are part of this tool. Heuristics are not production-grade dataset reliability, compliance, confidentiality or source provenance guarantees. **This is a new working tool inside an existing public repository, not another independently created repo.**
