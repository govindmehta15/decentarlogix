# Web3 UI Development Learning Guide

This document explains how to build a Web3 user interface with React and Ethers.js, focusing on wallet connection and transaction signing.

## Table of Contents

1. [Introduction](#introduction)
2. [How Web3 Login Works](#how-web3-login-works)
3. [How Transactions Are Signed](#how-transactions-are-signed)
4. [Setting Up Ethers.js in React](#setting-up-ethersjs-in-react)
5. [Wallet Connection](#wallet-connection)
6. [Reading Contract Data](#reading-contract-data)
7. [Writing to Contracts](#writing-to-contracts)
8. [Best Practices](#best-practices)
9. [Common Patterns](#common-patterns)

---

## Introduction

### What is a Web3 UI?

A Web3 UI is a frontend application that interacts directly with blockchain networks. Unlike traditional web apps that connect to a backend API, Web3 UIs:

- Connect directly to blockchain via wallets (MetaMask, WalletConnect, etc.)
- Users sign transactions with their private keys
- No backend required for blockchain interactions
- Decentralized and trustless

### Key Concepts

**Wallet**: Software that manages private keys and signs transactions
**Provider**: Connection to blockchain network
**Signer**: Object that can sign transactions
**Contract**: Interface to interact with smart contracts

---

## How Web3 Login Works

### Traditional Login vs Web3 Login

**Traditional Login:**
1. User enters username/password
2. Server validates credentials
3. Server issues session token
4. Client stores token

**Web3 Login:**
1. User clicks "Connect Wallet"
2. Wallet prompts user to approve connection
3. Wallet shares public address (not private key)
4. No password, no server, no session

### The Login Flow

```javascript
// 1. Check if wallet is installed
if (typeof window.ethereum !== 'undefined') {
  // MetaMask is installed
}

// 2. Request account access
const accounts = await window.ethereum.request({
  method: 'eth_requestAccounts',
});

// 3. Get the first account (user's address)
const userAddress = accounts[0];
// Example: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
```

### Why No Password?

**Private Key = Identity**
- Your private key is your identity
- It's stored securely in your wallet
- You never share it with websites
- You only sign transactions when you approve them

**Public Address = Username**
- Derived from private key
- Safe to share publicly
- Used to receive funds and identify you

### Security Model

```
Private Key (Secret)
    ↓
Public Address (Public)
    ↓
Sign Transactions (Prove Ownership)
```

**Key Points:**
- Private key never leaves wallet
- Websites never see your private key
- You approve every transaction
- Transactions are cryptographically signed

---

## How Transactions Are Signed

### What is Transaction Signing?

Transaction signing is the process of cryptographically proving that you own the private key associated with your address, without revealing the private key.

### The Signing Process

**1. Create Transaction**
```javascript
const tx = await contract.createTrip(
  carrier,
  receiver,
  originLocation,
  destinationLocation,
  distance,
  estimatedCarbonFootprint,
  ipfsHash
);
```

**2. Wallet Prompts User**
- MetaMask popup appears
- Shows transaction details
- User reviews and approves/rejects

**3. Wallet Signs Transaction**
```javascript
// Happens inside wallet (you don't see this)
const signature = sign(privateKey, transactionData);
```

**4. Transaction Sent to Network**
```javascript
// Transaction is broadcast to blockchain
const receipt = await tx.wait();
```

### Transaction Structure

A transaction contains:
- **From**: Your address
- **To**: Contract address
- **Data**: Function call and parameters
- **Value**: Amount of ETH (if sending)
- **Gas**: Estimated gas cost
- **Nonce**: Transaction number

### User Experience

**Step 1: User Initiates Action**
```javascript
// User clicks "Create Trip" button
const handleCreateTrip = async () => {
  const tx = await contract.createTrip(...);
};
```

**Step 2: MetaMask Popup**
```
┌─────────────────────────────┐
│  MetaMask                    │
├─────────────────────────────┤
│  Transaction Details         │
│                              │
│  To: 0x5FbDB...             │
│  Data: 0x1234...            │
│  Gas: 150,000                │
│                              │
│  [Reject]  [Confirm]         │
└─────────────────────────────┘
```

**Step 3: User Approves**
- Clicks "Confirm"
- Wallet signs transaction
- Transaction sent to network

**Step 4: Wait for Confirmation**
```javascript
// Show loading state
setIsProcessing(true);

// Wait for transaction
const receipt = await tx.wait();

// Transaction confirmed!
setIsProcessing(false);
```

### Why Signing is Secure

1. **Private Key Never Leaves Wallet**
   - Signing happens inside wallet
   - Website never sees private key
   - Even if website is malicious, it can't steal your key

2. **You Review Every Transaction**
   - See what you're signing
   - Can reject if suspicious
   - No automatic transactions

3. **Cryptographic Proof**
   - Signature proves you own the key
   - Cannot be forged
   - Immutable on blockchain

---

## Setting Up Ethers.js in React

### Installation

```bash
npm install ethers
```

### Basic Setup

```javascript
import { ethers } from 'ethers';

// Check if MetaMask is installed
if (typeof window.ethereum !== 'undefined') {
  // Create provider
  const provider = new ethers.BrowserProvider(window.ethereum);
  
  // Get signer
  const signer = await provider.getSigner();
  
  // Get user's address
  const address = await signer.getAddress();
}
```

### Provider vs Signer

**Provider** (Read-only):
```javascript
const provider = new ethers.BrowserProvider(window.ethereum);
// Can read contract state
// Cannot send transactions
```

**Signer** (Read + Write):
```javascript
const signer = await provider.getSigner();
// Can read contract state
// Can send transactions
// Requires user approval
```

---

## Wallet Connection

### Complete Connection Flow

```javascript
// 1. Check if wallet installed
const isMetaMaskInstalled = typeof window.ethereum !== 'undefined';

if (!isMetaMaskInstalled) {
  // Redirect to MetaMask download
  window.open('https://metamask.io/download/', '_blank');
  return;
}

// 2. Request account access
const accounts = await window.ethereum.request({
  method: 'eth_requestAccounts',
});

// 3. Get user's address
const userAddress = accounts[0];

// 4. Create provider and signer
const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();

// 5. Store in state/context
setAccount(userAddress);
setProvider(provider);
setSigner(signer);
```

### React Context Pattern

```javascript
// Web3Context.js
const Web3Context = createContext();

export function Web3Provider({ children }) {
  const [account, setAccount] = useState(null);
  const [signer, setSigner] = useState(null);

  const connectWallet = async () => {
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    
    setAccount(accounts[0]);
    setSigner(signer);
  };

  return (
    <Web3Context.Provider value={{ account, signer, connectWallet }}>
      {children}
    </Web3Context.Provider>
  );
}
```

### Listening to Account Changes

```javascript
// User switches accounts in MetaMask
window.ethereum.on('accountsChanged', (accounts) => {
  if (accounts.length === 0) {
    // User disconnected
    setAccount(null);
  } else {
    // User switched account
    setAccount(accounts[0]);
  }
});

// User switches networks
window.ethereum.on('chainChanged', () => {
  // Reload page to update provider
  window.location.reload();
});
```

---

## Reading Contract Data

### Get Contract Instance

```javascript
import { ethers } from 'ethers';

const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
const abi = [
  'function getTripMetadata(uint256) view returns (...)',
];

// Read-only (no signer needed)
const contract = new ethers.Contract(
  contractAddress,
  abi,
  provider
);
```

### Call View Functions

```javascript
// View functions don't require signing
const metadata = await contract.getTripMetadata(tripId);

// Parse result
const tripData = {
  tripId: metadata[0].toString(),
  shipper: metadata[1],
  carrier: metadata[2],
  // ...
};
```

### Handle BigInt

```javascript
// Ethers.js returns BigInt for uint256
const balance = await contract.balanceOf(address);

// Convert to string for display
const balanceString = balance.toString();

// Or convert to number (if small enough)
const balanceNumber = Number(balance);
```

---

## Writing to Contracts

### Send Transaction

```javascript
// Need signer for write operations
const contract = new ethers.Contract(address, abi, signer);

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

// Transaction sent, waiting for confirmation
console.log('Transaction hash:', tx.hash);

// Wait for confirmation
const receipt = await tx.wait();
console.log('Confirmed in block:', receipt.blockNumber);
```

### Transaction Lifecycle

**1. User Clicks Button**
```javascript
const handleCreateTrip = async () => {
  setIsLoading(true);
  try {
    const tx = await contract.createTrip(...);
    // MetaMask popup appears here
  } catch (error) {
    // User rejected transaction
    console.error('Transaction rejected');
  }
};
```

**2. MetaMask Popup**
- User reviews transaction
- Approves or rejects

**3. Transaction Pending**
```javascript
const tx = await contract.createTrip(...);
// tx.hash is available immediately
// Transaction is pending
```

**4. Wait for Confirmation**
```javascript
const receipt = await tx.wait();
// Transaction confirmed
// receipt contains events and gas used
```

### Error Handling

```javascript
try {
  const tx = await contract.createTrip(...);
  const receipt = await tx.wait();
  // Success!
} catch (error) {
  if (error.code === 'ACTION_REJECTED') {
    // User rejected transaction
    toast.error('Transaction rejected');
  } else if (error.code === 'INSUFFICIENT_FUNDS') {
    // Not enough ETH for gas
    toast.error('Insufficient funds');
  } else {
    // Other error
    toast.error('Transaction failed');
  }
}
```

---

## Best Practices

### 1. Always Check Wallet Connection

```javascript
if (!account) {
  return <div>Please connect your wallet</div>;
}
```

### 2. Show Loading States

```javascript
const [isProcessing, setIsProcessing] = useState(false);

const handleSubmit = async () => {
  setIsProcessing(true);
  try {
    await contract.createTrip(...);
  } finally {
    setIsProcessing(false);
  }
};

return (
  <button disabled={isProcessing}>
    {isProcessing ? 'Processing...' : 'Submit'}
  </button>
);
```

### 3. Handle User Rejection

```javascript
try {
  const tx = await contract.createTrip(...);
} catch (error) {
  if (error.code === 'ACTION_REJECTED') {
    // User clicked reject - this is OK, don't show error
    return;
  }
  // Real error
  toast.error('Transaction failed');
}
```

### 4. Validate Inputs

```javascript
// Validate Ethereum address
const isValidAddress = (address) => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

if (!isValidAddress(carrier)) {
  toast.error('Invalid address format');
  return;
}
```

### 5. Format Numbers for Display

```javascript
// Convert wei to ETH
const formatETH = (wei) => {
  return (Number(wei) / 1e18).toFixed(4) + ' ETH';
};

// Format large numbers
const formatNumber = (num) => {
  return Number(num).toLocaleString();
};
```

### 6. Use React Context for Web3 State

```javascript
// Share Web3 state across components
const { account, signer, connectWallet } = useWeb3();
```

---

## Common Patterns

### Pattern 1: Connect Wallet Button

```javascript
function ConnectButton() {
  const { account, connectWallet } = useWeb3();
  
  if (account) {
    return <div>Connected: {account.slice(0, 6)}...</div>;
  }
  
  return (
    <button onClick={connectWallet}>
      Connect Wallet
    </button>
  );
}
```

### Pattern 2: Transaction Button

```javascript
function CreateTripButton() {
  const { signer, account } = useWeb3();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleClick = async () => {
    if (!account) {
      toast.error('Connect wallet first');
      return;
    }
    
    setIsProcessing(true);
    try {
      const tx = await contract.createTrip(...);
      await tx.wait();
      toast.success('Trip created!');
    } catch (error) {
      if (error.code !== 'ACTION_REJECTED') {
        toast.error('Transaction failed');
      }
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <button 
      onClick={handleClick}
      disabled={isProcessing || !account}
    >
      {isProcessing ? 'Processing...' : 'Create Trip'}
    </button>
  );
}
```

### Pattern 3: Read Contract Data

```javascript
function TripDetails({ tripId }) {
  const { provider } = useWeb3();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (provider && tripId) {
      loadTrip();
    }
  }, [provider, tripId]);
  
  const loadTrip = async () => {
    try {
      const metadata = await contract.getTripMetadata(tripId);
      setTrip(parseMetadata(metadata));
    } catch (error) {
      console.error('Error loading trip:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) return <div>Loading...</div>;
  if (!trip) return <div>Trip not found</div>;
  
  return <div>{/* Render trip data */}</div>;
}
```

---

## Security Considerations

### 1. Never Store Private Keys

```javascript
// ❌ NEVER DO THIS
const privateKey = '0x...';
const wallet = new ethers.Wallet(privateKey);

// ✅ Use wallet extension
const signer = await provider.getSigner();
```

### 2. Validate All Inputs

```javascript
// Always validate before sending transactions
if (!isValidAddress(carrier)) {
  return;
}
```

### 3. Show Transaction Details

```javascript
// Let user review before signing
const handleSubmit = async () => {
  const confirmed = window.confirm(
    `Create trip from ${origin} to ${destination}?`
  );
  if (!confirmed) return;
  
  // Proceed with transaction
};
```

### 4. Handle Network Errors

```javascript
try {
  const tx = await contract.createTrip(...);
} catch (error) {
  if (error.code === 'NETWORK_ERROR') {
    toast.error('Network error. Please try again.');
  }
}
```

---

## Summary

1. **Web3 Login**: No password, uses wallet connection
2. **Transaction Signing**: User approves every transaction
3. **Private Key Security**: Never leaves wallet
4. **Provider**: Read-only connection
5. **Signer**: Can sign transactions
6. **Always Check**: Wallet connection before operations
7. **Handle Errors**: User rejection is normal
8. **Show Loading**: Better UX during transactions

This architecture provides a secure, user-friendly Web3 interface!

