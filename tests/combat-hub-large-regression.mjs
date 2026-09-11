import fs from 'node:fs';
import assert from 'node:assert/strict';
const src = fs.readFileSync('combat-hub.js', 'utf8');
assert.match(src, /const VERSION='7\.9\.0-github'/);
assert.match(src, /const IS_LARGE=config\.widgetFamily==='large'/);
assert.match(src, /async function loadLargeNext\(base\)/);
assert.match(src, /combat-hub-large-next-\$\{KEY\}\.json/);
assert.equal((src.match(/pairs\.slice\(1,5\)\.map/g)||[]).length, 2);
assert.match(src, /function largeBackground\(ctx\)/);
assert.match(src, /function renderLarge\(w,D,ctx,next\)/);
assert.match(src, /\(D\.support\|\|\[\]\)\.slice\(0,4\)/);
assert.match(src, /'NEXT EVENT'/);
assert.match(src, /await w\.presentLarge\(\)/);
assert.match(src, /w\.setPadding\(14,16,12,16\)/);
assert.match(src, /aBox\.size=new Size\(132,44\)/);
assert.match(src, /center\.size=new Size\(44,44\)/);
assert.match(src, /bBox\.size=new Size\(132,44\)/);
assert.match(src, /await w\.presentMedium\(\)/);
assert.match(src, /strictNextEvent\(base\)/, 'Large next-event deep fallback missing');
assert.match(src, /'FEATURED CARD'/, 'Large featured-card section missing');
assert.match(src, /OFFICIAL DATA  ·  AUTO REFRESH/, 'Large footer missing');

assert.match(src, /function largePortraitSlot\(image,side\)/, 'Large portrait slot crop missing');
assert.match(src, /new Rect\(14,8,314,370\)/, 'Large left portrait slot missing');
assert.match(src, /new Rect\(392,8,314,370\)/, 'Large right portrait slot missing');
assert.doesNotMatch(src, /function largeImageRect\(/, 'Legacy overlapping Large portrait renderer remains');

console.log('COMBAT HUB large widget regression: OK');
