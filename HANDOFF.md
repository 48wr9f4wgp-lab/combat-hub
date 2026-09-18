# COMBAT HUB — Development Handoff

Updated: 2026-09-18 JST

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

- Small / Medium / Large stable on physical iPhone at the last verified visual baselines; v7.22.0 data/image changes still require the targeted physical QA listed below.
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
- Production runtime: **v7.22.0-github**.
- Latest runtime-changing PR: **#63 — official image/context/BOXING verified-cache hardening**.
- Runtime merge commit: `0b2713650cde3bc3f535e7a6882432b679944f09`.
- Main Regression after PR #63: **#667 success**.
- v7.22.0 changes data/image acquisition, bout context, BOXING official-cache safety and diagnostics; frozen Small/Medium/Large geometry is unchanged.
- Automated verification is complete; targeted v7.22.0 physical iPhone QA is still required before v7.22.0 becomes `VERIFIED_BASELINE`.
- `friends-stable` remains isolated and must not be changed/promoted/deleted without explicit user approval.

Main `.github/workflows` should contain only the canonical `combat-hub-regression.yml`. One-shot implementation/inspection workflows must never remain on `main`.

### Production source endpoints

- UFC: `https://www.ufc.com/events`
- RIZIN: `https://jp.rizinff.com/`
- ONE: `https://www.onefc.com/events/`
- BOXING: `https://www.ringmagazine.com/events`
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

Safe pending remained stable when no verified future Ring event was available.

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
- BOXING uses the canonical Ring event source. The trusted current baseline is Cruz vs Bravo at Pechanga Arena, with Ramos vs Nursultanov as the co-main baseline.
- BOXING current and future Widget execution are network-free for Ring discovery and poster retrieval: manual/non-widget execution verifies official Ring data and prefetches approved poster bytes; the Widget reads only verified/local cache, otherwise it degrades to the safe gradient/pending path.
- BOXING current-cache provenance uses `verifiedBy:'refreshLockedCurrent'`; future verified discovery retains `verifiedBy:'strictNextEvent'`.
- `CARD_POLICY_VERSION=4` migrates pre-v7.22 card/context semantics once.
- Small / Medium / Large geometry and typography remain frozen.

## 7. BOXING verified-cache architecture

### Manual / non-widget path

When COMBAT HUB is run manually with BOXING:

1. If the trusted current Ring event is still inside its grace window, `refreshLockedCurrent(...)` may refresh the official event detail.
2. The official poster resolver may download and cache verified Ring image bytes.
3. Current verified cache is written to `combat-hub-current-boxing.json` with `verifiedBy:'refreshLockedCurrent'`.
4. After current expiry, `strictNextEvent(...)` may discover the next official Ring event and write `combat-hub-next-boxing.json` with `verifiedBy:'strictNextEvent'`.

### Home-screen Widget path

BOXING Widget execution is deliberately network-free for heavy official discovery and image acquisition:

- current event -> verified current cache when available, otherwise trusted local snapshot
- future event -> verified future cache when available, otherwise safe lightweight pending
- poster -> local verified image cache only
- cache miss -> safe gradient; never force a remote image fetch inside the Widget
- unverified/legacy BOXING future cache never reaches Widget output

This is a hard safety invariant unless new physical-device evidence justifies changing it.

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

**Do not add a broad Ring news/article fallback merely to force a future event onto the widget.**

News articles can describe tentative, cancelled, postponed or superseded fights. The current policy is:

- official Ring `/events` candidate -> eligible -> verified cache -> display
- otherwise -> safe pending

Wrong certainty is worse than pending.

### Current official-source state

By 2026-09-18 Ring had advanced to an official Cruz vs Bravo event page. v7.22.0 uses that canonical Ring event as the BOXING current baseline and extends detail parsing to support main + additional official fight rows where available. The older noncanonical UFC-domain BOXING snapshot source is removed.

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

Canonical CI covers runtime/Loader syntax plus general runtime, cache/performance, ONE timing, UFC roll-forward, K-1 layout, typography, current-data audit, Large, Japanese display, event transitions, five-series transition timeline/integration, Small, UFC/K-1 live-card freshness, and v7.22 data/image hardening.

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
- image refresh not mutating event-discovery timestamps
- expanded runtime-audit diagnostics

