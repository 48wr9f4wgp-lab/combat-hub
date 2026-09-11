from pathlib import Path

p=Path('combat-hub.js')
s=p.read_text()
s=s.replace("// v7.9.3-github — Large V3.2 visual polish", "// v7.9.4-github — full Japanese display", 1)
s=s.replace("const VERSION='7.9.3-github';", "const VERSION='7.9.4-github';", 1)

anchor="function jpCardLabel(label){const v=String(label||'').trim().toUpperCase();if(v==='CO-MAIN')return'セミ';if(v==='MAIN CARD')return'本戦';if(v==='FEATURED')return'注目';if(v==='TITLE FIGHT')return'タイトル戦';if(v==='UNDERCARD')return'前座';return String(label||'');}"
display="""const JP_DISPLAY={
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
'Joshua Van':'ジョシュア・ヴァン','Alexandre Pantoja':'アレシャンドレ・パントージャ',
'Yodlekpet Or Atchariya':'ヨードレックペット','Yodlekpet':'ヨードレックペット',
'Pompet Pongsuphan PK':'ポンペット','Pompet':'ポンペット',
'Ayad Albadr':'アヤド・アルバドル','Kongchai Chanaidonmueang':'ゴンチャイ・チャナイドンムラン',
'Yodthewin Mor Rajabhatmubanchombueng':'ヨッドテーウィン','Otis Waghorn':'オーティス・ワグホーン',
'Xavier Gonzalez':'チャビエル・ゴンザレス','Thway Lin Htet':'スイ・リン・テート',
'Dabdam Por Tor Tor Thongtawee':'ダブダム','Petsangwan Sor Samarngarment':'ペットサンワン',
'Ryan Garcia':'ライアン・ガルシア','Conor Benn':'コナー・ベン',
'Jai Opetaia':'ジェイ・オペタイア','Noel Mikaelian':'ノエル・ミカエリアン'
};
function jpDisplay(v){const raw=stripHTML(v);return JP_DISPLAY[raw]||raw;}"""
if 'const JP_DISPLAY={' not in s:
    if anchor not in s:
        raise SystemExit('jpCardLabel anchor missing')
    s=s.replace(anchor,anchor+'\n'+display,1)

s=s.replace("function renderMainName(box,name){const parts=mainNameParts(name);", "function renderMainName(box,name){const parts=mainNameParts(jpDisplay(name));", 1)
s=s.replace("function renderLargeMainName(box,name){const parts=mainNameParts(name);", "function renderLargeMainName(box,name){const parts=mainNameParts(jpDisplay(name));", 1)
s=s.replace("tx(a,row.a,supportFont(row.a),new Color(C.text),'semibold')", "tx(a,jpDisplay(row.a),supportFont(jpDisplay(row.a)),new Color(C.text),'semibold')")
s=s.replace("tx(b,row.b,supportFont(row.b),new Color(C.text),'semibold')", "tx(b,jpDisplay(row.b),supportFont(jpDisplay(row.b)),new Color(C.text),'semibold')")
s=s.replace("tx(a,row.a,9.4,new Color(C.text),'semibold')", "tx(a,jpDisplay(row.a),9.4,new Color(C.text),'semibold')")
s=s.replace("tx(b,row.b,9.4,new Color(C.text),'semibold')", "tx(b,jpDisplay(row.b),9.4,new Color(C.text),'semibold')")
s=s.replace("tx(aa,row.a,7.2,new Color(C.text),'semibold')", "tx(aa,jpDisplay(row.a),7.2,new Color(C.text),'semibold')")
s=s.replace("tx(bb,row.b,7.2,new Color(C.text),'semibold')", "tx(bb,jpDisplay(row.b),7.2,new Color(C.text),'semibold')")
s=s.replace("const en=tx(hl,stripHTML(D.name||''),7.3", "const en=tx(hl,jpDisplay(D.name||''),7.3")
s=s.replace("stripHTML(next.name||'次大会')", "jpDisplay(next.name||'次大会')")
s=s.replace("stripHTML(D.name||D.main.context)", "jpDisplay(D.name||D.main.context)")
p.write_text(s)

for fp in ['tests/combat-hub-current-data-audit.mjs','tests/combat-hub-large-regression.mjs']:
    t=Path(fp)
    q=t.read_text().replace("7\\.9\\.3-github", "7\\.9\\.4-github")
    t.write_text(q)

Path('tests/combat-hub-japanese-display.mjs').write_text("""import fs from 'node:fs';
import assert from 'node:assert/strict';
const src=fs.readFileSync(new URL('../combat-hub.js', import.meta.url),'utf8');
assert.match(src,/const VERSION='7\\.9\\.4-github'/);
assert.match(src,/const JP_DISPLAY=\\{/);
for(const s of ['ノーチェUFC','ジェアン・シウヴァ','ホセ・ミゲル・デルガド','ブランドン・モレノ','マノン・フィオロ','アレクサ・グラッソ','ONE フライデーファイツ 170','ヨードレックペット','ポンペット','ライアン・ガルシア','コナー・ベン','Crypto.com UFC 331：ヴァン vs パントージャ2']) assert.ok(src.includes(s),`missing Japanese alias: ${s}`);
assert.match(src,/mainNameParts\\(jpDisplay\\(name\\)\\)/);
assert.match(src,/jpDisplay\\(row\\.a\\)/);
assert.match(src,/jpDisplay\\(row\\.b\\)/);
assert.match(src,/jpDisplay\\(D\\.name\\|\\|''\\)/);
assert.match(src,/jpDisplay\\(next\\.name\\|\\|'次大会'\\)/);
console.log('Japanese display regression OK');
""")
