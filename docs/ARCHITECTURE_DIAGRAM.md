# DecentraLogix Final Architecture Diagram

## Complete System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          DecentraLogix Platform                             │
│                         (Production Deployment)                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
            ┌───────▼────────┐              ┌───────▼────────┐
            │   Frontend     │              │    Backend     │
            │   (Vercel)     │              │  (Render/      │
            │                │              │   Railway)     │
            │  ┌──────────┐  │              │  ┌──────────┐  │
            │  │  React   │  │              │  │  Express │  │
            │  │  App     │  │              │  │  API     │  │
            │  └──────────┘  │              │  └──────────┘  │
            │                │              │                │
            │  - Wallet      │              │  - Event      │
            │    Connect     │              │    Indexing    │
            │  - Trip Form   │              │  - IPFS       │
            │  - Dashboard   │              │  - Caching    │
            └───────┬────────┘              └───────┬────────┘
                    │                               │
                    │  HTTPS                        │  HTTPS
                    │  API Calls                    │  RPC Calls
                    │                               │
                    └───────────────┬───────────────┘
                                    │
                    ┌───────────────▼───────────────┐
                    │      Polygon Mumbai           │
                    │      Testnet (Chain ID: 80001) │
                    │                               │
                    │  ┌─────────────────────────┐ │
                    │  │   Smart Contracts        │ │
                    │  │                         │ │
                    │  │  ┌───────────────────┐  │ │
                    │  │  │  TripRegistry     │  │ │
                    │  │  │  (ERC721 NFT)     │  │ │
                    │  │  │                   │  │ │
                    │  │  │  - createTrip()   │  │ │
                    │  │  │  - startTrip()    │  │ │
                    │  │  │  - completeTrip() │  │ │
                    │  │  └───────────────────┘  │ │
                    │  │                         │ │
                    │  │  ┌───────────────────┐  │ │
                    │  │  │  PaymentEscrow    │  │ │
                    │  │  │  (Escrow)         │  │ │
                    │  │  │                   │  │ │
                    │  │  │  - createEscrow() │  │ │
                    │  │  │  - releasePayment()│ │ │
                    │  │  │  - refundPayment()│ │ │
                    │  │  └───────────────────┘  │ │
                    │  │                         │ │
                    │  │  ┌───────────────────┐  │ │
                    │  │  │  CarbonCredits    │  │ │
                    │  │  │  (ERC20 Token)    │  │ │
                    │  │  │                   │  │ │
                    │  │  │  - mintReward()   │  │ │
                    │  │  │  - burnCredits()  │  │ │
                    │  │  └───────────────────┘  │ │
                    │  └─────────────────────────┘ │
                    │                               │
                    │  Events:                      │
                    │  - TripCreated               │
                    │  - PaymentReleased           │
                    │  - CarbonCreditsMinted        │
                    └───────────────┬───────────────┘
                                    │
                    ┌───────────────▼───────────────┐
                    │      IPFS Network             │
                    │  (Decentralized Storage)       │
                    │                               │
                    │  - Trip Metadata              │
                    │  - Delivery Proofs            │
                    │  - Documents                  │
                    │  - Images                     │
                    └───────────────────────────────┘
                                    │
                    ┌───────────────▼───────────────┐
                    │      Users                    │
                    │                               │
                    │  ┌─────────────────────────┐ │
                    │  │  MetaMask Wallet        │ │
                    │  │  - Sign Transactions    │ │
                    │  │  - Approve Operations   │ │
                    │  └─────────────────────────┘ │
                    │                               │
                    │  Browser / Mobile App         │
                    └───────────────────────────────┘
```

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Repository                        │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │  Frontend    │  │   Backend    │  │  Contracts   │       │
│  │  (React)     │  │  (Node.js)   │  │  (Solidity)  │       │
│  └──────┬───────┘  └──────┬───────┘  └─────--─┬─────┘       │
└─────────┼──────────────────┼──────────────────┼─────────────┘
          │                  │                  │
          │ Auto-deploy      │ Auto-deploy      │ Manual
          │                  │                  │
    ┌─────▼─────┐      ┌─────▼─────┐      ┌─────▼─────┐
    │  Vercel   │      │  Render/  │      │  Polygon  │
    │           │      │  Railway  │      │  Mumbai   │
    │  - CDN    │      │           │      │           │
    │  - HTTPS  │      │  - HTTPS  │      │  - RPC    │
    │  - Auto   │      │  - Logs   │      │  - Blocks │
    │    Deploy │      │  - Auto   │      │  - Events │
    │           │      │    Deploy │      │           │
    └───────────┘      └───────────┘      └───────────┘
```

