from pathlib import Path

p=Path('combat-hub.js')
s=p.read_text()

def rep(old,new,label):
    global s
    if old not in s:
        raise SystemExit(f'missing target: {label}')
    s=s.replace(old,new,1)

rep("// v7.15.0-github — unified Large layout/typography across organizations; BOXING cache-only path preserved", "// v7.15.1-github — Large header alignment/pending balance polish; BOXING cache-only path preserved", 'version comment')
rep("const VERSION='7.15.0-github';", "const VERSION='7.15.1-github';", 'version')
rep("const LARGE_UI={org:24,event:10.0,meta:9.2,status:6.8,countdown:12.4,heroLabel:7.4,pending:17.2,pendingSub:10.0,main:16.0,vs:17.0,division:9.0,section:8.8,fightLabel:8.4,fightName:10.2,nextLabel:8.4,nextTitle:11.0,nextMeta:8.8,nextCountdown:9.2,dashH:150,leftW:192,rightW:103};", "const LARGE_UI={org:24,event:10.0,meta:9.2,status:6.8,countdown:12.4,heroLabel:7.4,pending:17.2,pendingSub:10.0,main:16.0,vs:17.0,division:9.0,section:8.8,fightLabel:8.4,fightName:10.2,nextLabel:8.4,nextTitle:11.0,nextMeta:8.8,nextCountdown:9.2,dashH:150,leftW:192,rightW:103,headerW:218,statusW:102};", 'Large UI geometry tokens')
rep("function largeNextMeta(next){if(!next)return'';const d=next.timeTba?dateOnly(next.startAt):dateText(next);const loc=shortLoc(next.location||'');return loc?`${d} · ${loc}`:d;}", "function largeNextMeta(next){if(!next)return'';const d=next.timeTba?dateOnly(next.startAt):dateText(next);const loc=shortLoc(next.location||'');return loc?`${d}\\n${loc}`:d;}", 'next-event deliberate line break')
rep("  const hl=h.addStack();hl.layoutVertically();\n  tx(hl,S.label,LARGE_UI.org,new Color(C.text),'black');", "  const hl=h.addStack();hl.layoutVertically();hl.size=new Size(LARGE_UI.headerW,0);\n  tx(hl,S.label,LARGE_UI.org,new Color(C.text),'black');", 'fixed header column')
rep("  h.addSpacer();\n  const status=h.addStack();status.layoutVertically();\n  const sl=status.addStack();sl.addSpacer();tx(sl,statusLabel(D),LARGE_UI.status,new Color(C.muted),'bold');status.addSpacer(3);\n  const badge=status.addStack();badge.backgroundColor=new Color('#05070B',.72);badge.cornerRadius=11;badge.borderWidth=.7;badge.borderColor=new Color(S.accent,.36);badge.setPadding(5,10,5,10);tx(badge,countdown(D),LARGE_UI.countdown,new Color(C.text),'black');\n  w.addSpacer(pending?20:26);", "  h.addSpacer(8);\n  const status=h.addStack();status.layoutVertically();status.size=new Size(LARGE_UI.statusW,0);\n  const sl=status.addStack();sl.addSpacer();tx(sl,statusLabel(D),LARGE_UI.status,new Color(C.muted),'bold');\n  status.addSpacer(3);\n  const badgeRow=status.addStack();badgeRow.addSpacer();const badge=badgeRow.addStack();badge.backgroundColor=new Color('#05070B',.72);badge.cornerRadius=11;badge.borderWidth=.7;badge.borderColor=new Color(S.accent,.36);badge.setPadding(5,10,5,10);tx(badge,countdown(D),LARGE_UI.countdown,new Color(C.text),'black');\n  w.addSpacer(pending?40:26);", 'right-aligned status block and pending balance')
p.write_text(s)

# Update the Large regression contract for the new geometry.
t=Path('tests/combat-hub-large-regression.mjs')
r=t.read_text()
r=r.replace("const VERSION='7\\.15\\.0-github'", "const VERSION='7\\.15\\.1-github'")
r=r.replace("rightW:103\\}/", "rightW:103,headerW:218,statusW:102\\}/")
r=r.replace("assert.match(src, /w\\.addSpacer\\(pending\\?20:26\\)/);", "assert.match(src, /w\\.addSpacer\\(pending\\?40:26\\)/);\nassert.match(src, /hl\\.size=new Size\\(LARGE_UI\\.headerW,0\\)/);\nassert.match(src, /status\\.size=new Size\\(LARGE_UI\\.statusW,0\\)/);\nassert.match(src, /const badgeRow=status\\.addStack\\(\\);badgeRow\\.addSpacer\\(\\);const badge=badgeRow\\.addStack\\(\\)/);\nassert.match(src, /return loc\\?`\\$\\{d\\}\\\\n\\$\\{loc\\}`:d;/, 'Next-event meta must use a deliberate two-line layout');")
r=r.replace("COMBAT HUB Large v7.15.0 unified layout regression: OK", "COMBAT HUB Large v7.15.1 alignment polish regression: OK")
t.write_text(r)

# Keep canonical handoff current.
h=Path('HANDOFF.md')
if h.exists():
    x=h.read_text()
    x=x.replace('Runtime: **v7.15.0-github**','Runtime: **v7.15.1-github**')
    x=x.replace('v7.15.0 unifies the Large visual system across all five organizations while preserving BOXING low-memory/cache-only safety.','v7.15.1 keeps the shared Large system and aligns the right-side status/countdown block, deliberately balances pending-state vertical spacing, and formats next-event metadata as controlled two-line text while preserving BOXING low-memory/cache-only safety.')
    h.write_text(x)
