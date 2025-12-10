# DecentraLogix Backend API

Node.js backend API for interacting with DecentraLogix smart contracts.

## Features

- RESTful API endpoints
- Blockchain integration with Ethers.js
- Optional Firestore caching
- Event listening and indexing
- Comprehensive error handling
- Request validation
- Rate limiting
- Logging

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

Required environment variables:
- `RPC_URL`: Blockchain RPC endpoint
- `PRIVATE_KEY`: Private key for signing transactions
- `TRIP_REGISTRY_ADDRESS`: Deployed TripRegistry contract address
- `PAYMENT_ESCROW_ADDRESS`: Deployed PaymentEscrow contract address
- `CARBON_CREDITS_ADDRESS`: Deployed CarbonCredits contract address

Optional:
- `FIREBASE_PROJECT_ID`: Firebase project ID for caching
- `FIREBASE_SERVICE_ACCOUNT`: Firebase service account JSON

### 3. Update Contract Addresses

After deploying contracts, update the addresses in `.env`:

```env
TRIP_REGISTRY_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
PAYMENT_ESCROW_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
CARBON_CREDITS_ADDRESS=0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
```

### 4. Run Server

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

Server will start on `http://localhost:3001`

## API Endpoints

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete API documentation.

### Quick Reference

- `POST /api/trip/create` - Create a new trip
- `POST /api/trip/end` - Complete a trip
- `GET /api/trip/:id` - Get trip by ID
- `POST /api/payment/release` - Release payment
- `GET /api/carbon/credits/:wallet` - Get carbon credits

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── blockchain.js      # Blockchain configuration
│   ├── controllers/
│   │   ├── tripController.js   # Trip endpoints
│   │   ├── paymentController.js # Payment endpoints
│   │   └── carbonController.js  # Carbon credits endpoints
│   ├── routes/
│   │   ├── tripRoutes.js       # Trip routes
│   │   ├── paymentRoutes.js    # Payment routes
│   │   ├── carbonRoutes.js     # Carbon routes
│   │   └── index.js            # Route aggregator
│   ├── services/
│   │   ├── blockchain/
│   │   │   └── contractService.js # Contract interaction services
│   │   └── cache/
│   │       └── firestoreService.js # Firestore caching
│   ├── middleware/
│   │   ├── errorHandler.js     # Error handling
│   │   └── validator.js        # Input validation
│   ├── utils/
│   │   └── logger.js           # Winston logger
│   └── server.js              # Express server
├── tests/                      # Test files
└── package.json
```

## Development

### Adding New Endpoints

1. Create controller in `src/controllers/`
2. Create route in `src/routes/`
3. Add route to `src/routes/index.js`

### Testing

```bash
npm test
```

### Linting

```bash
npm run lint
```

## Environment Variables

See `.env.example` for all available environment variables.

## Security Notes

- Never commit `.env` file
- Keep private keys secure
- Use environment variables for all secrets
- Enable rate limiting in production
- Add authentication for production

## Troubleshooting

### Connection Issues

If you get connection errors:
1. Check RPC_URL is correct
2. Ensure blockchain node is running
3. Verify network connectivity

### Contract Errors

If contract calls fail:
1. Verify contract addresses are correct
2. Check contract is deployed on the network
3. Ensure private key has sufficient funds for gas

## Learning Resources

See [docs/WEB3_BACKEND.md](../docs/WEB3_BACKEND.md) for detailed learning guide on Web3 backend integration.
