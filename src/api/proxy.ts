export const config = {
    runtime: 'edge'
  };
  
  export default async function handler(req: Request) {
    const url = new URL(req.url);

    console.log('Original path:', url.pathname);
console.log('Processed path:', url.pathname.replace(/^\/api/, ''));

    // 需要修正后端路径
// const targetUrl = 'https://api.valueclouds.com/api/v1' + url.pathname + url.search; // 添加API版本路径
    
const baseUrl = 'https://api.valueclouds.com/api/v1';
const targetUrl = baseUrl + url.pathname.replace(/^\/api/, '') + url.search;
console.log('Proxying request to:', targetUrl);
    console.log('Request headers:', Object.fromEntries(new Headers(req.headers)));

    const headers = new Headers(req.headers);
    headers.delete('host');
    headers.set('Authorization', `Bearer ${process.env.API_KEY}`); // 需要先在Vercel设置环境变量

    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body: req.body,
      cf: {
        tlsVerify: true
      }
    });

    console.log('Received response status:', response.status);

    return new Response(response.body, {
      status: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, secret, auth, token, userId, sign, project',
      }
    });
  }

