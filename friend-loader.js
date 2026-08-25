// COMBAT HUB FRIENDS Loader v1
// Stable channel: friends-stable

const RAW = "https://raw.githubusercontent.com/48wr9f4wgp-lab/combat-hub/friends-stable/combat-hub.js";
const API = "https://api.github.com/repos/48wr9f4wgp-lab/combat-hub/contents/combat-hub.js?ref=friends-stable";

const fm = FileManager.local();
const cache = fm.joinPath(fm.documentsDirectory(), "combat-hub-friends-runtime.js");
const metaPath = fm.joinPath(fm.documentsDirectory(), "combat-hub-friends-meta.json");

function valid(src) {
  return !!src && src.includes("COMBAT HUB") && /const VERSION='\d+\.\d+\.\d+-github'/.test(src);
}

async function fetchRaw(url, headers = {}) {
  const r = new Request(url + (url.includes("?") ? "&" : "?") + "cb=" + Date.now());
  r.timeoutInterval = 12;
  r.headers = {
    "User-Agent": "Scriptable",
    "Cache-Control": "no-cache, no-store",
    "Pragma": "no-cache",
    ...headers,
  };
  return await r.loadString();
}

let meta = null;
try {
  if (fm.fileExists(metaPath)) meta = JSON.parse(fm.readString(metaPath));
} catch (_) {}

let source = null;
const cacheFresh = fm.fileExists(cache) && meta && Date.now() - meta.savedAt < 30 * 60 * 1000;

// Home-screen refresh: use recent local runtime first.
if (config.runsInWidget && cacheFresh) {
  try {
    const local = fm.readString(cache);
    if (valid(local)) source = local;
  } catch (_) {}
}

// Manual run or stale cache: force-check stable GitHub channel.
if (!source) {
  const candidates = [];
  try {
    const s = await fetchRaw(RAW);
    if (valid(s)) candidates.push(s);
  } catch (_) {}
  try {
    const s = await fetchRaw(API, { "Accept": "application/vnd.github.raw+json" });
    if (valid(s)) candidates.push(s);
  } catch (_) {}
  try {
    if (fm.fileExists(cache)) {
      const local = fm.readString(cache);
      if (valid(local)) candidates.push(local);
    }
  } catch (_) {}

  if (!candidates.length) throw new Error("COMBAT HUB FRIENDSを取得できませんでした。");
  source = candidates[0];
  fm.writeString(cache, source);
  fm.writeString(metaPath, JSON.stringify({ savedAt: Date.now() }));
}

await eval(source);
