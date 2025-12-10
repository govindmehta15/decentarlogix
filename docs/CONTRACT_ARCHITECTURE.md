# Smart Contract Architecture

## Overview

DecentraLogix smart contracts are designed as a modular system with three core components:

1. **TripRegistry**: NFT-based trip token registry
2. **PaymentEscrow**: Conditional payment escrow system
3. **CarbonCredits**: Reward token for sustainable practices

## Contract Interfaces

### 1. TripRegistry (ITripRegistry.sol)

**Purpose**: Manages trips as NFTs (ERC721), tracking logistics operations on-chain.

**Key Features**:
- Each trip is minted as a unique NFT
- Tracks trip lifecycle (Created → InTransit → Delivered)
- Stores location, distance, and carbon footprint data
- Links to IPFS for additional metadata

**Core Functions**:
- `createTrip()`: Create new trip and mint NFT
- `startTrip()`: Mark trip as in transit
- `completeTrip()`: Mark trip as delivered
- `cancelTrip()`: Cancel a trip
- `getTripMetadata()`: Retrieve trip information

**Data Structures**:
- `TripMetadata`: Complete trip information
- `TripStatus`: Enumeration of trip states

### 2. PaymentEscrow (IPaymentEscrow.sol)

**Purpose**: Handles conditional payments tied to trip completion and milestones.

**Key Features**:
- Holds payments in escrow until conditions are met
- Supports milestone-based partial payments
- Automatic release on trip completion
- Refund capability

**Core Functions**:
- `createEscrow()`: Create escrow for a trip
- `depositToEscrow()`: Add funds to escrow
- `releasePayment()`: Release payment when conditions met
- `releaseOnTripCompletion()`: Auto-release on completion
- `completeMilestone()`: Complete milestone and release partial payment
- `refundPayment()`: Refund to payer

**Data Structures**:
- `EscrowPayment`: Payment escrow details
- `PaymentConditions`: Conditions for payment release
- `Milestone`: Milestone structure for partial payments

### 3. CarbonCredits (ICarbonCredits.sol)

**Purpose**: ERC20 token that rewards users for sustainable logistics practices.

**Key Features**:
- Mint credits based on carbon offset
- Different reward types (trip completion, low carbon, etc.)
- Claimable rewards system
- Burn mechanism for offsetting

**Core Functions**:
- `mintReward()`: Mint credits as reward
- `claimReward()`: Claim pending rewards
- `burnCredits()`: Burn credits for offsetting
- `calculateReward()`: Calculate reward amount
- `getTotalCarbonOffset()`: Get user's total offset

**Data Structures**:
- `CarbonReward`: Reward information
- `RewardType`: Types of rewards
- `RewardParameters`: Calculation parameters

## Contract Relationships

```
┌─────────────────────────────────────────────────────────────┐
│                    LogisticsCore                            │
│              (Orchestrates all contracts)                   │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│TripRegistry  │   │PaymentEscrow │   │CarbonCredits │
│  (ERC721)    │   │   (Escrow)   │   │   (ERC20)    │
└──────────────┘   └──────────────┘   └──────────────┘
        │                   │                   │
        │                   │                   │
        └───────────────────┴───────────────────┘
                            │
                    ┌───────┴───────┐
                    │   IPFS        │
                    │  (Metadata)   │
                    └───────────────┘
```

## Data Flow: Complete Trip Lifecycle

### 1. Trip Creation
```
User → LogisticsCore.createCompleteTrip()
  ├─→ TripRegistry.createTrip() → Mint NFT
  ├─→ PaymentEscrow.createEscrow() → Lock payment
  └─→ Events emitted
```

### 2. Trip Execution
```
Carrier → TripRegistry.startTrip()
  └─→ Status: Created → InTransit
```

### 3. Milestone Payments (Optional)
```
Carrier → PaymentEscrow.completeMilestone()
  └─→ Partial payment released
```

### 4. Trip Completion
```
Carrier → LogisticsCore.completeTripWithRewards()
  ├─→ TripRegistry.completeTrip() → Status: Delivered
  ├─→ PaymentEscrow.releaseOnTripCompletion() → Full payment released
  └─→ CarbonCredits.mintReward() → Credits minted
```

## Event Flow

### Trip Creation Events
1. `TripCreated` (TripRegistry)
2. `EscrowCreated` (PaymentEscrow)
3. `CompleteTripCreated` (LogisticsCore)

### Trip Completion Events
1. `TripCompleted` (TripRegistry)
2. `PaymentReleased` (PaymentEscrow)
3. `CarbonCreditsMinted` (CarbonCredits)
4. `TripCompletionProcessed` (LogisticsCore)

## Security Considerations

### Access Control
- Trip creation: Only authorized shippers
- Trip start/complete: Only assigned carrier
- Payment release: Based on conditions or authorized roles
- Carbon credit minting: Only authorized contracts

### Validation
- Trip IDs must exist before escrow creation
- Escrow amounts must match payment conditions
- Carbon offset calculations must be verified
- Status transitions must follow valid paths

### Reentrancy Protection
- Use checks-effects-interactions pattern
- Implement reentrancy guards where needed

## Integration Points

### With Backend
- Backend listens to all contract events
- Backend indexes trip, payment, and reward data
- Backend provides aggregated API endpoints

### With Frontend
- Frontend connects wallet to interact with contracts
- Frontend reads contract state directly
- Frontend calls backend API for aggregated data

### With IPFS
- Trip metadata stored on IPFS
- Delivery proofs stored on IPFS
- IPFS hashes stored on-chain for verification

## Gas Optimization Considerations

1. **Batch Operations**: Group multiple operations when possible
2. **Event Optimization**: Emit only necessary data
3. **Storage Optimization**: Use packed structs where possible
4. **External Calls**: Minimize external contract calls
5. **Loop Optimization**: Avoid unbounded loops

## Upgradeability Strategy

Contracts can be designed as:
- **Immutable**: Most secure, no upgrades
- **Proxy Pattern**: Upgradeable using OpenZeppelin upgrades
- **Modular**: Separate contracts for different concerns

For Phase 2, we define interfaces only. Implementation will decide upgradeability approach.

