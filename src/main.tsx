import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Buffer } from 'buffer';
window.Buffer = Buffer;

import App from './App.tsx';
import './index.css';

// 添加Solana钱包适配器相关导入
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
// 导入钱包适配器样式
import '@solana/wallet-adapter-react-ui/styles.css';

const network = WalletAdapterNetwork.Devnet; // 或者使用 Devnet
const endpoint = clusterApiUrl(network);

// 配置支持的钱包
const wallets = [
  new PhantomWalletAdapter({ network }),
  // new SolflareWalletAdapter(),
  // new TorusWalletAdapter(),
  // 添加更多钱包适配器...
];

// 创建事件监听器，用于处理钱包连接问题
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    // 在页面完全加载后，强制刷新服务工作线程
    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SKIP_WAITING'
      });
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={false}>
        <WalletModalProvider>
          <App />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  </StrictMode>
);
