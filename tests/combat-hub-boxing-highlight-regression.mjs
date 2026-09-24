import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const src=fs.readFileSync('combat-hub.js','utf8');
const marker='const D=await loadData(),ctx=await heroContext(D);writeRuntimeAudit(D,ctx);const w=new ListWidget();';
assert.ok(src.includes(marker),'runtime instrumentation marker changed');
const instrumented=src.replace(
  marker,
  `globalThis.__boxingHighlight={boxingSourceId,boxingOfficialSource,boxingOfficialListingEvents,boxingHighlightValid,boxingHighlightScore,boxingTrustedHighlights,dedupeBoxingCandidates,discoverBoxingHighlight,safePendingEvent,loadData,boxingSourcePriority};if(globalThis.__TEST_ONLY__)return;${marker}`,
);

function sharedFM(){
  const strings=new Map(),images=new Map();
  return{
    strings,images,
    api:{
      documentsDirectory:()=>'/docs',
      joinPath:(a,b)=>`${a}/${b}`,
      fileExists:p=>strings.has(p)||images.has(p),
      readString:p=>{if(!strings.has(p))throw new Error('missing '+p);return strings.get(p);},
      writeString:(p,v)=>strings.set(p,String(v)),
      readImage:p=>{if(!images.has(p))throw new Error('missing image '+p);return images.get(p);},
      writeImage:(p,v)=>images.set(p,v),
    },
  };
}

async function boot({now=Date.parse('2026-09-23T12:00:00+09:00'),runsInWidget=false,fm=sharedFM(),textResponses={}}={}){
  const requests=[];
  class TestDate extends Date{static now(){return now;}}
  class Request{
    constructor(url){this.url=url;this.timeoutInterval=0;this.headers={};requests.push({kind:'construct',url});}
    async loadString(){requests.push({kind:'string',url:this.url});if(!(this.url in textResponses))throw new Error('network unavailable '+this.url);return textResponses[this.url];}
    async loadImage(){requests.push({kind:'image',url:this.url});throw new Error('image unavailable');}
  }
  const context={__TEST_ONLY__:true,args:{widgetParameter:'BOXING'},config:{runsInWidget,widgetFamily:'medium'},FileManager:{local:()=>fm.api},Request,Date:TestDate,console};
  vm.createContext(context);
  await vm.runInContext(instrumented,context,{timeout:3000});
  return{api:context.__boxingHighlight,fm,requests};
}

assert.match(src,/const VERSION='7\.23\.1-github'/);
assert.match(src,/const BOXING_SOURCE_POLICY_VERSION=2/);
for(const host of ['ringmagazine.com','matchroomboxing.com','premierboxingchampions.com','toprank.com','queensberry.co.uk','teiken.com'])assert.ok(src.includes(host),`missing official BOXING source: ${host}`);
assert.doesNotMatch(src,/goldenboypromotions\.com/,'Golden Boy must stay disabled until a stable public schedule surface is verified');
assert.match(src,/verifiedBy:'boxingHighlightDiscovery'/);
assert.match(src,/sourcePolicy:BOXING_SOURCE_POLICY_VERSION/);
assert.match(src,/KEY==='boxing'\?'注目興行を確認中':'次大会情報を確認中'/);
assert.match(src,/KEY==='boxing'\?'注目興行':'次大会'/);

{
  const {api}=await boot();
  assert.equal(api.boxingSourceId('https://www.ringmagazine.com/events/x'),'ring');
  assert.equal(api.boxingSourceId('https://www.matchroomboxing.com/events/x'),'matchroom');
  assert.equal(api.boxingSourceId('https://origin.premierboxingchampions.com/boxing-schedule'),'pbc');
  assert.equal(api.boxingSourceId('https://toprank.com/news/x'),'toprank');
  assert.equal(api.boxingSourceId('https://queensberry.co.uk/pages/x'),'queensberry');
  assert.equal(api.boxingSourceId('https://www.teiken.com/bout/'),'teiken');
  assert.ok(api.boxingSourcePriority({sourceId:'teiken'})>api.boxingSourcePriority({sourceId:'ring'}),'local promoter truth must outrank Ring metadata');
  assert.equal(api.boxingOfficialSource({source:'https://example.com/fight'}),false);
}

