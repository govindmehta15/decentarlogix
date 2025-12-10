# Solidity Concepts Used in DecentraLogix

This document explains the Solidity concepts and patterns used in the DecentraLogix smart contracts.

## Table of Contents

1. [Interfaces](#interfaces)
2. [Structs](#structs)
3. [Enums](#enums)
4. [Events](#events)
5. [Function Modifiers](#function-modifiers)
6. [Access Control](#access-control)
7. [State Variables](#state-variables)
8. [Gas Optimization](#gas-optimization)
9. [Security Patterns](#security-patterns)

---

## Interfaces

### What are Interfaces?

Interfaces define a contract's external API without implementation. They specify:
- Function signatures (name, parameters, return types)
- Events
- Structs and enums used in the interface

### Why Use Interfaces?

1. **Abstraction**: Hide implementation details
2. **Modularity**: Separate contract definitions from implementations
3. **Upgradeability**: Change implementation without changing interface
4. **Testing**: Mock contracts for testing
5. **Documentation**: Clear API specification

### Example from DecentraLogix

```solidity
interface ITripRegistry {
    function createTrip(...) external returns (uint256, uint256);
    function startTrip(uint256 tripId) external;
    // ...
}
```

**Key Points**:
- Functions are declared as `external` (can only be called from outside)
- No function body (implementation)
- Can define structs and enums used in the interface

### Interface Inheritance

Interfaces can inherit from other interfaces:

```solidity
interface ICarbonCredits {
    // Inherits ERC20 functions
    function totalSupply() external view returns (uint256);
    function balanceOf(address) external view returns (uint256);
    // ...
}
```

---

## Structs

### What are Structs?

Structs are custom data types that group related variables together.

### Why Use Structs?

1. **Organization**: Group related data
2. **Readability**: Clear data structure
3. **Efficiency**: Can pack multiple values in storage slots
4. **Type Safety**: Compiler enforces structure

### Example from DecentraLogix

```solidity
struct TripMetadata {
    uint256 tripId;
    address shipper;
    address carrier;
    address receiver;
    string originLocation;
    string destinationLocation;
    uint256 distance;
    uint256 estimatedCarbonFootprint;
    TripStatus status;
    uint256 createdAt;
    uint256 startedAt;
    uint256 completedAt;
    string ipfsMetadataHash;
}
```

### Struct Storage

- **Storage**: Stored in contract storage (persistent)
- **Memory**: Temporary, used in function parameters/returns
- **Calldata**: Read-only, used in external function parameters

### Gas Optimization with Structs

Solidity packs variables into 32-byte storage slots:

```solidity
struct Optimized {
    uint128 a;  // Slot 1 (first 16 bytes)
    uint128 b;  // Slot 1 (last 16 bytes)
    uint256 c;  // Slot 2 (full 32 bytes)
}
```

**Best Practice**: Order struct members by size to maximize packing.

---

## Enums

### What are Enums?

Enums create custom types with a fixed set of values.

### Why Use Enums?

1. **Type Safety**: Prevents invalid values
2. **Readability**: Clear state options
3. **Gas Efficient**: Stored as uint8 (smallest possible)
4. **Validation**: Compiler ensures only valid values

### Example from DecentraLogix

```solidity
enum TripStatus {
    Created,      // 0
    InTransit,    // 1
    Delivered,    // 2
    Cancelled,    // 3
    Disputed      // 4
}
```

### Enum Usage

```solidity
TripStatus status = TripStatus.Created;
if (status == TripStatus.InTransit) {
    // ...
}
```

### Enum Conversion

Enums can be converted to/from integers:

```solidity
uint8 statusValue = uint8(TripStatus.Delivered); // Returns 2
TripStatus status = TripStatus(statusValue);
```

---

## Events

### What are Events?

Events are logs emitted by contracts that external systems can listen to.

### Why Use Events?

1. **Off-chain Integration**: Backend can index events
2. **Gas Efficient**: Cheaper than storage
3. **Searchable**: Can filter by indexed parameters
4. **Immutability**: Events are permanent on blockchain
5. **Debugging**: Track contract execution

### Event Structure

```solidity
event TripCreated(
    uint256 indexed tripId,      // Indexed (searchable)
    uint256 indexed tokenId,     // Indexed (searchable)
    address indexed shipper,     // Indexed (searchable)
    address carrier              // Not indexed
);
```

### Indexed Parameters

- **Up to 3 indexed parameters** per event
- Indexed parameters are searchable in event logs
- Use indexed for values you'll filter by (IDs, addresses)

### Emitting Events

```solidity
emit TripCreated(tripId, tokenId, shipper, carrier);
```

### Listening to Events (Off-chain)

```javascript
// Using Ethers.js
contract.on("TripCreated", (tripId, tokenId, shipper, carrier) => {
    console.log("Trip created:", tripId);
});
```

### Gas Cost

Events are cheaper than storage:
- Storage: ~20,000 gas per write
- Event: ~375 gas per log + ~375 gas per indexed parameter

---

## Function Modifiers

### What are Modifiers?

Modifiers are reusable code that modify function behavior.

### Why Use Modifiers?

1. **DRY Principle**: Don't repeat code
2. **Security**: Centralize access control
3. **Readability**: Clear function intent
4. **Consistency**: Same checks across functions

### Common Modifiers

```solidity
modifier onlyOwner() {
    require(msg.sender == owner, "Not owner");
    _; // Continue function execution
}

modifier onlyWhenNotPaused() {
    require(!paused, "Contract paused");
    _;
}

modifier validTrip(uint256 tripId) {
    require(trips[tripId].tripId != 0, "Trip not found");
    _;
}
```

### Usage

```solidity
function cancelTrip(uint256 tripId) 
    external 
    onlyOwner 
    validTrip(tripId) 
{
    // Function body
}
```

### Modifier Execution Order

Modifiers execute in order:
1. `onlyOwner` checks
2. `validTrip` checks
3. Function body executes
4. Any code after `_;` in modifiers executes (reverse order)

---

## Access Control

### Why Access Control?

Smart contracts need to restrict who can call certain functions.

### Common Patterns

#### 1. Owner Pattern

```solidity
address public owner;

modifier onlyOwner() {
    require(msg.sender == owner, "Not owner");
    _;
}
```

#### 2. Role-Based Access Control (RBAC)

```solidity
mapping(address => bool) public authorized;

modifier onlyAuthorized() {
    require(authorized[msg.sender], "Not authorized");
    _;
}
```

#### 3. OpenZeppelin AccessControl

```solidity
import "@openzeppelin/contracts/access/AccessControl.sol";

contract MyContract is AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    
    constructor() {
        _grantRole(ADMIN_ROLE, msg.sender);
    }
}
```

### In DecentraLogix

- **Trip Creation**: Only authorized shippers
- **Trip Start/Complete**: Only assigned carrier
- **Payment Release**: Based on conditions or authorized roles
- **Carbon Credit Minting**: Only authorized contracts

---

## State Variables

### Types of State Variables

#### 1. Storage Variables

```solidity
uint256 public tripCount;              // Public (auto getter)
mapping(uint256 => TripMetadata) trips; // Private mapping
address private owner;                 // Private
```

#### 2. Constants

```solidity
uint256 public constant MAX_TRIPS = 1000;
address public constant TREASURY = 0x...;
```

#### 3. Immutable Variables

```solidity
address public immutable tripRegistry;
uint256 public immutable deploymentTime;

constructor(address _tripRegistry) {
    tripRegistry = _tripRegistry;
    deploymentTime = block.timestamp;
}
```

### Visibility

- **public**: Accessible from anywhere (auto getter function)
- **private**: Only within contract
- **internal**: Within contract and derived contracts
- **external**: Only from outside contract

### Storage Layout

State variables are stored sequentially:
- Slot 0: First variable
- Slot 1: Second variable
- Packing: Multiple small variables in one slot

---

## Gas Optimization

### Why Optimize Gas?

Every operation costs gas. Lower gas = lower transaction costs.

### Optimization Techniques

#### 1. Pack Structs

```solidity
// Bad: 3 storage slots
struct Bad {
    uint256 a;  // Slot 1
    uint256 b;  // Slot 2
    uint256 c;  // Slot 3
}

// Good: 2 storage slots
struct Good {
    uint128 a;  // Slot 1 (first half)
    uint128 b;  // Slot 1 (second half)
    uint256 c;  // Slot 2
}
```

#### 2. Use Events Instead of Storage

```solidity
// Expensive: 20,000 gas
mapping(address => uint256) public balances;

// Cheaper: ~1,500 gas
event BalanceUpdated(address indexed user, uint256 balance);
```

#### 3. Use Calldata for External Functions

```solidity
// Memory: Copies data (expensive)
function process(string memory data) external { }

// Calldata: Read-only reference (cheaper)
function process(string calldata data) external { }
```

#### 4. Cache Storage Reads

```solidity
// Bad: Multiple storage reads
if (trips[id].status == TripStatus.Created && 
    trips[id].shipper == msg.sender) { }

// Good: Cache storage read
TripMetadata memory trip = trips[id];
if (trip.status == TripStatus.Created && 
    trip.shipper == msg.sender) { }
```

#### 5. Use Unchecked for Safe Math

```solidity
// Safe but expensive
counter = counter + 1;

// Unsafe but cheaper (if you know it won't overflow)
unchecked {
    counter = counter + 1;
}
```

---

## Security Patterns

### 1. Checks-Effects-Interactions

Always follow this order:

```solidity
function releasePayment(uint256 escrowId) external {
    // 1. CHECKS
    require(escrow.status == EscrowStatus.Pending, "Invalid status");
    require(canRelease(escrowId), "Conditions not met");
    
    // 2. EFFECTS (update state first)
    escrow.status = EscrowStatus.Released;
    escrow.releasedAt = block.timestamp;
    
    // 3. INTERACTIONS (external calls last)
    payable(escrow.payee).transfer(escrow.amount);
    
    emit PaymentReleased(escrowId, escrow.amount, escrow.payee);
}
```

### 2. Reentrancy Protection

```solidity
bool private locked;

modifier nonReentrant() {
    require(!locked, "Reentrant call");
    locked = true;
    _;
    locked = false;
}
```

### 3. Input Validation

```solidity
function createTrip(address carrier, ...) external {
    require(carrier != address(0), "Invalid carrier");
    require(carrier != msg.sender, "Cannot be own carrier");
    require(distance > 0, "Invalid distance");
    // ...
}
```

### 4. Safe Math (Solidity 0.8+)

Solidity 0.8+ has built-in overflow protection:

```solidity
// Automatically reverts on overflow
uint256 total = a + b;
```

### 5. Access Control

Always check permissions:

```solidity
modifier onlyCarrier(uint256 tripId) {
    require(
        trips[tripId].carrier == msg.sender,
        "Not authorized carrier"
    );
    _;
}
```

---

## Common Patterns in DecentraLogix

### 1. NFT-Based Trip Registry

- Each trip is an NFT (ERC721)
- NFT ownership represents trip ownership
- Metadata stored on-chain and IPFS

### 2. Conditional Payment Escrow

- Funds locked until conditions met
- Automatic release on completion
- Refund capability

### 3. Reward Token System

- ERC20 token for rewards
- Mint on achievement
- Claimable rewards

### 4. Event-Driven Architecture

- Contracts emit events
- Backend indexes events
- Frontend listens to events

---

## Best Practices Summary

1. ✅ Use interfaces for modularity
2. ✅ Pack structs for gas efficiency
3. ✅ Use enums for state management
4. ✅ Emit events for off-chain integration
5. ✅ Implement access control
6. ✅ Follow checks-effects-interactions
7. ✅ Validate all inputs
8. ✅ Use modifiers for reusable checks
9. ✅ Optimize gas where possible
10. ✅ Document with NatSpec comments

---

## Resources

- [Solidity Documentation](https://docs.soliditylang.org/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [Consensys Best Practices](https://consensys.github.io/smart-contract-best-practices/)
- [Ethereum Smart Contract Security](https://ethereum.org/en/developers/docs/smart-contracts/security/)

---

## Next Steps

Now that you understand the concepts, you're ready to:
1. Review the contract interfaces
2. Understand the data structures
3. See how events are used
4. Prepare for implementation in Phase 3

