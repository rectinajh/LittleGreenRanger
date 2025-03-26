export interface GenerationData {
    date: string;
    amount: number;
  }

  // 添加年度数据类型
export interface EnergyYearItem {
    typeCode: number;
    vals: Array<{
      ts: string;
      val: number;
    }>;
  }
  
  // 更新 EnergyResponse 使用具体类型而不是 any
  export interface EnergyResponse {
    success: boolean;
    data: {
      items: Array<EnergyYearItem>;
    };
    errorMessage?: string;
  }
  
  export interface TokenHistory {
    date: string;
    amount: number;
    type: string;
    status: string;
  }
  
  export interface BurnHistory {
    date: string;
    amount: number;
    carbonReduction: number;
    status: string;
  }

  export interface AuthResponse {
    token: string;
    secret: string;
    userId: string;
    auth: string;
  }

  interface EnergyDayParam {
    date: string;
    devaddr: number;
    devcode: number;
    pn: string;
    sn: string;
    type: number;
  }
  
  export interface LoginPayload {
    account: string;
    password: string;
    project: string;
  }

  export interface EnergyDayParams {
    date: string;
  }
  
  export interface EnergyMonthParams {
    date: string;
    devaddr: number;
    devcode: number;
    pn: string;
    sn: string;
    type: number;
  }

  export interface EnergyTotalPerYearParams {
    devaddr: number;
    devcode: number;
    pn: string;
    sn: string;
    type: number;
  }

  export interface EnergyTotalPerYearItem {
    typeCode: number;
    vals: Array<{
      ts: string;
      val: number;
    }>;
  }
  
  export interface EnergyResponse {
    success: boolean;
    data: {
      items: Array<{
        typeCode: number;
        [key: string]: any;
      }>;
    };
    errorMessage?: string;
  }