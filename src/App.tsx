import React, { useState, useEffect } from 'react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
// 在App.tsx顶部导入
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletNotConnectedError } from '@solana/wallet-adapter-base';
import { LAMPORTS_PER_SOL, PublicKey, Connection, Transaction, sendAndConfirmTransaction } from '@solana/web3.js';
import { getAssociatedTokenAddress, getAccount, createAssociatedTokenAccountInstruction, TOKEN_PROGRAM_ID } from '@solana/spl-token';


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





function App() {

  const { setVisible } = useWalletModal();

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showModal, setShowModal] = useState(false);
  const [burnAmount, setBurnAmount] = useState('');
  const [activeTimeframe, setActiveTimeframe] = useState('day');

    // 使用钱包适配器提供的连接和钱包对象
    const { connection } = useConnection();
    const wallet = useWallet();
    const { publicKey, connected, connecting, disconnect, connect } = wallet;

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [tokenBalance, setTokenBalance] = useState(0);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [selectedLoggerId, setSelectedLoggerId] = useState('logger-1');
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
// 在App组件中添加一个新的状态
const [tokenAccountExists, setTokenAccountExists] = useState(true);

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
  

   // useEffect
 // 只在登录时获取数据
 useEffect(() => {
  login();
  console.log('登录状态:', isLoggedIn);
  if (isLoggedIn) {
    fetchData().then(() => {
      fetchEnergyData(); // 只在登录后获取数据
    });
  }

  // 监听页面可见性变化
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible' && publicKey && !walletBalance) {
      // 当页面重新变为可见且已连接钱包但余额未加载时，尝试重新获取余额
      updateBalances();
    }
  };

   // 注册监听器
   document.addEventListener('visibilitychange', handleVisibilityChange);
  
   // 组件卸载时清理
   return () => {
     document.removeEventListener('visibilitychange', handleVisibilityChange);
   };
}, [isLoggedIn, publicKey, walletBalance]);

