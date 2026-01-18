// Simple canary function to test if Functions are deploying at all
// Access at /hello
export const onRequest = () => {
  return new Response("Hello from Cloudflare Functions! (Canary Test)");
};
