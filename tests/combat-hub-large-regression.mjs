import fs from 'node:fs';
import assert from 'node:assert/strict';
const src = fs.readFileSync('combat-hub.js', 'utf8');

assert.match(src, /const VERSION='7\.13\.0-github'/, 'Large readability pass version missing');
assert.match(src, /const IS_LARGE=config\.widgetFamily==='large'/);
assert.match(src, /async function loadLargeNext\(base\)/);
assert.match(src, /combat-hub-large-next-\$\{KEY\}\.json/);
assert.match(src, /function largeBackground\(ctx\)/);
assert.match(src, /function renderLarge\(w,D,ctx,next,nextPoster\)/);
assert.match(src, /\(D\.support\|\|\[\]\)\.slice\(0,2\)/, 'Large readability pass must cap support rows at two');
assert.match(src, /await w\.presentLarge\(\)/);
assert.match(src, /w\.setPadding\(14,16,12,16\)/);
assert.match(src, /new Rect\(0,0,360,520\)/, 'Large left portrait slot missing');
assert.match(src, /new Rect\(360,0,360,520\)/, 'Large right portrait slot must meet center with no black gap');
assert.match(src, /'メインイベント'/, 'Centered main-event tag missing');
assert.match(src, /center\.size=new Size\(42,46\)/, 'Expanded VS center column missing');
assert.doesNotMatch(src, /center\.backgroundColor=/, 'VS axis must remain unboxed');

