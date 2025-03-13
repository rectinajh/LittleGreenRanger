import axios from 'axios';
import { AuthResponse, LoginPayload } from '../types';

const BASE_URL = '/api';

export const auth = {
  async login(): Promise<AuthResponse> {
    const loginPayload: LoginPayload = {
      account: '13281881130',
      password: '1ff90cc945ee04d9be0d0a14ec2ded658e0efffb',
      project: 'IOT',
    };

    const response = await axios.post(`${BASE_URL}/ppr/web/login/login`, loginPayload);
    
    if (!response.data?.data) {
      throw new Error('Login failed: no data returned');
    }

    return {
      ...response.data.data,
      auth: response.headers['auth']
    };
  },

  // 使用 Web Crypto API 生成签名
  async generateSignature(path: string, secret: string): Promise<string> {
    const encoder = new TextEncoder();
    
    const key = await window.crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
  
    const signature = await window.crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(path)
    );
  
    return Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }
};