import React, { useState, useEffect } from 'react';
import { 
  Sun, 
  Wallet, 
  Settings, 
  BarChart3, 
  Coins,
  ChevronDown,
  HelpCircle,
  Menu,
  X,
  Bell,
  User,
  Shield,
  Globe,
  Lock,
  Leaf,
  ShoppingCart,
  TrendingUp
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

import { api } from './services/api';
import { auth } from './services/auth';
import { GenerationData, TokenHistory, BurnHistory } from './types';

import { Connection, PublicKey, clusterApiUrl, LAMPORTS_PER_SOL } from '@solana/web3.js';

// Mock data - replace with real data later
const mockGenerationData = [
  { date: '2025-02-01', amount: 6.89 },
  { date: '2025-02-02', amount: 7.12 },
  { date: '2025-02-03', amount: 6.95 },
  { date: '2025-02-04', amount: 7.45 },
  { date: '2025-02-05', amount: 7.73 },
  { date: '2025-02-06', amount: 7.21 },
  { date: '2025-02-07', amount: 7.56 },
];

const mockTokenHistory = [
  { date: '2025-02-05', amount: 200, type: 'received', status: 'completed' },
  { date: '2025-02-04', amount: 180, type: 'received', status: 'completed' },
  { date: '2025-02-03', amount: 190, type: 'received', status: 'completed' },
];

const mockBurnHistory = [
  { date: '2025-02-04', amount: 50, carbonReduction: 2.5, status: 'completed' },
  { date: '2025-02-03', amount: 30, carbonReduction: 1.5, status: 'completed' },
];

type PhantomEvent = "disconnect" | "connect" | "accountChanged";

interface ConnectOpts {
  onlyIfTrusted: boolean;
}

interface PhantomProvider {
  connect: (opts?: Partial<ConnectOpts>) => Promise<{ publicKey: { toString: () => string } }>;
  disconnect: () => Promise<void>;
  on: (event: PhantomEvent, callback: (args: any) => void) => void;
  isPhantom: boolean;
}

type WindowWithSolana = Window & { 
  solana?: PhantomProvider;
}

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [selectedLoggerId, setSelectedLoggerId] = useState('logger-1');
  const [activeTab, setActiveTab] = useState('overview');
  const [burnAmount, setBurnAmount] = useState('');
  const [showBurnModal, setShowBurnModal] = useState(false);
  const [notifications, setNotifications] = useState({
    tokenUpdates: true,
    systemAlerts: true,
    marketingEmails: false
  });

  const [dailyEnergyData, setDailyEnergyData] = useState(null);
  const [monthlyEnergyData, setMonthlyEnergyData] = useState(null);
  const [yearlyEnergyData, setYearlyEnergyData] = useState(null);
  const [ecerData, setEcerData] = useState<any>(null);
  const [energyData, setEnergyData] = useState<any>(null);
  const [generationData, setGenerationData] = useState<GenerationData[]>([]);
  const [tokenHistory, setTokenHistory] = useState<TokenHistory[]>([]);
  const [burnHistory, setBurnHistory] = useState<BurnHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  // 添加登录状态
const [isLoggedIn, setIsLoggedIn] = useState(false);

// 添加登录函数
const login = async () => {
  try {
    await auth.login();
    setIsLoggedIn(true);
    toast.success('登录成功');
  } catch (error) {
    console.error('登录失败:', error);
    toast.error('登录失败');
    return false;
  }
};

  // fetchData 和 fetchEnergyData 函数
  const fetchData = async () => {
    if (!isLoggedIn) {
      const success = await login();
      if (!success) return;
    }
  
    setIsLoading(true);
    try {
      const [generationData, tokenHistoryData, burnHistoryData] = await Promise.all([
        api.getGenerationData(),
        api.getTokenHistory(),
        api.getBurnHistory()
      ]);
  
      setGenerationData(generationData);
      setTokenHistory(tokenHistoryData);
      setBurnHistory(burnHistoryData);
    } catch (error) {
      toast.error('获取数据失败');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEnergyData = async () => {
    if (!isLoggedIn) return; // 如果未登录，不获取能源数据
  
    try {
      // 获取每日发电量
      const today = new Date().toISOString().split('T')[0];
      console.log('today:', today);
      const dailyData = await api.getEnergyDay(today);
      console.log('API返回数据:', dailyData); // 添加日志
      

      if (dailyData) {
        setDailyEnergyData(dailyData);
        console.log('数据已设置'); // 添加日志
      }

      // 获取年度每月发电量
      const yearlyData = await api.getEnergyYearPerMonth({
        date: today,
        devaddr: 1,
        devcode: 23727,
        pn: 'E60000231141084179',
        sn: 'DEV194DF395ECBDD3C',
        type: 1
      });
      if (yearlyData && yearlyData.vals) {
        const februaryVal = yearlyData.vals.find(v => v.ts === '2025-02')?.val || 0;
        const marchVal = yearlyData.vals.find(v => v.ts === '2025-03')?.val || 0;
        
        console.log('2025-02 发电量:', februaryVal);
        console.log('2025-03 发电量:', marchVal);

        const totalEnergy = Number(februaryVal) + Number(marchVal);
        const ecerData = await api.getECERIncome(Number(totalEnergy));
        console.log(`二氧化碳减排量: ${ecerData.erCarbonDioxideEmission} kg`);
        console.log(`相当于种植树木: ${ecerData.erEqTreePlanting} 棵`);
        console.log(`节省标准煤: ${ecerData.erSavingStandardCoal} kg`);
        console.log('碳排放数据:', ecerData);


        setEcerData(ecerData);

        

        setYearlyEnergyData(yearlyData); // 添加这行
        
      }
    
    
      // 获取月度每天发电量
      const monthlyData = await api.getEnergyMonthPerDay({
        date: today,
        devaddr: 1,
        devcode: 23727,
        pn: 'E60000231141084179',
        sn: 'DEV194DF395ECBDD3C',
        type: 1
      });
      setMonthlyEnergyData(monthlyData);
      console.log('月度每天发电量:', monthlyData);
    } catch (error) {
      console.error('获取能源数据失败:', error);
      toast.error('获取能源数据失败');
    }
  };

  

  useEffect(() => {
    login();
  }, []);
  

   // useEffect
 // 只在登录时获取数据
 useEffect(() => {
  console.log('登录状态:', isLoggedIn);
  if (isLoggedIn) {
    fetchData().then(() => {
      fetchEnergyData(); // 只在登录后获取数据
    });
  }
}, [isLoggedIn]);


  const [solBalance, setSolBalance] = useState<number | null>(null);

  const getProvider = (): PhantomProvider | undefined => {
    if ("solana" in window) {
      const provider = (window as WindowWithSolana).solana;
      if (provider?.isPhantom) {
        return provider;
      }
    }
    toast((t) => (
      <div className="flex flex-col gap-2">
        <p>You haven't installed the Phantom wallet yet. Click here to install the Phantom wallet, and return to continue once done.</p>
        <button
          onClick={() => {
            window.open("https://phantom.app/", "_blank");
            toast.dismiss(t.id);
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          Install Phantom Wallet
        </button>
      </div>
    ), {
      duration: 6000,
    });
  };

  const connectWallet = async () => {
    const provider = getProvider();
    if (!provider) return;

    try {
      toast.loading("Please authorize the DApp to connect to your Phantom wallet, ensuring we can obtain your wallet address for transaction operations.", {
        duration: 2000,
      });

      const response = await provider.connect();
      const address = response.publicKey.toString();
      setWalletAddress(address);
      setIsWalletConnected(true);

      // Fetch Solana balance
      const connection = new Connection(clusterApiUrl('devnet'));
      const balance = await connection.getBalance(new PublicKey(address));
      setSolBalance(balance / LAMPORTS_PER_SOL);

      toast.success("Connection successful! Your Phantom wallet has been successfully connected, and you can start making transactions and operations.", {
        duration: 3000,
      });

      // Add wallet event listeners
      provider.on("disconnect", () => {
        setIsWalletConnected(false);
        setWalletAddress("");
        // toast.success("您的钱包已成功断开连接，您的账户信息已清除。");
      });

      provider.on("accountChanged", (publicKey: any) => {
        if (publicKey) {
          setWalletAddress(publicKey.toString());
          toast.success("The wallet account has been changed.");
        } else {
          setIsWalletConnected(false);
          setWalletAddress("");
          toast.error("Wallet connection disconnected.");
        }
      });

    } catch (err) {
      console.error("Error connecting wallet:", err);
      toast.error("Connection failed, please check if your Phantom wallet is correctly installed and enabled, or try reloading the page.");
    }
  };

  const disconnectWallet = async () => {
    toast((t) => (
      <div className="flex flex-col gap-2">
        <p>Are you sure you want to disconnect from the Phantom wallet? Once disconnected, your wallet address and all sensitive information will no longer be associated with the DApp.</p>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              const provider = getProvider();
              if (provider) {
                try {
                  await provider.disconnect();
                  setIsWalletConnected(false);
                  setWalletAddress("");
                  toast.success("Your wallet has been successfully disconnected, and your account information has been cleared.");
                } catch (err) {
                  console.error("Error disconnecting wallet:", err);
                  toast.error("Failed to disconnect, please try again later.");
                }
              }
              toast.dismiss(t.id);
            }}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
          >
            Confirm Disconnect
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
          >
             Cancel
          </button>
        </div>
      </div>
    ), {
      duration: 6000,
    });
  };

  const handleBurnTokens = () => {
    if (!burnAmount || parseInt(burnAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    // Add token burn logic here
    alert(`Successfully burned ${burnAmount} tokens, reducing carbon emissions by ${parseFloat(burnAmount) * 0.05} tons`);
    setShowBurnModal(false);
    setBurnAmount('');
  };

  const renderContent = () => {
    switch (activeTab) {
      // 在 renderContent 函数中添加新的 case
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">能源概览</h2>
              {isLoading ? (
                <div>加载中...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* 现有的发电量卡片 */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-md font-medium text-gray-700 mb-2">今日发电量</h3>
                    <p className="text-2xl font-bold text-gray-900">
                     {dailyEnergyData ? `${dailyEnergyData.energyDay} ${dailyEnergyData.energyDayUnit}` : '暂无数据'}
                    </p>
                  </div>
                  
                  {/* 新增环境影响卡片 */}
                  <div className="bg-green-50 p-4 rounded-lg">
  <h3 className="text-md font-medium text-green-700 mb-2">碳减排</h3>
  <p className="text-sm text-green-500 mt-1">减少碳排放量{ecerData ? `${ecerData.erCarbonDioxideEmission} kg` : '暂无数据'}</p>
  <p className="text-sm text-green-500">相当于种植 {ecerData?.erEqTreePlanting || 0} 棵树</p>
  <p className="text-sm text-green-500">节省 {ecerData?.erSavingStandardCoal || 0} kg 标准煤</p>
</div>
                  
                  {/* 现有的发电统计 */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-md font-medium text-gray-700 mb-2">发电统计</h3>
                    <div className="space-y-2">
                    {monthlyEnergyData?.vals
    ?.filter(item => new Date(item.ts) <= new Date('2025-03-10'))
    ?.slice()
    .reverse()
    .slice(0, 5)
    .map((item, index) => (
      <div key={index} className="flex justify-between">
        <span>{item.ts.substring(0, 10)}</span>
        <span>{Number(item.val).toFixed(2)} kWh</span>
      </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      case 'token-management':
        return (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg">
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Token Management</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-md font-medium text-gray-700 mb-2">Total Balance</h3>
                    <p className="text-2xl font-bold text-gray-900">
  {yearlyEnergyData?.vals ? 
    `${(yearlyEnergyData.vals.find(v => v.ts === '2025-02')?.val || 0) + 
       (yearlyEnergyData.vals.find(v => v.ts === '2025-03')?.val || 0)} LGR Tokens` 
    : '暂无数据'}
</p>
            
                    <div className="mt-4">
                      <button
                        onClick={() => setShowBurnModal(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <Leaf className="mr-2 h-4 w-4" />
                        Burn Tokens for Carbon Reduction
                      </button>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-md font-medium text-gray-700 mb-2">Carbon Impact</h3>
                    <p className="text-2xl font-bold text-green-600">4.0 tons</p>
                    <p className="text-sm text-gray-500 mt-1">Total carbon emissions reduced</p>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-200">
                <h3 className="text-md font-medium text-gray-700 mb-4">Transaction History</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Carbon Reduction</th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {[...mockTokenHistory, ...mockBurnHistory.map(burn => ({
                        ...burn,
                        type: 'burned'
                      }))].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((transaction, idx) => (
                        <tr key={idx}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.date}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">{transaction.type}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {transaction.type === 'burned' ? '-' : '+'}{transaction.amount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {transaction.type === 'burned' ? `${transaction.carbonReduction} tons` : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              {transaction.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg">
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Account Settings</h2>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <User className="h-5 w-5 text-gray-400" />
                      <span className="ml-3 text-sm font-medium text-gray-900">Profile Information</span>
                    </div>
                    <button className="text-sm text-indigo-600 hover:text-indigo-900">Edit</button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Lock className="h-5 w-5 text-gray-400" />
                      <span className="ml-3 text-sm font-medium text-gray-900">Security Settings</span>
                    </div>
                    <button className="text-sm text-indigo-600 hover:text-indigo-900">Manage</button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Globe className="h-5 w-5 text-gray-400" />
                      <span className="ml-3 text-sm font-medium text-gray-900">Language & Region</span>
                    </div>
                    <select className="mt-1 block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                      <option>English (US)</option>
                      <option>中文 (简体)</option>
                      <option>日本語</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg">
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Coins className="h-5 w-5 text-gray-400" />
                      <span className="ml-3 text-sm font-medium text-gray-900">Token Updates</span>
                    </div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={notifications.tokenUpdates}
                        onChange={(e) => setNotifications({...notifications, tokenUpdates: e.target.checked})}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Bell className="h-5 w-5 text-gray-400" />
                      <span className="ml-3 text-sm font-medium text-gray-900">System Alerts</span>
                    </div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={notifications.systemAlerts}
                        onChange={(e) => setNotifications({...notifications, systemAlerts: e.target.checked})}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Shield className="h-5 w-5 text-gray-400" />
                      <span className="ml-3 text-sm font-medium text-gray-900">Marketing Emails</span>
                    </div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={notifications.marketingEmails}
                        onChange={(e) => setNotifications({...notifications, marketingEmails: e.target.checked})}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {/* Generation Data Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Sun className="h-6 w-6 text-yellow-500" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Today's Generation
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          7.73 GWh
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <select
                    value={selectedLoggerId}
                    onChange={(e) => setSelectedLoggerId(e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option value="logger-1">Logger 1</option>
                    <option value="logger-2">Logger 2</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Token Balance Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Coins className="h-6 w-6 text-indigo-500" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Current Token Balance
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          773 Tokens
                        </div>
                      </dd>
                      <dd className="mt-2">
                        <p className="text-md text-gray-700">Solana Balance: {solBalance !== null ? `${solBalance} SOL` : 'Loading...'}</p>
                        <p className="text-sm text-gray-500">Address: {walletAddress}</p>
                        </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <button
                    className="text-indigo-700 hover:text-indigo-900"
                    onClick={() => setShowBurnModal(true)}
                  >
                    Burn Tokens →
                  </button>
                </div>
              </div>
            </div>

            {/* Token History Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Token Distribution History
                </h3>
                <div className="mt-5">
                  <div className="flow-root">
                    <ul className="-mb-8">
                      {mockTokenHistory.map((item, itemIdx) => (
                        <li key={itemIdx}>
                          <div className="relative pb-8">
                            {itemIdx !== mockTokenHistory.length - 1 ? (
                              <span
                                className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                                aria-hidden="true"
                              />
                            ) : null}
                            <div className="relative flex space-x-3">
                              <div>
                                <span className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center ring-8 ring-white">
                                  <Coins className="h-5 w-5 text-green-600" />
                                </span>
                              </div>
                              <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                <div>
                                  <p className="text-sm text-gray-500">
                                    Received {item.amount} tokens
                                  </p>
                                </div>
                                <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                  <time dateTime={item.date}>{item.date}</time>
                                </div>
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-center" />
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="px-4 inline-flex items-center lg:hidden"
              >
                {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <div className="flex-shrink-0 flex items-center">
                <Sun className="h-8 w-8 text-yellow-500" />
                <span className="ml-2 text-xl font-bold text-gray-900">Little Green Ranger</span>
              </div>
              <div className="hidden lg:ml-6 lg:flex lg:space-x-8">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`${
                    activeTab === 'overview'
                      ? 'border-indigo-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Generation Data
                </button>
                <button
                  onClick={() => setActiveTab('token-management')}
                  className={`${
                    activeTab === 'token-management'
                      ? 'border-indigo-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  <Coins className="mr-2 h-4 w-4" />
                  Token Management
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`${
                    activeTab === 'settings'
                      ? 'border-indigo-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </button>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={isWalletConnected ? disconnectWallet : connectWallet}
                className="inline-flex items-center px-10 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Wallet className="mr-2 h-4 w-4" />
                {isWalletConnected ? 
                  walletAddress.slice(0, 4) + "..." + walletAddress.slice(-4) 
                  : "Connect Phantom"}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-0 z-40`}>
        <div className="h-full w-64 bg-white shadow-lg">
          <div className="h-0 flex-1 flex flex-col overflow-y-auto">
            <nav className="flex-1 px-2 py-4 space-y-1">
              <button
                onClick={() => setActiveTab('overview')}
                className={`${
                  activeTab === 'overview'
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                } group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full`}
              >
                <BarChart3 className="mr-3 h-6 w-6 text-gray-400" />
                Overview
              </button>
              <button
                onClick={() => setActiveTab('token-management')}
                className={`${
                  activeTab === 'token-management'
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                } group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full`}
              >
                <Coins className="mr-3 h-6 w-6 text-gray-400" />
                Token Management
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`${
                  activeTab === 'settings'
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                } group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full`}
              >
                <Settings className="mr-3 h-6 w-6 text-gray-400" />
                Settings
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {renderContent()}
          </div>
        </div>
      </main>

      {/* Burn Token Modal */}
      {showBurnModal && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                  <Leaf className="h-6 w-6 text-green-600" />
                 </div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Burn Tokens for Carbon Reduction
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      For every token burned, approximately 0.05 tons of carbon emissions will be reduced.
                    </p>
                  </div>
                </div>
                <div className="mt-5">
                  <input
                    type="number"
                    value={burnAmount}
                    onChange={(e) => setBurnAmount(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Enter amount"
                  />
                  {burnAmount && (
                    <p className="mt-2 text-sm text-green-600">
                      Estimated carbon reduction: {parseFloat(burnAmount) * 0.05} tons
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="button"
                  onClick={handleBurnTokens}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:col-start-2 sm:text-sm"
                >
                  Burn for Carbon Reduction
                </button>
                <button
                  type="button"
                  onClick={() => setShowBurnModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 md:flex md:items-center md:justify-between lg:px-8">
          <div className="flex justify-center space-x-6 md:order-2">
            <a href="#" className="text-gray-400 hover:text-gray-500">
              <span className="sr-only">Help Center</span>
              <HelpCircle className="h-6 w-6" />
            </a>
          </div>
          <div className="mt-8 md:mt-0 md:order-1">
            <p className="text-center text-base text-gray-400">
              &copy; Little Green Ranger. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;