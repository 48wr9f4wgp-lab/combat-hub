# COMBAT HUB — Development Handoff

Updated: 2026-09-14 JST

> **This file is the canonical handoff for the current project state.**
> `HANDOFF_CODEX.md` is historical and contains stale v7.8-era status; do not use it as the current baseline.

## 1. Purpose / target finished state

COMBAT HUB is a personal iOS/iPadOS **Scriptable home-screen combat-sports widget**. One loader/runtime supports five organizations via Widget Parameter:

- `UFC`
- `RIZIN`
- `ONE`
- `BOXING`
- `K1`

Target finished state:

- Medium and Large widgets are both stable on physical iPhone.
- Japanese-first premium event-poster UI.
- Current/upcoming event, date/time/location, countdown/status, main event and support card are clear at a glance.
- Next-event roll-forward never shows the same event as both current and next.
- Unknown fighters/cards/times/venues are never invented; uncertain data stays TBA/pending.
- Official/primary public sources + trusted snapshots + local caches provide resilient operation.
- Network/image/parser failure never causes a blank widget when a safe fallback can be rendered.
- Runtime changes pass CI and then physical-device smoke testing before RC/Freeze.

## 2. Technology / libraries / external services

### Runtime

- JavaScript executed by **Scriptable** on iOS/iPadOS.
- No npm runtime dependencies.
- Main Scriptable APIs used: `ListWidget`, `Request`, `FileManager.local()`, `DrawContext`, `LinearGradient`, `DateFormatter`, `Alert`, `Font`, `Color`, `Size`, `Rect`, `Point`, `Script`.

### Delivery

- GitHub repository: `48wr9f4wgp-lab/combat-hub`
- Production branch: `main`
- Canonical route on device: `combat-hub-loader.js` -> raw GitHub `main/combat-hub.js`.
- Loader version on repo/device target: **4.2.0**.
- Production runtime: **7.12.6-github**.

### CI / tests

- GitHub Actions.
- Node.js 24.x.
- Tests use Node built-ins (`fs`, `assert`, `vm` where needed); no package manager/package.json is required.

### Public data sources currently encoded

- UFC: `https://www.ufc.com/events`
- RIZIN: `https://jp.rizinff.com/`
- ONE: `https://www.onefc.com/events/`
- BOXING listing: `https://www.ringmagazine.com/events`
- K-1: `https://www.k-1.co.jp/k-1wgp/schedule`
- Runtime delivery: `raw.githubusercontent.com` and GitHub raw fallback URL.

No Vercel, GitHub Pages, HTML/PWA runtime, Tackle Fit runtime, database, backend API server, analytics SDK, auth provider, or paid external service is required.

## 3. Directory structure / important files

```text
/
├─ .github/
│  └─ workflows/
│     └─ combat-hub-regression.yml
├─ tests/
│  ├─ combat-hub-regression.mjs
│  ├─ combat-hub-cache-regression.mjs
│  ├─ combat-hub-current-data-audit.mjs
│  ├─ combat-hub-event-transition-regression.mjs
│  ├─ combat-hub-japanese-display.mjs
│  ├─ combat-hub-k1-layout-regression.mjs
│  ├─ combat-hub-large-regression.mjs
│  ├─ combat-hub-one-composite-regression.mjs
│  ├─ combat-hub-typography-regression.mjs
│  └─ combat-hub-ufc-rollforward-regression.mjs
├─ combat-hub.js
├─ combat-hub-loader.js
├─ combat-hub-preview-loader.js
├─ combat-hub-large-preview-loader.js
├─ README.md
├─ HANDOFF_CODEX.md        # historical/stale; not canonical now
└─ HANDOFF.md              # canonical current handoff
```

Important roles:

