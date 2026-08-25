// COMBAT HUB v7.7 Preview Loader
// Branch-only physical-device verification channel.
// Do not use this as the production home-screen Loader.

(async()=>{
const LOADER_VERSION='7.7-preview-1';
const MIN_RUNTIME=[7,7,0];
const WIDGET_CACHE_TTL=10*60*1000;
const REMOTES=[
  'https://raw.githubusercontent.com/48wr9f4wgp-lab/combat-hub/chatgpt/reliability-v7.7/combat-hub.js',
  'https://github.com/48wr9f4wgp-lab/combat-hub/raw/refs/heads/chatgpt/reliability-v7.7/combat-hub.js'
];

const fm=FileManager.local();
const doc=fm.documentsDirectory();
const cachePath=fm.joinPath(doc,'combat-hub-runtime-v7.7-preview.js');
const metaPath=fm.joinPath(doc,'combat-hub-runtime-v7.7-preview-meta.json');

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
    fm.writeString(cachePath,source);
    fm.writeString(metaPath,JSON.stringify({
      loaderVersion:LOADER_VERSION,
      savedAt:Date.now(),
      source:url,
      runtimeVersion:parseVersion(source)?.join('.')||null
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
        'User-Agent':'Scriptable COMBAT HUB Preview/'+LOADER_VERSION,
        'Cache-Control':'no-cache, no-store',
        'Pragma':'no-cache'
      };
      const source=await r.loadString();
      if(!validRuntime(source))throw new Error('preview runtime validation failed');
      return {source,url:base};
    }catch(e){lastError=e;}
  }
  throw lastError||new Error('preview runtime unavailable');
}

const cached=readCache();
const cacheAge=cached?.meta?.savedAt?Date.now()-Number(cached.meta.savedAt):Infinity;
let selected=null;

if(config.runsInWidget&&cached&&cacheAge<WIDGET_CACHE_TTL){
  selected=cached.source;
}else{
  try{
    const remote=await fetchRemote();
    selected=remote.source;
    writeCache(remote.source,remote.url);
  }catch(_){
    if(cached)selected=cached.source;
  }
}

if(!selected||!validRuntime(selected)){
  throw new Error('COMBAT HUB Preview: v7.7本体を取得できませんでした');
}

await eval(selected);
})();
