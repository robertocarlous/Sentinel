import { useReadContract, useWriteContract, useWatchContractEvent } from 'wagmi';
import { CONTRACTS } from '@/abi';
import type { AgentInfo } from '@/types/contracts';
import { useEffect, useState } from 'react';

/**
 * Hook to interact with SentinelVault contract
 */
export function useSentinelVault(userAddress?: `0x${string}`) {
  // Read user balance
  const { data: balance, refetch: refetchBalance } = useReadContract({
    ...CONTRACTS.SentinelVault,
    functionName: 'getUserBalance',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress,
    },
  });

  // Read user agent info
  const { data: agentInfo, refetch: refetchAgentInfo } = useReadContract({
    ...CONTRACTS.SentinelVault,
    functionName: 'getUserAgent',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress,
    },
  }) as { data: AgentInfo | undefined; refetch: () => void };

  // Read total value locked
  const { data: totalValueLocked, refetch: refetchTVL } = useReadContract({
    ...CONTRACTS.SentinelVault,
    functionName: 'getTotalValueLocked',
  });

  // Write functions
  const { writeContract, isPending, isSuccess, error } = useWriteContract();

  // Deposit tokens
  const deposit = async (amount: bigint) => {
    return writeContract({
      ...CONTRACTS.SentinelVault,
      functionName: 'deposit',
      args: [amount],
    });
  };

  // Withdraw tokens
  const withdraw = async (amount: bigint) => {
    return writeContract({
      ...CONTRACTS.SentinelVault,
      functionName: 'withdraw',
      args: [amount],
    });
  };

  // Withdraw all tokens
  const withdrawAll = async () => {
    return writeContract({
      ...CONTRACTS.SentinelVault,
      functionName: 'withdrawAll',
    });
  };

  // Authorize agent
  const authorizeAgent = async (
    agentAddress: `0x${string}`,
    riskTolerance: number
  ) => {
    return writeContract({
      ...CONTRACTS.SentinelVault,
      functionName: 'authorizeAgent',
      args: [agentAddress, riskTolerance],
    });
  };

  // Revoke agent
  const revokeAgent = async () => {
    return writeContract({
      ...CONTRACTS.SentinelVault,
      functionName: 'revokeAgent',
    });
  };

  // Pause agent
  const pauseAgent = async () => {
    return writeContract({
      ...CONTRACTS.SentinelVault,
      functionName: 'pauseAgent',
    });
  };

  // Resume agent
  const resumeAgent = async () => {
    return writeContract({
      ...CONTRACTS.SentinelVault,
      functionName: 'resumeAgent',
    });
  };

  // Update risk tolerance
  const updateRiskTolerance = async (newTolerance: number) => {
    return writeContract({
      ...CONTRACTS.SentinelVault,
      functionName: 'updateRiskTolerance',
      args: [newTolerance],
    });
  };

  // Watch for deposit events
  const [recentDeposits, setRecentDeposits] = useState<any[]>([]);
  useWatchContractEvent({
    ...CONTRACTS.SentinelVault,
    eventName: 'Deposit',
    onLogs: (logs) => {
      setRecentDeposits((prev) => [...logs, ...prev].slice(0, 10));
      refetchBalance();
      refetchTVL();
    },
  });

  // Watch for withdrawal events
  const [recentWithdrawals, setRecentWithdrawals] = useState<any[]>([]);
  useWatchContractEvent({
    ...CONTRACTS.SentinelVault,
    eventName: 'Withdrawal',
    onLogs: (logs) => {
      setRecentWithdrawals((prev) => [...logs, ...prev].slice(0, 10));
      refetchBalance();
      refetchTVL();
    },
  });

  // Watch for emergency withdrawal events
  const [emergencyWithdrawals, setEmergencyWithdrawals] = useState<any[]>([]);
  useWatchContractEvent({
    ...CONTRACTS.SentinelVault,
    eventName: 'EmergencyWithdrawal',
    onLogs: (logs) => {
      setEmergencyWithdrawals((prev) => [...logs, ...prev].slice(0, 10));
      refetchBalance();
    },
  });

  // Watch for agent authorization events
  useWatchContractEvent({
    ...CONTRACTS.SentinelVault,
    eventName: 'AgentAuthorized',
    onLogs: () => {
      refetchAgentInfo();
    },
  });

  // Refetch all data
  const refetchAll = () => {
    refetchBalance();
    refetchAgentInfo();
    refetchTVL();
  };

  // Auto-refetch on success
  useEffect(() => {
    if (isSuccess) {
      refetchAll();
    }
  }, [isSuccess]);

  return {
    // Data
    balance: balance as bigint | undefined,
    agentInfo,
    totalValueLocked: totalValueLocked as bigint | undefined,
    recentDeposits,
    recentWithdrawals,
    emergencyWithdrawals,

    // Actions
    deposit,
    withdraw,
    withdrawAll,
    authorizeAgent,
    revokeAgent,
    pauseAgent,
    resumeAgent,
    updateRiskTolerance,

    // State
    isPending,
    isSuccess,
    error,

    // Refetch
    refetchAll,
    refetchBalance,
    refetchAgentInfo,
    refetchTVL,
  };
}

