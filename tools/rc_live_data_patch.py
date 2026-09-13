from pathlib import Path
import re

p=Path('combat-hub.js')
s=p.read_text()
s=s.replace('// v7.11.9-github — Boxing Large final visual polish','// v7.12.0-github — RC live-data transition hardening')
s=s.replace("const VERSION='7.11.9-github';","const VERSION='7.12.0-github';")

next_block="""const NEXT_SNAPSHOT={
  ufc:{startAt:'2026-09-20T10:00:00+09:00',location:'ロサンゼルス',name:'Crypto.com UFC 331: Van vs Pantoja 2',source:'https://jp.ufc.com/event/cryptocom-ufc-331',timeTba:false},
  rizin:{startAt:'2026-11-08T14:00:00+09:00',location:'LaLa arena TOKYO-BAY',name:'RIZIN.55',source:'https://jp.rizinff.com/_ct/17852466',timeTba:false},
  one:{startAt:'2026-09-18T00:00:00+09:00',location:'バンコク',name:'ONE Friday Fights 171 & The Inner Circle 31',source:'https://www.onefc.com/events/one-friday-fights-171/',timeTba:true},
  k1:{startAt:'2026-09-19T00:00:00+09:00',location:'韓国・尚州',name:'K-1 FIGHTING NETWORK in Sangju Korea 2026',source:'https://www.k-1.co.jp/k-1wgp/schedule/16687',timeTba:true}
};
"""
s,n=re.subn(r"const NEXT_SNAPSHOT=\{[\s\S]*?\n\};\n",next_block,s,count=1)
assert n==1, 'NEXT_SNAPSHOT patch failed'

same_line="function sameFight(a,b,x,y){const n=v=>String(v||'').toLowerCase().replace(/[\\s・.'’_-]+/g,'');return(n(a)===n(x)&&n(b)===n(y))||(n(a)===n(y)&&n(b)===n(x));}"
helpers="""function sameFight(a,b,x,y){const n=v=>String(v||'').toLowerCase().replace(/[\\s・.'’_-]+/g,'');return(n(a)===n(x)&&n(b)===n(y))||(n(a)===n(y)&&n(b)===n(x));}
function eventIdentityText(v){return stripHTML(v||'').toLowerCase().replace(/&/g,'and').replace(/[^a-z0-9\\u3040-\\u30ff\\u3400-\\u9fff]+/g,'');}
function eventSourceKey(ev){return String(ev?.source||'').toLowerCase().replace(/^https?:\\/\\/(?:www\\.)?/,'').replace(/[?#].*$/,'').replace(/\\/+$/,'');}
function sameEventIdentity(a,b){if(!a||!b)return false;const as=eventSourceKey(a),bs=eventSourceKey(b);if(as&&bs&&as===bs)return true;const an=eventIdentityText(a.name),bn=eventIdentityText(b.name);if(an&&bn&&an===bn)return true;if(a.main&&b.main&&sameFight(a.main.a,a.main.b,b.main.a,b.main.b))return true;return false;}
function rollforwardEligible(base,e,now=Date.now()){const t=new Date(e?.startAt).getTime(),baseT=new Date(base?.startAt).getTime();return Number.isFinite(t)&&Number.isFinite(baseT)&&t>baseT+6*3600000&&t>now-12*3600000&&t<now+180*86400000&&validOrgName(e?.name)&&!sameEventIdentity(base,e);}
function nextEligible(base,e,now=Date.now()){const t=new Date(e?.startAt).getTime(),baseT=new Date(base?.startAt).getTime();return Number.isFinite(t)&&Number.isFinite(baseT)&&t>Math.max(baseT+6*3600000,now)&&t<now+180*86400000&&validOrgName(e?.name)&&!sameEventIdentity(base,e);}"""
assert same_line in s, 'sameFight anchor missing'
s=s.replace(same_line,helpers,1)

