import fs from 'node:fs';
import assert from 'node:assert/strict';

const src = fs.readFileSync('combat-hub.js', 'utf8');

assert.match(src, /const VERSION='7\.\d+\.\d+-github'/, 'Expected audited v7 runtime line');
assert.match(src, /k1:\{heroShade:\.66,posterShade:\.52,headerShade:\.10,mainShade:\.11,footShade:\.17,veil:\.055,gap:15,mainSize:13\.6,division:7\.3\}/, 'K-1 Medium contrast tokens regressed');
assert.match(src, /const MEDIUM_UI=/, 'K-1 must use the shared Medium geometry');
assert.match(src, /renderMediumMainName\(aBox,ctx\.a\.name\)/);
assert.match(src, /renderMediumMainName\(bBox,ctx\.b\.name\)/);
assert.doesNotMatch(src, /const k1Inset=KEY==='k1'\?10:0/, 'K-1 Medium must not carry a bespoke optical inset');

// Other organizations keep their verified layout tokens.
assert.match(src, /ufc:\{heroShade:\.68,posterShade:\.58,headerShade:\.13,mainShade:\.12,footShade:\.17,veil:\.018,gap:17,mainSize:13\.4,division:7\.3\}/);
assert.match(src, /rizin:\{heroShade:\.70,posterShade:\.60,headerShade:\.14,mainShade:\.13,footShade:\.19,veil:\.018,gap:17,mainSize:13\.1,division:7\.2\}/);
assert.match(src, /one:\{heroShade:\.68,posterShade:\.44,headerShade:\.16,mainShade:\.15,footShade:\.19,veil:\.028,gap:19,mainSize:13\.4,division:7\.3\}/);
assert.match(src, /boxing:\{heroShade:\.68,posterShade:\.52,headerShade:\.18,mainShade:\.18,footShade:\.23,veil:\.020,gap:18,mainSize:13\.6,division:7\.2\}/);

console.log('COMBAT HUB K-1 layout regression: OK');
