# Frontend Web3 UI Layer

## Overview
React-based frontend application for interacting with the DecentraLogix platform. Connects to user wallets and interacts with smart contracts via Ethers.js.

## Dependencies

### Core
- **React**: UI framework
- **react-router-dom**: Client-side routing
- **ethers**: Ethereum library for Web3 interactions
- **wagmi**: React hooks for Ethereum
- **viem**: TypeScript Ethereum library (used by wagmi)
- **@web3modal/react**: Web3Modal for wallet connections

### UI & Utilities
- **axios**: HTTP client for API calls
- **recharts**: Charting library for analytics
- **react-hot-toast**: Toast notifications
- **date-fns**: Date formatting utilities

## Build & Run Commands

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format
```

## Folder Structure

```
frontend/
├── public/              # Static assets
├── src/
│   ├── App.js          # Main app component
│   ├── index.js        # Entry point
│   ├── components/     # Reusable components
│   │   ├── common/     # Common UI components
│   │   ├── wallet/     # Wallet connection components
│   │   └── shipment/   # Shipment-related components
│   ├── pages/          # Page components
│   ├── hooks/          # Custom React hooks
│   │   ├── useWeb3.js  # Web3 connection hook
│   │   └── useContract.js # Contract interaction hook
│   ├── services/       # API and contract services
│   │   ├── api.js      # Backend API client
│   │   └── contracts.js # Contract interaction logic
│   ├── utils/          # Utility functions
│   ├── context/        # React context providers
│   │   └── Web3Context.js
│   ├── styles/         # Global styles
│   └── config/         # Configuration files
└── package.json
```

## Environment Variables

```env
REACT_APP_API_URL=http://localhost:3001
REACT_APP_CONTRACT_ADDRESS=0x...
REACT_APP_CHAIN_ID=11155111
REACT_APP_WALLET_CONNECT_PROJECT_ID=...
```

