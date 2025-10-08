// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IProtocol
 * @notice Interface for DeFi protocols that Sentinel can protect
 */
interface IProtocol {
    function withdrawFor(address user, uint256 amount) external returns (bool);
    function getBalance(address user) external view returns (uint256);
    function getTVL() external view returns (uint256);
    function getHealthScore() external view returns (uint8);
}
