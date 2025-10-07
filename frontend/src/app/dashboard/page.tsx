'use client'

import { Shield, TrendingUp, AlertTriangle, CheckCircle2, Clock, DollarSign, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { WalletButton } from "@/components/wallet-button"
import { motion } from "framer-motion"
import { useAccount } from "wagmi"

export default function DashboardPage() {
  const { address, isConnected } = useAccount()

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  }

  const staggerChildren = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-background/80 backdrop-blur-lg z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold font-mono">SENTINEL</span>
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" className="bg-transparent hover:scale-105 transition-transform">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <WalletButton />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {!isConnected ? (
          // Not Connected State
          <motion.div 
            className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="h-12 w-12 text-primary" />
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl font-bold">Connect Your Wallet</h2>
              <p className="text-muted-foreground max-w-md">
                Connect your wallet to start protecting your DeFi positions with Sentinel&apos;s autonomous monitoring
              </p>
            </div>
            <WalletButton />
          </motion.div>
        ) : (
          // Connected State
          <>
            {/* Status Banner */}
            <motion.div {...fadeInUp}>
              <Card className="p-6 mb-8 bg-primary/5 border-primary/20 hover:border-primary/40 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <Shield className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-xl font-bold">Protection Active</h2>
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Monitoring 3 positions across 2 protocols for {address?.slice(0, 6)}...{address?.slice(-4)}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" className="bg-transparent hover:scale-105 transition-transform">
                    Pause Protection
                  </Button>
                </div>
              </Card>
            </motion.div>

            {/* Key Metrics */}
            <motion.div 
              className="grid md:grid-cols-4 gap-6 mb-8"
              variants={staggerChildren}
              initial="initial"
              animate="animate"
            >
              {[
                {
                  label: "Total Protected",
                  value: "$127,450",
                  change: "+$12,000 this week",
                  icon: DollarSign,
                  changeColor: "text-primary"
                },
                {
                  label: "Money Saved",
                  value: "$48,200",
                  change: "2 exploits prevented",
                  icon: TrendingUp,
                  valueColor: "text-primary",
                  changeColor: "text-muted-foreground"
                },
                {
                  label: "Avg Risk Score",
                  value: "24",
                  change: "Low risk",
                  icon: AlertTriangle,
                  changeColor: "text-green-500"
                },
                {
                  label: "Response Time",
                  value: "18s",
                  change: "Average protection speed",
                  icon: Clock,
                  changeColor: "text-muted-foreground"
                }
              ].map((metric, index) => (
                <motion.div key={index} variants={fadeInUp}>
                  <Card className="p-6 bg-card border-border hover:border-primary/50 transition-all hover:shadow-lg hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">{metric.label}</span>
                      <metric.icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className={`text-3xl font-bold ${metric.valueColor || ''}`}>{metric.value}</div>
                    <div className={`text-xs mt-1 ${metric.changeColor}`}>{metric.change}</div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            {/* Protected Positions */}
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Protected Positions</h2>
                  <Button className="hover:scale-105 transition-transform">Add Position</Button>
                </div>

                <motion.div 
                  className="space-y-4"
                  variants={staggerChildren}
                  initial="initial"
                  animate="animate"
                >
                  {/* Position 1 */}
                  <motion.div variants={fadeInUp}>
                    <Card className="p-6 bg-card border-border hover:border-primary/50 transition-all hover:shadow-xl group">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <span className="text-lg font-bold text-blue-400">SL</span>
                          </div>
                          <div>
                            <h3 className="font-bold text-lg">SimpleLendingPool</h3>
                            <p className="text-sm text-muted-foreground">Lending Protocol</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                          <span className="relative flex h-2 w-2 mr-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                          </span>
                          Active
                        </Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Position Value</div>
                          <div className="text-xl font-bold">$85,200</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Risk Score</div>
                          <div className="text-xl font-bold text-green-500">18</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">APY</div>
                          <div className="text-xl font-bold">12.4%</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-border">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          Last checked 8 seconds ago
                        </div>
                        <Button variant="ghost" size="sm" className="hover:scale-105 transition-transform">
                          View Details
                        </Button>
                      </div>
                    </Card>
                  </motion.div>

                  {/* Position 2 */}
                  <motion.div variants={fadeInUp}>
                    <Card className="p-6 bg-card border-border hover:border-primary/50 transition-all hover:shadow-xl group">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <span className="text-lg font-bold text-purple-400">SS</span>
                          </div>
                          <div>
                            <h3 className="font-bold text-lg">SimpleSwapPool</h3>
                            <p className="text-sm text-muted-foreground">DEX Liquidity</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                          <span className="relative flex h-2 w-2 mr-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                          </span>
                          Active
                        </Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Position Value</div>
                          <div className="text-xl font-bold">$42,250</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Risk Score</div>
                          <div className="text-xl font-bold text-yellow-500">32</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">APY</div>
                          <div className="text-xl font-bold">24.8%</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-border">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          Last checked 5 seconds ago
                        </div>
                        <Button variant="ghost" size="sm" className="hover:scale-105 transition-transform">
                          View Details
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                </motion.div>
              </div>

              {/* Sidebar */}
              <motion.div 
                className="space-y-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="p-6 bg-card border-border hover:border-primary/30 transition-colors">
                  <h3 className="font-bold text-lg mb-4">Recent Activity</h3>
                  <div className="space-y-4">
                    <motion.div 
                      className="flex gap-3"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">Position Protected</p>
                        <p className="text-xs text-muted-foreground">Saved $48,200 from exploit</p>
                        <p className="text-xs text-muted-foreground mt-1">2 hours ago</p>
                      </div>
                    </motion.div>

                    <motion.div 
                      className="flex gap-3"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">Position Added</p>
                        <p className="text-xs text-muted-foreground">SimpleLendingPool</p>
                        <p className="text-xs text-muted-foreground mt-1">1 day ago</p>
                      </div>
                    </motion.div>

                    <motion.div 
                      className="flex gap-3"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <div className="h-8 w-8 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">Risk Alert</p>
                        <p className="text-xs text-muted-foreground">Medium risk detected</p>
                        <p className="text-xs text-muted-foreground mt-1">3 days ago</p>
                      </div>
                    </motion.div>
                  </div>
                </Card>

                <Card className="p-6 bg-card border-border hover:border-primary/30 transition-colors">
                  <h3 className="font-bold text-lg mb-4">Risk Tolerance</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Current Setting</span>
                        <span className="font-medium">Moderate</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-primary rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: "50%" }}
                          transition={{ duration: 1, delay: 0.5 }}
                        />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">Agent will act when risk score exceeds 75</p>
                    <Button variant="outline" size="sm" className="w-full bg-transparent hover:scale-105 transition-transform">
                      Adjust Settings
                    </Button>
                  </div>
                </Card>
              </motion.div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
