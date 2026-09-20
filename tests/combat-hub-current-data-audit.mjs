import fs from 'node:fs';
import assert from 'node:assert/strict';

const src=fs.readFileSync('combat-hub.js','utf8');
const preview=fs.readFileSync('combat-hub-preview-loader.js','utf8');

assert.match(src,/const VERSION='7\.22\.9-github'/);
assert.match(src,/const TRUSTED_FUTURE=\{/,'verified future fallback set missing');
assert.match(src,/UFC Fight Night: Rosas Jr\. vs Barcelos/,'verified post-UFC331 fallback missing');
assert.match(src,/K-1 2026\.11\.23/,'verified K-1 11\/23 fallback missing');
assert.match(src,/K-1 2026\.12\.29/,'verified K-1 12\/29 fallback missing');
assert.match(src,/function ufcListingEvents\(html,base,min,max\)/,'UFC current-markup listing parser missing');
assert.match(src,/function k1ListingEvents\(html,base,now=Date\.now\(\)\)/,'K-1 schedule listing parser missing');
assert.match(src,/function oneBoutContext\(raw\)/,'ONE discipline context parser missing');
assert.match(src,/function safePendingEvent\(now=Date\.now\(\),lightweight=false\)/,'neutral pending helper missing');
assert.match(src,/function enrichTrustedEventMeta\(ev\)/,'verified metadata hydration helper missing');
assert.match(src,/function unresolvedLocation\(v\)/,'placeholder-location override helper missing');
assert.match(src,/function richerContext\(a,b,eventName=''\)/,'richer verified fight-context selection missing');
assert.match(src,/one:\[\{startAt:'2026-09-25T22:30:00\+09:00'[^\n]*ONE Friday Fights 172[^\n]*フライ級キックボクシング/,'verified ONE 172 discipline baseline missing');
assert.match(src,/LARGE_NEXT_POLICY_VERSION=3/,'large-next cache policy invalidation missing');
assert.match(src,/disc=\/Kickboxing\|キックボクシング/,'discipline-preserving display normalization missing');
assert.match(src,/if\(D\?\.nextPending\).*imageMode:'gradient'/s,'pending must not reuse stale event artwork');
assert.match(src,/same=!!\(old\.a&&old\.b&&p\?\.a&&p\?\.b&&sameFight/,'main bout fallback must be fight-identity scoped');
assert.match(src,/LaLa\\s\*arena\\s\*TOKYO-BAY[\s\S]*return'千葉・船橋'/,'LaLa arena must not normalize to Tokyo');
assert.match(src,/Flyweight\|Bantamweight[\s\S]*Kickboxing\|Muay Thai\|MMA/,'discipline-aware context normalization missing');
assert.match(src,/boxing:\{startAt:'2026-09-20T00:00:00\+09:00'[^\n]*name:'Cruz vs Bravo'[^\n]*ringmagazine\.com\/events\/pitbull-vs-bravo/);
assert.match(src,/boxing:\{[^\n]*timeTba:true/);
assert.match(src,/function currentPagePairs\(html,base=S\.listing\)/);
assert.match(src,/async function refreshLockedCurrent\(snap\)/);
assert.match(src,/sameFight\(pairs\[0\]\.a,pairs\[0\]\.b,snap\.main\.a,snap\.main\.b\)/);
assert.match(src,/elapsed>=6\*3600000\?'終了':'開催中'/);
assert.match(src,/function statusLabel\(D\)/);
assert.doesNotMatch(preview,/chatgpt\/reliability-v7\.7/);
assert.match(preview,/combat-hub\/main\/combat-hub\.js/);

console.log('COMBAT HUB current-data/source-drift audit regression: OK');
