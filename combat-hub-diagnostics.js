// COMBAT HUB Diagnostics — local-only / no telemetry
// Manual Scriptable utility for release and real-event roll-forward checks.

(async()=>{
const VERSION='1.0.0';
const ORGS={
  ufc:{label:'UFC',listing:'https://www.ufc.com/events'},
  rizin:{label:'RIZIN',listing:'https://jp.rizinff.com/'},
  one:{label:'ONE',listing:'https://www.onefc.com/events/'},
  boxing:{label:'BOXING',listing:'https://www.ringmagazine.com/events'},
  k1:{label:'K-1',listing:'https://www.k-1.co.jp/k-1wgp/schedule'}
};
const fm=FileManager.local(),DOC=fm.documentsDirectory();
const join=(name)=>fm.joinPath(DOC,name);
const iso=(v)=>{try{return new Date(Number(v)).toISOString();}catch(_){return null;}};
const age=(v)=>{const ms=Date.now()-Number(v);if(!Number.isFinite(ms)||ms<0)return'unknown';const m=Math.floor(ms/60000);if(m<60)return`${m}m`;const h=Math.floor(m/60);if(h<48)return`${h}h ${m%60}m`;return`${Math.floor(h/24)}d ${h%24}h`;};
function readJSON(name){try{return fm.fileExists(join(name))?JSON.parse(fm.readString(join(name))):null;}catch(_){return null;}}
function readText(name){try{return fm.fileExists(join(name))?fm.readString(join(name)):null;}catch(_){return null;}}
function runtimeVersion(){const s=readText('combat-hub-runtime-v4.js')||'';return (s.match(/const\s+VERSION\s*=\s*['\"]([^'\"]+)/)||[])[1]||null;}
function matchingFiles(prefix){try{return fm.listContents(DOC).filter(x=>x.startsWith(prefix));}catch(_){return[];}}
function localSnapshot(){
  const loader=readJSON('combat-hub-runtime-v4-meta.json');
  const orgs={};
  for(const [key,o] of Object.entries(ORGS)){
    const next=readJSON(`combat-hub-next-${key}.json`);
    const data=next?.data||null;
    orgs[key]={
      label:o.label,
      nextCache:next?{
        savedAt:next.savedAt||null,
        age:age(next.savedAt),
        fresh4h:Date.now()-Number(next.savedAt)<4*3600000,
        eventName:data?.name||null,
        startAt:data?.startAt||null,
        source:data?.source||null,
        stale:Boolean(data?.stale)
      }:null,
      eventMetaCacheFiles:matchingFiles(`combat-meta-${key}-event-`).length,
      profileCacheFiles:matchingFiles(`combat-profile-${key}-`).length
    };
  }
  return{
    diagnosticsVersion:VERSION,
    generatedAt:new Date().toISOString(),
    runtime:{
      version:runtimeVersion(),
      loaderVersion:loader?.loaderVersion||null,
      cachedAt:loader?.savedAt?iso(loader.savedAt):null,
      cacheAge:loader?.savedAt?age(loader.savedAt):null,
      source:loader?.source||null
    },
    orgs
  };
}
async function probeOne(key,o){const t=Date.now();try{const r=new Request(o.listing);r.timeoutInterval=10;r.headers={'User-Agent':'Scriptable COMBAT HUB Diagnostics/'+VERSION,'Cache-Control':'no-cache'};const body=await r.loadString();return{key,label:o.label,url:o.listing,ok:true,elapsedMs:Date.now()-t,statusCode:r.response?.statusCode||null,bytes:String(body||'').length};}catch(e){return{key,label:o.label,url:o.listing,ok:false,elapsedMs:Date.now()-t,error:String(e?.message||e||'unknown').slice(0,180)};}}
async function networkProbe(){const rows=[];for(const [key,o] of Object.entries(ORGS))rows.push(await probeOne(key,o));return rows;}
function textReport(result){
  const a=[];
  a.push(`COMBAT HUB DIAGNOSTICS v${VERSION}`);
  a.push(`generated: ${result.generatedAt}`);
  a.push('');
  a.push(`runtime: ${result.runtime.version||'unknown'}`);
  a.push(`loader: ${result.runtime.loaderVersion||'unknown'} / cache ${result.runtime.cacheAge||'unknown'}`);
  a.push(`runtime source: ${result.runtime.source||'unknown'}`);
  a.push('');
  a.push('NEXT EVENT CACHE');
  for(const x of Object.values(result.orgs)){
    const c=x.nextCache;
    a.push(`${x.label}: ${c?`${c.fresh4h?'FRESH':'STALE'} ${c.age} | ${c.eventName||'unnamed'} | ${c.startAt||'time?'} | ${c.source||'source?'}`:'none'}`);
  }
  if(result.network){
    a.push('');a.push('LIVE NETWORK PROBE');
    for(const r of result.network)a.push(`${r.label}: ${r.ok?'OK':'FAIL'} ${r.elapsedMs}ms${r.statusCode?` HTTP ${r.statusCode}`:''}${r.ok?` ${r.bytes} chars`:` | ${r.error}`}`);
  }
  return a.join('\n');
}

const menu=new Alert();menu.title='COMBAT HUB Diagnostics';menu.message='端末内だけで診断します。外部テレメトリ送信はありません。';menu.addAction('ローカル状態');menu.addAction('ローカル + 5団体通信テスト');menu.addCancelAction('キャンセル');const choice=await menu.presentSheet();if(choice<0){Script.complete();return;}
const result=localSnapshot();if(choice===1)result.network=await networkProbe();
try{fm.writeString(join('combat-hub-diagnostics-last.json'),JSON.stringify(result,null,2));}catch(_){}
await QuickLook.present(textReport(result));
Script.complete();
})();
