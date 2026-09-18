import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const src=fs.readFileSync('combat-hub.js','utf8');
const marker='const D=await loadData(),ctx=await heroContext(D);writeRuntimeAudit(D,ctx);const w=new ListWidget();';
assert.ok(src.includes(marker),'runtime instrumentation marker changed');
const instrumented=src.replace(
  marker,
  `globalThis.__hardening={safeKey,sourceImageCandidates,jsonLdImageCandidates,k1PosterCandidates,linkedFighterBouts,currentPagePairs,fightContext,ringDetailBouts,refreshKnownRollforwardEvent,eventPosterResult,heroContext,loadData,supportLabelFor,normalizedExistingSupportLabel,normalizedOfficialSupportLabel,writeRuntimeAudit};if(globalThis.__TEST_ONLY__)return;${marker}`,
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

assert.match(src,/const VERSION='7\.22\.0-github'/);
assert.match(src,/const IMAGE_POLICY_VERSION=1/);
assert.match(src,/const KNOWN_EVENT_CARD_REFRESH_MS=30\*60\*1000,CARD_POLICY_VERSION=4/);
assert.match(src,/ringmagazine\.com\/events\/pitbull-vs-bravo-4KcUnNvGRpDnb0ONBP3SkH/);
assert.doesNotMatch(src,/ufc\.com\/news\/garcia-vs-benn-official-fight-card/,'stale noncanonical BOXING source must be gone');

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
  assert.match(data.main.context,/Flyweight Title Bout/i);
  assert.notEqual(data.main.context,data.name);
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
