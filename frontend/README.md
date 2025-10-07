# Sentinel - AI Guardian for DeFi Safety 🛡️

An autonomous DeFi protection system that monitors your positions 24/7 and automatically withdraws funds to safety when exploits are detected.

## 🚀 Features

- **Real-Time Monitoring**: AI agent scans positions every 10 seconds
- **Instant Response**: Automatic withdrawal in under 30 seconds
- **Smart Risk Scoring**: Advanced algorithm calculates risk scores (0-100)
- **Full Transparency**: Every action logged on-chain with detailed explanations
- **Non-Custodial**: You maintain full control of your funds at all times
- **Web3 Integration**: Connect with MetaMask, WalletConnect, Coinbase Wallet, and more

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS v4
- **Web3**: Wagmi v2, Viem, RainbowKit
- **Animations**: Framer Motion
- **UI Components**: Radix UI primitives
- **Blockchain**: Somnia Network

## 📦 Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
   NEXT_PUBLIC_SOMNIA_RPC_URL=https://testnet.somnia.network/rpc
   ```

   Get your WalletConnect Project ID at: https://cloud.walletconnect.com/

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx           # Landing page
│   │   ├── dashboard/         # Dashboard page
│   │   ├── layout.tsx         # Root layout with providers
│   │   └── globals.css        # Global styles
│   ├── components/
│   │   ├── ui/                # Reusable UI components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   └── badge.tsx
│   │   └── wallet-button.tsx  # Custom wallet connection button
│   ├── providers/
│   │   └── web3-provider.tsx  # Web3 context provider
│   └── lib/
│       ├── wagmi.ts           # Wagmi configuration
│       └── utils.ts           # Utility functions
├── public/                     # Static assets
├── package.json
└── tsconfig.json
```

## 🎨 UI Features

### Landing Page
- Hero section with animated stats
- "Why Sentinel" comparison section
- Feature showcase with icons
- Live demo simulation
- Technical details section
- Security guarantees
- Smooth scroll animations

### Dashboard
- Wallet connection integration
- Real-time position monitoring
- Risk score visualization
- Recent activity feed
- Protected positions list
- Risk tolerance settings

## 🔗 Web3 Integration

The app uses Wagmi v2 and RainbowKit for Web3 functionality:

- **Wallet Connection**: Multiple wallet support (MetaMask, WalletConnect, Coinbase)
- **Chain Support**: Somnia, Ethereum, Arbitrum, Optimism, Base
- **Smart Contracts**: Non-custodial architecture with revocable permissions

## 🎭 Animations

Professional animations powered by Framer Motion:

- Fade in/up effects on scroll
- Staggered children animations
- Hover effects on cards and buttons
- Scale transforms on interactive elements
- Smooth page transitions

## 🚀 Deployment

### Build for production:
```bash
npm run build
```

### Start production server:
```bash
npm start
```

### Deploy to Vercel:
```bash
vercel deploy
```

## 🔧 Configuration

### Tailwind CSS v4
The project uses the latest Tailwind CSS v4 with CSS-first configuration. All theme customization is done in `src/app/globals.css`.

### Wagmi Configuration
Web3 configuration is in `src/lib/wagmi.ts`. Update chain configurations and RPC URLs there.

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | WalletConnect project ID | Yes |
| `NEXT_PUBLIC_SOMNIA_RPC_URL` | Somnia network RPC endpoint | Yes |

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is part of the Sentinel DeFi Protection System.

## 🔐 Security

- Non-custodial architecture
- On-chain action logging
- Revocable permissions anytime
- Open-source smart contracts
- Security audited

## 📞 Support

For support, please open an issue in the GitHub repository.

---

Built with ❤️ on Somnia Network
