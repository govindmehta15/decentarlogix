# Smart Contract UML Diagram

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         DecentraLogix System                            │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
            ┌───────▼────────┐              ┌───────▼────────┐
            │  Frontend      │              │    Backend     │
            │  (React)       │              │   (Express)    │
            └───────┬────────┘              └───────┬────────┘
                    │                               │
                    │  Direct Contract Calls        │  Event Listening
                    │  (Ethers.js)                  │  (Ethers.js)
                    │                               │
                    └───────────────┬───────────────┘
                                    │
                    ┌───────────────▼───────────────┐
                    │      Blockchain Layer          │
                    │      (Ethereum/Testnet)        │
                    └───────────────┬───────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        │                           │                           │
┌───────▼────────┐         ┌────────▼────────┐       ┌────────▼────────┐
│ TripRegistry   │         │ PaymentEscrow    │       │ CarbonCredits   │
│                │         │                  │       │                  │
│ +createTrip()  │         │ +createEscrow()  │       │ +mintReward()    │
│ +startTrip()   │         │ +releasePayment()│       │ +claimReward()   │
│ +completeTrip()│         │ +refundPayment() │       │ +burnCredits()   │
│ +cancelTrip()  │         │ +completeMilestone()│    │ +calculateReward()│
│                │         │                  │       │                  │
│ Events:        │         │ Events:          │       │ Events:          │
│ -TripCreated   │         │ -EscrowCreated   │       │ -CreditsMinted   │
│ -TripStarted   │         │ -PaymentReleased │       │ -CreditsClaimed  │
│ -TripCompleted │         │ -PaymentRefunded │       │ -CreditsBurned   │
└────────────────┘         └──────────────────┘       └──────────────────┘
        │                           │                           │
        └───────────────────────────┼───────────────────────────┘
                                    │
                    ┌───────────────▼───────────────┐
                    │      IPFS Network             │
                    │  (Decentralized Storage)      │
                    │                               │
                    │  - Trip Metadata              │
                    │  - Delivery Proofs             │
                    │  - Documents                   │
                    └───────────────────────────────┘
