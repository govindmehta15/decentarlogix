# Simulation Scripts

Scripts for simulating DecentraLogix logistics operations.

## Setup

1. Ensure contracts are deployed
2. Update `.env` with contract addresses
3. Set `PRIVATE_KEY` for signing transactions
4. Ensure Hardhat node is running (for local testing)

## Scripts

### simulateSimple.js

Simple simulation that works with a single account.

**Usage:**
```bash
npm run simulate
```

**What it does:**
- Creates a trip
- Fetches trip metadata
- Checks carbon credits balance

**Requirements:**
- Single account (shipper)
- Contracts deployed
- Hardhat node running

### simulate.js

Complete logistics flow simulation.

**Usage:**
```bash
node scripts/simulate.js
```

**What it does:**
- Creates multiple trips
- Simulates complete lifecycle
- Tests payment escrow
- Mints carbon credits
- Generates summary report

**Requirements:**
- Multiple test accounts
- Contracts deployed
- Hardhat node running

## Environment Variables

Required in `.env`:
```env
RPC_URL=http://localhost:8545
PRIVATE_KEY=your_private_key
TRIP_REGISTRY_ADDRESS=0x...
PAYMENT_ESCROW_ADDRESS=0x...
CARBON_CREDITS_ADDRESS=0x...
```

Optional:
```env
SHIPPER_ADDRESS=0x...
CARRIER_ADDRESS=0x...
RECEIVER_ADDRESS=0x...
```

## Running Simulations

### Local Development

1. Start Hardhat node:
```bash
cd smart-contracts
npm run node
```

2. Deploy contracts:
```bash
npm run deploy:local
```

3. Update `.env` with contract addresses

4. Run simulation:
```bash
cd backend
npm run simulate
```

## Troubleshooting

### "Contract address not found"
- Ensure contracts are deployed
- Check `.env` has correct addresses

### "Insufficient funds"
- Hardhat node provides test ETH automatically
- For testnets, fund your account first

### "Transaction reverted"
- Check contract addresses are correct
- Verify you're on the right network
- Check contract state (trip must exist, etc.)