- `combat-hub.js`: production runtime, data acquisition, cache logic, state transitions, Medium/Large rendering.
- `combat-hub-loader.js`: stable device-side loader. Fetches/validates runtime, holds local v4 cache, renders a `RUNTIME ERROR` widget for catchable runtime/fetch exceptions.
- `combat-hub-preview-loader.js`: preview/compatibility utility, not the production device route.
- `combat-hub-large-preview-loader.js`: Large preview-only helper, not the production loader.
- `.github/workflows/combat-hub-regression.yml`: the only workflow that should remain on `main`. Temporary one-shot patch workflows must be removed before merge.

## 4. Implemented features

### Loader / reliability

- Loader v4.2.0 validates runtime version/signature markers before execution.
- Primary + fallback GitHub raw runtime URLs.
- 30-minute verified local runtime cache for normal widgets.
- BOXING Large bypasses the 30-minute runtime cache so urgent runtime fixes reach it immediately.
- If remote fetch fails, loader can fall back to last valid cached runtime.
- Catchable loader/runtime failures render a red `RUNTIME ERROR` widget instead of silently returning blank.

### Data safety / event lifecycle

- Trusted `SNAPSHOT` current-event baselines for UFC/RIZIN/ONE/BOXING/K-1.
- Trusted `NEXT_SNAPSHOT` fallbacks for UFC/RIZIN/ONE/K-1.
- Current-event identity lock and 2h current-data refresh cache.
- Current official page may overlay card data only when parsed main-event identity matches the trusted current main event.
- Current/next identity dedupe: source/name/main-fight checks prevent `current === next` duplication.
- Roll-forward time windows and bounded 180-day future acceptance.
- Unknown card/time remains explicit (`対戦カード発表待ち`, `時刻未定`, etc.).
- ONE composite-event normalization for Friday Fights / The Inner Circle timing/name handling.
- UFC listing/detail fallback parsing.

### Caching

Scriptable `FileManager.local()` is used for bounded local cache files, including:

- runtime: `combat-hub-runtime-v4.js`, `combat-hub-runtime-v4-meta.json`
- current data: `combat-hub-current-${KEY}.json`
- next data: `combat-hub-next-${KEY}.json`
- Large next: `combat-hub-large-next-${KEY}.json`
- metadata/image/profile caches under `combat-*`
- runtime sync audit: `combat-hub-runtime-audit.json`

### UI / rendering

- Medium and Large renderers exist in one runtime.
- Japanese labels and fighter/event display map.
- Organization accents: UFC red, RIZIN green, ONE gold, BOXING blue, K-1 orange.
- Main event hierarchy, centered VS, division/context, support-card rows, next-event panel, countdown/status.
- Large is a dedicated layout, not a stretched Medium widget.
- Poster/fighter imagery has fallback gradients.
- BOXING has dedicated low-memory paths because Scriptable Large/Medium previously white-crashed under heavier image/network work.

### Regression coverage

CI currently checks:

- runtime/loader/preview-loader syntax
- general runtime behavior
- cache behavior
- ONE composite timing
- UFC roll-forward
- K-1 layout
- typography
- current-data audit
- Large widget behavior
- Japanese display
- event transitions

## 5. Current implementation / progress

### Latest completed implementation: PR #38

Merged to `main` as:

- code baseline merge commit: `9a0561f87c99a1fa28137ce26137f753beae0aed`
- title: `fix: harden BOXING Medium and add runtime sync audit`
- runtime: **v7.12.6-github**
- main Regression run: **#419 success**

What v7.12.6 changed:

1. **BOXING Medium + Large widget memory guard**
   - Previously only Large short-circuited expensive post-event discovery.
   - Now `KEY==='boxing' && config.runsInWidget` applies to both Medium and Large.
   - After the trusted current BOXING event expires, a widget uses a valid cached next event if one exists; otherwise it immediately returns a lightweight pending state.
   - Widget mode does **not** deep-scrape Ring/detail pages in that pending state.
   - Pending BOXING widget state sets `posterURL:null` and uses `source:S.listing`.

2. **BOXING Medium + Large poster memory guard**
   - In widget mode, BOXING only loads a poster when the data is not pending and the event is a locked/known current identity.
   - Pending states should therefore render the lightweight gradient, not a heavyweight or unverified poster.