```

## Contract Class Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        ITripRegistry                             │
├─────────────────────────────────────────────────────────────────┤
│ +TripMetadata struct                                             │
│   - tripId: uint256                                              │
│   - shipper: address                                             │
│   - carrier: address                                             │
│   - receiver: address                                            │
│   - originLocation: string                                       │
│   - destinationLocation: string                                  │
│   - distance: uint256                                            │
│   - estimatedCarbonFootprint: uint256                            │
│   - status: TripStatus                                           │
│   - createdAt: uint256                                           │
│   - startedAt: uint256                                           │
│   - completedAt: uint256                                          │
│   - ipfsMetadataHash: string                                     │
│                                                                   │
│ +TripStatus enum                                                 │
│   - Created                                                      │
│   - InTransit                                                    │
│   - Delivered                                                    │
│   - Cancelled                                                    │
│   - Disputed                                                     │
│                                                                   │
│ +createTrip(...): (uint256, uint256)                            │
│ +startTrip(uint256): void                                        │
│ +completeTrip(uint256, uint256, string): void                   │
│ +cancelTrip(uint256, string): void                              │
│ +getTripMetadata(uint256): TripMetadata                         │
│                                                                   │
│ Events:                                                          │
│ +TripCreated(uint256, uint256, address, address)                │
│ +TripStatusUpdated(uint256, TripStatus, TripStatus)              │
│ +TripStarted(uint256, uint256)                                   │
│ +TripCompleted(uint256, uint256, uint256)                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        IPaymentEscrow                            │
├─────────────────────────────────────────────────────────────────┤
│ +EscrowPayment struct                                            │
│   - escrowId: uint256                                            │
│   - tripId: uint256                                              │
│   - payer: address                                               │
│   - payee: address                                               │
│   - amount: uint256                                              │
│   - releasedAmount: uint256                                      │
│   - status: EscrowStatus                                         │
│   - createdAt: uint256                                           │
│   - releasedAt: uint256                                          │
│   - conditions: PaymentConditions                                │
│                                                                   │
│ +PaymentConditions struct                                        │
│   - requiresTripCompletion: bool                                 │
│   - requiresDeliveryProof: bool                                  │
│   - requiresReceiverConfirmation: bool                           │
│   - milestonePercentage: uint8                                   │
│   - completionPercentage: uint8                                   │
│                                                                   │
│ +EscrowStatus enum                                               │
│   - Pending                                                      │
│   - PartiallyReleased                                            │
│   - Released                                                     │
│   - Refunded                                                     │
│   - Disputed                                                     │
│                                                                   │
│ +createEscrow(...): uint256                                      │
│ +depositToEscrow(uint256): void                                 │
│ +releasePayment(uint256, uint256, string): void                 │
│ +releaseOnTripCompletion(uint256, uint256): void                │
│ +completeMilestone(uint256, uint256, string): void              │
│ +refundPayment(uint256, string): void                           │
│ +getEscrow(uint256): EscrowPayment                              │
│                                                                   │
│ Events:                                                          │
│ +EscrowCreated(uint256, uint256, address, address, uint256)    │
│ +PaymentDeposited(uint256, uint256, uint256)                    │
│ +PaymentReleased(uint256, uint256, address, string)             │
│ +MilestoneCompleted(uint256, uint256, uint256)                  │
│ +PaymentRefunded(uint256, uint256, string)                      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        ICarbonCredits                            │
├─────────────────────────────────────────────────────────────────┤
│ +CarbonReward struct                                             │
│   - rewardId: uint256                                            │
│   - recipient: address                                           │
│   - tripId: uint256                                              │
│   - amount: uint256                                              │
│   - carbonOffset: uint256                                        │
│   - rewardType: RewardType                                       │
│   - createdAt: uint256                                           │
│   - claimedAt: uint256                                           │
│                                                                   │
│ +RewardType enum                                                 │
│   - TripCompletion                                               │
│   - LowCarbonFootprint                                           │
│   - CarbonNeutral                                                │
│   - BatchOptimization                                            │
│   - SustainableMode                                              │
│                                                                   │
│ +RewardParameters struct                                         │
│   - baseMultiplier: uint256                                      │
│   - lowCarbonBonus: uint256                                      │
│   - carbonNeutralBonus: uint256                                  │
│   - batchOptimizationBonus: uint256                              │
│                                                                   │
│ +mintReward(...): (uint256, uint256)                            │
│ +claimReward(uint256): void                                      │
│ +claimAllRewards(address): uint256                               │
│ +burnCredits(uint256, string): void                             │
│ +calculateReward(uint256, RewardType): uint256                  │
│ +getReward(uint256): CarbonReward                                │
│ +getUserRewards(address): uint256[]                              │
│ +getPendingRewards(address): uint256                             │
│ +getTotalCarbonOffset(address): uint256                          │
│                                                                   │
│ Events:                                                          │
│ +CarbonCreditsMinted(uint256, address, uint256, uint256, ...)   │
│ +CarbonCreditsClaimed(uint256, address, uint256)                │
│ +CarbonCreditsBurned(address, uint256, string)                  │
│ +RewardParametersUpdated(...)                                    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        ILogisticsCore                            │
├─────────────────────────────────────────────────────────────────┤
│ (Orchestrates all contracts)                                     │
│                                                                   │
│ +createCompleteTrip(...): (uint256, uint256)                     │
│ +completeTripWithRewards(...): void                              │
│ +getContractAddresses(): (address, address, address)             │
│                                                                   │
│ Events:                                                          │
│ +CompleteTripCreated(uint256, uint256, address, address)         │
│ +TripCompletionProcessed(uint256, uint256, uint256)              │
│                                                                   │
│ Uses:                                                            │
│ - ITripRegistry                                                  │
│ - IPaymentEscrow                                                 │
│ - ICarbonCredits                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Sequence Diagram: Complete Trip Flow

```
Shipper          Carrier          TripRegistry    PaymentEscrow    CarbonCredits
  │                 │                    │               │                │
  │──createTrip()──>│                    │               │                │
  │                 │                    │               │                │
  │                 │<───Mint NFT────────│               │                │
  │                 │                    │               │                │
  │──createEscrow()─┼────────────────────>│               │                │
  │                 │                    │               │                │
  │                 │                    │<──Lock Funds──│                │
  │                 │                    │               │                │
  │                 │                    │               │                │
  │                 │──startTrip()──────>│               │                │
  │                 │                    │               │                │
  │                 │                    │ Status:       │                │
  │                 │                    │ InTransit     │                │
  │                 │                    │               │                │
  │                 │                    │               │                │
  │                 │──completeTrip()───>│               │                │
  │                 │                    │               │                │
  │                 │                    │ Status:        │                │
  │                 │                    │ Delivered      │                │
  │                 │                    │               │                │
  │                 │                    │──release()────>│                │
  │                 │                    │               │                │
  │                 │                    │               │──mintReward()──>│
  │                 │                    │               │                │
  │                 │                    │               │                │
  │<──Events────────┼────────────────────┼───────────────┼───────────────>│
