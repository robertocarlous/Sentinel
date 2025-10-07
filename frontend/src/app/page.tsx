'use client'

import { Shield, Zap, Eye, Clock, ArrowRight, CheckCircle2, Activity, TrendingUp, Lock, Code } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"

export default function LandingPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

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
          <motion.div 
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold font-mono">SENTINEL</span>
          </motion.div>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              How It Works
            </Link>
            <Link href="#security" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Security
            </Link>
            <Link href="#why-sentinel" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Why Sentinel
            </Link>
            <Button asChild className="hover:scale-105 transition-transform">
              <Link href="/dashboard">Launch App</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <motion.div 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Autonomous DeFi Protection • Built on Somnia
          </motion.div>

          <motion.h1 
            className="text-5xl md:text-7xl font-bold tracking-tight text-balance"
            {...fadeInUp}
          >
            Your AI Guardian for <span className="text-primary">DeFi Safety</span>
          </motion.h1>

          <motion.p 
            className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance"
            {...fadeInUp}
            transition={{ delay: 0.1 }}
          >
            Sentinel monitors your DeFi positions 24/7 and automatically withdraws funds to safety when exploits are
            detected. React in seconds, not minutes. Never lose funds to hacks again.
          </motion.p>

          <motion.div 
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            {...fadeInUp}
            transition={{ delay: 0.2 }}
          >
            <Button size="lg" className="text-lg px-8 hover:scale-105 transition-transform" asChild>
              <Link href="/dashboard">
                Get Protected Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent hover:scale-105 transition-transform">
              <a href="#demo">View Live Demo</a>
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div 
            className="grid grid-cols-3 gap-8 pt-12 max-w-3xl mx-auto"
            variants={staggerChildren}
            initial="initial"
            animate="animate"
          >
            <motion.div className="space-y-2" variants={fadeInUp}>
              <div className="text-3xl md:text-4xl font-bold text-primary">$3.7B+</div>
              <div className="text-sm text-muted-foreground">Lost to DeFi hacks in 2024</div>
            </motion.div>
            <motion.div className="space-y-2" variants={fadeInUp}>
              <div className="text-3xl md:text-4xl font-bold text-primary">{"<"}30s</div>
              <div className="text-sm text-muted-foreground">Protection response time</div>
            </motion.div>
            <motion.div className="space-y-2" variants={fadeInUp}>
              <div className="text-3xl md:text-4xl font-bold text-primary">24/7</div>
              <div className="text-sm text-muted-foreground">Autonomous monitoring</div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Why Sentinel Section */}
      <section id="why-sentinel" className="container mx-auto px-4 py-20 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <motion.div 
            className="text-center space-y-4 mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-5xl font-bold">Why You Need Sentinel</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              DeFi hacks are increasing in frequency and sophistication. Manual monitoring isn&apos;t enough.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Card className="p-8 space-y-4 bg-destructive/5 border-destructive/20 h-full">
                <div className="text-destructive text-3xl font-bold">Without Sentinel</div>
                <ul className="space-y-3">
                  <li className="flex gap-3">
                    <span className="text-destructive mt-1">✗</span>
                    <span>You sleep while hackers drain protocols overnight</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-destructive mt-1">✗</span>
                    <span>By the time you see Twitter alerts, it&apos;s too late</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-destructive mt-1">✗</span>
                    <span>Manual withdrawal takes minutes - exploits happen in seconds</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-destructive mt-1">✗</span>
                    <span>You lose 100% of your position to smart contract exploits</span>
                  </li>
                </ul>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="p-8 space-y-4 bg-primary/5 border-primary/20 h-full">
                <div className="text-primary text-3xl font-bold">With Sentinel</div>
                <ul className="space-y-3">
                  <li className="flex gap-3">
                    <CheckCircle2 className="text-primary mt-1 h-5 w-5 flex-shrink-0" />
                    <span>AI monitors your positions every 10 seconds, 24/7</span>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle2 className="text-primary mt-1 h-5 w-5 flex-shrink-0" />
                    <span>Automatic withdrawal triggered before exploit spreads</span>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle2 className="text-primary mt-1 h-5 w-5 flex-shrink-0" />
                    <span>Funds secured in under 30 seconds - faster than any human</span>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle2 className="text-primary mt-1 h-5 w-5 flex-shrink-0" />
                    <span>Sleep peacefully knowing you&apos;re protected around the clock</span>
                  </li>
                </ul>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <motion.div 
          className="text-center space-y-4 mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-5xl font-bold">How Sentinel Protects You</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Four layers of autonomous protection working together to keep your funds safe
          </p>
        </motion.div>

        <motion.div 
          className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto"
          variants={staggerChildren}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          {[
            {
              icon: Eye,
              title: "Real-Time Monitoring",
              description: "AI agent scans your positions every 10 seconds, analyzing TVL changes, transaction patterns, and market volatility across all protocols.",
              color: "text-blue-500",
              bgColor: "bg-blue-500/10"
            },
            {
              icon: Zap,
              title: "Instant Response",
              description: "When threats are detected, Sentinel automatically withdraws your funds in under 30 seconds - faster than any human could react.",
              color: "text-yellow-500",
              bgColor: "bg-yellow-500/10"
            },
            {
              icon: Shield,
              title: "Smart Risk Scoring",
              description: "Advanced algorithm calculates risk scores (0-100) based on multiple factors, triggering protection only when truly necessary.",
              color: "text-primary",
              bgColor: "bg-primary/10"
            },
            {
              icon: Clock,
              title: "Full Transparency",
              description: "Every action is logged on-chain with detailed explanations. You maintain full control and can override decisions anytime.",
              color: "text-green-500",
              bgColor: "bg-green-500/10"
            }
          ].map((feature, index) => (
            <motion.div key={index} variants={fadeInUp}>
              <Card className="p-8 space-y-4 bg-card border-border hover:border-primary/50 transition-all hover:shadow-xl hover:-translate-y-1 h-full">
                <div className={`h-12 w-12 rounded-lg ${feature.bgColor} flex items-center justify-center`}>
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <h3 className="text-2xl font-bold">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Live Demo Section */}
      <section id="demo" className="container mx-auto px-4 py-20 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <motion.div 
            className="text-center space-y-4 mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-5xl font-bold">See Sentinel in Action</h2>
            <p className="text-lg text-muted-foreground">Real-time simulation of exploit detection and response</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Card className="p-8 bg-card border-border">
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <Activity className="h-6 w-6 text-primary animate-pulse" />
                    <span className="font-bold">Live Monitoring Dashboard</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-primary">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                    </span>
                    Scanning...
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-muted">
                    <div className="text-sm text-muted-foreground mb-1">Monitored TVL</div>
                    <div className="text-2xl font-bold">$127,450</div>
                    <div className="text-xs text-green-500 mt-1 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      Stable
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-muted">
                    <div className="text-sm text-muted-foreground mb-1">Current Risk</div>
                    <div className="text-2xl font-bold text-green-500">24/100</div>
                    <div className="text-xs text-muted-foreground mt-1">Low Risk</div>
                  </div>
                  <div className="p-4 rounded-lg bg-muted">
                    <div className="text-sm text-muted-foreground mb-1">Last Scan</div>
                    <div className="text-2xl font-bold">8s ago</div>
                    <div className="text-xs text-primary mt-1">Next in 2s</div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-primary mt-1" />
                    <div className="flex-1">
                      <div className="font-medium mb-1">All Systems Operational</div>
                      <div className="text-sm text-muted-foreground">
                        3 positions monitored • 2 protocols scanned • Response time: 18s average
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            className="text-center space-y-4 mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-5xl font-bold">Protection in Action</h2>
            <p className="text-lg text-muted-foreground">From threat detection to funds secured in under 30 seconds</p>
          </motion.div>

          <motion.div 
            className="space-y-6"
            variants={staggerChildren}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {[
              { time: "T+0s", event: "Exploit begins - TVL starts dropping rapidly", status: "critical" },
              { time: "T+10s", event: "Sentinel detects anomaly in monitoring cycle", status: "warning" },
              { time: "T+15s", event: "Risk score calculated: 95 (Critical Threat)", status: "warning" },
              { time: "T+18s", event: "Emergency withdrawal transaction signed & submitted", status: "processing" },
              { time: "T+25s", event: "Transaction confirmed on-chain", status: "success" },
              { time: "T+27s", event: "✓ Funds secured - You saved $10,000", status: "success" },
            ].map((step, index) => (
              <motion.div 
                key={index} 
                className="flex gap-4 items-start"
                variants={fadeInUp}
              >
                <div className="flex-shrink-0 w-20 pt-1">
                  <span className="text-sm font-mono text-muted-foreground font-bold">{step.time}</span>
                </div>
                <div className="flex-shrink-0 pt-1">
                  <motion.div
                    className={`h-3 w-3 rounded-full ${
                      step.status === "critical"
                        ? "bg-red-500"
                        : step.status === "warning"
                          ? "bg-yellow-500"
                          : step.status === "processing"
                            ? "bg-blue-500"
                            : "bg-primary"
                    }`}
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  />
                </div>
                <div className="flex-1">
                  <p className="text-foreground leading-relaxed">{step.event}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Technical Details */}
      <section className="container mx-auto px-4 py-20 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <motion.div 
            className="text-center space-y-4 mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-5xl font-bold">Built on Cutting-Edge Technology</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Enterprise-grade infrastructure for maximum reliability and security
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Code,
                title: "Somnia Network",
                description: "Built on Somnia&apos;s high-performance blockchain for ultra-fast transaction finality"
              },
              {
                icon: Lock,
                title: "Smart Contracts",
                description: "Audited, non-custodial contracts ensure you always maintain control of your funds"
              },
              {
                icon: Activity,
                title: "AI Agent",
                description: "Autonomous monitoring agent runs 24/7 with machine learning risk assessment"
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="p-6 bg-card border-border hover:border-primary/50 transition-all hover:shadow-xl h-full">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center">
                      <item.icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold">{item.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section id="security" className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Card className="p-12 bg-card border-border hover:border-primary/30 transition-colors">
              <div className="space-y-8">
                <div className="text-center space-y-4">
                  <h2 className="text-3xl md:text-4xl font-bold">Built for Security</h2>
                  <p className="text-lg text-muted-foreground">Your funds, your control - always</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {[
                    "Non-custodial architecture",
                    "On-chain action logging",
                    "Revocable permissions anytime",
                    "Manual override available",
                    "Open-source smart contracts",
                    "Audited by security experts",
                  ].map((feature, index) => (
                    <motion.div 
                      key={index} 
                      className="flex items-center gap-3"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-foreground">{feature}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div 
          className="max-w-4xl mx-auto text-center space-y-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-balance">Stop Worrying About Exploits</h2>
          <p className="text-xl text-muted-foreground text-balance">
            Join DeFi users protecting their positions with autonomous AI monitoring
          </p>
          <Button size="lg" className="text-lg px-8 hover:scale-105 transition-transform" asChild>
            <Link href="/dashboard">
              Start Protecting Your Funds
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border mt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold font-mono">SENTINEL</span>
            </div>
            <div className="text-sm text-muted-foreground">© 2025 Sentinel. Built on Somnia. Protecting DeFi, one position at a time.</div>
          </div>
        </div>
      </footer>
    </div>
  )
}
