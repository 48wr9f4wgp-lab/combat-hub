# COMBAT HUB — Development Handoff

Updated: 2026-09-14 JST

> **This file is the canonical handoff for the current project state.**
> Always fetch current GitHub `main` first. Actual code + this file take priority over old chat logs and `HANDOFF_CODEX.md`.

## 1. Product / target

COMBAT HUB is a personal iOS/iPadOS **Scriptable home-screen combat-sports widget** supporting five Widget Parameters:

- `UFC`
- `RIZIN`
- `ONE`
- `BOXING`
- `K1`

Target quality:

- Medium and Large both stable on physical iPhone.
- Japanese-first premium sports/event UI.
- Current/upcoming event, date/time/location, countdown/status, main event and support card are clear.
- Unknown fighters/cards/times/venues are never invented; uncertain data remains TBA/pending.
- Current and next event identity must never duplicate.
- Network/image/parser failure must degrade to a safe render, not a blank widget, when possible.
- CI is necessary but not sufficient: runtime changes require physical-device verification before completion/RC.

## 2. Canonical production baseline

- Repository: `48wr9f4wgp-lab/combat-hub`
- Production branch: `main`
- Device route: `combat-hub-loader.js` -> raw GitHub `main/combat-hub.js`
- Loader: **v4.2.0**
- Runtime: **v7.12.8-github**
- Runtime merge: **PR #41**
- Runtime merge commit: `6ef0fe5c3acfd2fdf1d5ff41d25237f61a2cc739`
- Main Regression after PR #41: **#454 success**
- Main `.github/workflows` must contain only `combat-hub-regression.yml`; temporary `zz-*` workflows must never remain on main.

### Source endpoints encoded in runtime

- UFC: `https://www.ufc.com/events`
- RIZIN: `https://jp.rizinff.com/`
- ONE: `https://www.onefc.com/events/`
- BOXING listing: `https://www.ringmagazine.com/events`
- K-1: `https://www.k-1.co.jp/k-1wgp/schedule`

No backend/database/auth/paid service is required. Runtime is standalone Scriptable JavaScript using public HTTP GETs and `FileManager.local()` cache.

## 3. Important files

- `combat-hub.js` — production runtime, data/cache/state transitions, Medium/Large rendering.
- `combat-hub-loader.js` — stable production Loader v4.2.0, remote runtime validation/cache/fallback.
- `combat-hub-preview-loader.js` — preview utility only.
- `combat-hub-large-preview-loader.js` — Large preview helper only.
- `tests/*` — Node regression suites.
- `.github/workflows/combat-hub-regression.yml` — canonical CI workflow.
- `HANDOFF.md` — this canonical handoff.
- `HANDOFF_CODEX.md` — historical/stale; do not use as baseline.

## 4. Reliability architecture

### Loader

- Loader validates runtime signature/version before execution.
- Primary + fallback GitHub raw URLs.
- Normal widgets can use a verified 30-minute local runtime cache.
- BOXING Large bypasses runtime-cache TTL so urgent runtime changes arrive immediately.
- Remote failure may fall back to last valid cached runtime.
- Catchable runtime/fetch failures render `RUNTIME ERROR` instead of silently failing.

### Trusted event state

- Trusted `SNAPSHOT` current baselines exist for all five organizations.
- `NEXT_SNAPSHOT` trusted fallback exists for UFC/RIZIN/ONE/K-1.
- Current official data may overlay a snapshot only when event/main identity validation passes.
- Event identity uses source/name/main-fight matching and time bounds to prevent current=next duplication.
- Future acceptance is bounded to 180 days.

### BOXING low-memory rule

Physical iPhone Scriptable previously produced white/blank BOXING Medium/Large under heavier image/network work. Therefore:

- **Do not reintroduce deep discovery in widget execution.**
- **Do not reintroduce full-widget/heavy DrawContext poster composition for BOXING without measured device proof.**
- pending BOXING suppresses unverified poster loading.
- stability takes priority over richer live discovery inside the widget process.

## 5. Completed physical-device QA

### v7.12.6 — BOXING Medium / Large memory fix

Physical iPhone QA completed successfully on 2026-09-14.

Medium confirmed:

- no white/blank widget
- `同期 7.12.6` visible, proving correct runtime
- lightweight pending gradient rendered
- no unverified poster/fighter image

