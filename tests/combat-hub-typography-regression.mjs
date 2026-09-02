import fs from 'node:fs';
import assert from 'node:assert/strict';

const src = fs.readFileSync('combat-hub.js', 'utf8');

assert.match(src, /const VERSION='7\.8\.0-github'/, 'Expected audited runtime v7.8.0');
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
assert.match(src, /function renderMainName\(box,name\)\{const parts=mainNameParts\(name\);for\(const part of parts\)\{const t=tx\(box,part,V\.mainSize,new Color\(C\.text\),'black',1\);/, 'RIZIN complete-line renderer missing');
assert.match(src, /if\(KEY==='rizin'&&parts\.length>1\)t\.minimumScaleFactor=\.86/, 'RIZIN multiline scale floor missing');
assert.match(src, /function boxingCenterBand\(c\)\{if\(KEY!=='boxing'\)return;const bands=\[190,158,126,96,68\]/, 'BOXING center contrast band missing or too weak');
assert.equal((src.match(/boxingCenterBand\(c\);softCenter/g) || []).length, 2, 'BOXING center contrast must apply to hero and poster backgrounds');
assert.match(src, /const footColor=KEY==='one'\?new Color\('#E0E4EA',\.82\):new Color\(C\.muted\)/, 'ONE footer contrast polish missing');

// Geometry remains frozen: final visual pass must not move the verified card structure.
assert.match(src, /aBox\.size=new Size\(140,36\)/);
assert.match(src, /centerBox\.size=new Size\(44,36\)/);
assert.match(src, /bBox\.size=new Size\(140,36\)/);
assert.match(src, /const k1Inset=KEY==='k1'\?10:0/);
assert.match(src, /w\.addSpacer\(KEY==='k1'\?7:5\);divider\(w\)/);

console.log('COMBAT HUB typography regression: OK');
