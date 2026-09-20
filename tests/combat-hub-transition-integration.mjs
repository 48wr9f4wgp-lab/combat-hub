import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const src=fs.readFileSync('combat-hub.js','utf8');
const renderMarker='const D=await loadData(),ctx=await heroContext(D);writeRuntimeAudit(D,ctx);const w=new ListWidget();';
assert.ok(src.includes(renderMarker),'runtime instrumentation marker changed');
const instrumented=src.replace(
  renderMarker,
  `globalThis.__transitionIntegration={loadData,loadLargeNext,currentLocked,rollforwardEligible,nextEligible,ufcListingEvents,k1ListingEvents,currentPagePairs,safePendingEvent,mainFromBout,shortLoc,trustedLargeNext,enrichTrustedEventMeta,division,largeNextTitle};if(globalThis.__TEST_ONLY__)return;${renderMarker}`,
);

function makeSharedFileManager(){
  const strings=new Map(),images=new Map();
  return {
    strings,images,
    api:{
      documentsDirectory:()=>'/docs',
      joinPath:(a,b)=>`${a}/${b}`,
      fileExists:p=>strings.has(p)||images.has(p),
      readString:p=>{if(!strings.has(p))throw new Error(`missing string: ${p}`);return strings.get(p);},
      writeString:(p,v)=>strings.set(p,String(v)),
      readImage:p=>{if(!images.has(p))throw new Error(`missing image: ${p}`);return images.get(p);},
      writeImage:(p,v)=>images.set(p,v),
    },
  };
}

async function boot(parameter,{now,runsInWidget=true,fm,textResponses={}}){
  const requests=[];
  class TestDate extends Date{static now(){return now;}}
  class Request{
    constructor(url){this.url=url;this.timeoutInterval=0;this.headers={};requests.push({url,kind:'construct'});}
    async loadString(){requests.push({url:this.url,kind:'string'});if(!(this.url in textResponses))throw new Error(`network string unavailable: ${this.url}`);const v=textResponses[this.url];if(v instanceof Error)throw v;return v;}
    async loadImage(){requests.push({url:this.url,kind:'image'});throw new Error(`network image unavailable: ${this.url}`);}
  }
  const context={
    __TEST_ONLY__:true,
    args:{widgetParameter:parameter},
    config:{runsInWidget,widgetFamily:'medium'},
    FileManager:{local:()=>fm.api},
    Request,
    Date:TestDate,
    console,
  };
  vm.createContext(context);
  await vm.runInContext(instrumented,context,{timeout:2000});
  assert.ok(context.__transitionIntegration,`failed to expose integration API for ${parameter}`);
  return{api:context.__transitionIntegration,requests};
}

function jsonLdListing(events){
  return `<script type="application/ld+json">${JSON.stringify(events.map(e=>({
    '@type':'Event',name:e.name,startDate:e.startAt,
    location:{name:e.location||'QA Venue'},url:e.source,
  })))}</script>`;
}
function evt(name,startAt,source,location='QA Venue'){return{name,startAt,source,location};}
function stringRequests(requests){return requests.filter(r=>r.kind==='string').map(r=>r.url);}

// v7.22.9 source-drift fixtures: placeholder override, canonical matching, and richer context selection.
{
  const now=Date.parse('2026-09-20T20:45:00+09:00'),fm=makeSharedFileManager();
  const {api}=await boot('UFC',{now,fm,textResponses:{}});
  const html=`
    <article class="event-card">
      <a href="/event/ufc-fight-night-september-26-2026">
        <h3>Rosas Jr. vs Barcelos</h3>
        <div>Sat, Sep 26 / 8:00 PM EDT / Main Card</div>
      </a>
    </article>`;
  const min=Date.parse('2026-09-20T16:00:00+09:00'),max=now+180*86400000;
  const cards=api.ufcListingEvents(html,'https://www.ufc.com/events',min,max);
  assert.equal(cards.length,1,'UFC anchor-card markup must be discoverable without legacy data-main-card');
  assert.equal(cards[0].source,'https://www.ufc.com/event/ufc-fight-night-september-26-2026');
  assert.equal(cards[0].startAt,'2026-09-27T00:00:00.000Z');
  const trustedNext=api.trustedLargeNext({
    name:'Crypto.com UFC 331: Van vs Pantoja 2',
    source:'https://jp.ufc.com/event/cryptocom-ufc-331',
    startAt:'2026-09-20T10:00:00+09:00',
    main:{a:'Joshua Van',b:'Alexandre Pantoja'},
  });
  assert.equal(trustedNext?.name,'UFC Fight Night: Rosas Jr. vs Barcelos','UFC Large must have a verified next-event fallback');
  const hydrated=api.enrichTrustedEventMeta({
    name:'UFC Fight Night',
    startAt:'2026-09-27T09:00:00+09:00',
    source:'https://www.ufc.com/event/ufc-fight-night-september-26-2026',
    location:'会場確認中',
  });
  assert.equal(hydrated.name,'UFC Fight Night: Rosas Jr. vs Barcelos','generic UFC live candidate must hydrate a verified event identity');
  assert.equal(hydrated.location,'ラスベガス','generic UFC live candidate must hydrate verified venue metadata');
  assert.equal(api.largeNextTitle(hydrated),'Rosas Jr. vs Barcelos','UFC Large next title must remove the generic promotion prefix');
}

