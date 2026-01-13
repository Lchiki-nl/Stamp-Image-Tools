# UI Design Guidelines (LINE-style)

## 1. デザインコンセプト

**"Friendly & Creative"**
LINE スタンプ作成者が楽しく作業できる、ポップで親しみやすいツール。
従来の「高機能ツールの複雑さ」を排除し、直感的で「キャッチー」な体験を提供します。

### キーワード

- **Casual (カジュアル)**: 堅苦しくない、遊び心のある雰囲気。
- **Catchy (キャッチー)**: 見て楽しい、触って楽しいインタラクション。
- **LINE-style**: LINE アプリと親和性の高い配色と UI 感。

## 2. カラーパレット (Color Palette)

LINE のブランドカラーを意識しつつ、アクセシビリティに配慮した構成。

### Primary Colors

- **LINE Green**: `#06C755` (メインアクセント、アクションボタン)
- **Hover Green**: `#05b34c`
- **Active Green**: `#049f43`

### Base Colors

- **Background**: `#FFFFFF` (白ベースで清潔感と明るさを重視)
- **Surface**: `#F5F6F8` (サイドバーやパネル背景、LINE のトーク背景色に近いグレー)
- **Text Main**: `#1E1E1E` (濃いグレー、完全な黒ではない)
- **Text Sub**: `#757575`

### Accent / Utility

- **Error/Delete**: `#FF3B30` (削除アクションなど)
- **Warning**: `#FFCC00`
- **Grid Lines**: `#E2E5E9`

## 3. タイポグラフィ (Typography)

親しみやすさと可読性を両立するフォント選定。

- **Font Family**:
  - 日本語: `"Hiragino Kaku Gothic ProN"`, `"Noto Sans JP"`, sans-serif
  - 英数字: `"Inter"`, `"Roboto"`, sans-serif
- **Weight**: 太字 (`Bold`) を効果的に使い、ポップさを強調。

## 4. コンポーネントスタイル

### ボタン (Buttons)

- **形状**: `rounded-full` または `rounded-xl` (角丸を大きく)
- **Primary**: `bg-[#06C755] text-white shadow-sm hover:shadow-md transition-all active:scale-95`
- **Secondary**: `bg-gray-100 text-gray-700 hover:bg-gray-200`

### カード / パネル (Cards / Panels)

- **形状**: `rounded-2xl`
- **スタイル**: `bg-white shadow-sm border border-gray-100` (フラットに近い、ソフトなシャドウ)

### アイコン (Icons)

- **スタイル**: 線画ではなく、太めのストロークまたは塗りつぶし (Filled) スタイルで視認性を高く。
- **サイズ**: 大きめで押しやすく。

## 5. レイアウト & アニメーション

- **Sidebar**: 左側に固定。アイコン + ラベルで分かりやすく。
- **Status Feedback**: 成功時などに紙吹雪 (Confetti) やバウンドするようなアニメーションを取り入れ、「作業完了」の達成感を演出。
