/// <reference types="@cloudflare/workers-types" />

// Cloudflare Pages Function: Hugging Face API Proxy
// トークンをサーバーサイドで付与し、フロントエンドから隠蔽する

interface Env {
  HF_TOKEN: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  // トークンが設定されているか確認
  if (!env.HF_TOKEN) {
    return new Response(JSON.stringify({ error: "HF_TOKEN is not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // フロントエンドから送られてきた FormData（画像）を取得
    // フロントエンドから送られてきた FormData（画像）を取得
    const formData = await request.formData();
    
    // パラメータの取得
    const model = formData.get('model') as string || 'isnet-general-use';
    const alphaMatting = formData.get('a') === 'false' ? 'false' : 'true'; // Default true
    
    // 画像データのみを転送用のFormDataに再構築（余計なフィールドを送らないため）
    const file = formData.get('file');
    if (!file) {
      return new Response(JSON.stringify({ error: "No file provided" }), { status: 400 });
    }
    const outboundFormData = new FormData();
    outboundFormData.append('file', file);

    // Hugging Face へリクエストを転送（ここで秘密のトークンを付与）
    // クエリパラメータを動的に構築
    const hfUrl = `https://Ichiki-nl-ezstampify.hf.space/api/remove?a=${alphaMatting}&model=${model}`;

    const hfResponse = await fetch(hfUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.HF_TOKEN}`,
      },
      body: outboundFormData,
    });

    // サーバースリープ中の場合
    if (hfResponse.status === 503) {
      return new Response(
        JSON.stringify({ 
          error: "サーバーが起動中です。30秒〜1分後に再試行してください。",
          isServerWaking: true 
        }), 
        {
          status: 503,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (!hfResponse.ok) {
      return new Response(
        JSON.stringify({ error: `処理に失敗しました (${hfResponse.status})` }), 
        {
          status: hfResponse.status,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 結果をそのままフロントエンドに返す（PNG画像）
    const imageBlob = await hfResponse.blob();
    return new Response(imageBlob, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
      },
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return new Response(
      JSON.stringify({ error: "プロキシ処理中にエラーが発生しました" }), 
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