```

## State Machine: Trip Lifecycle

```
                    ┌─────────┐
                    │ Created │
                    └────┬────┘
                         │
                         │ startTrip()
                         ▼
                 ┌──────────────┐
                 │  InTransit   │
                 └──────┬───────┘
                        │
                        │ completeTrip()
                        ▼
                 ┌──────────────┐
                 │  Delivered    │
                 └──────────────┘
                        │
                        │ (if cancelled)
                        ▼
                 ┌──────────────┐
                 │  Cancelled    │
                 └──────────────┘
                        │
                        │ (if dispute)
                        ▼
                 ┌──────────────┐
                 │   Disputed    │
                 └──────────────┘
```

## State Machine: Escrow Lifecycle

```
                    ┌─────────┐
                    │ Pending │
                    └────┬────┘
                         │
                         │ milestone completed
                         ▼
            ┌────────────────────────┐
            │ PartiallyReleased     │
            └───────────┬───────────┘
                        │
                        │ trip completed
                        ▼
                 ┌──────────────┐
                 │   Released    │
                 └──────────────┘
                        │
                        │ (if refund)
                        ▼
                 ┌──────────────┐
                 │   Refunded    │
                 └──────────────┘
                        │
                        │ (if dispute)
                        ▼
                 ┌──────────────┐
                 │   Disputed    │
                 └──────────────┘
```

## Data Flow Diagram

```
┌──────────────┐
│   User       │
│  (Shipper)   │
└──────┬───────┘
       │
       │ 1. Create Trip + Escrow
       ▼
┌─────────────────────────────────────┐
│      LogisticsCore                  │
│  createCompleteTrip()               │
└──────┬──────────────────────────────┘
       │
       ├──────────────────┬──────────────────┐
       │                  │                  │
       ▼                  ▼                  ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│TripRegistry │  │PaymentEscrow│  │CarbonCredits│
│             │  │             │  │             │
│ Mint NFT    │  │ Lock Funds  │  │ (Pending)   │
└──────┬──────┘  └──────┬──────┘  └─────────────┘
       │                │
       │                │
       │ 2. Trip Events │
       │                │
       ▼                ▼
┌─────────────────────────────────────┐
│         Backend                     │
│  (Event Indexer)                    │
│  - Index trip data                  │
│  - Index payment data               │
│  - Store in database                │
└──────┬──────────────────────────────┘
       │
       │ 3. API Endpoints
       ▼
┌──────────────┐
│   Frontend   │
│  (React)     │
│  - Display  │
│  - Query    │
└──────────────┘
```