{
  const now=Date.parse('2026-09-20T20:45:00+09:00'),fm=makeSharedFileManager();
  const {api}=await boot('K1',{now,fm,textResponses:{}});
  const html=`
    <section>
      <h4>2026年11月23日（月・祝）K-1</h4>
      <div>日時・会場</div><div>2026.11.23 (MON)</div><div>後楽園ホール</div>
      <a href="/k-1wgp/schedule/16670">詳細</a>
    </section>
    <section>
      <h4>2026年12月29日（火）K-1</h4>
      <div>日時・会場</div><div>2026.12.29 (TUE)</div><div>横浜BUNTAI</div>
      <a href="/k-1wgp/schedule/16678">詳細</a>
    </section>`;
  const events=api.k1ListingEvents(html,'https://www.k-1.co.jp/k-1wgp/schedule',now);
  assert.equal(events.length,2,'K-1 schedule markup must yield both future K-1 events');
  assert.equal(events[0].name,'K-1 2026.11.23');
  assert.equal(events[0].location,'後楽園ホール');
  assert.equal(events[1].name,'K-1 2026.12.29');
  assert.equal(events[1].location,'横浜BUNTAI');
  const sparseK1=api.enrichTrustedEventMeta({name:'K-1 2026.11.23',startAt:'2026-11-23T00:00:00+09:00',source:'https://www.k-1.co.jp/k-1wgp/schedule/16670',location:'会場未定',timeTba:true});
  assert.equal(sparseK1.location,'後楽園ホール','sparse K-1 live candidate must hydrate verified venue metadata');

  const current=await api.loadData();
  assert.equal(current.name,'K-1 2026.11.23','expired Sangju event must roll to verified 11/23 fallback when network is unavailable');
  assert.equal(current.location,'後楽園ホール');
  const next=await api.loadLargeNext(current);
  assert.equal(next?.name,'K-1 2026.12.29','K-1 Large next panel must fall through to verified 12/29 event');
  assert.equal(next?.location,'横浜BUNTAI');
}

{
  const now=Date.parse('2026-09-20T20:45:00+09:00'),fm=makeSharedFileManager();
  const {api}=await boot('ONE',{now,fm,textResponses:{}});
  const html=`
    <div class="fight">
      <div class="discipline">Flyweight Kickboxing</div>
      <tr class="vs"><td><a title="Panpayak Jitmuangnon"></a></td><td><a title="Lamnamoonlek Torfunfarm"></a></td></tr>
    </div>`;
  const pairs=api.currentPagePairs(html,'https://www.onefc.com/events/one-friday-fights-172/');
  assert.equal(pairs.length,1);
  assert.equal(pairs[0].context,'フライ級キックボクシング','ONE discipline must survive card parsing');
  assert.equal(api.division(pairs[0].context),'フライ級キックボクシング','Large division rendering must preserve ONE Kickboxing discipline');
  const hydratedOne=api.enrichTrustedEventMeta({
    name:'ONE Friday Fights 172',
    startAt:'2026-09-25T22:30:00+09:00',
    source:'https://www.onefc.com/events/one-friday-fights-172/',
    location:'バンコク',
    main:{a:'Panpayak Jitmuangnon',b:'Lamnamoonlek Torfunfarm',context:'フライ級'},
    support:[],
    cardTba:false,
  });
  assert.equal(hydratedOne.main.context,'フライ級キックボクシング','trusted ONE discipline must override a less-specific cached weight-only context');

  const isolated=api.mainFromBout(
    {name:'New Event',main:{a:'Old A',b:'Old B',context:'フライ級ムエタイ',aProfileURL:'https://old/a',bProfileURL:'https://old/b'}},
    {a:'New A',b:'New B',context:''},
  );
  assert.equal(isolated.context,'','new event/bout must not inherit old fight context');
  assert.equal(isolated.aProfileURL,null,'new event/bout must not inherit old fighter profile URL');
}

