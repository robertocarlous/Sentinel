'use client';

import { useMultiProtocolRisk } from '@/hooks';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  MONITORED_PROTOCOLS,
  getRiskColor,
  getRiskLabel,
  getHealthColor,
  getHealthLabel,
  formatAmount,
} from '@/types/contracts';

export function RiskMonitor() {
  const { protocols } = useMultiProtocolRisk(
    MONITORED_PROTOCOLS.map((p) => p.address)
  );

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">Protocol Risk Monitor</h2>

      <div className="space-y-4">
        {protocols.map((protocol, index) => {
          const protocolInfo = MONITORED_PROTOCOLS[index];
          const riskScore = protocol.riskScore ?? 0;
          const healthScore = protocol.metrics?.healthScore ?? 0;

          const riskColor = getRiskColor(riskScore);
          const riskLabel = getRiskLabel(riskScore);
          const healthColor = getHealthColor(healthScore);
          const healthLabel = getHealthLabel(healthScore);

          return (
            <div
              key={protocolInfo.address}
              className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-lg">{protocolInfo.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {protocolInfo.description}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={`text-${riskColor}-500 border-${riskColor}-500`}
                >
                  {protocolInfo.type}
                </Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Risk Score */}
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Risk Score</p>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full bg-${riskColor}-500`}
                    ></div>
                    <span className="text-lg font-bold">{riskScore}%</span>
                  </div>
                  <p className={`text-xs text-${riskColor}-500 mt-1`}>
                    {riskLabel}
                  </p>
                </div>

                {/* Health Score */}
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Health</p>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full bg-${healthColor}-500`}
                    ></div>
                    <span className="text-lg font-bold">{healthScore}%</span>
                  </div>
                  <p className={`text-xs text-${healthColor}-500 mt-1`}>
                    {healthLabel}
                  </p>
                </div>

                {/* TVL */}
                <div>
                  <p className="text-xs text-muted-foreground mb-1">TVL</p>
                  <p className="text-lg font-bold">
                    {protocol.metrics?.currentTVL
                      ? `$${formatAmount(protocol.metrics.currentTVL)}`
                      : 'N/A'}
                  </p>
                  {protocol.metrics?.previousTVL &&
                    protocol.metrics.previousTVL > 0n && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {calculateChange(
                          protocol.metrics.previousTVL,
                          protocol.metrics.currentTVL
                        )}
                      </p>
                    )}
                </div>

                {/* Last Update */}
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Last Update
                  </p>
                  <p className="text-sm">
                    {protocol.latestSnapshot?.timestamp
                      ? formatTimestamp(protocol.latestSnapshot.timestamp)
                      : 'Never'}
                  </p>
                </div>
              </div>

              {/* Latest Alert */}
              {protocol.latestSnapshot?.reason && (
                <div className="mt-3 p-2 bg-muted/50 rounded text-sm">
                  <span className="text-muted-foreground">Latest: </span>
                  {protocol.latestSnapshot.reason}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-border">
        <p className="text-sm text-muted-foreground mb-2">Risk Levels:</p>
        <div className="flex gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span>Low (0-39%)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
            <span>Medium (40-59%)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
            <span>High (60-79%)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <span>Critical (80-100%)</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

// Helper functions
function calculateChange(previous: bigint, current: bigint): string {
  if (previous === 0n) return 'N/A';
  
  const change = ((Number(current) - Number(previous)) / Number(previous)) * 100;
  const sign = change >= 0 ? '+' : '';
  const color = change >= 0 ? 'text-green-500' : 'text-red-500';
  
  return `${sign}${change.toFixed(2)}%`;
}

function formatTimestamp(timestamp: bigint): string {
  const date = new Date(Number(timestamp) * 1000);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

