# 🎨 IMG-TOOLS

> スタンプ作成に最適な画像ツール

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## ✨ 特徴

- **🔒 完全クライアントサイド処理** - 画像はサーバーに送信されません
- **⚡ リアルタイム処理** - 待ち時間ゼロでサクサク動作
- **📱 レスポンシブ対応** - PC・スマホ両対応
- **🎯 直感的な UI** - 誰でも簡単に使える

## 🛠️ 機能

### 1. 背景削除 (Background Removal)

- スポイトで色を選択
- 許容値（Tolerance）調整
- 境界ぼかし（Feather）機能
- PNG 形式でダウンロード

### 2. 画像分割 (Image Split)

- 1〜5 行 × 1〜5 列のグリッド分割
- 分割線（ガイド）の表示

### 3. 余白カット (Crop)

- 一括カット（Uniform Crop）スライダー
- 上下左右のピクセル単位調整
- リアルタイムプレビュー

## 🚀 Getting Started

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# http://localhost:3000 を開く
```

## 📦 技術スタック

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **Image Processing**: Canvas API
- **Persistence**: IndexedDB

## 📁 プロジェクト構成

```
src/
├── app/
│   ├── page.tsx           # ランディングページ
│   ├── opengraph-image.tsx # OGP画像生成
│   ├── robots.ts          # Robots.txt生成
│   ├── sitemap.ts         # Sitemap生成
│   └── app/
│       └── layout.tsx     # ツール画面
├── components/
│   ├── shared/            # 共通コンポーネント
│   │   ├── FileDropzone.tsx
│   │   └── ImageCanvas.tsx
│   └── tools/             # ツールコンポーネント
│       ├── BackgroundRemovalTool.tsx
│       ├── ImageSplitTool.tsx
│       └── CropTool.tsx
└── lib/
    ├── image-utils.ts     # 画像処理ロジック
    └── storage.ts         # データ永続化ロジック
```

## 🌐 デプロイ

Vercel や Cloudflare Pages へのデプロイを推奨します。

```bash
# ビルド
npm run build
```

## 📄 ライセンス

MIT License - 詳細は [LICENSE](LICENSE) を参照

## 🤝 コントリビューション

Issue や Pull Request を歓迎します！
