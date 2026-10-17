import fs from 'node:fs';
import assert from 'node:assert/strict';
const src=fs.readFileSync(new URL('../combat-hub.js', import.meta.url),'utf8');
assert.match(src,/const VERSION='7\.\d+\.\d+-github'/);
assert.match(src,/const JP_DISPLAY=\{/);
for(const s of ['ノーチェUFC','ジェアン・シウヴァ','ホセ・ミゲル・デルガド','ブランドン・モレノ','マノン・フィオロ','アレクサ・グラッソ','ONE フライデーファイツ 170','ONE フライデーファイツ 172','スーパーレック','オスマン・ルーニ','ヨードレックペット','ポンペット','吉成名高','ハー・リン・オム','若松佑弥','ウィリー・ファン・ローエン','士門','スーブラック','陽勇','常陸飛雄馬','ライアン・ガルシア','コナー・ベン','ジェイ・オペタイア','ノエル・ミカエリアン','Crypto.com UFC 331：ヴァン vs パントージャ2']) assert.ok(src.includes(s),`missing Japanese alias: ${s}`);
assert.match(src,/mainNameParts\(jpDisplay\(name\)\)/);
assert.match(src,/jpDisplay\(row\.a\)/);
assert.match(src,/jpDisplay\(row\.b\)/);
assert.match(src,/jpDisplay\(D\.name\|\|''\)/);
assert.match(src,/function largeNextTitle\(next\)/);
assert.match(src,/boxing:\{label:'ボクシング'/);
assert.ok(src.includes("return'横浜BUNTAI'"),'Yokohama venue must be localized');
assert.match(src,/jpDisplay\(next\?\.name\|\|'次大会'\)/);
import vm from 'node:vm';

// Exercise the exact display resolver used by Small / Medium / Large, not just literal presence.
const aliasBegin=src.indexOf('const JP_DISPLAY={');
const aliasEnd=src.indexOf('function sanitizeFighter(',aliasBegin);
assert.ok(aliasBegin>=0&&aliasEnd>aliasBegin,'Japanese display resolver section missing');
const aliasRuntime=src.slice(aliasBegin,aliasEnd);
const resolve=vm.runInNewContext(`function stripHTML(v){return String(v??'').trim();}\n${aliasRuntime}\njpDisplay`,{});
const oneSamurai4Aliases={
  'Jonathan Haggerty':'ジョナサン・ハガティー',
  'Hiroki Akimoto':'秋元皓貴',
  'Rifdean Masdor':'リファディン・マスドール',
  'Masaaki Noiri':'野杁正明',
  'Mohammad Siasarani':'モハメド・シアサラニ',
};
for(const [english,japanese] of Object.entries(oneSamurai4Aliases)){
  assert.equal(resolve(english),japanese,`ONE SAMURAI 4 alias resolution failed: ${english}`);
}
assert.equal(resolve('Nadaka'),'吉成名高','existing Nadaka alias must remain');
assert.equal(resolve('ONE SAMURAI 4'),'ONE SAMURAI 4','official event title should remain unchanged');
assert.equal(resolve('Unknown Official Fighter'),'Unknown Official Fighter','unverified aliases must not be fabricated');
assert.match(src,/function mediumSupportRow\(w,row\)[^\n]*jpDisplay\(row\.a\)/,'Medium support A must use the Japanese display resolver');
assert.match(src,/function mediumSupportRow\(w,row\)[^\n]*jpDisplay\(row\.b\)/,'Medium support B must use the Japanese display resolver');
assert.match(src,/function renderMediumMainName\(box,name\)[^\n]*jpDisplay\(name\)/,'Medium main must use the Japanese display resolver');
assert.match(src,/function renderLargeMainName\(box,name\)[^\n]*jpDisplay\(name\)/,'Large main must use the Japanese display resolver');

// First-party ONE bilingual event-card auto-localization (athlete slug identity, not translation guesses).
{
  const resolverStart=src.indexOf('const JP_DISPLAY={');
  const resolverEnd=src.indexOf('function sanitizeFighter(',resolverStart);
  const helperStart=src.indexOf('function decodeEntities(');
  const helperEnd=src.indexOf('function absoluteURL(',helperStart);
  const attrStart=src.indexOf('function attr(tag,name)');
  const attrEnd=src.indexOf('function cacheFile(name)',attrStart);
  assert.ok(resolverStart>=0&&resolverEnd>resolverStart&&helperStart>=0&&helperEnd>helperStart&&attrStart>=0&&attrEnd>attrStart);
  const vmSource=src.slice(helperStart,helperEnd)+src.slice(attrStart,attrEnd)+src.slice(resolverStart,resolverEnd);
  const stored=new Map(),calls=[];
  let time=Date.parse('2026-10-17T09:00:00+09:00'),langOk=true;
  const athletes=[
    ['jonathan-haggerty','Jonathan Haggerty','ジョナサン・ハガティー'],
    ['hiroki-akimoto','Hiroki Akimoto','秋元皓貴'],
    ['nadaka','Nadaka','吉成名高'],
    ['rifdean-masdor','Rifdean Masdor','リファディン ・マスドール'],
    ['masaaki-noiri','Masaaki Noiri','野杁正明'],
    ['mohammad-siasarani','Mohammad Siasarani','モハメド・シアサラニ'],
    ['unknown-fighter','Unknown Fighter','Unknown Fighter'],
    ['future-fighter','Future Fighter','未来太郎']
  ];
  const card=(locale)=>'<section><table>'+athletes.map(([slug,en,ja])=>'<tr class="vs"><td><a href="https://www.onefc.com/'+(locale==='jp'?'jp/':'')+'athletes/'+slug+'/" title="'+(locale==='jp'?ja:en)+'">'+(locale==='jp'?ja:en)+'</a></td><th>VS</th></tr>').join('')+'</table></section>';
  const sandbox={
    KEY:'one',
    Date:class TestDate extends Date{static now(){return time;}},
    cacheFile:name=>'/docs/'+name,
    readJSON:path=>stored.get(path)||null,
    writeJSON:(path,data)=>stored.set(path,data),
    reqText:async url=>{calls.push(url);if(!langOk)throw Error('network down');return card(url.includes('/jp/')?'jp':'en');}
  };
  const api=vm.runInNewContext(vmSource+'\n({jpDisplay,warmOneOfficialJapaneseNames,oneOfficialAthleteLabels,oneOfficialEventSlug})',sandbox);
  const event={source:'https://www.onefc.com/events/one-samurai-4/'};
  assert.equal(api.oneOfficialEventSlug(event.source),'one-samurai-4');
  assert.equal(api.oneOfficialEventSlug('https://other.example/events/one-samurai-4/'),null,'untrusted sources must not be fetched');
  await api.warmOneOfficialJapaneseNames(event);
  assert.equal(calls.length,2,'cold ONE localization fetches both first-party locales once');
  for(const [slug,en,ja] of athletes.slice(0,6))assert.equal(api.jpDisplay(en),ja.replace(/\s*・\s*/g,'・'),'official athlete alias: '+slug);
  assert.equal(api.jpDisplay('Future Fighter'),'未来太郎','new fighter must localize without a manual dictionary entry');
  assert.equal(api.jpDisplay('Unknown Fighter'),'Unknown Fighter','never invent unverified fighter names');
  assert.equal(api.jpDisplay('ONE SAMURAI 4'),'ONE SAMURAI 4','event title remains unchanged');
  assert.equal(api.jpDisplay('Nadaka'),'吉成名高','previous static alias preserved');
  time+=60*60*1000;
  await api.warmOneOfficialJapaneseNames(event);
  assert.equal(calls.length,2,'warm 8h locale cache must suppress repeat network calls');
  time+=9*60*60*1000;langOk=false;
  await api.warmOneOfficialJapaneseNames(event);
  assert.equal(api.jpDisplay('Future Fighter'),'未来太郎','same-event verified stale cache survives network errors');
  await api.warmOneOfficialJapaneseNames({source:'https://www.onefc.com/events/one-future-99/'});
  assert.equal(api.jpDisplay('Future Fighter'),'Future Fighter','aliases must not leak across different events');
  assert.equal(api.oneOfficialEventSlug('javascript:alert(1)'),null,'invalid sources must not be fetched');
}
assert.match(src,/async function heroContext\(D\)\{\s*if\(KEY==='one'\)await warmOneOfficialJapaneseNames\(D\)/,'ONE must warm verified Japanese aliases before every widget geometry renderer');

console.log('Japanese display regression OK');
