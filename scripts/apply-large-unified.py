from pathlib import Path
import re

p=Path('combat-hub.js')
s=p.read_text()

def rep(old,new,label):
    global s
    if old not in s:
        raise SystemExit(f'missing replacement target: {label}')
    s=s.replace(old,new,1)

rep("// v7.14.0-github — Ring official-events parser; BOXING cache-only widget path preserved", "// v7.15.0-github — unified Large layout/typography across organizations; BOXING cache-only path preserved", 'version comment')
rep("const VERSION='7.14.0-github';", "const VERSION='7.15.0-github';", 'version')
rep("const V=VISUAL[KEY];", "const V=VISUAL[KEY];\nconst LARGE_UI={org:24,event:10.0,meta:9.2,status:6.8,countdown:12.4,heroLabel:7.4,pending:17.2,pendingSub:10.0,main:16.0,vs:17.0,division:9.0,section:8.8,fightLabel:8.4,fightName:10.2,nextLabel:8.4,nextTitle:11.0,nextMeta:8.8,nextCountdown:9.2,dashH:150,leftW:192,rightW:103};", 'Large UI tokens')
rep("const veil=KEY==='one'?.50:KEY==='k1'?.56:KEY==='rizin'?.72:.56;", "const veil=.64;", 'common Large veil')

old="function renderLargeMainName(box,name){const parts=mainNameParts(jpDisplay(name));for(const part of parts){const t=tx(box,part,16.0,new Color(C.text),'black',1);t.minimumScaleFactor=.62;t.centerAlignText();}return parts;}\nfunction largeFightRow(st,row,wide=false){const block=st.addStack();block.layoutVertically();const lab=block.addStack();const lt=tx(lab,jpCardLabel(row.label),wide?8.6:8.0,new Color(S.accent),'bold');lt.minimumScaleFactor=.74;lab.addSpacer();block.addSpacer(2);const r=block.addStack();r.centerAlignContent();const aa=r.addStack();aa.size=new Size(wide?124:79,0);const at=tx(aa,jpDisplay(row.a),wide?10.8:9.8,new Color(C.text),'semibold',2);at.minimumScaleFactor=.72;r.addSpacer(4);tx(r,'VS',wide?8.4:7.8,new Color(S.accent),'bold');r.addSpacer(4);const bb=r.addStack();bb.size=new Size(wide?124:79,0);const bt=tx(bb,jpDisplay(row.b),wide?10.8:9.8,new Color(C.text),'semibold',2);bt.minimumScaleFactor=.72;bt.rightAlignText();}"
new="function largeNameParts(s){const v=String(s||'').trim(),chars=[...v];if(chars.length<=13)return[v];const mid=Math.floor(chars.length/2),seps=['・',' ','-','‐','–','／','/'];let best=-1,dist=Infinity;chars.forEach((ch,i)=>{if(!seps.includes(ch)||i<=2||i>=chars.length-3)return;const d=Math.abs(i-mid);if(d<dist){best=i;dist=d;}});if(best>=0)return[chars.slice(0,best+1).join('').trim(),chars.slice(best+1).join('').trim()].filter(Boolean);return[chars.slice(0,mid).join(''),chars.slice(mid).join('')];}\nfunction largeSlotName(name){return largeNameParts(jpDisplay(name)).join('\\n');}\nfunction renderLargeMainName(box,name){const parts=largeNameParts(jpDisplay(name));for(const part of parts){const t=tx(box,part,LARGE_UI.main,new Color(C.text),'black',1);t.minimumScaleFactor=.72;t.centerAlignText();}return parts;}\nfunction largeFightRow(st,row){const block=st.addStack();block.layoutVertically();const lab=block.addStack();const lt=tx(lab,jpCardLabel(row.label),LARGE_UI.fightLabel,new Color(S.accent),'bold');lt.minimumScaleFactor=.78;lab.addSpacer();block.addSpacer(2);const r=block.addStack();r.centerAlignContent();const aa=r.addStack();aa.size=new Size(78,0);const at=tx(aa,largeSlotName(row.a),LARGE_UI.fightName,new Color(C.text),'semibold',2);at.minimumScaleFactor=.76;r.addSpacer(4);tx(r,'VS',LARGE_UI.fightLabel,new Color(S.accent),'bold');r.addSpacer(4);const bb=r.addStack();bb.size=new Size(78,0);const bt=tx(bb,largeSlotName(row.b),LARGE_UI.fightName,new Color(C.text),'semibold',2);bt.minimumScaleFactor=.76;bt.rightAlignText();}"
rep(old,new,'Large name and fight-row renderer')

