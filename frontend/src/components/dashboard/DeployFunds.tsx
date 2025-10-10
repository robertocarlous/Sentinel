'use client';

import { useState } from 'react';
import { useAccount, useWriteContract } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { useSentinelVault, useRiskOracle } from '@/hooks';
import { CONTRACTS } from '@/abi';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MONITORED_PROTOCOLS, formatAmount, getRiskColor, getRiskLabel } from '@/types/contracts';

/**
 * DeployFunds Component
 * Allows users to deploy funds from vault to DeFi protocols to earn yield
 */
export function DeployFunds() {
  const { address } = useAccount();
  const { balance, refetchBalance } = useSentinelVault(address);
  const { writeContract, isPending } = useWriteContract();

  const [selectedProtocol, setSelectedProtocol] = useState<`0x${string}` | null>(null);
  const [deployAmount, setDeployAmount] = useState('');

  const handleDeploy = async () => {
    if (!selectedProtocol || !deployAmount) return;

    try {
      const amount = parseUnits(deployAmount, 18);
      
      await writeContract({
        ...CONTRACTS.SentinelVault,
        functionName: 'deployToProtocol',
        args: [selectedProtocol, amount],
      });

      setDeployAmount('');
      setSelectedProtocol(null);
      refetchBalance();
    } catch (error) {
      console.error('Deploy failed:', error);
    }
  };

  if (!address) {
    return (
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Deploy to Earn</h2>
        <p className="text-muted-foreground">Connect your wallet to deploy funds</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">Deploy Funds to Earn Yield</h2>

      {/* Available Balance */}
      <div className="bg-muted/50 rounded-lg p-4 mb-6">
        <p className="text-sm text-muted-foreground mb-1">Available in Vault</p>
        <p className="text-2xl font-bold">
          {balance ? formatAmount(balance) : '0.00'} DMT
        </p>
      </div>

      {/* Protocol Selection */}
      <div className="space-y-3 mb-6">
        <h3 className="text-lg font-semibold">Select Protocol</h3>
        
        {MONITORED_PROTOCOLS.map((protocol) => {
          const { riskScore } = useRiskOracle(protocol.address);
          const score = riskScore ?? 0;
          const riskColor = getRiskColor(score);
          const riskLabel = getRiskLabel(score);

          return (
            <button
              key={protocol.address}
              onClick={() => setSelectedProtocol(protocol.address)}
              className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                selectedProtocol === protocol.address
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-semibold">{protocol.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {protocol.description}
                  </p>
                </div>
                <Badge variant="outline" className={`text-${riskColor}-500 border-${riskColor}-500`}>
                  {protocol.type}
                </Badge>
              </div>

              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full bg-${riskColor}-500`}></div>
                  <span className="text-sm">Risk: {score}%</span>
                  <span className={`text-xs text-${riskColor}-500`}>({riskLabel})</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  APY: ~{protocol.type === 'lending' ? '12.4%' : '24.8%'}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Amount Input */}
      {selectedProtocol && (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Amount to Deploy
            </label>
            <input
              type="number"
              placeholder="0.00"
              value={deployAmount}
              onChange={(e) => setDeployAmount(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background"
              disabled={isPending}
            />
            {balance && balance > 0n && (
              <button
                onClick={() => setDeployAmount(formatUnits(balance, 18))}
                className="text-sm text-primary hover:underline mt-1"
              >
                Max: {formatAmount(balance)} DMT
              </button>
            )}
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
            <p className="text-sm text-yellow-600 dark:text-yellow-500">
              ⚠️ <strong>Important:</strong> Deploying funds to DeFi protocols carries risk.
              Your AI agent will monitor and protect these funds based on your risk tolerance.
            </p>
          </div>

          <Button
            onClick={handleDeploy}
            disabled={isPending || !deployAmount || Number(deployAmount) <= 0}
            className="w-full"
          >
            {isPending ? 'Deploying...' : 'Deploy to Protocol'}
          </Button>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <h4 className="font-semibold mb-2 text-blue-600 dark:text-blue-400">
          How It Works
        </h4>
        <ul className="text-sm space-y-1 text-blue-600/80 dark:text-blue-400/80">
          <li>• Funds are deployed from your vault to earn yield</li>
          <li>• AI agent monitors the protocol 24/7</li>
          <li>• If risk exceeds your tolerance, agent withdraws to vault</li>
          <li>• You keep funds safe while earning yield!</li>
        </ul>
      </div>
    </Card>
  );
}

