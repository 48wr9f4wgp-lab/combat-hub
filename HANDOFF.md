# COMBAT HUB — Development Handoff

Updated: 2026-09-14 JST

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

- Medium and Large stable on physical iPhone.
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
- Runtime: **v7.15.0-github**
- Runtime PR: **#45 — Ring official-events parser**
- Runtime merge commit: `cb6358396a5493b98f1a7c486d17fba957aa92a4`
- Main Regression after PR #45: **#486 success**
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

- `combat-hub.js` — production runtime, parsing/cache/state transitions, Medium/Large rendering.
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

## 6. Large UI architecture in v7.15.0

Large now uses one shared geometry and typography system across UFC / RIZIN / ONE / BOXING / K-1.

- `LARGE_UI` is the canonical Large typography/geometry token set.
- organization-specific Large font sizing and lower-panel widths are removed.
- the lower dashboard is always the same two-column layout: fight card left / next event right.
- long fighter names use the same delimiter-aware two-line wrapping rule.
- the Large hero/background contrast veil is shared across organizations.
- organization differences are limited to accent color, source data and available imagery.
- BOXING retains the low-memory verified-cache-only data path and skips heavy next-event discovery/poster work in Widget execution; only its visual geometry is unified.

Physical iPhone visual confirmation for v7.15.0 is still required before calling this pass complete.

## 7. BOXING architecture in v7.14.0

### Manual/non-widget path

When the existing COMBAT HUB Loader is run manually and **BOXING** is selected:

1. `strictNextEvent(snap)` may perform Ring discovery outside Widget execution.
2. Future candidates must pass normal roll-forward/time/event-identity checks.
3. A BOXING result is persisted only when `boxingPrefetchValid(...)` accepts it.
4. Verified cache is stored in `combat-hub-next-boxing.json` with:
   - `savedAt`
   - `verifiedAt`
   - `verifiedBy:'strictNextEvent'`
   - validated `data`

### Widget path

BOXING Medium/Large Widget execution:

- consumes future event data only through `boxingVerifiedCache(...)`
- ignores legacy/unverified future BOXING cache
- performs no deep next-event discovery when verified cache is absent
- falls back immediately to safe lightweight pending:
  - `nextPending:true`
  - `lightweightPending:true`
  - `posterURL:null`
  - Ring listing as `source`

This cache-only Widget rule survived the v7.13 visual work and remains unchanged in v7.14.0.

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

### Current live-source state at implementation time

On 2026-09-14, live Ring `/events` still exposed only the already-past Sep 12 Garcia vs Benn event. Therefore, **a correct v7.14.0 manual BOXING run can still produce no verified future event and the Widget can correctly remain `次大会情報を確認中`.**

This is a source-availability limitation, not by itself evidence that the parser failed.

The new parser is ready to consume the next official Ring event when the official `/events` page advances.

## 9. Runtime audit

`combat-hub-runtime-audit.json` remains the first diagnostic source before patching.

Important fields:

- `version`
- `loaderVersion`
- `key`
- `widgetFamily`
- `nextPending`
- `lightweightPending`
- `cardTba`
- `lockedCurrent`
- `prefetched`
- `cacheVerified`
- `name`
- `source`
- `posterLoaded`

For v7.14.0 BOXING, unexpected behavior should be diagnosed from these fields plus the actual current Ring source before changing code.

## 10. Regression coverage / current CI

Canonical CI checks include:

- runtime syntax
- production/preview/Large preview Loader syntax
- general runtime regression
- cache/performance behavior
- ONE composite timing
- UFC roll-forward
- K-1 layout
- typography
- current-data audit
- Large widget behavior
- Japanese display
- event transition behavior

v7.14.0 adds regression contracts confirming:

- Ring listing parser exists
- Ring event-detail parser exists
- official Ring candidates enter `strictNextEvent(...)`
- BOXING detail parsing uses Ring parser first
- `verifiedBy:'strictNextEvent'` remains
- BOXING Widget cache-only gate remains

PR #45 Regression **#485 success**.
Merge-to-main Regression **#486 success**.

## 10. Immediate next task — one minimal v7.14.0 device check

Do **not** repeat all five organizations or the old Medium/Large QA loop.

Only:

1. Open the existing **COMBAT HUB Loader** in Scriptable.
2. Run it once manually.
3. Choose **BOXING**.
4. Return to Home Screen.

At the current Ring source state, expected behavior is likely still safe pending.

A valid result is:

- no white/blank widget
- no suspicious/unverified image
- `次大会情報を確認中` may remain

Only send a screenshot / investigate further if the display becomes abnormal or if a verified future event appears and needs truth-checking.

Do not call live future-event ingestion fully proven until Ring official `/events` advances and a real future event is actually written/read through the verified cache on device.

## 11. Known debt / risks

### BOXING source availability

The official source can lag behind real-world announcements. Safe pending is intentional until an official candidate passes validation.

### Current BOXING snapshot source debt

`SNAPSHOT.boxing.source` still contains:

`https://www.ufc.com/news/garcia-vs-benn-official-fight-card`

This is suspicious/noncanonical for boxing and remains explicit data debt. Do not silently promote it as future truth.

### Ring time semantics

Ring's listing displays a time-zone-labelled event time. v7.14.0 normalizes it for candidate selection. If a future official event appears, verify the displayed Japanese time against the event-detail source before declaring time accuracy complete.

### README / historical handoff

- `README.md` may still lag current Medium+Large/runtime architecture.
- `HANDOFF_CODEX.md` is historical.

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
- runtime `7.14.0-github`
- Loader `4.2.0`
- runtime merge commit `cb6358396a5493b98f1a7c486d17fba957aa92a4`
- main Regression `#486 success`

Recent completed PRs:

- PR #40 — remove temporary BOXING sync UI -> v7.12.7
- PR #41 — verified manual BOXING prefetch/cache-only Widget -> v7.12.8
- PR #43 — Large readability/hierarchy pass -> v7.13.0
- PR #44 — Large lower-dashboard readability polish -> v7.13.1
- PR #45 — official Ring listing/detail parser -> v7.14.0

No temporary implementation workflow is intended to remain in production.
`friends-stable` remains intentionally isolated.

---

## Handoff start prompt

> COMBAT HUBの開発を引き継ぎます。Repositoryは `48wr9f4wgp-lab/combat-hub` です。GitHubの現在の `main` とルート `HANDOFF.md` を正本として取得してください。productionは runtime `v7.14.0-github` / Loader `v4.2.0`。BOXINGの白画面対策、verified-cache-only Widget経路、Large可読性Visual Passは実機確認済みです。v7.14.0ではRing公式 `/events` の現行HTMLとevent detailのReact/Next Flightデータに対応する専用parserを追加し、PR #45とmain Regression #486は成功しています。ただし2026-09-14時点でRing公式 `/events` 自体がSep 12 Garcia vs Bennまでしか進んでいないため、BOXINGが `次大会情報を確認中` のままでも正常候補です。次は既存Loaderを手動実行してBOXINGを1回だけ選び、異常がなければ同じQAを何周も繰り返さないでください。異常時は推測でpatchせず `combat-hub-runtime-audit.json` の `version / widgetFamily / prefetched / cacheVerified / nextPending / lightweightPending / posterLoaded / source` と現在のRing公式ソースを根拠に原因層を特定してください。`friends-stable` は明示承認なしに変更禁止です。BOXING Widgetへheavy deep discoveryやfull-widget DrawContextを戻さず、syntax/build -> regression -> 実機確認 -> regressionの順を守り、未確認を完成扱いしないでください。