3. **Runtime sync audit**
   - `writeRuntimeAudit(D,ctx)` writes `combat-hub-runtime-audit.json` with runtime version, family, pending flags, event/source and poster-loaded state.
   - Temporary visible sync markers were added for BOXING pending states so device screenshots can prove which runtime is executing:
     - Medium footer: `同期 7.12.6`
     - Large compact pending rail: runtime version text.

### Verification status

- **CI: PASS.** Main #419 is green.
- **Physical-device verification for v7.12.6: NOT YET CONFIRMED in the conversation at handoff time.**
- Before v7.12.6, user reported BOXING Medium was white/blank.
- Before v7.12.6, BOXING Large was rendering again but its pending state still showed fighter imagery; whether that image was truly the previous-event poster was not established. Do not repeat that unsupported assumption.

## 6. Remaining work / priorities

### P0 — physical-device validation of v7.12.6

1. On iPhone, open Scriptable and manually run the installed `COMBAT HUB` Loader once. Manual run is important because Medium can otherwise keep a valid runtime cache for up to 30 minutes.
2. Return to Home Screen and refresh/check **BOXING Medium**.
3. Expected Medium result:
   - no white/blank widget
   - lightweight pending state if no valid future event is cached
   - no fighter/poster image in pending state
   - visible footer `同期 7.12.6`
4. Check **BOXING Large**.
5. Expected Large result:
   - no white/blank widget
   - pending state uses gradient when no verified next event exists
   - no unverified fighter/poster imagery
   - visible v7.12.6 marker in the compact pending rail.

### P0 — if Medium is still white after manual Loader refresh

Do **not** add more speculative data/parser patches.

Use the current instrumentation to determine the failure layer:

- Confirm Loader on device is v4.2.0.
- Check whether `同期 7.12.6` appears.
- Read/inspect `combat-hub-runtime-audit.json` (or add a tiny manual diagnostic reader if needed) to confirm:
  - `version`
  - `widgetFamily`
  - `nextPending`
  - `lightweightPending`
  - `posterLoaded`
  - `source`
- If runtime audit is written but widget is still white and no `RUNTIME ERROR` appears, suspect a process-level Scriptable/iOS memory/render crash rather than a catchable JS exception.
- Isolate the Medium render path with a minimal local fallback; do not change Loader again unless evidence points to Loader.

### P1 — remove temporary sync UI after device confirmation

- Once v7.12.6 Medium/Large is proven on-device, remove the visible `同期 7.12.6` / Large version marker.
- Keep `writeRuntimeAudit` if useful, or intentionally remove it in the same cleanup PR; decide explicitly.

### P1 — restore trustworthy BOXING next-event richness safely

Current widget-mode stability intentionally sacrifices live BOXING deep discovery after the current event expires. Product gap:

- BOXING may remain `次大会情報を確認中` until a valid next cache exists.

Preferred future architecture:

- prefetch/refresh BOXING next-event data during **manual Scriptable runs** or another non-widget execution path,
- persist only validated event identity/data/poster metadata to cache,
- widget execution reads that bounded cache only.

Do not reintroduce multi-page scraping or arbitrary remote poster decoding directly in the widget path.

### P1 — full RC device smoke

After BOXING is stable, test all 5 organizations on physical iPhone:

- UFC Medium / Large
- RIZIN Medium / Large
- ONE Medium / Large
- BOXING Medium / Large
- K-1 Medium / Large

Check: blank/crash, wrong event, current=next duplication, time/location/card truth, text clipping, image mismatch, memory behavior.

### P2 — documentation cleanup

- `README.md` still says Widget size is Medium; update it to reflect Medium + Large and current v4.2/v7.12 architecture.
- `HANDOFF_CODEX.md` is historical and stale; optionally replace it with a pointer to this file after the project is stable.
- Old merged branches are numerous; branch cleanup is optional and must not touch `friends-stable` without explicit approval.

