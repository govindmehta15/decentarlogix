// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title ITripRegistry
 * @notice Interface for NFT-based trip token registry
 * @dev Each trip is represented as an NFT (ERC721) with metadata
 */
interface ITripRegistry {
    // ============ STRUCTS ============
    
    /**
     * @notice Trip metadata structure
     * @param tripId Unique identifier for the trip
     * @param shipper Address of the shipper (trip creator)
     * @param carrier Address of the carrier (transport provider)
     * @param receiver Address of the receiver (destination)
     * @param originLocation Origin location (IPFS hash or encoded string)
     * @param destinationLocation Destination location (IPFS hash or encoded string)
     * @param distance Distance in kilometers (or miles)
     * @param estimatedCarbonFootprint Estimated carbon footprint in kg CO2
     * @param status Current status of the trip
     * @param createdAt Timestamp when trip was created
     * @param startedAt Timestamp when trip started (0 if not started)
     * @param completedAt Timestamp when trip completed (0 if not completed)
     * @param ipfsMetadataHash IPFS hash for additional metadata (documents, images, etc.)
     */
    struct TripMetadata {
        uint256 tripId;
        address shipper;
        address carrier;
        address receiver;
        string originLocation;
        string destinationLocation;
        uint256 distance; // in kilometers
        uint256 estimatedCarbonFootprint; // in kg CO2
        TripStatus status;
        uint256 createdAt;
        uint256 startedAt;
        uint256 completedAt;
        string ipfsMetadataHash;
    }

    /**
     * @notice Trip status enumeration
     */
    enum TripStatus {
        Created,      // Trip created but not started
        InTransit,    // Trip in progress
        Delivered,    // Trip completed successfully
        Cancelled,    // Trip cancelled
        Disputed      // Trip under dispute
    }

    // ============ EVENTS ============

    /**
     * @notice Emitted when a new trip is created and minted as NFT
     * @param tripId Unique trip identifier
     * @param tokenId NFT token ID
     * @param shipper Address of trip creator
     * @param carrier Address of assigned carrier
     */
    event TripCreated(
        uint256 indexed tripId,
        uint256 indexed tokenId,
        address indexed shipper,
        address carrier
    );

    /**
     * @notice Emitted when trip status changes
     * @param tripId Unique trip identifier
     * @param oldStatus Previous status
     * @param newStatus New status
     */
    event TripStatusUpdated(
        uint256 indexed tripId,
        TripStatus oldStatus,
        TripStatus newStatus
    );

    /**
     * @notice Emitted when trip is started
     * @param tripId Unique trip identifier
     * @param startedAt Timestamp when trip started
     */
    event TripStarted(
        uint256 indexed tripId,
        uint256 startedAt
    );

    /**
     * @notice Emitted when trip is completed
     * @param tripId Unique trip identifier
     * @param completedAt Timestamp when trip completed
     * @param actualCarbonFootprint Actual carbon footprint recorded
     */
    event TripCompleted(
        uint256 indexed tripId,
        uint256 completedAt,
        uint256 actualCarbonFootprint
    );

    /**
     * @notice Emitted when trip metadata is updated
     * @param tripId Unique trip identifier
     * @param field Field that was updated
     * @param newValue New value
     */
    event TripMetadataUpdated(
        uint256 indexed tripId,
        string field,
        bytes newValue
    );

    // ============ FUNCTIONS ============

    /**
     * @notice Create a new trip and mint as NFT
     * @param carrier Address of the carrier
     * @param receiver Address of the receiver
     * @param originLocation Origin location
     * @param destinationLocation Destination location
     * @param distance Distance in kilometers
     * @param estimatedCarbonFootprint Estimated carbon footprint
     * @param ipfsMetadataHash IPFS hash for additional metadata
     * @return tripId Unique trip identifier
     * @return tokenId NFT token ID
     */
    function createTrip(
        address carrier,
        address receiver,
        string memory originLocation,
        string memory destinationLocation,
        uint256 distance,
        uint256 estimatedCarbonFootprint,
        string memory ipfsMetadataHash
    ) external returns (uint256 tripId, uint256 tokenId);

    /**
     * @notice Start a trip (can only be called by assigned carrier)
     * @param tripId Unique trip identifier
     */
    function startTrip(uint256 tripId) external;

    /**
     * @notice Complete a trip (can only be called by assigned carrier)
     * @param tripId Unique trip identifier
     * @param actualCarbonFootprint Actual carbon footprint recorded
     * @param ipfsProofHash IPFS hash for delivery proof
     */
    function completeTrip(
        uint256 tripId,
        uint256 actualCarbonFootprint,
        string memory ipfsProofHash
    ) external;

    /**
     * @notice Cancel a trip (can be called by shipper or carrier)
     * @param tripId Unique trip identifier
     * @param reason Reason for cancellation
     */
    function cancelTrip(uint256 tripId, string memory reason) external;

    /**
     * @notice Update trip status (admin or authorized role)
     * @param tripId Unique trip identifier
     * @param newStatus New status to set
     */
    function updateTripStatus(uint256 tripId, TripStatus newStatus) external;

    /**
     * @notice Get trip metadata by trip ID
     * @param tripId Unique trip identifier
     * @return metadata Trip metadata structure
     */
    function getTripMetadata(uint256 tripId) 
        external 
        view 
        returns (TripMetadata memory metadata);

    /**
     * @notice Get trip ID by NFT token ID
     * @param tokenId NFT token ID
     * @return tripId Associated trip ID
     */
    function getTripIdByToken(uint256 tokenId) 
        external 
        view 
        returns (uint256 tripId);

    /**
     * @notice Get NFT token ID by trip ID
     * @param tripId Unique trip identifier
     * @return tokenId Associated NFT token ID
     */
    function getTokenIdByTrip(uint256 tripId) 
        external 
        view 
        returns (uint256 tokenId);

    /**
     * @notice Check if address is authorized for trip
     * @param tripId Unique trip identifier
     * @param account Address to check
     * @return isAuthorized True if authorized
     */
    function isAuthorizedForTrip(uint256 tripId, address account) 
        external 
        view 
        returns (bool isAuthorized);
}

