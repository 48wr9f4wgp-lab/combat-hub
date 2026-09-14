import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const src=fs.readFileSync('combat-hub.js','utf8');
const renderMarker='const D=await loadData(),ctx=await heroContext(D);writeRuntimeAudit(D,ctx);const w=new ListWidget();';
assert.ok(src.includes(renderMarker),'runtime instrumentation marker changed');
const instrumented=src.replace(
  renderMarker,
  `globalThis.__transitionInternals={currentGraceMs,currentLocked,rollforwardEligible,nextEligible,sameEventIdentity,eventSourceKey,eventIdentityText};if(globalThis.__TEST_ONLY__)return;${renderMarker}`,
);

function fileManager(){
  const strings=new Map(),images=new Map();
  return {
    documentsDirectory:()=>'/docs',
    joinPath:(a,b)=>`${a}/${b}`,
    fileExists:p=>strings.has(p)||images.has(p),
    readString:p=>strings.get(p),
    writeString:(p,v)=>strings.set(p,String(v)),
    readImage:p=>images.get(p),
    writeImage:(p,v)=>images.set(p,v),
  };
}

async function boot(parameter,now){
  class TestDate extends Date{static now(){return now;}}
  class Request{constructor(url){this.url=url;}async loadString(){throw new Error(`network disabled in transition QA: ${this.url}`);}async loadImage(){throw new Error(`network disabled in transition QA: ${this.url}`);}}
  const context={
    __TEST_ONLY__:true,
    args:{widgetParameter:parameter},
    config:{runsInWidget:true},
    FileManager:{local:()=>fileManager()},
    Request,
    Date:TestDate,
    console,
  };
  vm.createContext(context);
  await vm.runInContext(instrumented,context,{timeout:2000});
  assert.ok(context.__transitionInternals,`failed to expose transition internals for ${parameter}`);
  return context.__transitionInternals;
}

const H=3600000,D=24*H;
const orgs={
  UFC:{prefix:'UFC Fight Night: QA',timeTba:false},
  RIZIN:{prefix:'RIZIN QA',timeTba:false},
  ONE:{prefix:'ONE Friday Fights QA',timeTba:false},
  BOXING:{prefix:'QA Fighter vs QA Fighter',timeTba:false},
  K1:{prefix:'K-1 QA',timeTba:true},
};

function event(prefix,n,startAt,timeTba=false){return{name:`${prefix} ${n}`,startAt,source:`https://qa.example/${encodeURIComponent(prefix)}/${n}`,timeTba};}
function pickCurrent(api,base,candidates,now){return candidates.filter(e=>api.rollforwardEligible(base,e,now)).sort((a,b)=>Date.parse(a.startAt)-Date.parse(b.startAt))[0]||null;}
function pickNext(api,base,candidates,now){return candidates.filter(e=>api.nextEligible(base,e,now)).sort((a,b)=>Date.parse(a.startAt)-Date.parse(b.startAt))[0]||null;}

for(const [parameter,cfg] of Object.entries(orgs)){
  const a=event(cfg.prefix,1,'2026-10-01T10:00:00+09:00',false);
  const b=event(cfg.prefix,2,cfg.timeTba?'2026-10-08T00:00:00+09:00':'2026-10-08T10:00:00+09:00',cfg.timeTba);
  const c=event(cfg.prefix,3,'2026-10-15T10:00:00+09:00',false);
  const d=event(cfg.prefix,4,'2026-10-22T10:00:00+09:00',false);

  const beforeAExpiry=Date.parse('2026-10-01T21:00:00+09:00');
  const apiA=await boot(parameter,beforeAExpiry);
  assert.equal(apiA.currentLocked(a),true,`${parameter}: exact-time current event must remain locked inside 12h grace`);

  const afterAExpiry=Date.parse('2026-10-01T23:00:00+09:00');
  const apiB=await boot(parameter,afterAExpiry);
  assert.equal(apiB.currentLocked(a),false,`${parameter}: exact-time current event must unlock after 12h grace`);
  assert.equal(pickCurrent(apiB,a,[b,c,d],afterAExpiry)?.name,b.name,`${parameter}: event 2 must promote after event 1 expires`);
  assert.equal(pickNext(apiB,b,[c,d],afterAExpiry)?.name,c.name,`${parameter}: event 3 must be discoverable as next while event 2 is current`);

  const afterBExpiry=cfg.timeTba
    ? Date.parse('2026-10-09T13:00:00+09:00')
    : Date.parse('2026-10-08T23:00:00+09:00');
  const apiC=await boot(parameter,afterBExpiry);
  assert.equal(pickCurrent(apiC,a,[b,c,d],afterBExpiry)?.name,c.name,`${parameter}: event 3 must promote after event 2 expires`);
  assert.equal(pickNext(apiC,c,[d],afterBExpiry)?.name,d.name,`${parameter}: event 4 must be discoverable as next after second promotion`);
  if(cfg.timeTba){
    const withinTbaGrace=Date.parse('2026-10-09T11:00:00+09:00');
    const apiTba=await boot(parameter,withinTbaGrace);
    assert.equal(apiTba.rollforwardEligible(a,b,withinTbaGrace),true,`${parameter}: time-TBA event must stay current through 35h`);
    assert.equal(apiC.rollforwardEligible(a,b,afterBExpiry),false,`${parameter}: time-TBA event must expire after 36h`);
  }

  const duplicate={...b,startAt:'2026-10-09T10:00:00+09:00'};
  assert.equal(apiB.sameEventIdentity(b,duplicate),true,`${parameter}: same source must remain the same event`);
}

// Adversarial UFC fallback: listing parser can emit the generic name "UFC Fight Night"
// for multiple distinct future cards. Distinct official event URLs must not collapse into one identity.
{
  const now=Date.parse('2026-10-01T23:00:00+09:00');
  const api=await boot('UFC',now);
  const a={name:'UFC Fight Night',startAt:'2026-10-01T10:00:00+09:00',source:'https://www.ufc.com/event/qa-alpha'};
  const b={name:'UFC Fight Night',startAt:'2026-10-08T10:00:00+09:00',source:'https://www.ufc.com/event/qa-beta'};
  assert.equal(api.sameEventIdentity(a,b),false,'UFC: distinct generic Fight Night URLs must not collapse into one event');
  assert.equal(api.nextEligible(a,b,now),true,'UFC: second generic Fight Night must remain next-eligible');
}

console.log('five-series transition timeline QA: PASS');
