// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SimpleLendingPool
 * @notice Mock lending protocol for Sentinel demo - intentionally exploitable
 * @dev Simple lending pool where users deposit tokens to earn yield
 */
contract SimpleLendingPool is ReentrancyGuard, Ownable {
    
    // ============ State Variables ============
    
    IERC20 public immutable token;
    
    mapping(address => uint256) public deposits;
    mapping(address => uint256) public depositTime;
    mapping(address => uint256) public lastClaimTime;
    
    uint256 public totalDeposits;
    uint256 public totalBorrowed;
    uint256 public totalReserves;
    uint256 public interestRate; // Annual interest rate in basis points (e.g., 500 = 5%)
    uint256 public utilizationRate; // Current utilization rate
    
    bool public isExploited;
    bool public isPaused;
    
    address public sentinelVault;
    
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public constant MAX_INTEREST_RATE = 2000; // 20% max
    uint256 public constant MIN_DEPOSIT = 100; // Minimum deposit amount
    
    // ============ Events ============
    
    event Deposit(address indexed user, uint256 amount, uint256 timestamp);
    event Withdrawal(address indexed user, uint256 amount, uint256 interest, uint256 timestamp);
    event InterestClaimed(address indexed user, uint256 amount, uint256 timestamp);
    event EmergencyWithdrawal(address indexed user, uint256 amount, uint256 timestamp);
    event InterestRateUpdated(uint256 oldRate, uint256 newRate, uint256 timestamp);
    event UtilizationUpdated(uint256 utilization, uint256 timestamp);
    event ReservesUpdated(uint256 reserves, uint256 timestamp);
    event ExploitTriggered(string reason, uint256 amount, uint256 timestamp);
    event ExploitReset(uint256 timestamp);
    
    // ============ Constructor ============
    
    constructor(address _token) {
        require(_token != address(0), "Invalid token address");
        
        token = IERC20(_token);
        interestRate = 500; // 5% default annual rate
    }
    
    // ============ Configuration ============
    
    function setSentinelVault(address _sentinelVault) external onlyOwner {
        require(_sentinelVault != address(0), "Invalid vault address");
        sentinelVault = _sentinelVault;
    }
    
    function setInterestRate(uint256 _newRate) external onlyOwner {
        require(_newRate <= MAX_INTEREST_RATE, "Interest rate too high");
        require(_newRate > 0, "Interest rate must be positive");
        
        uint256 oldRate = interestRate;
        interestRate = _newRate;
        
        emit InterestRateUpdated(oldRate, _newRate, block.timestamp);
    }
    
    function pausePool() external onlyOwner {
        require(!isPaused, "Already paused");
        isPaused = true;
    }
    
    function unpausePool() external onlyOwner {
        require(isPaused, "Not paused");
        isPaused = false;
    }
    
    // ============ Core Lending Functions ============
    
    /**
     * @notice Deposit tokens to earn interest
     * @param amount Amount of tokens to deposit
     */
    function deposit(uint256 amount) external nonReentrant {
        require(!isPaused, "Pool is paused");
        require(!isExploited, "Pool is exploited");
        require(amount >= MIN_DEPOSIT, "Amount below minimum");
        
        require(token.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        
        // If user has existing deposit, claim interest first
        if (deposits[msg.sender] > 0) {
            _claimInterest(msg.sender);
        }
        
        deposits[msg.sender] += amount;
        depositTime[msg.sender] = block.timestamp;
        lastClaimTime[msg.sender] = block.timestamp;
        
        totalDeposits += amount;
        totalReserves += amount;
        
        _updateUtilization();
        
        emit Deposit(msg.sender, amount, block.timestamp);
        emit ReservesUpdated(totalReserves, block.timestamp);
    }
    
    /**
     * @notice Withdraw deposited tokens plus earned interest
     * @param amount Amount to withdraw (0 = withdraw all)
     */
    function withdraw(uint256 amount) external nonReentrant {
        require(!isPaused, "Pool is paused");
        require(deposits[msg.sender] > 0, "No deposit found");
        
        uint256 userDeposit = deposits[msg.sender];
        uint256 earnedInterest = _calculateInterest(msg.sender);
        uint256 totalAvailable = userDeposit + earnedInterest;
        
        if (amount == 0) {
            amount = totalAvailable;
        }
        
        require(amount <= totalAvailable, "Insufficient balance");
        require(amount <= totalReserves, "Insufficient reserves");
        
        // Update user's deposit
        if (amount >= userDeposit) {
            // Withdrawing all deposit + interest
            deposits[msg.sender] = 0;
            depositTime[msg.sender] = 0;
            lastClaimTime[msg.sender] = 0;
        } else {
            // Partial withdrawal
            deposits[msg.sender] -= amount;
            lastClaimTime[msg.sender] = block.timestamp;
        }
        
        totalDeposits -= (amount > earnedInterest ? amount - earnedInterest : 0);
        totalReserves -= amount;
        
        require(token.transfer(msg.sender, amount), "Transfer failed");
        
        _updateUtilization();
        
        emit Withdrawal(msg.sender, amount, earnedInterest, block.timestamp);
        emit ReservesUpdated(totalReserves, block.timestamp);
    }
    
    /**
     * @notice Claim earned interest without withdrawing principal
     */
    function claimInterest() external nonReentrant {
        require(deposits[msg.sender] > 0, "No deposit found");
        
        uint256 interest = _claimInterest(msg.sender);
        require(interest > 0, "No interest to claim");
        require(interest <= totalReserves, "Insufficient reserves");
        
        totalReserves -= interest;
        
        require(token.transfer(msg.sender, interest), "Transfer failed");
        
        emit InterestClaimed(msg.sender, interest, block.timestamp);
        emit ReservesUpdated(totalReserves, block.timestamp);
    }
    
    // ============ Sentinel Integration ============
    
    /**
     * @notice Emergency withdrawal by Sentinel
     * @param user User whose funds to withdraw
     * @param amount Amount to withdraw (0 = withdraw all)
     */
    function withdrawFor(address user, uint256 amount) external nonReentrant returns (bool) {
        require(msg.sender == sentinelVault, "Only Sentinel Vault");
        require(deposits[user] > 0, "No deposit found");
        
        uint256 userDeposit = deposits[user];
        uint256 earnedInterest = _calculateInterest(user);
        uint256 totalAvailable = userDeposit + earnedInterest;
        
        if (amount == 0) {
            amount = totalAvailable;
        }
        
        require(amount <= totalAvailable, "Insufficient balance");
        require(amount <= totalReserves, "Insufficient reserves");
        
        // Update user's deposit
        if (amount >= userDeposit) {
            deposits[user] = 0;
            depositTime[user] = 0;
            lastClaimTime[user] = 0;
        } else {
            deposits[user] -= amount;
            lastClaimTime[user] = block.timestamp;
        }
        
        totalDeposits -= (amount > earnedInterest ? amount - earnedInterest : 0);
        totalReserves -= amount;
        
        require(token.transfer(sentinelVault, amount), "Transfer failed");
        
        _updateUtilization();
        
        emit EmergencyWithdrawal(user, amount, block.timestamp);
        emit ReservesUpdated(totalReserves, block.timestamp);
        
        return true;
    }
    
    /**
     * @notice Get user's total balance (deposit + interest)
     * @param user User address
     * @return Total balance including interest
     */
    function getBalance(address user) external view returns (uint256) {
        if (deposits[user] == 0) return 0;
        
        uint256 earnedInterest = _calculateInterest(user);
        return deposits[user] + earnedInterest;
    }
    
    // ============ View Functions ============
    
    /**
     * @notice Get total value locked in the pool
     * @return Total deposits
     */
    function getTVL() external view returns (uint256) {
        return totalDeposits;
    }
    
    /**
     * @notice Calculate protocol health score
     * @return Health score (0-100)
     */
    function getHealthScore() external view returns (uint8) {
        if (isExploited) return 0;
        if (isPaused) return 25;
        if (totalDeposits == 0) return 100;
        
        // Check if reserves match deposits
        uint256 expectedReserves = totalDeposits;
        if (totalReserves < expectedReserves) {
            // Calculate health based on reserve ratio
            return uint8((totalReserves * 100) / expectedReserves);
        }
        
        return 100;
    }
    
    /**
     * @notice Get current utilization rate
     * @return Utilization rate in basis points
     */
    function getUtilizationRate() external view returns (uint256) {
        return utilizationRate;
    }
    
    /**
     * @notice Get user's deposit info
     * @param user User address
     * @return depositAmount, depositTime, earnedInterest
     */
    function getUserInfo(address user) external view returns (uint256, uint256, uint256) {
        uint256 earnedInterest = _calculateInterest(user);
        return (deposits[user], depositTime[user], earnedInterest);
    }
    
    /**
     * @notice Calculate interest for a user
     * @param user User address
     * @return Interest amount
     */
    function calculateInterest(address user) external view returns (uint256) {
        return _calculateInterest(user);
    }
    
    // ============ Demo/Exploit Functions ============
    
    /**
     * @notice Trigger reserve drain for demo
     * @param percentToDrain Percentage of reserves to drain (1-100)
     */
    function triggerReserveDrain(uint256 percentToDrain) external onlyOwner {
        require(percentToDrain > 0 && percentToDrain <= 100, "Invalid percent");
        require(totalReserves > 0, "No reserves to drain");
        
        uint256 drainAmount = (totalReserves * percentToDrain) / 100;
        
        totalReserves -= drainAmount;
        isExploited = true;
        
        require(token.transfer(owner(), drainAmount), "Transfer failed");
        
        emit ExploitTriggered("Reserve drain", drainAmount, block.timestamp);
        emit ReservesUpdated(totalReserves, block.timestamp);
    }
    
    /**
     * @notice Trigger interest rate manipulation for demo
     * @param newRate New interest rate (can be very high)
     */
    function triggerInterestManipulation(uint256 newRate) external onlyOwner {
        require(newRate > 0, "Rate must be positive");
        
        uint256 oldRate = interestRate;
        interestRate = newRate;
        
        emit InterestRateUpdated(oldRate, newRate, block.timestamp);
        emit ExploitTriggered("Interest manipulation", newRate, block.timestamp);
    }
    
    /**
     * @notice Trigger utilization spike for demo
     * @param newUtilization New utilization rate
     */
    function triggerUtilizationSpike(uint256 newUtilization) external onlyOwner {
        require(newUtilization <= BASIS_POINTS, "Invalid utilization");
        
        utilizationRate = newUtilization;
        
        emit UtilizationUpdated(newUtilization, block.timestamp);
        emit ExploitTriggered("Utilization spike", newUtilization, block.timestamp);
    }
    
    /**
     * @notice Reset exploit for another demo
     */
    function resetExploit() external onlyOwner {
        require(isExploited, "Not exploited");
        
        // Return drained funds
        uint256 balance = token.balanceOf(owner());
        if (balance > 0) {
            require(token.transferFrom(owner(), address(this), balance), "Transfer failed");
            totalReserves += balance;
        }
        
        isExploited = false;
        interestRate = 500; // Reset to 5%
        utilizationRate = 0;
        
        emit ExploitReset(block.timestamp);
        emit ReservesUpdated(totalReserves, block.timestamp);
    }
    
    // ============ Internal Functions ============
    
    /**
     * @notice Calculate interest for a user
     * @param user User address
     * @return Interest amount
     */
    function _calculateInterest(address user) internal view returns (uint256) {
        if (deposits[user] == 0) return 0;
        
        uint256 timeElapsed = block.timestamp - lastClaimTime[user];
        uint256 annualInterest = (deposits[user] * interestRate) / BASIS_POINTS;
        
        // Calculate interest based on time elapsed
        return (annualInterest * timeElapsed) / 365 days;
    }
    
    /**
     * @notice Claim interest for a user and update last claim time
     * @param user User address
     * @return Interest amount
     */
    function _claimInterest(address user) internal returns (uint256) {
        uint256 interest = _calculateInterest(user);
        lastClaimTime[user] = block.timestamp;
        return interest;
    }
    
    /**
     * @notice Update utilization rate
     */
    function _updateUtilization() internal {
        if (totalDeposits == 0) {
            utilizationRate = 0;
        } else {
            utilizationRate = (totalBorrowed * BASIS_POINTS) / totalDeposits;
        }
        
        emit UtilizationUpdated(utilizationRate, block.timestamp);
    }
}
