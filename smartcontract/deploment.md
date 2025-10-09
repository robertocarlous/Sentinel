
RiskOracle deployed at: 0x659815010A215710e86e479078fb6F882874A2A6
SentinelAgent deployed at: 0x04aB79FF815C1F7a001b811B07FED03E7E0a5620
DemoToken deployed at: 0x922C1Dd2973c6322529c6C7C66d4Abb2cbBef1dE
DemoTokenB deployed at: 0x1D328AE8acc7539C59D468B6e820c675BF45E61F
SentinelVault deployed at: 0x188b09f31854e8FBE2448250b41875DDEA0421B7
SimpleLendingPool deployed at: 0x94b07B6ec0c5DBad7072D642D27440F552Da5aED
SentinelVault set in SimpleLendingPool
SimpleSwapPool deployed at: 0xcbC2B1cc4b44D536f4022f6e2E222A814C8B97F0
SentinelVault set in SimpleSwapPool

Deployment Details:
{
  "network": "somniaTestnet",
  "deployer": "0x95e1CF9174AbD55E47b9EDa1b3f0F2ba0f4369a0",
  "timestamp": "2025-10-09T11:58:59.731Z",
  "contracts": [
    {
      "name": "RiskOracle",
      "address": "0x659815010A215710e86e479078fb6F882874A2A6",
      "txHash": "0xa16b350a6dc09ed7ced28251b79fb28b445a98367033f5182814440089db6fd5"
    },
    {
      "name": "SentinelAgent",
      "address": "0x04aB79FF815C1F7a001b811B07FED03E7E0a5620",
      "txHash": "0x2f743817d62a3dd1b60abf545587ace068f4616e13a04b0c814f3cb16fe700d7"
    },
    {
      "name": "DemoToken",
      "address": "0x922C1Dd2973c6322529c6C7C66d4Abb2cbBef1dE",
      "txHash": "0xeb0355537b26066c271156e5d7c28ce638340f31b446e2525e1bd14ca90a6bb8"
    },
    {
      "name": "DemoTokenB",
      "address": "0x1D328AE8acc7539C59D468B6e820c675BF45E61F",
      "txHash": "0x04a75c35f13a3c255544c03d1ef88a1fd23a6270aa6872968d6de8694bd0e00a"
    },
    {
      "name": "SentinelVault",
      "address": "0x188b09f31854e8FBE2448250b41875DDEA0421B7",
      "txHash": "0x9f20d416e06e8b82f8ae85ba0c700740412be052d4d356e269bb4f3dba087a40"
    },
    {
      "name": "SimpleLendingPool",
      "address": "0x94b07B6ec0c5DBad7072D642D27440F552Da5aED",
      "txHash": "0x0deb81a6d6f5ed34e5611a305cd0d6af7409a937937e8a51eb99f62bc9f2813d"
    },
    {
      "name": "SimpleSwapPool",
      "address": "0xcbC2B1cc4b44D536f4022f6e2E222A814C8B97F0",
      "txHash": "0xd9ebb507305607f9ec7e0ab1968d4ee794649f1c44f6aa0fe0e9aa6a8d882e39"
    }
  ]
}

To verify a contract, run:
npx hardhat verify --network somniaTestnet 0x659815010A215710e86e479078fb6F882874A2A6
npx hardhat verify --network somniaTestnet 0x04aB79FF815C1F7a001b811B07FED03E7E0a5620
npx hardhat verify --network somniaTestnet 0x922C1Dd2973c6322529c6C7C66d4Abb2cbBef1dE
npx hardhat verify --network somniaTestnet 0x1D328AE8acc7539C59D468B6e820c675BF45E61F
npx hardhat verify --network somniaTestnet 0x188b09f31854e8FBE2448250b41875DDEA0421B7
npx hardhat verify --network somniaTestnet 0x94b07B6ec0c5DBad7072D642D27440F552Da5aED
npx hardhat verify --network somniaTestnet 0xcbC2B1cc4b44D536f4022f6e2E222A814C8B97F0