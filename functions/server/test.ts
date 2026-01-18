/// <reference types="@cloudflare/workers-types" />

// Test endpoint to verify Functions are working
export const onRequestPost: PagesFunction = async () => {
  return new Response(JSON.stringify({ message: "Test endpoint works!" }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

export const onRequestGet: PagesFunction = async () => {
  return new Response(JSON.stringify({ message: "GET also works!" }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
