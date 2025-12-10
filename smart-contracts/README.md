# Smart Contracts Layer

## Overview
Solidity smart contracts for DecentraLogix logistics platform, compiled and deployed using Hardhat.

## Dependencies

### Core
- **Hardhat**: Development environment for Ethereum
- **@openzeppelin/contracts**: Secure, audited smart contract libraries
- **dotenv**: Environment variable management

### Development Tools
- **@nomicfoundation/hardhat-toolbox**: Complete Hardhat toolkit
- **solhint**: Solidity linter
- **prettier**: Code formatter
- **solidity-coverage**: Test coverage tool

## Build Commands

```bash
# Install dependencies
npm install

# Compile contracts
npm run compile

# Run tests
npm run test

# Start local Hardhat node
npm run node

# Deploy to local network
npm run deploy:local

# Deploy to testnet (Sepolia)
npm run deploy:sepolia

# Format code
npm run format

# Lint code
npm run lint
```

## Folder Structure

```
smart-contracts/
├── contracts/           # Solidity source files
│   ├── core/           # Core business logic contracts
│   ├── interfaces/     # Contract interfaces
│   └── libraries/      # Reusable libraries
├── scripts/            # Deployment and utility scripts
├── test/               # Test files
├── hardhat.config.js   # Hardhat configuration
└── package.json        # Dependencies
```

