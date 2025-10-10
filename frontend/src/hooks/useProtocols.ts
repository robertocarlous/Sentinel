import { useReadContract } from 'wagmi';
import { CONTRACTS } from '@/abi';

/**
 * Hook to interact with lending pool contracts
 */
export function useLendingPool(
  poolAddress: `0x${string}`,
  userAddress?: `0x${string}`
) {
  // Read user balance
  const { data: balance, refetch: refetchBalance } = useReadContract({
    ...CONTRACTS.SimpleLendingPool,
    address: poolAddress,
    functionName: 'getBalance',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress,
    },
  });

  // Read TVL
  const { data: tvl, refetch: refetchTVL } = useReadContract({
    ...CONTRACTS.SimpleLendingPool,
    address: poolAddress,
    functionName: 'getTVL',
  });

  // Read health score
  const { data: healthScore, refetch: refetchHealth } = useReadContract({
    ...CONTRACTS.SimpleLendingPool,
    address: poolAddress,
    functionName: 'getHealthScore',
  });

  // Read user info
  const { data: userInfo, refetch: refetchUserInfo } = useReadContract({
    ...CONTRACTS.SimpleLendingPool,
    address: poolAddress,
    functionName: 'getUserInfo',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress,
    },
  });

  const refetchAll = () => {
    refetchBalance();
    refetchTVL();
    refetchHealth();
    refetchUserInfo();
  };

  return {
    balance: balance as bigint | undefined,
    tvl: tvl as bigint | undefined,
    healthScore: healthScore as number | undefined,
    userInfo: userInfo as [bigint, bigint, bigint] | undefined,
    refetchAll,
  };
}

/**
 * Hook to interact with swap pool contracts
 */
export function useSwapPool(
  poolAddress: `0x${string}`,
  userAddress?: `0x${string}`
) {
  // Read user balance (LP tokens value)
  const { data: balance, refetch: refetchBalance } = useReadContract({
    ...CONTRACTS.SimpleSwapPool,
    address: poolAddress,
    functionName: 'getBalance',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress,
    },
  });

  // Read reserves
  const { data: reserves, refetch: refetchReserves } = useReadContract({
    ...CONTRACTS.SimpleSwapPool,
    address: poolAddress,
    functionName: 'getReserves',
  });

  // Read price
  const { data: price, refetch: refetchPrice } = useReadContract({
    ...CONTRACTS.SimpleSwapPool,
    address: poolAddress,
    functionName: 'getPrice',
  });

  // Read TVL
  const { data: tvl, refetch: refetchTVL } = useReadContract({
    ...CONTRACTS.SimpleSwapPool,
    address: poolAddress,
    functionName: 'getTVL',
  });

  // Read health score
  const { data: healthScore, refetch: refetchHealth } = useReadContract({
    ...CONTRACTS.SimpleSwapPool,
    address: poolAddress,
    functionName: 'getHealthScore',
  });

  const refetchAll = () => {
    refetchBalance();
    refetchReserves();
    refetchPrice();
    refetchTVL();
    refetchHealth();
  };

  return {
    balance: balance as bigint | undefined,
    reserves: reserves as [bigint, bigint] | undefined,
    price: price as bigint | undefined,
    tvl: tvl as bigint | undefined,
    healthScore: healthScore as number | undefined,
    refetchAll,
  };
}

