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
  new PhantomWalletAdapter(),
  // new SolflareWalletAdapter(),
  // new TorusWalletAdapter(),
  // 添加更多钱包适配器...
];

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <App />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  </StrictMode>
);
