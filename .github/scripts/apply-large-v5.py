from pathlib import Path

runtime = Path('combat-hub.js')
s = runtime.read_text()
s = s.replace('// v7.10.0-github — Large V4 Luxury Pass', '// v7.11.0-github — Large V5 editorial rebuild', 1)
s = s.replace("const VERSION='7.10.0-github';", "const VERSION='7.11.0-github';", 1)

start = s.index('function largePortraitSlot(image,side)')
end = s.index('const D=await loadData()', start)

block = r'''function largePortraitSlot(image,side){const W=348,H=520,c=new DrawContext();c.size=new Size(W,H);c.opaque=false;c.respectScreenScale=false;if(!image?.size)return c.getImage();const iw=image.size.width,ih=image.size.height,scale=Math.max(W/iw,H/ih),dw=iw*scale,dh=ih*scale,x=(W-dw)/2,y=(H-dh)/2-6;c.drawImageInRect(image,new Rect(x,y,dw,dh));return c.getImage();}
function largeBackground(ctx){const c=new DrawContext();c.size=new Size(720,756);c.opaque=true;c.respectScreenScale=false;c.setFillColor(new Color('#020305'));c.fillRect(new Rect(0,0,720,756));if(ctx.poster?.size){const iw=ctx.poster.size.width,ih=ctx.poster.size.height,scale=Math.max(720/iw,520/ih),dw=iw*scale,dh=ih*scale;c.drawImageInRect(ctx.poster,new Rect((720-dw)/2,(520-dh)/2,dw,dh));}else{if(ctx.a.image)c.drawImageInRect(largePortraitSlot(ctx.a.image,'left'),new Rect(0,0,348,520));if(ctx.b.image)c.drawImageInRect(largePortraitSlot(ctx.b.image,'right'),new Rect(372,0,348,520));}const veil=KEY==='one'?.38:KEY==='k1'?.46:KEY==='rizin'?.58:.44;c.setFillColor(new Color('#000000',veil));c.fillRect(new Rect(0,0,720,520));softBand(c,0,118,.16,28);softBand(c,250,520,.18,36);for(let i=0;i<160;i++){const p=i/159,a=.08+Math.pow(p,1.7)*.91;c.setFillColor(new Color('#020305',Math.min(.995,a)));c.fillRect(new Rect(0,388+i,720,1));}c.setFillColor(new Color('#020305',.995));c.fillRect(new Rect(0,548,720,208));c.setFillColor(new Color(S.accent,.12));c.fillRect(new Rect(30,0,660,1));c.setFillColor(new Color(S.accent,.10));c.fillRect(new Rect(48,548,624,1));return c.getImage();}
function largeMiniPoster(image){if(!image?.size)return null;const W=210,H=224,c=new DrawContext();c.size=new Size(W,H);c.opaque=true;c.respectScreenScale=false;c.setFillColor(new Color('#07090D'));c.fillRect(new Rect(0,0,W,H));const iw=image.size.width,ih=image.size.height,scale=Math.max(W/iw,H/ih),dw=iw*scale,dh=ih*scale;c.drawImageInRect(image,new Rect((W-dw)/2,(H-dh)/2,dw,dh));c.setFillColor(new Color('#000000',.78));c.fillRect(new Rect(0,0,W,H));return c.getImage();}
function renderLargeMainName(box,name){const parts=mainNameParts(jpDisplay(name));for(const part of parts){const t=tx(box,part,14.8,new Color(C.text),'black',1);t.minimumScaleFactor=.58;t.centerAlignText();}return parts;}
function largeFightRow(st,row){const r=st.addStack();r.centerAlignContent();const lab=r.addStack();lab.size=new Size(34,0);const lt=tx(lab,jpCardLabel(row.label),6.0,new Color(S.accent),'bold');lt.minimumScaleFactor=.52;r.addSpacer(2);const aa=r.addStack();aa.size=new Size(54,0);const at=tx(aa,jpDisplay(row.a),6.9,new Color(C.text),'semibold');at.minimumScaleFactor=.44;r.addSpacer(2);tx(r,'VS',5.8,new Color(S.accent),'bold');r.addSpacer(2);const bb=r.addStack();bb.size=new Size(54,0);const bt=tx(bb,jpDisplay(row.b),6.9,new Color(C.text),'semibold');bt.minimumScaleFactor=.44;bt.rightAlignText();}
function largeNextMeta(next){if(!next)return'';const d=next.timeTba?dateOnly(next.startAt):dateText(next);const loc=shortLoc(next.location||'');return loc?`${d} · ${loc}`:d;}
function renderLarge(w,D,ctx,next,nextPoster){const h=w.addStack();h.centerAlignContent();const hl=h.addStack();hl.layoutVertically();tx(hl,S.label,21.5,new Color(C.text),'black');hl.addSpacer(1);const en=tx(hl,jpDisplay(D.name||''),7.2,new Color(S.accent),'bold');en.minimumScaleFactor=.68;hl.addSpacer(3);const meta=hl.addStack();tx(meta,dateText(D),8.2,new Color(C.sub),'semibold');meta.addSpacer(5);tx(meta,'·',7,new Color(C.muted));meta.addSpacer(5);tx(meta,shortLoc(D.location),8.2,new Color(C.sub),'semibold');h.addSpacer();const status=h.addStack();status.layoutVertically();const sl=status.addStack();sl.addSpacer();tx(sl,statusLabel(D),5.9,new Color(C.muted),'bold');status.addSpacer(2);const badge=status.addStack();badge.backgroundColor=new Color('#05070B',.60);badge.cornerRadius=9;badge.borderWidth=.6;badge.borderColor=new Color(S.accent,.28);badge.setPadding(4,8,4,8);tx(badge,countdown(D),11.1,new Color(C.text),'black');w.addSpacer(D.cardTba?34:46);if(D.cardTba){const center=w.addStack();center.layoutVertically();const title=tx(center,D.nextPending?'次大会情報を確認中':'対戦カード発表待ち',14.6,new Color(C.text),'black');title.centerAlignText();center.addSpacer(6);const sub=tx(center,jpDisplay(D.name||D.main.context),8.2,new Color(S.accent),'semibold');sub.centerAlignText();}else{const tag=w.addStack();tag.addSpacer();const tagText=tx(tag,'メインイベント',6.2,new Color(S.accent),'bold');tagText.centerAlignText();tag.addSpacer();w.addSpacer(3);const main=w.addStack();main.centerAlignContent();main.addSpacer();const aBox=main.addStack();aBox.layoutVertically();aBox.size=new Size(136,40);aBox.addSpacer();renderLargeMainName(aBox,ctx.a.name);aBox.addSpacer();main.addSpacer(4);const center=main.addStack();center.layoutVertically();center.size=new Size(38,40);center.addSpacer();const vs=tx(center,'VS',15.5,new Color(S.accent),'black');vs.centerAlignText();center.addSpacer();main.addSpacer(4);const bBox=main.addStack();bBox.layoutVertically();bBox.size=new Size(136,40);bBox.addSpacer();renderLargeMainName(bBox,ctx.b.name);bBox.addSpacer();main.addSpacer();w.addSpacer(4);const dv=tx(w,division(D.main.context),7.8,new Color('#D4D8DF'),'semibold');dv.centerAlignText();}w.addSpacer();const dash=w.addStack();dash.size=new Size(320,132);dash.backgroundColor=new Color('#05070B',.84);dash.cornerRadius=16;dash.borderWidth=.7;dash.borderColor=new Color('#FFFFFF',.09);dash.setPadding(10,11,10,11);const left=dash.addStack();left.layoutVertically();left.size=new Size(176,112);const cap=left.addStack();const accent=cap.addStack();accent.size=new Size(18,3);accent.backgroundColor=new Color(S.accent);accent.cornerRadius=2;cap.addSpacer();left.addSpacer(6);const ltitle=left.addStack();tx(ltitle,'対戦カード',6.5,new Color(S.accent),'bold');ltitle.addSpacer();left.addSpacer(6);const rows=(D.support||[]).slice(0,3);if(rows.length){rows.forEach((row,i)=>{largeFightRow(left,row);if(i<rows.length-1){left.addSpacer(3);const sep=left.addStack();sep.size=new Size(0,1);sep.backgroundColor=new Color('#FFFFFF',.055);left.addSpacer(3);}});}else{left.addSpacer(20);const em=tx(left,'追加カード発表待ち',7.3,new Color(C.muted),'semibold');em.centerAlignText();}dash.addSpacer(8);const rule=dash.addStack();rule.size=new Size(1,104);rule.backgroundColor=new Color('#FFFFFF',.075);dash.addSpacer(8);const right=dash.addStack();right.layoutVertically();right.size=new Size(105,112);right.cornerRadius=12;if(nextPoster)right.backgroundImage=largeMiniPoster(nextPoster);right.setPadding(7,7,7,7);const ncap=right.addStack();tx(ncap,'次大会',6.4,new Color(S.accent),'bold');ncap.addSpacer();if(next){right.addSpacer(6);const nn=tx(right,jpDisplay(next.name||'次大会'),8.4,new Color(C.text),'bold',3);nn.minimumScaleFactor=.58;right.addSpacer(5);tx(right,largeNextMeta(next),6.2,new Color(C.sub),'semibold',2);right.addSpacer();const nt=tx(right,'あと '+countdown(next),6.6,new Color(S.accent),'bold');nt.minimumScaleFactor=.58;}else{right.addSpacer(16);tx(right,'公式情報を確認中',7.0,new Color(C.muted),'semibold',3);right.addSpacer();}w.addSpacer(2);}
'''

