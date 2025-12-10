# Core Contracts Documentation

## TripRegistry.sol

### Overview
NFT-based trip token registry. Each trip is represented as a unique ERC721 NFT token.

### Key Functions

#### `createTrip()`
Creates a new trip and mints an NFT to the shipper.

**Parameters:**
- `carrier`: Address of the transport provider
- `receiver`: Address of the destination receiver
- `originLocation`: Origin location (string or IPFS hash)
- `destinationLocation`: Destination location (string or IPFS hash)
- `distance`: Distance in kilometers
- `estimatedCarbonFootprint`: Estimated carbon footprint in kg CO2
- `ipfsMetadataHash`: IPFS hash for additional metadata

**Returns:**
- `tripId`: Unique trip identifier
- `tokenId`: NFT token ID

**Events:**
- `TripCreated(tripId, tokenId, shipper, carrier)`

**Access Control:**
- Anyone can create a trip (must be shipper)

**Error Handling:**
- Reverts if carrier address is zero
- Reverts if carrier is same as shipper
- Reverts if distance is zero
- Reverts if carbon footprint is zero

---

#### `startTrip()`
Marks a trip as in transit. Can only be called by the assigned carrier.

**Parameters:**
- `tripId`: Unique trip identifier

**Events:**
- `TripStatusUpdated(tripId, oldStatus, newStatus)`
- `TripStarted(tripId, startedAt)`

**Access Control:**
- Only the assigned carrier

**Error Handling:**
- Reverts if trip doesn't exist
- Reverts if caller is not the carrier
- Reverts if trip is not in Created status

---

#### `completeTrip()`
Marks a trip as delivered. Can only be called by the assigned carrier.

**Parameters:**
- `tripId`: Unique trip identifier
- `actualCarbonFootprint`: Actual carbon footprint recorded
- `ipfsProofHash`: IPFS hash for delivery proof

**Events:**
- `TripStatusUpdated(tripId, oldStatus, newStatus)`
- `TripCompleted(tripId, completedAt, actualCarbonFootprint)`

**Access Control:**
- Only the assigned carrier

**Error Handling:**
- Reverts if trip doesn't exist
- Reverts if caller is not the carrier
- Reverts if trip is not in InTransit status

---

#### `cancelTrip()`
Cancels a trip. Can be called by shipper or carrier.

**Parameters:**
- `tripId`: Unique trip identifier
- `reason`: Reason for cancellation

**Events:**
- `TripStatusUpdated(tripId, oldStatus, newStatus)`
- `TripMetadataUpdated(tripId, field, newValue)`

**Access Control:**
- Shipper or carrier

**Error Handling:**
- Reverts if trip doesn't exist
- Reverts if caller is not shipper or carrier
- Reverts if trip is already delivered or cancelled

---

#### `updateTripStatus()`
Updates trip status (admin function).

**Parameters:**
- `tripId`: Unique trip identifier
- `newStatus`: New status to set

**Access Control:**
- Only contract owner

---

#### View Functions

- `getTripMetadata(tripId)`: Returns complete trip metadata
- `getTripIdByToken(tokenId)`: Returns trip ID for a given NFT token ID
- `getTokenIdByTrip(tripId)`: Returns NFT token ID for a given trip ID
- `isAuthorizedForTrip(tripId, account)`: Checks if address is authorized
- `getTotalTrips()`: Returns total number of trips created

---

## PaymentEscrow.sol

### Overview
Conditional payment escrow system. Holds payments until conditions are met.

### Key Functions

#### `createEscrow()`
Creates an escrow for a trip and locks payment.

**Parameters:**
- `tripId`: Associated trip ID
- `payee`: Address receiving payment (carrier)
- `conditions`: Payment release conditions struct

**Returns:**
- `escrowId`: Unique escrow identifier

**Events:**
- `EscrowCreated(escrowId, tripId, payer, payee, amount)`

**Access Control:**
- Anyone (must send payment)

**Error Handling:**
- Reverts if no payment sent
- Reverts if payee address is zero
- Reverts if escrow already exists for trip
- Reverts if trip doesn't exist
- Reverts if percentage sum exceeds 100

---

#### `depositToEscrow()`
Deposits additional funds to existing escrow.

**Parameters:**
- `escrowId`: Unique escrow identifier

**Events:**
- `PaymentDeposited(escrowId, amount, totalAmount)`

**Access Control:**
- Only payer

---

#### `releasePayment()`
Releases payment when conditions are met (mock implementation).

**Parameters:**
- `escrowId`: Unique escrow identifier
- `amount`: Amount to release
- `reason`: Reason for release

**Events:**
- `PaymentReleased(escrowId, amount, recipient, reason)`
- `EscrowStatusUpdated(escrowId, oldStatus, newStatus)`

**Access Control:**
- Owner or payer

**Error Handling:**
- Reverts if escrow doesn't exist
- Reverts if amount is zero
- Reverts if insufficient balance
- Reverts if escrow not in valid status

---

#### `releaseOnTripCompletion()`
Automatically releases payment when trip completes.

