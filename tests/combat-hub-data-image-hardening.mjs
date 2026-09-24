import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const src=fs.readFileSync('combat-hub.js','utf8');
const marker='const D=await loadData(),ctx=await heroContext(D);writeRuntimeAudit(D,ctx);const w=new ListWidget();';
assert.ok(src.includes(marker),'runtime instrumentation marker changed');
const instrumented=src.replace(
  marker,
  `globalThis.__hardening={safeKey,sourceImageCandidates,jsonLdImageCandidates,k1PosterCandidates,linkedFighterBouts,currentPagePairs,fightContext,ringDetailBouts,refreshKnownRollforwardEvent,eventPosterResult,heroContext,loadData,supportLabelFor,normalizedExistingSupportLabel,normalizedOfficialSupportLabel,writeRuntimeAudit,sanitizeEventFightContext};if(globalThis.__TEST_ONLY__)return;${marker}`,
);

function sharedFM(){
  const strings=new Map(),images=new Map();
  return {
    strings,images,
    api:{
      documentsDirectory:()=>'/docs',
      joinPath:(a,b)=>`${a}/${b}`,
      fileExists:p=>strings.has(p)||images.has(p),
      readString:p=>{if(!strings.has(p))throw new Error('missing string '+p);return strings.get(p);},
      writeString:(p,v)=>strings.set(p,String(v)),
      readImage:p=>{if(!images.has(p))throw new Error('missing image '+p);return images.get(p);},
      writeImage:(p,v)=>images.set(p,v),
    },
  };
}

async function boot(parameter,{now=Date.parse('2026-09-18T12:00:00+09:00'),runsInWidget=true,fm=sharedFM(),textResponses={},imageResponses={}}={}){
  const requests=[];
  class TestDate extends Date{static now(){return now;}}
  class Request{
    constructor(url){this.url=url;this.headers={};this.timeoutInterval=0;requests.push({kind:'construct',url});}
    async loadString(){requests.push({kind:'string',url:this.url});if(!(this.url in textResponses))throw new Error('no text '+this.url);const v=textResponses[this.url];if(v instanceof Error)throw v;return v;}
    async loadImage(){requests.push({kind:'image',url:this.url});if(!(this.url in imageResponses))throw new Error('no image '+this.url);const v=imageResponses[this.url];if(v instanceof Error)throw v;return v;}
  }
  const context={__TEST_ONLY__:true,args:{widgetParameter:parameter},config:{runsInWidget,widgetFamily:'medium'},FileManager:{local:()=>fm.api},Request,Date:TestDate,console};
  vm.createContext(context);
  await vm.runInContext(instrumented,context,{timeout:3000});
  assert.ok(context.__hardening);
  return{api:context.__hardening,fm,requests};
}

const stringRequests=r=>r.filter(x=>x.kind==='string');
const imageRequests=r=>r.filter(x=>x.kind==='image');

assert.match(src,/const VERSION='7\.23\.1-github'/);
assert.match(src,/const IMAGE_POLICY_VERSION=2/);
assert.match(src,/const KNOWN_EVENT_CARD_REFRESH_MS=30\*60\*1000,CARD_POLICY_VERSION=10/);
assert.match(src,/ringmagazine\.com\/events\/pitbull-vs-bravo-4KcUnNvGRpDnb0ONBP3SkH/);
assert.doesNotMatch(src,/ufc\.com\/news\/garcia-vs-benn-official-fight-card/,'stale noncanonical BOXING source must be gone');
assert.match(src,/return sanitizeEventFightContext\(\{\.\.\.snap,\.\.\.ev,[\s\S]*?cardSourceType:pairs\.length\?'official-discovery':'verified-fallback'\}\);/,'fresh strictNextEvent discovery/fallback must be sanitized before first render/cache write');

