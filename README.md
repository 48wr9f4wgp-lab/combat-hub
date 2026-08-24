# COMBAT HUB

Standalone Scriptable widget for UFC / RIZIN / ONE / BOXING / K-1.

## Runtime

- iOS / iPadOS: Scriptable
- Widget size: Medium
- Widget Parameter: `UFC`, `RIZIN`, `ONE`, `BOXING`, or `K1`
- No HTML, CSS, manifest, GitHub Pages, Vercel, or Tackle Fit runtime dependency

## Files

- `combat-hub.js` — production Scriptable widget
- `tests/combat-hub-regression.mjs` — regression guards
- `.github/workflows/combat-hub-regression.yml` — syntax + regression CI

## Test

```bash
node --check combat-hub.js
node tests/combat-hub-regression.mjs
```

## Data sources

The script reads public event/profile pages for UFC, RIZIN, ONE, Ring Magazine, and K-1 and keeps bounded local caches inside Scriptable.

## Repository boundary

COMBAT HUB is maintained independently from `tackle-fit`. Tackle Fit HTML/PWA/Pages assets are not dependencies of this project.