// 设备类型检测的独立useEffect
useEffect(() => {
  const handleResize = () => {
    setIsMobile(window.innerWidth < 1024);
    if (window.innerWidth >= 1024 && isSidebarOpen) {
      setIsSidebarOpen(false);
    }
  };
  
  handleResize();
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, [isSidebarOpen]); // 注意依赖项中需要包含isSidebarOpen


  // 定义一个常量用于LGR代币的Mint地址
const LGR_TOKEN_MINT = new PublicKey('2aRoKCWNpm772VUUxNPCRKGneZnrJVywsE1yrQMWpjy4');

// 添加获取LGR代币余额的函数
const getLGRTokenBalance = async (walletPublicKey: PublicKey) => {
  try {
    console.log("开始检查LGR代币账户详情:");
    console.log("使用的MINT地址:", LGR_TOKEN_MINT.toString());
    console.log("当前连接的网络:", connection.rpcEndpoint);
    console.log("开始获取LGR余额，钱包地址:", walletPublicKey.toString());
    // 获取关联的代币账户地址
    const tokenAccountAddress = await getAssociatedTokenAddress(
      LGR_TOKEN_MINT,
      walletPublicKey
    );
    console.log("关联的token账户地址:", tokenAccountAddress.toString());
    
    // 查询所有的代币账户
    console.log("尝试查询该钱包的所有代币账户...");
    const allTokenAccounts = await connection.getParsedTokenAccountsByOwner(
      walletPublicKey,
      { programId: TOKEN_PROGRAM_ID }
    );
    
    console.log(`找到${allTokenAccounts.value.length}个代币账户：`);
    allTokenAccounts.value.forEach(account => {
      const tokenInfo = account.account.data.parsed.info;
      console.log(`- 账户: ${account.pubkey.toString()}`);
      console.log(`  Mint: ${tokenInfo.mint}`);
      console.log(`  余额: ${tokenInfo.tokenAmount.uiAmount}`);
    });

    try {
      // 使用钱包适配器提供的connection
      const tokenAccount = await getAccount(connection, tokenAccountAddress);
      console.log("成功获取token账户:", tokenAccount);
      // 返回余额（代币的小数位可能不是9，需根据实际情况调整）
            // 标记账户存在
            setTokenAccountExists(true);
      return Number(tokenAccount.amount) / Math.pow(10, 9);
    } catch (e) {
      console.log('找不到LGR代币账户，余额可能为0:', e);

        // 标记账户不存在
        setTokenAccountExists(false);

     // 只显示提示信息，不提供创建账户的选项
  if (connected && publicKey) {
    toast.success(
      '您的钱包中还没有LGR代币。当您收到第一笔LGR代币时，系统会自动为您创建账户。',
      { 
        duration: 8000,
        icon: '💡'
      }
    );
  }


      return 0;
    }
  } catch (error) {
    console.error('获取LGR代币余额失败:', error);
    return 0;
  }
};

// 创建关联token账户的函数 - 简化版
const createTokenAccount = async () => {
  if (!publicKey || !connected) {
    toast.error('请先连接钱包');
    return;
  }

  try {
    toast.loading('正在准备创建代币账户...', { duration: 3000 });
    
    // 获取关联的代币账户地址
    const tokenAccountAddress = await getAssociatedTokenAddress(
      LGR_TOKEN_MINT,
      publicKey
    );
    
    console.log('尝试创建代币账户:', tokenAccountAddress.toString());
    
    // 使用低级API直接构建和发送交易
    const transaction = new Transaction();
    
    // 添加创建关联代币账户的指令
    transaction.add(
      createAssociatedTokenAccountInstruction(
        publicKey, // 付款人
        tokenAccountAddress, // 要创建的关联代币账户地址
        publicKey, // 拥有者
        LGR_TOKEN_MINT // 代币Mint地址
      )
    );
    
    // 设置区块哈希和付款方
    transaction.feePayer = publicKey;
    const { blockhash } = await connection.getLatestBlockhash('confirmed');
    transaction.recentBlockhash = blockhash;
    
    // 简化交易发送和确认逻辑
    try {
      toast.loading('请在钱包中确认交易...', { duration: 5000 });
      
      // 发送交易 - 使用较低超时设置
      const signature = await wallet.sendTransaction(transaction, connection, { skipPreflight: false });
      console.log('交易已发送，签名:', signature);
      
      // 简单等待而不使用confirmTransaction
      toast.loading('正在确认交易...', { duration: 10000 });
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // 尝试再次获取token账户
      try {
        await getAccount(connection, tokenAccountAddress);
        toast.success('代币账户创建成功!');
        setTimeout(() => updateBalances(), 2000);
        return tokenAccountAddress;
      } catch (e) {
        toast.error('未能确认代币账户创建，请稍后查看余额');
        return null;
      }
    } catch (txError) {
      console.error('发送交易失败:', txError);
      const errorMessage = txError instanceof Error ? txError.message : '未知错误';
      toast.error('钱包拒绝了交易或出现错误: ' + errorMessage);
      return null;
    }
  } catch (error) {
    console.error('准备交易失败:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    toast.error('创建代币账户失败: ' + errorMessage);
    return null;
  }
};






const updateBalances = async () => {
  if (connected && publicKey) {
    try {
      const balance = await connection.getBalance(publicKey);
      setWalletBalance(balance / LAMPORTS_PER_SOL);
      
      const tokenBal = await getLGRTokenBalance(publicKey);
      setTokenBalance(tokenBal);
    } catch (error) {
      console.error("Error updating balances:", error);
    }
  }
};


  // 使用wallet adapter连接钱包
  const connectWallet = async () => {
    try {
      // 打开钱包选择模态框
      setVisible(true);

      // 这里应该先确保有可用的钱包，然后再尝试连接
      if (!wallet || (!connected && connecting)) {
        toast.error('请等待钱包连接完成');
        return;
      }

      // 在尝试连接之前给浏览器一点时间来初始化服务工作线程
      toast.loading("正在连接钱包...", {
        duration: 3000,
      });

      // 添加延迟以解决服务工作线程问题
      setTimeout(async () => {
        try {
          await connect();
          
          // 连接成功后获取余额
          if (publicKey) {
            updateBalances();
          }
        } catch (connectError) {
          console.error("Error in delayed wallet connection:", connectError);
          toast.error("连接失败，请尝试刷新页面或重新安装钱包扩展");
        }
      }, 1000);

    } catch (err) {
      console.error("Error connecting wallet:", err);
      toast.error("连接失败，请检查钱包是否正确安装并启用，或尝试重新加载页面");
    }
  };

// 使用wallet adapter断开钱包连接
const disconnectWallet = async () => {
  toast((t) => (
    <div className="flex flex-col gap-2">
      <p>Are you sure you want to disconnect from your wallet? Once disconnected, your wallet address and all sensitive information will no longer be associated with the DApp.</p>
      <div className="flex gap-2">
        <button
          onClick={async () => {
            try {
              await disconnect();
              toast.success("Your wallet has been successfully disconnected, and your account information has been cleared.");
            } catch (err) {
              console.error("Error disconnecting wallet:", err);
              toast.error("Failed to disconnect, please try again later.");
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

// 使用useEffect监听钱包连接状态，更新相关状态
useEffect(() => {
  let balanceInterval: NodeJS.Timeout | null = null;
  
  if (connected && publicKey) {
    const address = publicKey.toString();
    setWalletAddress(address);
    
    // Initial balance update
    updateBalances();
    
    // Set interval for periodic balance updates
    balanceInterval = setInterval(updateBalances, 30000);
    
    // Successful connection toast
    toast.success("Connection successful! Your wallet has been successfully connected, and you can start making transactions and operations.", {
      duration: 3000,
    });
  } else {
    setWalletAddress("");
    setWalletBalance(null);
    setTokenBalance(0);
  }
  
  // Cleanup function to clear interval
  return () => {
    if (balanceInterval) {
      clearInterval(balanceInterval);
    }
  };
}, [connected, publicKey, connection]);

// 使用钱包适配器处理代币燃烧
const handleBurnTokens = () => {
  if (!burnAmount || parseInt(burnAmount) <= 0) {
    toast.error('Please enter a valid amount');
    return;
  }
  
  if (!connected || !publicKey) {
    throw new WalletNotConnectedError();
    return;
  }
  
  // Add token burn logic here using the wallet adapter
  toast.success(`Successfully burned ${burnAmount} tokens, reducing carbon emissions by ${parseFloat(burnAmount) * 0.05} tons`);
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
        <h2 className="text-lg font-medium text-gray-900 mb-4">Energy Overview</h2>
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Daily Energy Generation Card */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-md font-medium text-gray-700 mb-2">Today's Generation</h3>
              <p className="text-2xl font-bold text-gray-900">
                {dailyEnergyData ? `${dailyEnergyData.energyDay} ${dailyEnergyData.energyDayUnit}` : 'No data available'}
              </p>
            </div>

            {/* Solana Balance */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-md font-medium text-gray-700 mb-2">Solana Balance</h3>
              <div className="space-y-1">
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500">Address:</span>
                  <span className="text-xs text-gray-600 font-mono truncate">
                    {walletAddress || 'Wallet not connected'}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-md text-gray-700">Solana Balance: {walletBalance !== null ? `${walletBalance} SOL` : 'Loading...'}</p>
                  <span className="text-sm text-gray-500">Current Token Balance:</span>
                  <span className="font-medium text-green-600">
                 {connected ? (
  tokenAccountExists ? 
    (tokenBalance !== null ? `${tokenBalance.toFixed(4)} LGR` : '加载中...') : 
    '账户尚未创建'
) : '请连接钱包'}
                  </span>
                </div>
              </div>
            </div>

            {/* Carbon Impact Card */}
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-md font-medium text-green-700 mb-2">Carbon Reduction</h3>
              <p className="text-sm text-green-500 mt-1">Carbon emissions reduced: {ecerData ? `${ecerData.erCarbonDioxideEmission} kg` : 'No data available'}</p>
              <p className="text-sm text-green-500">Equivalent to planting {ecerData?.erEqTreePlanting || 0} trees</p>
              <p className="text-sm text-green-500">Saved {ecerData?.erSavingStandardCoal || 0} kg standard coal</p>
            </div>

            {/* Generation Statistics - adjusted to md:col-span-1 */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-md font-medium text-gray-700 mb-2">Generation Statistics</h3>
              <div className="space-y-2 h-[300px] overflow-y-auto">
                {monthlyEnergyData?.vals
                  ?.filter(item => new Date(item.ts) <= new Date())
                  ?.slice()
                  .reverse()
                  .slice(0, 25)
                  .map((item, index) => (
                    <div key={index} className="flex justify-between">
                      <span>{item.ts.substring(0, 10)}</span>
                      <span>{Number(item.val).toFixed(2)} kWh</span>
                    </div>
                  ))
                }
              </div>
            </div>

              {/* Token Distribution History - placed in the grid */}
              <div className="bg-gray-50 p-4 rounded-lg md:col-span-1 lg:col-span-2">
              <h3 className="text-md font-medium text-gray-700 mb-2">Token Distribution History</h3>
              <p className="text-xs text-gray-500 mb-3">Showing settled LGR tokens from completed days</p>
              <div className="flow-root h-[300px] overflow-y-auto">
                <ul className="-mb-8" aria-label="Token distribution timeline">
                  {monthlyEnergyData?.vals
                    ?.filter(item => {
                      // Create a date for yesterday by subtracting 1 day from current date
                      const yesterday = new Date();
                      yesterday.setDate(yesterday.getDate() - 1);
                      yesterday.setHours(23, 59, 59, 999); // End of yesterday
                      
                      return new Date(item.ts) <= yesterday;
                    })
                    ?.slice()
                    .reverse()
                    .slice(0, 25)
                    .map((item, itemIdx, arr) => {
                      // Convert kWh to LGR (for demonstration, using a simple conversion factor)
                      const lgrAmount = (Number(item.val) * 1).toFixed(2);
                      return (
                        <li key={`${item.ts}-${item.val}`}>
                          <div className="relative pb-8">
                            {itemIdx !== arr.length - 1 && (
                              <span 
                                className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                                aria-hidden="true"
                              />
                            )}
                            <div className="relative flex space-x-3">
                              <div>
                                <span className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center ring-8 ring-white">
                                  <Coins className="h-5 w-5 text-green-600" />
                                </span>
                              </div>
                              <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                <div>
                                  <p className="text-sm text-gray-500">
                                    Received {lgrAmount} LGR (Settled)
                                  </p>
                                </div>
                                <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                  <time dateTime={item.ts}>{item.ts.substring(0, 10)}</time>
                                </div>
                              </div>
                            </div>
                          </div>
                        </li>
                      );
                    })
                  }
                </ul>
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
                         {dailyEnergyData ? `${dailyEnergyData.energyDay} ${dailyEnergyData.energyDayUnit}` : '暂无数据'}
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
                        {connected ? (
                          tokenBalance !== null ? 
                        `${tokenBalance.toFixed(4)} LGR` : 
                       '加载中...'
                        ) : '请连接钱包'}
                        </div>
                      </dd>
                      <dd className="mt-2">
                        <p className="text-md text-gray-700">Solana Balance: {walletBalance !== null ? `${walletBalance} SOL` : 'Loading...'}</p>
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
                                    Received {item.amount} LGR
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
              {/* 移动端汉堡菜单 - 仅移动端显示 */}
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="px-4 inline-flex items-center lg:hidden"
                aria-label="Toggle sidebar"
              >
                {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>

              {/* Logo - 始终显示 */}
              <div className="flex-shrink-0 flex items-center">
                <img src="/logo.png" alt="Logo" className="h-8 w-8 mr-2" />
                <span className="ml-2 text-xl font-bold text-gray-900 hidden sm:inline">Little Green Ranger</span>
                <span className="ml-2 text-xl font-bold text-gray-900 sm:hidden">LGR</span>
              </div>

              {/* 桌面导航 - 仅PC端显示 */}
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

            {/* 钱包连接按钮 */}
            <div className="flex items-center">
              <button
                onClick={connected ? disconnectWallet : connectWallet}
                className="inline-flex items-center px-3 sm:px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Wallet className="mr-1 sm:mr-2 h-4 w-4" />
                {connected ? 
                  <span className="truncate max-w-[80px] sm:max-w-none">{walletAddress.slice(0, 4) + "..." + walletAddress.slice(-4)}</span> 
                  : <span>
                    <span className="hidden sm:inline">Connect Wallet</span>
                    <span className="sm:hidden">Connect</span>
                  </span>
                }
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 移动端遮罩层 */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        ></div>
      )}

      {/* 移动端侧边栏 */}
      <div className={`lg:hidden fixed inset-y-0 left-0 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-40 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col">
          {/* 侧边栏头部 */}
          <div className="p-4 flex justify-between items-center border-b">
            <span className="font-medium">Menu</span>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Close sidebar"
            >
              <X size={24} />
            </button>
          </div>

          {/* 导航项 */}
          <nav className="flex-1 px-2 py-4 space-y-1">
            <button
              onClick={() => {
                setActiveTab('overview');
                setIsSidebarOpen(false);
              }}
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
              onClick={() => {
                setActiveTab('token-management');
                setIsSidebarOpen(false);
              }}
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
              onClick={() => {
                setActiveTab('settings');
                setIsSidebarOpen(false);
              }}
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

      {/* Main Content */}
      <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
        <div className="py-6 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
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
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 md:flex md:items-center md:justify-between lg:px-8">
          <div className="flex justify-center space-x-6 md:order-2">
            <a href="#" className="text-gray-400 hover:text-gray-500">
              <span className="sr-only">Help Center</span>
              <HelpCircle className="h-6 w-6" />
            </a>
            <a href="#" className="text-gray-400 hover:text-gray-500">
              <span className="sr-only">GitHub</span>
              {/* <Github className="h-6 w-6" /> */}
            </a>
            <a href="#" className="text-gray-400 hover:text-gray-500">
              <span className="sr-only">Twitter</span>
              {/* <Twitter className="h-6 w-6" /> */}
            </a>
          </div>
          <div className="mt-8 md:mt-0 md:order-1">
            <p className="text-center text-sm text-gray-400">
              &copy; 2025 Little Green Ranger Project. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Burn Modal */}
      {showBurnModal && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setShowBurnModal(false)}></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
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
                      By burning your LGR tokens, you are contributing to real-world carbon reduction projects. Each token equals approximately 0.05 tons of carbon emissions reduction.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-6">
                <label htmlFor="burn-amount" className="block text-sm font-medium text-gray-700">
                  Amount to Burn
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    type="number"
                    name="burn-amount"
                    id="burn-amount"
                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-3 pr-12 sm:text-sm border-gray-300 rounded-md"
                    placeholder="0.00"
                    aria-describedby="burn-amount-currency"
                    value={burnAmount}
                    onChange={(e) => setBurnAmount(e.target.value)}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm" id="burn-amount-currency">
                      LGR
                    </span>
                  </div>
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  Current Balance: {tokenBalance ? `${tokenBalance.toFixed(4)} LGR` : '0.0000 LGR'}
                </div>
                <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:col-start-2 sm:text-sm"
                    onClick={handleBurnTokens}
                  >
                    Burn Tokens
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                    onClick={() => setShowBurnModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Wallet Modal */}
      {/* <WalletMultiButton /> */}
      {/* <WalletModal /> */}


    </div>
  );
}

export default App;