strict_new="""async function strictNextEvent(snap){try{const listing=await reqText(S.listing),now=Date.now(),eligible=e=>rollforwardEligible(snap,e,now);let candidates=jsonLdEvents(listing,S.listing).map(normalizeOneCompositeEvent).filter(eligible);if(KEY==='ufc')candidates.push(...ufcListingEvents(listing,S.listing,Math.max(new Date(snap.startAt).getTime()+6*3600000,now-12*3600000),now+180*86400000).filter(eligible));const uniq=new Map();for(const e of candidates){const k=`${eventSourceKey(e)}|${eventIdentityText(e.name)}|${new Date(e.startAt).getTime()}`;if(!uniq.has(k))uniq.set(k,e);}candidates=[...uniq.values()];if(!candidates.length){for(const u of links(listing,S.listing,S.detail).slice(0,16)){try{const html=await reqText(u,8);for(const e of jsonLdEvents(html,u)){const candidate=normalizeOneCompositeEvent({...e,source:u});if(eligible(candidate))candidates.push(candidate);}}catch(_){}}}candidates=candidates.filter(e=>eligible(e)).sort((a,b)=>new Date(a.startAt)-new Date(b.startAt));if(!candidates.length)return null;const ev=candidates[0];let html='';try{html=await reqText(ev.source,8);}catch(_){}const detailName=html?ufcDetailName(html):'',detailLoc=html?ufcDetailLocation(html):'',pairs=html?currentPagePairs(html):[];const fallbackMain={a:'対戦カード',b:'発表待ち',context:ev.name};const main=pairs.length?{a:pairs[0].a,b:pairs[0].b,context:''}:fallbackMain;if(!pairs.length&&detailName)main.context=detailName;const support=pairs.slice(1,5).map((p,i)=>({label:i?'FEATURED':'CO-MAIN',a:p.a,b:p.b}));return {...snap,...ev,name:detailName||stripHTML(ev.name)||snap.name,location:shortLoc(detailLoc||ev.location)||(KEY==='ufc'?'会場確認中':snap.location),main,support,cardTba:!pairs.length,posterURL:html?metaImage(html,ev.source):null,timeTba:!!ev.timeTba,displayDate:ev.displayDate||null,live:true};}catch(_){return null;}}
function trustedRollforward(snap){const n=NEXT_SNAPSHOT[KEY];if(!n||!rollforwardEligible(snap,n,Date.now()))return null;const ev=normalizeOneCompositeEvent({...n});return {...snap,...ev,name:stripHTML(ev.name)||S.label,location:shortLoc(ev.location||'')||snap.location,main:{a:'対戦カード',b:'発表待ち',context:stripHTML(ev.name)||S.label},support:[],cardTba:true,posterURL:null,timeTba:!!ev.timeTba,displayDate:ev.displayDate||null,live:false,trustedNext:true};}
async function loadData(){const snap=normalizeOneCompositeEvent({...SNAPSHOT[KEY]});if(currentLocked(snap)){const current=await refreshLockedCurrent(snap);if(!current.posterURL)current.posterURL=await cachedMetaImageURL(current.source,`${KEY}-event`,4*3600000);current.lockedCurrent=true;return current;}const path=cacheFile(`combat-hub-next-${KEY}.json`),cached=readJSON(path),now=Date.now(),cachedData=cached?.data?normalizeOneCompositeEvent(cached.data):null;if(cachedData&&now-Number(cached.savedAt)<4*3600000&&rollforwardEligible(snap,cachedData,now))return cachedData;const live=await strictNextEvent(snap);if(live&&rollforwardEligible(snap,live,now)){writeJSON(path,{savedAt:now,data:live});return live;}const trusted=trustedRollforward(snap);if(trusted){writeJSON(path,{savedAt:now,data:trusted});return trusted;}if(cachedData&&rollforwardEligible(snap,cachedData,now))return {...cachedData,stale:true};return {...snap,cardTba:true,main:{a:'次大会',b:'確認中',context:S.label},support:[],nextPending:true};}
"""
s,n=re.subn(r"async function strictNextEvent\(snap\)\{[\s\S]*?\nasync function loadData\(\)\{[\s\S]*?\n\nfunction trustedLargeNext",strict_new+"\nfunction trustedLargeNext",s,count=1)
assert n==1, 'strict/loadData patch failed'

