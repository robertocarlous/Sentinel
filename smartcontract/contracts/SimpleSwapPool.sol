// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SimpleSwapPool
 * @notice Mock DEX protocol for Sentinel demo - intentionally exploitable
 */
contract SimpleSwapPool is ReentrancyGuard, Ownable {
    
    // ============ State Variables ============
    
    IERC20 public immutable tokenA;
    IERC20 public immutable tokenB;
    
    mapping(address => uint256) public liquidityProviders;
    
    uint256 public reserveA;
    uint256 public reserveB;
    uint256 public totalLiquidity;
    uint256 public lastPrice;
    bool public isExploited;
    
    address public sentinelVault;
    
    uint256 public constant FEE_PERCENT = 30; // 0.3% fee (30/10000)
    uint256 public constant FEE_DENOMINATOR = 10000;
    uint256 public constant MIN_LIQUIDITY = 1000;
    
    // ============ Events ============
    
    event LiquidityAdded(address indexed provider, uint256 amountA, uint256 amountB, uint256 lpTokens, uint256 timestamp);
    event LiquidityRemoved(address indexed provider, uint256 amountA, uint256 amountB, uint256 lpTokens, uint256 timestamp);
    event Swap(address indexed user, address indexed tokenIn, uint256 amountIn, address indexed tokenOut, uint256 amountOut, uint256 timestamp);
    event EmergencyLiquidityRemoved(address indexed user, uint256 amountA, uint256 amountB, uint256 timestamp);
    event PriceChanged(uint256 oldPrice, uint256 newPrice, int256 changePercent, uint256 timestamp);
    event ReservesChanged(uint256 reserveA, uint256 reserveB, uint256 timestamp);
    event PriceManipulated(uint256 oldPrice, uint256 newPrice, uint256 timestamp);
    event LiquidityDrained(uint256 amount, uint256 timestamp);
    event ExploitReset(uint256 timestamp);
    
    // ============ Constructor ============
    
    constructor(address _tokenA, address _tokenB) {
        require(_tokenA != address(0) && _tokenB != address(0), "Invalid token addresses");
        require(_tokenA != _tokenB, "Tokens must be different");
        
        tokenA = IERC20(_tokenA);
        tokenB = IERC20(_tokenB);
    }
    
    // ============ Configuration ============
    
    function setSentinelVault(address _sentinelVault) external onlyOwner {
        require(_sentinelVault != address(0), "Invalid vault address");
        sentinelVault = _sentinelVault;
    }
    
    // ============ Core Functions ============
    
    /**
     * @notice Add liquidity to the pool
     */
    function addLiquidity(uint256 amountA, uint256 amountB) external nonReentrant returns (uint256 lpTokens) {
        require(amountA > 0 && amountB > 0, "Amounts must be greater than 0");
        require(!isExploited, "Pool is exploited");
        
        uint256 oldPrice = _getPrice();
        
        if (totalLiquidity == 0) {
            // First liquidity provider
            lpTokens = _sqrt(amountA * amountB);
            require(lpTokens > MIN_LIQUIDITY, "Insufficient initial liquidity");
        } else {
            // Subsequent liquidity providers
            uint256 lpFromA = (amountA * totalLiquidity) / reserveA;
            uint256 lpFromB = (amountB * totalLiquidity) / reserveB;
            lpTokens = lpFromA < lpFromB ? lpFromA : lpFromB;
        }
        
        require(lpTokens > 0, "Insufficient liquidity minted");
        
        require(tokenA.transferFrom(msg.sender, address(this), amountA), "Transfer A failed");
        require(tokenB.transferFrom(msg.sender, address(this), amountB), "Transfer B failed");
        
        liquidityProviders[msg.sender] += lpTokens;
        reserveA += amountA;
        reserveB += amountB;
        totalLiquidity += lpTokens;
        
        emit LiquidityAdded(msg.sender, amountA, amountB, lpTokens, block.timestamp);
        emit ReservesChanged(reserveA, reserveB, block.timestamp);
        
        uint256 newPrice = _getPrice();
        if (oldPrice > 0) {
            _emitPriceChange(oldPrice, newPrice);
        }
        
        return lpTokens;
    }
    
    /**
     * @notice Remove liquidity from the pool
     */
    function removeLiquidity(uint256 lpTokens) external nonReentrant returns (uint256 amountA, uint256 amountB) {
        require(lpTokens > 0, "LP tokens must be greater than 0");
        require(lpTokens <= liquidityProviders[msg.sender], "Insufficient LP tokens");
        require(!isExploited, "Pool is exploited");
        
        uint256 oldPrice = _getPrice();
        
        amountA = (lpTokens * reserveA) / totalLiquidity;
        amountB = (lpTokens * reserveB) / totalLiquidity;
        
        require(amountA > 0 && amountB > 0, "Insufficient liquidity burned");
        
        liquidityProviders[msg.sender] -= lpTokens;
        reserveA -= amountA;
        reserveB -= amountB;
        totalLiquidity -= lpTokens;
        
        require(tokenA.transfer(msg.sender, amountA), "Transfer A failed");
        require(tokenB.transfer(msg.sender, amountB), "Transfer B failed");
        
        emit LiquidityRemoved(msg.sender, amountA, amountB, lpTokens, block.timestamp);
        emit ReservesChanged(reserveA, reserveB, block.timestamp);
        
        uint256 newPrice = _getPrice();
        _emitPriceChange(oldPrice, newPrice);
        
        return (amountA, amountB);
    }
    
    /**
     * @notice Swap tokens
     */
    function swap(address tokenIn, uint256 amountIn) external nonReentrant returns (uint256 amountOut) {
        require(amountIn > 0, "Amount must be greater than 0");
        require(tokenIn == address(tokenA) || tokenIn == address(tokenB), "Invalid token");
        require(!isExploited, "Pool is exploited");
        
        uint256 oldPrice = _getPrice();
        
        bool isTokenA = tokenIn == address(tokenA);
        IERC20 inputToken = isTokenA ? tokenA : tokenB;
        IERC20 outputToken = isTokenA ? tokenB : tokenA;
        
        uint256 reserveIn = isTokenA ? reserveA : reserveB;
        uint256 reserveOut = isTokenA ? reserveB : reserveA;
        
        require(inputToken.transferFrom(msg.sender, address(this), amountIn), "Transfer in failed");
        
        // Apply fee: amountInWithFee = amountIn * (10000 - 30) / 10000
        uint256 amountInWithFee = amountIn * (FEE_DENOMINATOR - FEE_PERCENT);
        
        // Constant product formula: x * y = k
        // amountOut = (reserveOut * amountInWithFee) / (reserveIn * 10000 + amountInWithFee)
        amountOut = (reserveOut * amountInWithFee) / (reserveIn * FEE_DENOMINATOR + amountInWithFee);
        
        require(amountOut > 0, "Insufficient output amount");
        require(amountOut < reserveOut, "Insufficient liquidity");
        
        if (isTokenA) {
            reserveA += amountIn;
            reserveB -= amountOut;
        } else {
            reserveB += amountIn;
            reserveA -= amountOut;
        }
        
        require(outputToken.transfer(msg.sender, amountOut), "Transfer out failed");
        
        emit Swap(msg.sender, tokenIn, amountIn, address(outputToken), amountOut, block.timestamp);
        emit ReservesChanged(reserveA, reserveB, block.timestamp);
        
        uint256 newPrice = _getPrice();
        _emitPriceChange(oldPrice, newPrice);
        
        return amountOut;
    }
    
    // ============ Sentinel Integration ============
    
    /**
     * @notice Emergency removal of liquidity by Sentinel
     */
    function emergencyRemoveLiquidity(address user, uint256 lpTokens) external nonReentrant returns (uint256 amountA, uint256 amountB) {
        require(msg.sender == sentinelVault, "Only Sentinel Vault");
        require(lpTokens > 0, "LP tokens must be greater than 0");
        require(lpTokens <= liquidityProviders[user], "Insufficient LP tokens");
        
        amountA = (lpTokens * reserveA) / totalLiquidity;
        amountB = (lpTokens * reserveB) / totalLiquidity;
        
        require(amountA > 0 && amountB > 0, "Insufficient liquidity burned");
        
        liquidityProviders[user] -= lpTokens;
        reserveA -= amountA;
        reserveB -= amountB;
        totalLiquidity -= lpTokens;
        
        require(tokenA.transfer(sentinelVault, amountA), "Transfer A failed");
        require(tokenB.transfer(sentinelVault, amountB), "Transfer B failed");
        
        emit EmergencyLiquidityRemoved(user, amountA, amountB, block.timestamp);
        emit ReservesChanged(reserveA, reserveB, block.timestamp);
        
        return (amountA, amountB);
    }
    
    /**
     * @notice For compatibility with IProtocol interface
     */
    function withdrawFor(address user, uint256 amount) external nonReentrant returns (bool) {
        require(msg.sender == sentinelVault, "Only Sentinel Vault");
        
        uint256 lpTokens = liquidityProviders[user];
        if (lpTokens == 0) return false;
        
        // Use amount as percentage (0-100) of user's LP tokens to withdraw
        uint256 tokensToWithdraw = (lpTokens * amount) / 100;
        if (tokensToWithdraw == 0) tokensToWithdraw = lpTokens;
        
        uint256 amountA = (tokensToWithdraw * reserveA) / totalLiquidity;
        uint256 amountB = (tokensToWithdraw * reserveB) / totalLiquidity;
        
        liquidityProviders[user] -= tokensToWithdraw;
        reserveA -= amountA;
        reserveB -= amountB;
        totalLiquidity -= tokensToWithdraw;
        
        require(tokenA.transfer(sentinelVault, amountA), "Transfer A failed");
        require(tokenB.transfer(sentinelVault, amountB), "Transfer B failed");
        
        emit EmergencyLiquidityRemoved(user, amountA, amountB, block.timestamp);
        
        return true;
    }
    
    /**
     * @notice Get user's balance (LP tokens value)
     */
    function getBalance(address user) external view returns (uint256) {
        if (totalLiquidity == 0) return 0;
        
        uint256 lpTokens = liquidityProviders[user];
        uint256 valueA = (lpTokens * reserveA) / totalLiquidity;
        uint256 valueB = (lpTokens * reserveB) / totalLiquidity;
        
        // Return combined value (simplified)
        return valueA + valueB;
    }
    
    // ============ View Functions ============
    
    /**
     * @notice Get current reserves
     */
    function getReserves() external view returns (uint256, uint256) {
        return (reserveA, reserveB);
    }
    
    /**
     * @notice Get current price (tokenA per tokenB)
     */
    function getPrice() external view returns (uint256) {
        return _getPrice();
    }
    
    function _getPrice() internal view returns (uint256) {
        if (reserveB == 0) return 0;
        return (reserveA * 1e18) / reserveB;
    }
    
    /**
     * @notice Get total value locked
     */
    function getTVL() external view returns (uint256) {
        // Simplified: return sum of reserves
        return reserveA + reserveB;
    }
    
    /**
     * @notice Calculate protocol health score
     */
    function getHealthScore() external view returns (uint8) {
        if (isExploited) return 0;
        if (totalLiquidity == 0) return 100;
        
        uint256 balanceA = tokenA.balanceOf(address(this));
        uint256 balanceB = tokenB.balanceOf(address(this));
        
        if (balanceA < reserveA || balanceB < reserveB) return 0;
        
        return 100;
    }
    
    // ============ Demo/Exploit Functions ============
    
    /**
     * @notice Trigger price manipulation for demo
     */
    function triggerPriceManipulation(uint256 manipulationPercent) external onlyOwner {
        require(manipulationPercent > 0 && manipulationPercent <= 100, "Invalid percent");
        
        uint256 oldPrice = _getPrice();
        
        // Manipulate reserves to change price
        uint256 change = (reserveA * manipulationPercent) / 100;
        
        if (reserveA > change) {
            reserveA -= change;
            reserveB += change;
        }
        
        uint256 newPrice = _getPrice();
        
        emit PriceManipulated(oldPrice, newPrice, block.timestamp);
        emit ReservesChanged(reserveA, reserveB, block.timestamp);
        _emitPriceChange(oldPrice, newPrice);
    }
    
    /**
     * @notice Trigger liquidity drain for demo
     */
    function triggerLiquidityDrain(uint256 percentToDrain) external onlyOwner {
        require(percentToDrain > 0 && percentToDrain <= 100, "Invalid percent");
        
        uint256 drainA = (reserveA * percentToDrain) / 100;
        uint256 drainB = (reserveB * percentToDrain) / 100;
        
        reserveA -= drainA;
        reserveB -= drainB;
        isExploited = true;
        
        require(tokenA.transfer(owner(), drainA), "Transfer A failed");
        require(tokenB.transfer(owner(), drainB), "Transfer B failed");
        
        emit LiquidityDrained(drainA + drainB, block.timestamp);
        emit ReservesChanged(reserveA, reserveB, block.timestamp);
    }
    
    /**
     * @notice Reset exploit for another demo
     */
    function resetExploit() external onlyOwner {
        require(isExploited, "Not exploited");
        
        // Return drained funds
        uint256 balanceA = tokenA.balanceOf(owner());
        uint256 balanceB = tokenB.balanceOf(owner());
        
        if (balanceA > 0) {
            require(tokenA.transferFrom(owner(), address(this), balanceA), "Transfer A failed");
            reserveA += balanceA;
        }
        
        if (balanceB > 0) {
            require(tokenB.transferFrom(owner(), address(this), balanceB), "Transfer B failed");
            reserveB += balanceB;
        }
        
        isExploited = false;
        
        emit ExploitReset(block.timestamp);
        emit ReservesChanged(reserveA, reserveB, block.timestamp);
    }
    
    // ============ Internal Functions ============
    
    function _emitPriceChange(uint256 oldPrice, uint256 newPrice) internal {
        if (oldPrice == 0) return;
        
        int256 changePercent = int256((newPrice * 100) / oldPrice) - 100;
        
        emit PriceChanged(oldPrice, newPrice, changePercent, block.timestamp);
    }
    
    function _sqrt(uint256 x) internal pure returns (uint256) {
        if (x == 0) return 0;
        
        uint256 z = (x + 1) / 2;
        uint256 y = x;
        
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
        
        return y;
    }
}