# DecentraLogix Setup Guide

## Prerequisites

Before setting up DecentraLogix, ensure you have:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Git**
- **MetaMask** browser extension (for frontend testing)
- **Infura** or **Alchemy** account (for RPC endpoints)

## Initial Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd DecentraLogix
```

### 2. Smart Contracts Setup

```bash
cd smart-contracts
npm install
```

Create `.env` file:
```env
PRIVATE_KEY=your_private_key_here
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
ETHERSCAN_API_KEY=your_etherscan_api_key
```

### 3. Backend Setup

```bash
cd ../backend
npm install
```

Create `.env` file:
```env
PORT=3001
NODE_ENV=development
RPC_URL=http://localhost:8545
CONTRACT_ADDRESS=0x...
PRIVATE_KEY=0x...
IPFS_API_URL=https://ipfs.infura.io:5001
IPFS_PROJECT_ID=your_ipfs_project_id
IPFS_PROJECT_SECRET=your_ipfs_project_secret
```

### 4. Frontend Setup

```bash
cd ../frontend
npm install
```

Create `.env` file:
```env
REACT_APP_API_URL=http://localhost:3001
REACT_APP_CONTRACT_ADDRESS=0x...
REACT_APP_CHAIN_ID=11155111
REACT_APP_WALLET_CONNECT_PROJECT_ID=your_project_id
```

## Running the Application

### Development Mode

**Terminal 1 - Smart Contracts (Local Node)**:
```bash
cd smart-contracts
npm run node
```

**Terminal 2 - Deploy Contracts**:
```bash
cd smart-contracts
npm run deploy:local
# Copy the deployed contract address
```

**Terminal 3 - Backend**:
```bash
cd backend
npm run dev
```

**Terminal 4 - Frontend**:
```bash
cd frontend
npm start
```

### Production Build

**Smart Contracts**:
```bash
cd smart-contracts
npm run compile
npm run deploy:sepolia  # or mainnet
```

**Backend**:
```bash
cd backend
npm start
```

**Frontend**:
```bash
cd frontend
npm run build
# Deploy build/ folder to hosting service
```

## Testing

### Smart Contracts
```bash
cd smart-contracts
npm test
```

### Backend
```bash
cd backend
npm test
```

### Frontend
```bash
cd frontend
npm test
```

## Troubleshooting

### Common Issues

1. **Port already in use**: Change PORT in backend `.env`
2. **Contract not found**: Ensure contract is deployed and address is correct
3. **RPC errors**: Check RPC URL and network connectivity
4. **IPFS upload fails**: Verify IPFS credentials

## Next Steps

See [ARCHITECTURE.md](./ARCHITECTURE.md) for system design and [LEARNING.md](./LEARNING.md) for educational resources.

