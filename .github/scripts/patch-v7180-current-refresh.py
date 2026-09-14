from pathlib import Path


def replace_once(text, old, new, label):
    if new in text:
        return text
    if old not in text:
        raise SystemExit(f'missing target: {label}')
    return text.replace(old, new, 1)

p=Path('combat-hub.js')
s=p.read_text()
old="async function refreshLockedCurrent(snap){const path=cacheFile(`combat-hub-current-${KEY}.json`),cached=readJSON(path),now=Date.now();if(cached?.data&&now-Number(cached.savedAt)<2*3600000)return{...snap,...cached.data};"
new="async function refreshLockedCurrent(snap){const path=cacheFile(`combat-hub-current-${KEY}.json`),cached=readJSON(path),now=Date.now(),refreshTtl=(KEY==='rizin'||KEY==='one')?30*60*1000:2*3600000;if(cached?.data&&now-Number(cached.savedAt)<refreshTtl)return{...snap,...cached.data};"
s=replace_once(s,old,new,'current locked refresh TTL')
p.write_text(s)

t=Path('tests/combat-hub-event-transition-regression.mjs')
ts=t.read_text()
needle="assert.match(src,/const KNOWN_EVENT_CARD_REFRESH_MS=30\\*60\\*1000/,'RIZIN/ONE known-event refresh cadence missing');\n"
extra=needle+"assert.match(src,/refreshTtl=\\(KEY==='rizin'\\|\\|KEY==='one'\\)\\?30\\*60\\*1000:2\\*3600000/,'snapshot-locked RIZIN/ONE cards must refresh every 30 minutes');\n"
ts=replace_once(ts,needle,extra,'current refresh regression guard')
t.write_text(ts)

h=Path('HANDOFF.md')
hs=h.read_text()
needle='- Once RIZIN or ONE has a known eligible event source, its official event-detail page is refreshed every 30 minutes to pick up card changes without repeating full event discovery.\n'
extra=needle+'- Snapshot-locked RIZIN/ONE current events use the same 30-minute detail refresh cadence; other organizations keep the existing two-hour locked-current cache.\n'
hs=replace_once(hs,needle,extra,'handoff current refresh note')
h.write_text(hs)
