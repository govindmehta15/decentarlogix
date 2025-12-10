// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title ICarbonCredits
 * @notice Interface for carbon credit reward token (ERC20)
 * @dev Rewards users for sustainable logistics practices
 */
interface ICarbonCredits {
    // ============ STRUCTS ============

    /**
     * @notice Carbon credit reward structure
     * @param rewardId Unique reward identifier
     * @param recipient Address receiving the reward
     * @param tripId Associated trip ID
     * @param amount Amount of carbon credits rewarded
     * @param carbonOffset Amount of carbon offset (in kg CO2)
     * @param rewardType Type of reward
     * @param createdAt Timestamp when reward was created
     * @param claimedAt Timestamp when reward was claimed (0 if not claimed)
     */
    struct CarbonReward {
        uint256 rewardId;
        address recipient;
        uint256 tripId;
        uint256 amount;
        uint256 carbonOffset;
        RewardType rewardType;
        uint256 createdAt;
        uint256 claimedAt;
    }

    /**
     * @notice Reward type enumeration
     */
    enum RewardType {
        TripCompletion,      // Reward for completing a trip
        LowCarbonFootprint,  // Reward for low carbon footprint
        CarbonNeutral,       // Reward for carbon neutral trip
        BatchOptimization,   // Reward for batch optimization
        SustainableMode      // Reward for using sustainable transport mode
    }

    /**
     * @notice Carbon offset calculation parameters
     * @param baseMultiplier Base multiplier for carbon credits
     * @param lowCarbonBonus Bonus for low carbon footprint
     * @param carbonNeutralBonus Bonus for carbon neutral trips
     * @param batchOptimizationBonus Bonus for batch optimization
     */
    struct RewardParameters {
        uint256 baseMultiplier; // Credits per kg CO2 offset
        uint256 lowCarbonBonus; // Additional percentage for low carbon
        uint256 carbonNeutralBonus; // Additional percentage for carbon neutral
        uint256 batchOptimizationBonus; // Additional percentage for batch optimization
    }

    // ============ EVENTS ============

    /**
     * @notice Emitted when carbon credits are minted as reward
     * @param rewardId Unique reward identifier
     * @param recipient Address receiving the reward
     * @param tripId Associated trip ID
     * @param amount Amount of carbon credits minted
     * @param carbonOffset Carbon offset amount (kg CO2)
     * @param rewardType Type of reward
     */
    event CarbonCreditsMinted(
        uint256 indexed rewardId,
        address indexed recipient,
        uint256 indexed tripId,
        uint256 amount,
        uint256 carbonOffset,
        RewardType rewardType
    );

    /**
     * @notice Emitted when carbon credits are claimed
     * @param rewardId Unique reward identifier
     * @param recipient Address claiming the reward
     * @param amount Amount of carbon credits claimed
     */
    event CarbonCreditsClaimed(
        uint256 indexed rewardId,
        address indexed recipient,
        uint256 amount
    );

    /**
     * @notice Emitted when carbon credits are burned (offset)
     * @param account Address burning credits
     * @param amount Amount of carbon credits burned
     * @param reason Reason for burning
     */
    event CarbonCreditsBurned(
        address indexed account,
        uint256 amount,
        string reason
    );

    /**
     * @notice Emitted when reward parameters are updated
     * @param baseMultiplier New base multiplier
     * @param lowCarbonBonus New low carbon bonus
     * @param carbonNeutralBonus New carbon neutral bonus
     */
    event RewardParametersUpdated(
        uint256 baseMultiplier,
        uint256 lowCarbonBonus,
        uint256 carbonNeutralBonus
    );

    /**
     * @notice Emitted when carbon credits are transferred
     * @param from Address sending credits
     * @param to Address receiving credits
     * @param amount Amount transferred
     */
    event CarbonCreditsTransferred(
        address indexed from,
        address indexed to,
        uint256 amount
    );

    // ============ FUNCTIONS ============

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
    ) external returns (uint256 rewardId, uint256 amount);

    /**
     * @notice Claim pending carbon credit rewards
     * @param rewardId Unique reward identifier
     */
    function claimReward(uint256 rewardId) external;

    /**
     * @notice Claim all pending rewards for a user
     * @param recipient Address to claim rewards for
     * @return totalAmount Total amount of credits claimed
     */
    function claimAllRewards(address recipient) 
        external 
        returns (uint256 totalAmount);

    /**
     * @notice Burn carbon credits (for offsetting)
     * @param amount Amount of credits to burn
     * @param reason Reason for burning
     */
    function burnCredits(uint256 amount, string memory reason) external;

    /**
     * @notice Calculate carbon credit reward amount
     * @param carbonOffset Amount of carbon offset (kg CO2)
     * @param rewardType Type of reward
     * @return amount Amount of carbon credits to reward
     */
    function calculateReward(
        uint256 carbonOffset,
        RewardType rewardType
    ) external view returns (uint256 amount);

    /**
     * @notice Get reward details
     * @param rewardId Unique reward identifier
     * @return reward Carbon reward structure
     */
    function getReward(uint256 rewardId) 
        external 
        view 
        returns (CarbonReward memory reward);

    /**
     * @notice Get all rewards for a user
     * @param recipient Address to get rewards for
     * @return rewards Array of reward IDs
     */
    function getUserRewards(address recipient) 
        external 
        view 
        returns (uint256[] memory rewards);

    /**
     * @notice Get pending (unclaimed) rewards for a user
     * @param recipient Address to get pending rewards for
     * @return totalPending Total amount of pending credits
     */
    function getPendingRewards(address recipient) 
        external 
        view 
        returns (uint256 totalPending);

    /**
     * @notice Get total carbon offset for a user
     * @param account Address to get offset for
     * @return totalOffset Total carbon offset (kg CO2)
     */
    function getTotalCarbonOffset(address account) 
        external 
        view 
        returns (uint256 totalOffset);

    /**
     * @notice Get reward parameters
     * @return parameters Current reward parameters
     */
    function getRewardParameters() 
        external 
        view 
        returns (RewardParameters memory parameters);

    /**
     * @notice Update reward parameters (admin only)
     * @param parameters New reward parameters
     */
    function updateRewardParameters(
        RewardParameters memory parameters
    ) external;

    // ============ ERC20 FUNCTIONS ============
    // Note: Inherits standard ERC20 functions
    // function totalSupply() external view returns (uint256);
    // function balanceOf(address account) external view returns (uint256);
    // function transfer(address to, uint256 amount) external returns (bool);
    // function allowance(address owner, address spender) external view returns (uint256);
    // function approve(address spender, uint256 amount) external returns (bool);
    // function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

