# COMBAT HUB — Codex Handoff Ledger

## Purpose

This branch is the ChatGPT-side continuation branch while Codex usage is temporarily limited.
It is intentionally isolated from `main` so Codex can later compare, cherry-pick, rebase, or merge without ambiguity.

- Repository: `48wr9f4wgp-lab/combat-hub`
- Base branch: `main`
- Work branch: `chatgpt/codex-handoff-20260825`
- Draft PR: #1
- Created: 2026-08-25 JST

## Rules while this branch is active

1. `main` is treated as frozen by ChatGPT.
2. One purpose per commit where practical.
3. No Scriptable production Loader switch without explicit user action on the iPhone.
4. No deletion of the legacy COMBAT HUB files from `tackle-fit`.
5. No update of the friends distribution channel unless separately approved.
6. Visual design remains the verified v7.6 baseline unless a regression requires repair.
7. Every functional change should have regression coverage where feasible.
8. Any item not verified on a physical iPhone must be marked as not device-verified.

## State inherited from main

- Runtime on GitHub main: `7.6.0-github`
- Five parameters: UFC / RIZIN / ONE / BOXING / K1
- v7.6 visual alignment was verified on an iPhone before repository separation work.
- The production iPhone Loader has NOT yet been switched to the independent `combat-hub` repository.
- Legacy `tackle-fit` runtime remains available as rollback insurance.

## Codex local work reported but not pushed before its limit

Codex reported the following local changes. These are treated as design intent, not as trusted committed source, and are being independently reconstructed/tested on this branch:

- Standalone Loader v4 using only `48wr9f4wgp-lab/combat-hub` raw URLs.
- New cache namespace: `combat-hub-runtime-v4.js` and `combat-hub-runtime-v4-meta.json`.
- Runtime minimum version 7.6.0.
- Runtime bump to `7.6.1-github`.
- Standards-compliant relative URL resolution.
- Next-event discovery that falls through to detail pages when listing JSON-LD has no eligible event.
- BOXING event-name validation instead of accepting every Event JSON-LD node.
- UFC/RIZIN unknown-fighter poster fallback after roll-forward.
- Execution-based Scriptable mock regression tests.
- CI expanded to all pushes/PRs plus manual dispatch, Node 24.x, syntax checks and timeout.
- README expanded with standalone operations and rollback procedure.

## ChatGPT branch changes

### Completed on branch

- Added `combat-hub-loader.js` Loader v4 reconstruction.
  - Uses only the independent `48wr9f4wgp-lab/combat-hub` runtime URLs.
  - Uses v4 cache names so old v3 runtime cache cannot be reused accidentally.
  - Requires runtime >= 7.6.0.
  - Fresh home-screen cache TTL: 30 minutes.
  - Manual Scriptable execution prefers verified remote runtime.
  - Remote verified runtime is allowed to replace a numerically higher cached patch version so emergency rollback remains possible.
  - Falls back to a validated local v4 cache if both remote paths fail.
- Strengthened `.github/workflows/combat-hub-regression.yml` on this branch.
  - Runs on every push and pull request.
  - Adds `workflow_dispatch`.
  - Uses Node 24.x.
  - 5 minute timeout.
  - Cancels superseded runs on the same ref.
  - Syntax-checks runtime, Loader, and regression test before executing tests.
- Opened Draft PR #1 as the permanent comparison surface for Codex return.

### Pending / in progress

- Reconstruct runtime reliability improvements as small reviewable commits.
- Upgrade regression tests from source-pattern checks to execution-level checks.
- Expand README with independent operations and rollback procedure.
- Physical-device verification after eventual production Loader migration.

## Physical-device verification

Anything developed on this branch is **not considered production-verified** until the user switches the iPhone Loader and confirms all five widgets on-device.

## Codex return procedure

When Codex access returns:

1. Fetch `origin/main` and `origin/chatgpt/codex-handoff-20260825`.
2. Preserve any uncommitted Codex work before doing anything else (`git status`, then stash or commit to a temporary branch).
3. Compare Codex local changes against this branch rather than blindly overwriting either side.
4. Run the complete regression suite on the chosen combined tree.
5. Resolve differences based on behavior/tests, not timestamp.
6. Only after tests pass, merge/cherry-pick into `main`.
7. Keep the old `tackle-fit` runtime until independent-repo iPhone verification succeeds.

## Current production-impact status

No production route has been changed by this branch. The user's existing home-screen widgets should continue using their current Loader path until the explicit migration step.
