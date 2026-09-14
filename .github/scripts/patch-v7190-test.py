from pathlib import Path
p=Path('tests/combat-hub-regression.mjs')
s=p.read_text()
old="has(/function currentLocked\\(snap\\)\\{const end=new Date\\(snap\\.startAt\\)\\.getTime\\(\\)\\+12\\*3600000;return Date\\.now\\(\\)<end;\\}/, '12h current-event lock guard missing');"
new="has(/function currentGraceMs\\(e\\)\\{return e\\?\\.timeTba\\?36\\*3600000:12\\*3600000;\\}/, 'time-aware current-event grace missing');\nhas(/function currentLocked\\(snap\\)\\{const end=new Date\\(snap\\.startAt\\)\\.getTime\\(\\)\\+currentGraceMs\\(snap\\);return Date\\.now\\(\\)<end;\\}/, 'time-aware current-event lock guard missing');"
if new not in s:
    if old not in s:
        raise SystemExit('missing old current lock regression guard')
    s=s.replace(old,new,1)
p.write_text(s)