{
  const now=Date.parse('2026-09-23T12:00:00+09:00'),{api}=await boot({now});
  const trusted=api.boxingTrustedHighlights(now).sort((a,b)=>api.boxingHighlightScore(b,now)-api.boxingHighlightScore(a,now));
  assert.equal(trusted[0].name,'Prime Video Boxing 16','verified Japan world-title card should lead the current highlight set');
  assert.equal(trusted[0].promoter,'帝拳');
  assert.equal(trusted[0].startAt,'2026-09-27T16:30:00+09:00');
  assert.equal(trusted[0].location,'TOYOTA ARENA TOKYO');
}

{
  const now=Date.parse('2026-09-23T12:00:00+09:00'),{api}=await boot({now});
  const cfg={id:'matchroom',label:'Matchroom',url:'https://www.matchroomboxing.com/events/'};
  const html=`
    <section class="upcoming">
      <div>Saturday 03 October 2026</div>
      <a href="/events/whittaker-vs-wallace/">Ben Whittaker vs Conor Wallace</a>
      <div>Utilita Arena, Birmingham, UK</div>
    </section>`;
  const events=api.boxingOfficialListingEvents(html,cfg,now);
  assert.equal(events.length,1);
  assert.equal(events[0].main.a,'Ben Whittaker');
  assert.equal(events[0].main.b,'Conor Wallace');
  assert.equal(events[0].sourceId,'matchroom');
  assert.equal(events[0].liveSource,true);
}

{
  const now=Date.parse('2026-09-23T12:00:00+09:00'),fm=sharedFM();
  const manual=await boot({now,runsInWidget:false,fm,textResponses:{}});
  const data=await manual.api.loadData();
  assert.equal(data.cacheVerified,true,'manual BOXING run must persist a verified highlight');
  assert.equal(data.highlight,true);
  assert.equal(data.name,'Prime Video Boxing 16');
  assert.equal(data.promoter,'帝拳');
  assert.equal(data.startAt,'2026-09-27T16:30:00+09:00');
  assert.equal(data.location,'TOYOTA ARENA TOKYO');
  assert.equal(data.main.a,'井上拓真');
  assert.equal(data.main.b,'那須川天心');
  const saved=JSON.parse(fm.strings.get('/docs/combat-hub-next-boxing.json'));
  assert.equal(saved.verifiedBy,'boxingHighlightDiscovery');
  assert.equal(saved.sourcePolicy,2);
  assert.equal(saved.data.highlight,true);

  const widget=await boot({now,runsInWidget:true,fm,textResponses:{}});
  const cached=await widget.api.loadData();
  assert.equal(cached.name,'Prime Video Boxing 16');
  assert.equal(cached.startAt,'2026-09-27T16:30:00+09:00');
  assert.equal(cached.main.a,'井上拓真');
  assert.equal(cached.main.b,'那須川天心');
  assert.equal(cached.cacheVerified,true);
  assert.equal(cached.cardSourceType,'verified-boxing-highlight-cache');
  assert.equal(widget.requests.filter(r=>r.kind==='string').length,0,'BOXING Widget highlight consumption must remain network-free');
}

{
  const {api}=await boot({now:Date.parse('2027-03-01T12:00:00+09:00')});
  const p=api.safePendingEvent(Date.parse('2027-03-01T12:00:00+09:00'),true);
  assert.equal(p.name,'注目興行');
  assert.equal(p.main.a,'注目興行');
  assert.equal(p.highlightPending,true);
  assert.equal(p.nextPending,true);
}

console.log('COMBAT HUB BOXING highlighted-event aggregation: PASS');
