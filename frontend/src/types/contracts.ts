// Type definitions for Sentinel Protocol contracts

export interface AgentInfo {
  agentAddress: `0x${string}`;
  isAuthorized: boolean;
  isPaused: boolean;
  riskTolerance: number;
  authorizedAt: bigint;
}

export interface ProtocolMetrics {
  currentTVL: bigint;
  previousTVL: bigint;
  transactionCount: bigint;
  lastUpdateTime: bigint;
  healthScore: number;
}

export interface RiskSnapshot {
  timestamp: bigint;
  riskScore: number;
  tvlChange: bigint;
  transactionAnomaly: bigint;
  volatility: bigint;
  reason: string;
}

export interface ProtectionAction {
  user: `0x${string}`;
  protocol: `0x${string}`;
  amount: bigint;
  riskScore: number;
  timestamp: bigint;
  reason: string;
  txHash: `0x${string}`;
}

export interface AgentConfig {
  vaultAddress: `0x${string}`;
  riskOracleAddress: `0x${string}`;
  monitoredProtocols: `0x${string}`[];
  checkInterval: bigint;
  isActive: boolean;
}

export interface Position {
  protocol: `0x${string}`;
  amount: bigint;
  deployedAt: bigint;
  isActive: boolean;
}

// Risk Tolerance Levels
export enum RiskTolerance {
  CONSERVATIVE = 60,
  MODERATE = 75,
  AGGRESSIVE = 90,
}

export const RiskToleranceLabels = {
  [RiskTolerance.CONSERVATIVE]: 'Conservative',
  [RiskTolerance.MODERATE]: 'Moderate',
  [RiskTolerance.AGGRESSIVE]: 'Aggressive',
} as const;

export const RiskToleranceDescriptions = {
  [RiskTolerance.CONSERVATIVE]: 'Protect my funds at the first sign of risk (60%)',
  [RiskTolerance.MODERATE]: 'Balance between protection and yield (75%)',
  [RiskTolerance.AGGRESSIVE]: 'Maximize yield, protect only on severe threats (90%)',
} as const;

// Risk Score Color Coding
export const getRiskColor = (score: number): string => {
  if (score >= 80) return 'red';
  if (score >= 60) return 'yellow';
  return 'green';
};

export const getRiskLabel = (score: number): string => {
  if (score >= 80) return 'Critical';
  if (score >= 60) return 'High';
  if (score >= 40) return 'Medium';
  return 'Low';
};

// Health Score Color Coding
export const getHealthColor = (score: number): string => {
  if (score >= 80) return 'green';
  if (score >= 50) return 'yellow';
  return 'red';
};

export const getHealthLabel = (score: number): string => {
  if (score >= 80) return 'Healthy';
  if (score >= 50) return 'Warning';
  return 'Critical';
};

// Protocol Info
export interface ProtocolInfo {
  address: `0x${string}`;
  name: string;
  type: 'lending' | 'swap' | 'other';
  description: string;
}

export const MONITORED_PROTOCOLS: ProtocolInfo[] = [
  {
    address: '0x94b07B6ec0c5DBad7072D642D27440F552Da5aED',
    name: 'Simple Lending Pool',
    type: 'lending',
    description: 'Demo lending protocol for testing',
  },
  {
    address: '0xcbC2B1cc4b44D536f4022f6e2E222A814C8B97F0',
    name: 'Simple Swap Pool',
    type: 'swap',
    description: 'Demo DEX pool for testing',
  },
] as const;

// Format helpers
export const formatRiskTolerance = (tolerance: number): string => {
  return RiskToleranceLabels[tolerance as RiskTolerance] || `Custom (${tolerance}%)`;
};

export const formatTimestamp = (timestamp: bigint): string => {
  return new Date(Number(timestamp) * 1000).toLocaleString();
};

export const formatAmount = (amount: bigint, decimals: number = 18): string => {
  const value = Number(amount) / Math.pow(10, decimals);
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  });
};

