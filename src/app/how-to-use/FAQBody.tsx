import Link from 'next/link';
import { HelpCircle, AlertCircle } from 'lucide-react';
import { Accordion } from '@/components/ui/Accordion';

export function FAQBody() {
  return (
    <div className="mx-auto max-w-3xl animate-in fade-in duration-500">
      <div className="text-center mb-12">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-500">
          <HelpCircle size={32} />
        </div>
        <h2 className="text-2xl md:text-3xl font-black text-gray-800 mb-4">よくある質問</h2>
        <p className="text-gray-500 font-bold">
          ユーザーの皆様からよくいただくご質問をまとめました。<br/>
          解決しない場合は、ページ下部のリンクからお問い合わせください。
        </p>
      </div>

      <div className="space-y-12">
        {/* General Usage Section */}
        <section>
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3 pb-3 border-b-2 border-blue-100">
            <span className="text-2xl">🎨</span> 使い方・その他
          </h3>
          <div className="space-y-4">
            <Accordion title="作成したスタンプ画像が保存できません">
              <p className="text-sm leading-relaxed text-gray-600">
                お使いのブラウザがプライベートモード（シークレットモード）になっていないかご確認ください。
                また、iPhoneの場合はSafari、Androidの場合はChromeでのご利用を推奨しています。
                アプリ内ブラウザ（LINEやTwitterから開いた場合）では正常に動作しないことがあります。
              </p>
            </Accordion>
            
            <Accordion title="無料で使えますか？">
              <p className="text-sm leading-relaxed text-gray-600">
                はい、基本的な機能はすべて無料でご利用いただけます。
                登録も不要ですので、安心してお使いください。
                AIによる背景削除の回数無制限など、一部の便利機能のみ有料（VIPプラン）となっております。
              </p>
            </Accordion>
          </div>
        </section>

        {/* VIP Plan Section */}
        <section>
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3 pb-3 border-b-2 border-amber-100">
            <span className="text-2xl">👑</span> VIPプランについて
          </h3>
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
                  <a href="https://note.com/lchiki_nl/m/me2fbf42ae315" target="_blank" className="text-blue-500 underline hover:text-blue-600 mx-1">
                    作者のnote
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
                  以下の手順で切り替えをお願いします。
                </p>
                <ol className="list-decimal list-inside space-y-2 ml-2 bg-gray-50 p-4 rounded-lg">
                  <li>まず、現在の月額プランを解約する</li>
                  <li>有効期限が切れる（無料プランに戻る）のを待つ</li>
                  <li>VIP購入画面から「買い切りプラン」を改めて購入する</li>
                </ol>
                <p className="text-xs text-amber-600 font-bold mt-2">
                  ※ システムの仕様上、二重課金を防ぐため、必ず解約・期間終了後にご購入ください。
                </p>
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
      </div>

      <div className="mt-20 pt-10 border-t border-gray-100 text-center">
          <p className="text-gray-500 font-bold mb-4">その他のご質問・お問い合わせ</p>
            <a 
              href="https://note.com/lchiki_nl/m/me2fbf42ae315" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
            >
              <AlertCircle size={18} />
              開発者に問い合わせる (note)
            </a>
      </div>
    </div>
  );
}
