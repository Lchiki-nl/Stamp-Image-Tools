
import { Upload, ImageMinus, Crop, Grid3X3, Scaling, Download, Sparkles, Crown } from "lucide-react";

export const steps = [
  {
    id: "upload",
    title: "1. 画像のアップロード",
    icon: Upload,
    description: "加工したい画像をドラッグ＆ドロップ、またはクリックして選択します。",
    details: [
      "PNG, JPG, WebP 形式に対応しています。",
      "一度に最大100枚まで読み込めます。",
      "読み込んだ画像はブラウザ内でのみ処理され、サーバーには送信されません。"
    ],
    color: "text-blue-500",
    bg: "bg-blue-50"
  },
  {
    id: "background",
    title: "2. 背景削除",
    icon: ImageMinus,
    description: "ワンクリックで画像の背景をきれいに透過します。",
    details: [
      "「背景削除」タブを選択します。",
      "透過したい色（デフォルトは白）をクリックまたは指定します。",
      "「許容値」スライダーで、近似色の範囲を調整できます。"
    ],
    color: "text-purple-500",
    bg: "bg-purple-50"
  },
  {
    id: "crop",
    title: "3. 余白カット（トリミング）",
    icon: Crop,
    description: "画像の周囲の余白を一括でカットします。",
    details: [
      "「余白カット」タブを選択します。",
      "「一括カット」スライダーを動かすと、上下左右の余白を均等にカットできます。",
      "上下左右それぞれの数値を入力して、微調整することも可能です。"
    ],
    color: "text-orange-500",
    bg: "bg-orange-50"
  },
  {
    id: "split",
    title: "4. グリッド分割",
    icon: Grid3X3,
    description: "1枚の画像を均等なサイズに分割して切り出します。",
    details: [
      "「画像分割」タブを選択します。",
      "横（列数）と縦（行数）を指定します（例：3x3、4x4など）。",
      "複数のイラストを1枚にまとめた画像を、個別のファイルに分割できます。"
    ],
    color: "text-green-500",
    bg: "bg-green-50"
  },
  {
    id: "resize",
    title: "5. サイズ変更",
    icon: Scaling,
    description: "LINEスタンプの規定サイズなどにリサイズします。",
    details: [
      "「サイズ変更」タブを選択します。",
      "プリセットから「メイン(240px)」などを即座に適用できます。",
      "「タブ」を選ぶと、自動的に74×74pxにリサイズされ左右に余白が入ります。",
      "任意の幅・高さを指定することも可能です。"
    ],
    color: "text-sky-500",
    bg: "bg-sky-50"
  },
  {
    id: "save",
    title: "6. 保存・ダウンロード",
    icon: Download,
    description: "加工が完了した画像を保存します。",
    details: [
      "編集画面で「新規保存」か「上書き保存」を選べます。「上書き」すると自動でMain/Tabバッジが更新されます。",
      "ギャラリーでは「Shiftキー」を押しながらクリックで範囲選択が可能です。",
      "複数選択して「一括ダウンロード」すると、自動的に「main.png」「tab.png」「01.png...」といった最適なファイル名で保存されます。"
    ],
    color: "text-pink-500",
    bg: "bg-pink-50"
  },
  {
    id: "ai-removal",
    title: "AI背景削除",
    icon: Sparkles,
    description: "AIが被写体を自動認識して切り抜きます。",
    details: [
      "ツールバーの「AI削除」ボタンを選択します。",
      "髪の毛や複雑な形状の透過が得意です。"
    ],
    color: "text-indigo-500",
    bg: "bg-indigo-50"
  },
  {
    id: "vip",
    title: "VIP機能",
    icon: Crown,
    description: "パスワードを入力して制限を解除します。",
    details: [
      "画面上の「VIP」ボタンから認証できます。",
      "AI背景削除が無制限使い放題になります。",
      "画像の最大読み込み枚数が40枚から100枚に増えます。",
      "その他、VIP専用の高度な機能が利用可能になります。"
    ],
    color: "text-amber-500",
    bg: "bg-amber-50"
  }
];
