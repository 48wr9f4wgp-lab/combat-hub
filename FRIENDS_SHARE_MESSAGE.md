# COMBAT HUB 友人配布メッセージ

LINEではMarkdown形式のリンクが効かないため、URLは必ず「URLそのものを単独行」で送る。
以下の「LINEコピペ版」をそのまま送る。

---

【LINEコピペ版】

🥊 COMBAT HUB

UFC / RIZIN / ONE / BOXING / K-1 の次大会・主要カード・開催までの残り時間を、iPhoneのホーム画面で見られるウィジェットです。
一度入れれば、その後の更新は基本自動です。

① まずScriptableをインストール

↓このURLをタップ
https://apps.apple.com/jp/app/scriptable/id1405459188

※無料でインストールできます（任意のApp内課金あり）。

② COMBAT HUBを作る

1. Scriptableを開く
2. 右上の＋を押す
3. 新規スクリプト名を「COMBAT HUB」にする
4. 中身を全部消して、下のコードだけ貼り付ける

---ここからコピー---
const URL = "https://raw.githubusercontent.com/48wr9f4wgp-lab/combat-hub/friends-stable/friend-loader.js";
const r = new Request(URL + "?cb=" + Date.now());
r.timeoutInterval = 12;
r.headers = {
  "User-Agent":"Scriptable",
  "Cache-Control":"no-cache, no-store",
  "Pragma":"no-cache"
};
const source = await r.loadString();
if (!source.includes("COMBAT HUB FRIENDS Loader"))
  throw new Error("Loader取得失敗");
await eval(source);
---ここまでコピー---

5. 貼れたら右下の▶︎を1回押す
6. UFCなどの画面が出れば準備OK

③ ホーム画面に追加

1. iPhoneホーム画面を長押し
2. ＋ → Scriptable
3. 中サイズを追加
4. 追加したWidgetを長押し → ウィジェットを編集
5. 次のように設定

Script：COMBAT HUB
When Interacting：Run Script
Parameter：見たい団体

Parameterはこのどれか
UFC
RIZIN
ONE
BOXING
K1

これで完成です。

5団体全部置きたい場合は、中サイズWidgetを複製してParameterだけ変えればOK。
必要ならあとからSmart Stackにまとめられます。

【更新について】
普段は何もしなくてOK。
確認済みの安定版だけ自動配信されます。

更新されてない気がするときだけ、Scriptableを開いて「COMBAT HUB → ▶︎」を1回押してください。

【うまく表示されないとき】
・真っ白 / 古い表示 → COMBAT HUBを▶︎で1回実行
・別団体が出る → WidgetのParameterを確認
・K-1のParameterは「K-1」ではなく「K1」
・大会情報やカードが未発表なら「発表待ち」は正常表示

---

## 配布者向けメモ

- LINEでは `[文字](URL)` を使わない。
- App Store URLは単独行の裸URLで送る。
- 友人版本体：`combat-hub/friends-stable/combat-hub.js`
- 友人用Loader：`combat-hub/friends-stable/friend-loader.js`
- 超短縮Bootstrap：`combat-hub/friends-stable/friend-bootstrap.js`
- 安定確認できた更新だけ `friends-stable` へ昇格させること。
- `tackle-fit` は友人版の実行依存先ではない。
