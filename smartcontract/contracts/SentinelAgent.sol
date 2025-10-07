// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface ISentinelVault {
    function emergencyWithdraw(
        address user,
        address protocol,
        uint256 amount,
        uint8 riskScore,
        string calldata reason
    ) external returns (bool);
    
    function getUserRiskTolerance(address user) external view returns (uint8);
    function isAgentAuthorized(address user) external view returns (bool);
}

interface IRiskOracle {
    function getRiskScore(address protocol) external view returns (uint8);
    function getProtocolMetrics(address protocol) external view returns (
        uint256 currentTVL,
        uint256 previousTVL,
        uint256 transactionCount,
        uint256 lastUpdateTime,
        uint8 healthScore
    );
}

interface IProtocol {
    function getTVL() external view returns (uint256);
    function getHealthScore() external view returns (uint8);
    function getBalance(address user) external view returns (uint256);
}

/**
 * @title SentinelAgent
 * @notice On-chain AI agent logic for autonomous protection
 */
contract SentinelAgent is ReentrancyGuard, Ownable {
    
    // ============ Structs ============
    
    struct AgentConfig {
        address vaultAddress;
        address riskOracleAddress;
        address[] monitoredProtocols;
        uint256 checkInterval;
        bool isActive;
    }
    
    struct ProtectionAction {
        address user;
        address protocol;
        uint256 amount;
        uint8 riskScore;
        uint256 timestamp;
        string reason;
        bytes32 txHash;
    }
    
    // ============ State Variables ============
    
    mapping(address => AgentConfig) public agentConfigs;
    mapping(address => ProtectionAction[]) public protectionHistory;
    mapping(address => uint256) public lastCheckTime;
    mapping(address => mapping(address => uint256)) public lastProtectionTime;
    
    uint256 public totalProtectedValue;
    uint256 public totalActionsExecuted;
    bool public isGloballyActive = true;
    
    uint256 public constant PROTECTION_COOLDOWN = 60; // 1 minute between protections per user per protocol
    uint256 public constant MAX_HISTORY_PER_USER = 50;
    
    // ============ Events ============
    
    event AgentRegistered(address indexed agentAddress, address indexed vaultAddress, uint256 timestamp);
    event AgentActivated(address indexed agentAddress, uint256 timestamp);
    event AgentDeactivated(address indexed agentAddress, uint256 timestamp);
    event ProtocolsUpdated(address indexed agentAddress, address[] protocols, uint256 timestamp);
    
    event ProtectionExecuted(
        address indexed user,
        address indexed protocol,
        uint256 amount,
        uint8 riskScore,
        string reason,
        uint256 timestamp
    );
    
    event ProtectionFailed(
        address indexed user,
        address indexed protocol,
        string reason,
        uint256 timestamp
    );
    
    event RiskThresholdExceeded(
        address indexed protocol,
        uint8 riskScore,
        uint8 threshold,
        uint256 timestamp
    );
    
    event AgentActionLog(
        address indexed agent,
        string action,
        bytes data,
        uint256 timestamp
    );
    
    // ============ Modifiers ============
    
    modifier onlyWhenActive() {
        require(isGloballyActive, "Agent system is paused");
        require(agentConfigs[msg.sender].isActive, "Agent is not active");
        _;
    }
    
    // ============ Agent Registration & Management ============
    
    /**
     * @notice Register a new agent configuration
     */
    function registerAgent(
        address vaultAddress,
        address riskOracleAddress,
        address[] calldata monitoredProtocols
    ) external {
        require(vaultAddress != address(0), "Invalid vault address");
        require(riskOracleAddress != address(0), "Invalid oracle address");
        require(monitoredProtocols.length > 0, "Must monitor at least one protocol");
        
        agentConfigs[msg.sender] = AgentConfig({
            vaultAddress: vaultAddress,
            riskOracleAddress: riskOracleAddress,
            monitoredProtocols: monitoredProtocols,
            checkInterval: 10, // 10 seconds default
            isActive: true
        });
        
        emit AgentRegistered(msg.sender, vaultAddress, block.timestamp);
    }
    
    /**
     * @notice Update monitored protocols
     */
    function updateMonitoredProtocols(address[] calldata newProtocols) external {
        require(agentConfigs[msg.sender].vaultAddress != address(0), "Agent not registered");
        require(newProtocols.length > 0, "Must monitor at least one protocol");
        
        agentConfigs[msg.sender].monitoredProtocols = newProtocols;
        
        emit ProtocolsUpdated(msg.sender, newProtocols, block.timestamp);
    }
    
    /**
     * @notice Activate agent
     */
    function activateAgent() external {
        require(agentConfigs[msg.sender].vaultAddress != address(0), "Agent not registered");
        require(!agentConfigs[msg.sender].isActive, "Agent already active");
        
        agentConfigs[msg.sender].isActive = true;
        
        emit AgentActivated(msg.sender, block.timestamp);
    }
    
    /**
     * @notice Deactivate agent
     */
    function deactivateAgent() external {
        require(agentConfigs[msg.sender].isActive, "Agent not active");
        
        agentConfigs[msg.sender].isActive = false;
        
        emit AgentDeactivated(msg.sender, block.timestamp);
    }
    
    /**
     * @notice Update check interval
     */
    function updateCheckInterval(uint256 newInterval) external {
        require(agentConfigs[msg.sender].vaultAddress != address(0), "Agent not registered");
        require(newInterval >= 5 && newInterval <= 60, "Interval must be 5-60 seconds");
        
        agentConfigs[msg.sender].checkInterval = newInterval;
    }
    
    // ============ Core Protection Logic ============
    
    /**
     * @notice Check and protect a user's position if needed
     * @dev Can be called by anyone (including off-chain agents)
     */
    function checkAndProtect(address user, address protocol) external nonReentrant returns (bool success, string memory reason) {
        AgentConfig memory config = agentConfigs[msg.sender];
        
        // Validate configuration
        if (config.vaultAddress == address(0)) {
            return (false, "Agent not registered");
        }
        
        if (!config.isActive || !isGloballyActive) {
            return (false, "Agent not active");
        }
        
        // Check if protocol is monitored
        bool isMonitored = false;
        for (uint256 i = 0; i < config.monitoredProtocols.length; i++) {
            if (config.monitoredProtocols[i] == protocol) {
                isMonitored = true;
                break;
            }
        }
        
        if (!isMonitored) {
            return (false, "Protocol not monitored");
        }
        
        // Check protection cooldown
        if (block.timestamp < lastProtectionTime[user][protocol] + PROTECTION_COOLDOWN) {
            return (false, "Protection cooldown active");
        }
        
        // Validate protection is needed
        (bool shouldProtect, string memory validationReason, uint8 riskScore) = validateProtection(user, protocol, config);
        
        if (!shouldProtect) {
            return (false, validationReason);
        }
        
        // Get user's balance in protocol
        uint256 amount = IProtocol(protocol).getBalance(user);
        
        if (amount == 0) {
            return (false, "No balance to protect");
        }
        
        // Execute protection
        ISentinelVault vault = ISentinelVault(config.vaultAddress);
        
        try vault.emergencyWithdraw(user, protocol, amount, riskScore, validationReason) returns (bool result) {
            if (result) {
                // Record successful protection
                _recordProtection(user, protocol, amount, riskScore, validationReason);
                
                lastProtectionTime[user][protocol] = block.timestamp;
                totalProtectedValue += amount;
                totalActionsExecuted++;
                
                emit ProtectionExecuted(user, protocol, amount, riskScore, validationReason, block.timestamp);
                
                return (true, "Protection executed successfully");
            } else {
                emit ProtectionFailed(user, protocol, "Vault withdrawal returned false", block.timestamp);
                return (false, "Vault withdrawal failed");
            }
        } catch Error(string memory error) {
            emit ProtectionFailed(user, protocol, error, block.timestamp);
            return (false, error);
        } catch {
            emit ProtectionFailed(user, protocol, "Unknown error", block.timestamp);
            return (false, "Unknown error during protection");
        }
    }
    
    /**
     * @notice Batch check and protect multiple protocols for a user
     */
    function batchCheckAndProtect(address user, address[] calldata protocols) external nonReentrant returns (bool[] memory successes, string[] memory reasons) {
        require(protocols.length > 0, "Empty protocols array");
        require(protocols.length <= 10, "Too many protocols");
        
        successes = new bool[](protocols.length);
        reasons = new string[](protocols.length);
        
        for (uint256 i = 0; i < protocols.length; i++) {
            (successes[i], reasons[i]) = this.checkAndProtect(user, protocols[i]);
        }
        
        return (successes, reasons);
    }
    
    // ============ Risk Assessment ============
    
    /**
     * @notice Calculate on-chain risk score for a protocol
     */
    function calculateOnChainRiskScore(address protocol) public view returns (uint8) {
        try IProtocol(protocol).getTVL() returns (uint256 currentTVL) {
            try IProtocol(protocol).getHealthScore() returns (uint8 healthScore) {
                // Simple on-chain calculation
                // Real calculation happens off-chain with more data
                
                if (healthScore == 0) return 100;
                if (currentTVL == 0) return 100;
                
                // Invert health score (lower health = higher risk)
                uint8 riskFromHealth = 100 - healthScore;
                
                return riskFromHealth;
            } catch {
                return 50; // Default medium risk if can't get health
            }
        } catch {
            return 100; // Critical risk if can't get TVL
        }
    }
    
    /**
     * @notice Check if protection should be triggered
     */
    function shouldProtect(address user, address protocol) external view returns (bool) {
        AgentConfig memory config = agentConfigs[msg.sender];
        
        if (config.vaultAddress == address(0)) return false;
        if (!config.isActive) return false;
        
        (bool should, , ) = validateProtection(user, protocol, config);
        return should;
    }
    
    /**
     * @notice Validate if protection is needed and allowed
     */
    function validateProtection(
        address user,
        address protocol,
        AgentConfig memory config
    ) public view returns (bool canProtect, string memory reason, uint8 riskScore) {
        // Check if user has authorized agent
        ISentinelVault vault = ISentinelVault(config.vaultAddress);
        
        if (!vault.isAgentAuthorized(user)) {
            return (false, "User has not authorized agent", 0);
        }
        
        // Get user's risk tolerance
        uint8 userThreshold = vault.getUserRiskTolerance(user);
        
        // Get risk score from oracle
        IRiskOracle oracle = IRiskOracle(config.riskOracleAddress);
        riskScore = oracle.getRiskScore(protocol);
        
        // If oracle has no score, calculate on-chain
        if (riskScore == 0) {
            riskScore = calculateOnChainRiskScore(protocol);
        }
        
        // Check if risk exceeds threshold
        if (riskScore < userThreshold) {
            return (false, "Risk score below user threshold", riskScore);
        }
        
        // Note: Cannot emit events in view functions
        
        return (true, "Risk threshold exceeded - protection needed", riskScore);
    }
    
    // ============ Internal Functions ============
    
    /**
     * @notice Record protection action
     */
    function _recordProtection(
        address user,
        address protocol,
        uint256 amount,
        uint8 riskScore,
        string memory reason
    ) internal {
        ProtectionAction memory action = ProtectionAction({
            user: user,
            protocol: protocol,
            amount: amount,
            riskScore: riskScore,
            timestamp: block.timestamp,
            reason: reason,
            txHash: blockhash(block.number - 1)
        });
        
        protectionHistory[user].push(action);
        
        // Maintain max history length
        if (protectionHistory[user].length > MAX_HISTORY_PER_USER) {
            _removeOldestProtection(user);
        }
    }
    
    /**
     * @notice Remove oldest protection from history
     */
    function _removeOldestProtection(address user) internal {
        ProtectionAction[] storage history = protectionHistory[user];
        
        for (uint256 i = 0; i < history.length - 1; i++) {
            history[i] = history[i + 1];
        }
        
        history.pop();
    }
    
    // ============ View Functions ============
    
    /**
     * @notice Get protection history for a user
     */
    function getProtectionHistory(address user) external view returns (ProtectionAction[] memory) {
        return protectionHistory[user];
    }
    
    /**
     * @notice Get recent protections for a user
     */
    function getRecentProtections(address user, uint256 count) external view returns (ProtectionAction[] memory) {
        ProtectionAction[] storage history = protectionHistory[user];
        
        if (count == 0 || count > history.length) {
            count = history.length;
        }
        
        ProtectionAction[] memory result = new ProtectionAction[](count);
        uint256 startIndex = history.length - count;
        
        for (uint256 i = 0; i < count; i++) {
            result[i] = history[startIndex + i];
        }
        
        return result;
    }
    
    /**
     * @notice Get total value protected globally
     */
    function getTotalValueProtected() external view returns (uint256) {
        return totalProtectedValue;
    }
    
    /**
     * @notice Get total actions executed
     */
    function getTotalActions() external view returns (uint256) {
        return totalActionsExecuted;
    }
    
    /**
     * @notice Get agent configuration
     */
    function getAgentStatus(address agent) external view returns (AgentConfig memory) {
        return agentConfigs[agent];
    }
    
    /**
     * @notice Get last check time for a protocol
     */
    function getLastCheckTime(address protocol) external view returns (uint256) {
        return lastCheckTime[protocol];
    }
    
    /**
     * @notice Get monitored protocols for an agent
     */
    function getMonitoredProtocols(address agent) external view returns (address[] memory) {
        return agentConfigs[agent].monitoredProtocols;
    }
    
    /**
     * @notice Check if agent is registered and active
     */
    function isAgentActive(address agent) external view returns (bool) {
        return agentConfigs[agent].vaultAddress != address(0) && agentConfigs[agent].isActive;
    }
    
    /**
     * @notice Get user's total saved value
     */
    function getUserTotalSaved(address user) external view returns (uint256) {
        ProtectionAction[] storage history = protectionHistory[user];
        uint256 total = 0;
        
        for (uint256 i = 0; i < history.length; i++) {
            total += history[i].amount;
        }
        
        return total;
    }
    
    // ============ Admin Functions ============
    
    /**
     * @notice Pause all agent operations (emergency)
     */
    function pauseGlobalAgent() external onlyOwner {
        require(isGloballyActive, "Already paused");
        isGloballyActive = false;
    }
    
    /**
     * @notice Resume agent operations
     */
    function resumeGlobalAgent() external onlyOwner {
        require(!isGloballyActive, "Not paused");
        isGloballyActive = true;
    }
    
    /**
     * @notice Update protection cooldown
     */
    function updateProtectionCooldown(uint256 newCooldown) external view onlyOwner {
        require(newCooldown >= 30 && newCooldown <= 300, "Cooldown must be 30-300 seconds");
        // Note: This would require making PROTECTION_COOLDOWN non-constant
        // For now, it's a constant at 60 seconds
    }
    
    /**
     * @notice Clear protection history for user (testing only)
     */
    function clearProtectionHistory(address user) external onlyOwner {
        delete protectionHistory[user];
    }
}