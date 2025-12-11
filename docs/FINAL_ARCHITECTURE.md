# DecentraLogix Final Architecture

Complete architecture diagram and explanation of the deployed system.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         DecentraLogix Platform                          │
│                         (Production Deployment)                          │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
            ┌───────▼────────┐              ┌───────▼────────┐
            │   Frontend     │              │    Backend     │
            │   (Vercel)     │              │  (Render/      │
            │                │              │   Railway)     │
            │  React +       │              │  Node.js +     │
            │  Ethers.js     │              │  Express       │
            └───────┬────────┘              └───────┬────────┘
                    │                               │
                    │  HTTPS                       │  HTTPS
                    │  API Calls                   │  RPC Calls
                    │                               │
                    └───────────────┬───────────────┘
                                    │
                    ┌───────────────▼───────────────┐
                    │      Polygon Mumbai           │
                    │      (Testnet)                │
                    │                               │
                    │  ┌─────────────────────────┐ │
                    │  │   Smart Contracts       │ │
                    │  │                         │ │
                    │  │  ┌───────────────────┐  │ │
                    │  │  │  TripRegistry     │  │ │
                    │  │  │  (ERC721 NFT)     │  │ │
                    │  │  └───────────────────┘  │ │
                    │  │                         │ │
                    │  │  ┌───────────────────┐  │ │
                    │  │  │  PaymentEscrow    │  │ │
                    │  │  │  (Escrow)         │  │ │
                    │  │  └───────────────────┘  │ │
                    │  │                         │ │
                    │  │  ┌───────────────────┐  │ │
                    │  │  │  CarbonCredits    │  │ │
                    │  │  │  (ERC20 Token)    │  │ │
                    │  │  └───────────────────┘  │ │
                    │  └─────────────────────────┘ │
                    └───────────────┬───────────────┘
                                    │
                    ┌───────────────▼───────────────┐
                    │      IPFS Network             │
                    │  (Decentralized Storage)      │
                    │                               │
                    │  - Trip Metadata              │
                    │  - Delivery Proofs            │
                    │  - Documents                  │
                    └───────────────────────────────┘
                                    │
                    ┌───────────────▼───────────────┐
                    │      Users                    │
                    │                               │
                    │  - MetaMask Wallet            │
                    │  - Browser                    │
                    │  - Mobile Apps                │
                    └───────────────────────────────┘
```

## Component Details

### Frontend (Vercel)

**Technology**: React + Ethers.js

**Responsibilities**:
- User interface
- Wallet connection (MetaMask)
- Direct contract interactions
- API calls to backend

**URL**: `https://decentralogix-frontend.vercel.app`

**Features**:
- Trip creation form
- Trip details viewer
- Payment release
- Carbon credits dashboard
- Testing panel

---

### Backend (Render/Railway)

**Technology**: Node.js + Express + Ethers.js

**Responsibilities**:
- REST API endpoints
- Blockchain event indexing
- IPFS integration
- Data aggregation
- Optional caching (Firestore)

**URL**: `https://decentralogix-backend.onrender.com`

**Endpoints**:
- `POST /api/trip/create`
- `POST /api/trip/end`
- `GET /api/trip/:id`
- `POST /api/payment/release`
- `GET /api/carbon/credits/:wallet`

---

### Smart Contracts (Polygon Mumbai)

**Network**: Polygon Mumbai Testnet
**Chain ID**: 80001
**Explorer**: https://mumbai.polygonscan.com

#### TripRegistry
- **Type**: ERC721 NFT
- **Purpose**: Trip tokenization
- **Functions**: Create, Start, Complete, Cancel trips

#### PaymentEscrow
- **Type**: Escrow Contract
- **Purpose**: Conditional payments
- **Functions**: Create escrow, Release payment, Refund

#### CarbonCredits
- **Type**: ERC20 Token
- **Purpose**: Reward system
- **Functions**: Mint rewards, Burn credits, Track offset

---

## Data Flow

### 1. Trip Creation Flow

```
User (Frontend)
    │
    ├─> Fill Trip Form
    │
    ├─> Connect MetaMask
    │
    ├─> Sign Transaction
    │
    └─> Polygon Mumbai
            │
            ├─> TripRegistry.createTrip()
            │
            ├─> Mint NFT
            │
            ├─> Emit TripCreated Event
            │
            └─> Backend Indexes Event
                    │
                    └─> Store in Cache (Optional)
```

### 2. Payment Release Flow

```
User (Frontend)
    │
    ├─> Click Release Payment
    │
    ├─> Sign Transaction
    │
    └─> Polygon Mumbai
            │
            ├─> PaymentEscrow.releasePayment()
            │
            ├─> Transfer MATIC
            │
            └─> Emit PaymentReleased Event
```

### 3. Carbon Credits Flow

```
Trip Completed
    │
    ├─> Backend Detects Event
    │
    ├─> Calculate Carbon Offset
    │
    └─> Polygon Mumbai
            │
            ├─> CarbonCredits.mintReward()
            │
            ├─> Mint Tokens
            │
            └─> User Sees Balance (Frontend)
```

---

## Network Architecture

```
Internet
    │
    ├─> Vercel CDN
    │       │
    │       └─> Frontend (Static Files)
    │
    ├─> Render/Railway
    │       │
    │       └─> Backend API (Node.js)
    │               │
    │               ├─> Polygon RPC
    │               │
    │               └─> IPFS Gateway
    │
    └─> Polygon Mumbai Network
            │
            ├─> Validators
            │
            └─> Smart Contracts
```

---

## Security Architecture