// Readability hierarchy: bigger header, metadata, main event and lower dashboard.
assert.match(src, /tx\(hl,S\.label,24,/, 'Large organization title must be prominent');
assert.match(src, /jpDisplay\(D\.name\|\|''\),9\.2/, 'Large event-title typography missing');
assert.match(src, /dateText\(D\),9\.0/, 'Large date typography missing');
assert.match(src, /renderLargeMainName\(box,name\)[\s\S]*tx\(box,part,16\.0/, 'Large main-fighter typography missing');
assert.match(src, /tx\(center,'VS',17\.0/, 'Large VS typography missing');
assert.match(src, /division\(D\.main\.context\),9\.0/, 'Large division typography missing');
assert.match(src, /D\.nextPending\?'次大会情報を確認中':'対戦カード発表待ち',17\.2/, 'Large pending hero hierarchy missing');

assert.match(src, /dashHeight=compactBoxing\?122:142/, 'Readable adaptive dashboard height missing');
assert.match(src, /left\.size=new Size\(compactBoxing\?308:\(next\?176:204\),dashHeight-20\)/, 'Readable fight-pane width missing');
assert.match(src, /right\.size=new Size\(next\?119:91,122\)/, 'Readable next-event pane missing');
assert.match(src, /rule\.size=new Size\(1,112\)/, 'Readable dashboard divider missing');
assert.match(src, /function largeMiniPoster\(image\)/, 'Next-event poster treatment missing');
assert.match(src, /function largeNextTitle\(next\)/, 'Compact next-event title helper missing');
assert.match(src, /KEY==='rizin'\?\.72/, 'RIZIN readability veil missing');
assert.match(src, /KEY==='one'\?\.50/, 'ONE readability veil missing');

assert.match(src, /function jpCardLabel\(label\)/, 'Japanese card-label mapper missing');
assert.match(src, /'対戦カード'/, 'Japanese fight-card label missing');
assert.match(src, /'次大会'/, 'Japanese next-event label missing');
assert.match(src, /jpCardLabel\(row\.label\),wide\?8\.4:7\.8/, 'Readable card-label typography missing');
assert.match(src, /jpDisplay\(row\.a\),wide\?10\.4:9\.5/, 'Readable fighter-name typography missing');
assert.match(src, /largeNextTitle\(next\),10\.8/, 'Readable next-event title typography missing');
assert.match(src, /'公式情報を確認中',9\.2/, 'BOXING compact next-status line missing');
assert.match(src, /badge\.cornerRadius=11/, 'Premium countdown radius missing');
assert.match(src, /badge\.setPadding\(5,10,5,10\)/, 'Premium countdown padding missing');
assert.match(src, /w\.addSpacer\(pending\?20:\(KEY==='boxing'\?24:27\)\)/, 'Large hero spacing missing');

// BOXING memory/data safety must survive the visual pass unchanged.
assert.match(src, /const BOXING_LARGE=IS_LARGE&&KEY==='boxing'/, 'BOXING Large ultra-light gate missing');
assert.match(src, /lightweightPending:true/, 'BOXING expired-event local fallback missing');
assert.match(src, /function boxingPrefetchValid\(snap,e,now=Date\.now\(\)\)/, 'BOXING verified prefetch validator missing');
assert.match(src, /function boxingVerifiedCache\(cached,snap,now\)/, 'BOXING verified cache reader missing');
assert.match(src, /if\(KEY==='boxing'&&config\.runsInWidget\)\{[\s\S]*if\(verifiedBoxing\)return\{\.\.\.verifiedBoxing,prefetched:true,cacheVerified:true\}/, 'BOXING widgets must read verified cache only');
assert.match(src, /verifiedBy:'strictNextEvent'/, 'BOXING manual prefetch verification marker missing');
assert.match(src, /const NEXT=BOXING_LARGE\?null:\(IS_LARGE\?await loadLargeNext\(D\):null\)/, 'BOXING Large must skip next-event scraping');
assert.match(src, /NEXT_POSTER=IS_LARGE&&NEXT&&!BOXING_LARGE\?await eventPoster\(NEXT\):null/, 'BOXING Large must skip next-event poster loading');
assert.match(src, /function largeFightRow\(st,row,wide=false\)/, 'BOXING wide fight-row mode missing');
assert.match(src, /largeFightRow\(left,row,compactBoxing\)/, 'BOXING adaptive row call missing');
assert.match(src, /if\(KEY!=='boxing'\)\{const sl=status\.addStack\(\)/, 'BOXING Large status label should be suppressed');
assert.match(src, /if\(KEY==='boxing'&&config\.runsInWidget\)\{const safePoster=!D\.nextPending&&!D\.lightweightPending&&\(!!D\.lockedCurrent\|\|sameEventIdentity\(D,SNAPSHOT\.boxing\)\);return\{a:\{name:D\.main\.a,image:null\},b:\{name:D\.main\.b,image:null\},poster:safePoster\?await eventPoster\(D\):null,lightweight:true\};\}/, 'BOXING pending state must suppress unverified poster loading');
assert.match(src, /if\(BOXING_LARGE\)\{if\(ctx\.poster\)w\.backgroundImage=ctx\.poster;else w\.backgroundGradient=gradient\(\);renderLarge\(w,D,ctx,NEXT,null\);\}/, 'BOXING Large must keep lightweight fallback without full DrawContext composition');

assert.match(src, /const NEXT_SNAPSHOT=/, 'Trusted next-event fallback missing');
assert.match(src, /function trustedLargeNext\(base\)/, 'Large trusted-next fallback helper missing');
assert.match(src, /for\(let i=0;i<160;i\+\+\)/, 'Cinematic hero fade missing');
assert.doesNotMatch(src, /for\(let i=0;i<28;i\+\+\)/, 'Old glow stack should stay removed');
assert.match(src, /await w\.presentMedium\(\)/, 'Medium rendering path must remain');
assert.match(src, /function writeRuntimeAudit\(D,ctx\)/, 'Runtime sync audit writer missing');
assert.match(src, /combat-hub-runtime-audit\.json/, 'Runtime sync audit cache missing');
assert.doesNotMatch(src, /VERSION\.replace\('-github',''\)/, 'Visible runtime markers should stay removed');
assert.match(src, /try\{w\.backgroundImage=largeBackground\(ctx\);renderLarge\(w,D,ctx,NEXT,NEXT_POSTER\);\}catch\(_\)/, 'Non-BOXING Large render fallback missing');

console.log('COMBAT HUB Large v7.13 readability + BOXING safety regression: OK');
