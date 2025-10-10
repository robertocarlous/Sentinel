'use client'

import { Shield, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { WalletButton } from "@/components/wallet-button"
import { motion } from "framer-motion"
import { useAccount } from "wagmi"
import {
  VaultCard,
  AgentControl,
  RiskMonitor,
  ProtectionHistory,
  DeployFunds,
  TokenFaucet,
} from "@/components/dashboard"

export default function DashboardPage() {
  const { isConnected } = useAccount()

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
          // Connected State - Real Data Dashboard
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Token Faucet - Get Free Test Tokens! */}
            <TokenFaucet />

            {/* Top Row: Vault and Agent Control */}
            <div className="grid lg:grid-cols-2 gap-6">
              <VaultCard />
              <AgentControl />
            </div>

            {/* Deploy Funds to Earn Yield */}
            <DeployFunds />

            {/* Risk Monitor */}
            <RiskMonitor />

            {/* Protection History */}
            <ProtectionHistory />
          </motion.div>
        )}
      </div>
    </div>
  )
}
