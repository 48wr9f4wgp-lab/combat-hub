from pathlib import Path
import re

p=Path('combat-hub.js')
s=p.read_text()

def rep(old,new,label):
    global s
    if old not in s:
        raise SystemExit(f'missing target: {label}')
    s=s.replace(old,new,1)

rep("// v7.16.1-github — Large pending-state vertical balance polish; single header/status template preserved", "// v7.17.0-github — Medium unified layout/timing hierarchy across all organizations; Large v7.16.1 geometry preserved", 'version comment')
rep("const VERSION='7.16.1-github';", "const VERSION='7.17.0-github';", 'version')
rep("const LARGE_UI={org:24,event:10.0,meta:9.2,status:6.8,countdown:12.4,statusDate:8.2,statusLoc:8.2,heroLabel:7.4,pending:17.2,pendingSub:10.0,main:16.0,vs:17.0,division:9.0,section:8.8,fightLabel:8.4,fightName:10.2,nextLabel:8.4,nextTitle:11.0,nextMeta:8.8,nextCountdown:9.2,dashH:150,leftW:192,rightW:103,headerW:198,statusW:122,heroGap:24,pendingOffset:32};", "const LARGE_UI={org:24,event:10.0,meta:9.2,status:6.8,countdown:12.4,statusDate:8.2,statusLoc:8.2,heroLabel:7.4,pending:17.2,pendingSub:10.0,main:16.0,vs:17.0,division:9.0,section:8.8,fightLabel:8.4,fightName:10.2,nextLabel:8.4,nextTitle:11.0,nextMeta:8.8,nextCountdown:9.2,dashH:150,leftW:192,rightW:103,headerW:198,statusW:122,heroGap:24,pendingOffset:32};\nconst MEDIUM_UI={org:20.5,event:8.8,status:6.7,countdown:13.1,statusDate:7.5,statusLoc:7.5,heroGap:12,pending:14.4,pendingSub:7.5,main:14.3,mainLabel:7.5,vs:15.2,division:8.0,supportLabel:7.5,supportName:8.8,headerW:205,statusW:105};", 'medium tokens')

marker="const D=await loadData(),ctx=await heroContext(D);"
if marker not in s:
    raise SystemExit('missing render insertion marker')
helpers=r'''function mediumRightText(st,text,size,color,weight='semibold'){const row=st.addStack();row.addSpacer();const t=tx(row,text,size,color,weight,1);t.minimumScaleFactor=.68;t.rightAlignText();return t;}
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

'''
s=s.replace(marker,helpers+marker,1)

pattern=r"\}else\{w\.setPadding\(10,14,8,14\);[\s\S]*?\n\}\nw\.url="
replacement="""}else{w.setPadding(10,14,8,14);\nif(ctx.poster)w.backgroundImage=posterBg(ctx.poster);else if(ctx.a.image||ctx.b.image)w.backgroundImage=heroBg(ctx.a.image,ctx.b.image);else w.backgroundGradient=gradient();\nrenderMedium(w,D,ctx);\n}\nw.url="""
s2,n=re.subn(pattern,replacement,s,count=1)
if n!=1:
    raise SystemExit(f'medium block replacement count={n}')
s=s2
p.write_text(s)

