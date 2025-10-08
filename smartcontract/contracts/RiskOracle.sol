// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title RiskOracle
 * @notice Stores on-chain risk data for transparency and agent access
 */
contract RiskOracle is Ownable {
    constructor() Ownable() {}

    // ============ Structs ============
    
    struct RiskSnapshot {
        uint256 timestamp;
        uint8 riskScore;
        uint256 tvlChange;
        uint256 transactionAnomaly;
        uint256 volatility;
        string reason;
    }
    
    struct ProtocolMetrics {
        uint256 currentTVL;
        uint256 previousTVL;
        uint256 transactionCount;
        uint256 lastUpdateTime;
        uint8 healthScore;
    }
    
    // ============ State Variables ============
    
    mapping(address => RiskSnapshot[]) public protocolRiskHistory;
    mapping(address => ProtocolMetrics) public protocolMetrics;
    mapping(address => uint8) public latestRiskScore;
    mapping(address => bool) public authorizedAgents;
    
    uint256 public constant MAX_HISTORY_LENGTH = 100;
    
    // ============ Events ============
    
    event RiskScoreUpdated(
        address indexed protocol,
        uint8 riskScore,
        string reason,
        address indexed updater,
        uint256 timestamp
    );
    
    event MetricsUpdated(
        address indexed protocol,
        uint256 currentTVL,
        int256 changePercent,
        uint256 timestamp
    );
    
    event AgentAuthorized(address indexed agent, uint256 timestamp);
    event AgentRevoked(address indexed agent, uint256 timestamp);
    
    // ============ Modifiers ============
    
    modifier onlyAuthorizedAgent() {
        require(authorizedAgents[msg.sender], "Not authorized agent");
        _;
    }
    
    // ============ Agent Authorization ============
    
    /**
     * @notice Authorize an agent to update risk data
     */
    function authorizeAgent(address agent) external onlyOwner {
        require(agent != address(0), "Invalid agent address");
        require(!authorizedAgents[agent], "Already authorized");
        
        authorizedAgents[agent] = true;
        
        emit AgentAuthorized(agent, block.timestamp);
    }
    
    /**
     * @notice Revoke agent authorization
     */
    function revokeAgent(address agent) external onlyOwner {
        require(authorizedAgents[agent], "Not authorized");
        
        authorizedAgents[agent] = false;
        
        emit AgentRevoked(agent, block.timestamp);
    }
    
    // ============ Risk Data Updates ============
    
    /**
     * @notice Update risk score for a protocol
     */
    function updateRiskScore(
        address protocol,
        uint8 riskScore,
        uint256 tvlChange,
        uint256 anomalyScore,
        uint256 volatilityScore,
        string calldata reason
    ) external onlyAuthorizedAgent {
        require(protocol != address(0), "Invalid protocol address");
        require(riskScore <= 100, "Risk score must be 0-100");
        
        RiskSnapshot memory snapshot = RiskSnapshot({
            timestamp: block.timestamp,
            riskScore: riskScore,
            tvlChange: tvlChange,
            transactionAnomaly: anomalyScore,
            volatility: volatilityScore,
            reason: reason
        });
        
        // Add to history
        protocolRiskHistory[protocol].push(snapshot);
        
        // Maintain max history length
        if (protocolRiskHistory[protocol].length > MAX_HISTORY_LENGTH) {
            _removeOldestSnapshot(protocol);
        }
        
        // Update latest score
        latestRiskScore[protocol] = riskScore;
        
        emit RiskScoreUpdated(protocol, riskScore, reason, msg.sender, block.timestamp);
    }
    
    /**
     * @notice Update protocol metrics
     */
    function updateProtocolMetrics(
        address protocol,
        uint256 currentTVL,
        uint256 transactionCount
    ) external onlyAuthorizedAgent {
        require(protocol != address(0), "Invalid protocol address");
        
        ProtocolMetrics storage metrics = protocolMetrics[protocol];
        
        uint256 previousTVL = metrics.currentTVL;
        
        metrics.previousTVL = previousTVL;
        metrics.currentTVL = currentTVL;
        metrics.transactionCount = transactionCount;
        metrics.lastUpdateTime = block.timestamp;
        
        // Calculate change percent
        int256 changePercent = 0;
        if (previousTVL > 0) {
            changePercent = int256((currentTVL * 100) / previousTVL) - 100;
        }
        
        emit MetricsUpdated(protocol, currentTVL, changePercent, block.timestamp);
    }
    
    /**
     * @notice Update protocol health score
     */
    function updateHealthScore(address protocol, uint8 healthScore) external onlyAuthorizedAgent {
        require(protocol != address(0), "Invalid protocol address");
        require(healthScore <= 100, "Health score must be 0-100");
        
        protocolMetrics[protocol].healthScore = healthScore;
    }
    
    // ============ View Functions ============
    
    /**
     * @notice Get latest risk score for a protocol
     */
    function getRiskScore(address protocol) external view returns (uint8) {
        return latestRiskScore[protocol];
    }
    
    /**
     * @notice Get risk history for a protocol
     */
    function getRiskHistory(address protocol, uint256 count) external view returns (RiskSnapshot[] memory) {
        RiskSnapshot[] storage history = protocolRiskHistory[protocol];
        
        if (count == 0 || count > history.length) {
            count = history.length;
        }
        
        RiskSnapshot[] memory result = new RiskSnapshot[](count);
        uint256 startIndex = history.length - count;
        
        for (uint256 i = 0; i < count; i++) {
            result[i] = history[startIndex + i];
        }
        
        return result;
    }
    
    /**
     * @notice Get all risk history for a protocol
     */
    function getAllRiskHistory(address protocol) external view returns (RiskSnapshot[] memory) {
        return protocolRiskHistory[protocol];
    }
    
    /**
     * @notice Get protocol metrics
     */
    function getProtocolMetrics(address protocol) external view returns (ProtocolMetrics memory) {
        return protocolMetrics[protocol];
    }
    
    /**
     * @notice Check if protocol is under threat based on user's threshold
     */
    function isProtocolUnderThreat(address protocol, uint8 userThreshold) external view returns (bool) {
        return latestRiskScore[protocol] >= userThreshold;
    }
    
    /**
     * @notice Get TVL change percentage
     */
    function getTVLChangePercent(address protocol) external view returns (int256) {
        ProtocolMetrics memory metrics = protocolMetrics[protocol];
        
        if (metrics.previousTVL == 0) return 0;
        
        return int256((metrics.currentTVL * 100) / metrics.previousTVL) - 100;
    }
    
    /**
     * @notice Get latest snapshot for protocol
     */
    function getLatestSnapshot(address protocol) external view returns (RiskSnapshot memory) {
        RiskSnapshot[] storage history = protocolRiskHistory[protocol];
        require(history.length > 0, "No history available");
        
        return history[history.length - 1];
    }
    
    /**
     * @notice Check if agent is authorized
     */
    function isAgentAuthorized(address agent) external view returns (bool) {
        return authorizedAgents[agent];
    }
    
    // ============ Internal Functions ============
    
    /**
     * @notice Remove oldest snapshot to maintain max history length
     */
    function _removeOldestSnapshot(address protocol) internal {
        RiskSnapshot[] storage history = protocolRiskHistory[protocol];
        
        for (uint256 i = 0; i < history.length - 1; i++) {
            history[i] = history[i + 1];
        }
        
        history.pop();
    }
    
    // ============ Admin Functions ============
    
    /**
     * @notice Clear history for a protocol (for testing/demo)
     */
    function clearHistory(address protocol) external onlyOwner {
        delete protocolRiskHistory[protocol];
        latestRiskScore[protocol] = 0;
    }
    
    /**
     * @notice Manually inject risk score (for testing/demo)
     */
    function injectRiskScore(address protocol, uint8 score) external onlyOwner {
        require(score <= 100, "Score must be 0-100");
        latestRiskScore[protocol] = score;
    }
}