## 7. Current bugs / technical risks

### Confirmed / recently observed

1. **BOXING Medium white widget**
   - Observed by user before v7.12.6.
   - v7.12.6 contains the intended fix, but device verification is still pending.

2. **BOXING widget memory sensitivity**
   - Large previously crashed/blanked when heavy images/deep discovery were used.
   - Medium was later reported white too.
   - Current mitigation is a widget-wide BOXING short-circuit + poster suppression in pending state.

3. **BOXING next-event availability tradeoff**
   - Widget execution no longer performs deep live discovery after current event expiry.
   - Stable, but can show TBA longer than ideal.

### Data debt

- Current `SNAPSHOT.boxing.source` in code is `https://www.ufc.com/news/garcia-vs-benn-official-fight-card`. This is suspicious/noncanonical for boxing and should be re-audited before that snapshot/source is reused as a future truth source.
- Do not silently “correct” it without current-source verification; treat this as known tech/data debt.

### Documentation debt

- `README.md` is outdated regarding Medium-only support.
- `HANDOFF_CODEX.md` is outdated regarding runtime versions/state.

## 8. Important design decisions / reasons

### Loader/runtime split

Reason: keep a small stable Scriptable script on device while shipping runtime fixes through GitHub. Runtime is version-validated before `eval` and can fall back to a known-good local cache.

### Trusted snapshots + confidence-gated live refresh

Reason: combat event pages are inconsistent and parser mistakes are more damaging than temporary TBA. Current data may overlay the trusted baseline only after identity validation.

### Current/next identity dedupe

Reason: ONE and other listings can temporarily expose the current event as “upcoming”; explicit identity checks prevent self-duplication.

### BOXING low-memory widget path

Reason: physical iPhone Scriptable showed white/blank crashes under heavier image/network work. Stability wins over richer live discovery inside the widget process.

### Manual-run prefetch is preferable to widget deep discovery

Reason: Scriptable widget memory/time limits are tighter than manual execution. Move expensive discovery away from widget rendering and cache validated results.

### CI != device verification

Reason: Node regression tests validate code structure/logic but cannot reproduce iOS Scriptable memory limits, widget snapshot caching, image decode cost, or actual Home Screen behavior.

## 9. Rejected approaches / do-not-do list

- **Do not modify/promote `friends-stable` without explicit user approval.**
- Do not restore deep 16-page BOXING discovery in the widget execution path.
- Do not restore heavy full-widget DrawContext poster composition for BOXING without measured device proof; it previously correlated with white crashes.
- Do not show an event/fighter poster unless it is validated as belonging to the displayed event state.
- Do not invent fighters, times, venues, cards or next events.
- Do not treat a user screenshot’s fighter image as “the previous-event poster” unless provenance is actually verified.
- Do not keep temporary `zz-*` / one-shot GitHub workflows in `main`. Main currently has only `combat-hub-regression.yml`.
- Do not make `combat-hub-preview-loader.js` or `combat-hub-large-preview-loader.js` the production route.
- Do not add Vercel/Pages/PWA/Tackle Fit dependencies; this app is intentionally standalone Scriptable.
- Do not call a fix complete from CI alone; require physical-device verification.
- Do not use `HANDOFF_CODEX.md` as the current status source.

## 10. UI / UX direction

- Premium sports/event-poster feel, not a utility-table look.
- Japanese-first labels and clear hierarchy.
- Main event is the visual hero; support card and next event are secondary.
- Large must use the full Large canvas, not stretch Medium.
- Centered confrontation / centered VS axis.
- Lower dashboard uses dark translucent treatment and readable typography.
- Organization accent colors stay consistent.
- Data truth beats visual richness: if event/image identity is uncertain, use TBA + neutral/brand gradient rather than potentially misleading imagery.
- Avoid cramped fighter faces, clipped labels, tiny lower-half text, and decorative elements that cost Scriptable memory without information value.
- Once an on-device visual state passes, freeze it unless a demonstrated defect requires reopening it.

