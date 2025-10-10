import { RiskOracleABI } from './RiskOracle';
import { SentinelAgentABI } from './SentinelAgent';
import { SentinelVaultABI } from './SentinelVault';
import { SimpleLendingPoolABI } from './SimpleLendingPool';
import { SimpleSwapPoolABI } from './SimpleSwapPool';
import { DemoTokenABI } from './DemoToken';

// Contract Addresses on Somnia Testnet
export const CONTRACT_ADDRESSES = {
  RiskOracle: '0x659815010A215710e86e479078fb6F882874A2A6' as `0x${string}`,
  SentinelAgent: '0x04aB79FF815C1F7a001b811B07FED03E7E0a5620' as `0x${string}`,
  SentinelVault: '0x188b09f31854e8FBE2448250b41875DDEA0421B7' as `0x${string}`,
  SimpleLendingPool: '0x94b07B6ec0c5DBad7072D642D27440F552Da5aED' as `0x${string}`,
  SimpleSwapPool: '0xcbC2B1cc4b44D536f4022f6e2E222A814C8B97F0' as `0x${string}`,
  // Demo Token (used by vault for testing)
  DemoToken: '0x922C1Dd2973c6322529c6C7C66d4Abb2cbBef1dE' as `0x${string}`,
  DemoTokenB: '0x1D328AE8acc7539C59D468B6e820c675BF45E61F' as `0x${string}`,
} as const;

// Network Configuration
export const NETWORK_CONFIG = {
  chainId: 50312, // Somnia Testnet chain ID
  chainName: 'Somnia Testnet',
  rpcUrl: 'https://rpc.ankr.com/somnia_testnet', // Ankr RPC with CORS support
  blockExplorer: 'https://explorer.somnia.network',
} as const;

// Export all ABIs
export { 
  RiskOracleABI, 
  SentinelAgentABI, 
  SentinelVaultABI, 
  SimpleLendingPoolABI, 
  SimpleSwapPoolABI,
  DemoTokenABI,
};

// Export contract configurations for easy import
export const CONTRACTS = {
  RiskOracle: {
    address: CONTRACT_ADDRESSES.RiskOracle,
    abi: RiskOracleABI,
  },
  SentinelAgent: {
    address: CONTRACT_ADDRESSES.SentinelAgent,
    abi: SentinelAgentABI,
  },
  SentinelVault: {
    address: CONTRACT_ADDRESSES.SentinelVault,
    abi: SentinelVaultABI,
  },
  SimpleLendingPool: {
    address: CONTRACT_ADDRESSES.SimpleLendingPool,
    abi: SimpleLendingPoolABI,
  },
  SimpleSwapPool: {
    address: CONTRACT_ADDRESSES.SimpleSwapPool,
    abi: SimpleSwapPoolABI,
  },
  DemoToken: {
    address: CONTRACT_ADDRESSES.DemoToken,
    abi: DemoTokenABI,
  },
  DemoTokenB: {
    address: CONTRACT_ADDRESSES.DemoTokenB,
    abi: DemoTokenABI,
  },
} as const;

// Token Configuration
export const TOKEN_CONFIG = {
  // This is the token used by SentinelVault
  VAULT_TOKEN: {
    address: CONTRACT_ADDRESSES.DemoToken,
    symbol: 'DMT',
    name: 'DemoToken',
    decimals: 18,
  },
  // For production, replace with actual USDC or desired stablecoin
  // USDC: {
  //   address: '0x...',
  //   symbol: 'USDC',
  //   name: 'USD Coin',
  //   decimals: 6,
  // },
} as const;

// Type exports for TypeScript
export type ContractName = keyof typeof CONTRACT_ADDRESSES;
export type ContractConfig = {
  address: `0x${string}`;
  abi: readonly any[];
};

