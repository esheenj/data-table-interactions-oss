import test from 'node:test';
import assert from 'node:assert/strict';

class FakeElement {
  constructor(tag = 'div') {
    this.tagName = tag.toUpperCase();
    this.children = [];
    this.listeners = new Map();
    this.dataset = {};
    this.attributes = new Map();
    this.textContent = '';
    this.value = '';
    this.hidden = false;
    this.disabled = false;
    this.focused = false;
  }
  append(child) { this.children.push(child); }
  replaceChildren(...children) { this.children = children; }
  addEventListener(name, callback) { this.listeners.set(name, callback); }
  emit(name, value) {
    if (value !== undefined) this.value = value;
    const listener = this.listeners.get(name);
    assert.ok(listener, 'Missing ' + name + ' listener');
    listener({ target: this });
  }
  focus() { this.focused = true; }
  closest(selector) { assert.equal(selector, 'th'); return this.header; }
  setAttribute(name, value) { this.attributes.set(name, value); }
}
function createHarness() {
  const selectors = ['query', 'category', 'page-size', 'table-body', 'empty', 'pager', 'page', 'prev', 'next', 'clear'];
  const elements = Object.fromEntries(selectors.map(x => [x, new FakeElement()]));
  const sorts = ['name', 'category', 'score'].map(sort => {
    const button = new FakeElement('button');
    button.dataset.sort = sort;
    button.header = new FakeElement('th');
    return button;
  });
  const document = {
    createElement: tag => new FakeElement(tag),
    querySelector: selector => { assert.match(selector, /^#[a-z-]+$/); return elements[selector.slice(1)]; },
    querySelectorAll: selector => { assert.equal(selector, '[data-sort]'); return sorts; }
  };
  return { document, elements, sorts };
}
const pageState = h => ({
  page: h.elements.page.textContent,
  count: h.elements.pager.textContent,
  rows: h.elements['table-body'].children.map(row => row.children[0].textContent),
  previousDisabled: h.elements.prev.disabled,
  nextDisabled: h.elements.next.disabled,
  emptyVisible: !h.elements.empty.hidden
});

test('DOM adapter resets and recovers page across search, category, page-size and Clear', async () => {
  const h = createHarness();
  globalThis.document = h.document;
  try {
    await import('../src/app.mjs');
    assert.deepEqual(pageState(h), {
      page: 'Page 1 of 2', count: '1–4 of 8',
      rows: ['Demo performance test', 'Example prototype review', 'Fictional landing page', 'Illustrative survey study'],
      previousDisabled:true, nextDisabled:false, emptyVisible:false
    });
    h.elements.next.emit('click');
    assert.equal(pageState(h).page, 'Page 2 of 2');
    assert.equal(pageState(h).nextDisabled, true);
    h.elements.query.emit('input', 'Synthetic');
    assert.equal(pageState(h).page, 'Page 1 of 1');
    assert.equal(pageState(h).count, '1–2 of 2');
    assert.equal(pageState(h).rows.length, 2);
    assert.equal(pageState(h).previousDisabled, true);
    h.elements.query.emit('input', 'Fictional');
    h.elements.category.emit('change', 'research');
    assert.deepEqual(pageState(h).rows, []);
    assert.equal(pageState(h).emptyVisible, true);
    assert.equal(pageState(h).count, '0 matching records');
    h.elements.clear.emit('click');
    assert.equal(h.elements.query.focused, true);
    assert.equal(h.elements.query.value, '');
    assert.equal(h.elements.category.value, 'all');
    assert.equal(h.elements['page-size'].value, '4');
    assert.equal(pageState(h).count, '1–4 of 8');
    h.elements.next.emit('click');
    h.elements['page-size'].emit('change', '8');
    assert.equal(pageState(h).page, 'Page 1 of 1');
    assert.equal(pageState(h).rows.length, 8);
    assert.equal(pageState(h).nextDisabled, true);
  } finally {
    delete globalThis.document;
  }
});

test('sort header semantics and keyboard focus follow active direction', async () => {
  const h = createHarness();
  globalThis.document = h.document;
  try {
    await import('../src/app.mjs?sort-probe');
    assert.equal(h.sorts[0].header.attributes.get('aria-sort'), 'ascending');
    h.sorts[2].emit('click');
    assert.equal(h.sorts[2].header.attributes.get('aria-sort'), 'ascending');
    assert.equal(h.sorts[0].header.attributes.get('aria-sort'), 'none');
    assert.equal(h.sorts[2].focused, true);
    h.sorts[2].emit('click');
    assert.equal(h.sorts[2].header.attributes.get('aria-sort'), 'descending');
    assert.equal(pageState(h).rows[0], 'Demo performance test');
  } finally {
    delete globalThis.document;
  }
});
