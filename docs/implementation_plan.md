# 画像処理アプリ (Stamp Image Tools) 実装計画

## 概要

クライアントサイドで完結する高パフォーマンスな画像処理 Web アプリケーションを開発します。
背景削除、画像分割、余白カットの 3 つの主要機能を提供し、外部サーバへのアップロードを行わないことでプライバシーと通信速度を確保します。

## ユーザーレビュー必須事項

> [!IMPORTANT] > **デザイン要件**: LINE ライクな「Friendly & Creative」なデザインを採用します。Tailwind CSS を駆使し、ポップでキャッチーなアニメーションを含めます。
> **ブラウザ互換性**: 主要な画像処理は Canvas API に依存します。OffscreenCanvas などはサポート状況に応じてフォールバックを考慮しますが、基本はモダンブラウザ向けとします。

## 提案する変更

### 技術スタック

- **Framework**: Next.js (App Router)
- **Styling**: Tailwind CSS
- **State Management**: React Context (必要に応じて Zustand)
- **Icons**: Lucide React
- **Utils**: `clsx`, `tailwind-merge`
- **Libs**: `jszip` (zip 生成), `framer-motion` (アニメーション用, オプション)

### 1. プロジェクト構造と UI 基盤

#### `app/page.tsx` (Landing Page)

- ヒーローセクションと主要機能紹介。
- 「はじめる」ボタンで `/app` に遷移。
- アニメーション (Framer Motion) を多用し、ワクワク感を演出。

#### `app/app/layout.tsx` & `page.tsx` (Main Tool)

- ツール本体のレイアウト。
- サイドバーにツール切り替えナビゲーション。
- メインエリアに Canvas ステージ。
- グローバル CSS でカスタム変数（HSL）を定義。

### 2. 機能実装詳細

#### A. 背景削除 (Background Removal)

- **コンポーネント**: `BackgroundRemovalTool`
- **ロジック**:
  - `<canvas>` 要素に画像をロード。
  - `getImageData` でピクセルデータを取得。
  - 選択色と各ピクセルのユークリッド距離を計算し、許容値 (Tolerance) 以下のピクセルの Alpha を 0 に設定。
  - `putImageData` で更新。
- **UI**:
  - カラーピッカー (HTML input color または Custom UI)。
  - スライダー (許容値制御)。

#### B. 画像分割 (Grid Split)

- **コンポーネント**: `ImageSplitterTool`
- **ロジック**:
  - 元画像を Canvas に描画。
  - 指定された 行数(R) x 列数(C) に基づき、幅/高さを計算。
  - ループ処理で `drawImage` を使い部分領域を新しい Canvas (または OffscreenCanvas) に描画。
  - `toBlob` で画像化し、`jszip` でまとめる。
- **UI**:
  - グリッド数設定 (1-5)。
  - Canvas 上にグリッド線（SVG または別 Canvas レイヤー）をオーバーレイ表示。

#### C. 余白カット (Edge/Margin Cutting)

- **コンポーネント**: `EdgeCutterTool`
- **ロジック**:
  - **手動**: 四隅のハンドル操作による矩形選択。
  - **自動**: 全ピクセルを走査し、不透明ピクセルの最小/最大 X, Y 座標を特定してクロップ範囲を算出。
- **UI**:
  - クロップ枠のオーバーレイ。
  - 数値入力フィールド。

### 3. デザイン戦略

- 白背景 (`bg-white` or `bg-slate-50`) をベースに、LINE Green (`#06C755`) をアクセントに使用。
- ボタンやカードには大きめの角丸 (`rounded-xl` ~ `rounded-full`) を適用し、親しみやすさを演出。
- ボタンやインタラクションには `transition-all` で滑らかなフィードバックを付与。

## 検証計画

### 自動テスト

- 現状は UI/ロジック中心のため、ユニットテストよりも手動検証を優先します。
- 必要であれば各アルゴリズム（特に座標計算）の単体テストを追加。

### 手動検証

- **背景削除**: 単色背景の画像、複雑な背景の画像でのテスト。
- **分割**: 5x5 分割を行い、Zip 解凍後の枚数と整合性を確認。
- **カット**: 1px 単位のトリミング精度を目視確認。
