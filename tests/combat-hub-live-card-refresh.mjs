import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const src=fs.readFileSync('combat-hub.js','utf8');
const marker='const D=await loadData(),ctx=await heroContext(D);writeRuntimeAudit(D,ctx);const w=new ListWidget();';
assert.ok(src.includes(marker),'Runtime instrumentation marker changed');
const instrumented=src.replace(marker,`globalThis.__cardInternals={linkedFighterPairs,semanticVsPairs,officialPagePairs,currentPagePairs,supportsLiveCardRefresh,eventDetailSources,refreshKnownRollforwardEvent,trustedRollforward,fallbackSupportLabel,normalizedExistingSupportLabel,supportLabelFor,supportRowsFromPairs};if(globalThis.__TEST_ONLY__)return;${marker}`);

function fm(){
  const strings=new Map(),images=new Map();
  return {
    documentsDirectory:()=>'/docs',joinPath:(a,b)=>`${a}/${b}`,
    fileExists:p=>strings.has(p)||images.has(p),readString:p=>strings.get(p),
    writeString:(p,v)=>strings.set(p,String(v)),readImage:p=>images.get(p),writeImage:(p,v)=>images.set(p,v),
  };
}

async function boot(parameter,{now,textResponses={}}={}){
  const requests=[];
  const fixed=now??Date.parse('2026-09-18T11:30:00+09:00');
  class TestDate extends Date{static now(){return fixed;}}
  class Request{
    constructor(url){this.url=url;this.headers={};this.timeoutInterval=0;requests.push(url);}
    async loadString(){if(!(this.url in textResponses))throw new Error('no fixture '+this.url);const v=textResponses[this.url];if(v instanceof Error)throw v;return v;}
    async loadImage(){throw new Error('image not needed');}
  }
  const context={__TEST_ONLY__:true,args:{widgetParameter:parameter},config:{runsInWidget:true},FileManager:{local:()=>fm()},Request,Date:TestDate,console};
  vm.createContext(context);
  await vm.runInContext(instrumented,context,{timeout:2000});
  return {api:context.__cardInternals,requests};
}

