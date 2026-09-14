from pathlib import Path


def replace_once(text, old, new, label):
    if new in text:
        return text
    if old not in text:
        raise SystemExit(f'missing target: {label}')
    return text.replace(old, new, 1)

p = Path('combat-hub.js')
s = p.read_text()
s = replace_once(
    s,
    "// v7.17.1-github — K-1 Medium contrast polish; shared Medium geometry and Large v7.16.1 preserved",
    "// v7.18.0-github — RIZIN/ONE known-event card refresh; Medium/Large visual geometry frozen",
    'version comment',
)
s = replace_once(s, "const VERSION='7.17.1-github';", "const VERSION='7.18.0-github';", 'version')
anchor = "async function refreshLockedCurrent(snap){const path=cacheFile(`combat-hub-current-${KEY}.json`),cached=readJSON(path),now=Date.now();if(cached?.data&&now-Number(cached.savedAt)<2*3600000)return{...snap,...cached.data};try{const html=await reqText(snap.source,8),pairs=currentPagePairs(html);let data={posterURL:metaImage(html,snap.source)};if(pairs.length&&sameFight(pairs[0].a,pairs[0].b,snap.main.a,snap.main.b)){const parsed=pairs.slice(1,5).map((p,i)=>({label:i?'MAIN CARD':'CO-MAIN',a:p.a,b:p.b})),seen=new Set(parsed.map(r=>`${r.a}|${r.b}`));for(const r of (snap.support||[])){if(parsed.length>=5)break;const k=`${r.a}|${r.b}`;if(!seen.has(k)){seen.add(k);parsed.push(r);}}data={...data,main:{...snap.main,a:pairs[0].a,b:pairs[0].b},support:parsed,cardTba:false};}writeJSON(path,{savedAt:now,data});return{...snap,...data};}catch(_){return cached?.data?{...snap,...cached.data}:snap;}}\n"
insert = anchor + "const KNOWN_EVENT_CARD_REFRESH_MS=30*60*1000;\nasync function refreshKnownRollforwardEvent(data){if(!data?.source||(KEY!=='rizin'&&KEY!=='one'))return data;try{const html=await reqText(data.source,8),pairs=currentPagePairs(html);if(!pairs.length)return data;const main={...(data.main||{}),a:pairs[0].a,b:pairs[0].b},support=pairs.slice(1,5).map((p,i)=>({label:i?'FEATURED':'CO-MAIN',a:p.a,b:p.b}));return{...data,main,support,cardTba:false,posterURL:metaImage(html,data.source)||data.posterURL||null,cardRefreshed:true};}catch(_){return data;}}\n"
s = replace_once(s, anchor, insert, 'known-event refresh helper')
old_cache = "if(cachedData&&now-Number(cached.savedAt)<4*3600000&&rollforwardEligible(snap,cachedData,now))return cachedData;"
new_cache = "if(cachedData&&now-Number(cached.savedAt)<4*3600000&&rollforwardEligible(snap,cachedData,now)){const age=now-Number(cached.savedAt);if((KEY==='rizin'||KEY==='one')&&age>=KNOWN_EVENT_CARD_REFRESH_MS){const refreshed=await refreshKnownRollforwardEvent(cachedData);writeJSON(path,{savedAt:now,data:refreshed});return refreshed;}return cachedData;}"
s = replace_once(s, old_cache, new_cache, 'cached roll-forward freshness')
p.write_text(s)

t = Path('tests/combat-hub-event-transition-regression.mjs')
ts = t.read_text()
needle = "assert.match(src,/function nextEligible\\(/);\n"
extra = needle + "assert.match(src,/const KNOWN_EVENT_CARD_REFRESH_MS=30\\*60\\*1000/,'RIZIN/ONE known-event refresh cadence missing');\nassert.match(src,/async function refreshKnownRollforwardEvent\\(data\\)/,'RIZIN/ONE direct card refresh helper missing');\nassert.match(src,/\\(KEY==='rizin'\\|\\|KEY==='one'\\)&&age>=KNOWN_EVENT_CARD_REFRESH_MS/,'freshness gate must stay scoped to RIZIN/ONE');\nassert.match(src,/cardRefreshed:true/,'known-event card refresh marker missing');\n"
ts = replace_once(ts, needle, extra, 'event-transition freshness guards')
t.write_text(ts)

h = Path('HANDOFF.md')
hs = h.read_text()
hs = hs.replace('- Runtime: **v7.17.1-github**', '- Runtime: **v7.18.0-github**', 1)
section_anchor = '## 7. BOXING architecture in v7.14.0\n'
section = "## 6C. RIZIN / ONE known-event card freshness in v7.18.0\n\n- Medium/Large visual geometry is frozen; this pass changes data freshness only.\n- Discovery of a new event remains cached for up to four hours to avoid repeated heavy listing/deep discovery work.\n- Once RIZIN or ONE has a known eligible event source, its official event-detail page is refreshed every 30 minutes to pick up card changes without repeating full event discovery.\n- A successful detail refresh updates main/support cards and poster metadata while preserving the event identity/time/location already validated by roll-forward logic.\n- If detail refresh fails or yields no card pairs, the last known valid cached event/card is preserved.\n- BOXING verified-cache-only Widget safety, Loader v4.2.0, Large v7.16.1 geometry, Medium v7.17.x geometry, and friends-stable are unchanged.\n\n"
if section not in hs:
    if section_anchor not in hs:
        raise SystemExit('missing HANDOFF section anchor')
    hs = hs.replace(section_anchor, section + section_anchor, 1)
hs = hs.replace('- runtime `7.14.0-github`', '- runtime `7.18.0-github`')
h.write_text(hs)
