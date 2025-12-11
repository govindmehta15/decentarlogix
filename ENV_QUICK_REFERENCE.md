# Environment Variables Quick Reference

## 📋 All Environment Variables

### 🔷 Smart Contracts (`smart-contracts/.env`)

```env
# Required
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
SEPOLIA_RPC_URL=http://localhost:8545

# Optional
ETHERSCAN_API_KEY=
REPORT_GAS=false
```

**For Testnet:**
```env
PRIVATE_KEY=your_testnet_private_key
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
ETHERSCAN_API_KEY=your_etherscan_key
```

---

### 🔷 Backend (`backend/.env`)

```env
# Server
PORT=3001
NODE_ENV=development

# Blockchain
RPC_URL=http://localhost:8545
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
CHAIN_ID=1337

# Contracts (update after deployment!)
TRIP_REGISTRY_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
PAYMENT_ESCROW_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
CARBON_CREDITS_ADDRESS=0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0

# Logging
LOG_LEVEL=info

# Test Accounts (for simulation)
SHIPPER_ADDRESS=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
CARRIER_ADDRESS=0x70997970C51812dc3A010C7d01b50e0d17dc79C8
RECEIVER_ADDRESS=0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC

# Optional: Firebase
FIREBASE_PROJECT_ID=
FIREBASE_SERVICE_ACCOUNT=
```

---

### 🔷 Frontend (`frontend/.env`)

```env
# Backend API
REACT_APP_API_URL=http://localhost:3001/api

# Contracts (update after deployment!)
REACT_APP_TRIP_REGISTRY_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
REACT_APP_PAYMENT_ESCROW_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
REACT_APP_CARBON_CREDITS_ADDRESS=0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0

# Network
REACT_APP_CHAIN_ID=1337

# Optional: WalletConnect
REACT_APP_WALLET_CONNECT_PROJECT_ID=
```

---

## 🚀 Quick Setup

### Step 1: Deploy Contracts

```bash
cd smart-contracts
npm run deploy:local
```

**Output will show:**
```
TripRegistry: 0x5FbDB2315678afecb367f032d93F642f64180aa3
PaymentEscrow: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
CarbonCredits: 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
```

### Step 2: Update Backend .env

Copy the addresses to `backend/.env`:
```env
TRIP_REGISTRY_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
PAYMENT_ESCROW_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
CARBON_CREDITS_ADDRESS=0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
```

### Step 3: Update Frontend .env

Copy the addresses to `frontend/.env`:
```env
REACT_APP_TRIP_REGISTRY_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
REACT_APP_PAYMENT_ESCROW_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
REACT_APP_CARBON_CREDITS_ADDRESS=0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
```

---

## 📝 Default Values (Local Development)

### Hardhat Default Account
- **Address**: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
- **Private Key**: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
- **Balance**: 10,000 ETH (on local node)

### Test Accounts (Hardhat)
- Account 1: `0x70997970C51812dc3A010C7d01b50e0d17dc79C8`
- Account 2: `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC`

---

## 🌐 Network Chain IDs

| Network | Chain ID | RPC URL Example |
|---------|----------|----------------|
| Local Hardhat | 1337 | http://localhost:8545 |
| Sepolia | 11155111 | https://sepolia.infura.io/v3/... |
| Mainnet | 1 | https://mainnet.infura.io/v3/... |

---

## ⚠️ Security Reminders

1. ✅ **Never commit `.env` files**
2. ✅ **Use different keys for testnet/mainnet**
3. ✅ **Never share private keys**
4. ✅ **Rotate keys regularly**

---

See `ENV_VARIABLES.md` for detailed explanations.

