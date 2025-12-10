// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title IPaymentEscrow
 * @notice Interface for conditional payment escrow system
 * @dev Handles payments tied to trip completion and milestones
 */
interface IPaymentEscrow {
    // ============ STRUCTS ============

    /**
     * @notice Escrow payment structure
     * @param escrowId Unique escrow identifier
     * @param tripId Associated trip ID
     * @param payer Address making the payment (shipper)
     * @param payee Address receiving the payment (carrier)
     * @param amount Total amount in escrow
     * @param releasedAmount Amount already released
     * @param status Current escrow status
     * @param createdAt Timestamp when escrow was created
     * @param releasedAt Timestamp when payment was released (0 if not released)
     * @param conditions Conditions for payment release
     */
    struct EscrowPayment {
        uint256 escrowId;
        uint256 tripId;
        address payer;
        address payee;
        uint256 amount;
        uint256 releasedAmount;
        EscrowStatus status;
        uint256 createdAt;
        uint256 releasedAt;
        PaymentConditions conditions;
    }

    /**
     * @notice Payment release conditions
     * @param requiresTripCompletion True if payment requires trip completion
     * @param requiresDeliveryProof True if payment requires delivery proof
     * @param requiresReceiverConfirmation True if payment requires receiver confirmation
     * @param milestonePercentage Percentage released at milestones (0-100)
     * @param completionPercentage Percentage released on completion (0-100)
     */
    struct PaymentConditions {
        bool requiresTripCompletion;
        bool requiresDeliveryProof;
        bool requiresReceiverConfirmation;
        uint8 milestonePercentage; // Percentage for milestone payments
        uint8 completionPercentage; // Percentage for completion
    }

    /**
     * @notice Escrow status enumeration
     */
    enum EscrowStatus {
        Pending,        // Escrow created, awaiting conditions
        PartiallyReleased, // Some amount released (milestones)
        Released,       // Full payment released
        Refunded,       // Payment refunded to payer
        Disputed        // Payment under dispute
    }

    /**
     * @notice Milestone structure for partial payments
     * @param milestoneId Unique milestone identifier
     * @param escrowId Associated escrow ID
     * @param description Milestone description
     * @param amount Amount to release at this milestone
     * @param isCompleted Whether milestone is completed
     * @param completedAt Timestamp when milestone completed
     */
    struct Milestone {
        uint256 milestoneId;
        uint256 escrowId;
        string description;
        uint256 amount;
        bool isCompleted;
        uint256 completedAt;
    }

    // ============ EVENTS ============

    /**
     * @notice Emitted when escrow is created
     * @param escrowId Unique escrow identifier
     * @param tripId Associated trip ID
     * @param payer Address making payment
     * @param payee Address receiving payment
     * @param amount Amount in escrow
     */
    event EscrowCreated(
        uint256 indexed escrowId,
        uint256 indexed tripId,
        address indexed payer,
        address payee,
        uint256 amount
    );

    /**
     * @notice Emitted when payment is deposited to escrow
     * @param escrowId Unique escrow identifier
     * @param amount Amount deposited
     * @param totalAmount Total amount now in escrow
     */
    event PaymentDeposited(
        uint256 indexed escrowId,
        uint256 amount,
        uint256 totalAmount
    );

    /**
     * @notice Emitted when payment is released
     * @param escrowId Unique escrow identifier
     * @param amount Amount released
     * @param recipient Address receiving payment
     * @param reason Reason for release
     */
    event PaymentReleased(
        uint256 indexed escrowId,
        uint256 amount,
        address indexed recipient,
        string reason
    );

    /**
     * @notice Emitted when milestone is completed
     * @param escrowId Unique escrow identifier
     * @param milestoneId Milestone identifier
     * @param amount Amount released for milestone
     */
    event MilestoneCompleted(
        uint256 indexed escrowId,
        uint256 indexed milestoneId,
        uint256 amount
    );

    /**
     * @notice Emitted when payment is refunded
     * @param escrowId Unique escrow identifier
     * @param amount Amount refunded
     * @param reason Reason for refund
     */
    event PaymentRefunded(
        uint256 indexed escrowId,
        uint256 amount,
        string reason
    );

    /**
     * @notice Emitted when escrow status changes
     * @param escrowId Unique escrow identifier
     * @param oldStatus Previous status
     * @param newStatus New status
     */
    event EscrowStatusUpdated(
        uint256 indexed escrowId,
        EscrowStatus oldStatus,
        EscrowStatus newStatus
    );

    // ============ FUNCTIONS ============

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
    ) external payable returns (uint256 escrowId);

    /**
     * @notice Deposit additional funds to existing escrow
     * @param escrowId Unique escrow identifier
     */
    function depositToEscrow(uint256 escrowId) external payable;

    /**
     * @notice Release payment when conditions are met
     * @param escrowId Unique escrow identifier
     * @param amount Amount to release
     * @param reason Reason for release
     */
    function releasePayment(
        uint256 escrowId,
        uint256 amount,
        string memory reason
    ) external;

    /**
     * @notice Release payment automatically when trip completes
     * @param escrowId Unique escrow identifier
     * @param tripId Associated trip ID (for verification)
     */
    function releaseOnTripCompletion(
        uint256 escrowId,
        uint256 tripId
    ) external;

    /**
     * @notice Complete milestone and release milestone payment
     * @param escrowId Unique escrow identifier
     * @param milestoneId Milestone identifier
     * @param proof IPFS hash for milestone proof
     */
    function completeMilestone(
        uint256 escrowId,
        uint256 milestoneId,
        string memory proof
    ) external;

    /**
     * @notice Refund payment to payer
     * @param escrowId Unique escrow identifier
     * @param reason Reason for refund
     */
    function refundPayment(uint256 escrowId, string memory reason) external;

    /**
     * @notice Get escrow details
     * @param escrowId Unique escrow identifier
     * @return escrow Escrow payment structure
     */
    function getEscrow(uint256 escrowId) 
        external 
        view 
        returns (EscrowPayment memory escrow);

    /**
     * @notice Get escrow ID by trip ID
     * @param tripId Trip identifier
     * @return escrowId Associated escrow ID
     */
    function getEscrowByTrip(uint256 tripId) 
        external 
        view 
        returns (uint256 escrowId);

    /**
     * @notice Check if payment can be released
     * @param escrowId Unique escrow identifier
     * @return canRelease True if conditions are met
     * @return reason Reason if cannot release
     */
    function canReleasePayment(uint256 escrowId) 
        external 
        view 
        returns (bool canRelease, string memory reason);

    /**
     * @notice Get available balance in escrow
     * @param escrowId Unique escrow identifier
     * @return balance Available balance
     */
    function getEscrowBalance(uint256 escrowId) 
        external 
        view 
        returns (uint256 balance);
}

