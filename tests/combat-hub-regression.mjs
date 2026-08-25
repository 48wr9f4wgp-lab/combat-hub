import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const src = fs.readFileSync('combat-hub.js', 'utf8');
const loaderSrc = fs.readFileSync('combat-hub-loader.js', 'utf8');

function has(re, msg) {
  assert.match(src, re, msg);
}

// Production shape / transport guard
has(/const VERSION='7\.7\.0-github'/, 'Expected v7.7 reliability runtime');
has(/UFC:'ufc'/, 'UFC parameter missing');
has(/RIZIN:'rizin'/, 'RIZIN parameter missing');
has(/ONE:'one'/, 'ONE parameter missing');
has(/BOXING:'boxing'/, 'BOXING parameter missing');
has(/K1:'k1'/, 'K1 parameter missing');
assert.equal(/vercel\.app/i.test(src), false, 'Vercel dependency must not return');
assert.equal(/tackle-fit/i.test(src), false, 'Tackle Fit runtime dependency must not return');

// Standalone Loader guard.
assert.match(loaderSrc, /48wr9f4wgp-lab\/combat-hub\/main\/combat-hub\.js/, 'Loader must use standalone COMBAT HUB repo');
assert.match(loaderSrc, /combat-hub-runtime-v4\.js/, 'Loader v4 cache namespace missing');
assert.match(loaderSrc, /const MIN_RUNTIME=\[7,6,0\]/, 'Loader minimum runtime unexpectedly changed');
assert.equal(/tackle-fit/i.test(loaderSrc), false, 'Loader must not depend on Tackle Fit');

// Current locked-event truth set. These are hard guards until each event passes.
const expected = {
  ufc: "2026-08-29T19:00:00+09:00",
  rizin: "2026-09-10T16:00:00+09:00",
  one: "2026-08-28T20:30:00+09:00",
  k1: "2026-09-12T12:00:00+09:00",
};
for (const [key, iso] of Object.entries(expected)) {
  assert.ok(src.includes(`${key}:{startAt:'${iso}'`), `${key} snapshot startAt drifted: ${iso}`);
}