## 11. DB / API / auth / environment configuration

### Database

None.

### Authentication

None.

### Environment variables / secrets

None.

### API/backend

No owned backend API. Runtime performs public HTTP GETs directly from Scriptable using `Request`.

### Local persistence

Scriptable local document storage via `FileManager.local()` only. Cache files are disposable/rebuildable runtime state; GitHub `main` remains source of truth for code.

## 12. First concrete task for the next chat

**Do not start by editing code. Start with device verification of the already-merged v7.12.6 fix.**

Exact sequence:

1. Fetch/read `main`, `HANDOFF.md`, `combat-hub.js`, `combat-hub-loader.js`.
2. Confirm main contains `VERSION='7.12.6-github'` and Loader `4.2.0`.
3. Confirm latest main Regression is green (baseline at handoff: run #419 success).
4. Ask user to manually run the already-installed COMBAT HUB Loader once on iPhone, then inspect **BOXING Medium** first.
5. Expected visible proof: `同期 7.12.6` and no white widget.
6. Then inspect BOXING Large; expected no unverified poster in pending state and visible v7.12.6 sync marker.
7. If either fails, use `combat-hub-runtime-audit.json` to identify the actual runtime/family/pending/poster state before changing anything.
8. If both pass, make one cleanup PR removing temporary visible sync markers, then run full 5-org Medium/Large physical-device smoke and decide RC Freeze.

## 13. Branch / commit / work state

### Canonical production

- Repository: `48wr9f4wgp-lab/combat-hub`
- Production branch: `main`
- Runtime: `7.12.6-github`
- Loader: `4.2.0`
- Runtime implementation baseline merge commit: `9a0561f87c99a1fa28137ce26137f753beae0aed`
- Main CI at implementation baseline: Regression **#419 success**.

### Latest implementation branch

- `chatgpt/boxing-medium-sync-audit-v7.12.6`
- branch head: `d040275ae2d610a5f4263aaccfb1f55a94d0b61a`
- merged by PR #38.
- Its tree is the implementation tree merged into main; **do not continue development from this old feature branch. Start new work from current `main`.**

### Handoff documentation branch

- `chatgpt/handoff-20260914`
- docs-only branch created from current main to add this file.
- Once merged, main SHA will be newer than the runtime implementation baseline above, but runtime code should remain unchanged.

### Uncommitted / unmerged state

- GitHub remote has no observable “uncommitted working tree”.
- No unmerged implementation work is known after PR #38; the implementation branch was merged and main CI passed.
- Main `.github/workflows` contains only the canonical regression workflow; temporary one-shot workflows are not present.
- A stale open PR #3 (`WIP: v7.7.1 diagnostics pass`) still exists from older work. It is not part of the current baseline and should not be merged blindly.
- `friends-stable` exists and remains intentionally isolated.

---

## Handoff start prompt

Copy this into the first message of the next chat:

> COMBAT HUBの開発を引き継ぎます。Repositoryは `48wr9f4wgp-lab/combat-hub` です。まずGitHubの現在の `main` を正本として取得し、プロジェクトルートの `HANDOFF.md` を読んでください。会話ログより実コードを優先してください。現在のruntimeはv7.12.6系、Loaderはv4.2.0系で、直近の目的はBOXING Medium/Largeの実機QAです。最初にコード変更せず、mainの最新CIと `combat-hub.js` / `combat-hub-loader.js` を確認し、iPhoneでLoaderを手動実行後のBOXING Medium表示を確認してください。Mediumで `同期 7.12.6` が出て白画面が解消しているか、次にLargeでpending時に未確認ポスターが出ないかを確認します。失敗時は推測でパッチせず `combat-hub-runtime-audit.json` の状態を根拠に原因層を特定してください。`friends-stable` は明示承認なしに変更禁止です。build/syntax → regression → 実機確認 → regressionの順を守り、未確認を完成扱いしないでください。
