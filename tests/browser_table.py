"""Real Chrome checks of synthetic table controls and downloaded CSV.

Playwright is MIT licensed and test-only. No production data or private source.
"""
import csv
import functools
import http.server
import io
import os
from pathlib import Path
import shutil
import tempfile
import threading
import unittest
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *_):
        pass


class TableBrowserTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        executable = os.environ.get('BROWSER_EXECUTABLE') or next(
            (p for name in ('google-chrome', 'chromium', 'chromium-browser')
             if (p := shutil.which(name))), None)
        if not executable:
            raise RuntimeError('Chrome/Chromium is required; no skipped browser pass')
        cls.engine = sync_playwright().start()
        cls.addClassCleanup(cls.engine.stop)
        cls.browser = cls.engine.chromium.launch(executable_path=executable,
            headless=True, args=['--no-sandbox', '--disable-dev-shm-usage'])
        cls.addClassCleanup(cls.browser.close)
        print('Observed Chrome version:', cls.browser.version, flush=True)
        cls.server = http.server.ThreadingHTTPServer(('127.0.0.1', 0),
            functools.partial(QuietHandler, directory=str(ROOT)))
        cls.addClassCleanup(cls.server.server_close)
        cls.addClassCleanup(cls.server.shutdown)
        threading.Thread(target=cls.server.serve_forever, daemon=True).start()
        cls.origin = f'http://127.0.0.1:{cls.server.server_port}'

    def setUp(self):
        self.context = self.browser.new_context(accept_downloads=True,
            viewport={'width': 1440, 'height': 900})
        self.addCleanup(self.context.close)
        self.external, self.errors = [], []
        def route_local(route):
            if route.request.url.startswith(self.origin + '/'):
                route.continue_()
            else:
                self.external.append(route.request.url)
                route.abort()
        self.context.route('**/*', route_local)
        self.page = self.context.new_page()
        self.page.on('pageerror', lambda e: self.errors.append(str(e)))
        self.page.goto(self.origin)
        expect(self.page.locator('#pager')).to_have_text('1–4 of 8')

    def tearDown(self):
        self.assertEqual(self.external, [], 'Unexpected external resource request')
        self.assertEqual(self.errors, [], 'Browser script error')

    def names(self):
        return self.page.locator('#table-body tr td:first-child').all_text_contents()

    def test_keyboard_sort_focus_and_header_semantics(self):
        self.page.keyboard.press('Tab')
        expect(self.page.locator('#query')).to_be_focused()
        for selector in ('#category', '#page-size', '#clear', '.scroll',
                         '[data-sort="name"]', '[data-sort="category"]',
                         '[data-sort="score"]'):
            self.page.keyboard.press('Tab')
            expect(self.page.locator(selector)).to_be_focused()
        self.page.keyboard.press('Enter')
        expect(self.page.locator('th').nth(2)).to_have_attribute('aria-sort', 'ascending')
        self.assertEqual(self.names()[0], 'Illustrative survey study')
        self.page.keyboard.press('Enter')
        expect(self.page.locator('th').nth(2)).to_have_attribute('aria-sort', 'descending')
        expect(self.page.locator('[data-sort="score"]')).to_be_focused()
        self.assertEqual(self.names()[0], 'Demo performance test')
        expect(self.page.locator('th').nth(0)).to_have_attribute('aria-sort', 'none')

    def test_combined_filters_empty_recovery_and_page_reset(self):
        self.page.locator('#next').click()
        expect(self.page.locator('#page')).to_have_text('Page 2 of 2')
        self.page.locator('#query').fill('Synthetic')
        self.page.locator('#category').select_option('research')
        expect(self.page.locator('#pager')).to_have_text('1–2 of 2')
        expect(self.page.locator('#prev')).to_be_disabled()
        self.page.locator('#category').select_option('design')
        expect(self.page.locator('#empty')).to_be_visible()
        expect(self.page.locator('#pager')).to_have_text('0 matching records')
        expect(self.page.locator('#export')).to_be_disabled()
        expect(self.page.locator('#next')).to_be_disabled()
        self.page.locator('#clear').click()
        expect(self.page.locator('#query')).to_be_focused()
        expect(self.page.locator('#pager')).to_have_text('1–4 of 8')
        self.page.locator('#next').click()
        self.page.locator('#page-size').select_option('8')
        expect(self.page.locator('#page')).to_have_text('Page 1 of 1')
        self.assertEqual(len(self.names()), 8)

    def test_actual_csv_download_contains_all_matching_rows_not_only_visible_page(self):
        self.page.locator('[data-sort="score"]').click()
        self.page.locator('[data-sort="score"]').click()
        visible = self.names()
        self.assertEqual(len(visible), 4)
        with self.page.expect_download() as pending:
            self.page.locator('#export').click()
        download = pending.value
        self.assertEqual(download.suggested_filename, 'fictional-filtered-rows.csv')
        self.assertIsNone(download.failure())
        with tempfile.TemporaryDirectory(prefix='synthetic-table-csv-') as directory:
            target = Path(directory) / 'rows.csv'
            download.save_as(target)
            rows = list(csv.reader(io.StringIO(target.read_text(encoding='utf-8-sig'))))
        self.assertEqual(rows[0], ['ID', 'Name', 'Category', 'Score'])
        self.assertEqual(len(rows[1:]), 8)
        self.assertEqual([int(r[3]) for r in rows[1:]], [98, 91, 87, 84, 76, 74, 68, 62])
        self.assertTrue(any(r[1] not in visible for r in rows[1:]))
        expect(self.page.locator('#export-status')).to_contain_text('8 fictional matching rows')
        self.page.locator('#query').fill('no-fixture-matches-this')
        expect(self.page.locator('#export')).to_be_disabled()
        expect(self.page.locator('#export-status')).to_have_text('')

    def test_narrow_layout_keeps_page_bounded_and_table_keyboard_scrollable(self):
        for width, height in ((320, 740), (375, 812), (812, 375), (1440, 900)):
            with self.subTest(width=width):
                self.page.set_viewport_size({'width': width, 'height': height})
                self.assertTrue(self.page.evaluate(
                    'document.documentElement.scrollWidth <= innerWidth'))
                expect(self.page.locator('.scroll')).to_have_attribute('role', 'region')
        self.page.set_viewport_size({'width': 320, 'height': 740})
        self.page.locator('.scroll').focus()
        self.page.keyboard.press('ArrowRight')
        self.page.wait_for_function("document.querySelector('.scroll').scrollLeft > 0")
        expect(self.page.locator('.scroll')).to_be_focused()


if __name__ == '__main__':
    unittest.main(verbosity=2)
