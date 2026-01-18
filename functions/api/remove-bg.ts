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
    const formData = await request.formData();

    // Hugging Face へリクエストを転送（ここで秘密のトークンを付与）
    // a=true: 境界線を滑らかにする（髪の毛などが綺麗になる）
    const hfResponse = await fetch("https://Ichiki-nl-ezstampify.hf.space/api/remove?a=true", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.HF_TOKEN}`,
      },
      body: formData,
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