# Typography regression: replace obsolete organization-specific Medium geometry guards with common Medium contract.
t=Path('tests/combat-hub-typography-regression.mjs')
r=t.read_text()
start=r.index('// Geometry remains frozen: final visual pass must not move the verified card structure.')
end=r.index("console.log('COMBAT HUB typography regression: OK');")
new_checks="""// Medium v7.17.0 uses one geometry and type scale across all organizations.\nassert.match(src, /const MEDIUM_UI=\\{org:20\\.5,event:8\\.8,status:6\\.7,countdown:13\\.1,statusDate:7\\.5,statusLoc:7\\.5,heroGap:12,pending:14\\.4,pendingSub:7\\.5,main:14\\.3,mainLabel:7\\.5,vs:15\\.2,division:8\\.0,supportLabel:7\\.5,supportName:8\\.8,headerW:205,statusW:105\\}/);\nassert.match(src, /function renderMedium\\(w,D,ctx\\)/);\nassert.match(src, /hl\\.size=new Size\\(MEDIUM_UI\\.headerW,0\\)/);\nassert.match(src, /status\\.size=new Size\\(MEDIUM_UI\\.statusW,0\\)/);\nassert.match(src, /mediumRightText\\(status,largeStatusHeading\\(D\\),MEDIUM_UI\\.status/);\nassert.match(src, /mediumRightText\\(status,largeStatusDate\\(D\\),MEDIUM_UI\\.statusDate/);\nassert.match(src, /mediumRightText\\(status,largeStatusLocation\\(D\\),MEDIUM_UI\\.statusLoc/);\nassert.match(src, /renderMediumMainName\\(aBox,ctx\\.a\\.name\\)/);\nassert.match(src, /renderMediumMainName\\(bBox,ctx\\.b\\.name\\)/);\nassert.match(src, /mediumSupportRow\\(w,row\\)/);\nassert.doesNotMatch(src, /const k1Inset=KEY==='k1'\\?10:0/);\nassert.doesNotMatch(src, /tx\\(meta,dateText\\(D\\),8\\.1/);\n\n"""
r=r[:start]+new_checks+r[end:]
t.write_text(r)

# K-1 regression now verifies it shares the same Medium geometry rather than a bespoke inset.
k=Path('tests/combat-hub-k1-layout-regression.mjs')
q=k.read_text()
q=re.sub(r"assert\.match\(src, /const k1Inset[\s\S]*?assert\.equal\(k1FixedWidth, oldFixedWidth, 'K-1 optical inset moved the center axis'\);\n\n", "assert.match(src, /const MEDIUM_UI=/, 'K-1 must use the shared Medium geometry');\nassert.match(src, /renderMediumMainName\\(aBox,ctx\\.a\\.name\\)/);\nassert.match(src, /renderMediumMainName\\(bBox,ctx\\.b\\.name\\)/);\nassert.doesNotMatch(src, /const k1Inset=KEY==='k1'\\?10:0/, 'K-1 Medium must not carry a bespoke optical inset');\n\n", q, count=1)
k.write_text(q)

# Large regression version only; Large geometry remains unchanged.
l=Path('tests/combat-hub-large-regression.mjs')
u=l.read_text().replace("const VERSION='7\\.16\\.1-github'", "const VERSION='7\\.17\\.0-github'").replace("COMBAT HUB Large v7.16.1 pending-balance regression: OK", "COMBAT HUB Large v7.17.0 preserved-geometry regression: OK")
l.write_text(u)

# Canonical handoff.
h=Path('HANDOFF.md')
x=h.read_text()
x=x.replace('Runtime: **v7.16.1-github**','Runtime: **v7.17.0-github**')
section='''\n## 6A. Medium UI architecture in v7.17.0\n\n- Physical iPhone review across UFC / RIZIN / ONE / BOXING / K-1 showed Medium geometry drifting by organization.\n- Medium now uses one shared header/status template: organization + event on the left, and `開催まで/開催状況` + countdown + date + location on the right.\n- Pending and confirmed states share the same header geometry. Organization differences are limited to data, accent color, and available background art.\n- K-1 no longer has a bespoke Medium optical inset; fighter slots, VS axis, support rows, and typography use shared MEDIUM_UI tokens.\n- Large v7.16.1 geometry and BOXING verified-cache-only safety are unchanged.\n'''
if '## 6A. Medium UI architecture in v7.17.0' not in x:
    anchor='## 7.'
    if anchor in x:
        x=x.replace(anchor,section+'\n'+anchor,1)
    else:
        x+=section
h.write_text(x)