// Boxing deliberately has timeTba=true; exact clock must not be presented as confirmed.
has(/boxing:\{startAt:'2026-09-12T12:00:00-07:00',[^\n]*timeTba:true/, 'BOXING must remain time-TBA');

// Roll-forward safety.
has(/function currentLocked\(snap\)\{const end=new Date\(snap\.startAt\)\.getTime\(\)\+12\*3600000;return Date\.now\(\)<end;\}/, '12h current-event lock guard missing');
has(/new Date\(snap\.startAt\)\.getTime\(\)\+6\*3600000/, 'next-event lower-bound guard missing');
has(/Date\.now\(\)\+180\*86400000/, 'next-event search horizon changed unexpectedly');
has(/jsonLdEvents\(listing,S\.listing\)\.filter\(eligible\)/, 'listing candidates must be eligibility-filtered before traversal decision');
has(/if\(!candidates\.length\)\{for\(const u of links/, 'detail traversal fallback missing');

// Safe fallback behavior: unknown cards must never invent fighters.
has(/\{a:'対戦カード',b:'発表待ち',context:ev\.name\}/, 'TBA card fallback missing');
has(/main:\{a:'次大会',b:'確認中',context:S\.label\}/, 'next-event pending fallback missing');
has(/replace\(\/&amp;\/gi,'&'\)/, 'HTML entity decoding regressed');
has(/async function eventPoster\(D\)/, 'event-poster fallback helper missing');

// Cache behavior must remain bounded and recoverable.
has(/combat-hub-next-\$\{KEY\}\.json/, 'per-organization next-event cache missing');
has(/now-cached\.savedAt<4\*3600000/, 'next-event cache TTL changed unexpectedly');
has(/if\(cached\?\.data\)return \{\.\.\.cached\.data,stale:true\}/, 'stale-cache fallback missing');

// Visual regression guards: v7.7 reliability pass must not alter verified v7.6 layout.
has(/KEY==='k1'\?370:360/, 'K-1 left hero overlap fix missing');
has(/KEY==='k1'\?350:365/, 'K-1 right hero overlap fix missing');
has(/softBand\(/, 'soft background banding missing');
has(/'MAIN EVENT',6\.1,new Color\(S\.accent\),'bold'/, 'MAIN EVENT emphasis label missing');
has(/'VS',15\.2,new Color\(S\.accent\),'black'/, 'Main VS emphasis regressed');
has(/mainSize:13\.4/, 'Main fighter font emphasis missing');
has(/mainSize:13\.6/, 'Main fighter font emphasis missing for short-name layouts');
has(/aBox\.size=new Size\(140,36\)/, 'Left main fighter box lost fixed height');
has(/centerBox\.size=new Size\(44,36\)/, 'Main center column lost fixed height');
has(/bBox\.size=new Size\(140,36\)/, 'Right main fighter box lost fixed height');
has(/aBox\.addSpacer\(\);const an=/, 'Left main fighter is not vertically centered');
has(/bBox\.addSpacer\(\);const bn=/, 'Right main fighter is not vertically centered');
has(/an\.centerAlignText\(\)/, 'Left main fighter is not horizontally centered');
has(/bn\.centerAlignText\(\)/, 'Right main fighter is not horizontally centered');

const renderMarker = 'const D=await loadData(),ctx=await heroContext(D),w=new ListWidget();';
assert.ok(src.includes(renderMarker), 'Runtime instrumentation marker changed');
const instrumented = src.replace(
  renderMarker,
  `globalThis.__combatInternals={absoluteURL,validOrgName,strictNextEvent,jsonLdEvents,links,metaImage,heroContext,eventPoster,loadData};if(globalThis.__TEST_ONLY__)return;${renderMarker}`,
);

function makeFileManager() {
  const strings = new Map();
  const images = new Map();
  return {
    strings,
    images,
    api: {
      documentsDirectory: () => '/docs',
      joinPath: (a, b) => `${a}/${b}`,
      fileExists: p => strings.has(p) || images.has(p),
      readString: p => {
        if (!strings.has(p)) throw new Error(`missing string: ${p}`);
        return strings.get(p);
      },
      writeString: (p, v) => strings.set(p, String(v)),
      readImage: p => {
        if (!images.has(p)) throw new Error(`missing image: ${p}`);
        return images.get(p);
      },
      writeImage: (p, v) => images.set(p, v),
    },
  };
}

async function boot(parameter, { textResponses = {}, imageResponses = {}, now = Date.now() } = {}) {
  const fm = makeFileManager();
  const requests = [];
  class TestDate extends Date {
    static now() { return now; }
  }
  class Request {
    constructor(url) {
      this.url = url;
      this.timeoutInterval = 0;
      this.headers = {};
      requests.push({ url, kind: 'construct' });
    }
    async loadString() {
      requests.push({ url: this.url, kind: 'string' });
      if (!(this.url in textResponses)) throw new Error(`network string unavailable: ${this.url}`);
      return textResponses[this.url];
    }
    async loadImage() {
      requests.push({ url: this.url, kind: 'image' });
      if (!(this.url in imageResponses)) throw new Error(`network image unavailable: ${this.url}`);
      return imageResponses[this.url];
    }
  }
  const context = {
    __TEST_ONLY__: true,
    args: { widgetParameter: parameter },
    config: { runsInWidget: true },
    FileManager: { local: () => fm.api },
    Request,
    Date: TestDate,
    console,
  };
  vm.createContext(context);
  await vm.runInContext(instrumented, context, { timeout: 2000 });
  assert.ok(context.__combatInternals, `Failed to expose runtime internals for ${parameter}`);
  return { api: context.__combatInternals, fm, requests };
}

// Actual runtime URL resolver tests.
{
  const { api } = await boot('ONE');
  assert.equal(api.absoluteURL('https://cdn.example/a.jpg', 'https://www.onefc.com/events/'), 'https://cdn.example/a.jpg');
  assert.equal(api.absoluteURL('//cdn.example/a.jpg', 'https://www.onefc.com/events/'), 'https://cdn.example/a.jpg');
  assert.equal(api.absoluteURL('/events/next/', 'https://www.onefc.com/events/'), 'https://www.onefc.com/events/next/');
  assert.equal(api.absoluteURL('next-card/', 'https://www.onefc.com/events/'), 'https://www.onefc.com/events/next-card/');
  assert.equal(api.absoluteURL('images/poster.jpg', 'https://www.onefc.com/events/next-card/'), 'https://www.onefc.com/events/next-card/images/poster.jpg');
  assert.equal(api.absoluteURL('../images/poster.jpg', 'https://www.onefc.com/events/next-card/'), 'https://www.onefc.com/events/images/poster.jpg');
  assert.equal(api.absoluteURL('?view=card', 'https://www.onefc.com/events/next-card/'), 'https://www.onefc.com/events/next-card/?view=card');
  assert.equal(api.absoluteURL('#main', 'https://www.onefc.com/events/next-card/?view=card'), 'https://www.onefc.com/events/next-card/?view=card#main');
}

// BOXING must reject generic page Event JSON-LD while accepting fight-shaped event names.
{
  const { api } = await boot('BOXING');
  assert.equal(api.validOrgName('Garcia vs Benn'), true);
  assert.equal(api.validOrgName('World Boxing Championship'), true);
  assert.equal(api.validOrgName('Title Fight: A対B'), true);
  assert.equal(api.validOrgName('Ring Magazine Awards Gala'), false);
  assert.equal(api.validOrgName('Press Conference Event'), false);
}

// Regression for the old traversal bug: irrelevant listing JSON-LD must not block detail-page discovery.
{
  const listing = 'https://www.onefc.com/events/';
  const detail = 'https://www.onefc.com/events/next-card/';
  const poster = 'https://www.onefc.com/events/next-card/images/poster.jpg';
  const listingHtml = `
    <script type="application/ld+json">{"@type":"Event","name":"Unrelated Expo","startDate":"2026-09-20T20:00:00+09:00"}</script>
    <a href="next-card/">Next card</a>`;
  const detailHtml = `
    <meta property="og:image" content="images/poster.jpg">
    <script type="application/ld+json">{"@type":"Event","name":"ONE Friday Fights 169","startDate":"2026-09-25T20:30:00+09:00","location":{"name":"Lumpinee Stadium"}}</script>
    <h1>Fighter Alpha vs Fighter Beta</h1>
    <h2>Fighter Gamma vs Fighter Delta</h2>`;
  const { api, requests } = await boot('ONE', {
    now: Date.parse('2026-09-15T00:00:00+09:00'),
    textResponses: { [listing]: listingHtml, [detail]: detailHtml },
  });
  const next = await api.strictNextEvent({ startAt: '2026-09-10T00:00:00+09:00', location: 'Bangkok', name: 'Previous ONE', main: {}, support: [] });
  assert.ok(next, 'Eligible detail event was not discovered');
  assert.equal(next.name, 'ONE Friday Fights 169');
  assert.equal(next.source, detail);
  assert.equal(next.main.a, 'Fighter Alpha');
  assert.equal(next.main.b, 'Fighter Beta');
  assert.equal(next.posterURL, poster);
  assert.ok(requests.some(r => r.kind === 'string' && r.url === detail), 'Detail page traversal did not occur');
}

// UFC/RIZIN unknown fighters should use the event poster rather than collapsing to a plain gradient.
for (const parameter of ['UFC', 'RIZIN']) {
  const posterURL = `https://img.example/${parameter.toLowerCase()}-next.jpg`;
  const posterImage = { size: { width: 1200, height: 800 }, id: parameter };
  const { api } = await boot(parameter, { imageResponses: { [posterURL]: posterImage } });
  const hero = await api.heroContext({
    main: { a: 'UNKNOWN FIGHTER A', b: 'UNKNOWN FIGHTER B', context: 'TITLE' },
    posterURL,
    source: `https://example.test/${parameter.toLowerCase()}`,
  });
  assert.equal(hero.poster?.id, parameter, `${parameter} unknown-fighter poster fallback failed`);
  assert.equal(hero.a.name, 'UNKNOWN FIGHTER A');
  assert.equal(hero.b.name, 'UNKNOWN FIGHTER B');
}

// Fresh event cache should suppress list-page network work after the current-event lock has expired.
{
  const now = Date.parse('2026-09-20T00:00:00+09:00');
  const { api, fm, requests } = await boot('UFC', { now });
  const path = fm.api.joinPath('/docs', 'combat-hub-next-ufc.json');
  fm.api.writeString(path, JSON.stringify({
    savedAt: now - 60_000,
    data: {
      startAt: '2026-10-01T19:00:00+09:00',
      location: 'Test',
      name: 'UFC Cached Event',
      main: { a: 'A', b: 'B', context: '' },
      support: [],
    },
  }));
  const data = await api.loadData();
  assert.equal(data.name, 'UFC Cached Event');
  assert.equal(requests.filter(r => r.kind === 'string').length, 0, 'Fresh event cache should avoid network listing requests');
}

// Stale event cache remains a recovery path when live discovery fails.
{
  const now = Date.parse('2026-09-20T00:00:00+09:00');
  const { api, fm } = await boot('UFC', { now });
  const path = fm.api.joinPath('/docs', 'combat-hub-next-ufc.json');
  fm.api.writeString(path, JSON.stringify({
    savedAt: now - 5 * 3600_000,
    data: {
      startAt: '2026-10-01T19:00:00+09:00',
      location: 'Test',
      name: 'UFC Stale Event',
      main: { a: 'A', b: 'B', context: '' },
      support: [],
    },
  }));
  const data = await api.loadData();
  assert.equal(data.name, 'UFC Stale Event');
  assert.equal(data.stale, true, 'Stale cache fallback flag missing');
}

console.log('COMBAT HUB v7.7 regression checks: OK');
