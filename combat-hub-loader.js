// COMBAT HUB Loader v4 — standalone repository channel
// ScriptableにはこのLoaderだけを保存する。

(async()=>{
const LOADER_VERSION='4.1.0';
const MIN_RUNTIME=[7,6,0];
const WIDGET_CACHE_TTL=30*60*1000;
const REMOTES=[
  'https://raw.githubusercontent.com/48wr9f4wgp-lab/combat-hub/main/combat-hub.js',
  'https://github.com/48wr9f4wgp-lab/combat-hub/raw/refs/heads/main/combat-hub.js'
];

// Diagnostic guard: if this screen appears, the home-screen widget is definitely
// executing the current Loader and the remaining fault is downstream of Loader routing.
const rawParam=(typeof args!=='undefined'&&args)?args.widgetParameter:'';
const param=String(rawParam||'').trim().toUpperCase().replace(/[\s_-]+/g,'');
const widgetFamily=(typeof config!=='undefined'&&config)?config.widgetFamily:'';
if(typeof config!=='undefined'&&config.runsInWidget&&widgetFamily==='large'&&param==='BOXING'){
  const diag=new ListWidget();
  diag.setPadding(20,20,18,20);
  diag.backgroundColor=new Color('#08162A');
  const title=diag.addText('COMBAT HUB');title.font=Font.blackSystemFont(24);title.textColor=new Color('#FFFFFF');
  diag.addSpacer(8);
  const ok=diag.addText('LOADER OK');ok.font=Font.blackSystemFont(30);ok.textColor=new Color('#4BA3FF');
  diag.addSpacer(6);
  const ver=diag.addText('Loader v4.1.0');ver.font=Font.boldSystemFont(13);ver.textColor=new Color('#D7DCE3');
  diag.addSpacer(14);
  const note=diag.addText('BOXING Large 直描画テスト');note.font=Font.semiboldSystemFont(12);note.textColor=new Color('#9AA2AD');
  diag.addSpacer();
  const foot=diag.addText('通信・キャッシュ・本体コード未使用');foot.font=Font.semiboldSystemFont(11);foot.textColor=new Color('#9AA2AD');
  diag.refreshAfterDate=new Date(Date.now()+30*60*1000);
  Script.setWidget(diag);Script.complete();return;
}

const fm=FileManager.local();
const doc=fm.documentsDirectory();
const cachePath=fm.joinPath(doc,'combat-hub-runtime-v4.js');
const metaPath=fm.joinPath(doc,'combat-hub-runtime-v4-meta.json');

function parseVersion(source){
  const m=String(source||'').match(/const\s+VERSION\s*=\s*['\"](\d+)\.(\d+)\.(\d+)(?:-[^'\"]*)?['\"]/);
  return m?[Number(m[1]),Number(m[2]),Number(m[3])]:null;
}

function versionAtLeast(v,min){
  if(!v)return false;
  for(let i=0;i<3;i++){
    if(v[i]>min[i])return true;
    if(v[i]<min[i])return false;
  }
  return true;
}

function validRuntime(source){
  const s=String(source||'');
  return s.includes('COMBAT HUB')&&
    s.includes('const VERSION=')&&
    s.includes('Script.complete()')&&
    versionAtLeast(parseVersion(s),MIN_RUNTIME);
}

function readMeta(){
  try{
    if(!fm.fileExists(metaPath))return null;
    const v=JSON.parse(fm.readString(metaPath));
    return v&&Number.isFinite(Number(v.savedAt))?v:null;
  }catch(_){return null;}
}

function readCache(){
  try{
    if(!fm.fileExists(cachePath))return null;
    const source=fm.readString(cachePath);
    if(!validRuntime(source))return null;
    return {source,meta:readMeta()};
  }catch(_){return null;}
}

function writeCache(source,url){
  try{
    const version=parseVersion(source);
    fm.writeString(cachePath,source);
    fm.writeString(metaPath,JSON.stringify({
      loaderVersion:LOADER_VERSION,
      savedAt:Date.now(),
      source:url,
      runtimeVersion:version?version.join('.'):null
    }));
  }catch(_){ }
}

async function fetchRemote(){
  let lastError=null;
  for(const base of REMOTES){
    try{
      const sep=base.includes('?')?'&':'?';
      const r=new Request(base+sep+'cb='+Date.now());
      r.timeoutInterval=12;
      r.headers={
        'User-Agent':'Scriptable COMBAT HUB Loader/'+LOADER_VERSION,
        'Cache-Control':'no-cache, no-store',
        'Pragma':'no-cache'
      };
      const source=await r.loadString();
      if(!validRuntime(source))throw new Error('runtime validation failed');
      return {source,url:base};
    }catch(e){lastError=e;}
  }
  throw lastError||new Error('remote runtime unavailable');
}

const cached=readCache();
const cacheAge=cached?.meta?.savedAt?Date.now()-Number(cached.meta.savedAt):Infinity;
let selected=null;

// Home-screen widgets prioritize a recently verified local copy to avoid unnecessary
// network work. Manual Scriptable runs always check the independent GitHub channel.
if(config.runsInWidget&&cached&&cacheAge<WIDGET_CACHE_TTL){
  selected=cached.source;
}else{
  try{
    const remote=await fetchRemote();
    // Remote-first by design: a verified lower patch version may intentionally be
    // published as an emergency rollback, so do not prefer a numerically newer cache.
    selected=remote.source;
    writeCache(remote.source,remote.url);
  }catch(_){
    if(cached)selected=cached.source;
  }
}

if(!selected||!validRuntime(selected)){
  throw new Error('COMBAT HUB Loader: 有効な本体を取得できませんでした');
}

await eval(selected);
})();
