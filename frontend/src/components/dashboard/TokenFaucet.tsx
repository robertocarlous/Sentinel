'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useReadContract } from 'wagmi';
import { parseUnits } from 'viem';
import { CONTRACT_ADDRESSES, DemoTokenABI } from '@/abi';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatAmount } from '@/types/contracts';

/**
 * TokenFaucet Component
 * Allows users to claim free test DMT tokens
 */
export function TokenFaucet() {
  const { address } = useAccount();
  const { writeContract, isPending, isSuccess, error: txError } = useWriteContract();
  const [claimAmount, setClaimAmount] = useState('1000');
  const [errorMsg, setErrorMsg] = useState('');

  // Read user's DMT balance
  const { data: dmtBalance, refetch: refetchBalance } = useReadContract({
    address: CONTRACT_ADDRESSES.DemoToken,
    abi: DemoTokenABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  const handleClaim = async () => {
    if (!claimAmount) return;
    
    setErrorMsg(''); // Clear previous errors

    try {
      console.log('Claiming:', claimAmount, 'DMT');
      console.log('DemoToken address:', CONTRACT_ADDRESSES.DemoToken);
      console.log('User address:', address);
      
      const amount = parseUnits(claimAmount, 18);
      console.log('Parsed amount:', amount);
      
      writeContract({
        address: CONTRACT_ADDRESSES.DemoToken,
        abi: DemoTokenABI,
        functionName: 'faucet',
        args: [amount],
      });
    } catch (error: any) {
      console.error('Faucet claim failed:', error);
      setErrorMsg(error?.message || 'Failed to claim tokens');
    }
  };

  // Refetch balance when transaction succeeds
  useEffect(() => {
    if (isSuccess) {
      console.log('✅ Faucet claim successful!');
      setTimeout(() => {
        refetchBalance();
        console.log('Balance refreshed');
      }, 2000);
    }
  }, [isSuccess, refetchBalance]);

  if (!address) {
    return (
      <Card className="p-6 bg-gradient-to-br from-primary/10 to-purple-500/10 border-primary/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
            🚰
          </div>
          <div>
            <h2 className="text-2xl font-bold">Token Faucet</h2>
            <p className="text-sm text-muted-foreground">Get free test tokens</p>
          </div>
        </div>
        <p className="text-muted-foreground">Connect your wallet to claim tokens</p>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/10 to-purple-500/10 border-primary/20">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-2xl">
          🚰
        </div>
        <div>
          <h2 className="text-2xl font-bold">Token Faucet</h2>
          <p className="text-sm text-muted-foreground">Claim free DMT test tokens</p>
        </div>
      </div>

      {/* Current Balance */}
      <div className="bg-background/50 rounded-lg p-4 mb-6">
        <p className="text-sm text-muted-foreground mb-1">Your DMT Balance</p>
        <p className="text-2xl font-bold">
          {dmtBalance ? formatAmount(dmtBalance as bigint) : '0.00'} DMT
        </p>
      </div>

      {/* Claim Interface */}
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">
            Amount to Claim (Max: 1,000,000 DMT)
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="1000"
              value={claimAmount}
              onChange={(e) => setClaimAmount(e.target.value)}
              className="flex-1 px-4 py-2 rounded-lg border border-border bg-background"
              disabled={isPending}
              max="1000000"
            />
            <select
              className="px-4 py-2 rounded-lg border border-border bg-background"
              onChange={(e) => setClaimAmount(e.target.value)}
              disabled={isPending}
            >
              <option value="1000">1,000</option>
              <option value="10000">10,000</option>
              <option value="100000">100,000</option>
              <option value="1000000">1,000,000</option>
            </select>
          </div>
        </div>

        <Button
          onClick={handleClaim}
          disabled={isPending || !claimAmount || Number(claimAmount) <= 0 || Number(claimAmount) > 1000000}
          className="w-full"
          size="lg"
        >
          {isPending ? '⏳ Claiming...' : isSuccess ? '✅ Claimed!' : '🚰 Claim Free DMT Tokens'}
        </Button>

        {/* Success Message */}
        {isSuccess && (
          <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
            <p className="text-sm text-green-600 dark:text-green-400">
              ✅ Successfully claimed {claimAmount} DMT! Tokens will appear in your wallet shortly.
            </p>
          </div>
        )}

        {/* Error Message */}
        {(txError || errorMsg) && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400 font-medium mb-1">
              ❌ Claim Failed
            </p>
            <p className="text-xs text-red-600/80 dark:text-red-400/80">
              {errorMsg || txError?.message || 'Unknown error occurred'}
            </p>
            <p className="text-xs text-red-600/60 dark:text-red-400/60 mt-2">
              💡 Make sure you&apos;re connected to Somnia Testnet and have STT for gas
            </p>
          </div>
        )}

        {/* Pending State */}
        {isPending && (
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-sm text-blue-600 dark:text-blue-400">
              ⏳ Please confirm the transaction in your wallet...
            </p>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <h4 className="font-semibold mb-2 text-blue-600 dark:text-blue-400">
          📌 About DMT Tokens
        </h4>
        <ul className="text-sm space-y-1 text-blue-600/80 dark:text-blue-400/80">
          <li>• DMT is a test token on Somnia Testnet</li>
          <li>• Claim unlimited tokens for free (max 1M per tx)</li>
          <li>• Use DMT to test Sentinel&apos;s protection features</li>
          <li>• In production, this will use real USDC/stablecoins</li>
        </ul>
      </div>

      {/* Contract Info */}
      <div className="mt-4 text-xs text-muted-foreground">
        <p>Token Contract: {CONTRACT_ADDRESSES.DemoToken}</p>
        <p className="mt-1">
          <a 
            href={`https://explorer.somnia.network/address/${CONTRACT_ADDRESSES.DemoToken}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            View on Explorer →
          </a>
        </p>
      </div>
    </Card>
  );
}

