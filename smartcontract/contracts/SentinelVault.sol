// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./IProtocol.sol";

/**
 * @title SentinelVault
 * @notice Main vault contract that holds user funds and enables autonomous AI agent protection
 * @dev Secure vault with agent authorization and emergency withdrawal capabilities
 */
contract SentinelVault is ReentrancyGuard {
    
    // ============ Ownership ============
    
    address public owner;
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "Invalid address");
        owner = newOwner;
    }
    
    // ============ Structs ============
    
    struct Position {
        address protocol;
        uint256 amount;
        uint256 deployedAt;
        bool isActive;
    }
    
    struct AgentInfo {
        address agentAddress;
        bool isAuthorized;
        bool isPaused;
        uint8 riskTolerance;
        uint256 authorizedAt;
    }
    
    // ============ State Variables ============
    
    mapping(address => uint256) public userBalances;
    mapping(address => AgentInfo) public userAgents;
    mapping(address => Position[]) public userPositions;
    mapping(address => bool) public whitelistedProtocols;
    mapping(address => uint256) public lastActionTime;
    
    uint256 public totalValueLocked;
    bool public contractPaused;
    
    uint256 public constant MIN_RISK_THRESHOLD = 60;
    uint256 public constant MAX_RISK_THRESHOLD = 90;
    uint256 public constant ACTION_COOLDOWN = 30; // 30 seconds between actions
    
    IERC20 public immutable token; // Main token (can be wrapped native token)
    
    // ============ Events ============
    
    event Deposit(address indexed user, uint256 amount, uint256 timestamp);
    event Withdrawal(address indexed user, uint256 amount, uint256 timestamp);
    event AgentAuthorized(address indexed user, address indexed agent, uint8 riskTolerance, uint256 timestamp);
    event AgentRevoked(address indexed user, uint256 timestamp);
    event AgentPaused(address indexed user, uint256 timestamp);
    event AgentResumed(address indexed user, uint256 timestamp);
    event RiskToleranceUpdated(address indexed user, uint8 newTolerance, uint256 timestamp);
    event EmergencyWithdrawal(
        address indexed user,
        address indexed protocol,
        uint256 amount,
        uint8 riskScore,
        string reason,
        address indexed agent,
        uint256 timestamp
    );
    event FundsDeployed(address indexed user, address indexed protocol, uint256 amount, uint256 timestamp);
    event FundsRecalled(address indexed user, address indexed protocol, uint256 amount, uint256 timestamp);
    event ProtocolWhitelisted(address indexed protocol, uint256 timestamp);
    event ProtocolRemoved(address indexed protocol, uint256 timestamp);
    event ContractPaused(uint256 timestamp);
    event ContractUnpaused(uint256 timestamp);
    
    // ============ Modifiers ============
    
    modifier whenNotPaused() {
        require(!contractPaused, "Contract is paused");
        _;
    }
    
    modifier onlyAuthorizedAgent(address user) {
        AgentInfo memory agentInfo = userAgents[user];
        require(agentInfo.agentAddress == msg.sender, "Not authorized agent");
        require(agentInfo.isAuthorized, "Agent not authorized");
        require(!agentInfo.isPaused, "Agent is paused");
        _;
    }
    
    // ============ Constructor ============
    
    constructor(address _token) {
        owner = msg.sender;
        token = IERC20(_token);
    }
    
    // ============ User Deposit/Withdrawal Functions ============
    
    /**
     * @notice Deposit tokens into the vault
     * @param amount Amount of tokens to deposit
     */
    function deposit(uint256 amount) external nonReentrant whenNotPaused {
        require(amount > 0, "Amount must be greater than 0");
        require(token.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        
        userBalances[msg.sender] += amount;
        totalValueLocked += amount;
        
        emit Deposit(msg.sender, amount, block.timestamp);
    }
    
    /**
     * @notice Withdraw tokens from the vault
     * @param amount Amount of tokens to withdraw
     */
    function withdraw(uint256 amount) external nonReentrant whenNotPaused {
        require(amount > 0, "Amount must be greater than 0");
        require(amount <= userBalances[msg.sender], "Insufficient balance");
        
        userBalances[msg.sender] -= amount;
        totalValueLocked -= amount;
        
        require(token.transfer(msg.sender, amount), "Transfer failed");
        
        emit Withdrawal(msg.sender, amount, block.timestamp);
    }
    
    /**
     * @notice Withdraw all tokens from the vault
     */
    function withdrawAll() external nonReentrant whenNotPaused {
        uint256 amount = userBalances[msg.sender];
        require(amount > 0, "No balance to withdraw");
        
        userBalances[msg.sender] = 0;
        totalValueLocked -= amount;
        
        require(token.transfer(msg.sender, amount), "Transfer failed");
        
        emit Withdrawal(msg.sender, amount, block.timestamp);
    }
    
    // ============ Agent Authorization Functions ============
    
    /**
     * @notice Authorize an AI agent to protect your funds
     * @param agentAddress Address of the agent
     * @param riskTolerance Risk threshold (60=Conservative, 75=Moderate, 90=Aggressive)
     */
    function authorizeAgent(address agentAddress, uint8 riskTolerance) external {
        require(agentAddress != address(0), "Invalid agent address");
        require(riskTolerance >= MIN_RISK_THRESHOLD && riskTolerance <= MAX_RISK_THRESHOLD, 
                "Invalid risk tolerance");
        
        userAgents[msg.sender] = AgentInfo({
            agentAddress: agentAddress,
            isAuthorized: true,
            isPaused: false,
            riskTolerance: riskTolerance,
            authorizedAt: block.timestamp
        });
        
        emit AgentAuthorized(msg.sender, agentAddress, riskTolerance, block.timestamp);
    }
    
    /**
     * @notice Revoke agent authorization permanently
     */
    function revokeAgent() external {
        require(userAgents[msg.sender].isAuthorized, "No agent authorized");
        
        userAgents[msg.sender].isAuthorized = false;
        
        emit AgentRevoked(msg.sender, block.timestamp);
    }
    
    /**
     * @notice Temporarily pause agent actions
     */
    function pauseAgent() external {
        require(userAgents[msg.sender].isAuthorized, "No agent authorized");
        require(!userAgents[msg.sender].isPaused, "Agent already paused");
        
        userAgents[msg.sender].isPaused = true;
        
        emit AgentPaused(msg.sender, block.timestamp);
    }
    
    /**
     * @notice Resume agent actions
     */
    function resumeAgent() external {
        require(userAgents[msg.sender].isAuthorized, "No agent authorized");
        require(userAgents[msg.sender].isPaused, "Agent not paused");
        
        userAgents[msg.sender].isPaused = false;
        
        emit AgentResumed(msg.sender, block.timestamp);
    }
    
    /**
     * @notice Update risk tolerance setting
     * @param newTolerance New risk threshold (60-90)
     */
    function updateRiskTolerance(uint8 newTolerance) external {
        require(userAgents[msg.sender].isAuthorized, "No agent authorized");
        require(newTolerance >= MIN_RISK_THRESHOLD && newTolerance <= MAX_RISK_THRESHOLD, 
                "Invalid risk tolerance");
        
        userAgents[msg.sender].riskTolerance = newTolerance;
        
        emit RiskToleranceUpdated(msg.sender, newTolerance, block.timestamp);
    }
    
    // ============ Emergency Protection Functions ============
    
    /**
     * @notice Agent executes emergency withdrawal to protect user funds
     * @param user User whose funds to protect
     * @param protocol Protocol to withdraw from
     * @param amount Amount to withdraw
     * @param riskScore Current risk score (0-100)
     * @param reason Explanation for the withdrawal
     */
    function emergencyWithdraw(
        address user,
        address protocol,
        uint256 amount,
        uint8 riskScore,
        string calldata reason
    ) external nonReentrant whenNotPaused onlyAuthorizedAgent(user) returns (bool) {
        AgentInfo memory agentInfo = userAgents[user];
        
        require(riskScore >= agentInfo.riskTolerance, "Risk score below threshold");
        require(amount > 0, "Amount must be greater than 0");
        require(whitelistedProtocols[protocol], "Protocol not whitelisted");
        require(block.timestamp >= lastActionTime[user] + ACTION_COOLDOWN, "Action cooldown active");
        
        // Update last action time
        lastActionTime[user] = block.timestamp;
        
        // Call protocol to withdraw funds
        bool success = IProtocol(protocol).withdrawFor(user, amount);
        require(success, "Protocol withdrawal failed");
        
        // Update user balance in vault
        userBalances[user] += amount;
        
        // Update position status
        _updatePosition(user, protocol, amount);
        
        emit EmergencyWithdrawal(user, protocol, amount, riskScore, reason, msg.sender, block.timestamp);
        
        return true;
    }
    
    /**
     * @notice Agent executes multiple emergency withdrawals
     * @param user User whose funds to protect
     * @param protocols Array of protocols to withdraw from
     * @param amounts Array of amounts to withdraw
     * @param riskScore Current risk score
     * @param reason Explanation for the withdrawals
     */
    function emergencyWithdrawMultiple(
        address user,
        address[] calldata protocols,
        uint256[] calldata amounts,
        uint8 riskScore,
        string calldata reason
    ) external nonReentrant whenNotPaused onlyAuthorizedAgent(user) returns (bool) {
        require(protocols.length == amounts.length, "Array length mismatch");
        require(protocols.length > 0, "Empty arrays");
        
        require(riskScore >= userAgents[user].riskTolerance, "Risk score below threshold");
        require(block.timestamp >= lastActionTime[user] + ACTION_COOLDOWN, "Action cooldown active");
        
        lastActionTime[user] = block.timestamp;
        
        for (uint256 i = 0; i < protocols.length; i++) {
            require(whitelistedProtocols[protocols[i]], "Protocol not whitelisted");
            require(amounts[i] > 0, "Amount must be greater than 0");
            
            bool success = IProtocol(protocols[i]).withdrawFor(user, amounts[i]);
            require(success, "Protocol withdrawal failed");
            
            userBalances[user] += amounts[i];
            _updatePosition(user, protocols[i], amounts[i]);
            
            emit EmergencyWithdrawal(user, protocols[i], amounts[i], riskScore, reason, msg.sender, block.timestamp);
        }
        
        return true;
    }
    
    // ============ Position Management Functions ============
    
    /**
     * @notice Deploy funds to a whitelisted DeFi protocol
     * @param protocol Protocol address
     * @param amount Amount to deploy
     */
    function deployToProtocol(address protocol, uint256 amount) external nonReentrant whenNotPaused {
        require(amount > 0, "Amount must be greater than 0");
        require(amount <= userBalances[msg.sender], "Insufficient balance");
        require(whitelistedProtocols[protocol], "Protocol not whitelisted");
        
        userBalances[msg.sender] -= amount;
        
        require(token.transfer(protocol, amount), "Transfer failed");
        
        userPositions[msg.sender].push(Position({
            protocol: protocol,
            amount: amount,
            deployedAt: block.timestamp,
            isActive: true
        }));
        
        emit FundsDeployed(msg.sender, protocol, amount, block.timestamp);
    }
    
    /**
     * @notice Manually withdraw funds from a protocol
     * @param protocol Protocol address
     * @param amount Amount to withdraw
     */
    function withdrawFromProtocol(address protocol, uint256 amount) external nonReentrant whenNotPaused {
        require(amount > 0, "Amount must be greater than 0");
        require(whitelistedProtocols[protocol], "Protocol not whitelisted");
        
        bool success = IProtocol(protocol).withdrawFor(msg.sender, amount);
        require(success, "Protocol withdrawal failed");
        
        userBalances[msg.sender] += amount;
        _updatePosition(msg.sender, protocol, amount);
        
        emit FundsRecalled(msg.sender, protocol, amount, block.timestamp);
    }
    
    // ============ Internal Functions ============
    
    /**
     * @notice Update position status after withdrawal
     * @param user User address
     * @param protocol Protocol address
     * @param amount Amount withdrawn
     */
    function _updatePosition(address user, address protocol, uint256 amount) internal {
        Position[] storage positions = userPositions[user];
        
        for (uint256 i = positions.length; i > 0; i--) {
            if (positions[i-1].protocol == protocol && positions[i-1].isActive) {
                if (positions[i-1].amount <= amount) {
                    positions[i-1].isActive = false;
                } else {
                    positions[i-1].amount -= amount;
                }
                break;
            }
        }
    }
    
    // ============ View Functions ============
    
    /**
     * @notice Get user's balance in vault
     * @param user User address
     * @return User's balance
     */
    function getUserBalance(address user) external view returns (uint256) {
        return userBalances[user];
    }
    
    /**
     * @notice Get user's agent information
     * @param user User address
     * @return Agent information
     */
    function getUserAgent(address user) external view returns (AgentInfo memory) {
        return userAgents[user];
    }
    
    /**
     * @notice Check if agent is authorized and active
     * @param user User address
     * @return True if agent is authorized and not paused
     */
    function isAgentAuthorized(address user) external view returns (bool) {
        AgentInfo memory agentInfo = userAgents[user];
        return agentInfo.isAuthorized && !agentInfo.isPaused;
    }
    
    /**
     * @notice Get user's risk tolerance
     * @param user User address
     * @return Risk tolerance value
     */
    function getUserRiskTolerance(address user) external view returns (uint8) {
        return userAgents[user].riskTolerance;
    }
    
    /**
     * @notice Get user's positions
     * @param user User address
     * @return Array of user's positions
     */
    function getUserPositions(address user) external view returns (Position[] memory) {
        return userPositions[user];
    }
    
    /**
     * @notice Get active positions for user
     * @param user User address
     * @return Array of active positions
     */
    function getActivePositions(address user) external view returns (Position[] memory) {
        Position[] memory allPositions = userPositions[user];
        uint256 activeCount = 0;
        
        for (uint256 i = 0; i < allPositions.length; i++) {
            if (allPositions[i].isActive) {
                activeCount++;
            }
        }
        
        Position[] memory activePositions = new Position[](activeCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < allPositions.length; i++) {
            if (allPositions[i].isActive) {
                activePositions[index] = allPositions[i];
                index++;
            }
        }
        
        return activePositions;
    }
    
    /**
     * @notice Get total value locked in vault
     * @return Total value locked
     */
    function getTotalValueLocked() external view returns (uint256) {
        return totalValueLocked;
    }
    
    /**
     * @notice Check if protocol is whitelisted
     * @param protocol Protocol address
     * @return True if whitelisted
     */
    function isProtocolWhitelisted(address protocol) external view returns (bool) {
        return whitelistedProtocols[protocol];
    }
    
    // ============ Admin Functions ============
    
    /**
     * @notice Whitelist a protocol for deployments
     * @param protocol Protocol address
     */
    function whitelistProtocol(address protocol) external onlyOwner {
        require(protocol != address(0), "Invalid protocol address");
        require(!whitelistedProtocols[protocol], "Protocol already whitelisted");
        
        whitelistedProtocols[protocol] = true;
        
        emit ProtocolWhitelisted(protocol, block.timestamp);
    }
    
    /**
     * @notice Remove protocol from whitelist
     * @param protocol Protocol address
     */
    function removeProtocol(address protocol) external onlyOwner {
        require(whitelistedProtocols[protocol], "Protocol not whitelisted");
        
        whitelistedProtocols[protocol] = false;
        
        emit ProtocolRemoved(protocol, block.timestamp);
    }
    
    /**
     * @notice Pause all contract operations
     */
    function pauseContract() external onlyOwner {
        require(!contractPaused, "Already paused");
        contractPaused = true;
        emit ContractPaused(block.timestamp);
    }
    
    /**
     * @notice Unpause contract operations
     */
    function unpauseContract() external onlyOwner {
        require(contractPaused, "Not paused");
        contractPaused = false;
        emit ContractUnpaused(block.timestamp);
    }
}