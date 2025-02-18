import React, { useState } from 'react';
import { 
  Sun, 
  Wallet, 
  Settings, 
  BarChart3, 
  Coins,
  ChevronDown,
  HelpCircle,
  Menu,
  X
} from 'lucide-react';

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
  { date: '2025-02-05', amount: 200 },
  { date: '2025-02-04', amount: 180 },
  { date: '2025-02-03', amount: 190 },
];

const mockBurnHistory = [
  { date: '2025-02-04', amount: -50 },
  { date: '2025-02-03', amount: -30 },
];

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [selectedLoggerId, setSelectedLoggerId] = useState('logger-1');

  const toggleWallet = () => {
    setIsWalletConnected(!isWalletConnected);
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
                <span className="ml-2 text-xl font-bold text-gray-900">Solar Dashboard</span>
              </div>
              <div className="hidden lg:ml-6 lg:flex lg:space-x-8">
                <a className="border-indigo-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Generation Data
                </a>
                <a className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  <Coins className="mr-2 h-4 w-4" />
                  Token Management
                </a>
                <a className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </a>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={toggleWallet}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Wallet className="mr-2 h-4 w-4" />
                {isWalletConnected ? "8fE2...19Aa" : "Connect Wallet"}
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
              <a className="bg-gray-100 text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md">
                <BarChart3 className="mr-3 h-6 w-6 text-gray-500" />
                Overview
              </a>
              <a className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md">
                <Settings className="mr-3 h-6 w-6 text-gray-400" />
                Logger Management
              </a>
              <a className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md">
                <Coins className="mr-3 h-6 w-6 text-gray-400" />
                Token Management
              </a>
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3">
                  <div className="text-sm">
                    <button
                      className="text-indigo-700 hover:text-indigo-900"
                      onClick={() => alert('Token burn feature coming soon')}
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
          </div>
        </div>
      </main>

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
              &copy; 2025 Solar Dashboard. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;