# COMBAT HUB — Development Handoff

Updated: 2026-09-20 JST

> **This file is the canonical handoff for the current project state.**
> Always fetch current GitHub `main` first. Actual code + this file take priority over old chat logs and `HANDOFF_CODEX.md`.

## 1. Product / target

COMBAT HUB is a personal iOS/iPadOS **Scriptable home-screen combat-sports widget** supporting:

- `UFC`
- `RIZIN`
- `ONE`
- `BOXING`
- `K1`

Target quality:

- Small / Medium / Large geometry remains frozen at the verified baselines. v7.22.10 remains the current VERIFIED_BASELINE; v7.23.2 changes BOXING candidate sanitization/dedupe/cache semantics only and requires targeted BOXING Medium + Large physical QA before promotion.
- Japanese-first premium sports/event UI.
- Event/date/time/location/countdown/main/support cards readable at a glance.
- Never invent fighters, cards, dates, times or venues.
- Current and next event identity must never duplicate.
- Network/parser/image failures must degrade safely rather than blank when possible.
- CI is necessary but runtime-affecting work is not complete until relevant physical-device verification.

## 2. Canonical production baseline

- Repository: `48wr9f4wgp-lab/combat-hub`
- Production branch: `main`
- Production route: `combat-hub-loader.js` -> raw GitHub `main/combat-hub.js`
- Loader: **v4.2.0**
- Production runtime: **v7.23.2-github**.
- Latest runtime-changing PR: **#93 — canonicalize BOXING candidates before highlight dedupe**.
- Runtime merge commit: `f4837ba68bfc567de2dc8b22a832def50d45f47f`.
- Main Regression after PR #93: **#878 success**.
- v7.22.4 keeps all v7.22.0-v7.22.3 data/image/BOXING/context hardening and additionally prevents K-1 from treating broad-context `注目/Featured` text as an authoritative fight-role label.
- K-1 support-order fallback remains the canonical policy: second fight = CO-MAIN/セミ, third and later = MAIN CARD/本戦 unless an explicit trusted label applies.
- `CARD_POLICY_VERSION=10` is the current canonical card-policy version.
- `LARGE_NEXT_POLICY_VERSION=3` invalidates pre-v7.22.9 unresolved/generic Large-next cache entries.
- Small/Medium/Large geometry and Loader v4.2.0 remain unchanged.
- v7.22.5 corrects K-1 Large support-role normalization and migrates to `CARD_POLICY_VERSION=6`. v7.22.6 additionally enforces K-1 poster-gallery priority, rejects generic logo/icon artwork, and migrates image metadata to `IMAGE_POLICY_VERSION=2`. Physical iPhone QA on 2026-09-18 passed, so v7.22.6 remains the previous `VERIFIED_BASELINE` for that validated scope.
- v7.22.7 hardens live-source transition discovery and event isolation: current UFC anchor-card markup, K-1 schedule parsing, verified future fallbacks, neutral safe-pending state, cross-event context/profile isolation, ONE discipline context, and LaLa arena TOKYO-BAY -> 千葉・船橋 normalization. Geometry and Loader are unchanged.
- Physical iPhone QA on v7.22.7 (2026-09-20) showed: RIZIN Large PASS; UFC Large selected 9/27 correctly but lost bout/Las Vegas metadata; K-1 transitioned to 11/23 and 12/29 but lost both venue strings; ONE still rendered only `フライ級`.
- v7.22.8 targets only those remaining layers: sparse live metadata hydration from verified first-party event metadata, Large-next cache policy v2, CARD_POLICY_VERSION 8, verified UFC fallback-card preservation, discipline-preserving `division()`, compact UFC next-title cleanup, and K-1 TBA copy cleanup. Geometry/Loader/BOXING/friends-stable remain unchanged. Branch/PR/main regressions #784/#785/#786 are success; physical iPhone QA on 2026-09-20 remained PARTIAL: UFC still showed generic title/no Las Vegas, K-1 current still showed 会場未定 while 12/29 横浜BUNTAI + TBA copy passed, and ONE still showed only フライ級.
- v7.22.9 fixes the remaining root causes only: canonical trusted-source/date matching, placeholder-location override, verified ONE FF172 discipline baseline, richer-context preference for identical fighters, Japanese combat-discipline preservation inside `fightContext()`, CARD_POLICY_VERSION 9, and LARGE_NEXT_POLICY_VERSION 3. Geometry/Loader/BOXING/friends-stable remain unchanged. Branch/PR/main regressions #800/#801/#802 are success. Final targeted physical iPhone QA on 2026-09-20 passed, so v7.22.9 is promoted to `VERIFIED_BASELINE` for the validated scope below.
- 2026-09-21 physical evidence exposed a new UFC-only source-drift defect outside that verified Large scope: the Japanese page title `UFCファイトナイト・ラスベガス121 | ロサスJr. vs バルセロシュ | UFC` was parsed as a fight fallback and polluted fighter A with the event-title prefix. v7.22.10 strips leading UFC event-title segments before `|`, re-sanitizes UFC fighter names when reading cached event data so polluted cache self-heals, and bumps CARD_POLICY_VERSION to 10. No geometry, Loader, RIZIN/ONE/K-1/BOXING behavior, or friends-stable changes. Branch/PR/main regressions #817/#818/#819 are success. Targeted UFC Medium physical QA on 2026-09-21 passed, so v7.22.10 is promoted to `VERIFIED_BASELINE`.
- `friends-stable` remains isolated and must not be changed/promoted/deleted without explicit user approval.