## Data Flow: Complete Trip Lifecycle

```
┌──────────┐
│  User    │
└────┬─────┘
     │
     │ 1. Opens Frontend
     ▼
┌─────────────────┐
│  Vercel         │
│  (Frontend)     │
│                 │
│  - React App    │
│  - Static Files │
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
     │    (Signs Transaction)
     ▼
┌─────────────────┐
│  Polygon Mumbai │
│  Blockchain     │
│                 │
│  TripRegistry   │
│  .createTrip()  │
│                 │
│  ┌───────────┐  │
│  │ Mint NFT  │  │
│  └───────────┘  │
│                 │
│  Emit Event:    │
│  TripCreated    │
└────┬────────────┘
     │
     │ 4. Event Emitted
     ▼
┌─────────────────┐
│  Render/Railway │
│  (Backend)      │
│                 │
│  - Listens to   │
│    Events       │
│  - Indexes Data │
│  - Caches in    │
│    Firestore    │
└────┬────────────┘
     │
     │ 5. API Response
     ▼
┌─────────────────┐
│  Frontend       │
│  Displays Trip  │
└─────────────────┘
```

## Network Topology

```
Internet
    │
    ├─> Cloudflare CDN (Vercel)
    │       │
    │       └─> Frontend (Static)
    │
    ├─> Render/Railway Load Balancer
    │       │
    │       └─> Backend API (Node.js)
    │               │
    │               ├─> Polygon RPC Node
    │               │       │
    │               │       └─> Polygon Mumbai Network
    │               │               │
    │               │               └─> Smart Contracts
    │               │
    │               └─> IPFS Gateway
    │                       │
    │                       └─> IPFS Network
    │
    └─> User Devices
            │
            ├─> Browser (MetaMask)
            └─> Mobile App (WalletConnect)
```

## Security Layers

```
┌─────────────────────────────────────────┐
│         Security Architecture            │
├─────────────────────────────────────────┤
│                                         │
│  Layer 1: Transport Security            │
│  ┌───────────────────────────────────┐  │
│  │  HTTPS/TLS (All Traffic)          │  │
│  │  - Vercel: Automatic              │  │
│  │  - Render/Railway: Automatic     │  │
│  └───────────────────────────────────┘  │
│                                         │
│  Layer 2: Application Security          │
│  ┌───────────────────────────────────┐  │
│  │  Frontend:                        │  │
│  │  - Input Validation               │  │
│  │  - XSS Protection                 │  │
│  │                                    │  │
│  │  Backend:                          │  │
│  │  - Rate Limiting                  │  │
│  │  - CORS Configuration             │  │
│  │  - Input Validation (Joi)         │  │
│  │  - Helmet Security Headers        │  │
│  └───────────────────────────────────┘  │
│                                         │
│  Layer 3: Wallet Security                │
│  ┌───────────────────────────────────┐  │
│  │  MetaMask:                        │  │
│  │  - Private Key Never Exposed      │  │
│  │  - User Approves All Transactions │  │
│  │  - Transaction Signing            │  │
│  └───────────────────────────────────┘  │
│                                         │
│  Layer 4: Smart Contract Security       │
│  ┌───────────────────────────────────┐  │
│  │  - OpenZeppelin Libraries          │  │
│  │  - Access Control                 │  │
│  │  - Reentrancy Protection          │  │
│  │  - Input Validation               │  │
│  │  - Checks-Effects-Interactions    │  │
│  └───────────────────────────────────┘  │
│                                         │
│  Layer 5: Network Security              │
│  ┌───────────────────────────────────┐  │
│  │  Polygon Mumbai:                   │  │
│  │  - Proof of Stake                  │  │
│  │  - Validator Network              │  │
│  │  - Immutable Transactions         │  │
│  └───────────────────────────────────┘  │
│                                         │
└─────────────────────────────────────────┘
```

## Component Interaction Diagram

