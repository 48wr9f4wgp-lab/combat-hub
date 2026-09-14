from pathlib import Path

p=Path('combat-hub.js')
s=p.read_text()

def rep(old,new,label):
    global s
    if old not in s:
        raise SystemExit(f'missing target: {label}')
    s=s.replace(old,new,1)

rep("// v7.16.0-github — single Large header/status template across all organizations; BOXING cache-only path preserved", "// v7.16.1-github — Large pending-state vertical balance polish; single header/status template preserved", 'version comment')
rep("const VERSION='7.16.0-github';", "const VERSION='7.16.1-github';", 'version')
rep("headerW:198,statusW:122,heroGap:24};", "headerW:198,statusW:122,heroGap:24,pendingOffset:32};", 'pendingOffset token')
rep("  w.addSpacer(LARGE_UI.heroGap);\n  if(pending){", "  w.addSpacer(LARGE_UI.heroGap);\n  if(pending)w.addSpacer(LARGE_UI.pendingOffset);\n  if(pending){", 'pending offset insertion')
p.write_text(s)

# Lock the regression contract to the visual fix.
t=Path('tests/combat-hub-large-regression.mjs')
r=t.read_text()
r=r.replace("const VERSION='7\\.16\\.0-github'", "const VERSION='7\\.16\\.1-github'")
r=r.replace("headerW:198,statusW:122,heroGap:24\\}", "headerW:198,statusW:122,heroGap:24,pendingOffset:32\\}")
r=r.replace("assert.match(src, /w\\.addSpacer\\(LARGE_UI\\.heroGap\\)/);", "assert.match(src, /w\\.addSpacer\\(LARGE_UI\\.heroGap\\)/);\nassert.match(src, /if\\(pending\\)w\\.addSpacer\\(LARGE_UI\\.pendingOffset\\)/);")
r=r.replace("COMBAT HUB Large v7.16.0 single-template regression: OK", "COMBAT HUB Large v7.16.1 pending-balance regression: OK")
t.write_text(r)

# Update canonical handoff.
h=Path('HANDOFF.md')
x=h.read_text()
x=x.replace('Runtime: **v7.16.0-github**','Runtime: **v7.16.1-github**')
x=x.replace('## 6. Large UI architecture in v7.16.0','## 6. Large UI architecture in v7.16.1')
needle='- Current event date/location are no longer rendered in the Large left header, preventing organization-specific drift.\n'
extra='- Physical iPhone review of K-1 and UFC pending states after v7.16.0 showed excessive dead space below the pending message; v7.16.1 adds a shared pending-only vertical offset while keeping the header geometry identical across organizations.\n'
if extra not in x:
    x=x.replace(needle,needle+extra)
h.write_text(x)