Main `.github/workflows` should contain only the canonical `combat-hub-regression.yml`. One-shot implementation/inspection workflows must never remain on `main`.

### Production source endpoints

- UFC: `https://www.ufc.com/events`
- RIZIN: `https://jp.rizinff.com/`
- ONE: `https://www.onefc.com/events/`
- BOXING aggregation sources:
  - The Ring: `https://www.ringmagazine.com/events`
  - Matchroom Boxing: `https://www.matchroomboxing.com/events/`
  - Premier Boxing Champions: `https://www.premierboxingchampions.com/boxing-schedule`
  - Top Rank: `https://toprank.com/news?categories=fight-announcements`
  - Queensberry: `https://queensberry.co.uk/pages/events`
  - 帝拳: `https://www.teiken.com/bout/`
  - Golden Boy: intentionally excluded until a stable public schedule surface is verified
- K-1: `https://www.k-1.co.jp/k-1wgp/schedule`

No backend/database/auth/paid service is required. Runtime is standalone Scriptable JavaScript using public HTTP GETs and `FileManager.local()` cache.

## 3. Important files

- `combat-hub.js` — production runtime, parsing/cache/state transitions, Small/Medium/Large rendering.
- `combat-hub-loader.js` — production Loader v4.2.0.
- `combat-hub-preview-loader.js` — preview utility only.
- `combat-hub-large-preview-loader.js` — Large preview helper only.
- `tests/*` — Node regression suites.
- `.github/workflows/combat-hub-regression.yml` — canonical CI.
- `HANDOFF.md` — this canonical handoff.
- `HANDOFF_CODEX.md` — historical/stale; never use as current baseline.

## 4. Reliability architecture

### Loader

- Validates runtime signature/version before execution.
- Primary + fallback GitHub raw URLs.
- Normal widgets can use verified local runtime cache.
- BOXING Large has special cache behavior so urgent runtime changes are not hidden by a stale runtime cache.
- Remote failure may fall back to the last valid runtime.
- Catchable runtime/fetch failures should render an error instead of silently blanking.

### Event-state safety

- Trusted `SNAPSHOT` current baselines exist for all five organizations.
- `NEXT_SNAPSHOT` trusted fallback exists for UFC/RIZIN/ONE/K-1.
- Event identity uses source/name/main-fight matching and time bounds.
- Generic UFC listing fallback name `UFC Fight Night` is intentionally weak identity: distinct official event URLs remain distinct so sequential Fight Night cards cannot collapse into one event during roll-forward.
- Future acceptance is bounded to 180 days.
- Current and next must not resolve to the same event.

### BOXING low-memory rule — non-negotiable without new device evidence

Physical iPhone Scriptable previously produced blank/white BOXING Medium/Large under heavier network/image work. Therefore:

- **Do not run deep next-event discovery inside BOXING Widget execution.**
- **Do not restore heavy full-widget DrawContext composition for BOXING without measured device proof.**
- Pending BOXING suppresses unverified poster loading.
- Stability outranks richer discovery in the Widget process.

## 5. Physical-device QA already completed

### v7.12.6 — BOXING white-screen fix

Medium and Large passed physical iPhone QA:

- no blank/white widget
- lightweight pending render works
- no unverified poster/fighter image

Temporary visible runtime markers confirmed the correct runtime at the time.

### v7.12.7 — runtime-marker cleanup

Physical iPhone regression passed after removing temporary version/sync labels:

- no white screen
- no unverified pending imagery
- no visible debug/version marker

### v7.12.8 — verified BOXING prefetch / cache-only Widget

Physical iPhone QA passed for Medium and Large after the architecture changed to:

**manual Scriptable BOXING run -> verified cache -> Widget reads cache only**

Safe pending remained stable when no verified future BOXING event was available. v7.23.0 keeps the same network-free Widget safety model while broadening only the manual verification sources.

### v7.13.0 / v7.13.1 — Large readability Visual Pass

Physical iPhone Large review completed on RIZIN after the visual pass.

Current accepted Large direction:

- larger organization/event/date/location/countdown/main-event typography
- support rows capped at two
- readable two-line support fighter names
- stronger hierarchy/contrast
- text-first lower dashboard
- next-event poster background removed to avoid duplicate/noisy typography

The Large layout is considered good enough to freeze for now. Do not restart broad visual churn unless a concrete defect is observed.

## 6. Large UI architecture in v7.16.1