assert.match(src,/const VERSION='7\.22\.0-github'/);
assert.match(src,/const KNOWN_EVENT_CARD_REFRESH_MS=30\*60\*1000,CARD_POLICY_VERSION=5/);
assert.match(src,/function supportsLiveCardRefresh\(\)\{return KEY==='ufc'\|\|KEY==='rizin'\|\|KEY==='one'\|\|KEY==='k1';\}/);
assert.match(src,/Number\(cached\?\.cardPolicy\)!==CARD_POLICY_VERSION/,'old caches must be invalidated once for the new card policy');
assert.match(src,/const hydrated=supportsLiveCardRefresh\(\)\?await refreshKnownRollforwardEvent\(trusted\):trusted/,'trusted known events must be hydrated immediately');
assert.match(src,/main:\{a:'Joshua Van',b:'Alexandre Pantoja'/,'verified UFC fallback main card missing');
assert.match(src,/a:'Arman Tsarukyan',b:'Mauricio Ruffy'/,'verified UFC fallback co-main missing');
assert.match(src,/main:\{a:'キム・ヒョンジュン',b:'小田 尋久'/,'verified K-1 fallback first card missing');
assert.match(src,/a:'ヤン・ホンチョル',b:'大石 昌輝'/,'verified K-1 fallback second card missing');

{
  const jp='https://jp.ufc.com/event/cryptocom-ufc-331';
  const www='https://www.ufc.com/event/cryptocom-ufc-331';
  const html=`
    <a href="/athlete/joshua-van"><span>Joshua Van</span></a>
    <a href="/athlete/alexandre-pantoja">Alexandre Pantoja</a>
    <a href="/athlete/arman-tsarukyan">Arman Tsarukyan</a>
    <a href="/athlete/mauricio-ruffy">Mauricio Ruffy</a>
    <a href="/athlete/patricio-pitbull">Patricio Pitbull</a>
    <a href="/athlete/dooho-choi">Dooho Choi</a>`;
  const {api,requests}=await boot('UFC',{textResponses:{[jp]:new Error('jp unavailable'),[www]:html}});
  assert.equal(api.supportsLiveCardRefresh(),true);
  const pairs=api.officialPagePairs(html,www);
  assert.deepEqual(JSON.parse(JSON.stringify(pairs.slice(0,2).map(p=>({a:p.a,b:p.b})))),[
    {a:'Joshua Van',b:'Alexandre Pantoja'},
    {a:'Arman Tsarukyan',b:'Mauricio Ruffy'},
  ]);
  assert.match(pairs[0].aProfileURL,/\/athlete\/joshua-van$/);
  const refreshed=await api.refreshKnownRollforwardEvent({source:jp,name:'Crypto.com UFC 331: Van vs Pantoja 2',main:{a:'対戦カード',b:'発表待ち'},support:[],cardTba:true});
  assert.equal(refreshed.cardTba,false);
  assert.equal(refreshed.main.a,'Joshua Van');
  assert.equal(refreshed.main.b,'Alexandre Pantoja');
  assert.equal(refreshed.support[0].a,'Arman Tsarukyan');
  assert.equal(refreshed.support[0].b,'Mauricio Ruffy');
  assert.equal(refreshed.support[0].label,'CO-MAIN');
  assert.equal(refreshed.support[1].label,'MAIN CARD');
  assert.ok(requests.includes(www),'UFC www fallback detail source must be attempted');
  const trusted=api.trustedRollforward({startAt:'2026-09-13T06:00:00+09:00',name:'Noche UFC',location:'グレンデール',main:{},support:[]});
  assert.equal(trusted.cardTba,false);
  assert.equal(trusted.main.a,'Joshua Van');
}

{
  const source='https://www.k-1.co.jp/k-1wgp/schedule/16687';
  const html=`
    <a href="/k-1wgp/fighter/1793">キム・ヒョンジュン / Kim Hyun Jun</a><span>VS</span>
    <a href="/k-1wgp/fighter/1001">小田 尋久 / Oda Jinku</a>
    <a href="/fighter/2001">ヤン・ホンチョル / Yang Hong Cheol</a><span>VS</span>
    <a href="/fighter/1349">大石 昌輝 / Oishi Masaki</a>
    <a href="/fighter/2002">イ・ヒョンソク / Lee Hyun Seok</a><span>VS</span>
    <a href="/fighter/1315">原田 闘鬼 / Harada Toki</a>`;
  const {api}=await boot('K1',{textResponses:{[source]:html}});
  assert.equal(api.supportsLiveCardRefresh(),true);
  const pairs=api.currentPagePairs(html,source);
  assert.deepEqual(JSON.parse(JSON.stringify(pairs.slice(0,3).map(p=>({a:p.a,b:p.b})))),[
    {a:'キム・ヒョンジュン',b:'小田 尋久'},
    {a:'ヤン・ホンチョル',b:'大石 昌輝'},
    {a:'イ・ヒョンソク',b:'原田 闘鬼'},
  ]);
  assert.match(pairs[0].aProfileURL,/fighter\/1793$/);
  const refreshed=await api.refreshKnownRollforwardEvent({source,name:'K-1 FIGHTING NETWORK in Sangju Korea 2026',main:{a:'対戦カード',b:'発表待ち'},support:[],cardTba:true});
  assert.equal(refreshed.cardTba,false);
  assert.equal(refreshed.main.a,'キム・ヒョンジュン');
  assert.equal(refreshed.main.b,'小田 尋久');
  assert.equal(refreshed.support.length,2);
  assert.equal(refreshed.support[0].label,'CO-MAIN');
  assert.equal(refreshed.support[1].label,'MAIN CARD');
  const trusted=api.trustedRollforward({startAt:'2026-09-12T12:00:00+09:00',name:'K-1 WORLD MAX 2026',location:'東京',main:{},support:[]});
  assert.equal(trusted.cardTba,false);
  assert.equal(trusted.main.b,'小田 尋久');
}

{
  const {api}=await boot('RIZIN');
  assert.equal(api.fallbackSupportLabel(0),'CO-MAIN');
  assert.equal(api.fallbackSupportLabel(1),'MAIN CARD');
  assert.equal(api.normalizedExistingSupportLabel('FEATURED',1),'MAIN CARD','legacy inferred FEATURED must normalize to MAIN CARD');
  assert.equal(api.normalizedExistingSupportLabel('TITLE FIGHT',1),'TITLE FIGHT','explicit title-fight labels remain preserved');
}
console.log('COMBAT HUB UFC/K-1 live-card freshness regression: OK');
