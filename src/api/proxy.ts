export const config = {
    runtime: 'edge'
  };
  
  export default async function handler(req: Request) {
    const url = new URL(req.url);
    const targetUrl = 'https://api.valueclouds.com' + url.pathname.replace(/^\/api/, '') + url.search;
  
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