{
  const now=Date.parse('2026-09-20T20:45:00+09:00'),fm=makeSharedFileManager();
  const {api}=await boot('RIZIN',{now,fm,textResponses:{}});
  assert.equal(api.shortLoc('LaLa arena TOKYO-BAY'),'千葉・船橋','LaLa arena TOKYO-BAY must not normalize to Tokyo');
  const pending=api.safePendingEvent(now,false);
  assert.equal(pending.name,'次大会');
  assert.equal(pending.location,'会場未定');
  assert.equal(pending.posterURL,null);
  assert.equal(pending.source,null);
  assert.equal(pending.nextPending,true);
}

const SERIES={
  UFC:{listing:'https://www.ufc.com/events',prefix:'UFC Fight Night: QA'},
  RIZIN:{listing:'https://jp.rizinff.com/',prefix:'RIZIN QA'},
  ONE:{listing:'https://www.onefc.com/events/',prefix:'ONE QA'},
};

// UFC / RIZIN / ONE: exercise real loadData + loadLargeNext with shared cache across time.
for(const [parameter,cfg] of Object.entries(SERIES)){
  const fm=makeSharedFileManager();
  const b=evt(`${cfg.prefix} B`,'2026-10-10T10:00:00+09:00',`https://qa.example/${parameter.toLowerCase()}/b`);
  const c=evt(`${cfg.prefix} C`,'2026-10-17T10:00:00+09:00',`https://qa.example/${parameter.toLowerCase()}/c`);
  const d=evt(`${cfg.prefix} D`,'2026-10-24T10:00:00+09:00',`https://qa.example/${parameter.toLowerCase()}/d`);
  const listing=jsonLdListing([b,c,d]);

  const now1=Date.parse('2026-10-05T12:00:00+09:00');
  const first=await boot(parameter,{now:now1,fm,textResponses:{[cfg.listing]:listing}});
  const currentB=await first.api.loadData();
  assert.equal(currentB.name,b.name,`${parameter}: loadData must promote event B after the frozen snapshot expires`);
  const nextC=await first.api.loadLargeNext(currentB);
  assert.equal(nextC?.name,c.name,`${parameter}: loadLargeNext must discover C while B is current`);

  const now2=Date.parse('2026-10-10T23:00:00+09:00');
  const second=await boot(parameter,{now:now2,fm,textResponses:{[cfg.listing]:listing}});
  const currentC=await second.api.loadData();
  assert.equal(currentC.name,c.name,`${parameter}: expired B must be skipped and C promoted`);
  const nextD=await second.api.loadLargeNext(currentC);
  assert.equal(nextD?.name,d.name,`${parameter}: D must become next after C promotion`);
  assert.ok(stringRequests(second.requests).includes(cfg.listing),`${parameter}: expired discovery cache must trigger fresh listing lookup`);
}

// K-1: exercise the production trusted time-TBA B event, then real discovery of C/D.
{
  const parameter='K1',listing='https://www.k-1.co.jp/k-1wgp/schedule',fm=makeSharedFileManager();
  const trustedB={name:'K-1 FIGHTING NETWORK in Sangju Korea 2026',startAt:'2026-09-19T00:00:00+09:00'};
  const c=evt('K-1 QA C','2026-09-26T10:00:00+09:00','https://www.k-1.co.jp/k-1wgp/schedule/qa-c');
  const d=evt('K-1 QA D','2026-10-03T10:00:00+09:00','https://www.k-1.co.jp/k-1wgp/schedule/qa-d');
  const listingHtml=jsonLdListing([c,d]);

  const now1=Date.parse('2026-09-18T12:00:00+09:00');
  const first=await boot(parameter,{now:now1,fm,textResponses:{}});
  const currentB=await first.api.loadData();
  assert.equal(currentB.name,trustedB.name,'K1: trusted date-only event B must promote when live discovery is unavailable');
  assert.equal(currentB.timeTba,true,'K1: trusted B must retain timeTba=true');
  assert.equal(first.api.currentLocked(currentB),true,'K1: trusted time-TBA B must be protected by 36h grace');

  const firstNext=await boot(parameter,{now:now1,fm,textResponses:{[listing]:listingHtml}});
  const nextC=await firstNext.api.loadLargeNext(currentB);
  assert.equal(nextC?.name,c.name,'K1: C must be discoverable as next while trusted B is current');

  const now2=Date.parse('2026-09-20T13:00:00+09:00');
  const second=await boot(parameter,{now:now2,fm,textResponses:{[listing]:listingHtml}});
  assert.equal(second.api.rollforwardEligible({name:'K-1 WORLD MAX 2026',startAt:'2026-09-12T12:00:00+09:00',source:'qa'},currentB,now2),false,'K1: trusted B must expire after 36h');
  const currentC=await second.api.loadData();
  assert.equal(currentC.name,c.name,'K1: C must promote after trusted B grace expires');
  const nextD=await second.api.loadLargeNext(currentC);
  assert.equal(nextD?.name,d.name,'K1: D must become next after C promotion');
}

