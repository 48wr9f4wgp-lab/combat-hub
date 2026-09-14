from pathlib import Path


def replace_once(text, old, new, label):
    if new in text:
        return text
    if old not in text:
        raise SystemExit(f'missing target: {label}')
    return text.replace(old, new, 1)

p=Path('combat-hub.js')
s=p.read_text()
s=replace_once(s,
    "// v7.19.0-github — time-TBA transition grace; frozen visual geometry preserved",
    "// v7.19.1-github — transition timeline hardening; frozen visual geometry preserved",
    'version comment')
s=replace_once(s,"const VERSION='7.19.0-github';","const VERSION='7.19.1-github';",'version')
old="function sameEventIdentity(a,b){if(!a||!b)return false;const as=eventSourceKey(a),bs=eventSourceKey(b);if(as&&bs&&as===bs)return true;const an=eventIdentityText(a.name),bn=eventIdentityText(b.name);if(an&&bn&&an===bn)return true;if(a.main&&b.main&&sameFight(a.main.a,a.main.b,b.main.a,b.main.b))return true;return false;}"
new="function genericEventIdentityName(v){const n=eventIdentityText(v);return n==='ufcfightnight';}\nfunction sameEventIdentity(a,b){if(!a||!b)return false;const as=eventSourceKey(a),bs=eventSourceKey(b);if(as&&bs&&as===bs)return true;const an=eventIdentityText(a.name),bn=eventIdentityText(b.name);if(an&&bn&&an===bn&&!genericEventIdentityName(a.name))return true;if(a.main&&b.main&&sameFight(a.main.a,a.main.b,b.main.a,b.main.b))return true;return false;}"
s=replace_once(s,old,new,'generic UFC event identity')
p.write_text(s)

# Add a static guard beside the dynamic five-series timeline QA.
t=Path('tests/combat-hub-event-transition-regression.mjs')
ts=t.read_text()
needle="assert.match(src,/function sameEventIdentity\\(/);\n"
extra=needle+"assert.match(src,/function genericEventIdentityName\\(v\\)\\{const n=eventIdentityText\\(v\\);return n==='ufcfightnight';\\}/,'generic UFC fallback identity guard missing');\n"
ts=replace_once(ts,needle,extra,'generic identity static guard')
t.write_text(ts)

h=Path('HANDOFF.md')
hs=h.read_text()
hs=hs.replace('Updated: 2026-09-14 JST','Updated: 2026-09-15 JST',1)
hs=hs.replace('- Runtime: **v7.19.0-github**','- Runtime: **v7.19.1-github**',1)
needle='- Event identity uses source/name/main-fight matching and time bounds.\n'
extra=needle+'- Generic UFC listing fallback name `UFC Fight Night` is intentionally weak identity: distinct official event URLs remain distinct so sequential Fight Night cards cannot collapse into one event during roll-forward.\n'
hs=replace_once(hs,needle,extra,'handoff generic identity note')
h.write_text(hs)
