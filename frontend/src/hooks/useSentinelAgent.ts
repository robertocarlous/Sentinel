import { useReadContract, useWatchContractEvent } from 'wagmi';
import { CONTRACTS } from '@/abi';
import type { ProtectionAction, AgentConfig } from '@/types/contracts';
import { useState } from 'react';

/**
 * Hook to interact with SentinelAgent contract
 */
export function useSentinelAgent(userAddress?: `0x${string}`) {
  // Read protection history
  const { data: protectionHistory, refetch: refetchHistory } = useReadContract({
    ...CONTRACTS.SentinelAgent,
    functionName: 'getProtectionHistory',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress,
    },
  }) as { data: ProtectionAction[] | undefined; refetch: () => void };

  // Read total value protected
  const { data: totalValueProtected, refetch: refetchTotalProtected } =
    useReadContract({
      ...CONTRACTS.SentinelAgent,
      functionName: 'getTotalValueProtected',
    });

  // Read agent status
  const { data: agentStatus, refetch: refetchAgentStatus } = useReadContract({
    ...CONTRACTS.SentinelAgent,
    functionName: 'getAgentStatus',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress,
    },
  }) as { data: AgentConfig | undefined; refetch: () => void };

  // Watch for protection executed events
  const [protectionEvents, setProtectionEvents] = useState<any[]>([]);
  useWatchContractEvent({
    ...CONTRACTS.SentinelAgent,
    eventName: 'ProtectionExecuted',
    onLogs: (logs) => {
      setProtectionEvents((prev) => [...logs, ...prev].slice(0, 20));
      refetchHistory();
      refetchTotalProtected();
    },
  });

  // Watch for protection failed events
  const [failedProtections, setFailedProtections] = useState<any[]>([]);
  useWatchContractEvent({
    ...CONTRACTS.SentinelAgent,
    eventName: 'ProtectionFailed',
    onLogs: (logs) => {
      setFailedProtections((prev) => [...logs, ...prev].slice(0, 10));
    },
  });

  const refetchAll = () => {
    refetchHistory();
    refetchTotalProtected();
    refetchAgentStatus();
  };

  return {
    // Data
    protectionHistory,
    totalValueProtected: totalValueProtected as bigint | undefined,
    agentStatus,
    protectionEvents,
    failedProtections,

    // Refetch
    refetchAll,
    refetchHistory,
    refetchTotalProtected,
    refetchAgentStatus,
  };
}

