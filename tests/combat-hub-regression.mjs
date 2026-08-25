import fs from 'node:fs';
import assert from 'node:assert/strict';

const src = fs.readFileSync('combat-hub.js', 'utf8');

function has(re, msg) {
  assert.match(src, re, msg);
}

// Production shape / transport guard
has(/const VERSION='7\.6\.0-github'/, 'Expected current stable COMBAT HUB version');
has(/UFC:'ufc'/, 'UFC parameter missing');
has(/RIZIN:'rizin'/, 'RIZIN parameter missing');
has(/ONE:'one'/, 'ONE parameter missing');
has(/BOXING:'boxing'/, 'BOXING parameter missing');
has(/K1:'k1'/, 'K1 parameter missing');
assert.equal(/vercel\.app/i.test(src), false, 'Vercel dependency must not return');

// Current locked-event truth set. These are intentionally hard guards until each event passes.
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

// Roll-forward safety: do not swap away from the current confirmed event too early.
has(/function currentLocked\(snap\)\{const end=new Date\(snap\.startAt\)\.getTime\(\)\+12\*3600000;return Date\.now\(\)<end;\}/, '12h current-event lock guard missing');
has(/const min=new Date\(snap\.startAt\)\.getTime\(\)\+6\*3600000/, 'next-event lower-bound guard missing');
has(/max=Date\.now\(\)\+180\*86400000/, 'next-event search horizon changed unexpectedly');
has(/validOrgName\(e\.name\)/, 'organization validation missing from next-event search');

// Safe fallback behavior: unknown cards must never invent fighters.
has(/\{a:'対戦カード',b:'発表待ち',context:ev\.name\}/, 'TBA card fallback missing');
has(/main:\{a:'次大会',b:'確認中',context:S\.label\}/, 'next-event pending fallback missing');
has(/stripHTML\(D\.name\|\|D\.main\.context\)/, 'HTML/entity-clean display path missing');
has(/replace\(\/&amp;\/gi,'&'\)/, 'HTML entity decoding regressed');

// Cache behavior must remain bounded and recoverable.
has(/combat-hub-next-\$\{KEY\}\.json/, 'per-organization next-event cache missing');
has(/now-cached\.savedAt<4\*3600000/, 'next-event cache TTL changed unexpectedly');
has(/if\(cached\?\.data\)return \{\.\.\.cached\.data,stale:true\}/, 'stale-cache fallback missing');

// Visual regression guards discovered on device.
has(/KEY==='k1'\?370:360/, 'K-1 left hero overlap fix missing');
has(/KEY==='k1'\?350:365/, 'K-1 right hero overlap fix missing');
has(/softBand\(/, 'soft background banding missing');

// Main-event hierarchy guards.
has(/'MAIN EVENT',6\.1,new Color\(S\.accent\),'bold'/, 'MAIN EVENT emphasis label missing');
has(/'VS',15\.2,new Color\(S\.accent\),'black'/, 'Main VS emphasis regressed');
has(/mainSize:13\.4/, 'Main fighter font emphasis missing');
has(/mainSize:13\.6/, 'Main fighter font emphasis missing for short-name layouts');

// Symmetric fixed-height main-card layout guards.
has(/aBox\.size=new Size\(140,36\)/, 'Left main fighter box lost fixed height');
has(/centerBox\.size=new Size\(44,36\)/, 'Main center column lost fixed height');
has(/bBox\.size=new Size\(140,36\)/, 'Right main fighter box lost fixed height');
has(/aBox\.addSpacer\(\);const an=/, 'Left main fighter is not vertically centered');
has(/bBox\.addSpacer\(\);const bn=/, 'Right main fighter is not vertically centered');
has(/an\.centerAlignText\(\)/, 'Left main fighter is not horizontally centered');
has(/bn\.centerAlignText\(\)/, 'Right main fighter is not horizontally centered');

console.log('COMBAT HUB regression checks: OK');
