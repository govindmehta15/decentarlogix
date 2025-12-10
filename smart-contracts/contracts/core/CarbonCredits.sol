// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "../interfaces/ICarbonCredits.sol";

/**
 * @title CarbonCredits
 * @notice ERC20 token for carbon credit rewards in DecentraLogix
 * @dev Rewards users for sustainable logistics practices
 */
contract CarbonCredits is ERC20, Ownable, ReentrancyGuard, ICarbonCredits {
    // ============ STATE VARIABLES ============
    
    uint256 private _rewardCounter;
    
    // Mapping from reward ID to reward
    mapping(uint256 => CarbonReward) private _rewards;
    
    // Mapping from user address to array of reward IDs
    mapping(address => uint256[]) private _userRewards;
    
    // Mapping from user address to total carbon offset
    mapping(address => uint256) private _totalCarbonOffset;
    
    // Reward parameters
    RewardParameters private _rewardParameters;
    
    // Mapping to track if reward is claimed
    mapping(uint256 => bool) private _claimedRewards;
    
    // ============ MODIFIERS ============
    
    /**
     * @notice Modifier to check if reward exists
     */
    modifier rewardExists(uint256 rewardId) {
        require(_rewards[rewardId].rewardId != 0, "CarbonCredits: Reward does not exist");
        _;
    }
    
    /**
     * @notice Modifier to check if caller is authorized minter
     */
    modifier onlyMinter() {
        require(
            msg.sender == owner() || _isAuthorizedMinter(msg.sender),
            "CarbonCredits: Not authorized minter"
        );
        _;
    }
    
    // ============ CONSTRUCTOR ============
    
    constructor() ERC20("DecentraLogix Carbon Credits", "DLXCC") Ownable(msg.sender) {
        _rewardCounter = 0;
        
        // Initialize default reward parameters
        _rewardParameters = RewardParameters({
            baseMultiplier: 100, // 100 credits per kg CO2
            lowCarbonBonus: 20,   // 20% bonus
            carbonNeutralBonus: 50, // 50% bonus
            batchOptimizationBonus: 15 // 15% bonus
        });
    }
    
    // ============ EXTERNAL FUNCTIONS ============
    
    /**
     * @notice Mint carbon credits as reward for trip completion
     * @param recipient Address to receive the reward
     * @param tripId Associated trip ID
     * @param carbonOffset Amount of carbon offset (kg CO2)
     * @param rewardType Type of reward
     * @return rewardId Unique reward identifier
     * @return amount Amount of carbon credits minted
     */
    function mintReward(
        address recipient,
        uint256 tripId,
        uint256 carbonOffset,
        RewardType rewardType
    ) external override onlyMinter returns (uint256 rewardId, uint256 amount) {
        require(recipient != address(0), "CarbonCredits: Invalid recipient");
        require(carbonOffset > 0, "CarbonCredits: Carbon offset must be greater than 0");
        
        // Calculate reward amount
        amount = calculateReward(carbonOffset, rewardType);
        require(amount > 0, "CarbonCredits: Calculated reward is zero");
        
        // Increment counter
        _rewardCounter++;
        rewardId = _rewardCounter;
        
        // Create reward
        CarbonReward memory newReward = CarbonReward({
            rewardId: rewardId,
            recipient: recipient,
            tripId: tripId,
            amount: amount,
            carbonOffset: carbonOffset,
            rewardType: rewardType,
            createdAt: block.timestamp,
            claimedAt: 0
        });
        
        // Store reward
        _rewards[rewardId] = newReward;
        _userRewards[recipient].push(rewardId);
        _totalCarbonOffset[recipient] += carbonOffset;
        
        // Mint tokens directly to recipient (simple mint - no claim step)
        _mint(recipient, amount);
        
        // Mark as claimed (since we mint directly)
        _claimedRewards[rewardId] = true;
        newReward.claimedAt = block.timestamp;
        _rewards[rewardId] = newReward;
        
        // Emit event
        emit CarbonCreditsMinted(rewardId, recipient, tripId, amount, carbonOffset, rewardType);
        emit CarbonCreditsClaimed(rewardId, recipient, amount);
        
        return (rewardId, amount);
    }
    
    /**
     * @notice Claim pending carbon credit rewards (simplified - rewards are auto-claimed)
     * @param rewardId Unique reward identifier
     */
    function claimReward(uint256 rewardId) 
        external 
        override 
        rewardExists(rewardId)
        nonReentrant
    {
        CarbonReward memory reward = _rewards[rewardId];
        
        require(
            reward.recipient == msg.sender,
            "CarbonCredits: Not reward recipient"
        );
        
        require(
            !_claimedRewards[rewardId],
            "CarbonCredits: Reward already claimed"
        );
        
        // Mark as claimed
        _claimedRewards[rewardId] = true;
        _rewards[rewardId].claimedAt = block.timestamp;
        
        // Mint tokens to recipient
        _mint(msg.sender, reward.amount);
        
        emit CarbonCreditsClaimed(rewardId, msg.sender, reward.amount);
    }
    
    /**
     * @notice Claim all pending rewards for a user
     * @param recipient Address to claim rewards for
     * @return totalAmount Total amount of credits claimed
     */
    function claimAllRewards(address recipient) 
        external 
        override 
        nonReentrant
        returns (uint256 totalAmount)
    {
        require(recipient != address(0), "CarbonCredits: Invalid recipient");
        require(
            msg.sender == recipient || msg.sender == owner(),
            "CarbonCredits: Not authorized"
        );
        
        uint256[] memory rewards = _userRewards[recipient];
        totalAmount = 0;
        
        for (uint256 i = 0; i < rewards.length; i++) {
            uint256 rewardId = rewards[i];
            if (!_claimedRewards[rewardId]) {
                CarbonReward memory reward = _rewards[rewardId];
                _claimedRewards[rewardId] = true;
                _rewards[rewardId].claimedAt = block.timestamp;
                totalAmount += reward.amount;
                _mint(recipient, reward.amount);
                emit CarbonCreditsClaimed(rewardId, recipient, reward.amount);
            }
        }
        
        return totalAmount;
    }
    
    /**
     * @notice Burn carbon credits (for offsetting)
     * @param amount Amount of credits to burn
     * @param reason Reason for burning
     */
    function burnCredits(uint256 amount, string memory reason) 
        external 
        override 
        nonReentrant
    {
        require(amount > 0, "CarbonCredits: Amount must be greater than 0");
        require(
            balanceOf(msg.sender) >= amount,
            "CarbonCredits: Insufficient balance"
        );
        
        _burn(msg.sender, amount);
        
        emit CarbonCreditsBurned(msg.sender, amount, reason);
    }
    
    /**
     * @notice Calculate carbon credit reward amount
     * @param carbonOffset Amount of carbon offset (kg CO2)
     * @param rewardType Type of reward
     * @return amount Amount of carbon credits to reward
     */
    function calculateReward(
        uint256 carbonOffset,
        RewardType rewardType
    ) public view override returns (uint256 amount) {
        uint256 baseAmount = carbonOffset * _rewardParameters.baseMultiplier;
        uint256 bonus = 0;
        
        if (rewardType == RewardType.LowCarbonFootprint) {
            bonus = (baseAmount * _rewardParameters.lowCarbonBonus) / 100;
        } else if (rewardType == RewardType.CarbonNeutral) {
            bonus = (baseAmount * _rewardParameters.carbonNeutralBonus) / 100;
        } else if (rewardType == RewardType.BatchOptimization) {
            bonus = (baseAmount * _rewardParameters.batchOptimizationBonus) / 100;
        }
        // TripCompletion and SustainableMode get base amount only
        
        return baseAmount + bonus;
    }
    
    /**
     * @notice Get reward details
     * @param rewardId Unique reward identifier
     * @return reward Carbon reward structure
     */
    function getReward(uint256 rewardId) 
        external 
        view 
        override 
        rewardExists(rewardId)
        returns (CarbonReward memory reward)
    {
        return _rewards[rewardId];
    }
    
    /**
     * @notice Get all rewards for a user
     * @param recipient Address to get rewards for
     * @return rewards Array of reward IDs
     */
    function getUserRewards(address recipient) 
        external 
        view 
        override 
        returns (uint256[] memory rewards)
    {
        return _userRewards[recipient];
    }
    
    /**
     * @notice Get pending (unclaimed) rewards for a user
     * @param recipient Address to get pending rewards for
     * @return totalPending Total amount of pending credits
     */
    function getPendingRewards(address recipient) 
        external 
        view 
        override 
        returns (uint256 totalPending)
    {
        uint256[] memory rewards = _userRewards[recipient];
        totalPending = 0;
        
        for (uint256 i = 0; i < rewards.length; i++) {
            if (!_claimedRewards[rewards[i]]) {
                totalPending += _rewards[rewards[i]].amount;
            }
        }
        
        return totalPending;
    }
    
    /**
     * @notice Get total carbon offset for a user
     * @param account Address to get offset for
     * @return totalOffset Total carbon offset (kg CO2)
     */
    function getTotalCarbonOffset(address account) 
        external 
        view 
        override 
        returns (uint256 totalOffset)
    {
        return _totalCarbonOffset[account];
    }
    
    /**
     * @notice Get reward parameters
     * @return parameters Current reward parameters
     */
    function getRewardParameters() 
        external 
        view 
        override 
        returns (RewardParameters memory parameters)
    {
        return _rewardParameters;
    }
    
    /**
     * @notice Update reward parameters (admin only)
     * @param parameters New reward parameters
     */
    function updateRewardParameters(
        RewardParameters memory parameters
    ) external override onlyOwner {
        require(
            parameters.baseMultiplier > 0,
            "CarbonCredits: Invalid base multiplier"
        );
        
        _rewardParameters = parameters;
        
        emit RewardParametersUpdated(
            parameters.baseMultiplier,
            parameters.lowCarbonBonus,
            parameters.carbonNeutralBonus
        );
    }
    
    // ============ INTERNAL FUNCTIONS ============
    
    /**
     * @notice Check if address is authorized minter
     * @param account Address to check
     * @return isAuthorized True if authorized
     */
    function _isAuthorizedMinter(address account) internal view returns (bool isAuthorized) {
        // In production, this would check against a role-based access control
        // For MVP, only owner can mint
        return account == owner();
    }
    
    // ============ OVERRIDE FUNCTIONS ============
    
    /**
     * @notice Override transfer to emit custom event
     */
    function _update(address from, address to, uint256 value) internal override {
        super._update(from, to, value);
        
        if (from != address(0) && to != address(0)) {
            emit CarbonCreditsTransferred(from, to, value);
        }
    }
}