Large confirmed:

- no white/blank widget
- pending gradient rendered
- no unverified poster/fighter image
- v7.12.6 marker visible

This closes the original P0 white-screen/pending-image defect for v7.12.6.

### v7.12.7 — temporary sync UI cleanup

PR #40 removed the temporary visible runtime markers while retaining runtime audit and BOXING memory guards.

Physical iPhone regression completed successfully:

- Medium renders normally with no visible `同期 7.12.6`
- Large renders normally with no runtime-version marker
- no white screen
- no unverified pending imagery

v7.12.7 cleanup is therefore device-verified.

## 6. Current implementation — v7.12.8 verified BOXING prefetch

PR #41 implements the preferred architecture:

**manual Scriptable execution -> validated BOXING next-event cache -> widget reads cache only**

### Manual/non-widget BOXING path

When BOXING is selected during manual Scriptable execution:

1. `strictNextEvent(snap)` may perform the heavier Ring discovery outside widget execution.
2. The result is accepted only if `boxingPrefetchValid(...)` passes.
3. Validation currently requires:
   - normal `rollforwardEligible(...)` checks: future/time bound, organization-valid event name, not same event identity
   - normalized source must be `ringmagazine.com`
4. Only then is `combat-hub-next-boxing.json` persisted with:
   - `savedAt`
   - `verifiedAt`
   - `verifiedBy: 'strictNextEvent'`
   - validated `data`

If discovery fails, a previous still-valid verified cache may be retained/read; otherwise fallback remains safe/pending rather than inventing data.

### BOXING widget path

Medium/Large widget execution:

- reads a BOXING future event only through `boxingVerifiedCache(...)`
- ignores legacy/unverified BOXING next-event cache
- performs **zero deep next-event discovery** when verified cache is absent
- falls back immediately to lightweight pending:
  - `nextPending:true`
  - `lightweightPending:true`
  - `posterURL:null`
  - Ring listing as `source`
- verified future cache is marked at runtime with:
  - `prefetched:true`
  - `cacheVerified:true`

Poster loading remains conservative; the v7.12.8 work did not restore heavy remote poster work in the widget path.

### Runtime audit

`combat-hub-runtime-audit.json` remains available and now includes the prior fields plus prefetch state. Important fields:

- `version`
- `loaderVersion`
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

Use these fields to identify the failure layer before patching anything.

## 7. Regression coverage / latest CI

CI currently checks:

- production runtime syntax
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

v7.12.8 adds explicit cache regression for:

- unverified BOXING cache rejected by widget
- verified BOXING cache consumed with zero discovery network work
- manual BOXING discovery persisting `verifiedBy:'strictNextEvent'`

PR #41 full regression passed. Merge-to-main Regression **#454 also passed**.

## 8. Next task — physical QA for v7.12.8

**Do not edit code first.** v7.12.8 must now be verified on physical iPhone.

Exact sequence:

1. Open the already-installed **COMBAT HUB Loader** in Scriptable.
2. Manually run it once.
3. When the organization chooser appears, select **BOXING**. This manual selection is required to execute the new BOXING prefetch path.
4. Let the manual run finish/render.
5. Return to Home Screen and inspect BOXING **Medium** and **Large**.

Expected behavior has two valid outcomes:

### Outcome A — Ring exposes a future event that passes validation

- widget may advance from generic pending to the validated future event from cache
- no white/blank widget
- no wrong/unverified event imagery
- widget itself does not deep-discover

### Outcome B — no future Ring event passes validation

- widget remains lightweight `次大会情報を確認中`
- no white/blank widget
- no unverified poster/fighter image

**Outcome B is not automatically a bug.** It means no verified cache was produced. Do not patch from appearance alone.

If behavior is suspicious, inspect `combat-hub-runtime-audit.json` and specifically compare:

- `version` should be `7.12.8-github`
- `widgetFamily`
- `prefetched`
- `cacheVerified`
- `nextPending`
- `lightweightPending`
- `posterLoaded`
- `source`

If a verified event appears, also verify its displayed name/date/source against current public source before calling data correctness complete.

## 9. Remaining priorities after v7.12.8 device QA

### P1 — full RC physical smoke

Test all ten widget states on iPhone:

