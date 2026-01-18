/// <reference types="@cloudflare/workers-types" />

// Cloudflare Pages Function: VIP Password Verification
// パスワードをサーバーサイドで検証し、正解かどうかだけを返す

interface Env {
  VIP_PASSWORD?: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
    const { password } = await request.json() as { password?: string };

    // 環境変数が設定されていない場合（開発環境など）の安全なフォールバック
    // 本番では必ず設定すること
    const correctPassword = env.VIP_PASSWORD;

    if (!correctPassword) {
      console.warn("VIP_PASSWORD is not set in environment variables.");
      return new Response(JSON.stringify({ success: false, error: "Server configuration error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (password === correctPassword) {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      // パスワード不一致（セキュリティのため、詳細は返さない）
      // ただし、ステータスコードは200で返し、body内のsuccessで判断させるのが一般的
      // (401を返すとブラウザの認証ダイアログが出る場合があるため)
      return new Response(JSON.stringify({ success: false }), {
        status: 200, // あえて200 OK
        headers: { "Content-Type": "application/json" },
      });
    }

  } catch {
    return new Response(JSON.stringify({ success: false, error: "Invalid request" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
};