Large now uses one shared geometry and typography system across UFC / RIZIN / ONE / BOXING / K-1.

- `LARGE_UI` is the canonical Large typography/geometry token set.
- Header geometry is now one strict template for all five organizations: organization/event on the left, then a fixed right status column ordered as `開催まで` / countdown / event date-time / location.
- `開催` alone is not used in the Large header. Time-TBA events still show `開催まで`, then `時刻未定`, then the known event date and location.
- Current event date/location are no longer rendered in the Large left header, preventing organization-specific drift.
- Physical iPhone review of K-1 and UFC pending states after v7.16.0 showed excessive dead space below the pending message; v7.16.1 adds a shared pending-only vertical offset while keeping the header geometry identical across organizations.
- organization-specific Large font sizing and lower-panel widths are removed.
- the lower dashboard is always the same two-column layout: fight card left / next event right.
- long fighter names use the same delimiter-aware two-line wrapping rule.
- the Large hero/background contrast veil is shared across organizations.
- organization differences are limited to accent color, source data and available imagery.
- BOXING retains the low-memory verified-cache-only data path and skips heavy next-event discovery/poster work in Widget execution; only its visual geometry is unified.

Physical iPhone visual confirmation for v7.15.0 is still required before calling this pass complete.


## 6B. K-1 Medium contrast polish in v7.17.1

- Physical iPhone review after Medium unification showed K-1 background art competing with text more than the other organizations.
- K-1 Medium-only shared background rendering now uses stronger hero/poster darkness (`heroShade .66`, `posterShade .52`).
- Medium geometry, typography, status hierarchy, Large geometry, BOXING cache-only safety, Loader, and friends-stable are unchanged.

## 6A. Medium UI architecture in v7.17.0

- Physical iPhone review across UFC / RIZIN / ONE / BOXING / K-1 showed Medium geometry drifting by organization.
- Medium now uses one shared header/status template: organization + event on the left, and `開催まで/開催状況` + countdown + date + location on the right.
- Pending and confirmed states share the same header geometry. Organization differences are limited to data, accent color, and available background art.
- K-1 no longer has a bespoke Medium optical inset; fighter slots, VS axis, support rows, and typography use shared MEDIUM_UI tokens.
- Large v7.16.1 geometry and BOXING verified-cache-only safety are unchanged.

## 6C. Known-event card freshness / transition policy (v7.18.0 -> v7.22.0)

- Event discovery remains cached for up to four hours; detail-card refresh must never extend that discovery timestamp.
- UFC / RIZIN / ONE / K-1 known-event details refresh every 30 minutes.
- BOXING remains a separate verified-cache architecture because physical Scriptable testing previously exposed white/blank failures under heavier Widget network/image work.
- `savedAt` is event-discovery age; `cardCheckedAt` / `cardRefreshedAt` track card-detail freshness separately.
- Events with `timeTba=true` use a 36-hour transition grace from the date-only placeholder; exact-time events use 12 hours.
- Once an official source exposes at least one leading matchup, the runtime leaves pending state; it does not wait for a full card.
- A failed refresh preserves the last valid event/card rather than inventing replacement data.
- Loader v4.2.0, frozen visual geometry and `friends-stable` are unchanged.

## 6H. Card-label normalization in v7.21.1

- Physical review raised a semantic consistency issue: `本戦` and `注目` could change depending on which refresh path produced the same support card.
- Root cause: locked-current refresh labeled support rows after the co-main as `MAIN CARD`, while roll-forward refresh labeled them `FEATURED`; the distinction was code-path-driven, not based on a full-card semantic classification.
- Policy is now deterministic: parsed card order gives main event first, co-main second, and remaining parsed support fights default to `MAIN CARD`.
- Existing `TITLE FIGHT` and `UNDERCARD` labels remain preserved. Legacy inferred `FEATURED` labels normalize to `MAIN CARD`.
- `注目` remains a rendering capability for future explicit/authoritative Featured designations, but the runtime no longer invents it from ordinal position.
- `CARD_POLICY_VERSION` is bumped so stale cached label semantics are refreshed once.
- Visual geometry is unchanged.

## 6G. UFC / K-1 live-card freshness in v7.21.0

- Physical review on 2026-09-18 revealed an information-freshness defect rather than a visual defect: UFC 331 and K-1 Sangju were still showing `対戦カード発表待ち` even though official sources had already published meaningful card information.
- Product rule is now explicit: **do not wait for the full card**. Once an official source exposes at least the leading matchup, the widget should leave pending state; additional official matchups populate support rows as they become available.
- UFC / RIZIN / ONE / K-1 all use the 30-minute known-event card refresh path. BOXING keeps its separate verified-cache safety architecture.
- UFC and K-1 now have event-detail parsers that first use official fighter-profile links and then a semantic `VS` fallback before the older heading/title parser.
- UFC event refresh tries both `jp.ufc.com` and `www.ufc.com` detail hosts to reduce locale-host fragility.
- A `CARD_POLICY_VERSION` invalidates pre-v7.21 card cache behavior once so an installed v7.21 runtime does not wait behind an otherwise-fresh stale pending cache.
- Current official UFC 331 and K-1 Sangju leading-card data are also stored in `NEXT_SNAPSHOT` as a verified fallback. Live official parsing remains preferred.
- Frozen Small/Medium/Large geometry is unchanged.

