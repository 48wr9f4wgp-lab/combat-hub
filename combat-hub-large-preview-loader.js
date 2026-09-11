// COMBAT HUB Large Preview Loader — temporary feature-branch tester
(async()=>{
const URL='https://raw.githubusercontent.com/48wr9f4wgp-lab/combat-hub/feature/large-widget-v7.9.0/combat-hub.js';
const r=new Request(URL+'?cb='+Date.now());
r.timeoutInterval=12;
r.headers={'User-Agent':'Scriptable COMBAT HUB Large Preview','Cache-Control':'no-cache, no-store','Pragma':'no-cache'};
const source=await r.loadString();
if(!source.includes("const VERSION='7.9.0-github'"))throw new Error('Large preview runtime validation failed');
await eval(source);
})();
