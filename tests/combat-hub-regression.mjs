import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const src = fs.readFileSync('combat-hub.js', 'utf8');
const loaderSrc = fs.readFileSync('combat-hub-loader.js', 'utf8');

function has(re, msg) {
  assert.match(src, re, msg);
}

// Production shape / transport guard
has(/const VERSION='7\.7\.\d+-github'/, 'Expected v7.7 reliability runtime');
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
  ufc: "2026-09-06T04:00:00+09:00",
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
has(/jsonLdEvents\(listing,S\.listing\)\.map\(normalizeOneCompositeEvent\)\.filter\(eligible\)/, 'listing candidates must be normalized and eligibility-filtered before traversal decision');
has(/if\(!candidates\.length\)\{for\(const u of links/, 'detail traversal fallback missing');

// Safe fallback behavior: unknown cards must never invent fighters.
has(/\{a:'対戦カード',b:'発表待ち',context:ev\.name\}/, 'TBA card fallback missing');
has(/main:\{a:'次大会',b:'確認中',context:S\.label\}/, 'next-event pending fallback missing');
has(/replace\(\/&amp;\/gi,'&'\)/, 'HTML entity decoding regressed');
has(/async function eventPoster\(D\)/, 'event-poster fallback helper missing');

// Cache behavior must remain bounded and recoverable.
has(/combat-hub-next-\$\{KEY\}\.json/, 'per-organization next-event cache missing');
has(/now-cached\.savedAt<4\*3600000/, 'next-event cache TTL changed unexpectedly');
has(/if\(cached\?\.data\)return \{\.\.\.normalizeOneCompositeEvent\(cached\.data\),stale:true\}/, 'stale-cache fallback missing');

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
  `globalThis.__combatInternals={absoluteURL,validOrgName,normalizeOneCompositeEvent,strictNextEvent,jsonLdEvents,links,metaImage,heroContext,eventPoster,loadData};if(globalThis.__TEST_ONLY__)return;${renderMarker}`,
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

function runtimeSource(version, label) {
  return `// COMBAT HUB runtime fixture\nconst VERSION='${version}-github';\nglobalThis.__runtimeSelected='${label}';\nglobalThis.__runtimeExecutions=(globalThis.__runtimeExecutions||0)+1;\nScript.complete();`;
}

async function runLoader({ runsInWidget, now, remoteResponses = {}, cacheSource = null, cacheSavedAt = null }) {
  const fm = makeFileManager();
  const requests = [];
  const cachePath = fm.api.joinPath('/docs', 'combat-hub-runtime-v4.js');
  const metaPath = fm.api.joinPath('/docs', 'combat-hub-runtime-v4-meta.json');
  if (cacheSource) {
    fm.api.writeString(cachePath, cacheSource);
    fm.api.writeString(metaPath, JSON.stringify({ savedAt: cacheSavedAt ?? now, runtimeVersion: 'fixture' }));
  }
  class TestDate extends Date {
    static now() { return now; }
  }
  class Request {
    constructor(url) {
      this.url = url;
      this.timeoutInterval = 0;
      this.headers = {};
      requests.push(url);
    }
    async loadString() {
      for (const [prefix, response] of Object.entries(remoteResponses)) {
        if (this.url.startsWith(prefix)) {
          if (response instanceof Error) throw response;
          return response;
        }
      }
      throw new Error(`remote unavailable: ${this.url}`);
    }
  }
  let completes = 0;
  const context = {
    config: { runsInWidget },
    FileManager: { local: () => fm.api },
    Request,
    Date: TestDate,
    Script: { complete: () => { completes += 1; } },
    console,
  };
  vm.createContext(context);
  await vm.runInContext(loaderSrc, context, { timeout: 2000 });
  return { fm, requests, context, completes, cachePath, metaPath };
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

// ONE composite pages expose the earlier Inner Circle start. Normalize the primary Friday Fights display only once.
{
  const { api } = await boot('ONE');
  const composite = api.normalizeOneCompositeEvent({
    name: 'ONE Friday Fights 169 & The Inner Circle 29',
    startAt: '2026-09-04T20:30:00+09:00',
    source: 'https://www.onefc.com/events/one-friday-fights-169/',
  });
  assert.equal(composite.name, 'ONE Friday Fights 169');
  assert.equal(composite.startAt, '2026-09-04T13:30:00.000Z');
  assert.equal(composite.oneComposite, true);
  assert.equal(composite.compositeName, 'ONE Friday Fights 169 & The Inner Circle 29');

  const alreadyFriday = api.normalizeOneCompositeEvent({
    name: 'ONE Friday Fights 170 & The Inner Circle 30',
    startAt: '2026-09-11T22:30:00+09:00',
  });
  assert.equal(alreadyFriday.startAt, '2026-09-11T22:30:00+09:00', 'Already-correct 22:30 JST must not be shifted twice');
  assert.equal(alreadyFriday.name, 'ONE Friday Fights 170');
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

// Regression for path-relative event and poster URLs.
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

// Every category must be able to roll forward from an ineligible listing Event to an eligible detail page.
const rollForwardFixtures = [
  { parameter: 'UFC', listing: 'https://www.ufc.com/events', href: '/event/next-card', detail: 'https://www.ufc.com/event/next-card', name: 'UFC Fight Night: Alpha vs Beta' },
  { parameter: 'RIZIN', listing: 'https://jp.rizinff.com/', href: '/_ct/999999', detail: 'https://jp.rizinff.com/_ct/999999', name: 'RIZIN TEST 2026' },
  { parameter: 'ONE', listing: 'https://www.onefc.com/events/', href: 'next-card/', detail: 'https://www.onefc.com/events/next-card/', name: 'ONE Friday Fights 169' },
  { parameter: 'BOXING', listing: 'https://www.ringmagazine.com/events', href: '/events/alpha-vs-beta', detail: 'https://www.ringmagazine.com/events/alpha-vs-beta', name: 'Alpha vs Beta' },
  { parameter: 'K1', listing: 'https://www.k-1.co.jp/k-1wgp/schedule', href: '/k-1wgp/schedule/99999', detail: 'https://www.k-1.co.jp/k-1wgp/schedule/99999', name: 'K-1 TEST 2026' },
];
for (const f of rollForwardFixtures) {
  const irrelevantName = f.parameter === 'BOXING' ? 'Press Conference Event' : 'Unrelated Expo';
  const listingHtml = `
    <script type="application/ld+json">{"@type":"Event","name":"${irrelevantName}","startDate":"2026-09-20T20:00:00+09:00"}</script>
    <a href="${f.href}">Next</a>`;
  const detailHtml = `
    <script type="application/ld+json">{"@type":"Event","name":"${f.name}","startDate":"2026-09-25T20:30:00+09:00","location":{"name":"Test Arena"}}</script>
    <h1>Alpha Fighter vs Beta Fighter</h1>`;
  const { api, requests } = await boot(f.parameter, {
    now: Date.parse('2026-09-15T00:00:00+09:00'),
    textResponses: { [f.listing]: listingHtml, [f.detail]: detailHtml },
  });
  const next = await api.strictNextEvent({ startAt: '2026-09-10T00:00:00+09:00', location: 'Previous', name: 'Previous Event', main: {}, support: [] });
  assert.ok(next, `${f.parameter} failed to roll forward`);
  assert.equal(next.name, f.name, `${f.parameter} selected wrong event`);
  assert.equal(next.main.a, 'Alpha Fighter', `${f.parameter} main fighter A not parsed`);
  assert.equal(next.main.b, 'Beta Fighter', `${f.parameter} main fighter B not parsed`);
  assert.ok(requests.some(r => r.kind === 'string' && r.url === f.detail), `${f.parameter} detail page was not requested`);
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

// Loader manual run: verified remote is fetched, cached, and executed exactly once.
{
  const now = Date.parse('2026-09-20T00:00:00+09:00');
  const remoteBase = 'https://raw.githubusercontent.com/48wr9f4wgp-lab/combat-hub/main/combat-hub.js';
  const remote = runtimeSource('7.7.0', 'remote');
  const r = await runLoader({ runsInWidget: false, now, remoteResponses: { [remoteBase]: remote } });
  assert.equal(r.context.__runtimeSelected, 'remote');
  assert.equal(r.context.__runtimeExecutions, 1, 'Loader executed runtime more than once');
  assert.equal(r.completes, 1);
  assert.equal(r.fm.strings.get(r.cachePath), remote, 'Verified remote was not cached');
}

// Loader widget path: a fresh validated cache must avoid network work.
{
  const now = Date.parse('2026-09-20T00:00:00+09:00');
  const cached = runtimeSource('7.6.0', 'fresh-cache');
  const r = await runLoader({ runsInWidget: true, now, cacheSource: cached, cacheSavedAt: now - 60_000 });
  assert.equal(r.context.__runtimeSelected, 'fresh-cache');
  assert.equal(r.context.__runtimeExecutions, 1);
  assert.equal(r.requests.length, 0, 'Fresh widget cache should skip GitHub requests');
}

// Loader network failure: last validated cache remains usable.
{
  const now = Date.parse('2026-09-20T00:00:00+09:00');
  const cached = runtimeSource('7.6.0', 'offline-cache');
  const r = await runLoader({ runsInWidget: false, now, cacheSource: cached, cacheSavedAt: now - 2 * 3600_000 });
  assert.equal(r.context.__runtimeSelected, 'offline-cache');
  assert.equal(r.context.__runtimeExecutions, 1);
  assert.ok(r.requests.length >= 2, 'Manual run should attempt both remote routes before cache fallback');
}

// Emergency rollback: verified remote wins even when cache has a numerically newer version.
{
  const now = Date.parse('2026-09-20T00:00:00+09:00');
  const remoteBase = 'https://raw.githubusercontent.com/48wr9f4wgp-lab/combat-hub/main/combat-hub.js';
  const cached = runtimeSource('7.8.0', 'higher-cache');
  const rollback = runtimeSource('7.7.0', 'verified-rollback');
  const r = await runLoader({
    runsInWidget: false,
    now,
    cacheSource: cached,
    cacheSavedAt: now - 2 * 3600_000,
    remoteResponses: { [remoteBase]: rollback },
  });
  assert.equal(r.context.__runtimeSelected, 'verified-rollback');
  assert.equal(r.context.__runtimeExecutions, 1);
  assert.equal(r.fm.strings.get(r.cachePath), rollback, 'Emergency rollback did not replace newer cache');
}

console.log('COMBAT HUB v7.7 regression checks: OK');