```
┌─────────────────────────────────────┐
│         Security Layers              │
├─────────────────────────────────────┤
│                                     │
│  1. HTTPS (TLS)                     │
│     - All traffic encrypted          │
│                                     │
│  2. Wallet Security                 │
│     - Private keys in MetaMask      │
│     - User approves transactions    │
│                                     │
│  3. Smart Contract Security         │
│     - OpenZeppelin libraries        │
│     - Access control                │
│     - Reentrancy protection         │
│                                     │
│  4. Backend Security                │
│     - Rate limiting                 │
│     - Input validation              │
│     - CORS configuration           │
│                                     │
│  5. Environment Variables           │
│     - Secrets in env vars           │
│     - Never in code                 │
│                                     │
└─────────────────────────────────────┘
```

---

## Deployment Architecture

```
GitHub Repository
    │
    ├─> Frontend Branch
    │       │
    │       └─> Vercel (Auto-deploy)
    │
    ├─> Backend Branch
    │       │
    │       └─> Render/Railway (Auto-deploy)
    │
    └─> Smart Contracts
            │
            └─> Manual Deployment
                    │
                    └─> Polygon Mumbai
```

---

## Monitoring & Observability

```
┌─────────────────────────────────────┐
│      Monitoring Stack                │
├─────────────────────────────────────┤
│                                     │
│  Frontend:                          │
│  - Vercel Analytics                 │
│  - Error tracking                   │
│                                     │
│  Backend:                           │
│  - Render/Railway Logs             │
│  - Winston logging                  │
│  - Health check endpoint            │
│                                     │
│  Blockchain:                        │
│  - Polygonscan Explorer             │
│  - Event monitoring                 │
│  - Transaction tracking            │
│                                     │
└─────────────────────────────────────┘
```

---

## Scalability Considerations

### Current Setup (MVP)
- Single backend instance
- Static frontend
- Direct blockchain queries

### Future Enhancements
- Database for event indexing
- Redis caching layer
- Load balancing
- CDN for static assets
- Layer 2 solutions for lower gas

---

## Technology Stack Summary

| Layer | Technology | Hosting |
|-------|-----------|---------|
| Frontend | React + Ethers.js | Vercel |
| Backend | Node.js + Express | Render/Railway |
| Blockchain | Solidity + Hardhat | Polygon Mumbai |
| Storage | IPFS | Decentralized |
| Cache | Firestore (Optional) | Firebase |

---

## URLs & Endpoints

### Production URLs

**Frontend**: `https://decentralogix-frontend.vercel.app`

**Backend API**: `https://decentralogix-backend.onrender.com/api`

**Blockchain Explorer**: `https://mumbai.polygonscan.com`

### API Endpoints

- `GET /api/health` - Health check
- `POST /api/trip/create` - Create trip
- `POST /api/trip/end` - Complete trip
- `GET /api/trip/:id` - Get trip
- `POST /api/payment/release` - Release payment
- `GET /api/carbon/credits/:wallet` - Get carbon credits

---

## Network Configuration

### Polygon Mumbai Testnet

- **Network Name**: Polygon Mumbai
- **RPC URL**: `https://rpc-mumbai.maticvigil.com`
- **Chain ID**: `80001`
- **Currency**: MATIC
- **Explorer**: `https://mumbai.polygonscan.com`

### MetaMask Setup

Users need to add Polygon Mumbai network:
1. Open MetaMask
2. Settings → Networks → Add Network
3. Enter network details above
4. Save and switch to network

---

## Complete System Flow

```
┌──────────┐
│  User    │
└────┬─────┘
     │
     │ 1. Opens Frontend (Vercel)
     ▼
┌─────────────────┐
│  React App      │
│  (Frontend)     │
└────┬────────────┘
     │
     │ 2. Connects MetaMask
     ▼
┌─────────────────┐
│  MetaMask       │
│  Wallet         │
└────┬────────────┘
     │
     │ 3. Creates Trip
     ▼
┌─────────────────┐
│  Polygon Mumbai │
│  Blockchain     │
│                 │
│  TripRegistry   │
│  creates NFT    │
└────┬────────────┘
     │
     │ 4. Emits Event
     ▼
┌─────────────────┐
│  Backend API    │
│  (Render)       │
│                 │
│  Indexes Event  │
│  Caches Data    │
└────┬────────────┘
     │
     │ 5. Returns Data
     ▼
┌─────────────────┐
│  Frontend       │
│  Displays Trip  │
└─────────────────┘
```

---

## Cost Breakdown

### Monthly Costs (Production)

| Service | Cost | Notes |
|---------|------|-------|
| Vercel | $0-20 | Free tier available |
| Render | $0-7 | Free tier with limitations |
| Railway | $5-20 | Pay-as-you-go |
| Polygon | ~$0.01/tx | Very low fees |
| IPFS | Free | Public gateways |

**Total**: ~$5-50/month depending on usage

---

## Performance Metrics

### Expected Performance

- **Frontend Load**: < 2 seconds
- **API Response**: < 500ms
- **Blockchain Query**: 1-3 seconds
- **Transaction Confirmation**: 2-5 seconds (Polygon)

### Optimization

- Frontend: Code splitting, lazy loading
- Backend: Caching, connection pooling
- Blockchain: Event indexing, batch queries

---

## Disaster Recovery

### Backup Strategy

1. **Smart Contracts**: Immutable on blockchain
2. **Backend Data**: Firestore backups (if used)
3. **Configuration**: Version controlled in Git

### Recovery Plan

1. Contracts: Redeploy if needed
2. Backend: Redeploy from Git
3. Frontend: Redeploy from Git
4. Data: Restore from blockchain events

---

## Future Enhancements

### Phase 2 Features

- [ ] Multi-chain support
- [ ] Advanced analytics
- [ ] Mobile app
- [ ] Dispute resolution
- [ ] Insurance integration
- [ ] Real-time tracking

---

**Architecture Complete! System ready for production deployment! 🚀**

