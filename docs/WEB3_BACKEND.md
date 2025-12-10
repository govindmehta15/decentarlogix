# Web3 Backend Integration Learning Guide

This document explains how to build a backend API that interacts with blockchain smart contracts using Node.js and Ethers.js.

## Table of Contents

1. [Introduction](#introduction)
2. [Setting Up Ethers.js](#setting-up-ethersjs)
3. [Connecting to Blockchain](#connecting-to-blockchain)
4. [Interacting with Contracts](#interacting-with-contracts)
5. [Reading Contract State](#reading-contract-state)
6. [Writing to Contracts](#writing-to-contracts)
7. [Event Listening](#event-listening)
8. [Error Handling](#error-handling)
9. [Best Practices](#best-practices)
10. [Architecture Patterns](#architecture-patterns)

---

## Introduction

### What is a Web3 Backend?

A Web3 backend is a traditional REST API that also interacts with blockchain smart contracts. It serves as a bridge between:
- **Frontend applications** (React, mobile apps)
- **Blockchain networks** (Ethereum, Polygon, etc.)

### Why Use a Backend?

1. **Security**: Private keys stay on the server
2. **Performance**: Cache blockchain data for faster queries
3. **Aggregation**: Combine data from multiple contracts
4. **Indexing**: Process and store events for efficient queries
5. **Abstraction**: Simplify complex blockchain operations

---

## Setting Up Ethers.js

### Installation

```bash
npm install ethers
```

### Basic Setup

```javascript
import { ethers } from 'ethers';

// Connect to blockchain
const provider = new ethers.JsonRpcProvider('http://localhost:8545');

// Create wallet (for signing transactions)
const wallet = new ethers.Wallet(privateKey, provider);
```

### Provider Types

**1. JsonRpcProvider** (Local/Testnet)
```javascript
const provider = new ethers.JsonRpcProvider('http://localhost:8545');
```

**2. InfuraProvider** (Mainnet/Testnet)
```javascript
const provider = new ethers.InfuraProvider('sepolia', INFURA_API_KEY);
```

**3. AlchemyProvider** (Mainnet/Testnet)
```javascript
const provider = new ethers.AlchemyProvider('sepolia', ALCHEMY_API_KEY);
```

---

## Connecting to Blockchain

### Provider vs Signer

**Provider**: Read-only connection
- Can read contract state
- Can listen to events
- Cannot send transactions

**Signer**: Can sign transactions
- Can read contract state
- Can send transactions
- Requires private key

```javascript
// Provider (read-only)
const provider = new ethers.JsonRpcProvider(RPC_URL);
const contract = new ethers.Contract(address, abi, provider);

// Signer (read + write)
const wallet = new ethers.Wallet(privateKey, provider);
const contract = new ethers.Contract(address, abi, wallet);
```

### Network Configuration

```javascript
// Get network info
const network = await provider.getNetwork();
console.log('Chain ID:', network.chainId);
console.log('Name:', network.name);

// Get block number
const blockNumber = await provider.getBlockNumber();
console.log('Current block:', blockNumber);
```

---

## Interacting with Contracts

### Contract Instance

```javascript
import { ethers } from 'ethers';

// Contract ABI (Application Binary Interface)
const abi = [
  'function createTrip(...) returns (uint256, uint256)',
  'function getTripMetadata(uint256) view returns (...)',
  'event TripCreated(uint256 indexed, uint256 indexed, ...)',
];

// Create contract instance
const contract = new ethers.Contract(
  contractAddress,  // Contract address
  abi,              // Contract ABI
  provider          // Provider or signer
);
```

### Contract ABI

The ABI defines:
- Function signatures
- Event definitions
- Data structures

**Minimal ABI** (for specific functions):
```javascript
const abi = [
  'function createTrip(address,address,string,string,uint256,uint256,string) returns (uint256, uint256)',
  'function getTripMetadata(uint256) view returns (tuple(...))',
];
```

**Full ABI** (from compiled contract):
```javascript
// Load from artifacts
const artifacts = require('./artifacts/contracts/TripRegistry.sol/TripRegistry.json');
const abi = artifacts.abi;
```

---

## Reading Contract State

### View Functions

View functions don't modify state and don't cost gas.

```javascript
// Read trip metadata
const metadata = await contract.getTripMetadata(tripId);

// Parse result
const tripData = {
  tripId: metadata[0].toString(),
  shipper: metadata[1],
  carrier: metadata[2],
  // ...
};
```

### Handling Return Values

**Structs**:
```javascript
// Contract returns struct
const metadata = await contract.getTripMetadata(tripId);

// Access by index
const shipper = metadata[1];
const carrier = metadata[2];

// Or destructure
const [tripId, shipper, carrier, ...] = metadata;
```

**Arrays**:
```javascript
const rewards = await contract.getUserRewards(wallet);
// Returns array of BigInt
const rewardIds = rewards.map(r => r.toString());
```

**BigInt Handling**:
```javascript
// Ethers.js returns BigInt for uint256
const balance = await contract.balanceOf(wallet);

// Convert to string
const balanceString = balance.toString();

// Convert to number (if small enough)
const balanceNumber = Number(balance);
```

---

## Writing to Contracts

### Sending Transactions

```javascript
// Create contract with signer
const contract = new ethers.Contract(address, abi, wallet);

// Call write function
const tx = await contract.createTrip(
  carrier,
  receiver,
  originLocation,
  destinationLocation,
  distance,
  estimatedCarbonFootprint,
  ipfsHash
);

console.log('Transaction hash:', tx.hash);

// Wait for confirmation
const receipt = await tx.wait();
console.log('Block number:', receipt.blockNumber);
console.log('Gas used:', receipt.gasUsed.toString());
```

### Transaction Lifecycle

1. **Send Transaction**: `const tx = await contract.function(...)`
2. **Get Hash**: `tx.hash` (immediate)
3. **Wait for Confirmation**: `await tx.wait()` (waits for block)
4. **Get Receipt**: Contains events and gas usage

### Gas Estimation

```javascript
// Estimate gas before sending
const gasEstimate = await contract.createTrip.estimateGas(...);
console.log('Estimated gas:', gasEstimate.toString());

// Send with gas limit
const tx = await contract.createTrip(...);
```

### Transaction Options

```javascript
// Set gas price
const tx = await contract.createTrip(...);
await tx.wait();

// Or set options
const tx = await contract.createTrip(...);
await tx.wait({ confirmations: 3 }); // Wait for 3 confirmations
```

---

## Event Listening

### Listening to Events

```javascript
// Listen to single event
contract.on('TripCreated', (tripId, tokenId, shipper, carrier, event) => {
  console.log('Trip created:', {
    tripId: tripId.toString(),
    tokenId: tokenId.toString(),
    shipper,
    carrier,
    blockNumber: event.blockNumber,
  });
});
```

### Event Filtering

```javascript
// Filter by indexed parameters
const filter = contract.filters.TripCreated(null, null, shipperAddress);
contract.on(filter, (tripId, tokenId, shipper, carrier) => {
  // Only trips created by specific shipper
});
```

### Querying Past Events

```javascript
// Get events from past blocks
const events = await contract.queryFilter(
  contract.filters.TripCreated(),
  fromBlock,  // Starting block
  toBlock     // Ending block (or 'latest')
);

events.forEach(event => {
  const [tripId, tokenId, shipper, carrier] = event.args;
  console.log('Past trip:', tripId.toString());
});
```

### Event Indexing Pattern

```javascript
// Listen to events and store in database
contract.on('TripCreated', async (tripId, tokenId, shipper, carrier, event) => {
  // Store in database
  await db.trips.create({
    tripId: tripId.toString(),
    tokenId: tokenId.toString(),
    shipper,
    carrier,
    blockNumber: event.blockNumber,
    createdAt: new Date(),
  });
});
```

---

## Error Handling

### Common Errors

**1. Insufficient Funds**
```javascript
try {
  const tx = await contract.createTrip(...);
} catch (error) {
  if (error.code === 'INSUFFICIENT_FUNDS') {
    console.error('Not enough ETH for gas');
  }
}
```

**2. Contract Revert**
```javascript
try {
  const tx = await contract.startTrip(tripId);
} catch (error) {
  if (error.reason) {
    console.error('Contract revert:', error.reason);
  }
}
```

**3. Network Errors**
```javascript
try {
  const metadata = await contract.getTripMetadata(tripId);
} catch (error) {
  if (error.code === 'NETWORK_ERROR') {
    console.error('Network connection failed');
  }
}
```

### Error Handling Pattern

```javascript
async function createTrip(tripData) {
  try {
    const tx = await contract.createTrip(...);
    const receipt = await tx.wait();
    return { success: true, txHash: receipt.hash };
  } catch (error) {
    logger.error('Error creating trip', {
      error: error.message,
      code: error.code,
      reason: error.reason,
    });
    throw new Error(`Failed to create trip: ${error.message}`);
  }
}
```

---

## Best Practices

### 1. Separate Read and Write Contracts

```javascript
// Read-only contract (no private key needed)
const readContract = new ethers.Contract(address, abi, provider);

// Write contract (requires private key)
const writeContract = new ethers.Contract(address, abi, wallet);
```

### 2. Cache Blockchain Data

```javascript
// Check cache first
let tripData = await cache.get(`trip:${tripId}`);

if (!tripData) {
  // Fetch from blockchain
  tripData = await contract.getTripMetadata(tripId);
  
  // Cache for future requests
  await cache.set(`trip:${tripId}`, tripData, 3600); // 1 hour
}
```

### 3. Use Connection Pooling

```javascript
// Reuse provider instance
const provider = new ethers.JsonRpcProvider(RPC_URL);

// Don't create new provider for each request
```

### 4. Handle BigInt Properly

```javascript
// Always convert BigInt to string for JSON
const balance = await contract.balanceOf(wallet);
const response = {
  balance: balance.toString(), // Not balance directly
};
```

### 5. Validate Inputs

```javascript
// Validate Ethereum address
function isValidAddress(address) {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

// Validate before calling contract
if (!isValidAddress(carrier)) {
  throw new Error('Invalid carrier address');
}
```

### 6. Retry Logic

```javascript
async function retryOperation(operation, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await sleep(1000 * (i + 1)); // Exponential backoff
    }
  }
}
```

---

## Architecture Patterns

### Service Layer Pattern

```javascript
// services/blockchain/contractService.js
export class TripRegistryService {
  constructor() {
    this.contract = getContract('TripRegistry', false);
    this.writeContract = getContract('TripRegistry', true);
  }

  async createTrip(tripData) {
    const tx = await this.writeContract.createTrip(...);
    const receipt = await tx.wait();
    return this.parseReceipt(receipt);
  }

  async getTripMetadata(tripId) {
    const metadata = await this.contract.getTripMetadata(tripId);
    return this.parseMetadata(metadata);
  }
}
```

### Controller Pattern

```javascript
// controllers/tripController.js
export async function createTrip(req, res) {
  try {
    const tripData = req.body;
    const result = await tripRegistryService.createTrip(tripData);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
```

### Event Indexer Pattern

```javascript
// services/eventIndexer.js
export class EventIndexer {
  constructor(contract, db) {
    this.contract = contract;
    this.db = db;
  }

  start() {
    this.contract.on('TripCreated', async (tripId, tokenId, ...) => {
      await this.db.trips.create({
        tripId: tripId.toString(),
        // ...
      });
    });
  }
}
```

---

## Security Considerations

### 1. Private Key Management

**Never**:
- Commit private keys to git
- Log private keys
- Expose private keys in API responses

**Always**:
- Use environment variables
- Use secure key management (AWS Secrets Manager, etc.)
- Rotate keys regularly

### 2. Input Validation

```javascript
// Validate all inputs before calling contracts
if (!isValidAddress(carrier)) {
  throw new Error('Invalid address');
}

if (distance <= 0) {
  throw new Error('Distance must be positive');
}
```

### 3. Rate Limiting

```javascript
// Limit API requests to prevent abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
```

### 4. Error Messages

```javascript
// Don't expose internal errors
catch (error) {
  logger.error('Internal error', error); // Log full error
  res.status(500).json({
    error: 'An error occurred', // Generic message to user
  });
}
```

---

## Testing

### Mocking Contracts

```javascript
// tests/mocks/contractMock.js
export const mockContract = {
  getTripMetadata: jest.fn().mockResolvedValue([
    BigInt(1),
    '0x...',
    '0x...',
    // ...
  ]),
  createTrip: jest.fn().mockResolvedValue({
    hash: '0x...',
    wait: jest.fn().mockResolvedValue({
      blockNumber: 12345,
    }),
  }),
};
```

### Integration Tests

```javascript
// Use local Hardhat node for testing
const provider = new ethers.JsonRpcProvider('http://localhost:8545');
const contract = new ethers.Contract(address, abi, provider);

test('should create trip', async () => {
  const result = await contract.createTrip(...);
  expect(result).toBeDefined();
});
```

---

## Resources

- [Ethers.js Documentation](https://docs.ethers.io/)
- [Hardhat Documentation](https://hardhat.org/docs)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)

---

## Summary

1. **Use Ethers.js** for blockchain interactions
2. **Separate read/write** operations
3. **Cache data** for performance
4. **Handle errors** gracefully
5. **Validate inputs** before calling contracts
6. **Listen to events** for real-time updates
7. **Use service layer** pattern for organization
8. **Secure private keys** properly

This architecture provides a robust, scalable backend for Web3 applications!

