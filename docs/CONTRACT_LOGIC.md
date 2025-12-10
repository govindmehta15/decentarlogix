# Contract Logic Learning Documentation

This document explains the logic and patterns used in DecentraLogix smart contracts.

## Table of Contents

1. [TripRegistry Logic](#tripregistry-logic)
2. [PaymentEscrow Logic](#paymentescrow-logic)
3. [CarbonCredits Logic](#carboncredits-logic)
4. [Common Patterns](#common-patterns)
5. [Security Considerations](#security-considerations)

---

## TripRegistry Logic

### NFT-Based Trip Representation

**Concept**: Each trip is a unique NFT (ERC721 token). This provides:
- Ownership tracking
- Transferability
- Provenance
- Metadata storage

**Implementation**:
```solidity
// Create trip and mint NFT
function createTrip(...) returns (uint256 tripId, uint256 tokenId) {
    _tripCounter++;
    _tokenCounter++;
    
    // Store trip metadata
    _trips[tripId] = TripMetadata{...};
    
    // Link token to trip
    _tokenToTrip[tokenId] = tripId;
    _tripToToken[tripId] = tokenId;
    
    // Mint NFT to shipper
    _safeMint(msg.sender, tokenId);
}
```

**Why NFT?**
- Each trip is unique (different origin, destination, participants)
- Ownership represents control/rights
- Can be transferred or traded
- Metadata stored on-chain and IPFS

### State Machine

**Trip Lifecycle**:
```
Created → InTransit → Delivered
   ↓         ↓
Cancelled  Cancelled
```

**State Transitions**:
1. **Created**: Trip created, NFT minted, waiting to start
2. **InTransit**: Carrier started the trip
3. **Delivered**: Trip completed successfully
4. **Cancelled**: Trip cancelled by shipper or carrier
5. **Disputed**: Trip under dispute (admin only)

**Validation**:
- Can only start from `Created` status
- Can only complete from `InTransit` status
- Can cancel from `Created` or `InTransit`

### Access Control Logic

**Three-Tier Authorization**:
1. **Shipper**: Trip creator, owns NFT, can cancel
2. **Carrier**: Assigned transport provider, can start/complete
3. **Receiver**: Destination party, can view
4. **Owner**: Contract owner, can update status

**Implementation**:
```solidity
modifier onlyCarrier(uint256 tripId) {
    require(
        _trips[tripId].carrier == msg.sender,
        "Not authorized carrier"
    );
    _;
}
```

### Metadata Storage

**On-Chain**:
- Core trip data (IDs, addresses, timestamps, status)
- Essential for contract logic

**Off-Chain (IPFS)**:
- Documents (bills of lading, invoices)
- Images (delivery proof)
- Additional metadata

**Hybrid Approach**:
- Store IPFS hash on-chain
- Retrieve full data from IPFS when needed
- Reduces gas costs

---

## PaymentEscrow Logic

### Escrow Pattern

**Concept**: Hold funds in contract until conditions are met.

**Flow**:
1. Payer deposits funds to escrow
2. Funds locked in contract
3. Conditions checked
4. Payment released when conditions met
5. Remaining funds refunded if needed

**Implementation**:
```solidity
function createEscrow(...) payable {
    // Store escrow with payment
    _escrows[escrowId] = EscrowPayment{
        amount: msg.value,
        status: EscrowStatus.Pending,
        ...
    };
}
```

### Conditional Release

**Conditions**:
- `requiresTripCompletion`: Payment requires trip to be delivered
- `requiresDeliveryProof`: Payment requires delivery proof
- `requiresReceiverConfirmation`: Payment requires receiver confirmation
- `milestonePercentage`: Percentage for milestone payments
- `completionPercentage`: Percentage for completion

**Release Logic**:
```solidity
function releaseOnTripCompletion(...) {
    // Verify trip is completed
    require(trip.status == TripStatus.Delivered);
    
    // Calculate release amount
    uint256 releaseAmount = (amount * completionPercentage) / 100;
    
    // Transfer to payee
    payable(payee).transfer(releaseAmount);
}
```

### Milestone Payments

**Concept**: Release partial payments at milestones.

**Example**:
- 30% on pickup
- 30% at midpoint
- 40% on delivery

**Implementation** (Mock):
```solidity
function completeMilestone(...) {
    uint256 milestoneAmount = (amount * milestonePercentage) / 100;
    escrow.releasedAmount += milestoneAmount;
    escrow.status = EscrowStatus.PartiallyReleased;
    payable(payee).transfer(milestoneAmount);
}
```

### Refund Logic

**When to Refund**:
- Trip cancelled
- Dispute resolved in payer's favor
- Conditions not met

**Implementation**:
```solidity
function refundPayment(...) {
    uint256 refundAmount = escrow.amount - escrow.releasedAmount;
    escrow.status = EscrowStatus.Refunded;
    payable(payer).transfer(refundAmount);
}
```

### Security Patterns

**Reentrancy Protection**:
```solidity
modifier nonReentrant {
    require(!locked, "Reentrant call");
    locked = true;
    _;
    locked = false;
}
```

**Checks-Effects-Interactions**:
1. **Checks**: Validate inputs and conditions
2. **Effects**: Update state
3. **Interactions**: External calls (transfers)

---

## CarbonCredits Logic

### Reward Calculation

**Base Formula**:
```
baseAmount = carbonOffset * baseMultiplier
bonus = baseAmount * bonusPercentage / 100
totalReward = baseAmount + bonus
```

**Example**:
- Carbon offset: 100 kg CO2
- Base multiplier: 100 credits/kg
- Base amount: 10,000 credits
- Low carbon bonus: 20%
- Bonus: 2,000 credits
- Total: 12,000 credits

**Implementation**:
```solidity
function calculateReward(uint256 carbonOffset, RewardType rewardType) {
    uint256 baseAmount = carbonOffset * baseMultiplier;
    uint256 bonus = 0;
    
    if (rewardType == RewardType.LowCarbonFootprint) {
        bonus = (baseAmount * lowCarbonBonus) / 100;
    }
    // ... other reward types
    
    return baseAmount + bonus;
}
```

### Reward Types

1. **TripCompletion**: Base reward for completing trip
2. **LowCarbonFootprint**: 20% bonus for low carbon
3. **CarbonNeutral**: 50% bonus for carbon neutral
4. **BatchOptimization**: 15% bonus for batch optimization
5. **SustainableMode**: Base reward for sustainable transport

### Minting Logic

**Direct Minting** (MVP):
- Credits minted directly to recipient
- No claim step required
- Simpler for MVP

**Future Enhancement**:
- Claimable rewards
- Vesting periods
- Staking mechanisms

**Implementation**:
```solidity
function mintReward(...) {
    // Calculate reward
    uint256 amount = calculateReward(carbonOffset, rewardType);
    
    // Create reward record
    _rewards[rewardId] = CarbonReward{...};
    
    // Mint tokens
    _mint(recipient, amount);
    
    // Track carbon offset
    _totalCarbonOffset[recipient] += carbonOffset;
}
```

### Carbon Offset Tracking

**Purpose**: Track total environmental impact per user.

**Storage**:
```solidity
mapping(address => uint256) private _totalCarbonOffset;
```

**Update**:
```solidity
_totalCarbonOffset[recipient] += carbonOffset;
```

**Use Cases**:
- Display user's total offset
- Calculate sustainability score
- Leaderboards
- Certifications

### Burning Mechanism

**Purpose**: Allow users to "offset" carbon by burning credits.

**Use Cases**:
- Voluntary carbon offsetting
- Corporate sustainability programs
- Carbon credit trading

**Implementation**:
```solidity
function burnCredits(uint256 amount, string memory reason) {
    require(balanceOf(msg.sender) >= amount);
    _burn(msg.sender, amount);
    emit CarbonCreditsBurned(msg.sender, amount, reason);
}
```

---

## Common Patterns

### Counter Pattern

**Purpose**: Generate unique IDs.

**Implementation**:
```solidity
uint256 private _counter;

function create() external {
    _counter++;
    uint256 id = _counter;
    // Use id
}
```

**Benefits**:
- Simple and gas-efficient
- Sequential IDs
- No collisions

### Mapping Pattern

**Purpose**: Store and retrieve data by ID.

**Implementation**:
```solidity
mapping(uint256 => Data) private _data;

function get(uint256 id) external view returns (Data memory) {
    return _data[id];
}
```

**Benefits**:
- O(1) lookup
- Efficient storage
- Easy to use

### Bidirectional Mapping

**Purpose**: Link two entities (e.g., trip and token).

**Implementation**:
```solidity
mapping(uint256 => uint256) private _tripToToken;
mapping(uint256 => uint256) private _tokenToTrip;

function link(uint256 tripId, uint256 tokenId) {
    _tripToToken[tripId] = tokenId;
    _tokenToTrip[tokenId] = tripId;
}
```

### Event Indexing

**Purpose**: Enable efficient off-chain querying.

**Implementation**:
```solidity
event TripCreated(
    uint256 indexed tripId,      // Indexed
    uint256 indexed tokenId,     // Indexed
    address indexed shipper,      // Indexed
    address carrier              // Not indexed
);
```

**Benefits**:
- Filter by indexed parameters
- Efficient event queries
- Off-chain indexing

### Modifier Pattern

**Purpose**: Reusable access control and validation.

**Implementation**:
```solidity
modifier onlyCarrier(uint256 tripId) {
    require(_trips[tripId].carrier == msg.sender);
    _;
}

function startTrip(uint256 tripId) onlyCarrier(tripId) {
    // Function body
}
```

**Benefits**:
- DRY principle
- Consistent checks
- Readable code

---

## Security Considerations

### Input Validation

**Always validate**:
- Addresses are not zero
- Amounts are greater than zero
- IDs exist
- Status transitions are valid

**Example**:
```solidity
require(carrier != address(0), "Invalid carrier");
require(amount > 0, "Amount must be positive");
require(_trips[tripId].tripId != 0, "Trip not found");
```

### Reentrancy Protection

**Use ReentrancyGuard**:
```solidity
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract MyContract is ReentrancyGuard {
    function withdraw() external nonReentrant {
        // Safe external call
    }
}
```

### Checks-Effects-Interactions

**Order**:
1. **Checks**: Validate inputs
2. **Effects**: Update state
3. **Interactions**: External calls

**Example**:
```solidity
function releasePayment(...) {
    // 1. CHECKS
    require(amount > 0);
    require(canRelease);
    
    // 2. EFFECTS
    escrow.releasedAmount += amount;
    escrow.status = EscrowStatus.Released;
    
    // 3. INTERACTIONS
    payable(payee).transfer(amount);
}
```

### Access Control

**Use OpenZeppelin's Ownable**:
```solidity
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyContract is Ownable {
    function adminFunction() external onlyOwner {
        // Only owner can call
    }
}
```

### Safe Math

**Solidity 0.8+**:
- Automatic overflow protection
- No need for SafeMath library

**Example**:
```solidity
// Automatically reverts on overflow
uint256 total = a + b;
```

---

## Best Practices

1. ✅ Always validate inputs
2. ✅ Use modifiers for access control
3. ✅ Emit events for all state changes
4. ✅ Follow checks-effects-interactions
5. ✅ Use ReentrancyGuard for external calls
6. ✅ Store only essential data on-chain
7. ✅ Use IPFS for large metadata
8. ✅ Implement proper error messages
9. ✅ Test all edge cases
10. ✅ Document complex logic

---

## Next Steps

1. Review contract implementations
2. Understand the patterns used
3. Study the test files
4. Experiment with deployment
5. Build frontend integration