## 6F. Small footer contrast polish in v7.20.2

- Physical iPhone review after v7.20.1 confirmed K-1 status wording and geometry are correct and can be frozen.
- BOXING confirmed-card Small remained structurally correct but the bottom venue line was too faint against the system-tinted/lightweight background.
- Small venue metadata now uses the same `C.sub` contrast class as the date instead of `C.muted`; geometry, font size, and line count are unchanged.
- This is a Small-only readability fix. Medium/Large visuals, BOXING cache-only/deep-discovery safety, event logic, and Loader remain unchanged.
- Final device confirmation is required only for BOXING Small venue readability.

## 6E. Small status wording polish in v7.20.1

- Physical iPhone review of all five Small categories on 2026-09-18 confirmed the dedicated Small geometry works and the earlier clipping/Medium fall-through defect is resolved.
- Follow-up visual audit found no actual duplicated K-1 date/location rendering; that earlier reading was incorrect. No K-1-specific geometry exception is introduced.
- Small now uses `smallStatusHeading(...)` instead of the Large wording helper.
- Exact-time future events keep `開催まで`.
- Time-TBA events and safe pending events use `開催` with `時刻未定` / `確認中`, avoiding awkward `開催まで / 時刻未定` and `開催まで / 確認中` combinations.
- Medium and Large wording/geometry remain unchanged.
- Small still requires one final physical-device confirmation of K-1 and BOXING wording before visual freeze.

## 6D. Small UI architecture in v7.20.0

- Physical iPhone screenshot on 2026-09-18 exposed that `small` was falling through the Medium renderer, causing severe left-edge clipping, oversized pending text, and unusable square composition.
- Small now has its own shared `SMALL_UI` token set and dedicated `renderSmall(...)` path for all five organizations: UFC / RIZIN / ONE / BOXING / K-1.
- Small uses one organization-agnostic geometry: organization + compact status at the top, event name, then either a compact pending state or main-event matchup, with date/location metadata anchored at the bottom.
- Support-card rows and Large/Medium dashboard content are intentionally omitted in Small. Information density is constrained to what remains reliably readable in the square family.
- Non-BOXING Small uses square 338x338 background composition for poster/hero imagery. BOXING Small intentionally stays on the lightweight gradient background path to preserve the existing low-memory safety rule.
- `small` no longer falls through `renderMedium(...)`; manual preview now uses `presentSmall()`.
- Medium v7.17.x and Large v7.16.1 geometry are unchanged.
- Automated regression covers family routing, five-series availability, square background composition, pending/confirmed hierarchy, and BOXING low-memory isolation.
- Physical-device verification is still required before Small is promoted from WORKING_HEAD to VERIFIED_BASELINE.

## 6I. Official-image / structured-bout / BOXING hardening in v7.22.0

- UFC and K-1 official detail parsing now returns structured bout rows: fighter names, official fighter/profile URLs when available, bout context and official card label metadata.
- Confirmed-card promotion must not retain the event title in `main.context`; context is sourced from the bout itself and broadcast/platform strings such as `Live on DAZN` are rejected.
- Image acquisition is source-aware. It can use fighter profile imagery, event/poster imagery, JSON-LD images, social metadata, and K-1 poster-gallery imagery with deterministic fallback.
- `IMAGE_POLICY_VERSION` allows old positive image metadata to be reconsidered after resolver changes. Null image results are not treated as successful positive cache entries.
- UFC prefers a complete official fighter pair, then official event artwork. K-1 prefers official poster/event artwork, then fighter imagery.
- BOXING current-event verification keeps the canonical Ring current snapshot path. The trusted current baseline remains Cruz vs Bravo at Pechanga Arena, with Ramos vs Nursultanov as the co-main baseline.
- BOXING future/highlighted-event discovery is multi-source from first-party official promotion/event surfaces, but only during manual/non-widget execution. Home-screen Widget execution remains network-free for BOXING discovery and poster retrieval.
- BOXING current-cache provenance remains `verifiedBy:'refreshLockedCurrent'`. Highlighted-event cache uses `verifiedBy:'boxingHighlightDiscovery'` plus `BOXING_SOURCE_POLICY_VERSION=1`.
- `CARD_POLICY_VERSION=4` migrates pre-v7.22 card/context semantics once.
- Small / Medium / Large geometry and typography remain frozen.

## 7. BOXING verified-cache architecture

### Manual / non-widget path

When COMBAT HUB is run manually with BOXING:

