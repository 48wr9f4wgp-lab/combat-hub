import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const src = fs.readFileSync('combat-hub.js', 'utf8');

// Keep the performance contract reviewable and explicit.
assert.match(src, /combat-meta-\$\{ns\}-\$\{safeKey\(url\)\}\.json/, 'event metadata cache namespace missing');
assert.match(src, /combat-profile-\$\{kind\}-\$\{safeKey\(url\)\}\.json/, 'fighter metadata cache namespace missing');
assert.match(src, /now-Number\(cached\.savedAt\)<12\*3600000/, 'fighter metadata TTL must remain 12h');
assert.match(src, /cachedMetaImageURL\(current\.source,`\$\{KEY\}-event`,4\*3600000\)/, 'locked-event metadata fallback cache must remain 4h');
assert.match(src, /combat-hub-current-\$\{KEY\}\.json/, 'locked-current data cache missing');
assert.match(src, /now-Number\(cached\.savedAt\)<2\*3600000/, 'locked-current refresh TTL must remain 2h');

const renderMarker = 'const D=await loadData(),ctx=await heroContext(D),w=new ListWidget();';
assert.ok(src.includes(renderMarker), 'Runtime instrumentation marker changed');
const instrumented = src.replace(
  renderMarker,
  `globalThis.__cacheInternals={safeKey,cachedMetaImageURL,profileImage,eventPoster,loadData};if(globalThis.__TEST_ONLY__)return;${renderMarker}`,
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

async function boot(parameter, { now, textResponses = {}, imageResponses = {} } = {}) {
  const fixedNow = now ?? Date.parse('2026-08-27T12:00:00+09:00');
  const fm = makeFileManager();
  const requests = [];

  class TestDate extends Date {
    static now() { return fixedNow; }
  }

  class Request {
    constructor(url) {
      this.url = url;
      this.timeoutInterval = 0;
      this.headers = {};
      requests.push({ kind: 'construct', url });
    }
    async loadString() {
      requests.push({ kind: 'string', url: this.url });
      if (!(this.url in textResponses)) throw new Error(`network string unavailable: ${this.url}`);
      const response = textResponses[this.url];
      if (response instanceof Error) throw response;
      return response;
    }
    async loadImage() {
      requests.push({ kind: 'image', url: this.url });
      if (!(this.url in imageResponses)) throw new Error(`network image unavailable: ${this.url}`);
      const response = imageResponses[this.url];
      if (response instanceof Error) throw response;
      return response;
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
  assert.ok(context.__cacheInternals, `Failed to expose cache internals for ${parameter}`);
  return { api: context.__cacheInternals, fm, requests, now: fixedNow };
}

function stringRequests(requests) {
  return requests.filter(r => r.kind === 'string');
}

// Fresh fighter metadata + image cache should render without profile HTML or image network work.
{
  const profileURL = 'https://www.ufc.com/athlete/umar-nurmagomedov';
  const imageURL = 'https://img.example/umar.jpg';
  const image = { size: { width: 800, height: 800 }, id: 'umar-cache' };
  const { api, fm, requests, now } = await boot('UFC');
  const metaPath = `/docs/combat-profile-ufc-${api.safeKey(profileURL)}.json`;
  const imagePath = `/docs/combat-ufc-${api.safeKey(imageURL)}.jpg`;
  fm.api.writeString(metaPath, JSON.stringify({
    savedAt: now - 60_000,
    imageURL,
    name: 'ウマル・ヌルマゴメドフ',
  }));
  fm.api.writeImage(imagePath, image);

  const result = await api.profileImage(profileURL, 'NURMAGOMEDOV', 'ufc');
  assert.equal(result.name, 'ウマル・ヌルマゴメドフ');
  assert.equal(result.image?.id, 'umar-cache');
  assert.equal(requests.length, 0, 'Fresh fighter metadata/image cache should require zero network requests');
}

// Stale fighter metadata should attempt refresh, but remain usable if profile HTML is unavailable.
{
  const profileURL = 'https://www.ufc.com/athlete/umar-nurmagomedov';
  const imageURL = 'https://img.example/umar-stale.jpg';
  const image = { size: { width: 800, height: 800 }, id: 'umar-stale' };
  const { api, fm, requests, now } = await boot('UFC');
  const metaPath = `/docs/combat-profile-ufc-${api.safeKey(profileURL)}.json`;
  const imagePath = `/docs/combat-ufc-${api.safeKey(imageURL)}.jpg`;
  fm.api.writeString(metaPath, JSON.stringify({
    savedAt: now - 13 * 3600_000,
    imageURL,
    name: 'ウマル・ヌルマゴメドフ',
  }));
  fm.api.writeImage(imagePath, image);

  const result = await api.profileImage(profileURL, 'NURMAGOMEDOV', 'ufc');
  assert.equal(result.name, 'ウマル・ヌルマゴメドフ');
  assert.equal(result.image?.id, 'umar-stale');
  assert.ok(stringRequests(requests).some(r => r.url === profileURL), 'Stale fighter metadata should attempt a profile refresh');
  assert.equal(requests.filter(r => r.kind === 'image').length, 0, 'Cached fighter image should survive profile refresh failure');
}

// Fresh event metadata + image cache should avoid event-page HTML and image network work.
{
  const source = 'https://www.onefc.com/events/test-event/';
  const imageURL = 'https://img.example/one-event.jpg';
  const image = { size: { width: 1200, height: 675 }, id: 'one-event-cache' };
  const { api, fm, requests, now } = await boot('ONE');
  const metaPath = `/docs/combat-meta-one-event-${api.safeKey(source)}.json`;
  const imagePath = `/docs/combat-one-event-${api.safeKey(imageURL)}.jpg`;
  fm.api.writeString(metaPath, JSON.stringify({ savedAt: now - 60_000, imageURL }));
  fm.api.writeImage(imagePath, image);

  const poster = await api.eventPoster({ source, main: { a: 'A', b: 'B', context: '' } });
  assert.equal(poster?.id, 'one-event-cache');
  assert.equal(requests.length, 0, 'Fresh event metadata/image cache should require zero network requests');
}

// Stale event metadata remains a fallback if the event page is temporarily unavailable.
{
  const source = 'https://www.onefc.com/events/stale-event/';
  const imageURL = 'https://img.example/one-event-stale.jpg';
  const image = { size: { width: 1200, height: 675 }, id: 'one-event-stale' };
  const { api, fm, requests, now } = await boot('ONE');
  const metaPath = `/docs/combat-meta-one-event-${api.safeKey(source)}.json`;
  const imagePath = `/docs/combat-one-event-${api.safeKey(imageURL)}.jpg`;
  fm.api.writeString(metaPath, JSON.stringify({ savedAt: now - 5 * 3600_000, imageURL }));
  fm.api.writeImage(imagePath, image);

  const poster = await api.eventPoster({ source, main: { a: 'A', b: 'B', context: '' } });
  assert.equal(poster?.id, 'one-event-stale');
  assert.ok(stringRequests(requests).some(r => r.url === source), 'Stale event metadata should attempt an event-page refresh');
  assert.equal(requests.filter(r => r.kind === 'image').length, 0, 'Cached event image should survive metadata refresh failure');
}

// A locked current event should reuse a fresh confidence-gated current-data cache with zero network work.
{
  const imageURL = 'https://img.example/one-169.jpg';
  const now = Date.parse('2026-09-02T12:00:00+09:00');
  const { api, fm, requests } = await boot('ONE', { now });
  const currentPath = '/docs/combat-hub-current-one.json';
  fm.api.writeString(currentPath, JSON.stringify({ savedAt: now - 60_000, data: { posterURL: imageURL } }));

  const data = await api.loadData();
  assert.equal(data.posterURL, imageURL);
  assert.equal(data.lockedCurrent, true);
  assert.equal(stringRequests(requests).length, 0, 'Fresh locked-current cache should avoid event HTML network work');
}

console.log('COMBAT HUB v7.8 cache performance checks: OK');