// UFC structured bouts: official profile URLs + bout context.
{
  const source='https://www.ufc.com/event/cryptocom-ufc-331';
  const html=`
    <section>Main Card
      <div class="bout"><div>Flyweight Title Bout</div>
        <a href="/athlete/joshua-van">Joshua Van</a><span>vs</span><a href="/athlete/alexandre-pantoja">Alexandre Pantoja</a>
      </div>
      <div class="bout"><div>Lightweight Bout</div>
        <a href="/athlete/arman-tsarukyan">Arman Tsarukyan</a><span>vs</span><a href="/athlete/mauricio-ruffy">Mauricio Ruffy</a>
      </div>
    </section><section>Prelims</section>`;
  const {api}=await boot('UFC');
  const bouts=api.linkedFighterBouts(html,source);
  assert.equal(bouts[0].a,'Joshua Van');
  assert.equal(bouts[0].b,'Alexandre Pantoja');
  assert.equal(bouts[0].aProfileURL,'https://www.ufc.com/athlete/joshua-van');
  assert.match(bouts[0].context,/Flyweight Title Bout/i);
  assert.equal(bouts[1].bProfileURL,'https://www.ufc.com/athlete/mauricio-ruffy');
}

// K-1 structured card + poster gallery priority.
{
  const source='https://www.k-1.co.jp/k-1wgp/schedule/16687';
  const html=`
    <h3>対戦カード</h3>
    <h4>-70kg級/3分3R・延長1R</h4>
    <a href="/k-1wgp/fighter/1793">キム・ヒョンジュン / Kim Hyun Jun</a><span>VS</span><a href="/k-1wgp/fighter/1001">小田 尋久 / Oda Jinku</a>
    <h4>-63kg級/3分3R・延長1R</h4>
    <a href="/fighter/2002">イ・ヒョンソク / Lee Hyun Seok</a><span>VS</span><a href="/fighter/1315">原田 闘鬼 / Harada Toki</a>
    <h3>ポスターギャラリー</h3><img src="/images/poster-first.jpg" alt="K-1 Sangju poster"><img src="/images/poster-second.jpg"><h3>ニュース</h3>`;
  const {api}=await boot('K1');
  const bouts=api.currentPagePairs(html,source);
  assert.equal(bouts[0].context,'-70kg級');
  assert.equal(bouts[1].context,'-63kg級');
  assert.match(bouts[0].aProfileURL,/fighter\/1793$/);
  const imgs=api.sourceImageCandidates(html,source,{name:'K-1 FIGHTING NETWORK in Sangju Korea 2026',main:{a:'キム・ヒョンジュン',b:'小田 尋久'}});
  assert.equal(imgs[0].source,'poster_gallery');
  assert.equal(imgs[0].url,'https://www.k-1.co.jp/images/poster-first.jpg');
}

// K-1 must never promote broad-context "注目/Featured" noise into an authoritative fight label.
{
  const source='https://www.k-1.co.jp/k-1wgp/schedule/16687';
  const html=`
    <h3>対戦カード</h3>
    <h4>-70kg級/3分3R・延長1R</h4>
    <a href="/fighter/1">Alpha</a><span>VS</span><a href="/fighter/2">Bravo</a>
    <div>注目選手インタビュー</div>
    <h4>-70kg級/3分3R・延長1R</h4>
    <a href="/fighter/3">Charlie</a><span>VS</span><a href="/fighter/4">Delta</a>
    <h4>-63kg級/3分3R・延長1R</h4>
    <a href="/fighter/5">Echo</a><span>VS</span><a href="/fighter/6">Foxtrot</a>
    <h3>ポスターギャラリー</h3>`;
  const {api}=await boot('K1');
  const bouts=api.linkedFighterBouts(html,source);
  assert.equal(bouts[2].officialLabel,'','K-1 broad-context 注目 noise must not become FEATURED');
  assert.equal(api.supportLabelFor({support:[]},bouts[2],1),'MAIN CARD','third K-1 bout must fall back to MAIN CARD / 本戦');
}

// K-1 poster gallery must outrank stale event-hero/meta candidates on the first render.
{
  const source='https://www.k-1.co.jp/k-1wgp/schedule/16687';
  const stale='https://img.example/k1-hero.jpg';
  const poster='https://www.k-1.co.jp/images/sangju-poster.jpg';
  const posterImage={size:{width:1200,height:1600},id:'k1-poster'};
  const staleImage={size:{width:1200,height:800},id:'stale-hero'};
  const html=`<div class="event-hero"><img src="${stale}"></div><h3>ポスターギャラリー</h3><img src="${poster}" alt="K-1 Sangju poster"><h3>ニュース</h3>`;
  const {api,requests}=await boot('K1',{textResponses:{[source]:html},imageResponses:{[stale]:staleImage,[poster]:posterImage}});
  const result=await api.eventPosterResult({
    source,
    posterURL:stale,
    posterSource:'event_hero',
    posterCandidates:[{url:stale,source:'event_hero'}],
    name:'K-1 FIGHTING NETWORK in Sangju Korea 2026',
    main:{a:'キム・ヒョンジュン',b:'小田 尋久'},
  });
  assert.equal(result.image?.id,'k1-poster');
  assert.equal(result.source,'poster_gallery');
  assert.equal(result.url,poster);
  assert.ok(stringRequests(requests).some(x=>x.url===source),'K-1 resolver must re-resolve official source before accepting stale hero when no poster-gallery candidate is cached');
  assert.equal(imageRequests(requests)[0]?.url,poster,'poster-gallery image must be attempted before stale hero');
}

