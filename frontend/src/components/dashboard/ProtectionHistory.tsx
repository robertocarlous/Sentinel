'use client';

import { useAccount } from 'wagmi';
import { useSentinelAgent } from '@/hooks';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatAmount, formatTimestamp, MONITORED_PROTOCOLS } from '@/types/contracts';

export function ProtectionHistory() {
  const { address } = useAccount();
  const { protectionHistory, totalValueProtected, protectionEvents } =
    useSentinelAgent(address);

  const getProtocolName = (address: `0x${string}`) => {
    const protocol = MONITORED_PROTOCOLS.find(
      (p) => p.address.toLowerCase() === address.toLowerCase()
    );
    return protocol?.name || 'Unknown Protocol';
  };

  if (!address) {
    return (
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Protection History</h2>
        <p className="text-muted-foreground">
          Connect your wallet to view protection history
        </p>
      </Card>
    );
  }

  const totalProtected = totalValueProtected ?? 0n;
  const hasHistory = protectionHistory && protectionHistory.length > 0;

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Protection History</h2>
        <Badge variant="outline" className="text-green-500 border-green-500">
          ${formatAmount(totalProtected)} Protected
        </Badge>
      </div>

      {!hasHistory ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">No Protections Yet</h3>
          <p className="text-sm text-muted-foreground">
            Your AI agent is monitoring. Protection events will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {protectionHistory.map((action, index) => (
            <div
              key={index}
              className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-lg">
                    Emergency Withdrawal
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {getProtocolName(action.protocol)}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="text-red-500 border-red-500"
                >
                  Risk: {action.riskScore}%
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Amount Protected
                  </p>
                  <p className="text-lg font-bold text-green-500">
                    ${formatAmount(action.amount)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Time</p>
                  <p className="text-sm">
                    {formatTimestamp(action.timestamp)}
                  </p>
                </div>
              </div>

              {/* Reason */}
              <div className="p-3 bg-muted/50 rounded">
                <p className="text-xs text-muted-foreground mb-1">Reason</p>
                <p className="text-sm">{action.reason}</p>
              </div>

              {/* Transaction Hash */}
              <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <span>TX:</span>
                <code className="bg-muted px-2 py-1 rounded">
                  {action.txHash.slice(0, 10)}...{action.txHash.slice(-8)}
                </code>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recent Events */}
      {protectionEvents.length > 0 && (
        <div className="mt-6 pt-6 border-t border-border">
          <h3 className="text-lg font-semibold mb-3">Recent Activity</h3>
          <div className="space-y-2">
            {protectionEvents.slice(0, 5).map((event, index) => (
              <div
                key={index}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span>Protection executed</span>
                <span>•</span>
                <span className="text-foreground font-medium">
                  Block #{event.blockNumber?.toString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

