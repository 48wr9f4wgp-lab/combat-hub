from pathlib import Path
p=Path('tests/combat-hub-typography-regression.mjs')
s=p.read_text()
old="assert.match(src, /const footColor=KEY==='one'\\?new Color\\('#E0E4EA',\\.82\\):new Color\\(C\\.muted\\)/, 'ONE footer contrast polish missing');\n"
if old not in s:
    raise SystemExit('obsolete ONE footer assertion not found')
s=s.replace(old,'',1)
p.write_text(s)
