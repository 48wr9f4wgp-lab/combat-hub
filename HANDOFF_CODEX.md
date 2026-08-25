# COMBAT HUB — Codex Handoff Ledger

## Current purpose

ChatGPT is continuing COMBAT HUB development while Codex usage is temporarily limited.
All new reliability work is isolated so Codex can later compare, cherry-pick, rebase, or merge without ambiguity.

- Repository: `48wr9f4wgp-lab/combat-hub`
- Production branch: `main`
- Friends stable branch: `friends-stable`
- Current ChatGPT work branch: `chatgpt/reliability-v7.7`
- Draft PR: `#2 WIP: v7.7 reliability pass`
- Reliability target: v7.7
- Updated: 2026-08-26 JST

## Current production state

- COMBAT HUB is fully separated from `tackle-fit` for active runtime/distribution.
- Personal production route: Scriptable → Loader v4 → `combat-hub/main/combat-hub.js`.
- Personal runtime on `main`: `7.6.0-github`.
- Five parameters are active: UFC / RIZIN / ONE / BOXING / K1.
- Physical-device smoke tests passed for all five categories after repository migration.
- `friends-stable` remains intentionally frozen at `7.3.0-github`.
- Active COMBAT HUB friend/runtime files no longer live in Tackle Fit distribution paths.
- A historical Tackle Fit backup branch may remain for recovery/history only and is not an active runtime path.

## Rules for v7.7 Reliability Pass

1. Do not modify `friends-stable` unless the user explicitly approves friend-channel promotion.
2. Keep the verified v7.6 visual/layout design frozen unless a functional regression requires repair.
3. Reliability changes belong on `chatgpt/reliability-v7.7`, not directly on `main`.
4. One purpose per commit where practical.
5. Every functional change should gain regression coverage where feasible.
6. GitHub/CI verification is not equivalent to physical-device verification.
7. Do not claim a runtime change is production-complete before Scriptable device verification.
8. No Store/public distribution, paid-service changes, or unrelated external-impact operations.

## v7.7 completed on branch

### Runtime reliability

- Runtime version bumped on branch only to `7.7.0-github`.
- Visual/layout constants remain the verified v7.6 values.
- `absoluteURL()` now handles absolute, protocol-relative, root-relative, path-relative, parent-relative, query-only and fragment-only URLs, including trailing-slash preservation.
- `strictNextEvent()` now filters listing JSON-LD for eligible events before deciding whether detail-page traversal is needed.
- BOXING no longer accepts arbitrary `Event` JSON-LD; event names must look fight-related (`vs`, boxing, fight, title, championship, or `対`).
- UFC/RIZIN unknown-fighter roll-forward uses the event poster instead of collapsing to a plain gradient.

### Performance / resilience

- Event `og:image` metadata is cached locally for 4 hours (`combat-meta-*`).
- Fighter profile image URL/localized-name metadata is cached locally for 12 hours (`combat-profile-*`).
- Fresh event metadata avoids repeated event-page HTML requests.
- Fresh fighter metadata avoids repeated fighter-profile HTML requests.
- Stale metadata remains a fallback when upstream HTML requests fail.
- Existing image caches remain the final image-byte cache layer.

### Automated regression coverage

Primary execution-level suite covers:

- five parameters and standalone repository boundaries
- current snapshot/time-TBA guards
- current-event lock and next-event horizon
- real runtime URL resolution behavior
- BOXING false-positive rejection
- path-relative event/poster URLs
- roll-forward through detail pages for all five categories
- UFC/RIZIN unknown-fighter poster fallback
- fresh/stale next-event cache behavior
- Loader v4 remote fetch, fresh widget cache, offline fallback and emergency rollback behavior
- v7.6 visual regression guards

Focused cache-performance suite covers:

- fresh fighter metadata + image cache = zero network requests
- stale fighter metadata attempts refresh but keeps cached identity/image on failure
- fresh event metadata + image cache = zero network requests
- stale event metadata attempts refresh but keeps cached event image on failure
- locked current event with fresh metadata avoids event-page HTML request

### CI state

- Initial v7.7 test caught a real trailing-slash resolver bug; runtime was fixed rather than weakening the test.
- CI run #32: success after URL fix.
- CI run #34: success after five-org roll-forward + Loader execution coverage.
- CI run #40: success after metadata-cache performance suite was added to CI.

## Remaining v7.7 gates

1. Optional latency optimization review (parallel profile/detail requests) only if it remains low-risk and testable.
2. Final branch diff audit against `main` to confirm no accidental visual changes.
3. Branch-only Scriptable preview/device verification.
4. Only after device verification: decide whether to merge Draft PR #2 into `main`.
5. `friends-stable` stays unchanged unless separately approved.

## Codex return procedure

When Codex access returns:

1. Preserve any uncommitted Codex local work first (`git status`; stash or temporary branch if needed).
2. Fetch `origin/main` and `origin/chatgpt/reliability-v7.7`.
3. Compare Codex local work against PR #2 / the v7.7 branch; do not overwrite either side blindly.
4. Prefer behavior validated by tests over timestamp/newness.
5. Run both regression suites on the combined candidate tree.
6. Review PR #2 before merge.
7. Physical-device checks remain required for runtime/UI behavior not fully represented by mocks.

## Production-impact status of this branch

Until explicitly merged, `chatgpt/reliability-v7.7` does not change the user's active home-screen widgets or the friend stable channel.
