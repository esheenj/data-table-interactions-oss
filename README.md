# Data Table Interactions

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

## API v1

| Export | Contract |
| --- | --- |
| assertRows(rows) | Validates at most 1,000 rows; throws TableError |
| deriveTable(rows, options) | Returns rows, total, page, pageCount, pageSize, start, end, hasPrevious, hasNext |

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

## Limitations and checks

This is a reference starter, not a production framework or WCAG certification. Unit tests cover model behavior, not every browser or assistive technology. Released as an experimental source preview after maintainer review and owner visual acceptance. Real-phone recordings show narrow and expanded layouts and selected interactions. Automated model/focus checks and prior Chromium checks are distinct evidence; screen-reader announcements, full physical-device journey, high zoom and the corrected button rendering are not fully verified. See [QA.md](QA.md) for the open checks. No production backend, private API gateway or credentials are required or included.

## Contribute

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