v7.22.0 verification chain: branch Regression **#663 success**, PR #63 Regression **#666 success**, merge-to-main Regression **#667 success**.

## 10. Historical BOXING device note

The v7.12-v7.14 white-screen investigation established the non-negotiable BOXING rule: manual verification/prefetch may use the network, but Home Screen Widget execution must remain verified-cache/local-image only for BOXING. The old Sep 12 source-availability note is historical and no longer describes the current Ring source state.

## 10A. Current QA status / next empirical checks

Automated v7.22 branch coverage is green, but **v7.22.0 is not yet VERIFIED_BASELINE until targeted physical iPhone QA passes.**

After merge / Loader refresh, check only:

- UFC Small or Medium: Van vs Pantoja, bout context instead of event title, official imagery rather than forced gradient.
- K-1 Large: Kim vs Oda main, Yang vs Oishi as co-main/セミ, Lee vs Harada as main-card/本戦, no invented `注目`, -70kg class context, poster retained.
- BOXING Small/Medium: Cruz vs Bravo; Medium support can show Ramos vs Nursultanov; verified Ring poster may appear from local cache or safely fall back to gradient; no blank/white widget and no Widget deep discovery.

RIZIN / ONE do not need repeated screenshots for this pass unless a regression appears.

## 11. Known debt / risks

### BOXING source availability / timing

Ring remains the only authoritative BOXING event source used for promotion. If its listing/detail lags announcements, safe pending is preferred over inferred certainty. The current Cruz vs Bravo snapshot intentionally keeps `timeTba=true` until an exact trusted clock is verified for the baseline; do not manufacture precision.

### Source markup drift

UFC / K-1 / Ring page markup can change. Structured parsers, image fallbacks and runtime audit should be used to diagnose source drift before patching.

### README / historical handoff

- `README.md` may still lag current runtime architecture.
- `HANDOFF_CODEX.md` is historical and must not replace this file as the canonical handoff.

## 12. Do-not-do list

- **Do not modify/promote/delete `friends-stable` without explicit approval.**
- Do not deep-scrape BOXING inside Medium/Large Widget execution.
- Do not restore heavy BOXING DrawContext work without physical-device evidence.
- Do not display unverified event imagery.
- Do not invent event/card/time/location data.
- Do not use broad news scraping to manufacture certainty when official Ring events data is absent.
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
- runtime `v7.22.0-github`
- Loader `v4.2.0`
- runtime PR `#63`
- runtime merge `0b2713650cde3bc3f535e7a6882432b679944f09`
- main Regression `#667 success`
- targeted physical-device QA pending; do **not** label v7.22.0 `VERIFIED_BASELINE` yet

No temporary implementation workflow or patch script remains in the intended production diff.
`friends-stable` remains intentionally isolated.

---

## Handoff start prompt

> COMBAT HUBの開発を引き継ぎます。Repositoryは `48wr9f4wgp-lab/combat-hub` です。必ず現在のGitHub `main` とルート `HANDOFF.md` を正本として取得してください。productionは v7.22.0-github（PR #63 / main Regression #667 success）で、Small/Medium/Largeのgeometryは凍結です。UFC/RIZIN/ONE/K-1は30分card refreshと4時間event discoveryを分離し、BOXINGはmanual verify/prefetch -> verified local cache -> Widget network-free consumptionをHard Lockとします。公式カードが1試合以上出た時点でpendingを解除し、support labelは公式明示を優先しつつ、推測時は2試合目=CO-MAIN/セミ、3試合目以降=MAIN CARD/本戦、ordinalだけでFEATURED/注目を作りません。v7.22ではsource-aware image resolver、dynamic fighter profile URL、bout context、canonical Ring Cruz vs Bravo baseline、BOXING current/future verified cache、拡張runtime auditを追加しています。異常時は推測patchではなくruntime auditと現在の公式sourceを根拠に原因層を特定してください。`friends-stable` は明示承認なしに変更禁止です。CIだけで完成扱いせず、HANDOFFのtargeted physical QAを完了してから VERIFIED_BASELINE にしてください。
