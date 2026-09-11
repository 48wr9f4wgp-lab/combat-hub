# COMBAT HUB — Codex Handoff Ledger

Updated: 2026-09-11 JST

## Canonical state
- Repository: `48wr9f4wgp-lab/combat-hub`
- Production branch: `main`
- Canonical Scriptable route: `combat-hub-loader.js` → `main/combat-hub.js`
- Audited runtime line: `7.8.1-github`
- Parameters: UFC / RIZIN / ONE / BOXING / K1
- COMBAT HUB is independent from Tackle Fit.
- `friends-stable` is intentionally isolated and must not be promoted without explicit user approval.

## 2026-09-11 live-data audit
Official/primary-source re-audit refreshed the trusted fallback baseline without changing the verified visual system:
1. UFC rolls to Noche UFC: Jean Silva vs Jose Miguel Delgado, main card September 12 at 5:00 PM EDT / September 13 at 06:00 JST.
2. RIZIN rolls past completed Super RIZIN.5 to RIZIN LANDMARK 16 in NAGASAKI on October 3 at 14:00 JST, with Horie vs Usami as the current lead listed bout.
3. ONE rolls to ONE Friday Fights 170 on September 11 at 22:30 JST, Yodlekpet vs Pompet.
4. BOXING keeps Garcia vs Benn but replaces time-TBA with the confirmed main-card start, September 13 at 09:00 JST, and adds Opetaia vs Mikaelian as co-main support.
5. K-1 WORLD MAX 2026 was reverified unchanged: Jonas Salsicha vs Zhora Akopyan remains the overall main.
6. `combat-hub-current-data-audit.mjs` now guards all five organizations instead of only ONE/K-1.

## 2026-09-02 live-data audit
Official-source audit found two production data defects and two maintenance weaknesses:
1. ONE Friday Fights 169 had a confirmed card but runtime still showed TBA.
2. K-1 WORLD MAX 2026 incorrectly labeled Kaneko vs Riamu as the overall main; official fight order names Jonas Salsicha vs Zhora Akopyan as the event main.
3. Trusted current snapshots were frozen until start+12h and only poster metadata refreshed, so late card changes could remain stale.
4. The compatibility Preview Loader still followed the obsolete `chatgpt/reliability-v7.7` branch.

v7.8.0 corrected ONE/K-1 truth, added a confidence-gated current-event refresh with a 2h cache, added ONE `tr.vs` card parsing, and moved the compatibility Preview Loader to `main`. A parsed current card may overlay a trusted snapshot only when the parsed main event matches the trusted main; otherwise the trusted snapshot is preserved.

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
