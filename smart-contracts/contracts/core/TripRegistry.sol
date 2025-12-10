// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "../interfaces/ITripRegistry.sol";

/**
 * @title TripRegistry
 * @notice NFT-based trip token registry for DecentraLogix
 * @dev Each trip is represented as a unique NFT (ERC721)
 */
contract TripRegistry is ERC721, ERC721URIStorage, Ownable, ReentrancyGuard, ITripRegistry {
    // ============ STATE VARIABLES ============
    
    uint256 private _tripCounter;
    uint256 private _tokenCounter;
    
    // Mapping from trip ID to trip metadata
    mapping(uint256 => TripMetadata) private _trips;
    
    // Mapping from token ID to trip ID
    mapping(uint256 => uint256) private _tokenToTrip;
    
    // Mapping from trip ID to token ID
    mapping(uint256 => uint256) private _tripToToken;
    
    // ============ MODIFIERS ============
    
    /**
     * @notice Modifier to check if trip exists
     */
    modifier tripExists(uint256 tripId) {
        require(_trips[tripId].tripId != 0, "TripRegistry: Trip does not exist");
        _;
    }
    
    /**
     * @notice Modifier to check if caller is the carrier for the trip
     */
    modifier onlyCarrier(uint256 tripId) {
        require(
            _trips[tripId].carrier == msg.sender,
            "TripRegistry: Not authorized carrier"
        );
        _;
    }
    
    /**
     * @notice Modifier to check if caller is shipper or carrier
     */
    modifier onlyShipperOrCarrier(uint256 tripId) {
        require(
            _trips[tripId].shipper == msg.sender ||
            _trips[tripId].carrier == msg.sender,
            "TripRegistry: Not authorized"
        );
        _;
    }
    
    /**
     * @notice Modifier to check if trip is in valid status for operation
     */
    modifier validStatusForStart(uint256 tripId) {
        require(
            _trips[tripId].status == TripStatus.Created,
            "TripRegistry: Trip cannot be started"
        );
        _;
    }
    
    modifier validStatusForComplete(uint256 tripId) {
        require(
            _trips[tripId].status == TripStatus.InTransit,
            "TripRegistry: Trip cannot be completed"
        );
        _;
    }
    
    // ============ CONSTRUCTOR ============
    
    constructor() ERC721("DecentraLogix Trip", "DLXTRIP") Ownable(msg.sender) {
        _tripCounter = 0;
        _tokenCounter = 0;
    }
    
    // ============ EXTERNAL FUNCTIONS ============
    
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
    ) external override returns (uint256 tripId, uint256 tokenId) {
        // Input validation
        require(carrier != address(0), "TripRegistry: Invalid carrier address");
        require(receiver != address(0), "TripRegistry: Invalid receiver address");
        require(carrier != msg.sender, "TripRegistry: Cannot be own carrier");
        require(distance > 0, "TripRegistry: Distance must be greater than 0");
        require(estimatedCarbonFootprint > 0, "TripRegistry: Carbon footprint must be greater than 0");
        
        // Increment counters
        _tripCounter++;
        _tokenCounter++;
        
        tripId = _tripCounter;
        tokenId = _tokenCounter;
        
        // Create trip metadata
        TripMetadata memory newTrip = TripMetadata({
            tripId: tripId,
            shipper: msg.sender,
            carrier: carrier,
            receiver: receiver,
            originLocation: originLocation,
            destinationLocation: destinationLocation,
            distance: distance,
            estimatedCarbonFootprint: estimatedCarbonFootprint,
            status: TripStatus.Created,
            createdAt: block.timestamp,
            startedAt: 0,
            completedAt: 0,
            ipfsMetadataHash: ipfsMetadataHash
        });
        
        // Store trip metadata
        _trips[tripId] = newTrip;
        
        // Link token to trip
        _tokenToTrip[tokenId] = tripId;
        _tripToToken[tripId] = tokenId;
        
        // Mint NFT to shipper
        _safeMint(msg.sender, tokenId);
        
        // Set token URI if IPFS hash provided
        if (bytes(ipfsMetadataHash).length > 0) {
            _setTokenURI(tokenId, ipfsMetadataHash);
        }
        
        // Emit event
        emit TripCreated(tripId, tokenId, msg.sender, carrier);
        
        return (tripId, tokenId);
    }
    
    /**
     * @notice Start a trip (can only be called by assigned carrier)
     * @param tripId Unique trip identifier
     */
    function startTrip(uint256 tripId) 
        external 
        override 
        tripExists(tripId)
        onlyCarrier(tripId)
        validStatusForStart(tripId)
    {
        TripStatus oldStatus = _trips[tripId].status;
        _trips[tripId].status = TripStatus.InTransit;
        _trips[tripId].startedAt = block.timestamp;
        
        emit TripStatusUpdated(tripId, oldStatus, TripStatus.InTransit);
        emit TripStarted(tripId, block.timestamp);
    }
    
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
    ) 
        external 
        override 
        tripExists(tripId)
        onlyCarrier(tripId)
        validStatusForComplete(tripId)
    {
        TripStatus oldStatus = _trips[tripId].status;
        _trips[tripId].status = TripStatus.Delivered;
        _trips[tripId].completedAt = block.timestamp;
        
        // Update IPFS hash if provided
        if (bytes(ipfsProofHash).length > 0) {
            uint256 tokenId = _tripToToken[tripId];
            _setTokenURI(tokenId, ipfsProofHash);
            _trips[tripId].ipfsMetadataHash = ipfsProofHash;
        }
        
        emit TripStatusUpdated(tripId, oldStatus, TripStatus.Delivered);
        emit TripCompleted(tripId, block.timestamp, actualCarbonFootprint);
    }
    
    /**
     * @notice Cancel a trip (can be called by shipper or carrier)
     * @param tripId Unique trip identifier
     * @param reason Reason for cancellation
     */
    function cancelTrip(uint256 tripId, string memory reason) 
        external 
        override 
        tripExists(tripId)
        onlyShipperOrCarrier(tripId)
    {
        require(
            _trips[tripId].status == TripStatus.Created ||
            _trips[tripId].status == TripStatus.InTransit,
            "TripRegistry: Trip cannot be cancelled"
        );
        
        TripStatus oldStatus = _trips[tripId].status;
        _trips[tripId].status = TripStatus.Cancelled;
        
        emit TripStatusUpdated(tripId, oldStatus, TripStatus.Cancelled);
        emit TripMetadataUpdated(tripId, "cancellation_reason", bytes(reason));
    }
    
    /**
     * @notice Update trip status (admin only)
     * @param tripId Unique trip identifier
     * @param newStatus New status to set
     */
    function updateTripStatus(uint256 tripId, TripStatus newStatus) 
        external 
        override 
        onlyOwner
        tripExists(tripId)
    {
        TripStatus oldStatus = _trips[tripId].status;
        _trips[tripId].status = newStatus;
        
        emit TripStatusUpdated(tripId, oldStatus, newStatus);
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @notice Get trip metadata by trip ID
     * @param tripId Unique trip identifier
     * @return metadata Trip metadata structure
     */
    function getTripMetadata(uint256 tripId) 
        external 
        view 
        override 
        returns (TripMetadata memory metadata)
    {
        require(_trips[tripId].tripId != 0, "TripRegistry: Trip does not exist");
        return _trips[tripId];
    }
    
    /**
     * @notice Get trip ID by NFT token ID
     * @param tokenId NFT token ID
     * @return tripId Associated trip ID
     */
    function getTripIdByToken(uint256 tokenId) 
        external 
        view 
        override 
        returns (uint256 tripId)
    {
        require(_exists(tokenId), "TripRegistry: Token does not exist");
        return _tokenToTrip[tokenId];
    }
    
    /**
     * @notice Get NFT token ID by trip ID
     * @param tripId Unique trip identifier
     * @return tokenId Associated NFT token ID
     */
    function getTokenIdByTrip(uint256 tripId) 
        external 
        view 
        override 
        returns (uint256 tokenId)
    {
        require(_trips[tripId].tripId != 0, "TripRegistry: Trip does not exist");
        return _tripToToken[tripId];
    }
    
    /**
     * @notice Check if address is authorized for trip
     * @param tripId Unique trip identifier
     * @param account Address to check
     * @return isAuthorized True if authorized
     */
    function isAuthorizedForTrip(uint256 tripId, address account) 
        external 
        view 
        override 
        returns (bool isAuthorized)
    {
        if (_trips[tripId].tripId == 0) {
            return false;
        }
        
        return (
            _trips[tripId].shipper == account ||
            _trips[tripId].carrier == account ||
            _trips[tripId].receiver == account ||
            owner() == account
        );
    }
    
    /**
     * @notice Get total number of trips created
     * @return count Total trip count
     */
    function getTotalTrips() external view returns (uint256 count) {
        return _tripCounter;
    }
    
    // ============ OVERRIDE FUNCTIONS ============
    
    /**
     * @notice Override tokenURI to return IPFS hash
     */
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
    
    /**
     * @notice Override supportsInterface for ERC721URIStorage
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}

