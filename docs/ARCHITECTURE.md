# DecentraLogix Architecture

## System Overview

DecentraLogix is a Web3-powered logistics platform that leverages blockchain technology to create a transparent, trustless, and decentralized logistics ecosystem. The platform consists of three main layers that work together to provide a complete solution.

## Architecture Layers

### 1. Smart Contracts Layer (Blockchain)

**Location**: `smart-contracts/`

**Technology Stack**:
- Solidity (smart contract language)
- Hardhat (development environment)
- OpenZeppelin (security libraries)

**Responsibilities**:
- Core business logic on-chain
- Shipment lifecycle management
- Payment escrow and settlements
- Stakeholder permissions and roles
- Immutable event logging

**Key Contracts** (to be implemented):
- `LogisticsCore.sol`: Main contract managing shipments
- `PaymentEscrow.sol`: Handles payment escrow functionality
- `StakeholderRegistry.sol`: Manages user roles (shipper, carrier, receiver)

### 2. Backend API Layer

**Location**: `backend/`

**Technology Stack**:
- Node.js with Express
- Ethers.js (blockchain interaction)
- IPFS HTTP Client (decentralized storage)

**Responsibilities**:
- Bridge between blockchain and frontend
- Event indexing and data aggregation
- IPFS file upload/download management
- API endpoints for frontend consumption
- Optional caching layer (Firebase)

**Key Services**:
- **Blockchain Service**: Listens to contract events, queries contract state
- **IPFS Service**: Handles document uploads (bills of lading, invoices, etc.)
- **API Routes**: RESTful endpoints for shipment data, user operations
- **Event Indexer**: Processes blockchain events and stores relevant data

### 3. Frontend Web3 UI Layer

**Location**: `frontend/`

**Technology Stack**:
- React (UI framework)
- Ethers.js (Web3 interactions)
- Wagmi (React hooks for Ethereum)
- Web3Modal (wallet connection)

**Responsibilities**:
- User interface and experience
- Wallet connection and management
- Direct smart contract interactions
- Real-time shipment tracking
- Payment and transaction management

**Key Features**:
- Wallet connection (MetaMask, WalletConnect, etc.)
- Shipment creation and management
- Real-time status updates
- Transaction history
- Analytics dashboard

## Communication Flow

### Smart Contracts ↔ Backend

1. **Event Listening**: Backend uses Ethers.js to listen to contract events
   - When a shipment is created, updated, or completed, events are emitted
   - Backend indexes these events and stores aggregated data

2. **Contract Queries**: Backend can query contract state
   - Read-only operations (get shipment details, check balances)
   - No gas costs for read operations

3. **IPFS Integration**: 
   - Documents stored on IPFS (hash stored on-chain)
   - Backend handles IPFS uploads/downloads
   - Contract stores IPFS hash for document verification

### Backend ↔ Frontend

1. **REST API**: Frontend makes HTTP requests to backend
   - `GET /api/shipments` - List all shipments
   - `GET /api/shipments/:id` - Get shipment details
   - `POST /api/ipfs/upload` - Upload document to IPFS
   - `GET /api/ipfs/:hash` - Retrieve document from IPFS

2. **Real-time Updates**: 
   - Backend can provide WebSocket or polling endpoints
   - Frontend polls for updates or uses WebSocket for real-time data

### Frontend ↔ Smart Contracts (Direct)

1. **Direct Contract Interaction**: Frontend uses Ethers.js to interact directly with contracts
   - Write operations (create shipment, update status, make payments)
   - Requires user wallet connection
   - User signs transactions with their wallet

2. **Read Operations**: 
   - Can read directly from contracts (via RPC)
   - Or use backend API for aggregated/cached data

## Data Flow Example: Creating a Shipment

1. **User Action**: User fills out shipment form in frontend
2. **Document Upload**: Frontend uploads documents (BOL, etc.) to backend
3. **IPFS Storage**: Backend uploads documents to IPFS, receives hash
4. **Transaction Initiation**: Frontend prepares transaction to create shipment on-chain
5. **User Approval**: User approves transaction in wallet (MetaMask, etc.)
6. **Blockchain Execution**: Transaction is sent to blockchain
7. **Event Emission**: Smart contract emits `ShipmentCreated` event
8. **Backend Indexing**: Backend listens to event, indexes data
9. **Frontend Update**: Frontend receives confirmation, updates UI
10. **Data Aggregation**: Backend API now serves this shipment data to frontend

## Security Considerations

1. **Smart Contracts**: 
   - Use OpenZeppelin libraries for security
   - Comprehensive testing before deployment
   - Audit before mainnet deployment

2. **Backend**:
   - Rate limiting on API endpoints
   - Input validation (Joi)
   - Secure environment variable management
   - CORS configuration

3. **Frontend**:
   - Never store private keys
   - All transactions require user approval
   - Validate contract addresses
   - Handle transaction failures gracefully

## Scalability Considerations

1. **Blockchain**: 
   - Layer 2 solutions (Polygon, Arbitrum) for lower gas costs
   - Event indexing optimization
   - Batch operations where possible

2. **Backend**:
   - Database for event indexing (PostgreSQL/MongoDB)
   - Caching layer (Firebase/Redis)
   - Load balancing for high traffic

3. **Frontend**:
   - Code splitting
   - Lazy loading
   - Optimistic UI updates

## Deployment Architecture

### Development
- Local Hardhat node for blockchain
- Local backend server
- React development server

### Testnet
- Sepolia testnet for smart contracts
- Backend deployed to cloud (Heroku, AWS, etc.)
- Frontend deployed to Vercel/Netlify

### Production
- Mainnet deployment (Ethereum or L2)
- Production backend infrastructure
- CDN for frontend assets