// Generic K-1 logo/icon URLs must not become event artwork.
{
  const source='https://www.k-1.co.jp/k-1wgp/schedule/16687';
  const logo='https://www.k-1.co.jp/assets/images/k-1-logo.png';
  const poster='https://www.k-1.co.jp/images/sangju-poster.jpg';
  const html=`<h3>ポスターギャラリー</h3><img src="${poster}"><h3>ニュース</h3>`;
  const {api,requests}=await boot('K1',{textResponses:{[source]:html},imageResponses:{[poster]:{size:{width:1200,height:1600},id:'poster'}}});
  const result=await api.eventPosterResult({source,posterURL:logo,posterSource:'event_hero',posterCandidates:[]});
  assert.equal(result.url,poster);
  assert.equal(imageRequests(requests).some(x=>x.url===logo),false,'generic K-1 logo must be filtered from event artwork candidates');
}

// Image candidate fallback: failed first candidate must fall through to second.
{
  const bad='https://img.example/bad.jpg',good='https://img.example/good.jpg',image={size:{width:1200,height:800},id:'good'};
  const {api,requests}=await boot('ONE',{imageResponses:{[good]:image}});
  const result=await api.eventPosterResult({source:null,posterCandidates:[{url:bad,source:'event_hero'},{url:good,source:'jsonld'}]});
  assert.equal(result.image?.id,'good');
  assert.equal(result.url,good);
  assert.equal(imageRequests(requests).length,2);
}

// Confirmed refresh must replace event-name contamination with actual bout context.
{
  const source='https://www.ufc.com/event/cryptocom-ufc-331';
  const html=`<section>Main Card<div>Flyweight Title Bout</div><a href="/athlete/joshua-van">Joshua Van</a><span>vs</span><a href="/athlete/alexandre-pantoja">Alexandre Pantoja</a></section><section>Prelims</section>`;
  const {api}=await boot('UFC',{textResponses:{[source]:html}});
  const data=await api.refreshKnownRollforwardEvent({source,name:'Crypto.com UFC 331: Van vs Pantoja 2',main:{a:'対戦カード',b:'発表待ち',context:'Crypto.com UFC 331: Van vs Pantoja 2'},support:[],cardTba:true});
  assert.equal(data.main.a,'Joshua Van');
  assert.equal(data.main.context,'フライ級タイトル戦');
  assert.notEqual(data.main.context,data.name);
}

// Stale v7.22 cache must never re-authorize an event title as fight context when refresh fails.
for(const fixture of [
  {parameter:'UFC',path:'/docs/combat-hub-next-ufc.json',name:'Crypto.com UFC 331: Van vs Pantoja 2',source:'https://jp.ufc.com/event/cryptocom-ufc-331',a:'Joshua Van',b:'Alexandre Pantoja',expected:/フライ級タイトル戦/},
  {parameter:'K1',path:'/docs/combat-hub-next-k1.json',name:'K-1 FIGHTING NETWORK in Sangju Korea 2026',source:'https://www.k-1.co.jp/k-1wgp/schedule/16687',a:'キム・ヒョンジュン',b:'小田 尋久',expected:/-70kg級/},
]){
  const now=Date.parse('2026-09-18T12:00:00+09:00'),fm=sharedFM();
  fm.strings.set(fixture.path,JSON.stringify({
    savedAt:now-60_000,cardCheckedAt:now-60_000,cardRefreshedAt:now-60_000,cardPolicy:4,
    data:{name:fixture.name,source:fixture.source,startAt:fixture.parameter==='UFC'?'2026-09-20T10:00:00+09:00':'2026-09-19T00:00:00+09:00',location:'QA',timeTba:fixture.parameter==='K1',main:{a:fixture.a,b:fixture.b,context:fixture.name},support:[],cardTba:false}
  }));
  const {api}=await boot(fixture.parameter,{now,fm,textResponses:{}});
  const data=await api.loadData();
  assert.match(data.main.context,fixture.expected,`${fixture.parameter}: trusted fallback context must replace cached event title`);
  assert.notEqual(data.main.context,fixture.name,`${fixture.parameter}: event title contamination survived cache migration`);
  const saved=JSON.parse(fm.strings.get(fixture.path));
  assert.equal(saved.cardPolicy,10,`${fixture.parameter}: transition/context migration must persist policy 10`);
  assert.match(saved.data.main.context,fixture.expected,`${fixture.parameter}: sanitized context must be persisted`);
}

