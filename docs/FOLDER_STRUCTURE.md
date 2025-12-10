# DecentraLogix Folder Structure

## Complete Folder Tree

```
DecentraLogix/
├── .gitignore                          # Git ignore rules
├── README.md                           # Project overview
│
├── smart-contracts/                    # Smart Contracts Layer
│   ├── .gitignore
│   ├── package.json                    # Dependencies & scripts
│   ├── hardhat.config.js               # Hardhat configuration
│   ├── README.md                       # Smart contracts documentation
│   │
│   ├── contracts/                      # Solidity source files
│   │   ├── core/                       # Core business logic contracts
│   │   │   ├── LogisticsCore.sol       # (To be created)
│   │   │   ├── PaymentEscrow.sol       # (To be created)
│   │   │   └── StakeholderRegistry.sol # (To be created)
│   │   │
│   │   ├── interfaces/                 # Contract interfaces
│   │   │   └── ILogistics.sol          # (To be created)
│   │   │
│   │   └── libraries/                  # Reusable libraries
│   │       └── LogisticsLib.sol        # (To be created)
│   │
│   ├── scripts/                        # Deployment scripts
│   │   └── deploy.js                   # (To be created)
│   │
│   └── test/                           # Test files
│       └── LogisticsCore.test.js       # (To be created)
│
├── backend/                            # Backend API Layer
│   ├── .gitignore
│   ├── package.json                    # Dependencies & scripts
│   ├── README.md                       # Backend documentation
│   │
│   └── src/                            # Source code
│       ├── server.js                   # Main server entry point (To be created)
│       │
│       ├── config/                     # Configuration files
│       │   ├── database.js             # (To be created)
│       │   └── blockchain.js           # (To be created)
│       │
│       ├── routes/                     # API route handlers
│       │   ├── index.js                # (To be created)
│       │   ├── shipments.js            # (To be created)
│       │   └── ipfs.js                 # (To be created)
│       │
│       ├── controllers/                # Business logic controllers
│       │   ├── shipmentController.js   # (To be created)
│       │   └── ipfsController.js       # (To be created)
│       │
│       ├── services/                   # Service layer
│       │   ├── blockchain/             # Blockchain services
│       │   │   ├── contractService.js  # (To be created)
│       │   │   └── eventIndexer.js     # (To be created)
│       │   │
│       │   ├── ipfs/                   # IPFS services
│       │   │   └── ipfsService.js      # (To be created)
│       │   │
│       │   └── cache/                  # Caching services (optional)
│       │       └── firebaseService.js  # (To be created)
│       │
│       ├── middleware/                 # Express middleware
│       │   ├── errorHandler.js         # (To be created)
│       │   ├── validator.js            # (To be created)
│       │   └── rateLimiter.js          # (To be created)
│       │
│       ├── utils/                      # Utility functions
│       │   ├── logger.js               # (To be created)
│       │   └── helpers.js              # (To be created)
│       │
│       └── models/                     # Data models
│           └── shipment.js             # (To be created)
│
├── frontend/                           # Frontend Web3 UI Layer
│   ├── .gitignore
│   ├── package.json                    # Dependencies & scripts
│   ├── README.md                       # Frontend documentation
│   │
│   ├── public/                         # Static assets
│   │   ├── index.html                  # (To be created)
│   │   └── favicon.ico                 # (To be created)
│   │
│   └── src/                            # Source code
│       ├── index.js                    # Entry point (To be created)
│       ├── App.js                      # Main app component (To be created)
│       │
│       ├── components/                 # Reusable components
│       │   ├── common/                 # Common UI components
│       │   │   ├── Button.js           # (To be created)
│       │   │   ├── Card.js             # (To be created)
│       │   │   └── Modal.js            # (To be created)
│       │   │
│       │   ├── wallet/                 # Wallet connection components
│       │   │   ├── WalletConnect.js    # (To be created)
│       │   │   └── WalletInfo.js       # (To be created)
│       │   │
│       │   └── shipment/               # Shipment-related components
│       │       ├── ShipmentCard.js     # (To be created)
│       │       ├── ShipmentForm.js     # (To be created)
│       │       └── ShipmentTracker.js  # (To be created)
│       │
│       ├── pages/                      # Page components
│       │   ├── Home.js                 # (To be created)
│       │   ├── Dashboard.js            # (To be created)
│       │   ├── CreateShipment.js       # (To be created)
│       │   └── ShipmentDetails.js      # (To be created)
│       │
│       ├── hooks/                      # Custom React hooks
│       │   ├── useWeb3.js              # (To be created)
│       │   ├── useContract.js          # (To be created)
│       │   └── useShipments.js         # (To be created)
│       │
│       ├── services/                   # API and contract services
│       │   ├── api.js                  # Backend API client (To be created)
│       │   └── contracts.js            # Contract interaction logic (To be created)
│       │
│       ├── utils/                      # Utility functions
│       │   ├── formatters.js           # (To be created)
│       │   └── validators.js           # (To be created)
│       │
│       ├── context/                    # React context providers
│       │   └── Web3Context.js          # (To be created)
│       │
│       ├── styles/                     # Global styles
│       │   └── index.css               # (To be created)
│       │
│       └── config/                     # Configuration files
│           ├── constants.js            # (To be created)
│           └── contracts.js            # Contract ABIs & addresses (To be created)
│
└── docs/                               # Documentation
    ├── ARCHITECTURE.md                 # System architecture explanation
    ├── LEARNING.md                     # Learning resources & concepts
    ├── SETUP.md                        # Setup instructions
    └── FOLDER_STRUCTURE.md             # This file
```

