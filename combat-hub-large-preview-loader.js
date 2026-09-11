// COMBAT HUB Large Preview Loader — deterministic device QA
(async()=>{
const BUILD='bab13c0825c7ba2bcaeb1e658536b4e1cc06fa2b';
const URL=`https://raw.githubusercontent.com/48wr9f4wgp-lab/combat-hub/${BUILD}/combat-hub.js`;
const r=new Request(URL+'?cb='+Date.now());
r.timeoutInterval=12;
r.headers={'User-Agent':'Scriptable COMBAT HUB Large Preview','Cache-Control':'no-cache, no-store','Pragma':'no-cache'};
let source=await r.loadString();
if(!source.includes("const VERSION='7.9.0-github'"))throw new Error('Large preview runtime validation failed');
const needle="const D=await loadData(),ctx=await heroContext(D),w=new ListWidget();const IS_LARGE=config.widgetFamily==='large';const NEXT=IS_LARGE?await loadLargeNext(D):null;";
const replacement="const D=await loadData(),ctx=await heroContext(D),w=new ListWidget();const IS_LARGE=config.widgetFamily==='large';let NEXT=IS_LARGE?await loadLargeNext(D):null;if(IS_LARGE&&KEY==='ufc'&&!NEXT)NEXT={name:'Crypto.com UFC 331: Van vs Pantoja 2',startAt:'2026-09-20T10:00:00+09:00',location:'ロサンゼルス',source:'https://www.ufc.com/event/cryptocom-ufc-331',timeTba:false};";
if(!source.includes(needle))throw new Error('Large preview build shape mismatch');
source=source.replace(needle,replacement);
await eval(source);
})();
