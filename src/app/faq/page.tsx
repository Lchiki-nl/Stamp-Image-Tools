import { Metadata } from 'next';
import Link from 'next/link';
import { Smile, HelpCircle, AlertCircle, Palette, Crown, Lightbulb } from 'lucide-react';
import { Accordion } from '@/components/ui/Accordion';

export const metadata: Metadata = {
  title: 'よくある質問 | EzStampify',
  description: 'EzStampifyの使い方、VIPプラン、解約方法などのよくある質問をまとめました。',
};

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-background-soft">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur-md px-6 py-4 shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-white shadow-md shadow-primary/20 transform -rotate-6">
              <Smile size={24} strokeWidth={2.5} />
            </div>
            <div className="text-xl font-extrabold tracking-tight text-text-main">EzStampify</div>
          </Link>
          <div className="flex items-center gap-3">
             <Link
              href="/app"
              className="flex h-10 items-center justify-center rounded-full bg-primary px-5 text-sm font-bold text-white transition hover:bg-primary-dark shadow-lg shadow-primary/30 hover:shadow-xl"
            >
              無料でつくる
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12 md:py-20">
        <div className="text-center mb-16 animate-in slide-in-from-bottom-4 duration-500">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-500">
                <HelpCircle size={32} />
            </div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-800 mb-4">よくある質問</h1>
          <p className="text-gray-500 font-bold">
            ユーザーの皆様からよくいただくご質問をまとめました。<br/>
            解決しない場合は、ページ下部のリンクからお問い合わせください。
          </p>
        </div>

        <div className="space-y-12 animate-in slide-in-from-bottom-8 duration-700 delay-100">
           {/* Usage Section */}
           <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3 pb-3 border-b-2 border-blue-100">
              <Palette className="bg-blue-100 p-1.5 rounded-lg text-blue-600 box-content" size={24} />
              使い方
            </h2>
            <div className="space-y-4">
              <Accordion title="作成したスタンプ画像が保存できません">
                <p className="text-sm leading-relaxed text-gray-600">
                  お使いのブラウザがプライベートモード（シークレットモード）になっていないかご確認ください。
                  また、iPhoneの場合はSafari、Androidの場合はChromeでのご利用を推奨しています。
                  アプリ内ブラウザ（LINEやTwitterから開いた場合）では正常に動作しないことがあります。
                </p>
              </Accordion>

              <Accordion title="「機能が制限されています」と表示されて使えません">
                <p className="text-sm leading-relaxed text-gray-600">
                  一部の高度な機能（AI背景削除の回数無制限利用、4x4以上のグリッド分割など）は、<strong>VIPプラン限定</strong>の機能となっています。
                  <br className="mb-2"/>
                  これらの機能をご利用になりたい場合は、画面右上の「VIP機能（王冠アイコン）」からVIPプランへのアップグレードをご検討ください。
                </p>
              </Accordion>

              <Accordion title="背景透過がうまくいきません">
                <div className="space-y-3 text-sm leading-relaxed text-gray-600">
                  <p>
                    写真によっては一発で綺麗に消えないことがあります。以下のコツを試してみてください：
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-1">
                    <li>
                      <strong>色々なツールを組み合わせる：</strong><br/>
                      AI自動削除だけでなく、「スポイト（色選択）」や「消しゴム」も併用すると効果的です。
                    </li>
                    <li>
                      <strong>スポイトで何度も色を選択し直す：</strong><br/>
                      一発で消そうとせず、残っている部分の色をスポイトでタップして「透過する色を変える」操作を繰り返すと、徐々に綺麗になります。
                    </li>
                    <li>
                      <strong>パラメータを調整する：</strong><br/>
                      「許容値（しきい値）」や「境界線」のスライダーを動かすと、消える範囲が変わります。
                    </li>
                  </ul>
                  <p className="mt-2 text-xs text-gray-400">
                    どうしても消えない細かい部分は、ブラシサイズの小さい消しゴムで仕上げるのがおすすめです。
                  </p>
                </div>
              </Accordion>
            </div>
          </section>

          {/* VIP Plan Section */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3 pb-3 border-b-2 border-amber-100">
              <Crown className="bg-amber-100 p-1.5 rounded-lg text-amber-600 box-content" size={24} />
              VIPプランについて
            </h2>
            <div className="space-y-4">
              <Accordion title="VIPプランを購入したのにVIP機能が使えません">
                <div className="space-y-4 text-sm leading-relaxed text-gray-600">
                  <p>
                    <strong>決済完了後、自動的にVIP状態が反映されます。</strong>
                    <br/>
                    もし反映されていない場合は、アプリ右上の「VIP機能（または鍵アイコン）」ボタンを押してください。
                    自動的にライセンスの確認が行われ、機能が解放されます。
                  </p>
                  <p>
                    それでも反映されない場合は、<strong>「ライセンスキーをお持ちの方」</strong>をタップし、
                    決済完了画面に表示された（または管理者から通知された）ライセンスキー（<code>cus_</code>から始まる文字列）を入力してください。
                  </p>
                </div>
              </Accordion>

              <Accordion title="ライセンスキーとは何ですか？ 確認方法は？">
                <div className="space-y-3 text-sm leading-relaxed text-gray-600">
                  <p>
                    ライセンスキーは、あなたがVIP会員であることを証明するためのIDです（<code>cus_</code>で始まります）。
                  </p>
                  <p>
                    キーの確認方法は以下の通りです：
                  </p>
                  <ol className="list-decimal list-inside space-y-1 ml-2 font-bold bg-gray-50 p-3 rounded-lg">
                    <li>アプリ右上の「VIP有効（王冠）」ボタンを押す</li>
                    <li>開いた画面にある「あなたのライセンスキー」を確認</li>
                    <li>コピーボタンで保存できます</li>
                  </ol>
                  <p className="text-red-500 text-sm font-bold mt-3 bg-red-50 p-3 rounded-lg border border-red-200">
                    ⚠️ 重要：必ずコピーして保存してください！<br/>
                    このキーは、<strong>機種変更した際や、ブラウザのキャッシュが消えた時など、将来的にVIP機能を復元するために必ず必要になります。</strong><br/>
                    メモ帳やパスワード管理アプリなどに貼り付けて、大切に保管してください。
                  </p>
                </div>
              </Accordion>

              <Accordion title="解約（サブスクリプションの停止）はどうすればいいですか？">
                 <div className="space-y-3 text-sm leading-relaxed text-gray-600">
                  <p>
                    いつでも以下の手順で解約可能です。
                  </p>
                  <ol className="list-decimal list-inside space-y-2 ml-2 bg-gray-50 p-4 rounded-lg">
                    <li>アプリ右上の<strong>「VIP有効（王冠アイコン）」</strong>をクリック</li>
                    <li><strong>「契約内容の確認・解約」</strong>ボタンをクリック</li>
                    <li>開いた管理画面から<strong>「プランをキャンセル」</strong>を選択</li>
                  </ol>
                  <p>
                    もしアプリが開けない場合やキーを紛失した場合は、
                    <a href="https://forms.gle/ZHXoTYuuEW8rfVrw9" target="_blank" className="text-blue-500 underline hover:text-blue-600 mx-1">
                      お問い合わせフォーム
                    </a>
                    からお問い合わせください。
                  </p>
                </div>
              </Accordion>

              <Accordion title="解約するとすぐに使えなくなりますか？">
                <div className="space-y-3 text-sm leading-relaxed text-gray-600">
                  <p>
                    いいえ、<strong>次回の更新日（請求日）までは引き続きVIP機能をご利用いただけます。</strong>
                  </p>
                  <p>
                    更新日を過ぎると自動的に無料プランに戻ります。
                    日割り計算による返金はありませんのでご了承ください。
                  </p>
                </div>
              </Accordion>

              <Accordion title="月額プランから買い切りプランへの変更方法は？">
                <div className="space-y-3 text-sm leading-relaxed text-gray-600">
                  <p>
                    <strong>買い切りプランを購入するだけでOKです！</strong>
                  </p>
                  <p>
                    買い切りプランの決済が完了すると、既存の月額プランは<strong>自動的にキャンセル</strong>されます。
                    手動で解約する必要はありません。
                  </p>
                  <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                    <p className="text-xs text-green-700 font-bold">
                      ✓ 二重課金の心配なし<br/>
                      ✓ 解約手続き不要<br/>
                      ✓ すぐにlifetime（永久）プランに移行
                    </p>
                  </div>
                </div>
              </Accordion>

               <Accordion title="機種変更をしてもVIP機能は使えますか？">
                <div className="space-y-3 text-sm leading-relaxed text-gray-600">
                  <p>
                    はい、お使いいただけます！<br/>
                    新しい端末でアプリを開き、以下の手順で復旧してください。
                  </p>
                  <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                    <p className="font-bold text-amber-800 mb-2">復旧手順：</p>
                    <ol className="list-decimal list-inside text-amber-900 space-y-1">
                      <li>アプリ右上の「VIP機能」をクリック</li>
                      <li>「ライセンスキーをお持ちの方」をクリック</li>
                      <li>古い端末で保存したライセンスキーを入力</li>
                    </ol>
                  </div>
                 </div>
              </Accordion>
            </div>
          </section>

          {/* Others Section */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3 pb-3 border-b-2 border-green-100">
              <Lightbulb className="bg-green-100 p-1.5 rounded-lg text-green-600 box-content" size={24} />
              その他
            </h2>
            <div className="space-y-4">
              <Accordion title="無料で使えますか？">
                <p className="text-sm leading-relaxed text-gray-600">
                  はい、基本的な機能はすべて無料でご利用いただけます。
                  登録も不要ですので、安心してお使いください。
                  AIによる背景削除の回数無制限など、一部の便利機能のみ有料（VIPプラン）となっております。
                </p>
              </Accordion>
            </div>
          </section>
        </div>

        <div className="mt-20 pt-10 border-t border-gray-100 text-center">
            <p className="text-gray-500 font-bold mb-4">その他のご質問・お問い合わせ</p>
             <a 
                href="https://forms.gle/ZHXoTYuuEW8rfVrw9" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
             >
                <AlertCircle size={18} />
                開発者に問い合わせる (note)
             </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-gray-100 bg-white py-8 text-center">
        <p className="text-xs text-gray-400 font-medium">
          © 2026 EzStampify. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