// Locale-aware fight identity must bridge official JP names and trusted English snapshot names.
{
  const {api}=await boot('UFC');
  assert.equal(
    api.sanitizeEventFightContext({
      name:'Crypto.com UFC 331: Van vs Pantoja 2',
      source:'https://jp.ufc.com/event/cryptocom-ufc-331',
      startAt:'2026-09-20T10:00:00+09:00',
      main:{a:'ジョシュア・ヴァン',b:'アレシャンドレ・パントージャ',context:''},
      support:[],
      cardTba:false,
    }).main.context,
    'フライ級タイトル戦'
  );
}

// Fresh discovered event data with an empty official context must still recover trusted bout context before first render.
{
  const {api}=await boot('UFC');
  const data=api.sanitizeEventFightContext({
    name:'Crypto.com UFC 331: Van vs Pantoja 2',
    source:'https://www.ufc.com/event/cryptocom-ufc-331',
    startAt:'2026-09-20T10:00:00+09:00',
    main:{a:'Joshua Van',b:'Alexandre Pantoja',context:''},
    support:[],
    cardTba:false,
    cardSourceType:'official-discovery',
  });
  assert.equal(data.main.context,'フライ級タイトル戦');
}

// Ring detail must extract main + co-main and reject broadcast copy as fight context.
{
  const ring=`
    <script>self.__next_f.push([1,"{\"mainFight\":{\"tagLine\":\"Live on DAZN\",\"fighterA\":{\"name\":\"Isaac Cruz\"},\"fighterB\":{\"name\":\"Nestor Bravo\"}},\"fight2\":{\"tagLine\":\"WBC interim middleweight world title\",\"fighterA\":{\"name\":\"Jesus Ramos\"},\"fighterB\":{\"name\":\"Meiirim Nursultanov\"}}}"])</script>`;
  const {api}=await boot('BOXING');
  const bouts=api.ringDetailBouts(ring);
  assert.equal(bouts[0].a,'Isaac Cruz');
  assert.equal(bouts[0].b,'Nestor Bravo');
  assert.equal(bouts[0].context,'');
  assert.equal(bouts[1].a,'Jesus Ramos');
  assert.equal(bouts[1].b,'Meiirim Nursultanov');
  assert.match(bouts[1].context,/WBC interim middleweight world title/i);
}

// Existing cached MAIN CARD labels are positional, not authoritative: first support must normalize to CO-MAIN.
{
  const {api}=await boot('K1');
  assert.equal(api.normalizedExistingSupportLabel('MAIN CARD',0),'CO-MAIN');
  assert.equal(api.normalizedExistingSupportLabel('MAIN CARD',1),'MAIN CARD');
  const data=api.sanitizeEventFightContext({
    name:'K-1 FIGHTING NETWORK in Sangju Korea 2026',
    source:'https://www.k-1.co.jp/k-1wgp/schedule/16687',
    main:{a:'キム・ヒョンジュン',b:'小田 尋久',context:'-70kg級'},
    support:[
      {label:'MAIN CARD',a:'ヤン・ホンチョル',b:'大石 昌輝'},
      {label:'MAIN CARD',a:'イ・ヒョンソク',b:'原田 闘鬼'},
    ],
  });
  assert.equal(data.support[0].label,'CO-MAIN');
  assert.equal(data.support[1].label,'MAIN CARD');
}

