export const config = {
    runtime: 'edge'
  };
  
  export default async function handler(req: Request) {
    const url = new URL(req.url);
    // proxy.ts (修改第5-6行)
const targetUrl = 'https://api.valueclouds.com' + url.pathname + url.search;
// 移除路径替换逻辑: .replace(/^\/api/, '')
  
    const headers = new Headers(req.headers);
    headers.delete('host');
  
    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body: req.body
    });
  
    return new Response(response.body, {
      status: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, secret, auth, token, userId, sign, project',
      }
    });
  }