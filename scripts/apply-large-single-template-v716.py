from pathlib import Path

p=Path('combat-hub.js')
s=p.read_text()

def rep(old,new,label):
    global s
    if old not in s:
        raise SystemExit(f'missing target: {label}')
    s=s.replace(old,new,1)

rep("// v7.15.1-github — Large header alignment/pending balance polish; BOXING cache-only path preserved", "// v7.16.0-github — single Large header/status template across all organizations; BOXING cache-only path preserved", 'version comment')
rep("const VERSION='7.15.1-github';", "const VERSION='7.16.0-github';", 'version')
rep(
"const LARGE_UI={org:24,event:10.0,meta:9.2,status:6.8,countdown:12.4,heroLabel:7.4,pending:17.2,pendingSub:10.0,main:16.0,vs:17.0,division:9.0,section:8.8,fightLabel:8.4,fightName:10.2,nextLabel:8.4,nextTitle:11.0,nextMeta:8.8,nextCountdown:9.2,dashH:150,leftW:192,rightW:103,headerW:218,statusW:102};",
"const LARGE_UI={org:24,event:10.0,meta:9.2,status:6.8,countdown:12.4,statusDate:8.2,statusLoc:8.2,heroLabel:7.4,pending:17.2,pendingSub:10.0,main:16.0,vs:17.0,division:9.0,section:8.8,fightLabel:8.4,fightName:10.2,nextLabel:8.4,nextTitle:11.0,nextMeta:8.8,nextCountdown:9.2,dashH:150,leftW:192,rightW:103,headerW:198,statusW:122,heroGap:24};",
'LARGE_UI tokens')

anchor="function largeNextMeta(next){if(!next)return'';const d=next.timeTba?dateOnly(next.startAt):dateText(next);const loc=shortLoc(next.location||'');return loc?`${d}\\n${loc}`:d;}"
insert=anchor+"\nfunction largeStatusHeading(D){if(D?.timeTba)return'開催まで';const t=new Date(D?.startAt||0).getTime();if(!Number.isFinite(t)||t<=0)return'開催まで';return t>Date.now()?'開催まで':'開催状況';}\nfunction largeStatusDate(D){if(D?.nextPending)return'日程未定';if(D?.displayDate)return String(D.displayDate);const t=new Date(D?.startAt||0).getTime();if(!Number.isFinite(t)||t<=0)return'日程未定';return D.timeTba?dateOnly(D.startAt):dateText(D);}\nfunction largeStatusLocation(D){if(D?.nextPending)return'会場未定';const loc=shortLoc(D?.location||'');return loc||'会場未定';}\nfunction largeRightText(st,text,size,color,weight='semibold'){const row=st.addStack();row.addSpacer();const t=tx(row,text,size,color,weight,1);t.minimumScaleFactor=.70;t.rightAlignText();return t;}"
rep(anchor,insert,'Large status helpers')

old="""  const hl=h.addStack();hl.layoutVertically();hl.size=new Size(LARGE_UI.headerW,0);\n  tx(hl,S.label,LARGE_UI.org,new Color(C.text),'black');\n  hl.addSpacer(2);\n  const en=tx(hl,jpDisplay(D.name||''),LARGE_UI.event,new Color(S.accent),'bold',2);en.minimumScaleFactor=.76;\n  hl.addSpacer(4);\n  const meta=hl.addStack();\n  const dt=tx(meta,dateText(D),LARGE_UI.meta,new Color(C.sub),'semibold');dt.minimumScaleFactor=.78;meta.addSpacer(6);tx(meta,'·',7.8,new Color(C.muted));meta.addSpacer(6);const ml=tx(meta,shortLoc(D.location),LARGE_UI.meta,new Color(C.sub),'semibold');ml.minimumScaleFactor=.78;\n  h.addSpacer(8);\n  const status=h.addStack();status.layoutVertically();status.size=new Size(LARGE_UI.statusW,0);\n  const sl=status.addStack();sl.addSpacer();tx(sl,statusLabel(D),LARGE_UI.status,new Color(C.muted),'bold');\n  status.addSpacer(3);\n  const badgeRow=status.addStack();badgeRow.addSpacer();const badge=badgeRow.addStack();badge.backgroundColor=new Color('#05070B',.72);badge.cornerRadius=11;badge.borderWidth=.7;badge.borderColor=new Color(S.accent,.36);badge.setPadding(5,10,5,10);tx(badge,countdown(D),LARGE_UI.countdown,new Color(C.text),'black');\n  w.addSpacer(pending?40:26);"""
new="""  const hl=h.addStack();hl.layoutVertically();hl.size=new Size(LARGE_UI.headerW,0);\n  tx(hl,S.label,LARGE_UI.org,new Color(C.text),'black');\n  hl.addSpacer(2);\n  const en=tx(hl,jpDisplay(D.name||''),LARGE_UI.event,new Color(S.accent),'bold',2);en.minimumScaleFactor=.76;\n  h.addSpacer(8);\n  const status=h.addStack();status.layoutVertically();status.size=new Size(LARGE_UI.statusW,0);\n  largeRightText(status,largeStatusHeading(D),LARGE_UI.status,new Color(C.muted),'bold');\n  status.addSpacer(3);\n  const badgeRow=status.addStack();badgeRow.addSpacer();const badge=badgeRow.addStack();badge.backgroundColor=new Color('#05070B',.72);badge.cornerRadius=11;badge.borderWidth=.7;badge.borderColor=new Color(S.accent,.36);badge.setPadding(5,10,5,10);const cdt=tx(badge,countdown(D),LARGE_UI.countdown,new Color(C.text),'black');cdt.minimumScaleFactor=.78;\n  status.addSpacer(4);\n  largeRightText(status,largeStatusDate(D),LARGE_UI.statusDate,new Color(C.sub),'semibold');\n  status.addSpacer(2);\n  largeRightText(status,largeStatusLocation(D),LARGE_UI.statusLoc,new Color(C.sub),'semibold');\n  w.addSpacer(LARGE_UI.heroGap);"""
rep(old,new,'Large header/status block')