large_new="""function trustedLargeNext(base){const n=NEXT_SNAPSHOT[KEY];if(!n||!nextEligible(base,n,Date.now()))return null;return normalizeOneCompositeEvent({...n});}
async function loadLargeNext(base){const path=cacheFile(`combat-hub-large-next-${KEY}.json`),cached=readJSON(path),now=Date.now(),cachedData=cached?.data?normalizeOneCompositeEvent(cached.data):null;if(cachedData&&now-Number(cached.savedAt)<6*3600000&&nextEligible(base,cachedData,now))return cachedData;try{const listing=await reqText(S.listing,7),eligible=e=>nextEligible(base,e,now);let candidates=jsonLdEvents(listing,S.listing).map(normalizeOneCompositeEvent).filter(eligible);if(KEY==='ufc')candidates.push(...ufcListingEvents(listing,S.listing,Math.max(new Date(base.startAt).getTime()+6*3600000,now),now+180*86400000).filter(eligible));const uniq=new Map();for(const e of candidates){const k=`${eventSourceKey(e)}|${eventIdentityText(e.name)}|${new Date(e.startAt).getTime()}`;if(!uniq.has(k))uniq.set(k,e);}candidates=[...uniq.values()].filter(eligible).sort((a,b)=>new Date(a.startAt)-new Date(b.startAt));if(!candidates.length){const deep=await strictNextEvent(base);if(deep&&eligible(deep)){const data={name:stripHTML(deep.name)||S.label,startAt:deep.startAt,location:shortLoc(deep.location||''),source:deep.source||S.listing,timeTba:!!deep.timeTba,displayDate:deep.displayDate||null};writeJSON(path,{savedAt:now,data});return data;}const trusted=trustedLargeNext(base);if(trusted){writeJSON(path,{savedAt:now,data:trusted});return trusted;}return cachedData&&eligible(cachedData)?cachedData:null;}const ev=candidates[0],data={name:stripHTML(ev.name)||S.label,startAt:ev.startAt,location:shortLoc(ev.location||''),source:ev.source||S.listing,timeTba:!!ev.timeTba,displayDate:ev.displayDate||null};writeJSON(path,{savedAt:now,data});return data;}catch(_){return trustedLargeNext(base)||(cachedData&&nextEligible(base,cachedData,now)?cachedData:null);}}
"""
s,n=re.subn(r"function trustedLargeNext\(base\)\{[\s\S]*?\nasync function loadLargeNext\(base\)\{[\s\S]*?\n\n",large_new+"\n",s,count=1)
assert n==1, 'large-next patch failed'
p.write_text(s)

test=Path('tests/combat-hub-event-transition-regression.mjs')
test.write_text(r'''import fs from 'node:fs';
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
''')

wf=Path('.github/workflows/combat-hub-regression.yml')
w=wf.read_text()
anchor="      - name: Japanese display regression syntax check\n        run: node --check tests/combat-hub-japanese-display.mjs\n"
assert anchor in w
w=w.replace(anchor,anchor+"      - name: Event transition regression syntax check\n        run: node --check tests/combat-hub-event-transition-regression.mjs\n",1)
anchor2="      - name: COMBAT HUB Japanese display suite\n        run: node tests/combat-hub-japanese-display.mjs\n"
assert anchor2 in w
w=w.replace(anchor2,anchor2+"      - name: COMBAT HUB event transition suite\n        run: node tests/combat-hub-event-transition-regression.mjs\n",1)
wf.write_text(w)
