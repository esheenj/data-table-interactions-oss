# Good first contributions — Data Table Interactions

These are small, testable suggestions. Check the public Issues list first to avoid duplicate work; do not assume a task is assigned.

1. **CSV edge-case regression:** add a `tests/csv-export.test.mjs` case for a fictional formula-looking name preceded by an unusual whitespace character. Record the expected quoted CSV and state that mitigation does not guarantee safety in every spreadsheet importer.
2. **Keyboard table navigation:** add a focused Playwright assertion in `tests/browser_table.py` for keyboard focus retention after clearing filters or changing sort; verify in the actual staged public artifact and note any untested screen readers.
3. **Empty-state recovery copy:** improve the fictional empty state and verify that search/category filters and the local export button recover correctly. Include a before/after reproduction and a Node or browser regression.

For code changes, run `npm test`, `npm run demo` and, if browser behavior changes, `python3 tests/browser_table.py` after installing its pinned test-only requirements. Never use real records, internal assets, credentials or customer material.
