# COMBAT HUB — Codex Handoff Ledger

## Current purpose

ChatGPT is continuing COMBAT HUB development while Codex usage is temporarily limited.
All new reliability work is isolated so Codex can later compare, cherry-pick, rebase, or merge without ambiguity.

- Repository: `48wr9f4wgp-lab/combat-hub`
- Production branch: `main`
- Friends stable branch: `friends-stable`
- Current ChatGPT work branch: `chatgpt/reliability-v7.7`
- Reliability target: v7.7
- Updated: 2026-08-26 JST

## Current production state

- COMBAT HUB is fully separated from `tackle-fit` for active runtime/distribution.
- Personal production route is now:
  - Scriptable → Loader v4 → `combat-hub/main/combat-hub.js`
- Personal runtime on `main`: `7.6.0-github`.
- Five parameters are active: UFC / RIZIN / ONE / BOXING / K1.
- Physical-device smoke tests passed for all five categories after the repository migration.
- `friends-stable` exists in this repository and remains intentionally frozen at `7.3.0-github`.
- Legacy `tackle-fit/friends-stable` was reset to the COMBAT-HUB-removed Tackle Fit main commit; active friend distribution files no longer live there.
- A historical backup branch in `tackle-fit` may remain for recovery/history only and is not an active runtime path.

## Rules for v7.7 Reliability Pass

1. Do not modify `friends-stable` unless the user explicitly approves friend-channel promotion.
2. Keep the verified v7.6 visual/layout design frozen unless a functional regression requires repair.
3. Reliability changes belong on `chatgpt/reliability-v7.7`, not directly on `main`.
4. One purpose per commit where practical.
5. Every functional change should gain regression coverage where feasible.
6. GitHub/CI verification is not equivalent to physical-device verification.
7. Do not claim a runtime change is production-complete before Scriptable device verification.
8. No Store/public distribution, paid-service changes, or unrelated external-impact operations.

## Reliability backlog inherited from Codex local work

Codex reported these local changes before its usage limit. They are treated as design intent, not trusted committed source, and should be independently reconstructed/tested:

- Standards-compliant relative URL resolution.
- Next-event discovery that filters listing JSON-LD for eligible candidates before deciding whether detail-page traversal is needed.
- BOXING event-name validation instead of accepting every `Event` JSON-LD node.
- UFC/RIZIN unknown-fighter event-poster fallback after roll-forward.
- Execution-based Scriptable mock regression tests.
- Better coverage for post-event roll-forward and cache behavior.

Already completed and merged before this v7.7 branch:

- Standalone Loader v4 using only `48wr9f4wgp-lab/combat-hub` URLs.
- Isolated v4 Loader cache namespace.
- Runtime minimum 7.6.0.
- CI on pushes/PRs/manual dispatch with Node 24.x and syntax checks.
- Independent repository README/operations documentation.
- Full personal iPhone migration and five-category device smoke test.
- New `combat-hub/friends-stable` channel with v7.3 and independent friend Loader/Bootstrap/CI.
- Active COMBAT HUB files removed from Tackle Fit distribution paths.

## v7.7 implementation order

1. Relative URL resolver hardening.
2. Eligible-first next-event discovery.
3. BOXING false-positive filtering.
4. Unknown-fighter poster fallback for UFC/RIZIN.
5. Regression suite upgrade toward execution-level Scriptable mocks.
6. Cache/network-efficiency review.
7. Post-event roll-forward regression scenarios for all five categories.
8. CI green on the branch.
9. Physical-device verification before any merge/promotion to production.

## Codex return procedure

When Codex access returns:

1. Preserve any uncommitted Codex local work first (`git status`; stash or temporary branch if needed).
2. Fetch `origin/main` and `origin/chatgpt/reliability-v7.7`.
3. Compare Codex local work against the v7.7 branch; do not overwrite either side blindly.
4. Prefer behavior validated by tests over timestamp/newness.
5. Run the full regression suite on the combined candidate tree.
6. Review the Draft PR for v7.7 before merge.
7. Physical-device checks remain required for runtime/UI behavior not fully represented by mocks.

## Production-impact status of this branch

Until explicitly merged, `chatgpt/reliability-v7.7` does not change the user's active home-screen widgets or the friend stable channel.
