// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./MockToken.sol";
import "./SentinelVault.sol";
import "./RiskOracle.sol";
import "./SentinelAgent.sol";
import "./SimpleSwapPool.sol";
import "./SimpleLendingPool.sol";

/**
 * @title SentinelDeployment
 * @notice Deployment script for Sentinel MVP contracts
 * @dev Deploys all contracts in the correct order with proper initialization
 */
contract SentinelDeployment {
    
    // Contract addresses
    address public mockTokenA;
    address public mockTokenB;
    address public sentinelVault;
    address public riskOracle;
    address public sentinelAgent;
    address public simpleSwapPool;
    address public simpleLendingPool;
    
    // Events
    event ContractDeployed(string contractName, address contractAddress, uint256 timestamp);
    event DeploymentComplete(uint256 timestamp);
    
    /**
     * @notice Deploy all Sentinel contracts
     * @param deployer Address that will own the contracts
     */
    function deployAll(address deployer) external {
        require(deployer != address(0), "Invalid deployer address");
        
        // 1. Deploy Mock Tokens
        mockTokenA = address(new MockToken("Mock Token A", "MTA", 18, 1000000 * 10**18));
        mockTokenB = address(new MockToken("Mock Token B", "MTB", 18, 1000000 * 10**18));
        
        emit ContractDeployed("MockTokenA", mockTokenA, block.timestamp);
        emit ContractDeployed("MockTokenB", mockTokenB, block.timestamp);
        
        // 2. Deploy Sentinel Vault
        sentinelVault = address(new SentinelVault(mockTokenA));
        
        emit ContractDeployed("SentinelVault", sentinelVault, block.timestamp);
        
        // 3. Deploy Risk Oracle
        riskOracle = address(new RiskOracle());
        
        emit ContractDeployed("RiskOracle", riskOracle, block.timestamp);
        
        // 4. Deploy Sentinel Agent
        sentinelAgent = address(new SentinelAgent());
        
        emit ContractDeployed("SentinelAgent", sentinelAgent, block.timestamp);
        
        // 5. Deploy Simple Swap Pool
        simpleSwapPool = address(new SimpleSwapPool(mockTokenA, mockTokenB));
        
        emit ContractDeployed("SimpleSwapPool", simpleSwapPool, block.timestamp);
        
        // 6. Deploy Simple Lending Pool
        simpleLendingPool = address(new SimpleLendingPool(mockTokenA));
        
        emit ContractDeployed("SimpleLendingPool", simpleLendingPool, block.timestamp);
        
        // 7. Initialize contracts
        _initializeContracts(deployer);
        
        emit DeploymentComplete(block.timestamp);
    }
    
    /**
     * @notice Initialize all contracts with proper configurations
     * @param deployer Address that will own the contracts
     */
    function _initializeContracts(address deployer) internal {
        // Transfer ownership of contracts to deployer
        SentinelVault(sentinelVault).transferOwnership(deployer);
        RiskOracle(riskOracle).transferOwnership(deployer);
        SentinelAgent(sentinelAgent).transferOwnership(deployer);
        SimpleSwapPool(simpleSwapPool).transferOwnership(deployer);
        SimpleLendingPool(simpleLendingPool).transferOwnership(deployer);
        
        // Set Sentinel Vault addresses in protocols
        SimpleSwapPool(simpleSwapPool).setSentinelVault(sentinelVault);
        SimpleLendingPool(simpleLendingPool).setSentinelVault(sentinelVault);
        
        // Whitelist protocols in Sentinel Vault
        SentinelVault(sentinelVault).whitelistProtocol(simpleSwapPool);
        SentinelVault(sentinelVault).whitelistProtocol(simpleLendingPool);
        
        // Authorize agent in Risk Oracle
        RiskOracle(riskOracle).authorizeAgent(sentinelAgent);
    }
    
    /**
     * @notice Get all deployed contract addresses
     * @return _mockTokenA Address of MockTokenA
     * @return _mockTokenB Address of MockTokenB
     * @return _sentinelVault Address of SentinelVault
     * @return _riskOracle Address of RiskOracle
     * @return _sentinelAgent Address of SentinelAgent
     * @return _simpleSwapPool Address of SimpleSwapPool
     * @return _simpleLendingPool Address of SimpleLendingPool
     */
    function getDeployedContracts() external view returns (
        address _mockTokenA,
        address _mockTokenB,
        address _sentinelVault,
        address _riskOracle,
        address _sentinelAgent,
        address _simpleSwapPool,
        address _simpleLendingPool
    ) {
        return (
            mockTokenA,
            mockTokenB,
            sentinelVault,
            riskOracle,
            sentinelAgent,
            simpleSwapPool,
            simpleLendingPool
        );
    }
    
    /**
     * @notice Check if all contracts are deployed
     * @return True if all contracts are deployed
     */
    function isDeploymentComplete() external view returns (bool) {
        return mockTokenA != address(0) &&
               mockTokenB != address(0) &&
               sentinelVault != address(0) &&
               riskOracle != address(0) &&
               sentinelAgent != address(0) &&
               simpleSwapPool != address(0) &&
               simpleLendingPool != address(0);
    }
}
