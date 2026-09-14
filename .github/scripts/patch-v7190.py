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
    "// v7.18.1-github — separate event-discovery TTL from RIZIN/ONE card-refresh TTL",
    "// v7.19.0-github — time-TBA transition grace; frozen visual geometry preserved",
    'version comment')
s=replace_once(s,"const VERSION='7.18.1-github';","const VERSION='7.19.0-github';",'version')
s=replace_once(s,
    "function currentLocked(snap){const end=new Date(snap.startAt).getTime()+12*3600000;return Date.now()<end;}",
    "function currentGraceMs(e){return e?.timeTba?36*3600000:12*3600000;}\nfunction currentLocked(snap){const end=new Date(snap.startAt).getTime()+currentGraceMs(snap);return Date.now()<end;}",
    'current lock grace')
s=replace_once(s,
    "function rollforwardEligible(base,e,now=Date.now()){const t=new Date(e?.startAt).getTime(),baseT=new Date(base?.startAt).getTime();return Number.isFinite(t)&&Number.isFinite(baseT)&&t>baseT+6*3600000&&t>now-12*3600000&&t<now+180*86400000&&validOrgName(e?.name)&&!sameEventIdentity(base,e);}",
    "function rollforwardEligible(base,e,now=Date.now()){const t=new Date(e?.startAt).getTime(),baseT=new Date(base?.startAt).getTime();return Number.isFinite(t)&&Number.isFinite(baseT)&&t>baseT+6*3600000&&t>now-currentGraceMs(e)&&t<now+180*86400000&&validOrgName(e?.name)&&!sameEventIdentity(base,e);}",
    'rollforward grace')
p.write_text(s)

# Transition regression: guard both exact-time and TBA grace.
t=Path('tests/combat-hub-event-transition-regression.mjs')
ts=t.read_text()
needle="assert.match(src,/function rollforwardEligible\\(/);\n"
extra=needle+"assert.match(src,/function currentGraceMs\\(e\\)\\{return e\\?\\.timeTba\\?36\\*3600000:12\\*3600000;\\}/,'time-TBA current grace helper missing');\nassert.match(src,/currentGraceMs\\(snap\\)/,'currentLocked must use time-aware grace');\nassert.match(src,/t>now-currentGraceMs\\(e\\)/,'rollforward eligibility must use time-aware grace');\n"
ts=replace_once(ts,needle,extra,'static grace guards')
old="const rollOk=(key,base,e,now)=>{const t=Date.parse(e.startAt),bt=Date.parse(base.startAt);return Number.isFinite(t)&&Number.isFinite(bt)&&t>bt+6*H&&t>now-12*H&&t<now+180*D&&validName(key,e.name)&&!same(base,e)};"
new="const rollOk=(key,base,e,now)=>{const t=Date.parse(e.startAt),bt=Date.parse(base.startAt),grace=e?.timeTba?36*H:12*H;return Number.isFinite(t)&&Number.isFinite(bt)&&t>bt+6*H&&t>now-grace&&t<now+180*D&&validName(key,e.name)&&!same(base,e)};"
ts=replace_once(ts,old,new,'dynamic rollforward helper')
anchor="const k1={name:'K-1 WORLD MAX 2026',startAt:'2026-09-12T12:00:00+09:00',source:'a'};\n"
block="""const tbaBase={name:'K-1 WORLD MAX 2026',startAt:'2026-09-12T12:00:00+09:00',source:'a'};\nconst tbaEvent={name:'K-1 FIGHTING NETWORK in Sangju Korea 2026',startAt:'2026-09-19T00:00:00+09:00',source:'b',timeTba:true};\nassert.equal(rollOk('k1',tbaBase,tbaEvent,Date.parse('2026-09-19T18:00:00+09:00')),true,'time-TBA event must remain current through the event date');\nassert.equal(rollOk('k1',tbaBase,tbaEvent,Date.parse('2026-09-20T13:00:00+09:00')),false,'time-TBA grace must eventually expire after 36h');\nconst exactEvent={name:'K-1 TEST EVENT',startAt:'2026-09-19T10:00:00+09:00',source:'c',timeTba:false};\nassert.equal(rollOk('k1',tbaBase,exactEvent,Date.parse('2026-09-19T21:30:00+09:00')),true,'exact-time event must retain the existing 12h grace');\nassert.equal(rollOk('k1',tbaBase,exactEvent,Date.parse('2026-09-19T22:30:00+09:00')),false,'exact-time event must expire after 12h');\n\n"""
if block not in ts:
    if anchor not in ts:
        raise SystemExit('missing TBA test anchor')
    ts=ts.replace(anchor,block+anchor,1)
t.write_text(ts)

h=Path('HANDOFF.md')
hs=h.read_text()
hs=hs.replace('- Runtime: **v7.18.1-github**','- Runtime: **v7.19.0-github**',1)
needle='- Roll-forward cache stores event-discovery age (`savedAt`) separately from card-detail refresh age (`cardRefreshedAt`), so 30-minute card refreshes never postpone the four-hour new-event discovery cycle.\n'
extra=needle+'- Events with `timeTba=true` use a 36-hour transition grace from their date-only midnight placeholder; exact-time events keep the existing 12-hour grace. This prevents K-1/BOXING-style date-only events from rolling forward at noon before the event has actually happened.\n'
hs=replace_once(hs,needle,extra,'handoff time-TBA note')
hs=hs.replace('- runtime `7.18.1-github`','- runtime `7.19.0-github`')
h.write_text(hs)
