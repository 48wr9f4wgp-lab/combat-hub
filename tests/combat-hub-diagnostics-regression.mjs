import fs from 'node:fs';
import assert from 'node:assert/strict';

const src=fs.readFileSync('combat-hub-diagnostics.js','utf8');
assert.match(src,/COMBAT HUB Diagnostics/,'diagnostics identity missing');
assert.match(src,/combat-hub-runtime-v4-meta\.json/,'runtime loader metadata inspection missing');
for(const key of ['ufc','rizin','one','boxing','k1'])assert.ok(src.includes(`${key}:{label:`),`${key} diagnostics config missing`);
assert.match(src,/combat-hub-next-\$\{key\}\.json/,'next-event cache inspection missing');
assert.match(src,/fresh4h:/,'4h cache freshness classification missing');
assert.match(src,/combat-hub-diagnostics-last\.json/,'local diagnostics snapshot missing');
assert.match(src,/LIVE NETWORK PROBE/,'network probe report missing');
assert.match(src,/QuickLook\.present/,'manual diagnostics output missing');
assert.equal(/tackle-fit/i.test(src),false,'Tackle Fit dependency must not return');
assert.equal(/analytics|telemetry endpoint|fetch\(['\"]https?:\/\/[^'\"]*analytics/i.test(src),false,'diagnostics must not add telemetry');
console.log('COMBAT HUB diagnostics regression checks: OK');
