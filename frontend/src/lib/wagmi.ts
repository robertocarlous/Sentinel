import { http, createConfig } from 'wagmi'
import { mainnet, sepolia, arbitrum, optimism, base } from 'wagmi/chains'
import { injected, walletConnect, coinbaseWallet } from 'wagmi/connectors'

// Somnia chain configuration (you can customize this)
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
      http: ['https://testnet.somnia.network/rpc'], // Replace with actual RPC URL
    },
    public: {
      http: ['https://testnet.somnia.network/rpc'],
    },
  },
  blockExplorers: {
    default: { name: 'SomniaExplorer', url: 'https://testnet-explorer.somnia.network' },
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

