# COMBAT HUB — Friends Stable

友人向けの固定安定チャンネル。現在の配布版は `v7.3.0-github`。

## Runtime

- iOS / iPadOS: Scriptable
- Widget size: Medium
- Widget Parameter: `UFC`, `RIZIN`, `ONE`, `BOXING`, `K1`
- Runtime / Loader / Bootstrap はすべて `48wr9f4wgp-lab/combat-hub` 内で完結
- `tackle-fit` / Vercel / GitHub Pages への実行依存なし

## Canonical friend setup

Scriptableには `friend-loader.js`、または初回導入用の `friend-bootstrap.js` を使用する。

Stable runtime:

`https://raw.githubusercontent.com/48wr9f4wgp-lab/combat-hub/friends-stable/combat-hub.js`

Stable Loader:

`https://raw.githubusercontent.com/48wr9f4wgp-lab/combat-hub/friends-stable/friend-loader.js`

## Files

- `combat-hub.js` — 友人向け固定安定版 v7.3
- `friend-loader.js` — 友人用Loader
- `friend-bootstrap.js` — 初回導入用短縮Bootstrap
- `FRIENDS_INSTALL.md` — 導入手順
- `FRIENDS_SHARE_MESSAGE.md` — LINE共有用文面
- `tests/combat-hub-regression.mjs` — 友人版専用回帰ガード

## Release policy

`main` の変更はこのブランチへ自動では流さない。
実機確認済みの更新だけ、明示的な承認後に `friends-stable` へ昇格する。

## Test

```bash
node --check combat-hub.js
node --check friend-loader.js
node --check friend-bootstrap.js
node --check tests/combat-hub-regression.mjs
node tests/combat-hub-regression.mjs
```