- UFC Medium / Large
- RIZIN Medium / Large
- ONE Medium / Large
- BOXING Medium / Large
- K-1 Medium / Large

Check:

- blank/crash
- current/next duplication
- wrong event
- time/location/card truth
- clipping/readability
- image/event mismatch
- memory behavior

### P2 — documentation / product polish

- `README.md` still describes Medium-only support; update to Medium + Large and current Loader/runtime architecture.
- `HANDOFF_CODEX.md` is historical; optionally replace its content with a pointer to this file after RC.
- Old branches may be cleaned later, but **never modify/delete/promote `friends-stable` without explicit user approval**.

## 10. Known risks / data debt

### BOXING memory sensitivity

Still a core technical risk. A future richer UI must preserve the validated cache-only widget rule unless device measurements prove a heavier path safe.

### BOXING data availability

The cache-only widget design can remain pending longer than a direct deep scrape. This is an intentional reliability tradeoff.

### Suspicious current BOXING snapshot source

`SNAPSHOT.boxing.source` currently contains:

`https://www.ufc.com/news/garcia-vs-benn-official-fight-card`

This is suspicious/noncanonical for boxing. Do **not** silently correct or reuse it as future truth without current-source verification. Treat as explicit data debt.

### README / historical handoff

- README is behind current Medium+Large support.
- `HANDOFF_CODEX.md` is stale.

## 11. Do-not-do list

- **Do not modify/promote/delete `friends-stable` without explicit approval.**
- Do not deep-scrape BOXING in Medium/Large widget execution.
- Do not restore heavy BOXING DrawContext composition without physical-device evidence.
- Do not display a poster unless event/image identity is validated.
- Do not invent fighters, times, venues, cards or events.
- Do not infer poster provenance merely from a screenshot.
- Do not keep one-shot `zz-*` workflows in main.
- Do not switch production routing to preview loaders.
- Do not add unnecessary backend/PWA/Vercel dependencies.
- Do not claim a runtime fix complete from CI alone.
- Do not use `HANDOFF_CODEX.md` as current state.

## 12. Development procedure

For runtime-affecting work:

1. fetch latest `main`
2. inspect current code + `HANDOFF.md`
3. branch from exact main SHA
4. syntax/build checks
5. regression
6. merge only after green CI
7. main regression
8. physical iPhone verification
9. regression again if any code changes follow device QA

When a problem remains, diagnose from actual runtime/audit/source evidence before adding a patch.

## 13. Current branch / work state

Canonical production:

- `main`
- runtime `7.12.8-github`
- Loader `4.2.0`
- merge commit `6ef0fe5c3acfd2fdf1d5ff41d25237f61a2cc739`
- main Regression `#454 success`

Completed recent PRs:

- PR #40 — remove temporary BOXING sync UI -> v7.12.7
- PR #41 — verified manual BOXING prefetch/cache-only widget path -> v7.12.8

No temporary workflow is intended to remain in production.
`friends-stable` remains intentionally isolated.
A stale historical PR #3 may still exist; do not merge it blindly.

---

## Handoff start prompt

> COMBAT HUBの開発を引き継ぎます。Repositoryは `48wr9f4wgp-lab/combat-hub` です。GitHubの現在の `main` とルート `HANDOFF.md` を正本として取得してください。現在のproductionは runtime `v7.12.8-github` / Loader `v4.2.0`。v7.12.6のBOXING白画面対策とv7.12.7の同期表示cleanupはiPhone実機QA済みです。直近はv7.12.8の「手動BOXING prefetch -> verified cache -> Widgetはcache-only」経路の実機QAです。最初にコード変更せず最新main CIと `combat-hub.js` / `combat-hub-loader.js` を確認してください。その後iPhoneで既存Loaderを手動実行し、団体選択でBOXINGを選択してからMedium/Largeを確認します。pendingのままでも未検証イベントが無いだけなら正常です。異常時は推測でpatchせず `combat-hub-runtime-audit.json` の `version / widgetFamily / prefetched / cacheVerified / nextPending / lightweightPending / posterLoaded / source` を根拠に原因層を特定してください。`friends-stable` は明示承認なしに変更禁止です。syntax/build -> regression -> 実機確認 -> regressionの順を守り、未確認を完成扱いしないでください。
