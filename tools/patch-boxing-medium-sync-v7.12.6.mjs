import fs from 'node:fs';
import assert from 'node:assert/strict';

const runtimePath='combat-hub.js';
const testPath='tests/combat-hub-large-regression.mjs';
let src=fs.readFileSync(runtimePath,'utf8');
let test=fs.readFileSync(testPath,'utf8');

function replaceOnce(text,from,to,label){
  const count=text.split(from).length-1;
  assert.equal(count,1,`${label}: expected exactly one match, got ${count}`);
  return text.replace(from,to);
}

src=replaceOnce(src,
  '// v7.12.5-github — suppress stale BOXING poster during pending state',
  '// v7.12.6-github — BOXING widget sync audit + Medium memory guard',
  'version comment');
src=replaceOnce(src,
  "const VERSION='7.12.5-github';",
  "const VERSION='7.12.6-github';",
  'runtime version');

src=replaceOnce(src,
  "if(KEY==='boxing'&&config.widgetFamily==='large'){if(cachedData&&rollforwardEligible(snap,cachedData,now))return cachedData;return{...snap,startAt:new Date(now+24*3600000).toISOString(),location:'会場未定',name:'次大会',main:{a:'次大会',b:'確認中',context:S.label},support:[],cardTba:true,posterURL:null,timeTba:true,displayDate:'日程未定',nextPending:true,lightweightPending:true};}",
  "if(KEY==='boxing'&&config.runsInWidget){if(cachedData&&rollforwardEligible(snap,cachedData,now))return cachedData;return{...snap,startAt:new Date(now+24*3600000).toISOString(),location:'会場未定',name:'次大会',main:{a:'次大会',b:'確認中',context:S.label},support:[],cardTba:true,posterURL:null,source:S.listing,timeTba:true,displayDate:'日程未定',nextPending:true,lightweightPending:true};}",
  'BOXING widget lightweight data gate');

src=replaceOnce(src,
  "if(KEY==='boxing'&&config.widgetFamily==='large'){const safePoster=!D.nextPending&&!D.lightweightPending&&(!!D.lockedCurrent||sameEventIdentity(D,SNAPSHOT.boxing));return{a:{name:D.main.a,image:null},b:{name:D.main.b,image:null},poster:safePoster?await eventPoster(D):null,lightweight:true};}",
  "if(KEY==='boxing'&&config.runsInWidget){const safePoster=!D.nextPending&&!D.lightweightPending&&(!!D.lockedCurrent||sameEventIdentity(D,SNAPSHOT.boxing));return{a:{name:D.main.a,image:null},b:{name:D.main.b,image:null},poster:safePoster?await eventPoster(D):null,lightweight:true};}",
  'BOXING widget poster guard');

const heroNeedle="async function heroContext(D){";
assert.ok(src.includes(heroNeedle),'heroContext missing');
const auditFn="function writeRuntimeAudit(D,ctx){try{writeJSON(cacheFile('combat-hub-runtime-audit.json'),{savedAt:Date.now(),version:VERSION,loaderVersion:typeof LOADER_VERSION!=='undefined'?LOADER_VERSION:null,key:KEY,widgetFamily:config.widgetFamily||null,nextPending:!!D.nextPending,lightweightPending:!!D.lightweightPending,cardTba:!!D.cardTba,lockedCurrent:!!D.lockedCurrent,name:D.name||null,source:D.source||null,posterLoaded:!!ctx?.poster});}catch(_){}}\n";
assert.ok(!src.includes("combat-hub-runtime-audit.json"),'runtime audit already present');
const heroEnd="return{a:{name:D.main.a,image:null},b:{name:D.main.b,image:null},poster:await eventPoster(D)};}\n\nfunction imageRect";
assert.ok(src.includes(heroEnd),'heroContext end marker missing');
src=src.replace(heroEnd,"return{a:{name:D.main.a,image:null},b:{name:D.main.b,image:null},poster:await eventPoster(D)};}\n"+auditFn+"\nfunction imageRect");

src=replaceOnce(src,
  "const D=await loadData(),ctx=await heroContext(D),w=new ListWidget();",
  "const D=await loadData(),ctx=await heroContext(D);writeRuntimeAudit(D,ctx);const w=new ListWidget();",
  'runtime audit call');

