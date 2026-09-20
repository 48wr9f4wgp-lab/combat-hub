// COMBAT HUB — GitHub Standalone / Personal
// Scriptable 1本で UFC / RIZIN / ONE / BOXING / K-1 を表示
// Home Screen Widget Parameter: UFC / RIZIN / ONE / BOXING / K1
// v7.22.7-github — harden live-source transition discovery and event-data isolation; visuals frozen

(async()=>{
const VERSION='7.22.7-github';
const MODE_MAP={UFC:'ufc',RIZIN:'rizin',ONE:'one',BOXING:'boxing',K1:'k1'};
const LABELS=['UFC','RIZIN','ONE','BOXING','K-1'];
const PARAMS=['UFC','RIZIN','ONE','BOXING','K1'];
const norm=v=>String(v||'').trim().toUpperCase().replace(/[\s_-]+/g,'');
let MODE=norm(args.widgetParameter);
if(!MODE_MAP[MODE]&&!config.runsInWidget){const a=new Alert();a.title='COMBAT HUB';a.message='プレビューする団体';LABELS.forEach(x=>a.addAction(x));a.addCancelAction('キャンセル');const i=await a.presentSheet();if(i<0){Script.complete();return;}MODE=PARAMS[i];}
if(!MODE_MAP[MODE])MODE='UFC';
const KEY=MODE_MAP[MODE];

const SERIES={
  ufc:{label:'UFC',accent:'#F23B35',listing:'https://www.ufc.com/events',detail:/\/event\//i},
  rizin:{label:'RIZIN',accent:'#5CE68A',listing:'https://jp.rizinff.com/',detail:/\/_ct\//i},
  one:{label:'ONE',accent:'#F4D54A',listing:'https://www.onefc.com/events/',detail:/\/events\//i},
  boxing:{label:'ボクシング',accent:'#4BA3FF',listing:'https://www.ringmagazine.com/events',detail:/(?:\/events\/|\/news\/)/i},
  k1:{label:'K-1',accent:'#FF8C3A',listing:'https://www.k-1.co.jp/k-1wgp/schedule',detail:/\/schedule\/\d+/i}
};
const S=SERIES[KEY], C={text:'#F7F8FA',sub:'#D7DCE3',muted:'#9AA2AD'};

const VISUAL={
  ufc:{heroShade:.68,posterShade:.58,headerShade:.13,mainShade:.12,footShade:.17,veil:.018,gap:17,mainSize:13.4,division:7.3},
  rizin:{heroShade:.70,posterShade:.60,headerShade:.14,mainShade:.13,footShade:.19,veil:.018,gap:17,mainSize:13.1,division:7.2},
  one:{heroShade:.68,posterShade:.44,headerShade:.16,mainShade:.15,footShade:.19,veil:.028,gap:19,mainSize:13.4,division:7.3},
  boxing:{heroShade:.68,posterShade:.52,headerShade:.18,mainShade:.18,footShade:.23,veil:.020,gap:18,mainSize:13.6,division:7.2},
  k1:{heroShade:.66,posterShade:.52,headerShade:.10,mainShade:.11,footShade:.17,veil:.055,gap:15,mainSize:13.6,division:7.3}
};
const V=VISUAL[KEY];
const LARGE_UI={org:24,event:10.0,meta:9.2,status:6.8,countdown:12.4,statusDate:8.2,statusLoc:8.2,heroLabel:7.4,pending:17.2,pendingSub:10.0,main:16.0,vs:17.0,division:9.0,section:8.8,fightLabel:8.4,fightName:10.2,nextLabel:8.4,nextTitle:11.0,nextMeta:8.8,nextCountdown:9.2,dashH:150,leftW:192,rightW:103,headerW:198,statusW:122,heroGap:24,pendingOffset:32};
const MEDIUM_UI={org:20.5,event:8.8,status:6.7,countdown:13.1,statusDate:7.5,statusLoc:7.5,heroGap:12,pending:14.4,pendingSub:7.5,main:14.3,mainLabel:7.5,vs:15.2,division:8.0,supportLabel:7.5,supportName:8.8,headerW:205,statusW:105};
const SMALL_UI={org:17.8,event:8.0,status:6.2,countdown:10.8,pending:12.6,pendingSub:7.1,mainLabel:6.7,main:11.8,vs:7.2,division:7.0,meta:7.2,pad:11};

const SNAPSHOT={
  ufc:{startAt:'2026-09-13T06:00:00+09:00',location:'グレンデール',name:'Noche UFC',main:{a:'Jean Silva',b:'Jose Miguel Delgado',context:'FEATHERWEIGHT'},support:[{label:'CO-MAIN',a:'Brandon Moreno',b:'Joseph Morales'},{label:'MAIN CARD',a:'Tommy McMillen',b:'Marwan Rahiki'},{label:'MAIN CARD',a:'Manon Fiorot',b:'Alexa Grasso'},{label:'MAIN CARD',a:'Waldo Cortes Acosta',b:'Curtis Blaydes'},{label:'MAIN CARD',a:'David Martinez',b:'Dan Ige'}],source:'https://www.ufc.com/event/ufc-fight-night-september-12-2026'},
  rizin:{startAt:'2026-10-03T14:00:00+09:00',location:'長崎',name:'RIZIN LANDMARK 16 in NAGASAKI',main:{a:'堀江圭功',b:'宇佐美正パトリック',context:'RIZIN MMA 71kg'},support:[{label:'CO-MAIN',a:'ビクター・コレスニック',b:'松嶋こよみ'},{label:'MAIN CARD',a:'芦澤竜誠',b:'井上聖矢'}],source:'https://jp.rizinff.com/_ct/17857720'},
  one:{startAt:'2026-09-11T22:30:00+09:00',location:'バンコク',name:'ONE Friday Fights 170',main:{a:'Yodlekpet Or Atchariya',b:'Pompet Pongsuphan PK',context:'フライ級ムエタイ'},support:[{label:'CO-MAIN',a:'Ayad Albadr',b:'Kongchai Chanaidonmueang'},{label:'MAIN CARD',a:'Yodthewin Mor Rajabhatmubanchombueng',b:'Otis Waghorn'}],source:'https://www.onefc.com/events/one-friday-fights-170/'},
  boxing:{startAt:'2026-09-20T00:00:00+09:00',displayDate:'9/20 (日)',timeTba:true,location:'Pechanga Arena, San Diego',name:'Cruz vs Bravo',main:{a:'Isaac Cruz',b:'Nestor Bravo',context:''},support:[{label:'CO-MAIN',a:'Jesus Ramos',b:'Meiirim Nursultanov',context:'WBC interim middleweight world title'}],source:'https://www.ringmagazine.com/events/pitbull-vs-bravo-4KcUnNvGRpDnb0ONBP3SkH',ringOfficial:true},
  k1:{startAt:'2026-09-12T12:00:00+09:00',location:'東京・代々木第二',name:'K-1 WORLD MAX 2026',main:{a:'ジョナス・サルシチャ',b:'ゾーラ・アカピャン',context:'-70kg世界最強決定トーナメント開幕戦'},support:[{label:'TITLE FIGHT',a:'朝久泰央',b:'アラッサン・カマラ'},{label:'TITLE FIGHT',a:'里見柚己',b:'永澤サムエル聖光'}],source:'https://www.k-1.co.jp/k-1wgp/schedule/16669'}
};

const NEXT_SNAPSHOT={
  ufc:{startAt:'2026-09-20T10:00:00+09:00',location:'ロサンゼルス',name:'Crypto.com UFC 331: Van vs Pantoja 2',source:'https://jp.ufc.com/event/cryptocom-ufc-331',timeTba:false,main:{a:'Joshua Van',b:'Alexandre Pantoja',context:'UFCフライ級タイトル戦'},support:[{label:'CO-MAIN',a:'Arman Tsarukyan',b:'Mauricio Ruffy'},{label:'MAIN CARD',a:'Patricio Pitbull',b:'Dooho Choi'}],cardTba:false},
  rizin:{startAt:'2026-11-08T14:00:00+09:00',location:'LaLa arena TOKYO-BAY',name:'RIZIN.55',source:'https://jp.rizinff.com/_ct/17852466',timeTba:false},
  one:{startAt:'2026-09-18T00:00:00+09:00',location:'バンコク',name:'ONE Friday Fights 171 & The Inner Circle 31',source:'https://www.onefc.com/events/one-friday-fights-171/',timeTba:true},
  k1:{startAt:'2026-09-19T00:00:00+09:00',location:'韓国・尚州',name:'K-1 FIGHTING NETWORK in Sangju Korea 2026',source:'https://www.k-1.co.jp/k-1wgp/schedule/16687',timeTba:true,main:{a:'キム・ヒョンジュン',b:'小田 尋久',context:'-70kg級'},support:[{label:'CO-MAIN',a:'ヤン・ホンチョル',b:'大石 昌輝'},{label:'MAIN CARD',a:'イ・ヒョンソク',b:'原田 闘鬼'}],cardTba:false}
};

// First-party verified fallbacks used only after live official discovery fails.
// Keep this short and chronological; live parsing remains authoritative.
const TRUSTED_FUTURE={
  ufc:[{startAt:'2026-09-27T09:00:00+09:00',location:'ラスベガス',name:'UFC Fight Night: Rosas Jr. vs Barcelos',source:'https://jp.ufc.com/event/ufc-fight-night-september-26-2026',timeTba:false,main:{a:'Raul Rosas Jr.',b:'Raoni Barcelos',context:'バンタム級'},support:[],cardTba:false}],
  k1:[
    {startAt:'2026-11-23T00:00:00+09:00',displayDate:'11/23 (月・祝)',location:'後楽園ホール',name:'K-1 2026.11.23',source:'https://www.k-1.co.jp/k-1wgp/schedule/16670',timeTba:true},
    {startAt:'2026-12-29T00:00:00+09:00',displayDate:'12/29 (火)',location:'横浜BUNTAI',name:'K-1 2026.12.29',source:'https://www.k-1.co.jp/k-1wgp/schedule/16678',timeTba:true}
  ]
};
function trustedFutureEvents(){return [NEXT_SNAPSHOT[KEY],...(TRUSTED_FUTURE[KEY]||[])].filter(Boolean).map(x=>normalizeOneCompositeEvent({...x})).sort((a,b)=>new Date(a.startAt)-new Date(b.startAt));}

const fm=FileManager.local(),DOC=fm.documentsDirectory();
function fnt(z,w='regular'){if(w==='black'&&Font.blackSystemFont)return Font.blackSystemFont(z);if(w==='bold')return Font.boldSystemFont(z);if(w==='semibold')return Font.semiboldSystemFont(z);return Font.systemFont(z);}
function typeSize(z){if(z===20)return 20.5;if(z===8.1)return 9.0;if(z===7)return 7.5;if(z===6.2)return 6.7;if(z===12.8)return 13.1;if(z===13.7)return 14.4;if(z===8.0)return 8.8;if(z===6.8)return 7.5;if(z===6.1)return 6.8;if(z===7.1)return 7.8;if(z===13.1)return 13.8;if(z===13.4)return 14.1;if(z===13.6)return 14.3;if(z===7.2)return 7.9;if(z===7.3)return 8.0;return z;}
function tx(st,s,z,c,w='regular',n=1){const t=st.addText(String(s??''));t.font=fnt(typeSize(z),w);t.textColor=c;t.lineLimit=n;t.minimumScaleFactor=.42;return t;}
function divider(st){const d=st.addStack();d.size=new Size(0,1);d.backgroundColor=new Color('#FFFFFF',.05);}
function decodeEntities(s){return String(s||'').replace(/&amp;/gi,'&').replace(/&nbsp;/gi,' ').replace(/&quot;/gi,'"').replace(/&#39;/gi,"'");}
function stripHTML(s){return decodeEntities(String(s||'').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ')).replace(/\s+/g,' ').trim();}
function safeKey(s){let h=2166136261;for(const ch of String(s||'')){h^=ch.charCodeAt(0);h=Math.imul(h,16777619);}return(h>>>0).toString(16);}
function absoluteURL(url,base){const raw=decodeEntities(String(url||'').trim());if(!raw)return null;if(/^https?:\/\//i.test(raw))return raw;const b=String(base||'').trim(),scheme=(b.match(/^(https?):/i)||[])[1]||'https';if(raw.startsWith('//'))return scheme+':'+raw;const bm=b.match(/^(https?:\/\/[^/?#]+)([^?#]*)?(\?[^#]*)?(#.*)?$/i);if(!bm)return raw;const origin=bm[1],basePath=bm[2]||'/';if(raw.startsWith('#'))return origin+basePath+(bm[3]||'')+raw;if(raw.startsWith('?'))return origin+basePath+raw;const q=raw.search(/[?#]/),pathPart=q>=0?raw.slice(0,q):raw,suffix=q>=0?raw.slice(q):'',trailing=pathPart.endsWith('/');let path=pathPart.startsWith('/')?pathPart:(basePath.endsWith('/')?basePath:basePath.replace(/\/[^/]*$/,'/'))+pathPart;const out=[];for(const seg of path.split('/')){if(!seg||seg==='.')continue;if(seg==='..'){out.pop();continue;}out.push(seg);}const normalized='/'+out.join('/');return origin+(trailing&&normalized!=='/'?normalized+'/':normalized)+suffix;}
async function reqText(url,timeout=10){const r=new Request(url);r.timeoutInterval=timeout;r.headers={'User-Agent':'Mozilla/5.0','Cache-Control':'no-cache'};return await r.loadString();}
const IMAGE_POLICY_VERSION=2;
function attr(tag,name){const m=tag.match(new RegExp(`${name}=["']([^"']+)["']`,'i'));return m?decodeEntities(m[1]):null;}
function cacheFile(name){return fm.joinPath(DOC,name);}
function readJSON(path){try{return fm.fileExists(path)?JSON.parse(fm.readString(path)):null;}catch(_){return null;}}
function writeJSON(path,v){try{fm.writeString(path,JSON.stringify(v));}catch(_){}}
function addImageCandidate(out,url,source,base){const u=absoluteURL(url,base);if(!u||!/^https?:\/\//i.test(u)||out.some(x=>x.url===u))return;out.push({url:u,source});}
function metaImageCandidates(html,base){const out=[];for(const tag of String(html||'').match(/<meta\b[^>]*>/gi)||[]){const prop=(attr(tag,'property')||attr(tag,'name')||'').toLowerCase();if(prop!=='og:image'&&prop!=='twitter:image'&&prop!=='twitter:image:src')continue;addImageCandidate(out,attr(tag,'content'),prop.startsWith('twitter')?'twitter':'og',base);}return out;}
function jsonLdImageCandidates(html,base){const out=[],walk=x=>{if(!x)return;if(Array.isArray(x)){x.forEach(walk);return;}if(typeof x!=='object')return;for(const [k,v] of Object.entries(x)){if(/^(?:image|thumbnailUrl|contentUrl)$/i.test(k)){if(typeof v==='string')addImageCandidate(out,v,'jsonld',base);else if(Array.isArray(v))v.forEach(y=>typeof y==='string'?addImageCandidate(out,y,'jsonld',base):walk(y));else if(v&&typeof v==='object'){addImageCandidate(out,v.url||v.contentUrl||v.thumbnailUrl,'jsonld',base);walk(v);}}else if(k==='@graph'||typeof v==='object')walk(v);}};for(const m of String(html||'').matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)){try{walk(JSON.parse(m[1]));}catch(_){}}return out;}
function imageTagURL(tag,base){const raw=attr(tag,'data-src')||attr(tag,'data-original')||attr(tag,'data-lazy-src')||attr(tag,'src')||((attr(tag,'srcset')||'').split(',')[0]||'').trim().split(/\s+/)[0];return absoluteURL(raw,base);}
function imageTagCandidates(html,base,accept,source){const out=[];for(const tag of String(html||'').match(/<img\b[^>]*>/gi)||[]){const alt=stripHTML(attr(tag,'alt')||''),cls=[attr(tag,'class'),attr(tag,'id'),attr(tag,'data-testid')].filter(Boolean).join(' '),hay=(alt+' '+cls+' '+tag).toLowerCase();if(accept&&!accept({tag,alt,hay}))continue;addImageCandidate(out,imageTagURL(tag,base),source,base);}return out;}
function k1PosterCandidates(html,base){const raw=String(html||''),start=Math.max(raw.search(/ポスターギャラリー/i),raw.search(/poster[^<]{0,20}gallery/i));if(start<0)return[];let end=raw.slice(start+1).search(/(?:ニュース|<[^>]+>\s*news\b)/i);end=end<0?Math.min(raw.length,start+50000):start+1+end;return imageTagCandidates(raw.slice(start,end),base,null,'poster_gallery');}
function eventHeroCandidates(html,base,D){const name=stripHTML(D?.name||''),fighters=[D?.main?.a,D?.main?.b].filter(Boolean).map(x=>String(x).toLowerCase()),keys=[...name.toLowerCase().split(/[^a-z0-9ぁ-んァ-ヶ一-龯]+/).filter(x=>x.length>=3),...fighters.flatMap(x=>x.split(/\s+/).filter(y=>y.length>=3))];return imageTagCandidates(html,base,({hay})=>/(?:event|hero|poster|fight|bout|ufc|k-1|rizin|one|ring)/i.test(hay)||keys.some(k=>hay.includes(k)),'event_hero');}
function sourceImageCandidates(html,base,D){const out=[],append=arr=>arr.forEach(x=>addImageCandidate(out,x.url,x.source,base));if(KEY==='k1')append(k1PosterCandidates(html,base));if(KEY==='ufc'||KEY==='k1'||KEY==='boxing')append(eventHeroCandidates(html,base,D));append(jsonLdImageCandidates(html,base));append(metaImageCandidates(html,base));if(KEY==='rizin'||KEY==='one')append(eventHeroCandidates(html,base,D));return out;}
function metaImage(html,base){return metaImageCandidates(html,base)[0]?.url||null;}
async function cachedImageResult(url,ns='auto',allowNetwork=true){if(!url)return{image:null,url:null,cacheHit:false,error:'no_url'};const path=cacheFile(`combat-${ns}-${safeKey(url)}.jpg`);if(fm.fileExists(path)){try{return{image:fm.readImage(path),url,cacheHit:true,error:null};}catch(_){}}if(!allowNetwork)return{image:null,url,cacheHit:false,error:'cache_miss'};try{const r=new Request(url);r.timeoutInterval=10;r.headers={'User-Agent':'Mozilla/5.0'};const img=await r.loadImage();fm.writeImage(path,img);return{image:img,url,cacheHit:false,error:null};}catch(_){return{image:null,url,cacheHit:false,error:'load_failed'};}}
async function cachedImage(url,ns='auto'){return(await cachedImageResult(url,ns,true)).image;}
async function cachedMetaImageURL(url,ns='event',ttl=4*3600000){if(!url)return null;const path=cacheFile(`combat-meta-${ns}-${safeKey(url)}.json`),cached=readJSON(path),now=Date.now();if(Number(cached?.policy)===IMAGE_POLICY_VERSION&&cached?.imageURL&&now-Number(cached.savedAt)<ttl)return cached.imageURL;try{const h=await reqText(url,8),imageURL=(jsonLdImageCandidates(h,url)[0]||metaImageCandidates(h,url)[0])?.url||null;if(imageURL){writeJSON(path,{savedAt:now,policy:IMAGE_POLICY_VERSION,imageURL});return imageURL;}}catch(_){}return cached?.imageURL||null;}
function ldLocation(v){if(!v)return'';if(typeof v==='string')return v;if(Array.isArray(v))return v.map(ldLocation).filter(Boolean).join(' · ');const a=v.address||{};return [v.name,a.addressLocality,a.addressRegion,a.addressCountry].filter(Boolean).join(' · ');}
function jsonLdEvents(html,base){const out=[];for(const m of html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)){try{const root=JSON.parse(m[1]);const stack=Array.isArray(root)?[...root]:[root];while(stack.length){const x=stack.pop();if(!x||typeof x!=='object')continue;if(Array.isArray(x)){stack.push(...x);continue;}if(x['@graph'])stack.push(x['@graph']);const type=Array.isArray(x['@type'])?x['@type'].join(' '):String(x['@type']||'');if(/Event/i.test(type)&&x.startDate)out.push({name:stripHTML(x.name||''),startAt:String(x.startDate),location:ldLocation(x.location),source:absoluteURL(x.url||base,base)});}}catch(_){}}return out;}
function links(html,base,re){const out=[],seen=new Set();for(const m of html.matchAll(/href=["']([^"'#]+)["']/gi)){const u=absoluteURL(m[1],base);if(!u||seen.has(u)||!re.test(u))continue;seen.add(u);out.push(u);}return out;}
function cleanName(s){return stripHTML(s).replace(/^(?:MAIN EVENT|CO-?MAIN|FEATURED|TITLE FIGHT)\s*/i,'').replace(/\s+/g,' ').trim();}
function jpCardLabel(label){const v=String(label||'').trim().toUpperCase();if(v==='CO-MAIN')return'セミ';if(v==='MAIN CARD')return'本戦';if(v==='FEATURED')return'注目';if(v==='TITLE FIGHT')return'タイトル戦';if(v==='UNDERCARD')return'前座';return String(label||'');}
const JP_DISPLAY={
'Noche UFC':'ノーチェUFC',
'Crypto.com UFC 331: Van vs Pantoja 2':'Crypto.com UFC 331：ヴァン vs パントージャ2',
'RIZIN LANDMARK 16 in NAGASAKI':'RIZIN LANDMARK 16 in 長崎',
'ONE Friday Fights 170':'ONE フライデーファイツ 170',
'ONE Friday Fights 170 & The Inner Circle 30':'ONE フライデーファイツ 170',
'ONE Friday Fights 170 & The Inner Circle':'ONE フライデーファイツ 170',
'Garcia vs Benn':'ガルシア vs ベン',
'Jean Silva':'ジェアン・シウヴァ','Jose Miguel Delgado':'ホセ・ミゲル・デルガド',
'Brandon Moreno':'ブランドン・モレノ','Joseph Morales':'ジョセフ・モラレス',
'Tommy McMillen':'トミー・マクミレン','Marwan Rahiki':'マルワン・ラヒキ',
'Manon Fiorot':'マノン・フィオロ','Alexa Grasso':'アレクサ・グラッソ',
'Waldo Cortes Acosta':'ワルド・コルテス・アコスタ','Curtis Blaydes':'カーティス・ブレイズ',
'David Martinez':'ダヴィッド・マルティネス','Dan Ige':'ダン・イゲ',
'Joshua Van':'ジョシュア・ヴァン','Alexandre Pantoja':'アレシャンドレ・パントージャ','Arman Tsarukyan':'アルマン・ツァルキヤン','Mauricio Ruffy':'マウリシオ・ルフィ','Patricio Pitbull':'パトリシオ・ピットブル','Dooho Choi':'チェ・ドゥホ','Raul Rosas Jr.':'ラウル・ロサスJr.','Raoni Barcelos':'ハオニ・バルセロシュ',
'Yodlekpet Or Atchariya':'ヨードレックペット','Yodlekpet':'ヨードレックペット',
'Pompet Pongsuphan PK':'ポンペット','Pompet':'ポンペット',
'Ayad Albadr':'アヤド・アルバドル','Kongchai Chanaidonmueang':'ゴンチャイ・チャナイドンムラン',
'Yodthewin Mor Rajabhatmubanchombueng':'ヨッドテーウィン','Otis Waghorn':'オーティス・ワグホーン',
'Xavier Gonzalez':'チャビエル・ゴンザレス','Thway Lin Htet':'スイ・リン・テート',
'Dabdam Por Tor Tor Thongtawee':'ダブダム','Petsangwan Sor Samarngarment':'ペットサンワン',
'Ryan Garcia':'ライアン・ガルシア','Conor Benn':'コナー・ベン',
'Isaac Cruz':'アイザック・クルス','Nestor Bravo':'ネスター・ブラボ','Jesus Ramos':'ヘスス・ラモス','Meiirim Nursultanov':'メイリム・ヌルスルタノフ',
'Jai Opetaia':'ジェイ・オペタイア','Noel Mikaelian':'ノエル・ミカエリアン',
'Nadaka':'吉成名高','Nadaka Yoshinari':'吉成名高',
'Har Ling Om':'ハー・リン・オム','Ling Om':'ハー・リン・オム',
'Yuya Wakamatsu':'若松佑弥','Willie van Rooyen':'ウィリー・ファン・ローエン',
'Shimon Yoshinari':'士門','Suablack Tor Pran49':'スーブラック','Suablack':'スーブラック',
'Hyu':'陽勇','Hyuma Hitachi':'常陸飛雄馬'
};
function jpDisplay(v){const raw=stripHTML(v);return JP_DISPLAY[raw]||raw;}
function sanitizeFighter(s){let v=cleanName(s);if(KEY==='ufc'){v=v.replace(/^UFC Fight Night:\s*/i,'').replace(/\s*\|\s*UFC.*$/i,'').trim();}return v;}
function splitFight(s){const t=cleanName(s);const m=t.match(/^(.{2,64}?)\s+(?:vs\.?|VS|対)\s+(.{2,64})$/i);return m?{a:sanitizeFighter(m[1]),b:sanitizeFighter(m[2])}:null;}
function fightPairs(html){const out=[],seen=new Set();for(const m of html.matchAll(/<h[1-4][^>]*>([\s\S]*?)<\/h[1-4]>/gi)){const p=splitFight(m[1]);if(p&&p.a.length<50&&p.b.length<50){const k=p.a+'|'+p.b;if(!seen.has(k)){seen.add(k);out.push(p);}}}if(!out.length){const title=(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)||[])[1];const p=splitFight(title||'');if(p)out.push(p);}return out.slice(0,6);}
function cardFighterName(v){let n=cleanName(v).replace(/^#\d+\s*/,'').trim();if(n.includes('/')){const parts=n.split('/').map(x=>x.trim()).filter(Boolean),jp=parts.find(x=>/[ぁ-んァ-ヶ一-龯]/.test(x));n=jp||parts[0]||n;}return n.replace(/\s+/g,' ').trim();}
function fightContext(raw,eventName=''){
  let v=stripHTML(raw||'').replace(/\s+/g,' ').trim();if(!v)return'';if(eventIdentityText(v)===eventIdentityText(eventName))return'';if(/(?:live\s+on|watch\s+on|stream|broadcast|dazn|espn|paramount|fight\s*pass|youtube)/i.test(v))return'';
  const k=v.match(/-?\d+(?:\.\d+)?kg級/i);if(k)return k[0];
  const jp=v.match(/(?:女子)?(?:ストロー|フライ|バンタム|フェザー|ライト|ウェルター|ミドル|ライトヘビー|ヘビー)級(?:\s*(?:タイトル(?:マッチ|戦)|マッチ))?/i);if(jp)return jp[0].replace(/\s+/g,' ');
  const discipline=v.match(/(?:Women's\s+)?(Strawweight|Flyweight|Bantamweight|Featherweight|Lightweight|Welterweight|Middleweight|Light Heavyweight|Heavyweight)\s+(Kickboxing|Muay Thai|MMA)\b/i);
  if(discipline){const w={strawweight:'ストロー級',flyweight:'フライ級',bantamweight:'バンタム級',featherweight:'フェザー級',lightweight:'ライト級',welterweight:'ウェルター級',middleweight:'ミドル級','light heavyweight':'ライトヘビー級',heavyweight:'ヘビー級'}[discipline[1].toLowerCase()]||discipline[1],d={kickboxing:'キックボクシング','muay thai':'ムエタイ',mma:'MMA'}[discipline[2].toLowerCase()]||discipline[2],female=/^Women's\b/i.test(v)?'女子':'';return female+w+d;}
  const en=v.match(/(?:Women's\s+)?(?:Strawweight|Flyweight|Bantamweight|Featherweight|Lightweight|Welterweight|Middleweight|Light Heavyweight|Heavyweight)\s+(?:Interim\s+)?(?:Title\s+)?Bout/i);if(en)return en[0];
  if(/\b(?:WBC|WBA|IBF|WBO|Ring)\b/i.test(v)&&/(?:title|championship|world)/i.test(v))return v.length>72?v.slice(0,72):v;return v.length<=48?v:'';
}
function cardScope(html){const raw=String(html||'');if(KEY==='k1'){const a=raw.search(/(?:対戦カード|battle\s*card)/i);if(a>=0){const rest=raw.slice(a+1),b=rest.search(/(?:ポスターギャラリー|poster[^<]{0,20}gallery|ニュース|\bnews\b)/i);return raw.slice(a,b>=0?a+1+b:Math.min(raw.length,a+70000));}}if(KEY==='ufc'){const a=raw.search(/(?:メインカード|Main\s*Card)/i);if(a>=0){const rest=raw.slice(a+1),b=rest.search(/(?:アーリー?プレリム|プレリム|Early\s*Prelims?|Prelims?)/i);return raw.slice(a,b>=0?a+1+b:Math.min(raw.length,a+90000));}}return raw;}
function linkedFighterBouts(html,base){if(KEY!=='ufc'&&KEY!=='k1')return[];const scoped=cardScope(html),items=[],seen=new Set(),hrefOK=KEY==='ufc'?/\/athlete\/[^"'#?]+/i:/\/(?:k-1wgp\/)?fighter\/\d+/i;for(const m of scoped.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)){const tag='<a '+m[1]+'>',href=attr(tag,'href')||'';if(!hrefOK.test(href))continue;const n=cardFighterName(m[2]),url=absoluteURL(href,base);if(!n||n.length<2||n.length>48||!url)continue;const key=eventIdentityText(n)+'|'+url;if(seen.has(key))continue;seen.add(key);items.push({name:n,url,index:m.index||0,end:(m.index||0)+m[0].length});}
  const out=[];for(let i=0;i+1<items.length&&out.length<8;i+=2){const a=items[i],b=items[i+1],from=Math.max(0,a.index-1800),window=scoped.slice(from,a.index),plain=stripHTML(window);let ctx='';if(KEY==='k1'){const all=[...plain.matchAll(/-?\d+(?:\.\d+)?kg級/gi)];ctx=all.length?fightContext(all[all.length-1][0]):'';}else{const all=[...plain.matchAll(/(?:女子)?(?:ストロー|フライ|バンタム|フェザー|ライト|ウェルター|ミドル|ライトヘビー|ヘビー)級\s*(?:タイトルマッチ|マッチ)|(?:Women's\s+)?(?:Strawweight|Flyweight|Bantamweight|Featherweight|Lightweight|Welterweight|Middleweight|Light Heavyweight|Heavyweight)\s+(?:Interim\s+)?(?:Title\s+)?Bout/gi)];ctx=all.length?fightContext(all[all.length-1][0]):'';}
    let officialLabel='';if(/\bco-?main\b|セミ(?:ファイナル|メイン)?/i.test(plain))officialLabel='CO-MAIN';else if(KEY!=='k1'&&/\bfeatured\b|注目/i.test(plain))officialLabel='FEATURED';else if(/\bundercard\b|前座/i.test(plain))officialLabel='UNDERCARD';else if(/\btitle\s+(?:fight|bout)\b|タイトル(?:戦|マッチ)/i.test(plain))officialLabel='TITLE FIGHT';
    out.push({a:a.name,b:b.name,aProfileURL:a.url,bProfileURL:b.url,context:ctx,officialLabel});}
  return out;}
function linkedFighterPairs(html,base=S.listing){return linkedFighterBouts(html,base).map(({a,b,aProfileURL,bProfileURL,context,officialLabel})=>({a,b,aProfileURL,bProfileURL,context,officialLabel}));}
function semanticVsPairs(html){if(KEY!=='ufc'&&KEY!=='k1')return[];const lines=decodeEntities(String(cardScope(html)||'').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ').replace(/<(?:br|hr)\b[^>]*>/gi,'\n').replace(/<\/(?:a|div|span|p|h[1-6]|li|section|article|td|th|tr|strong|em)>/gi,'\n').replace(/<[^>]+>/g,' ')).split(/\n+/).map(x=>x.replace(/\s+/g,' ').trim()).filter(Boolean);const bad=/^(?:main card|prelims?|early prelims?|fight card|対戦カード|所属ジム|戦歴|生年月日|身長|体重|ファイトスタイル|出身地|国籍|sns|image|odds?|watch|tickets?|follow live|[-+]?\d+(?:\.\d+)?|#\d+)$/i,isName=x=>{const n=cardFighterName(x);return n.length>=2&&n.length<=48&&/[A-Za-zぁ-んァ-ヶ一-龯]/.test(n)&&!bad.test(n)&&!/(?:bout|title|級|round|戦|勝|敗|分|cm|kg|arena|card)/i.test(n);},pick=(start,step)=>{for(let j=start,c=0;j>=0&&j<lines.length&&c<7;j+=step,c++){if(/^vs\.?$/i.test(lines[j]))continue;if(isName(lines[j]))return cardFighterName(lines[j]);}return'';};const out=[],seen=new Set();for(let i=0;i<lines.length;i++){if(!/^vs\.?$/i.test(lines[i]))continue;const a=pick(i-1,-1),b=pick(i+1,1),k=a+'|'+b;if(a&&b&&!seen.has(k)){seen.add(k);out.push({a,b});}}return out.slice(0,8);}
function officialPageBouts(html,base){if(KEY==='ufc'||KEY==='k1'){const linked=linkedFighterBouts(html,base);if(linked.length)return linked;const semantic=semanticVsPairs(html);if(semantic.length)return semantic;}return fightPairs(html);}
function officialPagePairs(html,base=S.listing){return officialPageBouts(html,base);}
function shortLoc(s){const v=String(s||'');if(/LaLa\s*arena\s*TOKYO-BAY|ららアリーナ\s*東京ベイ/i.test(v))return'千葉・船橋';if(/Shanghai|Pudong|China|上海/i.test(v))return'上海';if(/Osaka|大阪/i.test(v))return'大阪';if(/Bangkok|Lumpinee|バンコク|ルンピニー/i.test(v))return'バンコク';if(/Paris|パリ/i.test(v))return'パリ';if(/Las Vegas|ラスベガス/i.test(v))return'ラスベガス';if(/San Diego|サンディエゴ/i.test(v))return'サンディエゴ';if(/Yokohama Buntai|Yokohama BUNTAI|横浜BUNTAI|Yokohama|横浜/i.test(v))return'横浜BUNTAI';if(/代々木|Yoyogi/i.test(v))return'東京・代々木第二';if(/Tokyo|東京/i.test(v))return'東京';return v.length>14?v.slice(0,13)+'…':v;}
function validOrgName(name){const n=String(name||'');if(KEY==='ufc')return/UFC/i.test(n);if(KEY==='rizin')return/RIZIN/i.test(n);if(KEY==='one')return/ONE/i.test(n);if(KEY==='k1')return/K-1/i.test(n);if(KEY==='boxing')return/(?:\bvs\.?\b|boxing|fight|title|championship|対)/i.test(n);return false;}
function normalizeOneCompositeEvent(ev){if(KEY!=='one'||!ev)return ev;const originalName=stripHTML(ev.name||''),m=originalName.match(/ONE Friday Fights\s+\d+/i);if(!m||!/The Inner Circle\s+\d+/i.test(originalName))return ev;const t=new Date(ev.startAt).getTime();if(!Number.isFinite(t))return{...ev,name:m[0],compositeName:originalName,oneComposite:true};const j=new Date(t+9*3600000),jh=j.getUTCHours(),jm=j.getUTCMinutes(),startAt=jh===20&&jm===30?new Date(t+2*3600000).toISOString():ev.startAt;return{...ev,name:m[0],startAt,compositeName:originalName,oneComposite:true};}
function ufcCardTime(raw,min,max){const MONTH={JAN:0,FEB:1,MAR:2,APR:3,MAY:4,JUN:5,JUL:6,AUG:7,SEP:8,OCT:9,NOV:10,DEC:11},ZONE={UTC:0,GMT:0,EDT:-4,EST:-5,CDT:-5,CST:-6,MDT:-6,MST:-7,PDT:-7,PST:-8,BST:1,CET:1,CEST:2,JST:9};const s=decodeEntities(String(raw||'')).replace(/\s+/g,' ').trim(),m=s.match(/(?:Sun|Mon|Tue|Wed|Thu|Fri|Sat),?\s+([A-Za-z]{3})\s+(\d{1,2})\s*\/\s*(\d{1,2}):(\d{2})\s*(AM|PM)\s*([A-Z]{2,5})/i);if(!m)return null;const mo=MONTH[m[1].toUpperCase()],off=ZONE[m[6].toUpperCase()];if(mo==null||off==null)return null;let h=Number(m[3])%12;if(m[5].toUpperCase()==='PM')h+=12;const day=Number(m[2]),mi=Number(m[4]),ref=new Date(Number.isFinite(min)?min:Date.now()).getUTCFullYear(),hits=[];for(const y of [ref-1,ref,ref+1]){const t=Date.UTC(y,mo,day,h,mi)-off*3600000;if((!Number.isFinite(min)||t>min)&&(!Number.isFinite(max)||t<max))hits.push(t);}return hits.length?new Date(Math.min(...hits)).toISOString():null;}
function ufcJapaneseCardTime(raw,min,max){const m=String(raw||'').match(/(20\d{2})[.\/-](\d{1,2})[.\/-](\d{1,2})\s*\/\s*(\d{1,2}):(\d{2})\s*JST/i);if(!m)return null;const t=Date.UTC(Number(m[1]),Number(m[2])-1,Number(m[3]),Number(m[4])-9,Number(m[5]));return(!Number.isFinite(min)||t>min)&&(!Number.isFinite(max)||t<max)?new Date(t).toISOString():null;}
function ufcListingEvents(html,base,min,max){
  if(KEY!=='ufc')return[];const rawHtml=String(html||''),out=[],seen=new Set(),add=(source,startAt)=>{if(!source||!startAt||seen.has(source))return;seen.add(source);out.push({name:'UFC Fight Night',startAt,location:'',source,ufcListingFallback:true});};
  for(const m of rawHtml.matchAll(/<([a-z0-9]+)\b([^>]*\bdata-main-card=["'][^"']+["'][^>]*)>([\s\S]*?)<\/\1>/gi)){const tag=`<${m[1]} ${m[2]}>`,raw=attr(tag,'data-main-card'),hm=m[3].match(/href=["']([^"'#]*\/event\/[^"'#]+)["']/i);add(hm?absoluteURL(hm[1],base):null,ufcCardTime(raw,min,max));}
  const linkRe=/<a\b[^>]*href=["']([^"'#]*\/event\/[^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  for(const m of rawHtml.matchAll(linkRe)){const source=absoluteURL(m[1],base);if(!source||seen.has(source))continue;const idx=m.index||0,near=stripHTML((m[2]||'')+' '+rawHtml.slice(Math.max(0,idx-2400),Math.min(rawHtml.length,idx+m[0].length+3200))),times=[];for(const x of near.matchAll(/(?:Sun|Mon|Tue|Wed|Thu|Fri|Sat),?\s+[A-Za-z]{3}\s+\d{1,2}\s*\/\s*\d{1,2}:\d{2}\s*(?:AM|PM)\s*(?:UTC|GMT|EDT|EST|CDT|CST|MDT|MST|PDT|PST|BST|CET|CEST|JST)/gi)){const t=ufcCardTime(x[0],min,max);if(t)times.push(new Date(t).getTime());}for(const x of near.matchAll(/20\d{2}[.\/-]\d{1,2}[.\/-]\d{1,2}\s*\/\s*\d{1,2}:\d{2}\s*JST/gi)){const t=ufcJapaneseCardTime(x[0],min,max);if(t)times.push(new Date(t).getTime());}if(!times.length)continue;times.sort((a,b)=>a-b);const first=times[0],cluster=times.filter(t=>t-first<=12*3600000),chosen=Math.max(...cluster);add(source,new Date(chosen).toISOString());}
  return out;
}
function k1ListingEvents(html,base,now=Date.now()){
  if(KEY!=='k1')return[];const raw=String(html||''),out=[],seen=new Set(),linkRe=/<a\b[^>]*href=["']([^"']*\/(?:k-1wgp\/)?schedule\/\d+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  for(const m of raw.matchAll(linkRe)){const source=absoluteURL(m[1],base);if(!source||seen.has(source))continue;const idx=m.index||0,pre=raw.slice(Math.max(0,idx-5200),idx),lines=decodeEntities(pre.replace(/<(?:br|hr)\b[^>]*>/gi,'\n').replace(/<\/(?:div|p|li|section|article|h[1-6]|dt|dd|tr|td|th)>/gi,'\n').replace(/<[^>]+>/g,' ')).split(/\n+/).map(x=>x.replace(/\s+/g,' ').trim()).filter(Boolean);let di=-1,dm=null;for(let i=lines.length-1;i>=0;i--){const x=lines[i].match(/(20\d{2})[.\/-](\d{1,2})[.\/-](\d{1,2})|20(\d{2})年(\d{1,2})月(\d{1,2})日/);if(x){di=i;dm=x;break;}}if(di<0||!dm)continue;const y=Number(dm[1]||('20'+dm[4])),mo=Number(dm[2]||dm[5]),day=Number(dm[3]||dm[6]);let name=`K-1 ${y}.${String(mo).padStart(2,'0')}.${String(day).padStart(2,'0')}`;for(let j=di;j>=Math.max(0,di-10);j--){const line=lines[j];if(/K-1/i.test(line)&&!/K-1 WGP公式|K-1 JAPAN|match schedule|試合日程/i.test(line)){name=line.replace(/^\d{4}年\d{1,2}月\d{1,2}日[^）)]*[）)]?\s*/,'').trim()||name;break;}}let location='';for(let j=di+1;j<Math.min(lines.length,di+10);j++){const line=lines[j];if(/ホール|BUNTAI|体育館|アリーナ|arena|スタジアム|競技場|尚州|韓国/i.test(line)){location=line;break;}}let startAt=`${y}-${String(mo).padStart(2,'0')}-${String(day).padStart(2,'0')}T00:00:00+09:00`,timeTba=true;for(let j=di+1;j<Math.min(lines.length,di+12);j++){const tm=lines[j].match(/(\d{1,2}):(\d{2})\s*(?:試合開始|第一部開始|開始)/);if(tm){startAt=`${y}-${String(mo).padStart(2,'0')}-${String(day).padStart(2,'0')}T${String(tm[1]).padStart(2,'0')}:${tm[2]}:00+09:00`;timeTba=false;break;}}seen.add(source);out.push({name,startAt,location:shortLoc(location),source,timeTba,displayDate:`${mo}/${day}`});}
  return out.filter(e=>new Date(e.startAt).getTime()<now+400*86400000);
}
function ringUsDst(y,mo,day){const marchSecond=8+((7-new Date(Date.UTC(y,2,8)).getUTCDay())%7),novFirst=1+((7-new Date(Date.UTC(y,10,1)).getUTCDay())%7);if(mo<2||mo>10)return false;if(mo>2&&mo<10)return true;if(mo===2)return day>=marchSecond;return day<novFirst;}
function ringSiteOffsetHours(zone,y,mo,day){const z=String(zone||'ET').toUpperCase();if(z==='EDT')return-4;if(z==='EST'||z==='ET')return ringUsDst(y,mo,day)?-4:-5;if(z==='PDT')return-7;if(z==='PST'||z==='PT')return ringUsDst(y,mo,day)?-7:-8;if(z==='CDT')return-5;if(z==='CST'||z==='CT')return ringUsDst(y,mo,day)?-5:-6;if(z==='MDT')return-6;if(z==='MST'||z==='MT')return ringUsDst(y,mo,day)?-6:-7;if(z==='BST')return 1;if(z==='JST')return 9;return 0;}
function ringListingTime(mon,day,hour,minute,ampm,zone,now=Date.now()){const MONTH={JAN:0,FEB:1,MAR:2,APR:3,MAY:4,JUN:5,JUL:6,AUG:7,SEP:8,OCT:9,NOV:10,DEC:11},mo=MONTH[String(mon||'').slice(0,3).toUpperCase()];if(mo==null)return null;let h=Number(hour)%12;if(String(ampm).toUpperCase()==='PM')h+=12;const ref=new Date(now).getUTCFullYear(),hits=[];for(const y of [ref-1,ref,ref+1]){const off=ringSiteOffsetHours(zone,y,mo,Number(day)),t=Date.UTC(y,mo,Number(day),h,Number(minute))-off*3600000;if(t>now-200*86400000&&t<now+400*86400000)hits.push(t);}if(!hits.length)return null;hits.sort((a,b)=>Math.abs(a-now)-Math.abs(b-now));return new Date(hits[0]).toISOString();}
function ringSlugName(source){const slug=((String(source||'').match(/\/events\/([^/?#]+)/i)||[])[1]||'').replace(/-[A-Za-z0-9]{16,}$/,'').replace(/-/g,' ').trim();return slug.replace(/\bvs\b/i,'vs');}
function ringListingEvents(html,base,now=Date.now()){if(KEY!=='boxing'||!html)return[];const out=[],seen=new Set(),re=/<a\b[^>]*href=["']([^"']*\/events\/[^"'#?]+)["'][^>]*>([\s\S]*?)<\/a>/gi;for(const m of String(html).matchAll(re)){const source=absoluteURL(m[1],base);if(!source||seen.has(source))continue;const text=stripHTML(m[2]).replace(/\s+/g,' ').trim(),dm=text.match(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{1,2})\b/i),tm=text.match(/\b(\d{1,2}):(\d{2})\s*(AM|PM)\s*(EST|EDT|ET|PST|PDT|PT|CST|CDT|CT|MST|MDT|MT|BST|GMT|UTC|JST)\b/i);if(!dm||!tm)continue;const startAt=ringListingTime(dm[1],dm[2],tm[1],tm[2],tm[3],tm[4],now);if(!startAt)continue;let location=text.replace(dm[0],' ').replace(tm[0],' ').replace(/\s+/g,' ').trim();const after=String(html).slice((m.index||0)+m[0].length,(m.index||0)+m[0].length+3500),label=(after.match(/aria-label=["']View event details for ([^"']+)["']/i)||[])[1],name=cleanName(label||ringSlugName(source));if(!name||!/(?:\bvs\.?\b|\bversus\b|対)/i.test(name))continue;seen.add(source);out.push({name,startAt,location:shortLoc(location),source,timeTba:false,ringOfficial:true});}return out;}
function ringDetailBouts(html){if(KEY!=='boxing'||!html)return[];const flight=String(html).replace(/\\u0026/gi,'&').replace(/\\"/g,'"'),out=[],seen=new Set();const add=(a,b,context='',officialLabel='')=>{a=cleanName(a);b=cleanName(b);const k=eventIdentityText(a)+'|'+eventIdentityText(b);if(!a||!b||seen.has(k))return;seen.add(k);out.push({a,b,context:fightContext(context),officialLabel});};
  const main=flight.match(/"mainFight":\{[\s\S]{0,20000}?"tagLine":"([^"]*)"[\s\S]{0,30000}?"fighterA":\{[\s\S]{0,12000}?"name":"([^"]+)"[\s\S]{0,30000}?"fighterB":\{[\s\S]{0,12000}?"name":"([^"]+)"/);if(main)add(main[2],main[3],main[1],'MAIN EVENT');
  const re=/"fighterA":\{[\s\S]{0,9000}?"name":"([^"]+)"[\s\S]{0,18000}?"fighterB":\{[\s\S]{0,9000}?"name":"([^"]+)"/g;for(const m of flight.matchAll(re)){const idx=m.index||0,prefix=flight.slice(Math.max(0,idx-3000),idx),tags=[...prefix.matchAll(/"tagLine":"([^"]*)"/g)],ctx=tags.length?tags[tags.length-1][1]:'';add(m[1],m[2],ctx,out.length===0?'MAIN EVENT':out.length===1?'CO-MAIN':'MAIN CARD');}
  if(out.length<2){for(const p of fightPairs(html)){add(p.a,p.b,'',out.length===0?'MAIN EVENT':out.length===1?'CO-MAIN':'MAIN CARD');}}
  return out.slice(0,6);}
function ringDetailMain(html){return ringDetailBouts(html)[0]||null;}
function ringDetailPairs(html){return ringDetailBouts(html);}
function ufcDetailName(html){if(KEY!=='ufc'||!html)return'';const og=(html.match(/<meta\b[^>]*(?:property|name)=["']og:title["'][^>]*content=["']([^"']+)["'][^>]*>/i)||[])[1],title=(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)||[])[1],v=stripHTML(og||title||'').replace(/\s*\|\s*UFC.*$/i,'').trim();return /UFC/i.test(v)?v:'';}
function ufcDetailLocation(html){if(KEY!=='ufc'||!html)return'';const m=html.match(/["']addressLocality["']\s*:\s*["']([^"']+)["']/i);if(m)return decodeEntities(m[1]);const plain=stripHTML(html);for(const city of ['Paris','Las Vegas','Glendale','London','New York','Miami','Abu Dhabi','Perth','Sydney','Vancouver','Toronto','Shanghai'])if(new RegExp(`\\b${city.replace(/ /g,'\\s+')}\\b`,'i').test(plain))return city;return'';}
function currentGraceMs(e){return e?.timeTba?36*3600000:12*3600000;}
function currentLocked(snap){const end=new Date(snap.startAt).getTime()+currentGraceMs(snap);return Date.now()<end;}
function fighterIdentity(v){return String(jpDisplay(v)||'').toLowerCase().replace(/[\s・.'’_-]+/g,'');}
function sameFight(a,b,x,y){const A=fighterIdentity(a),B=fighterIdentity(b),X=fighterIdentity(x),Y=fighterIdentity(y);return(A===X&&B===Y)||(A===Y&&B===X);}
function fallbackSupportLabel(index){return index===0?'CO-MAIN':'MAIN CARD';}
function normalizedExistingSupportLabel(label,index){const v=String(label||'').trim().toUpperCase();if(v==='TITLE FIGHT'||v==='UNDERCARD')return v;if(v==='CO-MAIN')return index===0?'CO-MAIN':'MAIN CARD';if(v==='MAIN CARD')return fallbackSupportLabel(index);return fallbackSupportLabel(index);}
function normalizedOfficialSupportLabel(label,index){const v=String(label||'').trim().toUpperCase();if(v==='TITLE FIGHT'||v==='UNDERCARD'||v==='FEATURED')return v;if(v==='CO-MAIN')return index===0?'CO-MAIN':'MAIN CARD';if(v==='MAIN CARD')return'MAIN CARD';return fallbackSupportLabel(index);}
function supportLabelFor(data,p,index){if(p?.officialLabel)return normalizedOfficialSupportLabel(p.officialLabel,index);for(const r of (data?.support||[])){if(sameFight(r.a,r.b,p.a,p.b))return normalizedExistingSupportLabel(r.label,index);}return fallbackSupportLabel(index);}
function supportRowsFromPairs(data,pairs){return pairs.slice(1,5).map((p,i)=>({label:supportLabelFor(data,p,i),a:p.a,b:p.b,context:fightContext(p.context,data?.name),aProfileURL:p.aProfileURL||null,bProfileURL:p.bProfileURL||null}));}
function mainFromBout(data,p){const old=data?.main||{},same=!!(old.a&&old.b&&p?.a&&p?.b&&sameFight(old.a,old.b,p.a,p.b)),carry=same?old:{},context=fightContext(p?.context,data?.name)||(same?fightContext(old.context,data?.name):'')||'';return{...carry,a:p.a,b:p.b,context,aProfileURL:p.aProfileURL||(same?old.aProfileURL:null)||null,bProfileURL:p.bProfileURL||(same?old.bProfileURL:null)||null};}
function eventIdentityText(v){return stripHTML(v||'').toLowerCase().replace(/&/g,'and').replace(/[^a-z0-9\u3040-\u30ff\u3400-\u9fff]+/g,'');}
function eventSourceKey(ev){return String(ev?.source||'').toLowerCase().replace(/^https?:\/\/(?:www\.)?/,'').replace(/[?#].*$/,'').replace(/\/+$/,'');}
function genericEventIdentityName(v){const n=eventIdentityText(v);return n==='ufcfightnight';}
function sameEventIdentity(a,b){if(!a||!b)return false;const as=eventSourceKey(a),bs=eventSourceKey(b);if(as&&bs&&as===bs)return true;const an=eventIdentityText(a.name),bn=eventIdentityText(b.name);if(an&&bn&&an===bn&&!genericEventIdentityName(a.name))return true;if(a.main&&b.main&&sameFight(a.main.a,a.main.b,b.main.a,b.main.b))return true;return false;}
function trustedMainContext(data){if(!data?.main)return'';const n=trustedFutureEvents().find(x=>x?.main&&sameEventIdentity(data,x)&&sameFight(data.main.a,data.main.b,x.main.a,x.main.b));return n?fightContext(n.main.context,n.name):'';}
function sanitizeEventFightContext(data){if(!data)return data;const main=data.main?{...data.main,context:fightContext(data.main.context,data.name)||trustedMainContext(data)||''}:data.main;const support=Array.isArray(data.support)?data.support.map((r,i)=>({...r,label:normalizedExistingSupportLabel(r.label,i),context:fightContext(r.context,data.name)})):data.support;return{...data,main,support};}
function rollforwardEligible(base,e,now=Date.now()){const t=new Date(e?.startAt).getTime(),baseT=new Date(base?.startAt).getTime();return Number.isFinite(t)&&Number.isFinite(baseT)&&t>baseT+6*3600000&&t>now-currentGraceMs(e)&&t<now+180*86400000&&validOrgName(e?.name)&&!sameEventIdentity(base,e);}
function nextEligible(base,e,now=Date.now()){const t=new Date(e?.startAt).getTime(),baseT=new Date(base?.startAt).getTime();return Number.isFinite(t)&&Number.isFinite(baseT)&&t>Math.max(baseT+6*3600000,now)&&t<now+180*86400000&&validOrgName(e?.name)&&!sameEventIdentity(base,e);}
function oneBoutContext(raw){const plain=stripHTML(raw||''),hits=[...plain.matchAll(/(?:Women's\s+)?(?:Strawweight|Flyweight|Bantamweight|Featherweight|Lightweight|Welterweight|Middleweight|Light Heavyweight|Heavyweight)\s+(?:Kickboxing|Muay Thai|MMA)\b/gi)];return hits.length?fightContext(hits[hits.length-1][0]):'';}
function currentPagePairs(html,base=S.listing){if(!html)return[];if(KEY==='boxing'){const ring=ringDetailPairs(html);if(ring.length)return ring;}if(KEY==='one'){const raw=String(html),out=[],seen=new Set(),re=/<tr\b[^>]*class=["'][^"']*\bvs\b[^"']*["'][^>]*>([\s\S]*?)<\/tr>/gi;for(const m of raw.matchAll(re)){const row=m[1],titles=[...row.matchAll(/title="([^"]+)"/g)].map(x=>cleanName(x[1]));if(titles.length<2)continue;const a=titles[0],b=titles[1],k=a+'|'+b,context=oneBoutContext(raw.slice(Math.max(0,(m.index||0)-2600),m.index||0));if(a&&b&&!seen.has(k)){seen.add(k);out.push({a,b,context});}}if(out.length)return out.slice(0,6);}return officialPageBouts(html,base);}
async function refreshLockedCurrent(snap){const path=cacheFile(`combat-hub-current-${KEY}.json`),cached=readJSON(path),now=Date.now(),refreshTtl=KEY==='boxing'?2*3600000:30*60*1000;if(cached?.data&&now-Number(cached.savedAt)<refreshTtl)return sanitizeEventFightContext({...snap,...cached.data,cardCheckedAt:Number(cached.savedAt)||null,cardRefreshedAt:Number(cached.savedAt)||null});try{const html=await reqText(snap.source,8),pairs=currentPagePairs(html,snap.source),images=sourceImageCandidates(html,snap.source,snap);let data={posterURL:images[0]?.url||null,posterSource:images[0]?.source||'none',posterCandidates:images.slice(0,8)};if(pairs.length&&sameFight(pairs[0].a,pairs[0].b,snap.main.a,snap.main.b)){const parsed=supportRowsFromPairs(snap,pairs),seen=new Set(parsed.map(r=>`${r.a}|${r.b}`));for(const r of (snap.support||[])){if(parsed.length>=5)break;const k=`${r.a}|${r.b}`;if(!seen.has(k)){seen.add(k);parsed.push(r);}}data={...data,main:mainFromBout(snap,pairs[0]),support:parsed,cardTba:false,cardSourceType:'official-detail'};}writeJSON(path,{savedAt:now,data});return{...snap,...data,cardCheckedAt:now,cardRefreshedAt:pairs.length?now:null};}catch(_){return cached?.data?sanitizeEventFightContext({...snap,...cached.data,cardCheckedAt:Number(cached.savedAt)||null,cardRefreshedAt:Number(cached.savedAt)||null}):sanitizeEventFightContext({...snap,cardSourceType:'trusted-snapshot'});}}
const KNOWN_EVENT_CARD_REFRESH_MS=30*60*1000,CARD_POLICY_VERSION=7;
function supportsLiveCardRefresh(){return KEY==='ufc'||KEY==='rizin'||KEY==='one'||KEY==='k1';}
function eventDetailSources(data){const out=[data?.source].filter(Boolean);if(KEY==='ufc'&&data?.source){const alt=data.source.includes('://jp.ufc.com/')?data.source.replace('://jp.ufc.com/','://www.ufc.com/'):data.source.includes('://www.ufc.com/')?data.source.replace('://www.ufc.com/','://jp.ufc.com/'):null;if(alt&&!out.includes(alt))out.push(alt);}return out;}
async function refreshKnownRollforwardEvent(data){data=sanitizeEventFightContext(data);if(!data?.source||!supportsLiveCardRefresh())return data;for(const source of eventDetailSources(data)){try{const html=await reqText(source,8),pairs=currentPagePairs(html,source);if(!pairs.length)continue;const images=sourceImageCandidates(html,source,data),main=mainFromBout(data,pairs[0]),support=supportRowsFromPairs(data,pairs);return sanitizeEventFightContext({...data,source:data.source||source,main,support,cardTba:false,posterURL:images[0]?.url||data.posterURL||null,posterSource:images[0]?.source||data.posterSource||'none',posterCandidates:images.slice(0,8),cardRefreshed:true,cardSourceType:'official-detail'});}catch(_){}}return data;}
async function strictNextEvent(snap){try{const listing=await reqText(S.listing),now=Date.now(),eligible=e=>rollforwardEligible(snap,e,now);let candidates=jsonLdEvents(listing,S.listing).map(normalizeOneCompositeEvent).filter(eligible);if(KEY==='ufc')candidates.push(...ufcListingEvents(listing,S.listing,Math.max(new Date(snap.startAt).getTime()+6*3600000,now-12*3600000),now+180*86400000).filter(eligible));if(KEY==='k1')candidates.push(...k1ListingEvents(listing,S.listing,now).filter(eligible));if(KEY==='boxing')candidates.push(...ringListingEvents(listing,S.listing,now).filter(eligible));const uniq=new Map();for(const e of candidates){const k=`${eventSourceKey(e)}|${eventIdentityText(e.name)}|${new Date(e.startAt).getTime()}`;if(!uniq.has(k))uniq.set(k,e);}candidates=[...uniq.values()];if(!candidates.length){for(const u of links(listing,S.listing,S.detail).slice(0,16)){try{const html=await reqText(u,8);for(const e of jsonLdEvents(html,u)){const candidate=normalizeOneCompositeEvent({...e,source:u});if(eligible(candidate))candidates.push(candidate);}}catch(_){}}}candidates=candidates.filter(e=>eligible(e)).sort((a,b)=>new Date(a.startAt)-new Date(b.startAt));if(!candidates.length)return null;const ev=candidates[0];let html='';try{html=await reqText(ev.source,8);}catch(_){}const detailName=html?ufcDetailName(html):'',detailLoc=html?ufcDetailLocation(html):'',pairs=html?currentPagePairs(html,ev.source):[],images=html?sourceImageCandidates(html,ev.source,{...snap,...ev}):[];const fallbackMain={a:'対戦カード',b:'発表待ち',context:''};const main=pairs.length?mainFromBout({...snap,...ev,name:detailName||ev.name},pairs[0]):fallbackMain;const support=supportRowsFromPairs({...snap,...ev},pairs);return sanitizeEventFightContext({...snap,...ev,name:detailName||stripHTML(ev.name)||S.label,location:shortLoc(detailLoc||ev.location)||(KEY==='ufc'?'会場確認中':'会場未定'),main,support,cardTba:!pairs.length,posterURL:images[0]?.url||null,posterSource:images[0]?.source||'none',posterCandidates:images.slice(0,8),timeTba:!!ev.timeTba,displayDate:ev.displayDate||null,live:true,cardSourceType:'official-discovery'});}catch(_){return null;}}
function trustedRollforward(snap){const n=trustedFutureEvents().find(x=>rollforwardEligible(snap,x,Date.now()));if(!n)return null;const ev=normalizeOneCompositeEvent({...n}),hasCard=!!(ev.main?.a&&ev.main?.b);return {...snap,...ev,name:stripHTML(ev.name)||S.label,location:shortLoc(ev.location||'')||'会場未定',main:hasCard?{...ev.main,context:fightContext(ev.main?.context,ev.name)}:{a:'対戦カード',b:'発表待ち',context:''},support:hasCard?[...(ev.support||[])]:[],cardTba:hasCard?false:true,posterURL:null,posterCandidates:[],posterSource:'none',timeTba:!!ev.timeTba,displayDate:ev.displayDate||null,live:false,trustedNext:true};}
function boxingOfficialSource(e){return /^ringmagazine\.com(?:\/|$)/.test(eventSourceKey(e));}
function boxingPrefetchValid(snap,e,now=Date.now()){return KEY==='boxing'&&!!e&&boxingOfficialSource(e)&&rollforwardEligible(snap,e,now);}
function boxingVerifiedCache(cached,snap,now){if(KEY!=='boxing'||!cached?.data||cached?.verifiedBy!=='strictNextEvent'||!Number.isFinite(Number(cached?.verifiedAt)))return null;const data=normalizeOneCompositeEvent(cached.data);return boxingPrefetchValid(snap,data,now)?data:null;}
function boxingCurrentVerifiedCache(cached,snap){if(KEY!=='boxing'||!cached?.data||cached?.verifiedBy!=='refreshLockedCurrent'||!Number.isFinite(Number(cached?.verifiedAt)))return null;const data=normalizeOneCompositeEvent(cached.data);return currentLocked(snap)&&boxingOfficialSource(data)&&sameEventIdentity(data,snap)?data:null;}
async function prefetchBoxingVisual(data){if(KEY!=='boxing'||!boxingOfficialSource(data))return data;const p=await eventPosterResult(data,{localOnly:false});return{...data,posterURL:p.url||data.posterURL||null,posterSource:p.source||data.posterSource||'none',posterPrefetched:!!p.image};}
function safePendingEvent(now=Date.now(),lightweight=false){return{startAt:new Date(now+24*3600000).toISOString(),location:'会場未定',name:'次大会',main:{a:'次大会',b:'確認中',context:''},support:[],cardTba:true,posterURL:null,posterCandidates:[],posterSource:'none',source:null,timeTba:true,displayDate:'日程未定',nextPending:true,lightweightPending:!!lightweight,cacheVerified:false,cardSourceType:'safe-pending'};}
async function loadData(){
  const snap=sanitizeEventFightContext(normalizeOneCompositeEvent({...SNAPSHOT[KEY]})),now=Date.now(),path=cacheFile(`combat-hub-next-${KEY}.json`),cached=readJSON(path),cachedData=cached?.data?sanitizeEventFightContext(normalizeOneCompositeEvent(cached.data)):null;
  if(KEY==='boxing'){
    const currentPath=cacheFile('combat-hub-current-boxing.json'),currentCached=readJSON(currentPath),verifiedCurrent=boxingCurrentVerifiedCache(currentCached,snap),verifiedFuture=boxingVerifiedCache(cached,snap,now);
    if(config.runsInWidget){
      if(currentLocked(snap)){
        if(verifiedCurrent)return{...verifiedCurrent,lockedCurrent:true,prefetched:true,cacheVerified:true,cardSourceType:'verified-ring-current-cache',cardCheckedAt:Number(currentCached?.savedAt)||null,cardRefreshedAt:Number(currentCached?.verifiedAt)||null};
        return{...snap,lockedCurrent:true,cacheVerified:false,cardSourceType:'trusted-snapshot'};
      }
      if(verifiedFuture)return{...verifiedFuture,prefetched:true,cacheVerified:true,cardSourceType:'verified-ring-future-cache',cardCheckedAt:Number(cached?.savedAt)||null,cardRefreshedAt:Number(cached?.verifiedAt)||null};
      return safePendingEvent(now,true);
    }
    if(currentLocked(snap)){
      const current=await refreshLockedCurrent(snap),verified=await prefetchBoxingVisual({...current,lockedCurrent:true,cardSourceType:'official-ring-current'});
      writeJSON(currentPath,{savedAt:now,verifiedAt:now,verifiedBy:'refreshLockedCurrent',data:verified});return{...verified,prefetched:true,cacheVerified:true,cardCheckedAt:now,cardRefreshedAt:now};
    }
    const live=await strictNextEvent(snap);
    if(live&&boxingPrefetchValid(snap,live,now)){const verified=await prefetchBoxingVisual(live);writeJSON(path,{savedAt:now,verifiedAt:now,verifiedBy:'strictNextEvent',data:verified});return{...verified,prefetched:true,cacheVerified:true,cardCheckedAt:now,cardRefreshedAt:now};}
    if(verifiedFuture)return{...verifiedFuture,stale:true,prefetched:true,cacheVerified:true,cardSourceType:'verified-ring-future-cache',cardCheckedAt:Number(cached?.savedAt)||null,cardRefreshedAt:Number(cached?.verifiedAt)||null};
    return safePendingEvent(now,false);
  }
  if(currentLocked(snap)){const current=await refreshLockedCurrent(snap);if(!current.posterURL)current.posterURL=await cachedMetaImageURL(current.source,`${KEY}-event`,4*3600000);current.lockedCurrent=true;return current;}
  if(cachedData&&now-Number(cached.savedAt)<4*3600000&&rollforwardEligible(snap,cachedData,now)){const cardAge=now-Number(cached?.cardCheckedAt??cached?.cardRefreshedAt??0),cardDue=supportsLiveCardRefresh()&&(Number(cached?.cardPolicy)!==CARD_POLICY_VERSION||cardAge>=KNOWN_EVENT_CARD_REFRESH_MS);if(cardDue){const refreshed=await refreshKnownRollforwardEvent(cachedData),refAt=refreshed.cardRefreshed?now:Number(cached?.cardRefreshedAt)||0;writeJSON(path,{savedAt:Number(cached.savedAt)||now,cardCheckedAt:now,cardRefreshedAt:refAt,cardPolicy:CARD_POLICY_VERSION,data:refreshed});return{...refreshed,cardCheckedAt:now,cardRefreshedAt:refAt};}return{...cachedData,cardCheckedAt:Number(cached?.cardCheckedAt)||null,cardRefreshedAt:Number(cached?.cardRefreshedAt)||null};}
  const live=await strictNextEvent(snap);if(live&&rollforwardEligible(snap,live,now)){const refAt=live.cardTba?0:now;writeJSON(path,{savedAt:now,cardCheckedAt:now,cardRefreshedAt:refAt,cardPolicy:CARD_POLICY_VERSION,data:live});return{...live,cardCheckedAt:now,cardRefreshedAt:refAt};}
  const trusted=trustedRollforward(snap);if(trusted){const hydrated=supportsLiveCardRefresh()?await refreshKnownRollforwardEvent(trusted):trusted,refAt=hydrated.cardTba?0:now;writeJSON(path,{savedAt:now,cardCheckedAt:now,cardRefreshedAt:refAt,cardPolicy:CARD_POLICY_VERSION,data:hydrated});return{...hydrated,cardCheckedAt:now,cardRefreshedAt:refAt,cardSourceType:hydrated.cardSourceType||'trusted-snapshot'};}
  if(cachedData&&rollforwardEligible(snap,cachedData,now))return{...cachedData,stale:true,cardCheckedAt:Number(cached?.cardCheckedAt)||null,cardRefreshedAt:Number(cached?.cardRefreshedAt)||null};
  return safePendingEvent(now,false);
}

function trustedLargeNext(base){const n=trustedFutureEvents().find(x=>nextEligible(base,x,Date.now()));return n?normalizeOneCompositeEvent({...n}):null;}
async function loadLargeNext(base){const path=cacheFile(`combat-hub-large-next-${KEY}.json`),cached=readJSON(path),now=Date.now(),cachedData=cached?.data?normalizeOneCompositeEvent(cached.data):null;if(cachedData&&now-Number(cached.savedAt)<6*3600000&&nextEligible(base,cachedData,now))return cachedData;try{const listing=await reqText(S.listing,7),eligible=e=>nextEligible(base,e,now);let candidates=jsonLdEvents(listing,S.listing).map(normalizeOneCompositeEvent).filter(eligible);if(KEY==='ufc')candidates.push(...ufcListingEvents(listing,S.listing,Math.max(new Date(base.startAt).getTime()+6*3600000,now),now+180*86400000).filter(eligible));if(KEY==='k1')candidates.push(...k1ListingEvents(listing,S.listing,now).filter(eligible));const uniq=new Map();for(const e of candidates){const k=`${eventSourceKey(e)}|${eventIdentityText(e.name)}|${new Date(e.startAt).getTime()}`;if(!uniq.has(k))uniq.set(k,e);}candidates=[...uniq.values()].filter(eligible).sort((a,b)=>new Date(a.startAt)-new Date(b.startAt));if(!candidates.length){const deep=await strictNextEvent(base);if(deep&&eligible(deep)){const data={name:stripHTML(deep.name)||S.label,startAt:deep.startAt,location:shortLoc(deep.location||''),source:deep.source||S.listing,timeTba:!!deep.timeTba,displayDate:deep.displayDate||null};writeJSON(path,{savedAt:now,data});return data;}const trusted=trustedLargeNext(base);if(trusted){writeJSON(path,{savedAt:now,data:trusted});return trusted;}return cachedData&&eligible(cachedData)?cachedData:null;}const ev=candidates[0],data={name:stripHTML(ev.name)||S.label,startAt:ev.startAt,location:shortLoc(ev.location||''),source:ev.source||S.listing,timeTba:!!ev.timeTba,displayDate:ev.displayDate||null};writeJSON(path,{savedAt:now,data});return data;}catch(_){return trustedLargeNext(base)||(cachedData&&nextEligible(base,cachedData,now)?cachedData:null);}}



const KNOWN_UFC={NURMAGOMEDOV:'https://www.ufc.com/athlete/umar-nurmagomedov',SONG:'https://www.ufc.com/athlete/song-yadong',HOOKER:'https://www.ufc.com/athlete/dan-hooker',PARNASSE:'https://www.ufc.com/athlete/salahdine-parnasse',JEANSILVA:'https://www.ufc.com/athlete/jean-silva',JOSEMIGUELDELGADO:'https://www.ufc.com/athlete/jose-miguel-delgado'};
const KNOWN_RIZIN={'ラジャブアリ・シェイドゥラエフ':'https://jp.rizinff.com/_tags/%E3%83%A9%E3%82%B8%E3%83%A3%E3%83%96%E3%82%A2%E3%83%AA%E3%83%BB%E3%82%B7%E3%82%A7%E3%82%A4%E3%83%89%E3%82%A5%E3%83%A9%E3%82%A8%E3%83%95','AJ・マッキー':'https://jp.rizinff.com/_tags/AJ%E3%83%BB%E3%83%9E%E3%83%83%E3%82%AD%E3%83%BC'};
const KNOWN_K1={'金子晃大':'https://www.k-1.co.jp/fighter/716','璃明武':'https://www.k-1.co.jp/k-1wgp/fighter/856','ジョナス・サルシチャ':'https://www.k-1.co.jp/k-1wgp/fighter/1630','ゾーラ・アカピャン':'https://www.k-1.co.jp/k-1wgp/fighter/1451'};
function rizinImg(html,url,name){for(const tag of html.match(/<img\b[^>]*>/gi)||[]){const alt=stripHTML(attr(tag,'alt')||'');if(alt&&(alt.includes(name)||name.includes(alt))){const src=attr(tag,'data-src')||attr(tag,'data-original')||attr(tag,'src');if(src)return absoluteURL(src,url);}}return metaImage(html,url);}
function profileImageCandidates(html,url,name,kind){const out=[];if(kind==='rizin'){const x=rizinImg(html,url,name);if(x)addImageCandidate(out,x,'profile_alt',url);}for(const x of imageTagCandidates(html,url,({alt,hay})=>alt&&eventIdentityText(alt).includes(eventIdentityText(name))||/(?:athlete|fighter|profile|portrait)/i.test(hay),'profile_hero'))addImageCandidate(out,x.url,x.source,url);for(const x of jsonLdImageCandidates(html,url))addImageCandidate(out,x.url,x.source,url);for(const x of metaImageCandidates(html,url))addImageCandidate(out,x.url,x.source,url);return out;}
async function profileImage(url,name,kind,allowNetwork=true){if(!url)return{name,image:null,profileURL:null,imageURL:null,cacheHit:false};const path=cacheFile(`combat-profile-${kind}-${safeKey(url)}.json`),cached=readJSON(path),now=Date.now();if(cached?.imageURL&&now-Number(cached.savedAt)<12*3600000){const got=await cachedImageResult(cached.imageURL,kind,allowNetwork);if(got.image)return{name:cached.name||name,image:got.image,profileURL:url,imageURL:cached.imageURL,cacheHit:got.cacheHit};}
  let candidates=[],jp=cached?.name||name;try{if(allowNetwork){const h=await reqText(url,8);candidates=profileImageCandidates(h,url,name,kind);if(kind==='ufc'){try{const alt=url.includes('://www.ufc.com/')?url.replace('://www.ufc.com/','://jp.ufc.com/'):url;const j=await reqText(alt,8),m=j.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);if(m)jp=stripHTML(m[1])||jp;}catch(_){}}}}catch(_){}
  if(cached?.imageURL)addImageCandidate(candidates,cached.imageURL,'profile_cache',url);for(const c of candidates){const got=await cachedImageResult(c.url,kind,allowNetwork);if(got.image){writeJSON(path,{savedAt:now,imageURL:c.url,name:jp,source:c.source,policy:IMAGE_POLICY_VERSION});return{name:jp,image:got.image,profileURL:url,imageURL:c.url,cacheHit:got.cacheHit,imageSource:c.source};}}return{name:jp,image:null,profileURL:url,imageURL:null,cacheHit:false};}
function k1ImageRank(source){const v=String(source||'').toLowerCase();if(v==='poster_gallery')return 0;if(v==='event_hero')return 1;if(v==='jsonld')return 2;if(v==='og'||v==='twitter'||v==='meta_cache')return 3;return 4;}
function k1GenericArtworkURL(url){return /(?:^|[\/_-])(?:logo|favicon|icon|noimage|placeholder|loading)(?:[\/_\-.]|$)/i.test(String(url||''));}
async function eventPosterResult(D,{localOnly=false}={}){const candidates=[],attempted=new Set(),add=(url,source)=>{if(KEY==='k1'&&k1GenericArtworkURL(url))return;addImageCandidate(candidates,url,source||'data',D?.source);};if(D?.posterURL)add(D.posterURL,D.posterSource||'data');for(const c of (D?.posterCandidates||[]))add(c.url,c.source||'data');let last='no_candidate',sourceError='',sourceResolved=false;
  if(KEY==='k1'&&D?.source&&!localOnly&&!candidates.some(c=>c.source==='poster_gallery')){try{const h=await reqText(D.source,8);for(const c of sourceImageCandidates(h,D.source,D))add(c.url,c.source);sourceResolved=true;}catch(_){sourceError='source_fetch_failed';}}
  if(KEY==='k1')candidates.sort((a,b)=>k1ImageRank(a.source)-k1ImageRank(b.source));
  const tryCandidates=async allowNetwork=>{for(const c of candidates){if(attempted.has(c.url))continue;attempted.add(c.url);const got=await cachedImageResult(c.url,`${KEY}-event`,allowNetwork);if(got.image)return{image:got.image,url:c.url,source:c.source||'unknown',cacheHit:got.cacheHit,fallbackReason:null};last=got.error||'load_failed';}return null;};
  let hit=await tryCandidates(!localOnly);if(hit||localOnly)return hit||{image:null,url:candidates[0]?.url||null,source:candidates[0]?.source||'none',cacheHit:false,fallbackReason:last};
  if(D?.source){const cachedURL=await cachedMetaImageURL(D.source,`${KEY}-event`,4*3600000);if(cachedURL)add(cachedURL,'meta_cache');if(KEY==='k1')candidates.sort((a,b)=>k1ImageRank(a.source)-k1ImageRank(b.source));hit=await tryCandidates(true);if(hit)return hit;if(!sourceResolved){try{const h=await reqText(D.source,8);for(const c of sourceImageCandidates(h,D.source,D))add(c.url,c.source);sourceResolved=true;}catch(_){sourceError='source_fetch_failed';}}if(KEY==='k1')candidates.sort((a,b)=>k1ImageRank(a.source)-k1ImageRank(b.source));hit=await tryCandidates(true);if(hit)return hit;}
  return{image:null,url:candidates[0]?.url||null,source:candidates[0]?.source||'none',cacheHit:false,fallbackReason:sourceError||last};}
async function eventPoster(D,opts){return(await eventPosterResult(D,opts)).image;}
function ctxBase(a,b){return{a,b,poster:null,imageMode:'gradient',posterURLResolved:null,posterSource:'none',imageCacheHit:false,imageFallbackReason:null};}
async function heroContext(D){
  if(D?.nextPending){const a={name:D.main?.a||'次大会',image:null,profileURL:null},b={name:D.main?.b||'確認中',image:null,profileURL:null};return{...ctxBase(a,b),imageMode:'gradient',imageFallbackReason:'safe_pending'};}
  if(KEY==='ufc'){const au=D.main?.aProfileURL||KNOWN_UFC[norm(D.main.a)],bu=D.main?.bProfileURL||KNOWN_UFC[norm(D.main.b)],a=await profileImage(au,D.main.a,'ufc'),b=await profileImage(bu,D.main.b,'ufc');if(a.image&&b.image)return{...ctxBase(a,b),imageMode:'fighter_pair',imageCacheHit:!!a.cacheHit&&!!b.cacheHit};const p=await eventPosterResult(D);if(p.image)return{...ctxBase(a,b),poster:p.image,imageMode:'event_poster',posterURLResolved:p.url,posterSource:p.source,imageCacheHit:p.cacheHit};return{...ctxBase(a,b),imageMode:a.image||b.image?'fighter_partial':'gradient',imageFallbackReason:p.fallbackReason};}
  if(KEY==='rizin'){const au=D.main?.aProfileURL||KNOWN_RIZIN[D.main.a],bu=D.main?.bProfileURL||KNOWN_RIZIN[D.main.b],a=await profileImage(au,D.main.a,'rizin'),b=await profileImage(bu,D.main.b,'rizin');if(a.image&&b.image)return{...ctxBase(a,b),imageMode:'fighter_pair',imageCacheHit:!!a.cacheHit&&!!b.cacheHit};const p=await eventPosterResult(D);return p.image?{...ctxBase(a,b),poster:p.image,imageMode:'event_poster',posterURLResolved:p.url,posterSource:p.source,imageCacheHit:p.cacheHit}:{...ctxBase(a,b),imageMode:a.image||b.image?'fighter_partial':'gradient',imageFallbackReason:p.fallbackReason};}
  if(KEY==='k1'){const p=await eventPosterResult(D);if(p.image)return{...ctxBase({name:D.main.a,image:null,profileURL:D.main?.aProfileURL||null},{name:D.main.b,image:null,profileURL:D.main?.bProfileURL||null}),poster:p.image,imageMode:'event_poster',posterURLResolved:p.url,posterSource:p.source,imageCacheHit:p.cacheHit};const au=D.main?.aProfileURL||KNOWN_K1[D.main.a],bu=D.main?.bProfileURL||KNOWN_K1[D.main.b],a=await profileImage(au,D.main.a,'k1'),b=await profileImage(bu,D.main.b,'k1');return{...ctxBase(a,b),imageMode:a.image&&b.image?'fighter_pair':a.image||b.image?'fighter_partial':'gradient',imageCacheHit:!!a.cacheHit&&!!b.cacheHit,imageFallbackReason:p.fallbackReason};}
  if(KEY==='boxing'){const p=await eventPosterResult(D,{localOnly:config.runsInWidget});const a={name:D.main.a,image:null,profileURL:null},b={name:D.main.b,image:null,profileURL:null};return p.image?{...ctxBase(a,b),poster:p.image,imageMode:config.runsInWidget?'cached_poster':'event_poster',posterURLResolved:p.url,posterSource:D.cacheVerified?'ring_verified':p.source,imageCacheHit:p.cacheHit,lightweight:true}:{...ctxBase(a,b),imageMode:'gradient',imageFallbackReason:p.fallbackReason,lightweight:true};}
  const p=await eventPosterResult(D),a={name:D.main.a,image:null,profileURL:D.main?.aProfileURL||null},b={name:D.main.b,image:null,profileURL:D.main?.bProfileURL||null};return p.image?{...ctxBase(a,b),poster:p.image,imageMode:'event_poster',posterURLResolved:p.url,posterSource:p.source,imageCacheHit:p.cacheHit}:{...ctxBase(a,b),imageMode:'gradient',imageFallbackReason:p.fallbackReason};
}
function writeRuntimeAudit(D,ctx){try{writeJSON(cacheFile('combat-hub-runtime-audit.json'),{savedAt:Date.now(),version:VERSION,loaderVersion:typeof LOADER_VERSION!=='undefined'?LOADER_VERSION:null,key:KEY,widgetFamily:config.widgetFamily||null,nextPending:!!D.nextPending,lightweightPending:!!D.lightweightPending,cardTba:!!D.cardTba,lockedCurrent:!!D.lockedCurrent,prefetched:!!D.prefetched,cacheVerified:!!D.cacheVerified,name:D.name||null,source:D.source||null,imageMode:ctx?.imageMode||'gradient',posterURLResolved:ctx?.posterURLResolved||null,posterSource:ctx?.posterSource||'none',posterLoaded:!!ctx?.poster,aProfileURL:ctx?.a?.profileURL||D.main?.aProfileURL||null,bProfileURL:ctx?.b?.profileURL||D.main?.bProfileURL||null,aImageLoaded:!!ctx?.a?.image,bImageLoaded:!!ctx?.b?.image,imageCacheHit:!!ctx?.imageCacheHit,imageFallbackReason:ctx?.imageFallbackReason||null,cardSourceType:D.cardSourceType||null,cardCheckedAt:D.cardCheckedAt||null,cardRefreshedAt:D.cardRefreshedAt||null});}catch(_){}}

function imageRect(image,x,width,side){if(!image?.size)return new Rect(x,0,width,338);const iw=image.size.width,ih=image.size.height,scale=Math.max(width/iw,338/ih),dw=iw*scale,dh=ih*scale,bias=side==='left'?.03:.97;return new Rect(x+(width-dw)*bias,(338-dh)/2-28,dw,dh);}
function softBand(c,y0,y1,alpha,feather=22){const h=Math.max(1,y1-y0),f=Math.min(feather,Math.floor(h/2)),step=4;if(h>2*f){c.setFillColor(new Color('#000000',alpha));c.fillRect(new Rect(0,y0+f,720,h-2*f));}for(let y=0;y<f;y+=step){const p=Math.min(1,(y+step/2)/f),hh=Math.min(step,f-y);c.setFillColor(new Color('#000000',alpha*p));c.fillRect(new Rect(0,y0+y,720,hh));c.setFillColor(new Color('#000000',alpha*(1-p)));c.fillRect(new Rect(0,y1-f+y,720,hh));}}
function softCenter(c,color,alpha){const bands=[84,60,40,24,10];for(let i=0;i<bands.length;i++){const w=bands[i],a=alpha*((i+1)/bands.length)*.34;c.setFillColor(new Color(color,a));c.fillRect(new Rect(360-w/2,0,w,338));}}
function boxingCenterBand(c){if(KEY!=='boxing')return;const bands=[190,158,126,96,68];for(let i=0;i<bands.length;i++){const w=bands[i],a=.050+i*.022;c.setFillColor(new Color('#000000',a));c.fillRect(new Rect(360-w/2,64,w,236));}}
function heroBg(a,b){const c=new DrawContext();c.size=new Size(720,338);c.opaque=true;c.respectScreenScale=false;c.setFillColor(new Color('#040506'));c.fillRect(new Rect(0,0,720,338));if(a)c.drawImageInRect(a,imageRect(a,-5,KEY==='k1'?370:360,'left'));if(b)c.drawImageInRect(b,imageRect(b,KEY==='k1'?350:365,KEY==='k1'?375:360,'right'));c.setFillColor(new Color('#000000',V.heroShade));c.fillRect(new Rect(0,0,720,338));if(KEY==='k1'){c.setFillColor(new Color(S.accent,.045));c.fillRect(new Rect(0,0,720,338));}softBand(c,0,112,V.headerShade,24);softBand(c,96,232,V.mainShade,24);softBand(c,214,338,V.footShade,24);boxingCenterBand(c);softCenter(c,S.accent,V.veil);return c.getImage();}
function posterBg(image){const c=new DrawContext();c.size=new Size(720,338);c.opaque=true;c.respectScreenScale=false;c.setFillColor(new Color('#050609'));c.fillRect(new Rect(0,0,720,338));if(image?.size){const iw=image.size.width,ih=image.size.height,scale=Math.max(720/iw,338/ih),dw=iw*scale,dh=ih*scale;c.drawImageInRect(image,new Rect((720-dw)/2,(338-dh)/2,dw,dh));}c.setFillColor(new Color('#000000',V.posterShade));c.fillRect(new Rect(0,0,720,338));if(KEY==='k1'){c.setFillColor(new Color(S.accent,.028));c.fillRect(new Rect(0,0,720,338));}softBand(c,0,112,V.headerShade,24);softBand(c,96,232,V.mainShade,24);softBand(c,214,338,V.footShade,24);boxingCenterBand(c);softCenter(c,S.accent,V.veil);return c.getImage();}
function smallCropRect(image,x,width){if(!image?.size)return new Rect(x,0,width,338);const iw=image.size.width,ih=image.size.height,scale=Math.max(width/iw,338/ih),dw=iw*scale,dh=ih*scale;return new Rect(x+(width-dw)/2,(338-dh)/2,dw,dh);}
function smallHeroBg(a,b){const c=new DrawContext();c.size=new Size(338,338);c.opaque=true;c.respectScreenScale=false;c.setFillColor(new Color('#040506'));c.fillRect(new Rect(0,0,338,338));if(a)c.drawImageInRect(a,smallCropRect(a,0,176));if(b)c.drawImageInRect(b,smallCropRect(b,162,176));c.setFillColor(new Color('#000000',Math.min(.82,V.heroShade+.07)));c.fillRect(new Rect(0,0,338,338));c.setFillColor(new Color(S.accent,.055));c.fillRect(new Rect(0,0,338,2));c.setFillColor(new Color('#000000',.18));c.fillRect(new Rect(0,224,338,114));return c.getImage();}
function smallPosterBg(image){const c=new DrawContext();c.size=new Size(338,338);c.opaque=true;c.respectScreenScale=false;c.setFillColor(new Color('#050609'));c.fillRect(new Rect(0,0,338,338));if(image?.size)c.drawImageInRect(image,smallCropRect(image,0,338));c.setFillColor(new Color('#000000',Math.min(.86,V.posterShade+.14)));c.fillRect(new Rect(0,0,338,338));c.setFillColor(new Color(S.accent,.055));c.fillRect(new Rect(0,0,338,2));c.setFillColor(new Color('#000000',.20));c.fillRect(new Rect(0,224,338,114));return c.getImage();}
function gradient(){const g=new LinearGradient();g.startPoint=new Point(0,0);g.endPoint=new Point(1,1);g.colors=[new Color('#050609'),new Color(S.accent,.14)];g.locations=[0,1];return g;}
function dateOnly(d){const f=new DateFormatter();f.locale='ja_JP';f.timeZone='Asia/Tokyo';f.dateFormat='M/d (E)';return f.string(new Date(d));}
function dateText(D){if(D.timeTba)return`${D.displayDate||dateOnly(D.startAt)} ・ 時刻未定`;const f=new DateFormatter();f.locale='ja_JP';f.timeZone='Asia/Tokyo';f.dateFormat="M/d (E) HH:mm 'JST'";return f.string(new Date(D.startAt));}
function statusLabel(D){if(D.timeTba)return'開催';const q=new Date(D.startAt)-Date.now();return q>0?'開催まで':'ステータス';}
function countdown(D){if(D.timeTba)return'時刻未定';const q=new Date(D.startAt)-Date.now();if(q<=0){if(D.nextPending)return'確認中';const elapsed=-q;return elapsed>=6*3600000?'終了':'開催中';}const m=Math.floor(q/60000),days=Math.floor(m/1440),h=Math.floor((m%1440)/60),mm=m%60;if(days>0)return`${days}日 ${h}時間`;if(h>0)return`${h}時間 ${mm}分`;return`${mm}分`;}
function division(s){const v=String(s||''),title=/タイトル|TITLE|CHAMPIONSHIP/i.test(v);if(/FLY|フライ/i.test(v))return title?'フライ級タイトル戦':'フライ級';if(/FEATHER|フェザー/i.test(v))return title?'フェザー級タイトル戦':'フェザー級';if(/BANTAM|バンタム/i.test(v))return/スーパー|SUPER/i.test(v)?'スーパー・バンタム級':title?'バンタム級タイトル戦':'バンタム級';if(/STRAW|ストロー/i.test(v))return title?'ストロー級タイトル戦':'ストロー級';if(/LIGHT HEAVY|ライトヘビー/i.test(v))return title?'ライトヘビー級タイトル戦':'ライトヘビー級';if(/HEAVY|ヘビー/i.test(v))return title?'ヘビー級タイトル戦':'ヘビー級';if(/MIDDLE|ミドル/i.test(v))return title?'ミドル級タイトル戦':'ミドル級';if(/WELTER|ウェルター/i.test(v))return title?'ウェルター級タイトル戦':'ウェルター級';if(/LIGHT|ライト/i.test(v))return title?'ライト級タイトル戦':'ライト級';return v.length>25?v.slice(0,24)+'…':v;}
function supportFont(s){const n=[...String(s||'')].length;return n>13?8.7:n>10?9.2:9.8;}
function mainNameParts(s){const v=String(s||'');if(KEY!=='rizin'||[...v].length<=12)return[v];const chars=[...v],mid=Math.floor(chars.length/2),seps=['・',' ','-','‐','–'];let best=-1,dist=Infinity;chars.forEach((ch,i)=>{if(!seps.includes(ch))return;const d=Math.abs(i-mid);if(d<dist){best=i;dist=d;}});if(best>1&&best<chars.length-2)return[chars.slice(0,best+1).join(''),chars.slice(best+1).join('')];return[chars.slice(0,mid).join(''),chars.slice(mid).join('')];}
function renderMainName(box,name){const parts=mainNameParts(jpDisplay(name));for(const part of parts){const t=tx(box,part,V.mainSize,new Color(C.text),'black',1);if(KEY==='rizin'&&parts.length>1)t.minimumScaleFactor=.86;t.centerAlignText();}return parts;}
function supportRow(w,row){const s=w.addStack();s.centerAlignContent();const l=s.addStack();l.size=new Size(65,0);tx(l,jpCardLabel(row.label),7.1,new Color(S.accent),'bold');s.addSpacer(4);const a=s.addStack();a.size=new Size(116,0);tx(a,jpDisplay(row.a),supportFont(jpDisplay(row.a)),new Color(C.text),'semibold');s.addSpacer(4);tx(s,'VS',7.1,new Color(S.accent),'bold');s.addSpacer(4);const b=s.addStack();b.size=new Size(116,0);const bt=tx(b,jpDisplay(row.b),supportFont(jpDisplay(row.b)),new Color(C.text),'semibold');bt.rightAlignText();}

function largePortraitSlot(image,side){const W=360,H=520,c=new DrawContext();c.size=new Size(W,H);c.opaque=false;c.respectScreenScale=false;if(!image?.size)return c.getImage();const iw=image.size.width,ih=image.size.height,scale=Math.max(W/iw,H/ih),dw=iw*scale,dh=ih*scale,x=(W-dw)/2,y=(H-dh)/2-6;c.drawImageInRect(image,new Rect(x,y,dw,dh));return c.getImage();}
function largeBackground(ctx){const c=new DrawContext();c.size=new Size(720,756);c.opaque=true;c.respectScreenScale=false;c.setFillColor(new Color('#020305'));c.fillRect(new Rect(0,0,720,756));if(ctx.poster?.size){const iw=ctx.poster.size.width,ih=ctx.poster.size.height,scale=Math.max(720/iw,520/ih),dw=iw*scale,dh=ih*scale;c.drawImageInRect(ctx.poster,new Rect((720-dw)/2,(520-dh)/2,dw,dh));}else{if(ctx.a.image)c.drawImageInRect(largePortraitSlot(ctx.a.image,'left'),new Rect(0,0,360,520));if(ctx.b.image)c.drawImageInRect(largePortraitSlot(ctx.b.image,'right'),new Rect(360,0,360,520));}const veil=.64;c.setFillColor(new Color('#000000',veil));c.fillRect(new Rect(0,0,720,520));softBand(c,0,118,.16,28);softBand(c,250,520,.18,36);for(let i=0;i<160;i++){const p=i/159,a=.08+Math.pow(p,1.7)*.91;c.setFillColor(new Color('#020305',Math.min(.995,a)));c.fillRect(new Rect(0,388+i,720,1));}c.setFillColor(new Color('#020305',.995));c.fillRect(new Rect(0,548,720,208));c.setFillColor(new Color(S.accent,.12));c.fillRect(new Rect(30,0,660,1));c.setFillColor(new Color(S.accent,.10));c.fillRect(new Rect(48,548,624,1));return c.getImage();}
function largeMiniPoster(image){if(!image?.size)return null;const W=210,H=224,c=new DrawContext();c.size=new Size(W,H);c.opaque=true;c.respectScreenScale=false;c.setFillColor(new Color('#07090D'));c.fillRect(new Rect(0,0,W,H));const iw=image.size.width,ih=image.size.height,scale=Math.max(W/iw,H/ih),dw=iw*scale,dh=ih*scale;c.drawImageInRect(image,new Rect((W-dw)/2,(H-dh)/2,dw,dh));c.setFillColor(new Color('#000000',.78));c.fillRect(new Rect(0,0,W,H));return c.getImage();}
function largeNameParts(s){const v=String(s||'').trim(),chars=[...v];if(chars.length<=13)return[v];const mid=Math.floor(chars.length/2),seps=['・',' ','-','‐','–','／','/'];let best=-1,dist=Infinity;chars.forEach((ch,i)=>{if(!seps.includes(ch)||i<=2||i>=chars.length-3)return;const d=Math.abs(i-mid);if(d<dist){best=i;dist=d;}});if(best>=0)return[chars.slice(0,best+1).join('').trim(),chars.slice(best+1).join('').trim()].filter(Boolean);return[chars.slice(0,mid).join(''),chars.slice(mid).join('')];}
function largeSlotName(name){return largeNameParts(jpDisplay(name)).join('\n');}
function renderLargeMainName(box,name){const parts=largeNameParts(jpDisplay(name));for(const part of parts){const t=tx(box,part,LARGE_UI.main,new Color(C.text),'black',1);t.minimumScaleFactor=.72;t.centerAlignText();}return parts;}
function largeFightRow(st,row){const block=st.addStack();block.layoutVertically();const lab=block.addStack();const lt=tx(lab,jpCardLabel(row.label),LARGE_UI.fightLabel,new Color(S.accent),'bold');lt.minimumScaleFactor=.78;lab.addSpacer();block.addSpacer(2);const r=block.addStack();r.centerAlignContent();const aa=r.addStack();aa.size=new Size(78,0);const at=tx(aa,largeSlotName(row.a),LARGE_UI.fightName,new Color(C.text),'semibold',2);at.minimumScaleFactor=.76;r.addSpacer(4);tx(r,'VS',LARGE_UI.fightLabel,new Color(S.accent),'bold');r.addSpacer(4);const bb=r.addStack();bb.size=new Size(78,0);const bt=tx(bb,largeSlotName(row.b),LARGE_UI.fightName,new Color(C.text),'semibold',2);bt.minimumScaleFactor=.76;bt.rightAlignText();}
function largeNextTitle(next){return jpDisplay(next?.name||'次大会').replace(/^Crypto\.com\s+/i,'');}
function largeNextMeta(next){if(!next)return'';const d=next.timeTba?dateOnly(next.startAt):dateText(next);const loc=shortLoc(next.location||'');return loc?`${d}\n${loc}`:d;}
function largeStatusHeading(D){if(D?.timeTba)return'開催まで';const t=new Date(D?.startAt||0).getTime();if(!Number.isFinite(t)||t<=0)return'開催まで';return t>Date.now()?'開催まで':'開催状況';}
function largeStatusDate(D){if(D?.nextPending)return'日程未定';if(D?.displayDate)return String(D.displayDate);const t=new Date(D?.startAt||0).getTime();if(!Number.isFinite(t)||t<=0)return'日程未定';return D.timeTba?dateOnly(D.startAt):dateText(D);}
function largeStatusLocation(D){if(D?.nextPending)return'会場未定';const loc=shortLoc(D?.location||'');return loc||'会場未定';}
function largeRightText(st,text,size,color,weight='semibold'){const row=st.addStack();row.addSpacer();const t=tx(row,text,size,color,weight,1);t.minimumScaleFactor=.70;t.rightAlignText();return t;}
function renderLarge(w,D,ctx,next,nextPoster){
  const pending=!!D.cardTba;
  const h=w.addStack();h.centerAlignContent();
  const hl=h.addStack();hl.layoutVertically();hl.size=new Size(LARGE_UI.headerW,0);
  tx(hl,S.label,LARGE_UI.org,new Color(C.text),'black');
  hl.addSpacer(2);
  const en=tx(hl,jpDisplay(D.name||''),LARGE_UI.event,new Color(S.accent),'bold',2);en.minimumScaleFactor=.76;
  h.addSpacer(8);
  const status=h.addStack();status.layoutVertically();status.size=new Size(LARGE_UI.statusW,0);
  largeRightText(status,largeStatusHeading(D),LARGE_UI.status,new Color(C.muted),'bold');
  status.addSpacer(3);
  const badgeRow=status.addStack();badgeRow.addSpacer();const badge=badgeRow.addStack();badge.backgroundColor=new Color('#05070B',.72);badge.cornerRadius=11;badge.borderWidth=.7;badge.borderColor=new Color(S.accent,.36);badge.setPadding(5,10,5,10);const cdt=tx(badge,countdown(D),LARGE_UI.countdown,new Color(C.text),'black');cdt.minimumScaleFactor=.78;
  status.addSpacer(4);
  largeRightText(status,largeStatusDate(D),LARGE_UI.statusDate,new Color(C.sub),'semibold');
  status.addSpacer(2);
  largeRightText(status,largeStatusLocation(D),LARGE_UI.statusLoc,new Color(C.sub),'semibold');
  w.addSpacer(LARGE_UI.heroGap);
  if(pending)w.addSpacer(LARGE_UI.pendingOffset);
  if(pending){
    const center=w.addStack();center.layoutVertically();
    const title=tx(center,D.nextPending?'次大会情報を確認中':'対戦カード発表待ち',LARGE_UI.pending,new Color(C.text),'black');title.centerAlignText();
    center.addSpacer(7);
    const sub=tx(center,jpDisplay(D.name||D.main.context),LARGE_UI.pendingSub,new Color(S.accent),'semibold',2);sub.minimumScaleFactor=.76;sub.centerAlignText();
  }else{
    const tag=w.addStack();tag.addSpacer();const tagText=tx(tag,'メインイベント',LARGE_UI.heroLabel,new Color(S.accent),'bold');tagText.centerAlignText();tag.addSpacer();
    w.addSpacer(4);
    const main=w.addStack();main.centerAlignContent();main.addSpacer();
    const aBox=main.addStack();aBox.layoutVertically();aBox.size=new Size(132,46);aBox.addSpacer();renderLargeMainName(aBox,ctx.a.name);aBox.addSpacer();
    main.addSpacer(5);
    const center=main.addStack();center.layoutVertically();center.size=new Size(42,46);center.addSpacer();const vs=tx(center,'VS',LARGE_UI.vs,new Color(S.accent),'black');vs.centerAlignText();center.addSpacer();
    main.addSpacer(5);
    const bBox=main.addStack();bBox.layoutVertically();bBox.size=new Size(132,46);bBox.addSpacer();renderLargeMainName(bBox,ctx.b.name);bBox.addSpacer();main.addSpacer();
    w.addSpacer(5);
    const dv=tx(w,division(D.main.context),LARGE_UI.division,new Color('#D8DCE2'),'semibold');dv.centerAlignText();
  }
  w.addSpacer();
  const rows=(D.support||[]).slice(0,2),dashHeight=LARGE_UI.dashH;
  const dash=w.addStack();dash.size=new Size(328,dashHeight);dash.backgroundColor=new Color('#05070B',.91);dash.cornerRadius=16;dash.borderWidth=.8;dash.borderColor=new Color('#FFFFFF',.11);dash.setPadding(10,10,10,10);
  const left=dash.addStack();left.layoutVertically();left.size=new Size(LARGE_UI.leftW,dashHeight-20);
  const cap=left.addStack();const accent=cap.addStack();accent.size=new Size(22,4);accent.backgroundColor=new Color(S.accent);accent.cornerRadius=2;cap.addSpacer();
  left.addSpacer(7);
  const ltitle=left.addStack();tx(ltitle,'対戦カード',LARGE_UI.section,new Color(S.accent),'bold');ltitle.addSpacer();
  left.addSpacer(8);
  if(rows.length){rows.forEach((row,i)=>{largeFightRow(left,row);if(i<rows.length-1){left.addSpacer(6);const sep=left.addStack();sep.size=new Size(0,1);sep.backgroundColor=new Color('#FFFFFF',.07);left.addSpacer(6);}});}
  else{left.addSpacer(17);const em=tx(left,'追加カード発表待ち',9.2,new Color(C.muted),'semibold');em.centerAlignText();}
  dash.addSpacer(6);const rule=dash.addStack();rule.size=new Size(1,120);rule.backgroundColor=new Color('#FFFFFF',.09);dash.addSpacer(6);
  const right=dash.addStack();right.layoutVertically();right.size=new Size(LARGE_UI.rightW,130);right.cornerRadius=12;right.backgroundColor=new Color('#090C12',.98);right.borderWidth=.6;right.borderColor=new Color(S.accent,.16);right.setPadding(8,8,8,8);
  const ncap=right.addStack();tx(ncap,'次大会',LARGE_UI.nextLabel,new Color(S.accent),'bold');ncap.addSpacer();
  if(next){right.addSpacer(7);const nn=tx(right,largeNextTitle(next),LARGE_UI.nextTitle,new Color(C.text),'bold',2);nn.minimumScaleFactor=.74;right.addSpacer(7);const nm=tx(right,largeNextMeta(next),LARGE_UI.nextMeta,new Color(C.sub),'semibold',2);nm.minimumScaleFactor=.74;right.addSpacer();const nt=tx(right,'あと '+countdown(next),LARGE_UI.nextCountdown,new Color(S.accent),'bold');nt.minimumScaleFactor=.72;}
  else{right.addSpacer(15);const wait=tx(right,'公式情報を確認中',LARGE_UI.nextMeta,new Color(C.muted),'semibold',3);wait.minimumScaleFactor=.76;right.addSpacer();}
  w.addSpacer(2);
}

function smallStatusHeading(D){if(D?.nextPending||D?.timeTba)return'開催';const t=new Date(D?.startAt||0).getTime();if(!Number.isFinite(t)||t<=0)return'開催';return t>Date.now()?'開催まで':'開催状況';}
function smallCountdown(D){if(D?.nextPending)return'確認中';if(D?.timeTba)return'時刻未定';const q=new Date(D?.startAt||0).getTime()-Date.now();if(!Number.isFinite(q))return'確認中';if(q<=0)return q>-6*3600000?'開催中':'終了';if(q>=86400000)return'あと'+Math.max(1,Math.ceil(q/86400000))+'日';return'あと'+Math.max(1,Math.ceil(q/3600000))+'時間';}
function smallDate(D){if(D?.nextPending)return'日程未定';if(D?.displayDate)return String(D.displayDate);const t=new Date(D?.startAt||0).getTime();return Number.isFinite(t)?dateOnly(D.startAt):'日程未定';}
function smallLocation(D){if(D?.nextPending)return'会場未定';return shortLoc(D?.location||'')||'会場未定';}
function smallName(st,name){const t=tx(st,jpDisplay(name),SMALL_UI.main,new Color(C.text),'black',1);t.minimumScaleFactor=.54;t.centerAlignText();return t;}
function renderSmall(w,D,ctx){
  const pending=!!D.cardTba;
  const top=w.addStack();top.centerAlignContent();
  const left=top.addStack();left.layoutVertically();left.size=new Size(86,0);
  tx(left,S.label,SMALL_UI.org,new Color(C.text),'black');
  const right=top.addStack();right.layoutVertically();right.size=new Size(48,0);
  const state=tx(right,smallStatusHeading(D),SMALL_UI.status,new Color(C.muted),'bold',1);state.rightAlignText();
  right.addSpacer(1);
  const cd=tx(right,smallCountdown(D),SMALL_UI.countdown,new Color(S.accent),'black',1);cd.minimumScaleFactor=.64;cd.rightAlignText();
  w.addSpacer(3);
  const ev=tx(w,jpDisplay(D.name||S.label),SMALL_UI.event,new Color(C.sub),'semibold',2);ev.minimumScaleFactor=.60;ev.centerAlignText();
  w.addSpacer(7);
  if(pending){
    const title=tx(w,D.nextPending?'次大会情報\n確認中':'対戦カード\n発表待ち',SMALL_UI.pending,new Color(C.text),'black',2);title.minimumScaleFactor=.72;title.centerAlignText();
    w.addSpacer(4);
    const sub=tx(w,D.nextPending?'公式発表を待機中':'公式カード更新待ち',SMALL_UI.pendingSub,new Color(S.accent),'semibold',1);sub.minimumScaleFactor=.70;sub.centerAlignText();
  }else{
    const lab=tx(w,'メインイベント',SMALL_UI.mainLabel,new Color(S.accent),'bold',1);lab.centerAlignText();
    w.addSpacer(2);
    smallName(w,ctx.a.name);
    const vs=tx(w,'VS',SMALL_UI.vs,new Color(S.accent),'black',1);vs.centerAlignText();
    smallName(w,ctx.b.name);
    const dv=tx(w,division(D.main.context||trustedMainContext(D)),SMALL_UI.division,new Color(C.sub),'semibold',1);dv.minimumScaleFactor=.58;dv.centerAlignText();
  }
  w.addSpacer();
  const meta=w.addStack();meta.layoutVertically();
  const dt=tx(meta,smallDate(D),SMALL_UI.meta,new Color(C.sub),'semibold',1);dt.centerAlignText();
  meta.addSpacer(1);
  const loc=tx(meta,smallLocation(D),SMALL_UI.meta,new Color(C.sub),'semibold',1);loc.minimumScaleFactor=.64;loc.centerAlignText();
}

function mediumRightText(st,text,size,color,weight='semibold'){const row=st.addStack();row.addSpacer();const t=tx(row,text,size,color,weight,1);t.minimumScaleFactor=.68;t.rightAlignText();return t;}
function renderMediumMainName(box,name){const parts=largeNameParts(jpDisplay(name));for(const part of parts){const t=tx(box,part,MEDIUM_UI.main,new Color(C.text),'black',1);t.minimumScaleFactor=.68;t.centerAlignText();}return parts;}
function mediumSupportRow(w,row){const r=w.addStack();r.centerAlignContent();const l=r.addStack();l.size=new Size(58,0);const lt=tx(l,jpCardLabel(row.label),MEDIUM_UI.supportLabel,new Color(S.accent),'bold');lt.minimumScaleFactor=.72;r.addSpacer(4);const a=r.addStack();a.size=new Size(112,0);const at=tx(a,jpDisplay(row.a),MEDIUM_UI.supportName,new Color(C.text),'semibold',1);at.minimumScaleFactor=.62;r.addSpacer(4);tx(r,'VS',MEDIUM_UI.supportLabel,new Color(S.accent),'bold');r.addSpacer(4);const b=r.addStack();b.size=new Size(112,0);const bt=tx(b,jpDisplay(row.b),MEDIUM_UI.supportName,new Color(C.text),'semibold',1);bt.minimumScaleFactor=.62;bt.rightAlignText();}
function renderMedium(w,D,ctx){
  const pending=!!D.cardTba;
  const h=w.addStack();h.centerAlignContent();
  const hl=h.addStack();hl.layoutVertically();hl.size=new Size(MEDIUM_UI.headerW,0);
  tx(hl,S.label,MEDIUM_UI.org,new Color(C.text),'black');
  hl.addSpacer(2);
  const en=tx(hl,jpDisplay(D.name||''),MEDIUM_UI.event,new Color(S.accent),'bold',2);en.minimumScaleFactor=.70;
  h.addSpacer(6);
  const status=h.addStack();status.layoutVertically();status.size=new Size(MEDIUM_UI.statusW,0);
  mediumRightText(status,largeStatusHeading(D),MEDIUM_UI.status,new Color(C.muted),'bold');
  status.addSpacer(2);
  const cdr=status.addStack();cdr.addSpacer();const cdt=tx(cdr,countdown(D),MEDIUM_UI.countdown,new Color(C.text),'black');cdt.minimumScaleFactor=.74;cdt.rightAlignText();
  status.addSpacer(2);
  mediumRightText(status,largeStatusDate(D),MEDIUM_UI.statusDate,new Color(C.sub),'semibold');
  status.addSpacer(1);
  mediumRightText(status,largeStatusLocation(D),MEDIUM_UI.statusLoc,new Color(C.sub),'semibold');
  w.addSpacer(MEDIUM_UI.heroGap);
  if(pending){
    const center=w.addStack();center.layoutVertically();
    const title=tx(center,D.nextPending?'次大会情報を確認中':'対戦カード発表待ち',MEDIUM_UI.pending,new Color(C.text),'black',1);title.minimumScaleFactor=.76;
    center.addSpacer(5);
    const sub=tx(center,D.nextPending?'公式発表を待機中':'公式カード更新待ち',MEDIUM_UI.pendingSub,new Color(S.accent),'semibold',1);sub.minimumScaleFactor=.76;
    w.addSpacer();
    const foot=w.addStack();foot.addSpacer();tx(foot,'公式更新を自動反映',MEDIUM_UI.status,new Color(C.muted),'semibold');foot.addSpacer();
  }else{
    const main=w.addStack();main.centerAlignContent();main.addSpacer();
    const aBox=main.addStack();aBox.layoutVertically();aBox.size=new Size(132,40);aBox.addSpacer();renderMediumMainName(aBox,ctx.a.name);aBox.addSpacer();
    main.addSpacer(4);
    const centerBox=main.addStack();centerBox.layoutVertically();centerBox.size=new Size(44,40);centerBox.addSpacer();const mt=tx(centerBox,'メイン',MEDIUM_UI.mainLabel,new Color(S.accent),'bold');mt.centerAlignText();centerBox.addSpacer(1);const v=tx(centerBox,'VS',MEDIUM_UI.vs,new Color(S.accent),'black');v.centerAlignText();centerBox.addSpacer();
    main.addSpacer(4);
    const bBox=main.addStack();bBox.layoutVertically();bBox.size=new Size(132,40);bBox.addSpacer();renderMediumMainName(bBox,ctx.b.name);bBox.addSpacer();
    main.addSpacer();
    w.addSpacer(3);const dv=tx(w,division(D.main.context),MEDIUM_UI.division,new Color('#C5CBD3'),'semibold');dv.centerAlignText();
    w.addSpacer(5);divider(w);w.addSpacer(4);
    if(D.support?.length){D.support.slice(0,2).forEach((row,i)=>{mediumSupportRow(w,row);if(i<Math.min(2,D.support.length)-1)w.addSpacer(4);});}
    else{const empty=w.addStack();empty.addSpacer();tx(empty,KEY==='boxing'?'前座カード発表待ち':'追加カード発表待ち',MEDIUM_UI.supportName,new Color(C.muted),'semibold');empty.addSpacer();}
  }
}

const D=await loadData(),ctx=await heroContext(D);writeRuntimeAudit(D,ctx);const w=new ListWidget();const IS_LARGE=config.widgetFamily==='large',IS_SMALL=config.widgetFamily==='small';const BOXING_LARGE=IS_LARGE&&KEY==='boxing';const NEXT=BOXING_LARGE?null:(IS_LARGE?await loadLargeNext(D):null);const NEXT_POSTER=null;if(IS_LARGE){w.setPadding(14,16,12,16);if(BOXING_LARGE){if(ctx.poster)w.backgroundImage=ctx.poster;else w.backgroundGradient=gradient();renderLarge(w,D,ctx,NEXT,null);}else{try{w.backgroundImage=largeBackground(ctx);renderLarge(w,D,ctx,NEXT,NEXT_POSTER);}catch(_){w.backgroundColor=new Color('#020305');renderLarge(w,D,{a:{name:D.main.a,image:null},b:{name:D.main.b,image:null},poster:null},NEXT,null);}}}else if(IS_SMALL){w.setPadding(SMALL_UI.pad,SMALL_UI.pad,9,SMALL_UI.pad);
if(ctx.poster)w.backgroundImage=smallPosterBg(ctx.poster);else if(KEY==='boxing')w.backgroundGradient=gradient();else if(ctx.a.image||ctx.b.image)w.backgroundImage=smallHeroBg(ctx.a.image,ctx.b.image);else w.backgroundGradient=gradient();
renderSmall(w,D,ctx);
}else{w.setPadding(10,14,8,14);
if(ctx.poster)w.backgroundImage=posterBg(ctx.poster);else if(ctx.a.image||ctx.b.image)w.backgroundImage=heroBg(ctx.a.image,ctx.b.image);else w.backgroundGradient=gradient();
renderMedium(w,D,ctx);
}
w.url=D.source||S.listing;w.refreshAfterDate=new Date(Date.now()+30*60*1000);
if(config.runsInWidget)Script.setWidget(w);else if(IS_LARGE)await w.presentLarge();else if(IS_SMALL)await w.presentSmall();else await w.presentMedium();
Script.complete();
})();