new_render=r'''function renderLarge(w,D,ctx,next,nextPoster){
  const pending=!!D.cardTba;
  const h=w.addStack();h.centerAlignContent();
  const hl=h.addStack();hl.layoutVertically();
  tx(hl,S.label,LARGE_UI.org,new Color(C.text),'black');
  hl.addSpacer(2);
  const en=tx(hl,jpDisplay(D.name||''),LARGE_UI.event,new Color(S.accent),'bold',2);en.minimumScaleFactor=.76;
  hl.addSpacer(4);
  const meta=hl.addStack();
  const dt=tx(meta,dateText(D),LARGE_UI.meta,new Color(C.sub),'semibold');dt.minimumScaleFactor=.78;meta.addSpacer(6);tx(meta,'·',7.8,new Color(C.muted));meta.addSpacer(6);const ml=tx(meta,shortLoc(D.location),LARGE_UI.meta,new Color(C.sub),'semibold');ml.minimumScaleFactor=.78;
  h.addSpacer();
  const status=h.addStack();status.layoutVertically();
  const sl=status.addStack();sl.addSpacer();tx(sl,statusLabel(D),LARGE_UI.status,new Color(C.muted),'bold');status.addSpacer(3);
  const badge=status.addStack();badge.backgroundColor=new Color('#05070B',.72);badge.cornerRadius=11;badge.borderWidth=.7;badge.borderColor=new Color(S.accent,.36);badge.setPadding(5,10,5,10);tx(badge,countdown(D),LARGE_UI.countdown,new Color(C.text),'black');
  w.addSpacer(pending?20:26);
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
'''
s,n=re.subn(r"function renderLarge\(w,D,ctx,next,nextPoster\)\{[\s\S]*?\n\}\n\nconst D=",new_render+"\nconst D=",s,count=1)
if n!=1:
    raise SystemExit('renderLarge replacement failed')
p.write_text(s)

