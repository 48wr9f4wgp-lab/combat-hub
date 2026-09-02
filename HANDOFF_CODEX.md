# COMBAT HUB — Codex Handoff Ledger

Updated: 2026-09-02 JST

## Canonical state
- Repository: `48wr9f4wgp-lab/combat-hub`
- Production branch: `main`
- Canonical Scriptable route: `combat-hub-loader.js` → `main/combat-hub.js`
- Audited runtime line: `7.8.0-github`
- Parameters: UFC / RIZIN / ONE / BOXING / K1
- COMBAT HUB is independent from Tackle Fit.
- `friends-stable` is intentionally isolated and must not be promoted without explicit user approval.

## 2026-09-02 live-data audit
Official-source audit found two production data defects and two maintenance weaknesses:
1. ONE Friday Fights 169 had a confirmed card but runtime still showed TBA.
2. K-1 WORLD MAX 2026 incorrectly labeled Kaneko vs Riamu as the overall main; official fight order names Jonas Salsicha vs Zhora Akopyan as the event main.
3. Trusted current snapshots were frozen until start+12h and only poster metadata refreshed, so late card changes could remain stale.
4. The compatibility Preview Loader still followed the obsolete `chatgpt/reliability-v7.7` branch.

v7.8.0 corrects ONE/K-1 truth, adds a confidence-gated current-event refresh with a 2h cache, adds ONE `tr.vs` card parsing, and moves the compatibility Preview Loader to `main`. A parsed current card may overlay a trusted snapshot only when the parsed main event matches the trusted main; otherwise the trusted snapshot is preserved.

## Data policy
- Never invent fighters, times, venues, or cards.
- Trusted snapshots protect against parser mistakes.
- Current official-page refresh is allowed only after main-event identity validation.
- Unknown next cards remain `対戦カード発表待ち`; unknown exact times remain `時刻未定`.

## Merge / quality policy
- `main` is the personal production baseline.
- Meaningful work uses branch + CI before promotion.
- GitHub/CI success is not iPhone Scriptable verification.
- Keep the verified visual system frozen unless a demonstrated issue requires change.
- Never modify `friends-stable` without explicit approval.

## Codex return procedure
1. Fetch `main`; do not discard unrelated local work.
2. Read this ledger plus current runtime/tests.
3. Treat `main` as canonical unless the user explicitly names another branch.
4. Preserve visual freeze and safe-live rules.
5. Run all tests and perform Scriptable device verification for runtime changes.
