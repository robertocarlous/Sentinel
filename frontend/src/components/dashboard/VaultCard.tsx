'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { useSentinelVault } from '@/hooks';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatAmount } from '@/types/contracts';

export function VaultCard() {
  const { address } = useAccount();
  const {
    balance,
    totalValueLocked,
    deposit,
    withdraw,
    withdrawAll,
    isPending,
    refetchBalance,
  } = useSentinelVault(address);

  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');

  const handleDeposit = async () => {
    if (!depositAmount) return;
    try {
      const amount = parseUnits(depositAmount, 18);
      await deposit(amount);
      setDepositAmount('');
      refetchBalance();
    } catch (error) {
      console.error('Deposit failed:', error);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount) return;
    try {
      const amount = parseUnits(withdrawAmount, 18);
      await withdraw(amount);
      setWithdrawAmount('');
      refetchBalance();
    } catch (error) {
      console.error('Withdraw failed:', error);
    }
  };

  const handleWithdrawAll = async () => {
    try {
      await withdrawAll();
      setWithdrawAmount('');
      refetchBalance();
    } catch (error) {
      console.error('Withdraw all failed:', error);
    }
  };

  if (!address) {
    return (
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Sentinel Vault</h2>
        <p className="text-muted-foreground">Connect your wallet to access the vault</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">Sentinel Vault</h2>

      {/* Balance Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Your Vault Balance</p>
          <p className="text-2xl font-bold">
            {balance ? formatAmount(balance) : '0.00'} DMT
          </p>
          <p className="text-xs text-muted-foreground mt-1">DemoToken (Test Token)</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Value Locked</p>
          <p className="text-2xl font-bold">
            {totalValueLocked ? formatAmount(totalValueLocked) : '0.00'} DMT
          </p>
          <p className="text-xs text-muted-foreground mt-1">All users combined</p>
        </div>
      </div>

      {/* Deposit Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Deposit</h3>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Amount"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            className="flex-1 px-4 py-2 rounded-lg border border-border bg-background"
            disabled={isPending}
          />
          <Button onClick={handleDeposit} disabled={isPending || !depositAmount}>
            {isPending ? 'Processing...' : 'Deposit'}
          </Button>
        </div>
      </div>

      {/* Withdraw Section */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Withdraw</h3>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Amount"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            className="flex-1 px-4 py-2 rounded-lg border border-border bg-background"
            disabled={isPending}
          />
          <Button onClick={handleWithdraw} disabled={isPending || !withdrawAmount}>
            {isPending ? 'Processing...' : 'Withdraw'}
          </Button>
          <Button
            onClick={handleWithdrawAll}
            disabled={isPending || !balance || balance === 0n}
            variant="outline"
          >
            Withdraw All
          </Button>
        </div>
      </div>

      {/* Info and Balance */}
      {balance && balance > 0n && (
        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-sm text-blue-600 dark:text-blue-400">
            💡 <strong>Next step:</strong> Deploy your {formatAmount(balance)} DMT to a protocol to earn yield!
            Your AI agent will protect it.
          </p>
        </div>
      )}
      
      {(!balance || balance === 0n) && (
        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            ℹ️ Deposit DMT tokens to get started. The vault is your safe storage before deploying to DeFi protocols.
          </p>
        </div>
      )}
    </Card>
  );
}

