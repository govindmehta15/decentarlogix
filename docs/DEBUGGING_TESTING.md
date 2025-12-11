# Debugging and Testing Smart Contracts

Comprehensive guide to debugging and testing Ethereum smart contracts.

## Table of Contents

1. [Introduction](#introduction)
2. [Testing Strategies](#testing-strategies)
3. [Debugging Tools](#debugging-tools)
4. [Common Issues](#common-issues)
5. [Best Practices](#best-practices)
6. [Testing Patterns](#testing-patterns)
7. [Integration Testing](#integration-testing)
8. [Gas Optimization Testing](#gas-optimization-testing)

---

## Introduction

### Why Test Smart Contracts?

Smart contracts are **immutable** once deployed. Bugs can be:
- **Expensive**: Lost funds, locked contracts
- **Permanent**: Can't be fixed without redeployment
- **Public**: All code is visible on blockchain

**Testing is critical** before deployment!

### Testing Pyramid

```
        /\
       /  \     E2E Tests (Few)
      /____\
     /      \   Integration Tests (Some)
    /________\
   /          \  Unit Tests (Many)
  /____________\
```

---

## Testing Strategies

### 1. Unit Tests

Test individual functions in isolation.

```javascript
describe("TripRegistry", function () {
  it("Should create a trip", async function () {
    const tx = await tripRegistry.createTrip(...);
    await expect(tx).to.emit(tripRegistry, "TripCreated");
  });
});
```

**What to Test:**
- Function logic
- Input validation
- State changes
- Event emissions
- Revert conditions

### 2. Integration Tests

Test interactions between contracts.

```javascript
describe("Integration", function () {
  it("Should complete full trip lifecycle", async function () {
    // Create trip
    // Create escrow
    // Start trip
    // Complete trip
    // Release payment
    // Mint carbon credits
  });
});
```

**What to Test:**
- Contract interactions
- Cross-contract calls
- Event flow
- State synchronization

### 3. End-to-End Tests

Test complete user flows.

```javascript
describe("E2E", function () {
  it("Should handle complete logistics flow", async function () {
    // Simulate real user actions
    // Test with multiple accounts
    // Verify final state
  });
});
```

---

## Debugging Tools

### 1. Hardhat Console

Interactive debugging in Hardhat environment.

```bash
npx hardhat console
```

```javascript
const TripRegistry = await ethers.getContractFactory("TripRegistry");
const trip = await TripRegistry.deploy();
await trip.deployed();

// Test functions
await trip.createTrip(...);
const metadata = await trip.getTripMetadata(1);
console.log(metadata);
```

### 2. Hardhat Network

Local blockchain for testing.

```bash
npx hardhat node
```

**Features:**
- Fast block times
- Free ETH for testing
- Full debugging capabilities
- Event logging

### 3. Hardhat Trace

Trace transaction execution.

```bash
npx hardhat run scripts/deploy.js --trace
```

Shows:
- Function calls
- State changes
- Gas usage
- Revert reasons

### 4. Tenderly

Advanced debugging platform.

**Features:**
- Transaction simulation
- State inspection
- Gas profiling
- Error analysis

### 5. Remix IDE

Online Solidity IDE with debugging.

**Features:**
- Step-by-step debugging
- Variable inspection
- Call stack
- Gas meter

---

## Common Issues

### 1. Revert Without Reason

**Problem:**
```solidity
require(condition); // No error message
```

**Solution:**
```solidity
require(condition, "Clear error message");
```

**Debug:**
```javascript
try {
  await contract.function();
} catch (error) {
  console.error("Revert reason:", error.reason);
  console.error("Error code:", error.code);
}
```

### 2. Out of Gas

**Problem:**
Transaction fails with "out of gas"

**Solutions:**
- Optimize loops
- Reduce storage writes
- Use events instead of storage
- Batch operations

**Debug:**
```javascript
const gasEstimate = await contract.function.estimateGas(...);
console.log("Gas estimate:", gasEstimate.toString());
```

### 3. Integer Overflow/Underflow

**Problem:**
Solidity 0.8+ has built-in overflow protection, but older versions need SafeMath.

**Solution:**
```solidity
// Solidity 0.8+ automatically reverts on overflow
uint256 result = a + b; // Safe

// Older versions
using SafeMath for uint256;
uint256 result = a.add(b); // Safe
```

### 4. Reentrancy Attacks

**Problem:**
External calls before state updates.

**Solution:**
```solidity
// ❌ Vulnerable
function withdraw() external {
    uint256 amount = balances[msg.sender];
    balances[msg.sender] = 0;
    payable(msg.sender).transfer(amount); // External call before state update
}

// ✅ Safe
function withdraw() external nonReentrant {
    uint256 amount = balances[msg.sender];
    balances[msg.sender] = 0; // Update state first
    payable(msg.sender).transfer(amount); // External call last
}
```

### 5. Access Control Issues

**Problem:**
Missing access control checks.

**Solution:**
```solidity
modifier onlyOwner() {
    require(msg.sender == owner, "Not owner");
    _;
}

function adminFunction() external onlyOwner {
    // Only owner can call
}
```

---

## Best Practices

### 1. Test Coverage

Aim for **100% coverage** of:
- All functions
- All branches (if/else)
- All error cases
- Edge cases

```bash
npx hardhat coverage
```

### 2. Test Organization

```javascript
describe("ContractName", function () {
  describe("FunctionName", function () {
    it("Should do something", async function () {});
    it("Should revert when...", async function () {});
    it("Should emit event", async function () {});
  });
});
```

### 3. Use Fixtures

```javascript
async function deployContracts() {
  const [owner, user1, user2] = await ethers.getSigners();
  const Contract = await ethers.getContractFactory("MyContract");
  const contract = await Contract.deploy();
  return { contract, owner, user1, user2 };
}

describe("Tests", function () {
  it("Should work", async function () {
    const { contract, owner } = await loadFixture(deployContracts);
    // Use contract and owner
  });
});
```

### 4. Test Events

```javascript
await expect(tx)
  .to.emit(contract, "EventName")
  .withArgs(arg1, arg2, ...);
```

### 5. Test Reverts

```javascript
await expect(
  contract.function()
).to.be.revertedWith("Error message");
```

### 6. Test State Changes

```javascript
const before = await contract.getValue();
await contract.setValue(100);
const after = await contract.getValue();
expect(after).to.equal(100);
expect(after).to.not.equal(before);
```

---

## Testing Patterns

### Pattern 1: Arrange-Act-Assert

```javascript
it("Should create trip", async function () {
  // Arrange
  const carrier = accounts[1].address;
  const receiver = accounts[2].address;
  
  // Act
  const tx = await tripRegistry.createTrip(...);
  const receipt = await tx.wait();
  
  // Assert
  expect(receipt.status).to.equal(1);
  await expect(tx).to.emit(tripRegistry, "TripCreated");
});
```

### Pattern 2: Test Edge Cases

```javascript
describe("Edge Cases", function () {
  it("Should handle zero distance", async function () {
    await expect(
      tripRegistry.createTrip(..., 0, ...)
    ).to.be.revertedWith("Distance must be greater than 0");
  });

  it("Should handle maximum uint256", async function () {
    const maxUint = ethers.MaxUint256;
    // Test with maximum value
  });
});
```

### Pattern 3: Test Access Control

```javascript
it("Should only allow owner", async function () {
  await expect(
    contract.connect(nonOwner).adminFunction()
  ).to.be.revertedWith("Not owner");
});
```

### Pattern 4: Test State Machine

```javascript
it("Should follow correct state transitions", async function () {
  // Created
  expect(trip.status).to.equal(0);
  
  // In Transit
  await trip.startTrip(tripId);
  expect(trip.status).to.equal(1);
  
  // Delivered
  await trip.completeTrip(tripId);
  expect(trip.status).to.equal(2);
});
```

---

## Integration Testing

### Testing Contract Interactions

```javascript
describe("Contract Integration", function () {
  it("Should work together", async function () {
    // Deploy all contracts
    const tripRegistry = await TripRegistry.deploy();
    const paymentEscrow = await PaymentEscrow.deploy(tripRegistry.address);
    
    // Create trip
    const tx = await tripRegistry.createTrip(...);
    const receipt = await tx.wait();
    const tripId = parseTripId(receipt);
    
    // Create escrow for trip
    await paymentEscrow.createEscrow(tripId, ...);
    
    // Verify integration
    const escrowId = await paymentEscrow.getEscrowByTrip(tripId);
    expect(escrowId).to.not.equal(0);
  });
});
```

### Testing Event Flow

```javascript
it("Should emit events in correct order", async function () {
  const tx = await contract.createTrip(...);
  const receipt = await tx.wait();
  
  // Check events
  const events = receipt.logs.map(log => {
    const parsed = contract.interface.parseLog(log);
    return parsed.name;
  });
  
  expect(events).to.include("TripCreated");
  expect(events[0]).to.equal("TripCreated");
});
```

---

## Gas Optimization Testing

### Measure Gas Usage

```javascript
it("Should use reasonable gas", async function () {
  const gasEstimate = await contract.function.estimateGas(...);
  console.log("Gas estimate:", gasEstimate.toString());
  
  expect(gasEstimate).to.be.below(200000); // Set reasonable limit
});
```

### Compare Gas Costs

```javascript
it("Should optimize gas usage", async function () {
  // Test version 1
  const gas1 = await contractV1.function.estimateGas(...);
  
  // Test version 2 (optimized)
  const gas2 = await contractV2.function.estimateGas(...);
  
  expect(gas2).to.be.below(gas1);
  console.log(`Gas saved: ${gas1 - gas2}`);
});
```

---

## Debugging Workflow

### 1. Reproduce the Issue

```javascript
it("Should reproduce bug", async function () {
  // Minimal code to reproduce
  await contract.function(...);
  // Bug occurs here
});
```

### 2. Add Logging

```solidity
function myFunction() external {
    console.log("Entering function");
    console.log("Value:", value);
    // ...
}
```

### 3. Use Debugger

```bash
# In Hardhat
npx hardhat node --verbose
```

### 4. Inspect State

```javascript
const state = await contract.getState();
console.log("Current state:", state);
```

### 5. Trace Execution

```bash
npx hardhat run script.js --trace
```

---

## Testing Checklist

Before deployment, ensure:

- [ ] All functions tested
- [ ] All error cases tested
- [ ] Edge cases covered
- [ ] Integration tests pass
- [ ] Gas usage acceptable
- [ ] Events emitted correctly
- [ ] Access control works
- [ ] Reentrancy protection
- [ ] Overflow protection
- [ ] 100% test coverage

---

## Tools Summary

| Tool | Purpose | When to Use |
|------|---------|-------------|
| Hardhat Test | Unit/Integration tests | Always |
| Hardhat Console | Interactive debugging | During development |
| Hardhat Node | Local blockchain | Testing |
| Remix IDE | Online debugging | Quick tests |
| Tenderly | Advanced debugging | Complex issues |
| Etherscan | Mainnet inspection | Post-deployment |

---

## Resources

- [Hardhat Testing Guide](https://hardhat.org/hardhat-runner/docs/guides/test-contracts)
- [OpenZeppelin Test Helpers](https://docs.openzeppelin.com/test-helpers)
- [Solidity Testing Best Practices](https://consensys.github.io/smart-contract-best-practices/testing/)

---

## Summary

1. **Test Everything**: Functions, errors, edge cases
2. **Use Tools**: Hardhat, Remix, Tenderly
3. **Debug Systematically**: Reproduce, log, trace
4. **Optimize Gas**: Measure and compare
5. **Test Integration**: Contracts working together
6. **Coverage Matters**: Aim for 100%

Remember: **Better to find bugs in tests than on mainnet!**