p.write_text(s)

# Tighten the Large regression contract around the single shared template.
t=Path('tests/combat-hub-large-regression.mjs')
r=t.read_text()
r=r.replace("const VERSION='7\\.15\\.1-github'", "const VERSION='7\\.16\\.0-github'")
r=r.replace(
"const LARGE_UI=\\{org:24,event:10\\.0,meta:9\\.2,status:6\\.8,countdown:12\\.4,heroLabel:7\\.4,pending:17\\.2,pendingSub:10\\.0,main:16\\.0,vs:17\\.0,division:9\\.0,section:8\\.8,fightLabel:8\\.4,fightName:10\\.2,nextLabel:8\\.4,nextTitle:11\\.0,nextMeta:8\\.8,nextCountdown:9\\.2,dashH:150,leftW:192,rightW:103,headerW:218,statusW:102\\}",
"const LARGE_UI=\\{org:24,event:10\\.0,meta:9\\.2,status:6\\.8,countdown:12\\.4,statusDate:8\\.2,statusLoc:8\\.2,heroLabel:7\\.4,pending:17\\.2,pendingSub:10\\.0,main:16\\.0,vs:17\\.0,division:9\\.0,section:8\\.8,fightLabel:8\\.4,fightName:10\\.2,nextLabel:8\\.4,nextTitle:11\\.0,nextMeta:8\\.8,nextCountdown:9\\.2,dashH:150,leftW:192,rightW:103,headerW:198,statusW:122,heroGap:24\\}")
r=r.replace("assert.match(src, /dateText\\(D\\),LARGE_UI\\.meta/);\nassert.match(src, /shortLoc\\(D\\.location\\),LARGE_UI\\.meta/);\nassert.match(src, /tx\\(sl,statusLabel\\(D\\),LARGE_UI\\.status/);\nassert.match(src, /countdown\\(D\\),LARGE_UI\\.countdown/);\nassert.match(src, /w\\.addSpacer\\(pending\\?40:26\\)/);",
"assert.match(src, /function largeStatusHeading\\(D\\)/);\nassert.match(src, /return'開催まで'/);\nassert.match(src, /function largeStatusDate\\(D\\)/);\nassert.match(src, /function largeStatusLocation\\(D\\)/);\nassert.match(src, /function largeRightText\\(st,text,size,color,weight='semibold'\\)/);\nassert.match(src, /largeRightText\\(status,largeStatusHeading\\(D\\),LARGE_UI\\.status/);\nassert.match(src, /countdown\\(D\\),LARGE_UI\\.countdown/);\nassert.match(src, /largeRightText\\(status,largeStatusDate\\(D\\),LARGE_UI\\.statusDate/);\nassert.match(src, /largeRightText\\(status,largeStatusLocation\\(D\\),LARGE_UI\\.statusLoc/);\nassert.match(src, /w\\.addSpacer\\(LARGE_UI\\.heroGap\\)/);")
r=r.replace("assert.match(src, /const badgeRow=status\\.addStack\\(\\);badgeRow\\.addSpacer\\(\\);const badge=badgeRow\\.addStack\\(\\)/);", "assert.match(src, /const badgeRow=status\\.addStack\\(\\);badgeRow\\.addSpacer\\(\\);const badge=badgeRow\\.addStack\\(\\)/);\nassert.doesNotMatch(src, /const meta=hl\\.addStack\\(\\);\\n  const dt=tx\\(meta,dateText\\(D\\),LARGE_UI\\.meta/);\nassert.doesNotMatch(src, /statusLabel\\(D\\),LARGE_UI\\.status/);")
r=r.replace("COMBAT HUB Large v7.15.1 alignment polish regression: OK", "COMBAT HUB Large v7.16.0 single-template regression: OK")
t.write_text(r)

# Update handoff baseline and the accepted layout rule.
h=Path('HANDOFF.md')
x=h.read_text()
x=x.replace('Runtime: **v7.15.1-github**','Runtime: **v7.16.0-github**')
x=x.replace('## 6. Large UI architecture in v7.15.0','## 6. Large UI architecture in v7.16.0')
needle='- `LARGE_UI` is the canonical Large typography/geometry token set.\n'
extra='- Header geometry is now one strict template for all five organizations: organization/event on the left, then a fixed right status column ordered as `開催まで` / countdown / event date-time / location.\n- `開催` alone is not used in the Large header. Time-TBA events still show `開催まで`, then `時刻未定`, then the known event date and location.\n- Current event date/location are no longer rendered in the Large left header, preventing organization-specific drift.\n'
if extra not in x:
    x=x.replace(needle,needle+extra)
h.write_text(x)
