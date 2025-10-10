import { http, createConfig } from 'wagmi'
import { mainnet, sepolia, arbitrum, optimism, base } from 'wagmi/chains'
import { injected, walletConnect, coinbaseWallet } from 'wagmi/connectors'

// Somnia Shannon Testnet configuration
const somniaTestnet = {
  id: 50312, 
  name: 'Somnia Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'STT',
    symbol: 'STT',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.ankr.com/somnia_testnet'], // Ankr RPC with CORS support
    },
    public: {
      http: ['https://rpc.ankr.com/somnia_testnet'],
    },
  },
  blockExplorers: {
    default: { name: 'Somnia Explorer', url: 'https://explorer.somnia.network' },
  },
  testnet: true,
} as const

export const config = createConfig({
  chains: [somniaTestnet, mainnet, sepolia, arbitrum, optimism, base],
  connectors: [
    injected(),
    walletConnect({ 
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo-project-id' 
    }),
    coinbaseWallet({ appName: 'Sentinel DeFi Protection' }),
  ],
  transports: {
    [somniaTestnet.id]: http(),
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
    [base.id]: http(),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}