1. If the trusted current Ring event is still inside its grace window, `refreshLockedCurrent(...)` may refresh the official event detail.
2. After current expiry, `discoverBoxingHighlight(...)` queries the approved official-source registry: Ring / Matchroom / PBC / Top Rank / Queensberry / 帝拳.
3. Candidates require an identifiable official main-event pair, are deduplicated by fight identity/date, and are ranked as **注目興行** rather than pretending BOXING has one canonical next event.
4. Ranking favors near-term events, title/unification/world context, live official-source confirmation, and multi-source verification.
5. `BOXING_TRUSTED_HIGHLIGHTS` may provide short, time-bounded first-party verified fallback records when current official listing markup cannot be parsed. These are not invented data.
6. The selected highlighted event is written to `combat-hub-next-boxing.json` with `verifiedBy:'boxingHighlightDiscovery'` and `sourcePolicy:BOXING_SOURCE_POLICY_VERSION`.
7. Official poster bytes may be prefetched only on the manual/non-widget path.

### Home-screen Widget path

BOXING Widget execution remains deliberately network-free for heavy official discovery and image acquisition:

- current event -> verified Ring current cache when available, otherwise trusted local snapshot
- highlighted event -> verified highlighted-event cache when available, otherwise safe lightweight `注目興行を確認中`
- poster -> local verified image cache only
- cache miss -> safe gradient; never force a remote image fetch inside the Widget
- unverified/legacy BOXING future/highlight cache never reaches Widget output

This remains a hard safety invariant unless new physical-device evidence justifies changing it.

## 8. New in v7.14.0 — Ring-specific official parser

The old generic discovery expected JSON-LD-style event data and did not correctly understand the current Ring site structure.

Live source inspection on 2026-09-14 established that Ring's current pages expose useful event data through normal server-rendered markup plus React/Next Flight data.

v7.14.0 therefore adds Ring-specific parsing outside Widget execution:

### Official `/events` listing parser

`ringListingEvents(...)` parses official Ring event cards for:

- `/events/...` source URL
- visible month/day
- displayed local time/time-zone label
- location
- nearby `aria-label="View event details for ..."` event identity

It normalizes the listing into normal COMBAT HUB candidate objects and feeds only eligible future candidates into `strictNextEvent(...)`.

### Event-detail parser

`ringDetailMain(...)` reads Ring event-detail Flight data and extracts the official `mainFight`:

- `fighterA.name`
- `fighterB.name`
- `tagLine` context

`currentPagePairs(...)` now tries the Ring parser first for BOXING.

### Intentional source limitation

**Do not broaden BOXING discovery to arbitrary news/search results merely to force an event onto the widget.**

v7.23.1 permits only the approved first-party official-source registry plus explicitly verified, time-bounded fallback records. When media-style source metadata conflicts with the local promoter/organizer for the same fight/date, the local promoter truth wins for name/time/venue/context; lower-authority sources may still provide a verified visual fallback. Articles or announcements may describe tentative, cancelled, postponed or superseded fights, so source admission is controlled rather than open-ended.

Wrong certainty is still worse than pending.

### Current official-source state

By 2026-09-18 Ring had advanced to an official Cruz vs Bravo event page. v7.22.0 uses that canonical Ring event as the BOXING current baseline and extends detail parsing to support main + additional official fight rows where available. The older noncanonical UFC-domain BOXING snapshot source is removed. v7.23.0 does not replace the current-event Ring path; it changes only the post-expiry future model from a single `next event` to a verified multi-source `注目興行`.

## 9. Runtime audit

`combat-hub-runtime-audit.json` remains the first diagnostic source before patching.

Core state fields include:

- `version`, `loaderVersion`, `key`, `widgetFamily`
- `nextPending`, `lightweightPending`, `cardTba`, `lockedCurrent`
- `prefetched`, `cacheVerified`, `name`, `source`

v7.22.0 adds image/card diagnostics:

- `imageMode`: fighter_pair / fighter_partial / event_poster / cached_poster / gradient
- `posterURLResolved`, `posterSource`, `posterLoaded`
- `aProfileURL`, `bProfileURL`
- `aImageLoaded`, `bImageLoaded`
- `imageCacheHit`, `imageFallbackReason`
- `cardSourceType`
- `cardCheckedAt`, `cardRefreshedAt`

Do not add visible debug labels to the Widget merely to inspect these values.

## 10. Regression coverage / current CI

Canonical CI covers runtime/Loader syntax plus general runtime, cache/performance, BOXING highlighted-event aggregation, ONE timing, UFC roll-forward, K-1 layout, typography, current-data audit, Large, Japanese display, event transitions, five-series transition timeline/integration, Small, UFC/K-1 live-card freshness, and v7.22 data/image hardening.

The v7.22 suite additionally locks:

- source-aware UFC/K-1 structured bout/profile parsing
- UFC title-bout and K-1 weight-class context
- no event-name contamination in confirmed `main.context`
- K-1 poster-gallery priority
- image candidate failover
- authoritative vs inferred support-label semantics
- Ring main + co-main parsing and broadcast-copy rejection
- BOXING manual current verification/image prefetch
- BOXING Widget zero-network verified-cache consumption
- BOXING multi-source highlighted-event source policy, scoring, verified-cache provenance, and safe pending semantics
- image refresh not mutating event-discovery timestamps
- expanded runtime-audit diagnostics

