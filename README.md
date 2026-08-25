# COMBAT HUB

Standalone Scriptable widget for UFC / RIZIN / ONE / BOXING / K-1.

## Runtime

- iOS / iPadOS: Scriptable
- Widget size: Medium
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
- `tests/combat-hub-regression.mjs` — regression guards
- `.github/workflows/combat-hub-regression.yml` — syntax + regression CI

## Test

```bash
node --check combat-hub.js
node --check combat-hub-loader.js
node --check tests/combat-hub-regression.mjs
node tests/combat-hub-regression.mjs
```

## Data sources

The script reads public event/profile pages for UFC, RIZIN, ONE, Ring Magazine, and K-1 and keeps bounded local caches inside Scriptable.

## Repository boundary

COMBAT HUB is maintained independently from `tackle-fit`.
Tackle Fit HTML/PWA/Pages assets and repositories are not runtime dependencies of this project.

The final migration gate is physical-device verification after switching the iPhone Scriptable script to the canonical Loader above.
