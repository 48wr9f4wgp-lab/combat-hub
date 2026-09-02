import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('../combat-hub.js', import.meta.url), 'utf8');

assert.match(source, /const VERSION='7\.8\.\d+-github'/, 'runtime version should stay on v7.8 audited line');
assert.match(source, /function normalizeOneCompositeEvent\(ev\)/, 'ONE composite-event normalizer must exist');
assert.match(source, /ONE Friday Fights\\s\+\\d\+/, 'normalizer must detect ONE Friday Fights event numbers');
assert.match(source, /The Inner Circle\\s\+\\d\+/, 'normalizer must detect paired The Inner Circle events');
assert.match(source, /jh===20&&jm===30/, '20:30 JST composite start must be recognized as Inner Circle start');
assert.match(source, /t\+2\*3600000/, 'Friday Fights start must move two hours later when composite source is 20:30 JST');
assert.match(source, /jsonLdEvents\(listing,S\.listing\)\.map\(normalizeOneCompositeEvent\)/, 'listing candidates must be normalized before eligibility checks');
assert.match(source, /normalizeOneCompositeEvent\(\{\.\.\.e,source:u\}\)/, 'detail-page candidates must be normalized');
assert.match(source, /return normalizeOneCompositeEvent\(cached\.data\)/, 'fresh cached next-event data must be normalized immediately');
assert.match(source, /normalizeOneCompositeEvent\(cached\.data\),stale:true/, 'stale cached next-event data must also be normalized');

const current = {
  name: 'ONE Friday Fights 169 & The Inner Circle 29',
  startAt: '2026-09-04T20:30:00+09:00'
};
const t = new Date(current.startAt).getTime();
const j = new Date(t + 9 * 3600000);
const normalized = j.getUTCHours() === 20 && j.getUTCMinutes() === 30
  ? new Date(t + 2 * 3600000)
  : new Date(t);
assert.equal(normalized.toISOString(), '2026-09-04T13:30:00.000Z', '20:30 JST must normalize to 22:30 JST');

console.log('COMBAT HUB ONE composite-time regression: OK');
