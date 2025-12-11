# Environment Variables Guide

Complete list of environment variables for all layers of DecentraLogix.

## Smart Contracts

**File**: `smart-contracts/.env`

```env
# Private key for deploying contracts (NEVER commit this!)
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

# RPC URLs for different networks
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
# OR
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY

# Mainnet RPC (for production)
MAINNET_RPC_URL=https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID

# Etherscan API key for contract verification
ETHERSCAN_API_KEY=your_etherscan_api_key_here

# Optional: Gas reporter
REPORT_GAS=true
```

**Example Values (Local Hardhat Node)**:
```env
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
SEPOLIA_RPC_URL=http://localhost:8545
ETHERSCAN_API_KEY=
REPORT_GAS=false
```

**Example Values (Sepolia Testnet)**:
```env
PRIVATE_KEY=your_testnet_private_key_here
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/abc123def456...
ETHERSCAN_API_KEY=abc123def456...
REPORT_GAS=false
```

---

## Backend

**File**: `backend/.env`

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Blockchain Configuration
RPC_URL=http://localhost:8545
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
CHAIN_ID=1337

# Contract Addresses (update after deployment)
TRIP_REGISTRY_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
PAYMENT_ESCROW_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
CARBON_CREDITS_ADDRESS=0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0

# Firebase Configuration (Optional - for caching)
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"..."}

# Logging
LOG_LEVEL=info

# Test Accounts (for simulation)
SHIPPER_ADDRESS=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
CARRIER_ADDRESS=0x70997970C51812dc3A010C7d01b50e0d17dc79C8
RECEIVER_ADDRESS=0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
```

**Example Values (Local Development)**:
```env
PORT=3001
NODE_ENV=development
RPC_URL=http://localhost:8545
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
CHAIN_ID=1337
TRIP_REGISTRY_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
PAYMENT_ESCROW_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
CARBON_CREDITS_ADDRESS=0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
LOG_LEVEL=info
```

**Example Values (Sepolia Testnet)**:
```env
PORT=3001
NODE_ENV=production
RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
PRIVATE_KEY=your_backend_private_key_here
CHAIN_ID=11155111
TRIP_REGISTRY_ADDRESS=0xYourDeployedTripRegistryAddress
PAYMENT_ESCROW_ADDRESS=0xYourDeployedPaymentEscrowAddress
CARBON_CREDITS_ADDRESS=0xYourDeployedCarbonCreditsAddress
LOG_LEVEL=info
FIREBASE_PROJECT_ID=your_firebase_project_id
```

---

## Frontend

**File**: `frontend/.env`

```env
# Backend API URL
REACT_APP_API_URL=http://localhost:3001/api

# Contract Addresses (update after deployment)
REACT_APP_TRIP_REGISTRY_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
REACT_APP_PAYMENT_ESCROW_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
REACT_APP_CARBON_CREDITS_ADDRESS=0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0

# Network Configuration
REACT_APP_CHAIN_ID=1337

# Optional: WalletConnect Project ID (if using WalletConnect)
REACT_APP_WALLET_CONNECT_PROJECT_ID=your_walletconnect_project_id
```

**Example Values (Local Development)**:
```env
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_TRIP_REGISTRY_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
REACT_APP_PAYMENT_ESCROW_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
REACT_APP_CARBON_CREDITS_ADDRESS=0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
REACT_APP_CHAIN_ID=1337
```

**Example Values (Production/Sepolia)**:
```env
REACT_APP_API_URL=https://api.yourdomain.com/api
REACT_APP_TRIP_REGISTRY_ADDRESS=0xYourDeployedTripRegistryAddress
REACT_APP_PAYMENT_ESCROW_ADDRESS=0xYourDeployedPaymentEscrowAddress
REACT_APP_CARBON_CREDITS_ADDRESS=0xYourDeployedCarbonCreditsAddress
REACT_APP_CHAIN_ID=11155111
REACT_APP_WALLET_CONNECT_PROJECT_ID=your_walletconnect_project_id
```

---

## Quick Setup Guide

### 1. Smart Contracts

```bash
cd smart-contracts
cp .env.example .env
# Edit .env with your values
```

**Required for local testing:**
- `PRIVATE_KEY` - Use Hardhat default account key

**Required for testnet:**
- `PRIVATE_KEY` - Your testnet account private key
- `SEPOLIA_RPC_URL` - Get from Infura or Alchemy
- `ETHERSCAN_API_KEY` - For contract verification

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your values
```

**Required:**
- `RPC_URL` - Blockchain RPC endpoint
- `PRIVATE_KEY` - Backend account private key
- `TRIP_REGISTRY_ADDRESS` - After deploying contracts
- `PAYMENT_ESCROW_ADDRESS` - After deploying contracts
- `CARBON_CREDITS_ADDRESS` - After deploying contracts

**Optional:**
- `FIREBASE_PROJECT_ID` - For caching (optional)
- `PORT` - Default is 3001

### 3. Frontend

```bash
cd frontend
cp .env.example .env
# Edit .env with your values
```

**Required:**
- `REACT_APP_API_URL` - Backend API URL
- `REACT_APP_TRIP_REGISTRY_ADDRESS` - After deploying contracts
- `REACT_APP_PAYMENT_ESCROW_ADDRESS` - After deploying contracts
- `REACT_APP_CARBON_CREDITS_ADDRESS` - After deploying contracts
- `REACT_APP_CHAIN_ID` - Network chain ID

---

## Network Chain IDs

| Network | Chain ID |
|---------|----------|
| Local Hardhat | 1337 |
| Sepolia Testnet | 11155111 |
| Ethereum Mainnet | 1 |
| Polygon | 137 |
| Mumbai (Polygon Testnet) | 80001 |

---

## Security Notes

⚠️ **IMPORTANT**:

1. **Never commit `.env` files** to git
2. **Never share private keys** publicly
3. **Use different keys** for testnet and mainnet
4. **Rotate keys** regularly
5. **Use environment variables** in production (not .env files)
6. **Restrict access** to .env files

---

## Getting RPC URLs

### Infura
1. Sign up at https://infura.io
2. Create a project
3. Copy the project ID
4. Use: `https://sepolia.infura.io/v3/YOUR_PROJECT_ID`

### Alchemy
1. Sign up at https://alchemy.com
2. Create an app
3. Copy the API key
4. Use: `https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY`

### Public RPC (Not recommended for production)
- Sepolia: `https://rpc.sepolia.org`
- Mainnet: `https://eth.llamarpc.com`

---

## Getting Contract Addresses

After deploying contracts, you'll see output like:

```
TripRegistry deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
PaymentEscrow deployed to: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
CarbonCredits deployed to: 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
```

Copy these addresses to your `.env` files.

---

## Testing with Default Hardhat Accounts

Hardhat provides 20 test accounts with 10,000 ETH each:

```
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Account #1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
Account #2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
...
```

Private key for Account #0:
```
0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

**⚠️ These are test accounts only - never use on mainnet!**

