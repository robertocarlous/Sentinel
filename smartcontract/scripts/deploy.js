import hre from "hardhat";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  if (!deployer) {
    throw new Error("No deployer account found! Check your PRIVATE_KEY and network config.");
  }

  console.log("🚀 Deploying contracts to Somnia Shannon Testnet...");
  console.log("🆔 Deploying with account:", await deployer.getAddress());

  // Get balance
  const balance = await hre.ethers.provider.getBalance(await deployer.getAddress());
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH");

  if (balance === 0n) {
    console.log("❌ Insufficient balance for deployment. Please fund your account.");
    return;
  }

  // ------------------------------
  // Deploy RiskOracle
  // ------------------------------
  const RiskOracleFactory = await hre.ethers.getContractFactory("RiskOracle");
  const riskOracle = await RiskOracleFactory.deploy();
  await riskOracle.waitForDeployment();
  console.log("✅ RiskOracle deployed at:", await riskOracle.getAddress());

  // ------------------------------
  // Deploy SentinelAgent
  // ------------------------------
  const SentinelAgentFactory = await hre.ethers.getContractFactory("SentinelAgent");
  const sentinelAgent = await SentinelAgentFactory.deploy(); // add constructor args if needed
  await sentinelAgent.waitForDeployment();
  console.log("✅ SentinelAgent deployed at:", await sentinelAgent.getAddress());


  // ------------------------------
  // Deploy Demo Tokens
  // ------------------------------
  const TokenFactory = await hre.ethers.getContractFactory("MockToken");
  const initialSupply = hre.ethers.parseUnits("100000000", 18); // 100M tokens
  const tokenA = await TokenFactory.deploy("DemoToken", "DMT", 18, initialSupply);
  await tokenA.waitForDeployment();
  console.log("✅ DemoToken deployed at:", await tokenA.getAddress());

  const tokenB = await TokenFactory.deploy("DemoTokenB", "DMTB", 18, initialSupply);
  await tokenB.waitForDeployment();
  console.log("✅ DemoTokenB deployed at:", await tokenB.getAddress());

  // ------------------------------
  // Deploy SentinelVault
  // ------------------------------
  const SentinelVaultFactory = await hre.ethers.getContractFactory("SentinelVault");
  const sentinelVault = await SentinelVaultFactory.deploy(await tokenA.getAddress());
  await sentinelVault.waitForDeployment();
  console.log("✅ SentinelVault deployed at:", await sentinelVault.getAddress());

  // ------------------------------
  // Deploy SimpleLendingPool
  // ------------------------------
  const LendingPoolFactory = await hre.ethers.getContractFactory("SimpleLendingPool");
  const lendingPool = await LendingPoolFactory.deploy(await tokenA.getAddress());
  await lendingPool.waitForDeployment();
  console.log("✅ SimpleLendingPool deployed at:", await lendingPool.getAddress());

  // Set SentinelVault in LendingPool
  await lendingPool.setSentinelVault(await sentinelVault.getAddress());
  console.log("SentinelVault set in SimpleLendingPool");

  // ------------------------------
  // Deploy SimpleSwapPool
  // ------------------------------
  const SwapPoolFactory = await hre.ethers.getContractFactory("SimpleSwapPool");
  const swapPool = await SwapPoolFactory.deploy(await tokenA.getAddress(), await tokenB.getAddress());
  await swapPool.waitForDeployment();
  console.log("✅ SimpleSwapPool deployed at:", await swapPool.getAddress());

  // Set SentinelVault in SwapPool
  await swapPool.setSentinelVault(await sentinelVault.getAddress());
  console.log("SentinelVault set in SimpleSwapPool");

  // ------------------------------
  // Save deployment info
  // ------------------------------
  const deployments = [
    { name: "RiskOracle", address: await riskOracle.getAddress(), txHash: riskOracle.deploymentTransaction().hash },
    { name: "SentinelAgent", address: await sentinelAgent.getAddress(), txHash: sentinelAgent.deploymentTransaction().hash },
    { name: "DemoToken", address: await tokenA.getAddress(), txHash: tokenA.deploymentTransaction().hash },
    { name: "DemoTokenB", address: await tokenB.getAddress(), txHash: tokenB.deploymentTransaction().hash },
    { name: "SentinelVault", address: await sentinelVault.getAddress(), txHash: sentinelVault.deploymentTransaction().hash },
    { name: "SimpleLendingPool", address: await lendingPool.getAddress(), txHash: lendingPool.deploymentTransaction().hash },
    { name: "SimpleSwapPool", address: await swapPool.getAddress(), txHash: swapPool.deploymentTransaction().hash },
  ];

  const deploymentInfo = {
    network: "somniaTestnet",
    deployer: await deployer.getAddress(),
    timestamp: new Date().toISOString(),
    contracts: deployments,
  };

  console.log("\n📋 Deployment Details:");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  console.log("\n🔍 To verify a contract, run:");
  deployments.forEach(d => {
    console.log(`npx hardhat verify --network somniaTestnet ${d.address}`);
  });

  console.log("\n✅ All contracts deployed successfully!");
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});
