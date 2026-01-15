
import { Upload, ImageMinus, Crop, Grid3X3, Scaling, Download } from "lucide-react";

export const steps = [
  {
    id: "upload",
    title: "1. 画像のアップロード",
    icon: Upload,
    description: "加工したい画像をドラッグ＆ドロップ、またはクリックして選択します。",
    details: [
      "PNG, JPG, WebP 形式に対応しています。",
      "一度に最大30枚まで読み込めます。",
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
      "プリセットから「スタンプ(370px)」や「メイン(240px)」などを選択できます。",
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
      "編集画面の「新規保存」または「上書き保存」でギャラリーに反映されます。",
      "ギャラリー画面で画像を選択し、「ダウンロード」ボタンを押すとお使いのデバイスに保存されます。",
      "複数選択してダウンロードすると、ZIP形式でまとめて保存できます。"
    ],
    color: "text-pink-500",
    bg: "bg-pink-50"
  }
];
