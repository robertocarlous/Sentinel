'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useSentinelVault } from '@/hooks';
import { CONTRACT_ADDRESSES } from '@/abi';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  RiskTolerance,
  RiskToleranceLabels,
  RiskToleranceDescriptions,
  formatRiskTolerance,
} from '@/types/contracts';

export function AgentControl() {
  const { address } = useAccount();
  const {
    agentInfo,
    authorizeAgent,
    revokeAgent,
    pauseAgent,
    resumeAgent,
    updateRiskTolerance,
    isPending,
    refetchAgentInfo,
  } = useSentinelVault(address);

  const [selectedTolerance, setSelectedTolerance] = useState<RiskTolerance>(
    RiskTolerance.MODERATE
  );
  const [showSetup, setShowSetup] = useState(false);

  const isAgentActive = agentInfo?.isAuthorized && !agentInfo?.isPaused;

  const handleAuthorize = async () => {
    try {
      await authorizeAgent(CONTRACT_ADDRESSES.SentinelAgent, selectedTolerance);
      setShowSetup(false);
      refetchAgentInfo();
    } catch (error) {
      console.error('Failed to authorize agent:', error);
    }
  };

  const handleRevoke = async () => {
    try {
      await revokeAgent();
      refetchAgentInfo();
    } catch (error) {
      console.error('Failed to revoke agent:', error);
    }
  };

  const handlePause = async () => {
    try {
      await pauseAgent();
      refetchAgentInfo();
    } catch (error) {
      console.error('Failed to pause agent:', error);
    }
  };

  const handleResume = async () => {
    try {
      await resumeAgent();
      refetchAgentInfo();
    } catch (error) {
      console.error('Failed to resume agent:', error);
    }
  };

  const handleUpdateTolerance = async () => {
    try {
      await updateRiskTolerance(selectedTolerance);
      refetchAgentInfo();
    } catch (error) {
      console.error('Failed to update risk tolerance:', error);
    }
  };

  if (!address) {
    return (
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">AI Agent Protection</h2>
        <p className="text-muted-foreground">Connect your wallet to enable AI protection</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">AI Agent Protection</h2>
        {agentInfo?.isAuthorized && (
          <Badge variant={isAgentActive ? 'default' : 'secondary'}>
            {isAgentActive ? '✓ Active' : 'Paused'}
          </Badge>
        )}
      </div>

      {!agentInfo?.isAuthorized || showSetup ? (
        /* Setup Mode */
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Select Risk Tolerance</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Choose when the AI agent should protect your funds
            </p>

            <div className="space-y-3">
              {Object.entries(RiskToleranceLabels).map(([value, label]) => {
                const numValue = Number(value);
                return (
                  <button
                    key={value}
                    onClick={() => setSelectedTolerance(numValue as RiskTolerance)}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                      selectedTolerance === numValue
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold">{label}</span>
                      <Badge variant="outline">{value}%</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {RiskToleranceDescriptions[numValue as RiskTolerance]}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleAuthorize}
              disabled={isPending}
              className="flex-1"
            >
              {isPending ? 'Enabling...' : 'Enable Protection'}
            </Button>
            {showSetup && (
              <Button
                onClick={() => setShowSetup(false)}
                variant="outline"
                disabled={isPending}
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
      ) : (
        /* Control Mode */
        <div className="space-y-6">
          {/* Current Settings */}
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Risk Tolerance</p>
                <p className="text-lg font-semibold">
                  {formatRiskTolerance(agentInfo.riskTolerance)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Status</p>
                <p className="text-lg font-semibold">
                  {isAgentActive ? 'Monitoring' : 'Paused'}
                </p>
              </div>
            </div>
          </div>

          {/* Protection Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <span>Agent will protect your funds when risk ≥ {agentInfo.riskTolerance}%</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span>Monitoring all whitelisted protocols 24/7</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
              <span>Emergency withdrawals executed automatically</span>
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-2">
            {agentInfo.isPaused ? (
              <Button
                onClick={handleResume}
                disabled={isPending}
                className="w-full"
              >
                {isPending ? 'Resuming...' : 'Resume Protection'}
              </Button>
            ) : (
              <Button
                onClick={handlePause}
                disabled={isPending}
                variant="outline"
                className="w-full"
              >
                {isPending ? 'Pausing...' : 'Pause Protection'}
              </Button>
            )}

            <Button
              onClick={() => setShowSetup(true)}
              variant="outline"
              disabled={isPending}
              className="w-full"
            >
              Change Risk Tolerance
            </Button>

            <Button
              onClick={handleRevoke}
              disabled={isPending}
              variant="destructive"
              className="w-full"
            >
              {isPending ? 'Revoking...' : 'Revoke Agent Access'}
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