src=replaceOnce(src,
  "tx(nline,'公式情報を確認中',7.8,new Color(C.muted),'semibold');",
  "tx(nline,'公式情報を確認中',7.8,new Color(C.muted),'semibold');nline.addSpacer();tx(nline,VERSION.replace('-github',''),5.8,new Color('#6F7782'),'semibold');",
  'Large sync marker');

src=replaceOnce(src,
  "tx(foot,'公式更新を自動反映',6.8,footColor,'semibold');",
  "tx(foot,KEY==='boxing'&&D.nextPending?`同期 ${VERSION.replace('-github','')}`:'公式更新を自動反映',6.8,footColor,'semibold');",
  'Medium sync marker');

// Update existing regression assertions so the safety gate covers Medium + Large widgets.
test=replaceOnce(test,
  "/if\\(KEY==='boxing'&&config\\.widgetFamily==='large'\\)\\{if\\(cachedData&&rollforwardEligible\\(snap,cachedData,now\\)\\)return cachedData;return\\{/",
  "/if\\(KEY==='boxing'&&config\\.runsInWidget\\)\\{if\\(cachedData&&rollforwardEligible\\(snap,cachedData,now\\)\\)return cachedData;return\\{/",
  'loadData regression regex');
test=replaceOnce(test,
  "'BOXING Large must short-circuit before live deep discovery'",
  "'BOXING Medium/Large must short-circuit before live deep discovery'",
  'loadData regression message');
test=replaceOnce(test,
  "/if\\(KEY==='boxing'&&config\\.widgetFamily==='large'\\)\\{const safePoster=!D\\.nextPending&&!D\\.lightweightPending&&\\(!!D\\.lockedCurrent\\|\\|sameEventIdentity\\(D,SNAPSHOT\\.boxing\\)\\);return\\{a:\\{name:D\\.main\\.a,image:null\\},b:\\{name:D\\.main\\.b,image:null\\},poster:safePoster\\?await eventPoster\\(D\\):null,lightweight:true\\};\\}/",
  "/if\\(KEY==='boxing'&&config\\.runsInWidget\\)\\{const safePoster=!D\\.nextPending&&!D\\.lightweightPending&&\\(!!D\\.lockedCurrent\\|\\|sameEventIdentity\\(D,SNAPSHOT\\.boxing\\)\\);return\\{a:\\{name:D\\.main\\.a,image:null\\},b:\\{name:D\\.main\\.b,image:null\\},poster:safePoster\\?await eventPoster\\(D\\):null,lightweight:true\\};\\}/",
  'hero guard regression regex');
test=replaceOnce(test,
  "'BOXING Large pending state must suppress stale rollover posters'",
  "'BOXING Medium/Large pending state must suppress poster loading'",
  'hero guard regression message');

const insert="assert.match(src, /function writeRuntimeAudit\\(D,ctx\\)/, 'Runtime sync audit writer missing');\nassert.match(src, /combat-hub-runtime-audit\\.json/, 'Runtime sync audit cache missing');\nassert.match(src, /KEY==='boxing'&&D\\.nextPending\\?`同期 \\${VERSION\\.replace\\('-github',''\\)}`/, 'BOXING Medium temporary sync marker missing');\n";
const before="assert.match(src, /if\\(BOXING_LARGE\\)\\{if\\(ctx\\.poster\\)w\\.backgroundImage=ctx\\.poster;else w\\.backgroundGradient=gradient\\(\\);renderLarge\\(w,D,ctx,NEXT,null\\);\\}/, 'BOXING Large must use lightweight gradient fallback without DrawContext composition');";
assert.ok(test.includes(before),'test insertion anchor missing');
test=test.replace(before,insert+before);

test=test.replace("COMBAT HUB Large V5.2 + BOXING rollover-memory regression: OK","COMBAT HUB Large V5.2 + BOXING Medium/Large memory+sync regression: OK");

fs.writeFileSync(runtimePath,src);
fs.writeFileSync(testPath,test);
console.log('BOXING Medium/Large sync + memory patch applied');
