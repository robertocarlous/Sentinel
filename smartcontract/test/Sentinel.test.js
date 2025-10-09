const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("Protocol Integration Tests", function () {
  // Fixture for deploying all contracts
  async function deployProtocolsFixture() {
    const [owner, user1, user2, sentinel, agent] = await ethers.getSigners();

    // Deploy Mock Tokens
    const MockToken = await ethers.getContractFactory("MockToken");
    const tokenA = await MockToken.deploy("Token A", "TKA", 18, ethers.parseEther("1000000"));
    const tokenB = await MockToken.deploy("Token B", "TKB", 18, ethers.parseEther("1000000"));

    // Deploy Sentinel Vault
    const SentinelVault = await ethers.getContractFactory("SentinelVault");
    const vault = await SentinelVault.deploy(await tokenA.getAddress());

    // Deploy Simple Swap Pool
    const SimpleSwapPool = await ethers.getContractFactory("SimpleSwapPool");
    const swapPool = await SimpleSwapPool.deploy(
      await tokenA.getAddress(),
      await tokenB.getAddress()
    );

    // Deploy Simple Lending Pool
    const SimpleLendingPool = await ethers.getContractFactory("SimpleLendingPool");
    const lendingPool = await SimpleLendingPool.deploy(await tokenA.getAddress());

    // Setup: Set sentinel vault in protocols
    await swapPool.setSentinelVault(await vault.getAddress());
    await lendingPool.setSentinelVault(await vault.getAddress());

    // Setup: Whitelist protocols in vault
    await vault.whitelistProtocol(await swapPool.getAddress());
    await vault.whitelistProtocol(await lendingPool.getAddress());

    // Fund users
    await tokenA.transfer(user1.address, ethers.parseEther("10000"));
    await tokenA.transfer(user2.address, ethers.parseEther("10000"));
    await tokenB.transfer(user1.address, ethers.parseEther("10000"));
    await tokenB.transfer(user2.address, ethers.parseEther("10000"));

    return {
      owner,
      user1,
      user2,
      sentinel,
      agent,
      tokenA,
      tokenB,
      vault,
      swapPool,
      lendingPool
    };
  }

  describe("SimpleLendingPool - IProtocol Implementation", function () {
    it("Should implement IProtocol interface correctly", async function () {
      const { lendingPool, user1, tokenA } = await loadFixture(deployProtocolsFixture);

      // Deposit tokens
      await tokenA.connect(user1).approve(await lendingPool.getAddress(), ethers.parseEther("100"));
      await lendingPool.connect(user1).deposit(ethers.parseEther("100"));

      // Check getBalance
      const balance = await lendingPool.getBalance(user1.address);
      expect(balance).to.equal(ethers.parseEther("100"));

      // Check getTVL
      const tvl = await lendingPool.getTVL();
      expect(tvl).to.equal(ethers.parseEther("100"));

      // Check getHealthScore
      const healthScore = await lendingPool.getHealthScore();
      expect(healthScore).to.equal(100);
    });

    it("Should allow withdrawFor by Sentinel Vault", async function () {
      const { lendingPool, user1, tokenA, vault } = await loadFixture(deployProtocolsFixture);

      // User deposits
      await tokenA.connect(user1).approve(await lendingPool.getAddress(), ethers.parseEther("100"));
      await lendingPool.connect(user1).deposit(ethers.parseEther("100"));

      // Get vault signer by impersonating
      await ethers.provider.send("hardhat_impersonateAccount", [await vault.getAddress()]);
      const vaultSigner = await ethers.getSigner(await vault.getAddress());

      // Fund vault account with ETH for gas using setBalance
      await ethers.provider.send("hardhat_setBalance", [
        await vault.getAddress(),
        ethers.toQuantity(ethers.parseEther("10"))
      ]);

      // Sentinel calls withdrawFor
      await lendingPool.connect(vaultSigner).withdrawFor(user1.address, ethers.parseEther("50"));

      await ethers.provider.send("hardhat_stopImpersonatingAccount", [await vault.getAddress()]);

      // Check remaining balance
      const remainingBalance = await lendingPool.getBalance(user1.address);
      expect(remainingBalance).to.be.closeTo(ethers.parseEther("50"), ethers.parseEther("0.01"));
    });

    it("Should reject withdrawFor from non-Sentinel address", async function () {
      const { lendingPool, user1, user2, tokenA } = await loadFixture(deployProtocolsFixture);

      await tokenA.connect(user1).approve(await lendingPool.getAddress(), ethers.parseEther("100"));
      await lendingPool.connect(user1).deposit(ethers.parseEther("100"));

      await expect(
        lendingPool.connect(user2).withdrawFor(user1.address, ethers.parseEther("50"))
      ).to.be.revertedWith("Only Sentinel Vault");
    });

    it("Should calculate interest correctly", async function () {
      const { lendingPool, user1, tokenA } = await loadFixture(deployProtocolsFixture);

      await tokenA.connect(user1).approve(await lendingPool.getAddress(), ethers.parseEther("100"));
      await lendingPool.connect(user1).deposit(ethers.parseEther("100"));

      // Fast forward time by 1 year
      await ethers.provider.send("evm_increaseTime", [365 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine");

      const balance = await lendingPool.getBalance(user1.address);
      const interest = await lendingPool.calculateInterest(user1.address);

      // Should have earned ~5% interest (500 basis points)
      expect(balance).to.be.gt(ethers.parseEther("100"));
      expect(interest).to.be.closeTo(ethers.parseEther("5"), ethers.parseEther("0.1"));
    });

    it("Should handle reserve drain exploit", async function () {
      const { lendingPool, user1, tokenA, owner } = await loadFixture(deployProtocolsFixture);

      await tokenA.connect(user1).approve(await lendingPool.getAddress(), ethers.parseEther("100"));
      await lendingPool.connect(user1).deposit(ethers.parseEther("100"));

      // Trigger reserve drain
      await lendingPool.connect(owner).triggerReserveDrain(50);

      const healthScore = await lendingPool.getHealthScore();
      expect(healthScore).to.be.lt(100);

      const isExploited = await lendingPool.isExploited();
      expect(isExploited).to.be.true;
    });

    it("Should prevent deposits when exploited", async function () {
      const { lendingPool, user1, tokenA, owner } = await loadFixture(deployProtocolsFixture);

      await tokenA.connect(user1).approve(await lendingPool.getAddress(), ethers.parseEther("100"));
      await lendingPool.connect(user1).deposit(ethers.parseEther("100"));

      await lendingPool.connect(owner).triggerReserveDrain(50);

      await expect(
        lendingPool.connect(user1).deposit(ethers.parseEther("10"))
      ).to.be.revertedWith("Pool is exploited");
    });

    it("Should reset exploit correctly", async function () {
      const { lendingPool, user1, tokenA, owner } = await loadFixture(deployProtocolsFixture);

      await tokenA.connect(user1).approve(await lendingPool.getAddress(), ethers.parseEther("100"));
      await lendingPool.connect(user1).deposit(ethers.parseEther("100"));

      await lendingPool.connect(owner).triggerReserveDrain(50);

      // Approve and reset
      await tokenA.connect(owner).approve(await lendingPool.getAddress(), ethers.MaxUint256);
      await lendingPool.connect(owner).resetExploit();

      const isExploited = await lendingPool.isExploited();
      expect(isExploited).to.be.false;

      const healthScore = await lendingPool.getHealthScore();
      expect(healthScore).to.equal(100);
    });
  });

  describe("SimpleSwapPool - IProtocol Implementation", function () {
    it("Should implement IProtocol interface correctly", async function () {
      const { swapPool, user1, tokenA, tokenB } = await loadFixture(deployProtocolsFixture);

      // Add liquidity
      await tokenA.connect(user1).approve(await swapPool.getAddress(), ethers.parseEther("100"));
      await tokenB.connect(user1).approve(await swapPool.getAddress(), ethers.parseEther("100"));
      await swapPool.connect(user1).addLiquidity(ethers.parseEther("100"), ethers.parseEther("100"));

      // Check getBalance
      const balance = await swapPool.getBalance(user1.address);
      expect(balance).to.equal(ethers.parseEther("200"));

      // Check getTVL
      const tvl = await swapPool.getTVL();
      expect(tvl).to.equal(ethers.parseEther("200"));

      // Check getHealthScore
      const healthScore = await swapPool.getHealthScore();
      expect(healthScore).to.equal(100);
    });

    it("Should allow withdrawFor by Sentinel Vault", async function () {
      const { swapPool, user1, tokenA, tokenB, vault } = await loadFixture(deployProtocolsFixture);

      // Add liquidity
      await tokenA.connect(user1).approve(await swapPool.getAddress(), ethers.parseEther("100"));
      await tokenB.connect(user1).approve(await swapPool.getAddress(), ethers.parseEther("100"));
      await swapPool.connect(user1).addLiquidity(ethers.parseEther("100"), ethers.parseEther("100"));

      // Impersonate vault
      await ethers.provider.send("hardhat_impersonateAccount", [await vault.getAddress()]);
      const vaultSigner = await ethers.getSigner(await vault.getAddress());

      // Fund vault with ETH for gas using setBalance
      await ethers.provider.send("hardhat_setBalance", [
        await vault.getAddress(),
        ethers.toQuantity(ethers.parseEther("10"))
      ]);

      // Sentinel calls withdrawFor (50% withdrawal)
      await swapPool.connect(vaultSigner).withdrawFor(user1.address, 50);

      await ethers.provider.send("hardhat_stopImpersonatingAccount", [await vault.getAddress()]);

      // Check remaining balance
      const remainingBalance = await swapPool.getBalance(user1.address);
      expect(remainingBalance).to.be.closeTo(ethers.parseEther("100"), ethers.parseEther("1"));
    });

    it("Should calculate price correctly", async function () {
      const { swapPool, user1, tokenA, tokenB } = await loadFixture(deployProtocolsFixture);

      await tokenA.connect(user1).approve(await swapPool.getAddress(), ethers.parseEther("100"));
      await tokenB.connect(user1).approve(await swapPool.getAddress(), ethers.parseEther("100"));
      await swapPool.connect(user1).addLiquidity(ethers.parseEther("100"), ethers.parseEther("100"));

      const price = await swapPool.getPrice();
      expect(price).to.equal(ethers.parseEther("1")); // 1:1 ratio
    });

    it("Should handle swaps correctly with fees", async function () {
      const { swapPool, user1, user2, tokenA, tokenB } = await loadFixture(deployProtocolsFixture);

      // Add liquidity
      await tokenA.connect(user1).approve(await swapPool.getAddress(), ethers.parseEther("1000"));
      await tokenB.connect(user1).approve(await swapPool.getAddress(), ethers.parseEther("1000"));
      await swapPool.connect(user1).addLiquidity(ethers.parseEther("1000"), ethers.parseEther("1000"));

      // User2 swaps
      await tokenA.connect(user2).approve(await swapPool.getAddress(), ethers.parseEther("10"));
      const tx = await swapPool.connect(user2).swap(await tokenA.getAddress(), ethers.parseEther("10"));
      const receipt = await tx.wait();

      // Find Swap event
      const swapEvent = receipt.logs.find(log => {
        try {
          const parsed = swapPool.interface.parseLog(log);
          return parsed.name === "Swap";
        } catch {
          return false;
        }
      });

      expect(swapEvent).to.not.be.undefined;
    });

    it("Should handle price manipulation exploit", async function () {
      const { swapPool, user1, tokenA, tokenB, owner } = await loadFixture(deployProtocolsFixture);

      await tokenA.connect(user1).approve(await swapPool.getAddress(), ethers.parseEther("100"));
      await tokenB.connect(user1).approve(await swapPool.getAddress(), ethers.parseEther("100"));
      await swapPool.connect(user1).addLiquidity(ethers.parseEther("100"), ethers.parseEther("100"));

      const oldPrice = await swapPool.getPrice();

      // Trigger price manipulation
      await swapPool.connect(owner).triggerPriceManipulation(30);

      const newPrice = await swapPool.getPrice();
      expect(newPrice).to.not.equal(oldPrice);
    });

    it("Should handle liquidity drain exploit", async function () {
      const { swapPool, user1, tokenA, tokenB, owner } = await loadFixture(deployProtocolsFixture);

      await tokenA.connect(user1).approve(await swapPool.getAddress(), ethers.parseEther("100"));
      await tokenB.connect(user1).approve(await swapPool.getAddress(), ethers.parseEther("100"));
      await swapPool.connect(user1).addLiquidity(ethers.parseEther("100"), ethers.parseEther("100"));

      // Trigger liquidity drain
      await swapPool.connect(owner).triggerLiquidityDrain(50);

      const healthScore = await swapPool.getHealthScore();
      expect(healthScore).to.equal(0);

      const isExploited = await swapPool.isExploited();
      expect(isExploited).to.be.true;
    });

    it("Should prevent operations when exploited", async function () {
      const { swapPool, user1, tokenA, tokenB, owner } = await loadFixture(deployProtocolsFixture);

      await tokenA.connect(user1).approve(await swapPool.getAddress(), ethers.parseEther("100"));
      await tokenB.connect(user1).approve(await swapPool.getAddress(), ethers.parseEther("100"));
      await swapPool.connect(user1).addLiquidity(ethers.parseEther("100"), ethers.parseEther("100"));

      await swapPool.connect(owner).triggerLiquidityDrain(50);

      await expect(
        swapPool.connect(user1).addLiquidity(ethers.parseEther("10"), ethers.parseEther("10"))
      ).to.be.revertedWith("Pool is exploited");

      await expect(
        swapPool.connect(user1).swap(await tokenA.getAddress(), ethers.parseEther("1"))
      ).to.be.revertedWith("Pool is exploited");
    });
  });

  describe("Protocol Integration with Sentinel Vault", function () {
    it("Should complete full deposit-protect-withdraw flow", async function () {
      const { lendingPool, user1, tokenA, vault } = await loadFixture(deployProtocolsFixture);

      // User deposits DIRECTLY to lending pool (not through vault)
      await tokenA.connect(user1).approve(await lendingPool.getAddress(), ethers.parseEther("100"));
      await lendingPool.connect(user1).deposit(ethers.parseEther("100"));

      // Also deposit some to vault for the emergency withdrawal to work
      await tokenA.connect(user1).approve(await vault.getAddress(), ethers.parseEther("100"));
      await vault.connect(user1).deposit(ethers.parseEther("100"));

      // Authorize agent
      await vault.connect(user1).authorizeAgent(user1.address, 70);

      // Get initial vault balance
      const initialVaultBalance = await vault.getUserBalance(user1.address);

      // Simulate emergency withdrawal from lending pool
      await vault.connect(user1).emergencyWithdraw(
        user1.address,
        await lendingPool.getAddress(),
        ethers.parseEther("50"),
        75,
        "High risk detected"
      );

      // Check user's vault balance increased
      const finalVaultBalance = await vault.getUserBalance(user1.address);
      expect(finalVaultBalance).to.be.gt(initialVaultBalance);
    });

    it("Should handle multiple protocol protection", async function () {
      const { lendingPool, user1, tokenA, vault } = await loadFixture(deployProtocolsFixture);

      // User deposits to lending pool
      await tokenA.connect(user1).approve(await lendingPool.getAddress(), ethers.parseEther("100"));
      await lendingPool.connect(user1).deposit(ethers.parseEther("100"));

      // Deposit to vault
      await tokenA.connect(user1).approve(await vault.getAddress(), ethers.parseEther("100"));
      await vault.connect(user1).deposit(ethers.parseEther("100"));

      // Authorize agent
      await vault.connect(user1).authorizeAgent(user1.address, 70);

      const initialBalance = await vault.getUserBalance(user1.address);

      // Emergency withdraw from lending
      await vault.connect(user1).emergencyWithdraw(
        user1.address,
        await lendingPool.getAddress(),
        ethers.parseEther("50"),
        75,
        "High risk"
      );

      const finalBalance = await vault.getUserBalance(user1.address);
      expect(finalBalance).to.be.gt(initialBalance);
    });

    it("Should enforce risk tolerance threshold", async function () {
      const { lendingPool, user1, tokenA, vault } = await loadFixture(deployProtocolsFixture);

      // Deposit to lending pool
      await tokenA.connect(user1).approve(await lendingPool.getAddress(), ethers.parseEther("50"));
      await lendingPool.connect(user1).deposit(ethers.parseEther("50"));

      await tokenA.connect(user1).approve(await vault.getAddress(), ethers.parseEther("100"));
      await vault.connect(user1).deposit(ethers.parseEther("100"));

      // Authorize with high tolerance (90)
      await vault.connect(user1).authorizeAgent(user1.address, 90);

      // Try to withdraw with low risk score (should fail)
      await expect(
        vault.connect(user1).emergencyWithdraw(
          user1.address,
          await lendingPool.getAddress(),
          ethers.parseEther("50"),
          70, // Below threshold
          "Low risk"
        )
      ).to.be.revertedWith("Risk score below threshold");
    });

    it("Should enforce action cooldown", async function () {
      const { lendingPool, user1, tokenA, vault } = await loadFixture(deployProtocolsFixture);

      // Deposit to lending pool
      await tokenA.connect(user1).approve(await lendingPool.getAddress(), ethers.parseEther("100"));
      await lendingPool.connect(user1).deposit(ethers.parseEther("100"));

      await tokenA.connect(user1).approve(await vault.getAddress(), ethers.parseEther("200"));
      await vault.connect(user1).deposit(ethers.parseEther("200"));
      await vault.connect(user1).authorizeAgent(user1.address, 70);

      // First withdrawal
      await vault.connect(user1).emergencyWithdraw(
        user1.address,
        await lendingPool.getAddress(),
        ethers.parseEther("50"),
        75,
        "Risk 1"
      );

      // Immediate second withdrawal should fail
      await expect(
        vault.connect(user1).emergencyWithdraw(
          user1.address,
          await lendingPool.getAddress(),
          ethers.parseEther("50"),
          75,
          "Risk 2"
        )
      ).to.be.revertedWith("Action cooldown active");
    });
  });

  describe("Health Score Tests", function () {
    it("Should return correct health scores for different states", async function () {
      const { lendingPool, user1, tokenA, owner } = await loadFixture(deployProtocolsFixture);

      // Healthy state
      await tokenA.connect(user1).approve(await lendingPool.getAddress(), ethers.parseEther("100"));
      await lendingPool.connect(user1).deposit(ethers.parseEther("100"));
      expect(await lendingPool.getHealthScore()).to.equal(100);

      // Partially drained (30%)
      await lendingPool.connect(owner).triggerReserveDrain(30);
      const partialHealth = await lendingPool.getHealthScore();
      expect(partialHealth).to.be.lt(100);
      expect(partialHealth).to.be.gte(70); // Should be exactly 70 (70% reserves remaining)

      // Reset for next test
      await tokenA.connect(owner).approve(await lendingPool.getAddress(), ethers.MaxUint256);
      await lendingPool.connect(owner).resetExploit();

      // Deposit again for second test
      await tokenA.connect(user1).approve(await lendingPool.getAddress(), ethers.parseEther("100"));
      await lendingPool.connect(user1).deposit(ethers.parseEther("100"));

      // Drain heavily (51% - this will make reserves less than deposits)
      await lendingPool.connect(owner).triggerReserveDrain(51);
      const heavyDrainHealth = await lendingPool.getHealthScore();
      expect(heavyDrainHealth).to.be.lte(49);
      expect(heavyDrainHealth).to.be.gt(0);
    });
  });

  describe("Edge Cases", function () {
    it("Should handle zero balance withdrawFor", async function () {
      const { lendingPool, user1, vault } = await loadFixture(deployProtocolsFixture);

      // Impersonate vault
      await ethers.provider.send("hardhat_impersonateAccount", [await vault.getAddress()]);
      const vaultSigner = await ethers.getSigner(await vault.getAddress());

      // Fund vault with ETH for gas using setBalance
      await ethers.provider.send("hardhat_setBalance", [
        await vault.getAddress(),
        ethers.toQuantity(ethers.parseEther("10"))
      ]);

      // Try to withdraw from empty balance
      await expect(
        lendingPool.connect(vaultSigner).withdrawFor(user1.address, ethers.parseEther("100"))
      ).to.be.revertedWith("No deposit found");

      await ethers.provider.send("hardhat_stopImpersonatingAccount", [await vault.getAddress()]);
    });

    it("Should handle withdrawal of entire balance", async function () {
      const { lendingPool, user1, tokenA, vault } = await loadFixture(deployProtocolsFixture);

      await tokenA.connect(user1).approve(await lendingPool.getAddress(), ethers.parseEther("100"));
      await lendingPool.connect(user1).deposit(ethers.parseEther("100"));

      // Impersonate vault
      await ethers.provider.send("hardhat_impersonateAccount", [await vault.getAddress()]);
      const vaultSigner = await ethers.getSigner(await vault.getAddress());

      // Fund vault with ETH for gas using setBalance
      await ethers.provider.send("hardhat_setBalance", [
        await vault.getAddress(),
        ethers.toQuantity(ethers.parseEther("10"))
      ]);

      // Withdraw all (0 means withdraw all)
      await lendingPool.connect(vaultSigner).withdrawFor(user1.address, 0);

      await ethers.provider.send("hardhat_stopImpersonatingAccount", [await vault.getAddress()]);

      const balance = await lendingPool.getBalance(user1.address);
      expect(balance).to.equal(0);
    });

    it("Should prevent unauthorized protocol operations", async function () {
      const { lendingPool, user1, user2 } = await loadFixture(deployProtocolsFixture);

      await expect(
        lendingPool.connect(user2).withdrawFor(user1.address, ethers.parseEther("10"))
      ).to.be.revertedWith("Only Sentinel Vault");
    });
  });
});