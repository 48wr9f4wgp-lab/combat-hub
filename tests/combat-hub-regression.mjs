import fs from 'node:fs';
import assert from 'node:assert/strict';

const runtime = fs.readFileSync('combat-hub.js', 'utf8');
const loader = fs.readFileSync('friend-loader.js', 'utf8');
const bootstrap = fs.readFileSync('friend-bootstrap.js', 'utf8');

function has(src, re, msg) {
  assert.match(src, re, msg);
}

// Friend channel is intentionally frozen at the verified v7.3 runtime.
has(runtime, /const VERSION='7\.3\.0-github'/, 'friends-stable must remain on v7.3.0 until explicitly promoted');
for (const token of ["UFC:'ufc'", "RIZIN:'rizin'", "ONE:'one'", "BOXING:'boxing'", "K1:'k1'"]) {
  assert.ok(runtime.includes(token), `Missing parameter mapping: ${token}`);
}

// No runtime/distribution dependency on Tackle Fit or Vercel.
for (const [name, src] of [['runtime', runtime], ['loader', loader], ['bootstrap', bootstrap]]) {
  assert.equal(/tackle-fit/i.test(src), false, `${name} must not reference tackle-fit`);
  assert.equal(/vercel\.app/i.test(src), false, `${name} must not reference Vercel`);
}

// Stable-channel transport must stay inside this repository and branch.
has(loader, /raw\.githubusercontent\.com\/48wr9f4wgp-lab\/combat-hub\/friends-stable\/combat-hub\.js/, 'friend RAW URL drifted');
has(loader, /api\.github\.com\/repos\/48wr9f4wgp-lab\/combat-hub\/contents\/combat-hub\.js\?ref=friends-stable/, 'friend API URL drifted');
has(bootstrap, /raw\.githubusercontent\.com\/48wr9f4wgp-lab\/combat-hub\/friends-stable\/friend-loader\.js/, 'bootstrap URL drifted');
has(loader, /combat-hub-friends-runtime\.js/, 'friend runtime cache missing');
has(loader, /30 \* 60 \* 1000/, 'friend cache TTL changed unexpectedly');

// Current locked-event truth set.
const expected = {
  ufc: '2026-08-29T19:00:00+09:00',
  rizin: '2026-09-10T16:00:00+09:00',
  one: '2026-08-28T20:30:00+09:00',
  k1: '2026-09-12T12:00:00+09:00',
};
for (const [key, iso] of Object.entries(expected)) {
  assert.ok(runtime.includes(`${key}:{startAt:'${iso}'`), `${key} snapshot startAt drifted: ${iso}`);
}
has(runtime, /boxing:\{startAt:'2026-09-12T12:00:00-07:00',[^\n]*timeTba:true/, 'BOXING must remain time-TBA');
has(runtime, /function currentLocked\(snap\)\{const end=new Date\(snap\.startAt\)\.getTime\(\)\+12\*3600000;return Date\.now\(\)<end;\}/, '12h event lock missing');
has(runtime, /\{a:'対戦カード',b:'発表待ち',context:ev\.name\}/, 'TBA fallback missing');
has(runtime, /main:\{a:'次大会',b:'確認中',context:S\.label\}/, 'next-event pending fallback missing');

// v7.3 device-verified visual identity guards.
has(runtime, /KEY==='k1'\?370:360/, 'K-1 left overlap fix missing');
has(runtime, /KEY==='k1'\?350:365/, 'K-1 right overlap fix missing');
has(runtime, /softBand\(/, 'soft background banding missing');
has(runtime, /aBox\.size=new Size\(136,0\)/, 'v7.3 left main layout drifted');
has(runtime, /vsBox\.size=new Size\(34,0\)/, 'v7.3 center VS layout drifted');
has(runtime, /'VS',13\.5,new Color\(S\.accent\),'black'/, 'v7.3 VS styling drifted');
has(runtime, /bn\.rightAlignText\(\)/, 'v7.3 right-name alignment drifted');

console.log('COMBAT HUB friends-stable regression checks: OK');
