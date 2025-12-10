// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./ITripRegistry.sol";
import "./IPaymentEscrow.sol";
import "./ICarbonCredits.sol";

/**
 * @title ILogisticsCore
 * @notice Main interface that integrates all logistics components
 * @dev Coordinates between TripRegistry, PaymentEscrow, and CarbonCredits
 */
interface ILogisticsCore {
    // ============ EVENTS ============

    /**
     * @notice Emitted when a complete trip is created with all components
     * @param tripId Unique trip identifier
     * @param escrowId Associated escrow ID
     * @param shipper Address of shipper
     * @param carrier Address of carrier
     */
    event CompleteTripCreated(
        uint256 indexed tripId,
        uint256 indexed escrowId,
        address indexed shipper,
        address carrier
    );

    /**
     * @notice Emitted when trip completion triggers automatic actions
     * @param tripId Unique trip identifier
     * @param paymentReleased Amount of payment released
     * @param carbonCreditsMinted Amount of carbon credits minted
     */
    event TripCompletionProcessed(
        uint256 indexed tripId,
        uint256 paymentReleased,
        uint256 carbonCreditsMinted
    );

    // ============ FUNCTIONS ============

    /**
     * @notice Create complete trip with escrow and setup
     * @param carrier Address of carrier
     * @param receiver Address of receiver
     * @param originLocation Origin location
     * @param destinationLocation Destination location
     * @param distance Distance in kilometers
     * @param estimatedCarbonFootprint Estimated carbon footprint
     * @param ipfsMetadataHash IPFS hash for metadata
     * @param paymentConditions Payment release conditions
     * @return tripId Unique trip identifier
     * @return escrowId Associated escrow ID
     */
    function createCompleteTrip(
        address carrier,
        address receiver,
        string memory originLocation,
        string memory destinationLocation,
        uint256 distance,
        uint256 estimatedCarbonFootprint,
        string memory ipfsMetadataHash,
        IPaymentEscrow.PaymentConditions memory paymentConditions
    ) external payable returns (uint256 tripId, uint256 escrowId);

    /**
     * @notice Complete trip and process all related actions
     * @param tripId Unique trip identifier
     * @param actualCarbonFootprint Actual carbon footprint
     * @param ipfsProofHash IPFS hash for delivery proof
     */
    function completeTripWithRewards(
        uint256 tripId,
        uint256 actualCarbonFootprint,
        string memory ipfsProofHash
    ) external;

    /**
     * @notice Get contract addresses
     * @return tripRegistry Address of TripRegistry contract
     * @return paymentEscrow Address of PaymentEscrow contract
     * @return carbonCredits Address of CarbonCredits contract
     */
    function getContractAddresses()
        external
        view
        returns (
            address tripRegistry,
            address paymentEscrow,
            address carbonCredits
        );
}

