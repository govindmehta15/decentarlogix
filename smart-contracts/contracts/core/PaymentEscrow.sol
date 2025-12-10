// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "../interfaces/IPaymentEscrow.sol";
import "../interfaces/ITripRegistry.sol";

/**
 * @title PaymentEscrow
 * @notice Conditional payment escrow system for DecentraLogix
 * @dev Handles payments tied to trip completion and milestones
 */
contract PaymentEscrow is Ownable, ReentrancyGuard, IPaymentEscrow {
    // ============ STATE VARIABLES ============
    
    uint256 private _escrowCounter;
    
    // Mapping from escrow ID to escrow payment
    mapping(uint256 => EscrowPayment) private _escrows;
    
    // Mapping from trip ID to escrow ID
    mapping(uint256 => uint256) private _tripToEscrow;
    
    // Reference to TripRegistry contract
    ITripRegistry public tripRegistry;
    
    // ============ MODIFIERS ============
    
    /**
     * @notice Modifier to check if escrow exists
     */
    modifier escrowExists(uint256 escrowId) {
        require(_escrows[escrowId].escrowId != 0, "PaymentEscrow: Escrow does not exist");
        _;
    }
    
    /**
     * @notice Modifier to check if caller is the payer
     */
    modifier onlyPayer(uint256 escrowId) {
        require(
            _escrows[escrowId].payer == msg.sender,
            "PaymentEscrow: Not authorized payer"
        );
        _;
    }
    
    /**
     * @notice Modifier to check if escrow is in valid status
     */
    modifier validStatusForRelease(uint256 escrowId) {
        EscrowStatus status = _escrows[escrowId].status;
        require(
            status == EscrowStatus.Pending || status == EscrowStatus.PartiallyReleased,
            "PaymentEscrow: Cannot release payment"
        );
        _;
    }
    
    // ============ CONSTRUCTOR ============
    
    constructor(address _tripRegistry) Ownable(msg.sender) {
        require(_tripRegistry != address(0), "PaymentEscrow: Invalid trip registry address");
        tripRegistry = ITripRegistry(_tripRegistry);
        _escrowCounter = 0;
    }
    
    // ============ EXTERNAL FUNCTIONS ============
    
    /**
     * @notice Create escrow for a trip
     * @param tripId Associated trip ID
     * @param payee Address receiving payment (carrier)
     * @param conditions Payment release conditions
     * @return escrowId Unique escrow identifier
     */
    function createEscrow(
        uint256 tripId,
        address payee,
        PaymentConditions memory conditions
    ) external payable override returns (uint256 escrowId) {
        // Input validation
        require(msg.value > 0, "PaymentEscrow: Must send payment");
        require(payee != address(0), "PaymentEscrow: Invalid payee address");
        require(_tripToEscrow[tripId] == 0, "PaymentEscrow: Escrow already exists for trip");
        
        // Verify trip exists
        try tripRegistry.getTripMetadata(tripId) returns (ITripRegistry.TripMetadata memory) {
            // Trip exists, continue
        } catch {
            revert("PaymentEscrow: Trip does not exist");
        }
        
        // Validate conditions
        require(
            conditions.milestonePercentage + conditions.completionPercentage <= 100,
            "PaymentEscrow: Invalid percentage sum"
        );
        
        // Increment counter
        _escrowCounter++;
        escrowId = _escrowCounter;
        
        // Create escrow payment
        EscrowPayment memory newEscrow = EscrowPayment({
            escrowId: escrowId,
            tripId: tripId,
            payer: msg.sender,
            payee: payee,
            amount: msg.value,
            releasedAmount: 0,
            status: EscrowStatus.Pending,
            createdAt: block.timestamp,
            releasedAt: 0,
            conditions: conditions
        });
        
        // Store escrow
        _escrows[escrowId] = newEscrow;
        _tripToEscrow[tripId] = escrowId;
        
        // Emit event
        emit EscrowCreated(escrowId, tripId, msg.sender, payee, msg.value);
        
        return escrowId;
    }
    
    /**
     * @notice Deposit additional funds to existing escrow
     * @param escrowId Unique escrow identifier
     */
    function depositToEscrow(uint256 escrowId) 
        external 
        payable 
        override 
        escrowExists(escrowId)
    {
        require(msg.value > 0, "PaymentEscrow: Must send payment");
        require(
            _escrows[escrowId].payer == msg.sender,
            "PaymentEscrow: Only payer can deposit"
        );
        require(
            _escrows[escrowId].status == EscrowStatus.Pending ||
            _escrows[escrowId].status == EscrowStatus.PartiallyReleased,
            "PaymentEscrow: Cannot deposit to escrow"
        );
        
        _escrows[escrowId].amount += msg.value;
        
        emit PaymentDeposited(escrowId, msg.value, _escrows[escrowId].amount);
    }
    
    /**
     * @notice Release payment when conditions are met (mock implementation)
     * @param escrowId Unique escrow identifier
     * @param amount Amount to release
     * @param reason Reason for release
     */
    function releasePayment(
        uint256 escrowId,
        uint256 amount,
        string memory reason
    ) 
        external 
        override 
        escrowExists(escrowId)
        validStatusForRelease(escrowId)
        nonReentrant
    {
        EscrowPayment storage escrow = _escrows[escrowId];
        
        // Validate amount
        require(amount > 0, "PaymentEscrow: Amount must be greater than 0");
        require(
            amount <= escrow.amount - escrow.releasedAmount,
            "PaymentEscrow: Insufficient balance"
        );
        
        // Mock: Allow owner or payer to release (in production, this would check conditions)
        require(
            msg.sender == owner() || msg.sender == escrow.payer,
            "PaymentEscrow: Not authorized to release"
        );
        
        // Update escrow state
        escrow.releasedAmount += amount;
        
        if (escrow.releasedAmount >= escrow.amount) {
            escrow.status = EscrowStatus.Released;
            escrow.releasedAt = block.timestamp;
        } else {
            escrow.status = EscrowStatus.PartiallyReleased;
        }
        
        // Transfer payment
        (bool success, ) = payable(escrow.payee).call{value: amount}("");
        require(success, "PaymentEscrow: Transfer failed");
        
        // Emit event
        emit PaymentReleased(escrowId, amount, escrow.payee, reason);
        
        if (escrow.status == EscrowStatus.Released) {
            emit EscrowStatusUpdated(escrowId, EscrowStatus.PartiallyReleased, EscrowStatus.Released);
        }
    }
    
    /**
     * @notice Release payment automatically when trip completes (mock implementation)
     * @param escrowId Unique escrow identifier
     * @param tripId Associated trip ID (for verification)
     */
    function releaseOnTripCompletion(
        uint256 escrowId,
        uint256 tripId
    ) 
        external 
        override 
        escrowExists(escrowId)
        validStatusForRelease(escrowId)
        nonReentrant
    {
        EscrowPayment storage escrow = _escrows[escrowId];
        
        // Verify trip ID matches
        require(escrow.tripId == tripId, "PaymentEscrow: Trip ID mismatch");
        
        // Verify trip is completed
        ITripRegistry.TripMetadata memory trip = tripRegistry.getTripMetadata(tripId);
        require(
            trip.status == ITripRegistry.TripStatus.Delivered,
            "PaymentEscrow: Trip not completed"
        );
        
        // Calculate release amount based on completion percentage
        uint256 releaseAmount = (escrow.amount * escrow.conditions.completionPercentage) / 100;
        uint256 remainingAmount = escrow.amount - escrow.releasedAmount;
        
        // Release the remaining amount or completion percentage, whichever is smaller
        uint256 amountToRelease = releaseAmount < remainingAmount ? releaseAmount : remainingAmount;
        
        require(amountToRelease > 0, "PaymentEscrow: No amount to release");
        
        // Update escrow state
        escrow.releasedAmount += amountToRelease;
        
        if (escrow.releasedAmount >= escrow.amount) {
            escrow.status = EscrowStatus.Released;
            escrow.releasedAt = block.timestamp;
        } else {
            escrow.status = EscrowStatus.PartiallyReleased;
        }
        
        // Transfer payment
        (bool success, ) = payable(escrow.payee).call{value: amountToRelease}("");
        require(success, "PaymentEscrow: Transfer failed");
        
        // Emit event
        emit PaymentReleased(escrowId, amountToRelease, escrow.payee, "Trip completed");
        
        if (escrow.status == EscrowStatus.Released) {
            emit EscrowStatusUpdated(escrowId, EscrowStatus.Pending, EscrowStatus.Released);
        }
    }
    
    /**
     * @notice Complete milestone and release milestone payment (mock - not fully implemented)
     * @param escrowId Unique escrow identifier
     * @param milestoneId Milestone identifier
     * @param proof IPFS hash for milestone proof
     */
    function completeMilestone(
        uint256 escrowId,
        uint256 milestoneId,
        string memory proof
    ) external override escrowExists(escrowId) {
        // Mock implementation - in production, this would verify milestone conditions
        EscrowPayment storage escrow = _escrows[escrowId];
        
        require(
            escrow.status == EscrowStatus.Pending,
            "PaymentEscrow: Escrow not in pending status"
        );
        
        // Mock: Calculate milestone amount
        uint256 milestoneAmount = (escrow.amount * escrow.conditions.milestonePercentage) / 100;
        
        require(milestoneAmount > 0, "PaymentEscrow: Invalid milestone amount");
        require(
            escrow.releasedAmount + milestoneAmount <= escrow.amount,
            "PaymentEscrow: Exceeds escrow amount"
        );
        
        escrow.releasedAmount += milestoneAmount;
        escrow.status = EscrowStatus.PartiallyReleased;
        
        // Transfer payment
        (bool success, ) = payable(escrow.payee).call{value: milestoneAmount}("");
        require(success, "PaymentEscrow: Transfer failed");
        
        emit MilestoneCompleted(escrowId, milestoneId, milestoneAmount);
        emit PaymentReleased(escrowId, milestoneAmount, escrow.payee, "Milestone completed");
    }
    
    /**
     * @notice Refund payment to payer
     * @param escrowId Unique escrow identifier
     * @param reason Reason for refund
     */
    function refundPayment(uint256 escrowId, string memory reason) 
        external 
        override 
        escrowExists(escrowId)
        onlyOwner
        nonReentrant
    {
        EscrowPayment storage escrow = _escrows[escrowId];
        
        require(
            escrow.status == EscrowStatus.Pending ||
            escrow.status == EscrowStatus.PartiallyReleased,
            "PaymentEscrow: Cannot refund"
        );
        
        uint256 refundAmount = escrow.amount - escrow.releasedAmount;
        require(refundAmount > 0, "PaymentEscrow: No amount to refund");
        
        escrow.status = EscrowStatus.Refunded;
        
        // Transfer refund
        (bool success, ) = payable(escrow.payer).call{value: refundAmount}("");
        require(success, "PaymentEscrow: Refund failed");
        
        emit PaymentRefunded(escrowId, refundAmount, reason);
        emit EscrowStatusUpdated(escrowId, escrow.status, EscrowStatus.Refunded);
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @notice Get escrow details
     * @param escrowId Unique escrow identifier
     * @return escrow Escrow payment structure
     */
    function getEscrow(uint256 escrowId) 
        external 
        view 
        override 
        escrowExists(escrowId)
        returns (EscrowPayment memory escrow)
    {
        return _escrows[escrowId];
    }
    
    /**
     * @notice Get escrow ID by trip ID
     * @param tripId Trip identifier
     * @return escrowId Associated escrow ID
     */
    function getEscrowByTrip(uint256 tripId) 
        external 
        view 
        override 
        returns (uint256 escrowId)
    {
        escrowId = _tripToEscrow[tripId];
        require(escrowId != 0, "PaymentEscrow: No escrow for trip");
        return escrowId;
    }
    
    /**
     * @notice Check if payment can be released (mock implementation)
     * @param escrowId Unique escrow identifier
     * @return canRelease True if conditions are met
     * @return reason Reason if cannot release
     */
    function canReleasePayment(uint256 escrowId) 
        external 
        view 
        override 
        escrowExists(escrowId)
        returns (bool canRelease, string memory reason)
    {
        EscrowPayment memory escrow = _escrows[escrowId];
        
        if (escrow.status == EscrowStatus.Released) {
            return (false, "Payment already released");
        }
        
        if (escrow.status == EscrowStatus.Refunded) {
            return (false, "Payment refunded");
        }
        
        // Mock: Check if trip is completed
        try tripRegistry.getTripMetadata(escrow.tripId) returns (ITripRegistry.TripMetadata memory trip) {
            if (trip.status == ITripRegistry.TripStatus.Delivered) {
                return (true, "Trip completed");
            }
        } catch {
            return (false, "Trip not found");
        }
        
        return (false, "Conditions not met");
    }
    
    /**
     * @notice Get available balance in escrow
     * @param escrowId Unique escrow identifier
     * @return balance Available balance
     */
    function getEscrowBalance(uint256 escrowId) 
        external 
        view 
        override 
        escrowExists(escrowId)
        returns (uint256 balance)
    {
        EscrowPayment memory escrow = _escrows[escrowId];
        return escrow.amount - escrow.releasedAmount;
    }
    
    /**
     * @notice Get total number of escrows created
     * @return count Total escrow count
     */
    function getTotalEscrows() external view returns (uint256 count) {
        return _escrowCounter;
    }
    
    // ============ RECEIVE FUNCTION ============
    
    /**
     * @notice Allow contract to receive ETH
     */
    receive() external payable {
        // Contract can receive ETH for escrow deposits
    }
}

