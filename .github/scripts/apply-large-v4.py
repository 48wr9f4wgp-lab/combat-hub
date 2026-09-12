from pathlib import Path

p=Path('combat-hub.js')
s=p.read_text()
s=s.replace('// v7.9.4-github — full Japanese display','// v7.10.0-github — Large V4 Luxury Pass',1)
s=s.replace("const VERSION='7.9.4-github';","const VERSION='7.10.0-github';",1)

start=s.index('function largeBackground(ctx){')
end=s.index('function renderLargeMainName',start)
luxury_bg="""function largeBackground(ctx){const c=new DrawContext();c.size=new Size(720,756);c.opaque=true;c.respectScreenScale=false;c.setFillColor(new Color('#030407'));c.fillRect(new Rect(0,0,720,756));if(ctx.poster?.size){const iw=ctx.poster.size.width,ih=ctx.poster.size.height,scale=Math.max(720/iw,500/ih),dw=iw*scale,dh=ih*scale;c.drawImageInRect(ctx.poster,new Rect((720-dw)/2,(500-dh)/2,dw,dh));}else{if(ctx.a.image)c.drawImageInRect(largePortraitSlot(ctx.a.image,'left'),new Rect(18,0,300,520));if(ctx.b.image)c.drawImageInRect(largePortraitSlot(ctx.b.image,'right'),new Rect(402,0,300,520));}c.setFillColor(new Color('#000000',Math.max(.40,V.heroShade-.16)));c.fillRect(new Rect(0,0,720,500));for(let i=0;i<28;i++){const p=i/27,w=560-p*420,a=.006+p*.012;c.setFillColor(new Color(S.accent,a));c.fillRect(new Rect(360-w/2,56,w,360));}for(let i=0;i<18;i++){const p=i/17,h=180-p*130,a=.005+p*.011;c.setFillColor(new Color(S.accent,a));c.fillRect(new Rect(52,482-h/2,616,h));}softBand(c,0,116,Math.min(.25,V.headerShade+.04),26);softBand(c,128,330,Math.min(.27,V.mainShade+.05),30);for(let i=0;i<192;i++){const p=i/191,a=.028+Math.pow(p,1.56)*.96;c.setFillColor(new Color('#030407',Math.min(.995,a)));c.fillRect(new Rect(0,328+i,720,1));}c.setFillColor(new Color('#030407',.992));c.fillRect(new Rect(0,520,720,236));c.setFillColor(new Color(S.accent,.18));c.fillRect(new Rect(28,0,664,1));c.setFillColor(new Color(S.accent,.045));c.fillRect(new Rect(0,518,720,2));c.setFillColor(new Color('#FFFFFF',.025));c.fillRect(new Rect(0,520,720,1));return c.getImage();}
function largeMiniPoster(image){if(!image?.size)return null;const W=232,H=264,c=new DrawContext();c.size=new Size(W,H);c.opaque=true;c.respectScreenScale=false;c.setFillColor(new Color('#080A0F'));c.fillRect(new Rect(0,0,W,H));const iw=image.size.width,ih=image.size.height,scale=Math.max(W/iw,H/ih),dw=iw*scale,dh=ih*scale;c.drawImageInRect(image,new Rect((W-dw)/2,(H-dh)/2,dw,dh));c.setFillColor(new Color('#000000',.69));c.fillRect(new Rect(0,0,W,H));for(let i=0;i<18;i++){const p=i/17,a=.006+p*.012;c.setFillColor(new Color(S.accent,a));c.fillRect(new Rect(0,H-90+i*5,W,5));}return c.getImage();}
"""
s=s[:start]+luxury_bg+s[end:]
s=s.replace("function renderLarge(w,D,ctx,next){","function renderLarge(w,D,ctx,next,nextPoster){",1)
s=s.replace("badge.backgroundColor=new Color(S.accent,.13);badge.cornerRadius=9;badge.setPadding(4,8,4,8);","badge.backgroundColor=new Color('#07090D',.78);badge.cornerRadius=11;badge.borderWidth=1;badge.borderColor=new Color(S.accent,.62);badge.setPadding(5,10,5,10);",1)
s=s.replace("center.size=new Size(44,46);center.addSpacer();","center.size=new Size(44,46);center.backgroundColor=new Color('#07090D',.46);center.cornerRadius=12;center.borderWidth=.7;center.borderColor=new Color(S.accent,.30);center.addSpacer();",1)
s=s.replace("card.size=new Size(202,132);card.backgroundColor=new Color('#080A0E',.86);card.cornerRadius=15;card.setPadding(10,9,9,9);","card.size=new Size(196,132);card.backgroundColor=new Color('#07090D',.76);card.cornerRadius=18;card.borderWidth=.8;card.borderColor=new Color('#FFFFFF',.11);card.setPadding(10,10,9,10);",1)
s=s.replace("rows.forEach((row,i)=>{largeFightRow(card,row);if(i<rows.length-1)card.addSpacer(5);});","rows.forEach((row,i)=>{largeFightRow(card,row);if(i<rows.length-1){card.addSpacer(2);const sep=card.addStack();sep.size=new Size(0,1);sep.backgroundColor=new Color('#FFFFFF',.05);card.addSpacer(2);}});",1)
s=s.replace("nextBox.size=new Size(110,132);nextBox.backgroundColor=new Color('#0B0D12',.88);nextBox.cornerRadius=15;nextBox.setPadding(10,9,9,9);","nextBox.size=new Size(116,132);nextBox.backgroundColor=new Color('#080A0F',.80);nextBox.cornerRadius=18;nextBox.borderWidth=.8;nextBox.borderColor=new Color(S.accent,.24);if(nextPoster)nextBox.backgroundImage=largeMiniPoster(nextPoster);nextBox.setPadding(10,9,9,9);",1)
s=s.replace("nb.backgroundColor=new Color(S.accent,.13);nb.cornerRadius=8;nb.setPadding(4,6,4,6);","nb.backgroundColor=new Color('#07090D',.72);nb.cornerRadius=9;nb.borderWidth=.7;nb.borderColor=new Color(S.accent,.42);nb.setPadding(4,6,4,6);",1)
old="const D=await loadData(),ctx=await heroContext(D),w=new ListWidget();const IS_LARGE=config.widgetFamily==='large';const NEXT=IS_LARGE?await loadLargeNext(D):null;if(IS_LARGE){w.setPadding(14,16,12,16);w.backgroundImage=largeBackground(ctx);renderLarge(w,D,ctx,NEXT);}"
new="const D=await loadData(),ctx=await heroContext(D),w=new ListWidget();const IS_LARGE=config.widgetFamily==='large';const NEXT=IS_LARGE?await loadLargeNext(D):null;const NEXT_POSTER=IS_LARGE&&NEXT?await eventPoster(NEXT):null;if(IS_LARGE){w.setPadding(14,16,12,16);w.backgroundImage=largeBackground(ctx);renderLarge(w,D,ctx,NEXT,NEXT_POSTER);}"
if old not in s: raise SystemExit('Large render invocation anchor missing')
s=s.replace(old,new,1)
p.write_text(s)