```
┌─────────────┐
│   User      │
└──────┬──────┘
       │
       │ Action: Create Trip
       ▼
┌─────────────────────────────────┐
│  Frontend (Vercel)              │
│  ┌───────────────────────────┐ │
│  │  TripForm Component       │ │
│  │  - Validates Input        │ │
│  │  - Prepares Transaction   │ │
│  └───────────┬───────────────┘ │
│              │                  │
│              │ Calls Contract   │
│              ▼                  │
│  ┌───────────────────────────┐ │
│  │  contractService.js       │ │
│  │  - createTrip()           │ │
│  └───────────┬───────────────┘ │
└──────────────┼──────────────────┘
               │
               │ MetaMask Popup
               ▼
┌─────────────────────────────────┐
│  MetaMask Wallet                │
│  - User Reviews Transaction     │
│  - User Approves                │
│  - Signs Transaction            │
└───────────┬─────────────────────┘
            │
            │ Signed Transaction
            ▼
┌─────────────────────────────────┐
│  Polygon Mumbai Network          │
│  ┌───────────────────────────┐  │
│  │  TripRegistry Contract    │  │
│  │  - Validates Input        │  │
│  │  - Creates Trip           │  │
│  │  - Mints NFT              │  │
│  │  - Emits TripCreated      │  │
│  └───────────┬───────────────┘  │
└──────────────┼───────────────────┘
               │
               │ Event: TripCreated
               ▼
┌─────────────────────────────────┐
│  Backend (Render/Railway)       │
│  ┌───────────────────────────┐  │
│  │  Event Listener           │  │
│  │  - Detects TripCreated    │  │
│  │  - Extracts Data          │  │
│  └───────────┬───────────────┘  │
│              │                  │
│              │ Store Data       │
│              ▼                  │
│  ┌───────────────────────────┐  │
│  │  Firestore (Optional)    │  │
│  │  - Caches Trip Data      │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

## Technology Stack

```
┌─────────────────────────────────────────┐
│         Technology Stack                 │
├─────────────────────────────────────────┤
│                                         │
│  Frontend:                              │
│  ┌───────────────────────────────────┐  │
│  │  React 18                         │  │
│  │  Ethers.js 6                      │  │
│  │  React Router                     │  │
│  │  Recharts                         │  │
│  │  React Hot Toast                  │  │
│  └───────────────────────────────────┘  │
│                                         │
│  Backend:                                │
│  ┌───────────────────────────────────┐  │
│  │  Node.js 18+                      │  │
│  │  Express 4                        │  │
│  │  Ethers.js 6                      │  │
│  │  Winston (Logging)               │  │
│  │  Joi (Validation)                │  │
│  └───────────────────────────────────┘  │
│                                         │
│  Smart Contracts:                        │
│  ┌───────────────────────────────────┐  │
│  │  Solidity 0.8.20                  │  │
│  │  Hardhat 2                        │  │
│  │  OpenZeppelin 5                   │  │
│  └───────────────────────────────────┘  │
│                                         │
│  Blockchain:                             │
│  ┌───────────────────────────────────┐  │
│  │  Polygon Mumbai Testnet           │  │
│  │  Chain ID: 80001                  │  │
│  │  Currency: MATIC                  │  │
│  └───────────────────────────────────┘  │
│                                         │
│  Storage:                                │
│  ┌───────────────────────────────────┐  │
│  │  IPFS (Decentralized)             │  │
│  │  Firestore (Optional Cache)      │  │
│  └───────────────────────────────────┘  │
│                                         │
│  Hosting:                                │
│  ┌───────────────────────────────────┐  │
│  │  Vercel (Frontend)                │  │
│  │  Render/Railway (Backend)        │  │
│  │  Polygon Network (Contracts)      │  │
│  └───────────────────────────────────┘  │
│                                         │
└─────────────────────────────────────────┘
```

## URL Structure

```
Production URLs:
├── Frontend
│   └── https://decentralogix-frontend.vercel.app
│
├── Backend API
│   └── https://decentralogix-backend.onrender.com
│       ├── /api/health
│       ├── /api/trip/create
│       ├── /api/trip/:id
│       ├── /api/payment/release
│       └── /api/carbon/credits/:wallet
│
└── Blockchain
    └── https://mumbai.polygonscan.com
        ├── /address/<TripRegistry>
        ├── /address/<PaymentEscrow>
        └── /address/<CarbonCredits>
```

---

**Complete architecture ready for production! 🚀**

