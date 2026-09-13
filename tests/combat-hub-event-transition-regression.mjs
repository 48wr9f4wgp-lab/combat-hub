import fs from 'node:fs';
import assert from 'node:assert/strict';

const src=fs.readFileSync('combat-hub.js','utf8');
assert.match(src,/v7\.12\.0-github/);
assert.match(src,/function sameEventIdentity\(/);
assert.match(src,/function rollforwardEligible\(/);
assert.match(src,/function nextEligible\(/);
assert.match(src,/RIZIN\.55/);
assert.match(src,/ONE Friday Fights 171 & The Inner Circle 31/);
assert.match(src,/K-1 FIGHTING NETWORK in Sangju Korea 2026/);
assert.match(src,/cachedData&&now-Number\(cached\.savedAt\)<6\*3600000&&nextEligible\(base,cachedData,now\)/);

const H=3600000,D=24*H;
const id=v=>String(v||'').toLowerCase().replace(/[^a-z0-9]+/g,'');
const source=v=>String(v?.source||'').toLowerCase().replace(/^https?:\/\/(?:www\.)?/,'').replace(/[?#].*$/,'').replace(/\/+$/,'');
const same=(a,b)=>!!a&&!!b&&((source(a)&&source(a)===source(b))||(id(a.name)&&id(a.name)===id(b.name)));
const validName=(key,n)=>({one:/ONE/i,rizin:/RIZIN/i,k1:/K-1/i}[key]||/.*/).test(n||'');
const nextOk=(key,base,e,now)=>{const t=Date.parse(e.startAt),bt=Date.parse(base.startAt);return Number.isFinite(t)&&Number.isFinite(bt)&&t>Math.max(bt+6*H,now)&&t<now+180*D&&validName(key,e.name)&&!same(base,e)};
const rollOk=(key,base,e,now)=>{const t=Date.parse(e.startAt),bt=Date.parse(base.startAt);return Number.isFinite(t)&&Number.isFinite(bt)&&t>bt+6*H&&t>now-12*H&&t<now+180*D&&validName(key,e.name)&&!same(base,e)};

const now=Date.parse('2026-09-13T17:52:00+09:00');
const samurai={name:'ONE SAMURAI 3',startAt:'2026-09-12T17:30:00+09:00',source:'https://www.onefc.com/events/one-samurai-3/'};
const staleSame={...samurai,startAt:'2026-09-18T17:30:00+09:00'};
assert.equal(nextOk('one',samurai,staleSame,now),false,'same event identity must never become next');
assert.equal(rollOk('one',{name:'ONE Friday Fights 170',startAt:'2026-09-11T22:30:00+09:00',source:'x'},samurai,now),false,'event older than 12h must not remain current');
const off171={name:'ONE Friday Fights 171 & The Inner Circle 31',startAt:'2026-09-18T00:00:00+09:00',source:'https://www.onefc.com/events/one-friday-fights-171/'};
assert.equal(rollOk('one',{name:'ONE Friday Fights 170',startAt:'2026-09-11T22:30:00+09:00',source:'x'},off171,now),true);
assert.equal(nextOk('one',samurai,off171,now),true);
const k1={name:'K-1 WORLD MAX 2026',startAt:'2026-09-12T12:00:00+09:00',source:'a'};
assert.equal(nextOk('k1',k1,{name:'K-1 FIGHTING NETWORK in Sangju Korea 2026',startAt:'2026-09-19T00:00:00+09:00',source:'b'},now),true);
const r16={name:'RIZIN LANDMARK 16 in NAGASAKI',startAt:'2026-10-03T14:00:00+09:00',source:'a'};
assert.equal(nextOk('rizin',r16,{name:'RIZIN.55',startAt:'2026-11-08T14:00:00+09:00',source:'b'},now),true);
console.log('event transition regression: PASS');
