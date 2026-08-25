# COMBAT HUB — Friends Stable

友人向け安定版チャンネル。`main` の開発変更は自動では流れず、確認済みの版だけ `friends-stable` に反映する。

## 必要なもの
- iPhone
- Scriptable
- iOS 15.5以降

### Scriptable App Store
https://apps.apple.com/jp/app/scriptable/id1405459188

Scriptableは無料でインストール可能（任意のApp内課金あり）。

## 初回セットアップ
1. 上のApp StoreリンクからScriptableをインストール。
2. 新規スクリプトを作り、名前を `COMBAT HUB` にする。
3. `friend-loader.js` の全文、または `friend-bootstrap.js` の短縮コードを貼り付けて保存。
4. Scriptable上で一度 ▶︎ を実行し、表示確認。
5. iPhoneホーム画面に「Scriptable」の中サイズWidgetを追加。
6. Widget編集で Script を `COMBAT HUB` に指定。
7. When Interacting は `Run Script`。
8. Parameter に次のどれかを入力。

- `UFC`
- `RIZIN`
- `ONE`
- `BOXING`
- `K1`

団体ごとにWidgetを複製すれば5団体を表示できる。必要ならiOSのSmart Stackへまとめる。

## 更新
通常は何もしなくてよい。Widgetはこの `combat-hub` リポジトリの `friends-stable` 安定版を取得する。

手動で最新版を確認したい場合だけ、Scriptableで `COMBAT HUB` を開いて ▶︎ を1回実行する。

## よくある詰まり
- 真っ白 / 古い表示：Scriptableで `COMBAT HUB` を▶︎で1回実行。
- 違う団体が出る：WidgetのParameterを確認。
- K-1だけ出ない：Parameterは `K-1` ではなく `K1`。
- Scriptableがホーム画面追加候補に出ない：一度Scriptableを起動してからホーム画面編集をやり直す。
- 大会カードが「発表待ち」：公式未発表時の正常表示。

## 安定版ポリシー
- `main`: 個人用の開発・検証・本番チャンネル
- `friends-stable`: 友人向け安定版
- 実機確認と回帰確認が済んだ変更だけ `friends-stable` に昇格
- 未確認変更を友人版へ自動配信しない

## Repository boundary
友人版も `48wr9f4wgp-lab/combat-hub` だけで完結する。`tackle-fit` は実行依存先ではない。

## 注意
このリポジトリ自体はPublicのため、この方式は「友人へだけURLを共有する」運用上の限定であり、技術的なアクセス制御ではない。
