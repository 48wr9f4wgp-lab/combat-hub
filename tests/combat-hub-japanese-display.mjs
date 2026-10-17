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
console.log('Japanese display regression OK');
