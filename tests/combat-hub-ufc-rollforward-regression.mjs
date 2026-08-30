import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const src = fs.readFileSync('combat-hub.js', 'utf8');
const marker = 'const D=await loadData(),ctx=await heroContext(D),w=new ListWidget();';
assert.ok(src.includes(marker), 'Runtime instrumentation marker changed');
const instrumented = src.replace(
  marker,
  `globalThis.__ufcInternals={ufcCardTime,ufcListingEvents,ufcDetailName,ufcDetailLocation,strictNextEvent};if(globalThis.__TEST_ONLY__)return;${marker}`,
);

function fileManager() {
  const strings = new Map();
  const images = new Map();
  return {
    documentsDirectory: () => '/docs',
    joinPath: (a, b) => `${a}/${b}`,
    fileExists: p => strings.has(p) || images.has(p),
    readString: p => strings.get(p),
    writeString: (p, v) => strings.set(p, String(v)),
    readImage: p => images.get(p),
    writeImage: (p, v) => images.set(p, v),
  };
}

const listing = 'https://www.ufc.com/events';
const detail = 'https://www.ufc.com/event/ufc-fight-night-september-05-2026';
const poster = 'https://img.example/ufc-paris.jpg';
const listingHtml = `
  <div class="c-card-event--result__date" data-main-card="Sat, Sep 5 / 3:00 PM EDT" data-prelims-card="Sat, Sep 5 / 12:00 PM EDT">
    <a href="/event/ufc-fight-night-september-05-2026">Sat, Sep 5 / 3:00 PM EDT / Main Card</a>
  </div>`;
const detailHtml = `
  <title>UFC Fight Night: Hooker vs Parnasse | UFC</title>
  <meta property="og:image" content="${poster}">
  <script>window.fixture={"addressLocality":"Paris"}</script>`;
const responses = { [listing]: listingHtml, [detail]: detailHtml };
const requests = [];
const now = Date.parse('2026-08-31T07:25:00+09:00');
class TestDate extends Date { static now() { return now; } }
class Request {
  constructor(url) { this.url = url; this.timeoutInterval = 0; this.headers = {}; requests.push(url); }
  async loadString() {
    if (!(this.url in responses)) throw new Error(`no fixture for ${this.url}`);
    return responses[this.url];
  }
  async loadImage() { throw new Error('image network not needed'); }
}
const context = {
  __TEST_ONLY__: true,
  args: { widgetParameter: 'UFC' },
  config: { runsInWidget: true },
  FileManager: { local: () => fileManager() },
  Request,
  Date: TestDate,
  console,
};
vm.createContext(context);
await vm.runInContext(instrumented, context, { timeout: 2000 });
const api = context.__ufcInternals;
assert.ok(api, 'UFC internals not exposed');

const min = Date.parse('2026-08-29T19:00:00+09:00') + 6 * 3600000;
const max = now + 180 * 86400000;
assert.equal(api.ufcCardTime('Sat, Sep 5 / 3:00 PM EDT', min, max), '2026-09-05T19:00:00.000Z');
const cards = api.ufcListingEvents(listingHtml, listing, min, max);
assert.equal(cards.length, 1);
assert.equal(cards[0].source, detail);
assert.equal(cards[0].startAt, '2026-09-05T19:00:00.000Z');
assert.equal(api.ufcDetailName(detailHtml), 'UFC Fight Night: Hooker vs Parnasse');
assert.equal(api.ufcDetailLocation(detailHtml), 'Paris');

const next = await api.strictNextEvent({
  startAt: '2026-08-29T19:00:00+09:00',
  location: '上海',
  name: 'UFC Fight Night: Nurmagomedov vs Song',
  main: {},
  support: [],
});
assert.ok(next, 'UFC fallback failed to discover next event');
assert.equal(next.startAt, '2026-09-05T19:00:00.000Z');
assert.equal(next.name, 'UFC Fight Night: Hooker vs Parnasse');
assert.equal(next.location, 'パリ');
assert.equal(next.main.a, 'Hooker');
assert.equal(next.main.b, 'Parnasse');
assert.equal(next.posterURL, poster);
assert.equal(next.nextPending, undefined);
assert.ok(requests.includes(detail), 'UFC detail page was not fetched');

console.log('COMBAT HUB UFC roll-forward regression: OK');