// BOXING: manual prefetch may discover; Widget execution must remain verified-cache-only.
{
  const parameter='BOXING',listing='https://www.ringmagazine.com/events',fm=makeSharedFileManager();
  const b=evt('QA Alpha vs QA Beta B','2026-10-10T10:00:00+09:00','https://www.ringmagazine.com/events/qa-b');
  const c=evt('QA Gamma vs QA Delta C','2026-10-17T10:00:00+09:00','https://www.ringmagazine.com/events/qa-c');
  const d=evt('QA Epsilon vs QA Zeta D','2026-10-24T10:00:00+09:00','https://www.ringmagazine.com/events/qa-d');
  const listingHtml=jsonLdListing([b,c,d]);

  const now1=Date.parse('2026-10-05T12:00:00+09:00');
  const manual1=await boot(parameter,{now:now1,runsInWidget:false,fm,textResponses:{[listing]:listingHtml}});
  const currentB=await manual1.api.loadData();
  assert.equal(currentB.name,b.name,'BOXING manual: B must be discovered and verified');
  assert.equal(currentB.cacheVerified,true,'BOXING manual: discovered B must be marked verified');
  const verified1=JSON.parse(fm.strings.get('/docs/combat-hub-next-boxing.json'));
  assert.equal(verified1.verifiedBy,'strictNextEvent','BOXING manual: verified cache provenance must be strictNextEvent');

  const widget1=await boot(parameter,{now:now1,runsInWidget:true,fm,textResponses:{}});
  const widgetB=await widget1.api.loadData();
  assert.equal(widgetB.name,b.name,'BOXING Widget: verified B must be read from cache');
  assert.equal(stringRequests(widget1.requests).length,0,'BOXING Widget: verified-cache read must not perform network discovery');
  const nextC=await manual1.api.loadLargeNext(currentB);
  assert.equal(nextC?.name,c.name,'BOXING manual: C must be discoverable as next while B is current');

  const now2=Date.parse('2026-10-10T23:00:00+09:00');
  const widget2=await boot(parameter,{now:now2,runsInWidget:true,fm,textResponses:{}});
  const pending=await widget2.api.loadData();
  assert.equal(pending.nextPending,true,'BOXING Widget: expired verified B must degrade to safe pending before manual refresh');
  assert.equal(pending.lightweightPending,true,'BOXING Widget: pending state must stay lightweight');
  assert.equal(stringRequests(widget2.requests).length,0,'BOXING Widget: expired cache must not trigger deep network discovery');

  const manual2=await boot(parameter,{now:now2,runsInWidget:false,fm,textResponses:{[listing]:listingHtml}});
  const currentC=await manual2.api.loadData();
  assert.equal(currentC.name,c.name,'BOXING manual: C must promote after B expires');
  assert.equal(currentC.cacheVerified,true,'BOXING manual: promoted C must be verified');

  const widget3=await boot(parameter,{now:now2,runsInWidget:true,fm,textResponses:{}});
  const widgetC=await widget3.api.loadData();
  assert.equal(widgetC.name,c.name,'BOXING Widget: refreshed verified C must be consumed from cache');
  assert.equal(stringRequests(widget3.requests).length,0,'BOXING Widget: refreshed cache consumption must remain network-free');
  const nextD=await manual2.api.loadLargeNext(currentC);
  assert.equal(nextD?.name,d.name,'BOXING manual: D must become next after C promotion');
}

console.log('five-series loadData/loadLargeNext transition integration: PASS');