## Directory Descriptions

### Smart Contracts (`smart-contracts/`)

**Purpose**: Contains all Solidity smart contracts and Hardhat configuration.

**Key Directories**:
- `contracts/core/`: Main business logic contracts
- `contracts/interfaces/`: Contract interfaces for abstraction
- `contracts/libraries/`: Reusable Solidity libraries
- `scripts/`: Deployment and utility scripts
- `test/`: Hardhat test files

**Build Output**: Compiled contracts go to `artifacts/`, type definitions to `typechain-types/`

### Backend (`backend/`)

**Purpose**: Node.js API server that bridges blockchain and frontend.

**Key Directories**:
- `src/routes/`: Express route definitions
- `src/controllers/`: Request handlers with business logic
- `src/services/`: Service layer (blockchain, IPFS, cache)
- `src/middleware/`: Express middleware (auth, validation, etc.)
- `src/utils/`: Helper functions

**Key Files**:
- `src/server.js`: Main entry point, starts Express server

### Frontend (`frontend/`)

**Purpose**: React application for user interface.

**Key Directories**:
- `src/components/`: Reusable React components
- `src/pages/`: Full page components
- `src/hooks/`: Custom React hooks (Web3, contracts)
- `src/services/`: API clients and contract interaction
- `src/context/`: React Context for global state

**Key Files**:
- `src/index.js`: React entry point
- `src/App.js`: Main app component with routing

### Documentation (`docs/`)

**Purpose**: Project documentation and learning resources.

**Files**:
- `ARCHITECTURE.md`: System design and communication flow
- `LEARNING.md`: Educational content for Web3 development
- `SETUP.md`: Installation and setup instructions
- `FOLDER_STRUCTURE.md`: This file

## File Naming Conventions

- **Smart Contracts**: PascalCase (e.g., `LogisticsCore.sol`)
- **JavaScript/React**: camelCase (e.g., `shipmentController.js`)
- **Config Files**: lowercase (e.g., `hardhat.config.js`)
- **Documentation**: UPPERCASE (e.g., `README.md`)

## Next Steps

1. Review the architecture in `docs/ARCHITECTURE.md`
2. Read learning materials in `docs/LEARNING.md`
3. Follow setup instructions in `docs/SETUP.md`
4. Begin Phase 2 implementation

