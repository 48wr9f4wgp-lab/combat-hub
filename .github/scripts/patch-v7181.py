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
    "// v7.18.0-github — RIZIN/ONE known-event card refresh; Medium/Large visual geometry frozen",
    "// v7.18.1-github — separate event-discovery TTL from RIZIN/ONE card-refresh TTL",
    'version comment')
s=replace_once(s,"const VERSION='7.18.0-github';","const VERSION='7.18.1-github';",'version')
old="if(cachedData&&now-Number(cached.savedAt)<4*3600000&&rollforwardEligible(snap,cachedData,now)){const age=now-Number(cached.savedAt);if((KEY==='rizin'||KEY==='one')&&age>=KNOWN_EVENT_CARD_REFRESH_MS){const refreshed=await refreshKnownRollforwardEvent(cachedData);writeJSON(path,{savedAt:now,data:refreshed});return refreshed;}return cachedData;}"
new="if(cachedData&&now-Number(cached.savedAt)<4*3600000&&rollforwardEligible(snap,cachedData,now)){const cardAge=now-Number(cached?.cardRefreshedAt??cached.savedAt);if((KEY==='rizin'||KEY==='one')&&cardAge>=KNOWN_EVENT_CARD_REFRESH_MS){const refreshed=await refreshKnownRollforwardEvent(cachedData);writeJSON(path,{savedAt:Number(cached.savedAt)||now,cardRefreshedAt:now,data:refreshed});return refreshed;}return cachedData;}"
s=replace_once(s,old,new,'cached card refresh envelope')
s=replace_once(s,
    "const live=await strictNextEvent(snap);if(live&&rollforwardEligible(snap,live,now)){writeJSON(path,{savedAt:now,data:live});return live;}",
    "const live=await strictNextEvent(snap);if(live&&rollforwardEligible(snap,live,now)){writeJSON(path,{savedAt:now,cardRefreshedAt:now,data:live});return live;}",
    'live discovery envelope')
s=replace_once(s,
    "const trusted=trustedRollforward(snap);if(trusted){writeJSON(path,{savedAt:now,data:trusted});return trusted;}",
    "const trusted=trustedRollforward(snap);if(trusted){writeJSON(path,{savedAt:now,cardRefreshedAt:now,data:trusted});return trusted;}",
    'trusted discovery envelope')
p.write_text(s)

# Static regression guards.
t=Path('tests/combat-hub-event-transition-regression.mjs')
ts=t.read_text()
needle="assert.match(src,/cardRefreshed:true/,'known-event card refresh marker missing');\n"
extra=needle+"assert.match(src,/cardAge=now-Number\\(cached\\?\\.cardRefreshedAt\\?\\?cached\\.savedAt\\)/,'card refresh age must be independent of discovery age');\nassert.match(src,/savedAt:Number\\(cached\\.savedAt\\)\\|\\|now,cardRefreshedAt:now,data:refreshed/,'card refresh must preserve discovery savedAt');\n"
ts=replace_once(ts,needle,extra,'event transition cache separation guards')
t.write_text(ts)

# Dynamic cache behavior regression.
c=Path('tests/combat-hub-cache-regression.mjs')
cs=c.read_text()
anchor="// BOXING widget mode must ignore legacy/unverified next-event cache and perform zero discovery network work.\n"
block="""// RIZIN/ONE card refresh must not extend the 4h event-discovery TTL.\n{\n  const now=Date.parse('2026-09-14T12:00:00+09:00');\n  const source='https://www.onefc.com/events/one-friday-fights-171/';\n  const detail='<tr class=\"vs\"><a title=\"Klarob NuiCafeboran\"></a><a title=\"Sornsueknoi FA Group\"></a></tr><tr class=\"vs\"><a title=\"Petsuphan Lookmuangpet\"></a><a title=\"Mahar Thway\"></a></tr>';\n  const {api,fm,requests}=await boot('ONE',{now,textResponses:{[source]:detail}});\n  const path='/docs/combat-hub-next-one.json';\n  const discoveredAt=now-2*3600_000;\n  fm.api.writeString(path,JSON.stringify({savedAt:discoveredAt,cardRefreshedAt:now-31*60_000,data:{name:'ONE Friday Fights 171 & The Inner Circle 31',startAt:'2026-09-18T00:00:00+09:00',location:'バンコク',source,main:{a:'Old A',b:'Old B',context:'MAIN EVENT'},support:[],cardTba:false}}));\n  const data=await api.loadData();\n  assert.equal(data.main.a,'Klarob NuiCafeboran');\n  assert.equal(data.main.b,'Sornsueknoi FA Group');\n  assert.ok(stringRequests(requests).some(r=>r.url===source),'Known ONE event detail should refresh after 30m');\n  const saved=JSON.parse(fm.api.readString(path));\n  assert.equal(saved.savedAt,discoveredAt,'Card refresh must preserve discovery timestamp');\n  assert.equal(saved.cardRefreshedAt,now,'Card refresh timestamp must advance independently');\n}\n\n"""
if block not in cs:
    if anchor not in cs:
        raise SystemExit('missing cache dynamic test anchor')
    cs=cs.replace(anchor,block+anchor,1)
c.write_text(cs)

h=Path('HANDOFF.md')
hs=h.read_text()
hs=hs.replace('- Runtime: **v7.18.0-github**','- Runtime: **v7.18.1-github**',1)
needle='- Snapshot-locked RIZIN/ONE current events use the same 30-minute detail refresh cadence; other organizations keep the existing two-hour locked-current cache.\n'
extra=needle+'- Roll-forward cache stores event-discovery age (`savedAt`) separately from card-detail refresh age (`cardRefreshedAt`), so 30-minute card refreshes never postpone the four-hour new-event discovery cycle.\n'
hs=replace_once(hs,needle,extra,'handoff cache separation note')
hs=hs.replace('- runtime `7.18.0-github`','- runtime `7.18.1-github`')
h.write_text(hs)