v7.22.0 verification chain: branch Regression **#663 success**, PR #63 Regression **#666 success**, merge-to-main Regression **#667 success**.

## 10. Historical BOXING device note

The v7.12-v7.14 white-screen investigation established the non-negotiable BOXING rule: manual verification/prefetch may use the network, but Home Screen Widget execution must remain verified-cache/local-image only for BOXING. The old Sep 12 source-availability note is historical and no longer describes the current Ring source state.

## 10A. Current QA status / next empirical checks

Physical iPhone QA on 2026-09-18 confirmed:

- UFC Small: Van vs Pantoja, official imagery and `フライ級タイトル戦` render correctly.
- K-1 Small: Kim vs Oda, official poster and correct `-70kg級` context.
- RIZIN Small: current main event and image presentation normal.
- ONE Small: current main event and image presentation normal.
- BOXING Small: Cruz vs Bravo, safe gradient fallback and no white screen.
- BOXING Medium: Cruz vs Bravo main, Jesus Ramos vs Meiirim Nursultanov co-main/セミ, safe gradient, no white screen.
- K-1 Large on v7.22.4: false `注目` was removed, but both support rows showed `本戦`.
- The same K-1 Large screenshot also exposed an image regression: the official Sangju poster had fallen back to a generic K-1 logo/hero-style image even though the official poster gallery still existed.

v7.22.5 fixes support-role normalization:
- support[0] -> CO-MAIN/セミ
- support[1+] -> MAIN CARD/本戦
- cached/trusted support labels are sanitized on read
- `CARD_POLICY_VERSION=6`

v7.22.6 fixes K-1 image priority:
- poster_gallery > event_hero > JSON-LD > meta
- when no cached poster-gallery candidate exists, the official K-1 event page is re-resolved before accepting a stale lower-priority hero
- generic logo/favicon/icon/noimage/placeholder URLs are rejected as K-1 event artwork
- `IMAGE_POLICY_VERSION=2`

Final physical iPhone QA on production v7.22.6 passed on 2026-09-18:

- K-1 Large: Kim Hyun Jun vs Oda Jinku main event rendered correctly.
- main context: `-70kg級`.
- support 1: Yang Hongcheol vs Oishi Masateru = `セミ`.
- support 2: Lee Hyeonseok vs Harada Toki = `本戦`.
- false `注目` is absent.
- official Sangju event poster background is restored; the generic K-1 logo/hero regression is gone.
- existing frozen Large geometry and next-event panel remain intact.

All five Small categories, BOXING Medium, and K-1 Large are now physically accepted for v7.22.6. `v7.22.6-github` is the `VERIFIED_BASELINE` for this validated scope.

2026-09-20 physical audit then exposed new live-data/source-transition defects outside that earlier verified scope:
- K-1 had expired-event leakage and failed to surface published 11/23 + 12/29 events.
- UFC Large failed to surface the published 9/27 Rosas Jr. vs Barcelos next event.
- RIZIN.55 next-event location normalized LaLa arena TOKYO-BAY to Tokyo instead of Chiba/Funabashi.
- ONE FF172 lost the official Kickboxing discipline and could inherit old bout context across event identity changes.

v7.22.7 production fixes those four layers without geometry changes.

Automated evidence:
- branch push Regression #764 SUCCESS
- PR #79 Regression #765 SUCCESS
- merge-to-main Regression #766 SUCCESS

v7.22.7 physical QA evidence on 2026-09-20:
- RIZIN Large PASS: RIZIN.55 next-event location shows `千葉・船橋`.
- UFC Large PARTIAL/FAIL: 9/27 09:00 JST selected, but title remained generic `UFC Fight Night` and Las Vegas was absent.
- K-1 Large PARTIAL/FAIL: 11/23 + 12/29 identities selected, but current showed `会場未定`, next lacked `横浜BUNTAI`, and copy showed `あと 時刻未定`.
- ONE Large FAIL: Panpayak vs Lamnamoonlek still rendered `フライ級`.

v7.22.8 physical QA evidence on 2026-09-20:
- UFC Large FAIL: 9/27 09:00 JST remained correct, but title stayed generic `UFC Fight Night` and Las Vegas was absent.
- K-1 Large PARTIAL: current 11/23 still showed `会場未定`; next 12/29 correctly showed `横浜BUNTAI` and `時刻未定`.
- ONE Large FAIL: Panpayak vs Lamnamoonlek still rendered `フライ級`.
- RIZIN Large remained previously accepted and was not re-tested.

