# COMBAT HUB

Standalone Scriptable widget for UFC / RIZIN / ONE / BOXING / K-1.

## Runtime

- iOS / iPadOS: Scriptable
- Widget sizes: Small / Medium / Large
- Widget Parameter: `UFC`, `RIZIN`, `ONE`, `BOXING`, or `K1`
- No HTML, CSS, manifest, GitHub Pages, Vercel, or Tackle Fit runtime dependency

## Canonical Scriptable setup

Scriptable should store and execute `combat-hub-loader.js`.
The Loader fetches the production runtime from this repository only:

- `https://raw.githubusercontent.com/48wr9f4wgp-lab/combat-hub/main/combat-hub.js`
- `https://github.com/48wr9f4wgp-lab/combat-hub/raw/refs/heads/main/combat-hub.js`

The Loader keeps an isolated v4 runtime cache inside Scriptable and falls back to the last validated cache if GitHub is temporarily unavailable.

## Files

- `combat-hub-loader.js` — canonical Scriptable Loader
- `combat-hub.js` — production Scriptable runtime
- `tests/*.mjs` — execution, cache, roll-forward, layout, typography, and current-data audit guards
- `.github/workflows/combat-hub-regression.yml` — syntax + regression CI

## Test

```bash
node --check combat-hub.js
node --check combat-hub-loader.js
for f in tests/*.mjs; do node --check "$f"; done
for f in tests/*.mjs; do node "$f"; done
```

## Data sources

The script reads public official/primary event and profile pages for UFC, RIZIN, ONE, BOXING, and K-1. BOXING future discovery is intentionally multi-source: The Ring, Matchroom, PBC, Top Rank, Queensberry, and Teiken are admitted first-party/primary sources. Manual Scriptable execution may verify and cache one highlighted BOXING event; Home Screen Widget execution remains network-free for BOXING discovery and consumes verified local cache only. Trusted current snapshots and bounded caches remain in place; uncertain cards/times remain explicitly TBA.

## Repository boundary

COMBAT HUB is maintained independently from `tackle-fit`.
Tackle Fit HTML/PWA/Pages assets and repositories are not runtime dependencies of this project.

`main` is the personal production baseline. Runtime changes still require physical-device verification after CI. `friends-stable` is separate and is not promoted implicitly.

## BOXING highlighted-event model

BOXING does not pretend there is one universal next event. After the current trusted event expires, manual/non-widget execution aggregates approved official sources, deduplicates the same fight across sources, prefers local promoter truth for event identity/time/venue/context, and stores one verified **注目興行** in local cache. If a future candidate exists, started/past cards cannot outrank it during roll-forward. Widget rendering stays cache-only and network-free for BOXING discovery.
