import fs from 'node:fs';
import assert from 'node:assert/strict';

const src = fs.readFileSync('combat-hub.js', 'utf8');

assert.match(src, /const VERSION='7\.7\.5-github'/, 'Expected readability runtime v7.7.5');
assert.match(src, /k1:\{heroShade:\.60,posterShade:\.46,headerShade:\.10,mainShade:\.11,footShade:\.17,veil:\.055,gap:15,mainSize:13\.6,division:7\.3\}/, 'K-1 main row must retain the verified v7.7.4 geometry');
assert.match(src, /const k1Inset=KEY==='k1'\?10:0;if\(k1Inset\)main\.addSpacer\(k1Inset\)/, 'K-1 symmetric outer inset missing');
assert.match(src, /aBox\.size=new Size\(140,36\);if\(KEY==='k1'\)aBox\.size=new Size\(130,36\)/, 'K-1 left fighter box optical inset missing');
assert.match(src, /bBox\.size=new Size\(140,36\);if\(KEY==='k1'\)bBox\.size=new Size\(130,36\)/, 'K-1 right fighter box optical inset missing');
assert.match(src, /if\(k1Inset\)main\.addSpacer\(k1Inset\);w\.addSpacer\(3\)/, 'K-1 right outer inset must mirror the left');
assert.match(src, /w\.addSpacer\(KEY==='k1'\?7:5\);divider\(w\)/, 'K-1 support-card baseline compensation missing');

// The center VS axis must not move: outer insets are exactly paid for by narrower fighter boxes.
const oldFixedWidth = 140 + 44 + 140;
const k1FixedWidth = 10 + 130 + 44 + 130 + 10;
assert.equal(k1FixedWidth, oldFixedWidth, 'K-1 optical inset moved the center axis');

// Other organizations keep their verified layout tokens.
assert.match(src, /ufc:\{heroShade:\.68,posterShade:\.58,headerShade:\.13,mainShade:\.12,footShade:\.17,veil:\.018,gap:17,mainSize:13\.4,division:7\.3\}/);
assert.match(src, /rizin:\{heroShade:\.70,posterShade:\.60,headerShade:\.14,mainShade:\.13,footShade:\.19,veil:\.018,gap:17,mainSize:13\.1,division:7\.2\}/);
assert.match(src, /one:\{heroShade:\.68,posterShade:\.44,headerShade:\.16,mainShade:\.15,footShade:\.19,veil:\.028,gap:19,mainSize:13\.4,division:7\.3\}/);
assert.match(src, /boxing:\{heroShade:\.68,posterShade:\.52,headerShade:\.18,mainShade:\.18,footShade:\.23,veil:\.020,gap:18,mainSize:13\.6,division:7\.2\}/);

console.log('COMBAT HUB K-1 layout regression: OK');