Final targeted physical iPhone QA on v7.22.9 passed on 2026-09-20:
- UFC Large PASS: next panel shows `Rosas Jr. vs Barcelos`, `9/27 (日) 09:00 JST`, and `ラスベガス`.
- K-1 Large PASS: current shows `K-1 2026.11.23`, `11/23`, `後楽園ホール`, and `時刻未定`; next shows `K-1 2026.12.29`, `12/29 (火)`, `横浜BUNTAI`, and `時刻未定`.
- ONE Large PASS: Panpayak Jitmuangnon vs Lamnamoonlek Torfunfarm shows `フライ級キックボクシング`.
- RIZIN Large remains accepted from v7.22.7: RIZIN.55 next-event location = `千葉・船橋`.
- BOXING current verified-cache/network-free behavior remains hard-locked and unchanged.
- No clipping, blank/white widget, stale prior-event leakage, or frozen-geometry regression was observed in the submitted Large screenshots.

`v7.22.9-github` is now the `VERIFIED_BASELINE` for the validated production scope.

2026-09-21 UFC Medium source-drift cycle:
- Initial physical evidence FAIL: fighter A rendered as `UFCファイトナイト・ラスベガス121 | ロサスJr.` instead of `ロサスJr.` while event/date/time/location/background remained correct.
- Root cause confirmed against the current official Japanese UFC title shape and runtime fallback parser.
- v7.22.10 automated fix merged with branch/PR/main regressions #817/#818/#819 success.
- Final physical iPhone QA PASS: `ロサスJr.` vs `バルセロシュ` renders cleanly; `UFCファイトナイト・ラスベガス121`, `9/27 (日) 09:00 JST`, `ラスベガス`, background imagery, and Medium geometry remain intact.
- No clipping, stale title-prefix contamination, or blank/white widget was observed.

`v7.22.10-github` is now the current `VERIFIED_BASELINE`.

## 10B. v7.23.0 / v7.23.1 / v7.23.2 — BOXING highlighted-event aggregation

v7.23.0 product semantics:
- BOXING future state is **注目興行**, not a single canonical `次大会`.
- The manual/non-widget path aggregates approved official promoter/event sources, deduplicates candidates, applies a deterministic relevance score, and writes one verified highlight to local cache.
- v7.23.0 approved registry: The Ring / Matchroom / PBC / Top Rank / Queensberry. Golden Boy remains excluded until a stable public schedule surface is verified.
- Home-screen Widget BOXING discovery remains zero-network and cache-only.
- Pending BOXING copy is `注目興行を確認中` / `検証済み情報のみ表示`.
- Large BOXING provenance panel shows promoter and verification state rather than another linear `次大会` claim.
- Small/Medium/Large geometry tokens are unchanged.

v7.23.0 physical preview on 2026-09-24:
- highlight selection itself was strong: Takuma Inoue vs Tenshin Nasukawa.
- background and Medium geometry rendered correctly.
- data defect: the Widget showed `9/27 15:00 JST / 東京`.
- first-party local organizer truth is `2026-09-27 / TOYOTA ARENA TOKYO / first bout 16:30 JST`.
- therefore v7.23.0 was **not** promoted.

v7.23.1 targeted correction:
- adds 帝拳 as an approved first-party BOXING source.
- intended verified baseline = `Prime Video Boxing 16`, `井上拓真 vs 那須川天心`, `2026-09-27 16:30 JST`, `TOYOTA ARENA TOKYO`.
- source authority rule: local promoter/organizer > promotion-owned schedule > Ring for event name/time/venue/context.
- lower-authority verified sources may remain as visual/poster fallback.
- `BOXING_SOURCE_POLICY_VERSION=2` invalidates the old 15:00 highlighted-event cache.

v7.23.1 physical preview on 2026-09-24 still failed:
- event title rendered `Inoue vs Nasukawa Sep`.
- fighter labels rendered `Inoue` / `Nasukawa Sep`.
- time/location fell back to `時刻未定 / 会場未定`.
- Large provenance still showed `The Ring / 公式確認済み`.
- background imagery and geometry remained stable.
- root cause: Ring schedule text leaked the month token `Sep` into fighter B, so Ring and 帝拳 records no longer matched and were never merged.

v7.23.2 targeted correction:
- strips trailing month/day-name contamination from BOXING fighter strings before candidate identity work.
- adds explicit Teiken aliases for Takuma Inoue / Tenshin Nasukawa.
- uses alias-aware same-date candidate matching before merge.
- merged event must inherit local promoter truth for event/time/venue/context.
- lower-authority verified Ring source may remain only as `visualSource` fallback.
- `BOXING_SOURCE_POLICY_VERSION=3` invalidates the polluted v7.23.1 highlight cache.
- no geometry, Loader, UFC/RIZIN/ONE/K-1, BOXING Widget network-free architecture, or friends-stable change.

Automated evidence:
- v7.23.0 branch/PR/main Regression #843/#844/#845 SUCCESS
- v7.23.1 branch/PR/main Regression #860/#861/#862 SUCCESS
- v7.23.2 branch/PR/main Regression #876/#877/#878 SUCCESS
- BOXING highlighted-event regression PASS

