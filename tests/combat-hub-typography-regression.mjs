import fs from 'node:fs';
import assert from 'node:assert/strict';

const src = fs.readFileSync('combat-hub.js', 'utf8');

assert.match(src, /const VERSION='7\.\d+\.\d+-github'/, 'Expected audited v7 runtime line');
assert.match(src, /function tx\(st,s,z,c,w='regular',n=1\)/, 'tx signature changed unexpectedly');
assert.match(src, /t\.font=fnt\(typeSize\(z\),w\)/, 'Typography scaling must be centralized in tx()');
assert.match(src, /if\(z===20\)return 20\.5/, 'Organization label scale missing');
assert.match(src, /if\(z===8\.1\)return 9\.0/, 'Date/location scale missing');
assert.match(src, /if\(z===6\.1\)return 6\.8/, 'MAIN EVENT label scale missing');
assert.match(src, /if\(z===13\.1\)return 13\.8/, 'RIZIN main-name scale missing');
assert.match(src, /if\(z===13\.4\)return 14\.1/, 'UFC/ONE main-name scale missing');
assert.match(src, /if\(z===13\.6\)return 14\.3/, 'BOXING/K-1 main-name scale missing');
assert.match(src, /if\(z===7\.2\)return 7\.9/, '7.2 division scale missing');
assert.match(src, /if\(z===7\.3\)return 8\.0/, '7.3 division scale missing');
assert.match(src, /if\(z===7\.1\)return 7\.8/, 'Support-label scale missing');
assert.match(src, /if\(z===6\.8\)return 7\.5/, 'Footer/undercard scale missing');
assert.match(src, /function supportFont\(s\)\{const n=\[\.\.\.String\(s\|\|''\)\]\.length;return n>13\?8\.7:n>10\?9\.2:9\.8;\}/, 'Support fighter typography scale regressed');
assert.match(src, /C=\{text:'#F7F8FA',sub:'#D7DCE3',muted:'#9AA2AD'\}/, 'Readability contrast tokens regressed');

// Final visual polish guards.
assert.match(src, /function mainNameParts\(s\)\{const v=String\(s\|\|''\);if\(KEY!=='rizin'\|\|\[\.\.\.v\]\.length<=12\)return\[v\];/, 'RIZIN long-name splitter missing');
assert.match(src, /function renderMainName\(box,name\)\{const parts=mainNameParts\(jpDisplay\(name\)\);for\(const part of parts\)\{const t=tx\(box,part,V\.mainSize,new Color\(C\.text\),'black',1\);/, 'Localized RIZIN complete-line renderer missing');
assert.match(src, /if\(KEY==='rizin'&&parts\.length>1\)t\.minimumScaleFactor=\.86/, 'RIZIN multiline scale floor missing');
assert.match(src, /function boxingCenterBand\(c\)\{if\(KEY!=='boxing'\)return;const bands=\[190,158,126,96,68\]/, 'BOXING center contrast band missing or too weak');
assert.equal((src.match(/boxingCenterBand\(c\);softCenter/g) || []).length, 2, 'BOXING center contrast must apply to hero and poster backgrounds');

// Medium v7.17.0 uses one geometry and type scale across all organizations.
assert.match(src, /const MEDIUM_UI=\{org:20\.5,event:8\.8,status:6\.7,countdown:13\.1,statusDate:7\.5,statusLoc:7\.5,heroGap:12,pending:14\.4,pendingSub:7\.5,main:14\.3,mainLabel:7\.5,vs:15\.2,division:8\.0,supportLabel:7\.5,supportName:8\.8,headerW:205,statusW:105\}/);
assert.match(src, /function renderMedium\(w,D,ctx\)/);
assert.match(src, /hl\.size=new Size\(MEDIUM_UI\.headerW,0\)/);
assert.match(src, /status\.size=new Size\(MEDIUM_UI\.statusW,0\)/);
assert.match(src, /mediumRightText\(status,largeStatusHeading\(D\),MEDIUM_UI\.status/);
assert.match(src, /mediumRightText\(status,largeStatusDate\(D\),MEDIUM_UI\.statusDate/);
assert.match(src, /mediumRightText\(status,largeStatusLocation\(D\),MEDIUM_UI\.statusLoc/);
assert.match(src, /renderMediumMainName\(aBox,ctx\.a\.name\)/);
assert.match(src, /renderMediumMainName\(bBox,ctx\.b\.name\)/);
assert.match(src, /mediumSupportRow\(w,row\)/);
assert.doesNotMatch(src, /const k1Inset=KEY==='k1'\?10:0/);
assert.doesNotMatch(src, /tx\(meta,dateText\(D\),8\.1/);

console.log('COMBAT HUB typography regression: OK');