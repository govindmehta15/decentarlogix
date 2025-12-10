# Backend API Layer

## Overview
Node.js backend API that bridges the blockchain and frontend, handles IPFS operations, and provides data aggregation services.

## Dependencies

### Core Framework
- **Express**: Web application framework
- **ethers**: Ethereum library for interacting with smart contracts
- **ipfs-http-client**: IPFS client for file storage and retrieval

### Security & Middleware
- **helmet**: Security headers
- **cors**: Cross-origin resource sharing
- **express-rate-limit**: Rate limiting
- **joi**: Input validation

### Utilities
- **winston**: Logging
- **compression**: Response compression
- **dotenv**: Environment variables

### Optional
- **firebase-admin**: Firebase integration for caching (optional)

## Build & Run Commands

```bash
# Install dependencies
npm install

# Start production server
npm start

# Start development server (with hot reload)
npm run dev

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format
```

## Folder Structure

```
backend/
├── src/
│   ├── server.js           # Main server entry point
│   ├── config/             # Configuration files
│   ├── routes/             # API route handlers
│   ├── controllers/        # Business logic controllers
│   ├── services/           # Service layer
│   │   ├── blockchain/     # Blockchain interaction services
│   │   ├── ipfs/           # IPFS services
│   │   └── cache/          # Caching services (Firebase optional)
│   ├── middleware/         # Express middleware
│   ├── utils/              # Utility functions
│   └── models/             # Data models
├── tests/                  # Test files
└── package.json
```

## Environment Variables

```env
PORT=3001
NODE_ENV=development
RPC_URL=http://localhost:8545
CONTRACT_ADDRESS=0x...
PRIVATE_KEY=0x...
IPFS_API_URL=https://ipfs.infura.io:5001
IPFS_PROJECT_ID=...
IPFS_PROJECT_SECRET=...
FIREBASE_PROJECT_ID=... (optional)
```

