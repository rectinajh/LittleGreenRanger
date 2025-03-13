import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      globals: {
        process: true,
        Buffer: true,
      },
      protocolImports: true,
    }),
  ],
  resolve: {
    alias: {
      process: 'process/browser',
      stream: 'stream-browserify',
      zlib: 'browserify-zlib',
      util: 'util',
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: [
      '@solana/web3.js',
      'buffer-layout',
      'bn.js',
      '@solana/spl-token',
      'react-error-boundary',
      'react',
      'react-dom',
    ],
    esbuildOptions: {
      target: 'esnext',
    },
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      plugins: [],
    },
  },
  define: {
    'process.env': {},
    global: {},
  },
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api': {
        target: 'https://api.valueclouds.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});

