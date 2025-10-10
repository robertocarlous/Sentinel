# 🪙 Sentinel Token Strategy

## ❓ Your Question: "How will judges test without access to our token?"

## ✅ **Answer: Built-in FREE Token Faucet!**

Your `DemoToken` contract has a faucet function that **anyone can use**:

```solidity
function faucet(uint256 amount) external {
    require(amount <= 1000000 * 10**decimals, "Amount too large");
    _mint(msg.sender, amount);
}
```

**What this means:**
- ✅ Anyone can claim up to 1,000,000 DMT tokens per transaction
- ✅ Unlimited claims (claim multiple times)
- ✅ FREE (only gas fees)
- ✅ Perfect for testing and demos
- ✅ Judges can get tokens instantly!

---

## 🎯 **Current Setup (Testnet)**

### **Token Used by Vault:**
- **Token:** DemoToken (DMT)
- **Address:** `0x922C1Dd2973c6322529c6C7C66d4Abb2cbBef1dE`
- **Decimals:** 18
- **Supply:** Unlimited (via faucet)
- **Cost:** FREE

### **How Judges/Users Get Tokens:**

**Option 1: Use the Faucet Component (BEST!)**
```
1. Visit your dashboard
2. Connect wallet (Somnia Testnet)
3. Click "Token Faucet" at the top
4. Click "Claim 1,000 DMT" button
5. Done! Tokens in wallet
```

**Option 2: Call Contract Directly**
```javascript
await demoToken.faucet(parseUnits('1000', 18))
```

**Option 3: You Give Them Tokens**
```javascript
// You (as owner) can mint and send
await demoToken.mint(judgeAddress, parseUnits('10000', 18))
```

---

## 📊 **Judge Testing Flow**

```
┌─────────────────────────────────────────────────┐
│         JUDGE EXPERIENCE (5 MINUTES)             │
└─────────────────────────────────────────────────┘

1. Judge visits your demo site
2. Connects MetaMask to Somnia Testnet
3. Sees "Token Faucet" banner at top
4. Clicks "Claim 1,000 DMT" (1 transaction)
5. Has tokens! Now can test everything:
   ✓ Deposit to vault
   ✓ Enable AI agent
   ✓ Deploy to protocols
   ✓ Watch protection in action
   ✓ Withdraw

Total setup time: < 1 minute
Total cost: Just gas (nearly free on testnet)
```

---

## 💡 **Alternative: Use Native Somnia Token**

If you want to use Somnia's native token instead (like ETH on Ethereum):

### **Pros:**
- ✅ Users already have it from faucet
- ✅ No extra token claiming needed
- ✅ More "real world" feel

### **Cons:**
- ❌ Need to redeploy vault with WSOM (wrapped Somnia) address
- ❌ More complex for users (wrap/unwrap)
- ❌ Additional contract deployment

### **For Testnet Demo:**
**DMT with faucet is BETTER** because:
- Simpler user experience
- You control the supply
- Easy to claim unlimited amounts
- No need for wrapping/unwrapping

---

## 🚀 **Recommended Setup for Judges**

### **Add to Your Demo Instructions:**

```markdown
# Testing Sentinel

## Step 1: Get Test Tokens (30 seconds)
1. Connect wallet to Somnia Testnet
2. Visit the dashboard
3. Use the "Token Faucet" at the top
4. Claim 10,000 DMT tokens (free!)

## Step 2: Test the Platform
1. Deposit 5,000 DMT to vault
2. Enable AI agent (set to Moderate 75%)
3. Deploy 3,000 DMT to SimpleLendingPool
4. Watch real-time risk monitoring
5. (Optional) Trigger exploit to see protection

That's it! No external faucets needed.
```

---

## 📝 **Updated Dashboard Layout**