test=Path('tests/combat-hub-large-regression.mjs')
test.write_text(r'''import fs from 'node:fs';
import assert from 'node:assert/strict';
const src = fs.readFileSync('combat-hub.js', 'utf8');
assert.match(src, /const VERSION='7\.15\.0-github'/);
assert.match(src, /const LARGE_UI=\{org:24,event:10\.0,meta:9\.2,status:6\.8,countdown:12\.4,heroLabel:7\.4,pending:17\.2,pendingSub:10\.0,main:16\.0,vs:17\.0,division:9\.0,section:8\.8,fightLabel:8\.4,fightName:10\.2,nextLabel:8\.4,nextTitle:11\.0,nextMeta:8\.8,nextCountdown:9\.2,dashH:150,leftW:192,rightW:103\}/);
assert.match(src, /const veil=\.64;/);
assert.match(src, /function largeNameParts\(s\)/);
assert.match(src, /function largeSlotName\(name\)/);
assert.match(src, /function largeFightRow\(st,row\)/);
assert.doesNotMatch(src, /function largeFightRow\(st,row,wide=false\)/);
assert.match(src, /tx\(hl,S\.label,LARGE_UI\.org,/);
assert.match(src, /jpDisplay\(D\.name\|\|''\),LARGE_UI\.event/);
assert.match(src, /dateText\(D\),LARGE_UI\.meta/);
assert.match(src, /shortLoc\(D\.location\),LARGE_UI\.meta/);
assert.match(src, /tx\(sl,statusLabel\(D\),LARGE_UI\.status/);
assert.match(src, /countdown\(D\),LARGE_UI\.countdown/);
assert.match(src, /w\.addSpacer\(pending\?20:26\)/);
assert.match(src, /'対戦カード発表待ち',LARGE_UI\.pending/);
assert.match(src, /tx\(center,'VS',LARGE_UI\.vs/);
assert.match(src, /division\(D\.main\.context\),LARGE_UI\.division/);
assert.match(src, /\(D\.support\|\|\[\]\)\.slice\(0,2\)/);
assert.match(src, /left\.size=new Size\(LARGE_UI\.leftW,dashHeight-20\)/);
assert.match(src, /right\.size=new Size\(LARGE_UI\.rightW,130\)/);
assert.doesNotMatch(src, /compactBoxing/);
assert.match(src, /largeFightRow\(left,row\)/);
assert.match(src, /largeSlotName\(row\.a\),LARGE_UI\.fightName/);
assert.match(src, /largeSlotName\(row\.b\),LARGE_UI\.fightName/);
assert.match(src, /largeNextTitle\(next\),LARGE_UI\.nextTitle/);
assert.match(src, /largeNextMeta\(next\),LARGE_UI\.nextMeta/);
assert.match(src, /'公式情報を確認中',LARGE_UI\.nextMeta/);
assert.match(src, /const BOXING_LARGE=IS_LARGE&&KEY==='boxing'/);
assert.match(src, /lightweightPending:true/);
assert.match(src, /function boxingPrefetchValid\(snap,e,now=Date\.now\(\)\)/);
assert.match(src, /function boxingVerifiedCache\(cached,snap,now\)/);
assert.match(src, /verifiedBy:'strictNextEvent'/);
assert.match(src, /const NEXT=BOXING_LARGE\?null:\(IS_LARGE\?await loadLargeNext\(D\):null\)/);
assert.match(src, /NEXT_POSTER=null/);
assert.match(src, /if\(BOXING_LARGE\)\{if\(ctx\.poster\)w\.backgroundImage=ctx\.poster;else w\.backgroundGradient=gradient\(\);renderLarge\(w,D,ctx,NEXT,null\);\}/);
assert.match(src, /await w\.presentMedium\(\)/);
assert.match(src, /await w\.presentLarge\(\)/);
console.log('COMBAT HUB Large v7.15.0 unified layout regression: OK');
''')

hp=Path('HANDOFF.md')
h=hp.read_text()
h=h.replace('- Runtime: **v7.14.0-github**','- Runtime: **v7.15.0-github**',1)
marker='## 6. BOXING architecture in v7.14.0'
insert='''## 6. Large UI architecture in v7.15.0\n\nLarge now uses one shared geometry and typography system across UFC / RIZIN / ONE / BOXING / K-1.\n\n- `LARGE_UI` is the canonical Large typography/geometry token set.\n- organization-specific Large font sizing and lower-panel widths are removed.\n- the lower dashboard is always the same two-column layout: fight card left / next event right.\n- long fighter names use the same delimiter-aware two-line wrapping rule.\n- the Large hero/background contrast veil is shared across organizations.\n- organization differences are limited to accent color, source data and available imagery.\n- BOXING retains the low-memory verified-cache-only data path and skips heavy next-event discovery/poster work in Widget execution; only its visual geometry is unified.\n\nPhysical iPhone visual confirmation for v7.15.0 is still required before calling this pass complete.\n\n## 7. BOXING architecture in v7.14.0'''
if marker not in h:
    raise SystemExit('HANDOFF insertion marker missing')
h=h.replace(marker,insert,1)
h=h.replace('## 7. New in v7.14.0 — Ring-specific official parser','## 8. New in v7.14.0 — Ring-specific official parser',1)
h=h.replace('## 8. Runtime audit','## 9. Runtime audit',1)
h=h.replace('## 9. Regression coverage / current CI','## 10. Regression coverage / current CI',1)
hp.write_text(h)