s = s[:start] + block + '\n\n' + s[end:]
runtime.write_text(s)

test = Path('tests/combat-hub-large-regression.mjs')
test.write_text("""import fs from 'node:fs';
import assert from 'node:assert/strict';
const src = fs.readFileSync('combat-hub.js', 'utf8');
assert.match(src, /const VERSION='7\\.11\\.0-github'/);
assert.match(src, /const IS_LARGE=config\\.widgetFamily==='large'/);
assert.match(src, /async function loadLargeNext\\(base\\)/);
assert.match(src, /combat-hub-large-next-\\$\\{KEY\\}\\.json/);
assert.match(src, /function largeBackground\\(ctx\\)/);
assert.match(src, /function renderLarge\\(w,D,ctx,next,nextPoster\\)/);
assert.match(src, /\\(D\\.support\\|\\|\\[\\]\\)\\.slice\\(0,3\\)/, 'V5 should favor readability over four-row density');
assert.match(src, /await w\\.presentLarge\\(\\)/);
assert.match(src, /w\\.setPadding\\(14,16,12,16\\)/);
assert.match(src, /new Rect\\(0,0,348,520\\)/, 'V5 left portrait slot missing');
assert.match(src, /new Rect\\(372,0,348,520\\)/, 'V5 right portrait slot missing');
assert.match(src, /'メインイベント'/, 'V5 centered main-event tag missing');
assert.match(src, /center\\.size=new Size\\(38,40\\)/, 'V5 VS center column missing');
assert.doesNotMatch(src, /center\\.backgroundColor=/, 'V5 must not box the VS axis');
assert.match(src, /dash\\.size=new Size\\(320,132\\)/, 'V5 unified editorial rail missing');
assert.match(src, /left\\.size=new Size\\(176,112\\)/, 'V5 fight-card pane missing');
assert.match(src, /right\\.size=new Size\\(105,112\\)/, 'V5 next-event pane missing');
assert.match(src, /rule\\.size=new Size\\(1,104\\)/, 'V5 dashboard divider missing');
assert.match(src, /function largeMiniPoster\\(image\\)/, 'V5 next-event poster treatment missing');
assert.match(src, /NEXT_POSTER=IS_LARGE&&NEXT\\?await eventPoster\\(NEXT\\):null/, 'Large next poster loader missing');
assert.match(src, /const NEXT_SNAPSHOT=/, 'Trusted next-event fallback missing');
assert.match(src, /function trustedLargeNext\\(base\\)/, 'Large trusted-next fallback helper missing');
assert.match(src, /for\\(let i=0;i<160;i\\+\\+\\)/, 'V5 cinematic hero fade missing');
assert.doesNotMatch(src, /for\\(let i=0;i<28;i\\+\\+\\)/, 'V4 glow stack should be removed');
assert.match(src, /await w\\.presentMedium\\(\\)/, 'Medium rendering path must remain');
assert.match(src, /function jpCardLabel\\(label\\)/, 'Japanese card-label mapper missing');
assert.match(src, /'対戦カード'/, 'Japanese fight-card label missing');
assert.match(src, /'次大会'/, 'Japanese next-event label missing');
console.log('COMBAT HUB Large V5 regression: OK');
""")
