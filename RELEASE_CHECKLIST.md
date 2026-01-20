# 商用リリース チェックリスト

このドキュメントは、EzStampifyをテスト環境から**本番環境（商用環境）**へ移行するための詳細手順書です。

## 1. Stripe設定 (本番モードへの切り替え)

**目標**: 実際の決済処理（クレジットカード課金）を有効にする。

- [ ] **アカウントの有効化**: Stripeアカウントの本番利用申請が完了していることを確認する（本人確認、銀行口座登録など）。
- [ ] **本番用APIキーの取得**:
  1.  [Stripeダッシュボード > 開発者 > APIキー](https://dashboard.stripe.com/apikeys) にアクセス。
  2.  右上の「テストデータを表示」スイッチを **OFF** にする。
  3.  **公開可能キー** (`pk_live_...`) をコピー。
  4.  **シークレットキー** (`sk_live_...`) をコピー。
- [ ] **本番モードでの商品・価格の再作成**:
      _注意: テスト環境の商品は本番環境には引き継がれません。手動で再作成が必要です。_
  1.  [商品カタログ](https://dashboard.stripe.com/products) にアクセス。
  2.  「VIPプラン (月額)」を作成 -> 新しい **価格ID** (`price_...`) をコピー。
  3.  「VIPプラン (買い切り)」を作成 -> 新しい **価格ID** (`price_...`) をコピー。
- [ ] **本番用Webhookの設定**:
  1.  [開発者 > Webhook](https://dashboard.stripe.com/webhooks) にアクセス（テストデータOFFの状態で）。
  2.  「エンドポイントを追加」をクリック。
  3.  **エンドポイントURL**: `https://<あなたのカスタムドメイン>/api/webhook` (例: `https://ezstampify.lchiki-lab.com/api/webhook`)。
  4.  **リッスンするイベント**:
      - `checkout.session.completed`
      - `customer.subscription.updated`
      - `customer.subscription.deleted`
  5.  「エンドポイントを追加」をクリック。
  6.  **署名シークレット** (`whsec_...`) を表示してコピー。
- [ ] **カスタマーポータルの設定 (本番)**:
  1.  [設定 > カスタマーポータル](https://dashboard.stripe.com/settings/billing/portal) にアクセス（テストデータOFFで）。
  2.  「顧客がサブスクリプションをキャンセルできるようにする」を有効化。
  3.  変更を保存。

## 2. Cloudflare Pages設定

**目標**: 本番環境用の環境変数をCloudflareに設定する。

- [ ] **環境変数の更新**:
  1.  Cloudflareダッシュボード > Pages > `Stamp Image Tools` (プロジェクト名) > **Settings** > **Environment variables** へ移動。
  2.  **Production** (または All) 環境の変数を編集する。

| 変数名                         | 設定値（本番データ）                | 備考                            |
| :----------------------------- | :---------------------------------- | :------------------------------ |
| `STRIPE_PUBLISHABLE_KEY`       | `pk_live_...`                       | 手順1で取得した公開キー         |
| `STRIPE_SECRET_KEY`            | `sk_live_...`                       | 手順1で取得した秘密キー         |
| `STRIPE_WEBHOOK_SECRET`        | `whsec_...`                         | 手順1で取得した署名シークレット |
| `STRIPE_PRICE_ID_SUBSCRIPTION` | `price_...`                         | 手順1で作った月額プランID       |
| `STRIPE_PRICE_ID_ONETIME`      | `price_...`                         | 手順1で作った買い切りプランID   |
| `NEXT_PUBLIC_BASE_URL`         | `https://ezstampify.lchiki-lab.com` | あなたのドメイン                |

- [ ] **再デプロイ**:
  - 変数を変更しただけでは反映されません。
  - **Deployments** タブから「Create deployment」を行うか、gitに何かコミットをpushしてデプロイをトリガーする。

## 3. コードベースの最終確認

**目標**: テスト用のハードコードが残っていないか確認する。

- [ ] **`create-checkout.ts`**: IDがハードコードされず、環境変数 `env.STRIPE_PRICE_ID_...` が使われていること（確認済み）。
- [ ] **`webhook.ts`**: Stripeクライアントの初期化に `env.STRIPE_SECRET_KEY` が使われていること（確認済み）。
- [ ] **フロントエンド**: `loadStripe` に `process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` が渡されていること。
- [ ] **UI確認**: 「これはテスト決済です」といったデバッグ表示がないこと。

## 4. 本番環境での動作確認 (スモークテスト)

**目標**: 実際に課金して動作を検証する。

- [ ] **本番サイトへアクセス**: `https://ezstampify.lchiki-lab.com` を開く。
- [ ] **VIP購入テスト**:
  - **本物のクレジットカード**を使用する（後で自分で返金・キャンセルすればOK）。
  - _注意: テスト用カード（4242...）は本番環境ではエラーになります。_
- [ ] **機能解禁の確認**:
  - 決済完了後、即座にVIP機能（王冠マークの機能）が使えるか。
  - 設定モーダルに「サブスクリプション管理」や「ライセンスキー」が表示されるか。
- [ ] **返金処理（任意）**:
  - Stripeダッシュボード > 支払い > 該当の決済を選び「返金」ボタンを押す。
  - データベースからユーザーを手動削除してクリーンアップ（必要に応じて）。

## 5. データベース (Cloudflare D1)

- [ ] **特になし**: `paid_users` テーブルはデプロイしても消えません。本番のWebhookによって本番データが書き込まれていきます。
- [ ] **(任意) テストデータの削除**: もしテスト中のゴミデータが気になる場合は、CloudflareダッシュボードまたはWrangler CLIから `paid_users` テーブルを空にしても良いです。
  - コマンド例: `npx wrangler d1 execute <DB_NAME> --command="DELETE FROM paid_users;" --remote` **(取り扱い注意!)**
