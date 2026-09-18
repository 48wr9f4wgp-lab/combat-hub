import fs from 'node:fs';
import assert from 'node:assert/strict';

const src=fs.readFileSync('combat-hub.js','utf8');

assert.match(src,/const VERSION='7\.20\.0-github'/,'Small pass runtime version missing');
assert.match(src,/const MODE_MAP=\{UFC:'ufc',RIZIN:'rizin',ONE:'one',BOXING:'boxing',K1:'k1'\}/,'five-series mode map changed');
assert.match(src,/const SMALL_UI=\{/,'SMALL_UI token set missing');
assert.match(src,/function renderSmall\(w,D,ctx\)/,'renderSmall missing');
assert.match(src,/function smallCountdown\(D\)/,'small countdown helper missing');
assert.match(src,/function smallDate\(D\)/,'small date helper missing');
assert.match(src,/function smallLocation\(D\)/,'small location helper missing');
assert.match(src,/c\.size=new Size\(338,338\)/,'square Small background canvas missing');
assert.match(src,/const IS_LARGE=config\.widgetFamily==='large',IS_SMALL=config\.widgetFamily==='small'/,'Small family routing missing');
assert.match(src,/else if\(IS_SMALL\)\{w\.setPadding\(SMALL_UI\.pad,SMALL_UI\.pad,9,SMALL_UI\.pad\)/,'Small must have dedicated safe padding');
assert.match(src,/renderSmall\(w,D,ctx\);\n\}else\{w\.setPadding\(10,14,8,14\)/,'Small must not fall through to Medium renderer');
assert.match(src,/if\(KEY==='boxing'\)w\.backgroundGradient=gradient\(\)/,'BOXING Small must keep the low-memory gradient path');
assert.match(src,/else if\(IS_SMALL\)await w\.presentSmall\(\)/,'manual Small preview routing missing');
assert.match(src,/D\.nextPending\?'次大会情報\\n確認中':'対戦カード\\n発表待ち'/,'Small pending copy contract missing');
assert.match(src,/tx\(w,'メインイベント',SMALL_UI\.mainLabel/,'Small confirmed main-event hierarchy missing');
assert.match(src,/smallDate\(D\).*smallLocation\(D\)/s,'Small footer metadata missing');

const smallBody=src.slice(src.indexOf('function renderSmall(w,D,ctx){'),src.indexOf("function mediumRightText",src.indexOf('function renderSmall(w,D,ctx){')));
assert.doesNotMatch(smallBody,/if\(KEY===/,'Small renderer geometry must remain organization-agnostic');

console.log('COMBAT HUB Small five-series regression: OK');
