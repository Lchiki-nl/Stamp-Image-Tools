
import { Upload, ImageMinus, Crop, Grid3X3, Scaling, Download, Sparkles, Crown, Eraser, Type } from "lucide-react";

export const steps = [
  {
    id: "upload",
    title: "1. 画像のアップロード",
    icon: Upload,
    description: "画像をドラッグ＆ドロップ、またはクリックして選択します。",
    details: [
      "最大50枚まで読み込めます。",
      "読み込んだ画像はブラウザ内でのみ処理され、サーバーには送信されません。",
      "[SEP_VIP]",
      "最大100枚まで読み込み可能になります。"
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
      "透過したい色をクリックまたは指定します（初期値は自動選択されます）。",
      "「許容値」スライダーで、近似色の範囲を調整できます。"
    ],
    color: "text-purple-500",
    bg: "bg-purple-50"
  },
  {
    id: "ai-removal",
    title: "3. AI背景削除",
    icon: Sparkles,
    description: "AIが被写体を自動認識して切り抜きます。",
    details: [
      "ツールバーの「AI削除」ボタンを選択します。",
      "1日5回まで利用できます。",
      "[SEP_VIP]",
      "回数無制限で使えます。"
    ],
    color: "text-indigo-500",
    bg: "bg-indigo-50"
  },
  {
    id: "crop",
    title: "4. 余白カット（トリミング）",
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
    title: "5. グリッド分割",
    icon: Grid3X3,
    description: "画像を均等なサイズに分割して切り出します。",
    details: [
      "「画像分割」タブを選択します。",
      "横（列数）と縦（行数）を指定します。",
      "複数のイラストを1枚にまとめた画像を、個別のファイルに分割できます。",
      "[SEP_VIP]",
      "4×4など、より細かいグリッド分割が可能になります。"
    ],
    color: "text-green-500",
    bg: "bg-green-50"
  },
  {
    id: "eraser",
    title: "6. 消しゴムツール",
    icon: Eraser,
    description: "ブラシを使って手動で不要な部分を消去します。",
    details: [
      "「背景削除」タブの「消しゴム」を選択します。",
      "ブラシでなぞって細かい部分を修正できます。",
      "[SEP_VIP]",
      "ブラシサイズを自由に調整できます。"
    ],
    color: "text-red-500",
    bg: "bg-red-50"
  },
  {
    id: "resize",
    title: "7. サイズ変更",
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
    title: "8. 保存・ダウンロード",
    icon: Download,
    description: "加工が完了した画像を保存します。",
    details: [
      "編集画面で「新規保存」か「上書き保存」を選べます。保存したサイズに応じて自動でバッジがつきます。",
      "ギャラリーでは「Shiftキー」を押しながらクリックで範囲選択が可能です。",
      "複数選択して「一括ダウンロード」すると、自動的に「main.png」「tab.png」「01.png...」といった最適なファイル名で保存されます。"
    ],
    color: "text-pink-500",
    bg: "bg-pink-50"
  },
  // === VIP Features ===
  {
    id: "vip",
    title: "9. VIP機能について",
    icon: Crown,
    description: "VIPプランを購入して制限を解除します。",
    details: [
      "画面上の「VIP」または「王冠ボタン」から購入できます（月額/買い切り）。",
      "購入完了後、自動的に制限が解除され、すべての高度な機能が使い放題になります。"
    ],
    color: "text-amber-500",
    bg: "bg-amber-50"
  },
  {
    id: "text",
    title: "10. 文字入れツール",
    icon: Type,
    description: "画像に好きなテキストを追加できます。",
    details: [
      "「文字入れ」タブでテキストを入力します。",
      "フォント、色、変形などを自由に設定できます。",
      "ドラッグ＆ドロップで配置位置を調整できます。"
    ],
    color: "text-teal-500",
    bg: "bg-teal-50",
    isVip: true
  },

];
