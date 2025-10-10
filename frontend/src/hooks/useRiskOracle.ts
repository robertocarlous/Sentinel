import { useReadContract, useWatchContractEvent } from 'wagmi';
import { CONTRACTS } from '@/abi';
import type { ProtocolMetrics, RiskSnapshot } from '@/types/contracts';
import { useState } from 'react';

/**
 * Hook to interact with RiskOracle contract
 */
export function useRiskOracle(protocolAddress?: `0x${string}`) {
  // Read risk score
  const { data: riskScore, refetch: refetchRiskScore } = useReadContract({
    ...CONTRACTS.RiskOracle,
    functionName: 'getRiskScore',
    args: protocolAddress ? [protocolAddress] : undefined,
    query: {
      enabled: !!protocolAddress,
      refetchInterval: 10000, // Refetch every 10 seconds
    },
  });

  // Read protocol metrics
  const { data: metrics, refetch: refetchMetrics } = useReadContract({
    ...CONTRACTS.RiskOracle,
    functionName: 'getProtocolMetrics',
    args: protocolAddress ? [protocolAddress] : undefined,
    query: {
      enabled: !!protocolAddress,
      refetchInterval: 15000, // Refetch every 15 seconds
    },
  }) as { data: ProtocolMetrics | undefined; refetch: () => void };

  // Read latest snapshot
  const { data: latestSnapshot, refetch: refetchSnapshot } = useReadContract({
    ...CONTRACTS.RiskOracle,
    functionName: 'getLatestSnapshot',
    args: protocolAddress ? [protocolAddress] : undefined,
    query: {
      enabled: !!protocolAddress,
    },
  }) as { data: RiskSnapshot | undefined; refetch: () => void };

  // Watch for risk score updates
  const [riskUpdates, setRiskUpdates] = useState<any[]>([]);
  useWatchContractEvent({
    ...CONTRACTS.RiskOracle,
    eventName: 'RiskScoreUpdated',
    onLogs: (logs) => {
      setRiskUpdates((prev) => [...logs, ...prev].slice(0, 20));
      refetchRiskScore();
      refetchSnapshot();
    },
  });

  // Watch for metrics updates
  const [metricsUpdates, setMetricsUpdates] = useState<any[]>([]);
  useWatchContractEvent({
    ...CONTRACTS.RiskOracle,
    eventName: 'MetricsUpdated',
    onLogs: (logs) => {
      setMetricsUpdates((prev) => [...logs, ...prev].slice(0, 20));
      refetchMetrics();
    },
  });

  const refetchAll = () => {
    refetchRiskScore();
    refetchMetrics();
    refetchSnapshot();
  };

  return {
    // Data
    riskScore: riskScore as number | undefined,
    metrics,
    latestSnapshot,
    riskUpdates,
    metricsUpdates,

    // Refetch
    refetchAll,
    refetchRiskScore,
    refetchMetrics,
    refetchSnapshot,
  };
}

/**
 * Hook to monitor multiple protocols
 */
export function useMultiProtocolRisk(protocolAddresses: `0x${string}`[]) {
  const protocols = protocolAddresses.map((address) => ({
    address,
    ...useRiskOracle(address),
  }));

  return {
    protocols,
    refetchAll: () => protocols.forEach((p) => p.refetchAll()),
  };
}

