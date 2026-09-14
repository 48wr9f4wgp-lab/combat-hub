// COMBAT HUB Loader v4 — standalone repository channel
// ScriptableにはこのLoaderだけを保存する。

(async()=>{
const LOADER_VERSION='4.2.0';
const MIN_RUNTIME=[7,6,0];
const WIDGET_CACHE_TTL=30*60*1000;
const REMOTES=[
  'https://raw.githubusercontent.com/48wr9f4wgp-lab/combat-hub/main/combat-hub.js',
  'https://github.com/48wr9f4wgp-lab/combat-hub/raw/refs/heads/main/combat-hub.js'
];

const rawParam=(typeof args!=='undefined'&&args)?args.widgetParameter:'';
const param=String(rawParam||'').trim().toUpperCase().replace(/[\s_-]+/g,'');
const widgetFamily=(typeof config!=='undefined'&&config)?config.widgetFamily:'';
const isBoxingLarge=!!(typeof config!=='undefined'&&config.runsInWidget&&widgetFamily==='large'&&param==='BOXING');

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

function runtimeErrorText(err){
  const raw=String(err&&err.message?err.message:err||'unknown runtime error');
  return raw.length>180?raw.slice(0,177)+'...':raw;
}

function canRenderErrorWidget(){
  return typeof config!=='undefined'&&config.runsInWidget&&typeof ListWidget!=='undefined'&&typeof Color!=='undefined'&&typeof Font!=='undefined'&&typeof Script!=='undefined';
}

function renderRuntimeError(err){
  if(!canRenderErrorWidget())throw err;
  const w=new ListWidget();
  w.setPadding(18,18,16,18);
  w.backgroundColor=new Color('#18090B');
  const title=w.addText('COMBAT HUB');title.font=Font.blackSystemFont(22);title.textColor=new Color('#FFFFFF');
  w.addSpacer(6);
  const state=w.addText('RUNTIME ERROR');state.font=Font.blackSystemFont(22);state.textColor=new Color('#FF5A63');
  w.addSpacer(10);
  const meta=w.addText('Loader v'+LOADER_VERSION+(isBoxingLarge?' ・ BOXING Large':''));meta.font=Font.boldSystemFont(11);meta.textColor=new Color('#D7DCE3');
  w.addSpacer(12);
  const msg=w.addText(runtimeErrorText(err));msg.font=Font.semiboldSystemFont(11);msg.textColor=new Color('#F3C7CA');msg.lineLimit=6;msg.minimumScaleFactor=.65;
  w.addSpacer();
  const foot=w.addText('白画面防止フォールバック');foot.font=Font.semiboldSystemFont(10);foot.textColor=new Color('#9AA2AD');
  w.refreshAfterDate=new Date(Date.now()+15*60*1000);
  Script.setWidget(w);Script.complete();
}

const cached=readCache();
const cacheAge=cached?.meta?.savedAt?Date.now()-Number(cached.meta.savedAt):Infinity;
let selected=null;

// Large BOXING bypasses the 30-minute runtime cache so device fixes reach the widget
// immediately. Other widgets keep the verified local-cache fast path.
if(typeof config!=='undefined'&&config.runsInWidget&&cached&&cacheAge<WIDGET_CACHE_TTL&&!isBoxingLarge){
  selected=cached.source;
}else{
  try{
    const remote=await fetchRemote();
    selected=remote.source;
    writeCache(remote.source,remote.url);
  }catch(fetchError){
    if(cached)selected=cached.source;
    else{
      renderRuntimeError(fetchError);
      return;
    }
  }
}

if(!selected||!validRuntime(selected)){
  const e=new Error('COMBAT HUB Loader: 有効な本体を取得できませんでした');
  renderRuntimeError(e);
  return;
}

try{
  await eval(selected);
}catch(runtimeError){
  renderRuntimeError(runtimeError);
}
})();
