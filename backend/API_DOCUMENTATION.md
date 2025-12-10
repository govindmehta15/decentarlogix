# DecentraLogix Backend API Documentation

## Base URL

```
http://localhost:3001/api
```

## Authentication

Currently, the API does not require authentication. In production, implement JWT or API key authentication.

## Endpoints

### Health Check

#### GET /health

Check if the API is running.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "service": "decentralogix-backend"
}
```

---

### Trip Management

#### POST /trip/create

Create a new trip on the blockchain.

**Request Body:**
```json
{
  "carrier": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "receiver": "0x8ba1f109551bD432803012645Hac136c22C929e",
  "originLocation": "New York, NY",
  "destinationLocation": "Los Angeles, CA",
  "distance": 4500,
  "estimatedCarbonFootprint": 1000,
  "ipfsMetadataHash": "QmHash123" // Optional
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "tripId": "1",
    "tokenId": "1",
    "txHash": "0x...",
    "blockNumber": 12345
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "Missing required fields",
  "required": ["carrier", "receiver", "originLocation", "destinationLocation", "distance", "estimatedCarbonFootprint"]
}
```

---

#### POST /trip/end

Complete/end a trip on the blockchain.

**Request Body:**
```json
{
  "tripId": "1",
  "actualCarbonFootprint": 950,
  "ipfsProofHash": "QmProofHash" // Optional
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "tripId": "1",
    "txHash": "0x...",
    "blockNumber": 12350
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "Missing required fields: tripId, actualCarbonFootprint"
}
```

---

#### GET /trip/:id

Get trip metadata by ID.

**URL Parameters:**
- `id` (string, required): Trip ID

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "tripId": "1",
    "shipper": "0x...",
    "carrier": "0x...",
    "receiver": "0x...",
    "originLocation": "New York, NY",
    "destinationLocation": "Los Angeles, CA",
    "distance": "4500",
    "estimatedCarbonFootprint": "1000",
    "status": 2,
    "createdAt": "1234567890",
    "startedAt": "1234567900",
    "completedAt": "1234568000",
    "ipfsMetadataHash": "QmHash123"
  }
}
```

**Status Codes:**
- `0`: Created
- `1`: InTransit
- `2`: Delivered
- `3`: Cancelled
- `4`: Disputed

**Error Response (500 Internal Server Error):**
```json
{
  "success": false,
  "error": "Trip not found"
}
```

---

### Payment Management

#### POST /payment/release

Release payment from escrow.

**Request Body:**
```json
{
  "escrowId": "1",
  "amount": "1000000000000000000", // Amount in wei
  "reason": "Trip completed" // Optional
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "escrowId": "1",
    "amount": "1000000000000000000",
    "txHash": "0x...",
    "blockNumber": 12355
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "Missing required fields: escrowId, amount"
}
```

---

### Carbon Credits

#### GET /carbon/credits/:wallet

Get carbon credits balance and information for a wallet.

**URL Parameters:**
- `wallet` (string, required): Ethereum wallet address (0x...)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "walletAddress": "0x...",
    "balance": "50000",
    "totalCarbonOffset": "500",
    "rewardCount": 3,
    "rewards": ["1", "2", "3"]
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "Invalid wallet address format"
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "success": false,
  "error": "Error message",
  "details": [] // Optional, for validation errors
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Route not found",
  "path": "/api/invalid-route"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## Rate Limiting

API requests are rate-limited to 100 requests per 15 minutes per IP address.

---

## Example Usage

### Create a Trip

```bash
curl -X POST http://localhost:3001/api/trip/create \
  -H "Content-Type: application/json" \
  -d '{
    "carrier": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "receiver": "0x8ba1f109551bD432803012645Hac136c22C929e",
    "originLocation": "New York, NY",
    "destinationLocation": "Los Angeles, CA",
    "distance": 4500,
    "estimatedCarbonFootprint": 1000
  }'
```

### Get Trip

```bash
curl http://localhost:3001/api/trip/1
```

### End Trip

```bash
curl -X POST http://localhost:3001/api/trip/end \
  -H "Content-Type: application/json" \
  -d '{
    "tripId": "1",
    "actualCarbonFootprint": 950
  }'
```

### Release Payment

```bash
curl -X POST http://localhost:3001/api/payment/release \
  -H "Content-Type: application/json" \
  -d '{
    "escrowId": "1",
    "amount": "1000000000000000000",
    "reason": "Trip completed"
  }'
```

### Get Carbon Credits

```bash
curl http://localhost:3001/api/carbon/credits/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
```

---

## Notes

- All amounts are in wei (1 ETH = 10^18 wei)
- All timestamps are Unix timestamps (seconds)
- Wallet addresses must be valid Ethereum addresses (0x followed by 40 hex characters)
- The API caches trip data in Firestore (if configured) for faster retrieval