// Label semantics: legacy inferred Featured normalizes away, authoritative Featured is preserved.
{
  const {api}=await boot('RIZIN');
  assert.equal(api.normalizedExistingSupportLabel('FEATURED',1),'MAIN CARD');
  assert.equal(api.normalizedOfficialSupportLabel('FEATURED',1),'FEATURED');
  assert.equal(api.supportLabelFor({support:[]},{a:'A',b:'B',officialLabel:'FEATURED'},1),'FEATURED');
}

// BOXING manual current verification must prefetch image; Widget consumes local cache only.
{
  const fm=sharedFM(),source='https://www.ringmagazine.com/events/pitbull-vs-bravo-4KcUnNvGRpDnb0ONBP3SkH',poster='https://img.ring.example/cruz-bravo.jpg',posterImage={size:{width:1200,height:800},id:'ring-poster'};
  const html=`
    <meta property="og:image" content="${poster}">
    <script>self.__next_f.push([1,"{\"mainFight\":{\"tagLine\":\"Live on DAZN\",\"fighterA\":{\"name\":\"Isaac Cruz\"},\"fighterB\":{\"name\":\"Nestor Bravo\"}},\"fight2\":{\"tagLine\":\"WBC interim middleweight world title\",\"fighterA\":{\"name\":\"Jesus Ramos\"},\"fighterB\":{\"name\":\"Meiirim Nursultanov\"}}}"])</script>`;
  const manual=await boot('BOXING',{fm,runsInWidget:false,textResponses:{[source]:html},imageResponses:{[poster]:posterImage}});
  const verified=await manual.api.loadData();
  assert.equal(verified.cacheVerified,true);
  assert.equal(verified.main.a,'Isaac Cruz');
  assert.equal(verified.support[0].a,'Jesus Ramos');
  const saved=JSON.parse(fm.strings.get('/docs/combat-hub-current-boxing.json'));
  assert.equal(saved.verifiedBy,'refreshLockedCurrent');
  assert.equal(saved.data.posterPrefetched,true);

  const widget=await boot('BOXING',{fm,runsInWidget:true,textResponses:{},imageResponses:{}});
  const local=await widget.api.loadData();
  const ctx=await widget.api.heroContext(local);
  assert.equal(local.cacheVerified,true);
  assert.equal(ctx.poster?.id,'ring-poster');
  assert.equal(ctx.imageMode,'cached_poster');
  assert.equal(stringRequests(widget.requests).length,0,'BOXING Widget current path must perform zero text network work');
  assert.equal(imageRequests(widget.requests).length,0,'BOXING Widget current path must perform zero image network work');
}

// Image refresh must not mutate event-discovery cache timestamps.
{
  const fm=sharedFM(),eventPath='/docs/combat-hub-next-one.json',saved={savedAt:123456789,data:{name:'ONE QA'}},poster='https://img.example/one.jpg';
  fm.strings.set(eventPath,JSON.stringify(saved));
  const {api}=await boot('ONE',{fm,imageResponses:{[poster]:{size:{width:10,height:10},id:'one'}}});
  await api.eventPosterResult({posterURL:poster,source:null});
  assert.deepEqual(JSON.parse(fm.strings.get(eventPath)),saved);
}

// Runtime audit must expose image/card diagnostics without visible debug UI.
{
  const {api,fm}=await boot('UFC');
  api.writeRuntimeAudit(
    {name:'QA',source:'https://www.ufc.com/event/qa',main:{a:'A',b:'B',aProfileURL:'https://www.ufc.com/athlete/a',bProfileURL:'https://www.ufc.com/athlete/b'},cardSourceType:'official-detail',cardCheckedAt:111,cardRefreshedAt:222},
    {imageMode:'fighter_pair',posterURLResolved:null,posterSource:'none',poster:null,a:{profileURL:'https://www.ufc.com/athlete/a',image:{}},b:{profileURL:'https://www.ufc.com/athlete/b',image:{}},imageCacheHit:true,imageFallbackReason:null},
  );
  const audit=JSON.parse(fm.strings.get('/docs/combat-hub-runtime-audit.json'));
  assert.equal(audit.imageMode,'fighter_pair');
  assert.equal(audit.aImageLoaded,true);
  assert.equal(audit.cardSourceType,'official-detail');
  assert.equal(audit.cardCheckedAt,111);
  assert.equal(audit.cardRefreshedAt,222);
}

console.log('COMBAT HUB v7.22 data/image hardening regression: OK');
