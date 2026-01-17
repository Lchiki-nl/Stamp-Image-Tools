# EzStampify

> LINEスタンプ作成に最適な画像処理ツール

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Live Demo](https://img.shields.io/badge/demo-online-green.svg)](https://stamp-image-tools.pages.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**デモサイト**: [https://stamp-image-tools.pages.dev/](https://stamp-image-tools.pages.dev/)

## ✨ 特徴

- **🔒 完全クライアントサイド処理** - 画像はサーバーに送信されず、ブラウザ内で完結
- **⚡ リアルタイム処理** - 待ち時間ゼロでサクサク動作
- **📱 レスポンシブ対応** - PC・スマホ両対応
- **🎨 直感的な UI** - 誰でも簡単に使える洗練されたインターフェース
- **💾 自動保存** - IndexedDB による永続化でデータを保持
- **🤖 AI機能搭載** - AI背景削除で複雑な切り抜きも簡単に

## 🚀 主な機能

### 1. 背景削除 (Background Removal)

高度な背景削除機能で、透過PNG画像を簡単に作成できます。

- **カラーピッカー**: スポイトで背景色を選択
- **許容値調整**: 近似色の範囲を細かく調整
- **境界ぼかし**: エッジを滑らかに処理
- **消しゴムツール**: ブラシで手動修正（VIP機能：サイズ調整可能）
- **AI背景削除**: AIが被写体を自動認識して切り抜き（1日5回まで、VIPは無制限）

### 2. 画像分割 (Image Split)

複数のイラストを1枚にまとめた画像を個別ファイルに分割できます。

- **柔軟なグリッド設定**: 1×1〜5×5の分割（VIP: 4×4以上の多分割対応）
- **プレビュー表示**: 分割線を可視化
- **ZIP一括ダウンロード**: 分割後の画像をまとめて取得

### 3. 余白カット (Crop)

画像周囲の不要な余白を簡単に削除できます。

- **一括カット**: スライダーで全方向を均等にカット
- **個別調整**: 上下左右それぞれをピクセル単位で調整
- **リアルタイムプレビュー**: 変更がすぐに確認可能

### 4. サイズ変更 (Resize)

LINEスタンプの規定サイズなどに即座にリサイズできます。

- **プリセット**: メイン(240px)、タブ(74px)、HD等
- **タブ用余白**: 自動で左右に余白を追加
- **カスタムサイズ**: 任意の幅・高さを指定可能
- **アスペクト比固定**: 縦横比を維持したまま拡大縮小

### 5. 文字入れツール (Text Tool) 🌟 VIP機能

画像にテキストを自由に追加できます。

- **Google Fonts統合**: 豊富なフォントから選択
- **カスタマイズ**: 色・サイズ・変形を自由に調整
- **ドラッグ操作**: マウスで直感的に配置
- **リアルタイムプレビュー**: 編集結果を即座に確認

### 6. ギャラリー・アセット管理

編集した画像を効率的に管理できます。

- **永続化**: IndexedDBで自動保存
- **サイズバッジ**: メイン/タブ/カスタムを自動判別
- **複数選択**: Shiftキーで範囲選択
- **一括ダウンロード**: 最適なファイル名で自動保存（main.png, tab.png, 01.png...）
- **上書き/新規保存**: 用途に応じて選択可能

### 7. バッチ処理

複数の画像に同じ編集を一括適用できます。

- **一括編集**: 選択した画像をまとめて処理
- **進捗表示**: 処理状況をリアルタイムで確認
- **効率的**: 大量の画像も短時間で処理完了

### 8. VIP機能 🌟

パスワード認証で高度な機能を解除できます。

- **画像枚数制限解除**: 最大100枚まで読み込み可能（無料版: 50枚）
- **グリッド分割拡張**: 4×4以上の多分割に対応
- **AI削除無制限**: 回数制限なしで利用可能（無料版: 1日5回）
- **消しゴムツール**: ブラシサイズ調整可能
- **文字入れツール**: フル機能利用可能

## 🛠️ 技術スタック

| カテゴリ                  | 技術                      |
| ------------------------- | ------------------------- |
| **Framework**             | Next.js 16 (App Router)   |
| **Language**              | TypeScript 5              |
| **Styling**               | Tailwind CSS v4           |
| **Animation**             | Framer Motion             |
| **Icons**                 | Lucide React              |
| **Image Processing**      | Canvas API + jszip        |
| **AI Background Removal** | @imgly/background-removal |
| **Persistence**           | IndexedDB                 |
| **Deployment**            | Cloudflare Pages          |

## 📁 プロジェクト構成

```
src/
├── app/
│   ├── page.tsx                 # ランディングページ (/)
│   ├── layout.tsx               # ルートレイアウト
│   ├── globals.css              # グローバルスタイル
│   ├── opengraph-image.jpg      # OGP画像
│   ├── robots.ts                # Robots.txt生成
│   ├── sitemap.ts               # Sitemap生成
│   ├── app/                     # メインアプリ (/app)
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── how-to-use/              # 使い方ガイド (/how-to-use)
│   │   ├── page.tsx
│   │   └── steps.ts
│   ├── privacy/                 # プライバシーポリシー
│   │   └── page.tsx
│   └── terms/                   # 利用規約
│       └── page.tsx
├── components/
│   ├── landing/                 # ランディングページコンポーネント
│   │   ├── Hero.tsx
│   │   ├── Features.tsx
│   │   ├── Workflow.tsx
│   │   └── Footer.tsx
│   ├── gallery/                 # ギャラリー関連
│   │   ├── AssetCard.tsx
│   │   ├── AssetDetailPanel.tsx
│   │   ├── BatchActions.tsx
│   │   ├── FileUpload.tsx
│   │   └── ProcessingModal.tsx
│   ├── editor/                  # エディター
│   │   └── UnifiedEditor.tsx
│   ├── tools/                   # ツールコンポーネント
│   │   ├── BackgroundRemovalTool.tsx
│   │   ├── ImageSplitTool.tsx
│   │   ├── CropTool.tsx
│   │   ├── ResizeTool.tsx
│   │   ├── TextTool.tsx
│   │   └── EraserCursor.tsx
│   ├── shared/                  # 共通コンポーネント
│   │   ├── VipDialog.tsx
│   │   ├── AppHeader.tsx
│   │   └── AppFooter.tsx
│   └── seo/                     # SEO関連
│       └── JsonLd.tsx
└── lib/
    ├── image-utils.ts           # 画像処理ユーティリティ
    ├── storage.ts               # IndexedDB操作
    ├── batch-processing.ts      # バッチ処理ロジック
    └── imageProcessor.ts        # 画像分割処理
```

## 🚦 Getting Started

### 前提条件

- Node.js 20以上
- npm または yarn

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/Lchiki-nl/Stamp-Image-Tools.git

# ディレクトリに移動
cd Stamp-Image-Tools

# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いて確認できます。

### ビルド

```bash
# プロダクションビルド
npm run build

# ビルド結果を確認
npm start
```

## 🌐 デプロイ

このプロジェクトは Cloudflare Pages にデプロイされています。

Vercel や他のホスティングサービスでも動作します。

```bash
# ビルドコマンド
npm run build

# 出力ディレクトリ
.next
```

## 📖 使い方

詳しい使い方は[使い方ガイド](https://stamp-image-tools.pages.dev/how-to-use)をご覧ください。

基本的な流れ：

1. **画像をアップロード** - ドラッグ＆ドロップまたはクリックで選択
2. **編集ツールを選択** - 背景削除、分割、サイズ変更など
3. **パラメータを調整** - スライダーや入力欄で細かく設定
4. **保存** - 新規保存または上書き保存
5. **ダウンロード** - 複数選択して一括ダウンロード可能

## 🔐 VIP機能について

VIP機能を利用するには、パスワード認証が必要です。

詳細はアプリ内の「VIP」ボタンからご確認ください。

## 📝 ライセンス

MIT License - 詳細は [LICENSE](LICENSE) を参照

## 🙏 謝辞

- [Next.js](https://nextjs.org/) - Reactフレームワーク
- [Tailwind CSS](https://tailwindcss.com/) - CSSフレームワーク
- [@imgly/background-removal](https://github.com/imgly/background-removal-js) - AI背景削除
- [Lucide](https://lucide.dev/) - アイコンセット
- [Framer Motion](https://www.framer.com/motion/) - アニメーションライブラリ

---

**開発・運営**: [nashikileon](https://github.com/nashikileon)
