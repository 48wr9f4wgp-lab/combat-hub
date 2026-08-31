import fs from 'node:fs';
import assert from 'node:assert/strict';

const src = fs.readFileSync('combat-hub.js', 'utf8');

assert.match(src, /const VERSION='7\.7\.5-github'/, 'Expected readability runtime v7.7.5');
assert.match(src, /function tx\(st,s,z,c,w='regular',n=1\)\{const t=st\.addText\(String\(s\?\?' '\)\)/, 'tx signature changed unexpectedly');
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

// Geometry remains frozen: readability pass must not move the verified card structure.
assert.match(src, /aBox\.size=new Size\(140,36\)/);
assert.match(src, /centerBox\.size=new Size\(44,36\)/);
assert.match(src, /bBox\.size=new Size\(140,36\)/);
assert.match(src, /const k1Inset=KEY==='k1'\?10:0/);
assert.match(src, /w\.addSpacer\(KEY==='k1'\?7:5\);divider\(w\)/);

console.log('COMBAT HUB typography regression: OK');