```
┌─────────────────────────────────────────────────┐
│            SENTINEL DASHBOARD                    │
├─────────────────────────────────────────────────┤
│                                                  │
│  🚰 TOKEN FAUCET (NEW!)                         │
│  ┌────────────────────────────────────────┐    │
│  │ Your Balance: 0 DMT                    │    │
│  │ [Claim 1,000] [Claim 10,000]          │    │
│  └────────────────────────────────────────┘    │
│  ↓ Get tokens first!                           │
│                                                  │
│  💰 VAULT CARD                                  │
│  ┌────────────────────────────────────────┐    │
│  │ Vault Balance: 0 DMT                   │    │
│  │ [Deposit] [Withdraw]                   │    │
│  └────────────────────────────────────────┘    │
│  ↓ Deposit your DMT here                       │
│                                                  │
│  🤖 AGENT CONTROL                               │
│  ┌────────────────────────────────────────┐    │
│  │ [Enable Protection]                    │    │
│  │ Select: Conservative/Moderate/Aggressive│    │
│  └────────────────────────────────────────┘    │
│  ↓ Enable AI protection                        │
│                                                  │
│  📈 DEPLOY TO EARN                              │
│  ┌────────────────────────────────────────┐    │
│  │ Deploy to protocols to earn yield      │    │
│  │ [SimpleLendingPool] [SimpleSwapPool]   │    │
│  └────────────────────────────────────────┘    │
│  ↓ Start earning!                              │
│                                                  │
│  📊 RISK MONITOR                                │
│  └─ See real-time risk scores                  │
│                                                  │
│  🛡️ PROTECTION HISTORY                         │
│  └─ View when agent saved your funds           │
│                                                  │
└─────────────────────────────────────────────────┘
```

---

## 🎯 **For Production (Real Money)**

When you go to mainnet with real USDC:

### **Option 1: Use Real USDC**
```typescript
// Update TOKEN_CONFIG in /src/abi/index.tsx
VAULT_TOKEN: {
  address: '0x...', // Real USDC on Somnia mainnet
  symbol: 'USDC',
  decimals: 6, // USDC has 6 decimals!
}
```

### **Option 2: Support Multiple Tokens**
```typescript
SUPPORTED_TOKENS: {
  USDC: { address: '0x...', symbol: 'USDC', decimals: 6 },
  USDT: { address: '0x...', symbol: 'USDT', decimals: 6 },
  DAI: { address: '0x...', symbol: 'DAI', decimals: 18 },
}
```

### **Option 3: Use Somnia Native Token**
```typescript
// Deploy vault with WSOM (Wrapped Somnia)
VAULT_TOKEN: {
  address: '0x...', // WSOM address
  symbol: 'WSOM',
  decimals: 18,
}
```

---

## ✅ **What I Just Added**

### **TokenFaucet Component**
- Shows user's DMT balance
- Claim buttons: 1K, 10K, 100K, 1M DMT
- One-click claiming
- Success confirmation
- Link to block explorer

### **Updated Dashboard**
- TokenFaucet at the very top (first thing users see!)
- Makes it obvious how to get tokens
- Clean flow: Claim → Deposit → Deploy → Earn

---

## 🎉 **Summary**

### **For Your Demo/Hackathon:**

**YES, your platform uses DMT (test token) and that's PERFECT because:**

1. ✅ **Judges can get tokens instantly** (via faucet)
2. ✅ **No external dependencies** (self-contained)
3. ✅ **Unlimited supply** (never runs out)
4. ✅ **Free to claim** (just gas)
5. ✅ **Easy to test** (no barriers)

**You don't need native Somnia tokens!** Your faucet makes testing seamless.

### **For Production:**

Replace DMT with real USDC/stablecoins on mainnet. The architecture supports any ERC20 token.

---

## 🎬 **Demo Script for Judges**

```
"Welcome to Sentinel! Let me show you how it works:

1. First, claim some free test tokens (click here)
   → Done in 1 click!
   
2. Now deposit to the vault for safekeeping
   → Your funds are in the secure vault
   
3. Enable AI protection with your risk level
   → Agent is now monitoring
   
4. Deploy funds to SimpleLendingPool to earn 12% APY
   → You're earning yield!
   
5. Watch the Risk Monitor - I'll trigger an exploit
   → Risk jumps to 95%
   → Agent withdraws your funds automatically
   → Funds saved! Check Protection History
   
Total time: 2 minutes
Result: You just earned yield AND avoided a hack!"
```

---

**Your current setup is PERFECT for demos! The faucet solves everything.** 🎉

