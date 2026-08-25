// COMBAT HUB FRIENDS Bootstrap
// Paste this once into Scriptable.

const URL = "https://raw.githubusercontent.com/48wr9f4wgp-lab/combat-hub/friends-stable/friend-loader.js";
const r = new Request(URL + "?cb=" + Date.now());
r.timeoutInterval = 12;
r.headers = {
  "User-Agent": "Scriptable",
  "Cache-Control": "no-cache, no-store",
  "Pragma": "no-cache"
};
const source = await r.loadString();
if (!source.includes("COMBAT HUB FRIENDS Loader")) {
  throw new Error("COMBAT HUB FRIENDS Loaderを取得できませんでした");
}
await eval(source);
