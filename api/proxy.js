// 创建一个测试端点以验证基本配置
export const config = { runtime: 'edge' };

export default async function handler(req) {
  console.log('Edge function received request');
  
  // 测试端点
  if (req.url.includes('/api/test')) {
    return new Response(JSON.stringify({
      success: true,
      message: 'Edge function is working!'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
  
  // 处理OPTIONS预检请求
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, token, userId, secret, auth, sign, project',
        'Access-Control-Max-Age': '86400'
      }
    });
  }
  
  // 代理逻辑
  const url = new URL(req.url);
  const targetUrl = 'https://api.valueclouds.com' + url.pathname.replace(/^\/api/, '') + url.search;

  console.log('Proxying to:', targetUrl);
  
  try {
    // 保留原始请求头并保留认证信息
    const headers = new Headers(req.headers);
    headers.delete('host');
    
    // 调试认证信息
    console.log('Auth headers:', {
      auth: headers.get('Authorization'),
      token: headers.get('token'),
      cookie: headers.get('cookie')
    });

    const response = await fetch(targetUrl, {
      method: req.method,
      headers: headers,
      body: req.body,
      credentials: 'include' // 包含cookies
    });
      
    // 响应处理
    const responseData = await response.text();
    console.log('Response status:', response.status);
    console.log('Response cookies:', response.headers.get('set-cookie'));
    
    // 构造响应并保留所有原始头信息
    const responseHeaders = new Headers({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, token, userId, secret, auth, sign, project',
      'Access-Control-Allow-Credentials': 'true',
      'Content-Type': response.headers.get('Content-Type') || 'application/json'
    });
    
    // 复制所有响应头
    response.headers.forEach((value, key) => {
      // 不覆盖已设置的CORS头
      if (!key.toLowerCase().startsWith('access-control-')) {
        responseHeaders.append(key, value);
      }
    });
    
    return new Response(responseData, {
      status: response.status,
      headers: responseHeaders
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return new Response(JSON.stringify({
      error: error.message,
      location: 'Edge Function',
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: {'Content-Type': 'application/json'}
    });
  }
}