**Parameters:**
- `escrowId`: Unique escrow identifier
- `tripId`: Associated trip ID (for verification)

**Events:**
- `PaymentReleased(escrowId, amount, recipient, reason)`
- `EscrowStatusUpdated(escrowId, oldStatus, newStatus)`

**Access Control:**
- Anyone (verifies trip completion)

**Error Handling:**
- Reverts if escrow doesn't exist
- Reverts if trip ID mismatch
- Reverts if trip not completed

---

#### `completeMilestone()`
Completes milestone and releases partial payment (mock implementation).

**Parameters:**
- `escrowId`: Unique escrow identifier
- `milestoneId`: Milestone identifier
- `proof`: IPFS hash for milestone proof

**Events:**
- `MilestoneCompleted(escrowId, milestoneId, amount)`
- `PaymentReleased(escrowId, amount, recipient, reason)`

---

#### `refundPayment()`
Refunds payment to payer.

**Parameters:**
- `escrowId`: Unique escrow identifier
- `reason`: Reason for refund

**Events:**
- `PaymentRefunded(escrowId, amount, reason)`
- `EscrowStatusUpdated(escrowId, oldStatus, newStatus)`

**Access Control:**
- Only contract owner

---

#### View Functions

- `getEscrow(escrowId)`: Returns escrow details
- `getEscrowByTrip(tripId)`: Returns escrow ID for a trip
- `canReleasePayment(escrowId)`: Checks if payment can be released
- `getEscrowBalance(escrowId)`: Returns available balance
- `getTotalEscrows()`: Returns total number of escrows

---

## CarbonCredits.sol

### Overview
ERC20 token for carbon credit rewards. Rewards users for sustainable logistics practices.

### Key Functions

#### `mintReward()`
Mints carbon credits as reward for trip completion.

**Parameters:**
- `recipient`: Address to receive the reward
- `tripId`: Associated trip ID
- `carbonOffset`: Amount of carbon offset (kg CO2)
- `rewardType`: Type of reward (enum)

**Returns:**
- `rewardId`: Unique reward identifier
- `amount`: Amount of carbon credits minted

**Events:**
- `CarbonCreditsMinted(rewardId, recipient, tripId, amount, carbonOffset, rewardType)`
- `CarbonCreditsClaimed(rewardId, recipient, amount)`

**Access Control:**
- Only authorized minter (owner)

**Error Handling:**
- Reverts if recipient is zero address
- Reverts if carbon offset is zero
- Reverts if calculated reward is zero

---

#### `claimReward()`
Claims pending carbon credit rewards (simplified - rewards auto-claimed in MVP).

**Parameters:**
- `rewardId`: Unique reward identifier

**Events:**
- `CarbonCreditsClaimed(rewardId, recipient, amount)`

**Access Control:**
- Reward recipient

---

#### `claimAllRewards()`
Claims all pending rewards for a user.

**Parameters:**
- `recipient`: Address to claim rewards for

**Returns:**
- `totalAmount`: Total amount of credits claimed

**Access Control:**
- Recipient or owner

---

#### `burnCredits()`
Burns carbon credits (for offsetting).

**Parameters:**
- `amount`: Amount of credits to burn
- `reason`: Reason for burning

**Events:**
- `CarbonCreditsBurned(account, amount, reason)`

**Access Control:**
- Token holder

**Error Handling:**
- Reverts if amount is zero
- Reverts if insufficient balance

---

#### `calculateReward()`
Calculates carbon credit reward amount based on offset and type.

**Parameters:**
- `carbonOffset`: Amount of carbon offset (kg CO2)
- `rewardType`: Type of reward

**Returns:**
- `amount`: Amount of carbon credits to reward

**Formula:**
- Base: `carbonOffset * baseMultiplier`
- Bonus: `base * bonusPercentage / 100`
- Total: `base + bonus`

---

#### View Functions

- `getReward(rewardId)`: Returns reward details
- `getUserRewards(recipient)`: Returns array of reward IDs for user
- `getPendingRewards(recipient)`: Returns total pending credits
- `getTotalCarbonOffset(account)`: Returns total carbon offset
- `getRewardParameters()`: Returns current reward parameters

---

#### `updateRewardParameters()`
Updates reward calculation parameters (admin function).

**Parameters:**
- `parameters`: New reward parameters struct

**Access Control:**
- Only contract owner

**Events:**
- `RewardParametersUpdated(baseMultiplier, lowCarbonBonus, carbonNeutralBonus)`

---

## Common Patterns

### Access Control
- Uses OpenZeppelin's `Ownable` for owner-only functions
- Custom modifiers for role-based access (carrier, payer, etc.)

### Reentrancy Protection
- Uses `ReentrancyGuard` for functions that transfer funds
- Follows checks-effects-interactions pattern

### Error Handling
- Comprehensive input validation
- Clear error messages
- Reverts on invalid operations

### Events
- All state changes emit events
- Indexed parameters for efficient filtering
- Detailed event data for off-chain indexing