for t in Path('tests').glob('*.mjs'):
    q=t.read_text().replace("7\\.9\\.4-github","7\\.10\\.0-github")
    t.write_text(q)

# K-1 layout contract protects geometry, not a minor-version family.
t=Path('tests/combat-hub-k1-layout-regression.mjs')
q=t.read_text()
q=q.replace("/const VERSION='7\\.9\\.\\d+-github'/, 'Expected audited v7.9 runtime line'","/const VERSION='7\\.\\d+\\.\\d+-github'/, 'Expected audited v7 runtime line'")
t.write_text(q)

t=Path('tests/combat-hub-large-regression.mjs')
q=t.read_text()
q=q.replace("/function renderLarge\\(w,D,ctx,next\\)/","/function renderLarge\\(w,D,ctx,next,nextPoster\\)/")
q=q.replace("/card\\.size=new Size\\(202,132\\)/","/card\\.size=new Size\\(196,132\\)/")
q=q.replace("/nextBox\\.size=new Size\\(110,132\\)/","/nextBox\\.size=new Size\\(116,132\\)/")
q=q.replace("/badge\\.backgroundColor=new Color\\(S\\.accent,\\.13\\)/","/badge\\.borderColor=new Color\\(S\\.accent,\\.62\\)/")
q=q.replace("'Large status pill missing'","'Luxury countdown plate missing'")
q += "\nassert.match(src,/function largeMiniPoster\\(image\\)/,'Large next-event poster treatment missing');\nassert.match(src,/NEXT_POSTER=IS_LARGE&&NEXT\\?await eventPoster\\(NEXT\\):null/,'Large next poster loader missing');\nassert.match(src,/card\\.borderColor=new Color\\('#FFFFFF',\\.11\\)/,'Luxury fight-card glass border missing');\nassert.match(src,/nextBox\\.borderColor=new Color\\(S\\.accent,\\.24\\)/,'Luxury next-card accent border missing');\nassert.match(src,/center\\.borderColor=new Color\\(S\\.accent,\\.30\\)/,'Luxury VS plate missing');\n"
t.write_text(q)