Physical iPhone QA still required before v7.23.2 VERIFIED_BASELINE promotion:
- run Loader manually once so source policy v3 rewrites the highlighted-event cache
- BOXING Medium: `Prime Video Boxing 16`, `井上拓真 vs 那須川天心`, `9/27 16:30 JST`, `トヨタアリーナ東京`; background/gradient intact; no white screen/clipping
- BOXING Large: same event truth plus `注目興行` provenance panel and `帝拳 / 公式確認済み`; no geometry regression or white screen
- Small is not required unless a symptom appears
- v7.22.10 remains the VERIFIED_BASELINE until Medium + Large pass.

## 11. Known debt / risks

### BOXING source availability / timing

BOXING no longer assumes one promotion-wide canonical `次大会`. Current-event truth still uses the trusted Ring path where applicable; future selection is one verified **注目興行** chosen from the approved official-source registry. If no candidate meets the verification gate, safe pending is preferred. Do not manufacture exact times, venues, or cards that the admitted official sources do not support.

### Source markup drift

UFC / K-1 / Ring / Matchroom / PBC / Top Rank / Queensberry / 帝拳 page markup can change. Structured parsers, source-policy fallbacks, image fallbacks and runtime audit should be used to diagnose source drift before patching.

### README / historical handoff

- `README.md` may still lag current runtime architecture.
- `HANDOFF_CODEX.md` is historical and must not replace this file as the canonical handoff.

## 12. Do-not-do list

- **Do not modify/promote/delete `friends-stable` without explicit approval.**
- Do not deep-scrape BOXING inside Medium/Large Widget execution.
- Do not restore heavy BOXING DrawContext work without physical-device evidence.
- Do not display unverified event imagery.
- Do not invent event/card/time/location data.
- Do not use broad news/search scraping to manufacture BOXING certainty outside the approved official-source registry.
- Do not leave one-shot workflows on `main`.
- Do not route production to preview loaders.
- Do not add unnecessary backend/PWA/Vercel dependencies.
- Do not treat CI-only verification as full runtime completion.
- Do not use `HANDOFF_CODEX.md` as current state.

## 13. Development procedure

For runtime-affecting work:

1. fetch latest `main`
2. inspect actual code + `HANDOFF.md`
3. branch from exact main SHA
4. syntax/build
5. regression
6. merge only after green PR CI
7. main regression
8. relevant physical-device verification
9. regression again if code changes follow device QA

When a problem remains, identify the actual layer from runtime audit + source evidence before patching.

## 14. Current branch / work state

Canonical production:

- `main`
- runtime `v7.23.2-github`
- Loader `v4.2.0`
- runtime PR `#93`
- runtime merge `f4837ba68bfc567de2dc8b22a832def50d45f47f`
- main Regression `#878 success`
- `CARD_POLICY_VERSION=10`
- `LARGE_NEXT_POLICY_VERSION=3`
- `IMAGE_POLICY_VERSION=2`
- `BOXING_SOURCE_POLICY_VERSION=3`
- validation status: **PARTIAL** — automated regression green; BOXING Medium + Large physical QA pending
- previous/current verified reference: `v7.22.10-github` VERIFIED_BASELINE
- v7.23.1 physical preview failed because Ring month-token contamination prevented merge with 帝拳 truth
- v7.23.2 acceptance target: Prime Video Boxing 16 / 井上拓真 vs 那須川天心 / 9/27 16:30 JST / トヨタアリーナ東京 + Large provenance `帝拳 / 公式確認済み`
- UFC / RIZIN / ONE / K-1 verified scopes remain accepted; their runtime behavior/geometry was not intentionally changed
- Small/Medium/Large geometry tokens remain frozen; BOXING Widget discovery remains network-free

No temporary implementation workflow or patch script remains in the intended production diff.
`friends-stable` remains intentionally isolated.

---

## Handoff start prompt

> COMBAT HUBの開発を引き継ぎます。Repositoryは `48wr9f4wgp-lab/combat-hub` です。必ず現在のGitHub `main` とルート `HANDOFF.md` を正本として取得してください。productionは v7.23.2-github（PR #93 / merge `f4837ba68bfc567de2dc8b22a832def50d45f47f` / main Regression #878 success）です。v7.22.10は直前のVERIFIED_BASELINEです。v7.23.1 BOXING previewではRing由来の`Nasukawa Sep`月名汚染により帝拳の同一興行truthとdedupeできず、The Ring / 時刻未定 / 会場未定が残りました。v7.23.2は月名汚染除去、Teiken aliases、same-date alias-aware dedupe、local promoter truth強制優先、BOXING_SOURCE_POLICY_VERSION=3を追加しました。acceptance targetはPrime Video Boxing 16 / 井上拓真 vs 那須川天心 / 9/27 16:30 JST / トヨタアリーナ東京、Largeは注目興行 provenanceで帝拳 / 公式確認済みです。BOXING Widget discoveryはnetwork-freeのままです。Loaderを手動実行後、BOXING Medium + Largeだけを実機確認し、通ればv7.23.2をVERIFIED_BASELINEへ昇格してください。
