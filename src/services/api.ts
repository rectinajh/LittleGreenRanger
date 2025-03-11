
import axios, { AxiosResponse } from 'axios';
import { auth } from './auth';
import type { 
    GenerationData, 
    TokenHistory, 
    BurnHistory, 
    AuthResponse,
    EnergyDayParam,
    EnergyMonthParams, 
    EnergyYearItem, 
    EnergyResponse 
  } from '../types';


// api.ts
const baseURL = process.env.NODE_ENV === 'production' 
  ? '/api'  // 生产环境使用Edge Function
  : 'https://api.valueclouds.com'; // 开发环境直接调用


class ApiService {
  private authData: AuthResponse | null = null;

  private readonly paths = {
    energyDay: '/dcs/api/auth/web/solar/plants/energyDay',
    energyTotal: '/dcs/api/auth/web/solar/plants/energyTotal',
    outputPowerOneDay: '/dcs/api/auth/web/solar/plants/outputPowerOneDay',
    ecerIncome: '/dgm/api/dgm/itemseybond/ECERIncome',
    energyYearPerMonth: '/dcs/api/auth/web/solar/device/energyYearPerMonth',
    energyMonthPerDay: '/dcs/api/auth/web/solar/device/energyMonthPerDay',
    energyDetail: '/dcs/api/auth/web/solar/device/energyDetail'
  };

  private async ensureAuth() {
    
    if (!this.authData) {
      this.authData = await auth.login();
    }
    return this.authData;
  }

  private async makeAuthRequest(path: string, params?: any, extraHeaders?: any) {
    const authData = await this.ensureAuth();
    const signature = await auth.generateSignature(path, authData.secret);
    
    console.log('发送请求:', {
      url: `${baseURL}${path}`,
      params: params
    });
  
    return axios.get(`${baseURL}${path}`, {
      params: params,
      headers: {
        i18n: 'zh_CN',
        auth: authData.auth,
        token: authData.token,
        secret: authData.secret,
        userId: authData.userId,
        sign: signature,
        project: 'IOT',
        'Content-Type': 'application/json',
        ...extraHeaders
      }
    });
  }

  async getEnergyDay(date: string) {  // 移除默认值
    // 确保日期格式正确 YYYY-MM-DD
    const formattedDate = new Date(date).toISOString().split('T')[0];
    
    // 打印参数看看
    console.log('请求参数:', { date: formattedDate });
    
    const response = await this.makeAuthRequest(
      this.paths.energyDay, 
      { date: formattedDate }  // 确保参数名称正确
    );

    return this.handleResponse(response);
  }

  async getEnergyMonthPerDay(params: EnergyDayParam) {
    try {
        const response = await this.makeAuthRequest(
          this.paths.energyMonthPerDay,
          params
        );
        if (response.data.success) {
          return response.data.data.items.find(item => item.typeCode === 0);
        }
        throw new Error(response.data.errorMessage || '未知错误');
      } catch (error) {
        console.error('Energy API Error:', error);
        throw error;
      }
  }
  

  private handleResponse(response: AxiosResponse) {
    console.log('API响应:', response.data);  // 添加日志查看响应内容
    
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(`API错误: ${response.data.code}`);
    }
  }

  async getGenerationData(): Promise<GenerationData[]> {
    const response = await this.makeAuthRequest(
      this.paths.energyDay,
      { date: new Date().toISOString().split('T')[0] }
    );
    return this.handleResponse(response);
  }

  async getTokenHistory(): Promise<TokenHistory[]> {
    const response = await this.makeAuthRequest(this.paths.energyDay);
    return this.handleResponse(response);
  }

  async getBurnHistory(): Promise<BurnHistory[]> {
    const response = await this.makeAuthRequest(this.paths.energyDay);
    return this.handleResponse(response);
  }

  async getEnergyTotal() {
    const response = await this.makeAuthRequest(this.paths.energyTotal);
    return this.handleResponse(response);
  }

  async getOutputPowerOneDay() {
    const response = await this.makeAuthRequest(this.paths.outputPowerOneDay);
    return this.handleResponse(response);
  }

  async getECERIncome(sumIIPlanGeneratedEnergy: number) {
    try {
      const response = await this.makeAuthRequest(
        this.paths.ecerIncome,
        { 
          itemBusinessId: 1, 
          sumIIPlanGeneratedEnergy 
        }
      );
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.errorMessage || '未知错误');
    } catch (error) {
      console.error('ECER Income API Error:', error);
      throw error;
    }
  }

  async getEnergyYearPerMonth(params: EnergyMonthParams): Promise<EnergyYearItem | undefined> {
    try {
      const response = await this.makeAuthRequest<EnergyResponse>(
        this.paths.energyYearPerMonth,
        params
      );
      if (response.data.success) {
        return response.data.data.items.find(item => item.typeCode === 0);
      }
      throw new Error(response.data.errorMessage || '未知错误');
    } catch (error) {
      console.error('Energy API Error:', error);
      throw error;
    }
  }
  
}

export const api = new ApiService();