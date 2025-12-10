# DecentraLogix Frontend

React Web3 frontend for the DecentraLogix logistics platform.

## Features

- MetaMask wallet connection
- Create trips on blockchain
- View trip details
- Release payments
- Carbon credits dashboard
- Real-time transaction status
- Modern, responsive UI

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and update contract addresses:

```bash
cp .env.example .env
```

Update the following:
- `REACT_APP_TRIP_REGISTRY_ADDRESS`: TripRegistry contract address
- `REACT_APP_PAYMENT_ESCROW_ADDRESS`: PaymentEscrow contract address
- `REACT_APP_CARBON_CREDITS_ADDRESS`: CarbonCredits contract address
- `REACT_APP_API_URL`: Backend API URL (optional)
- `REACT_APP_CHAIN_ID`: Network chain ID

### 3. Run Development Server

```bash
npm start
```

App will open at `http://localhost:3000`

## Usage

### Connect Wallet

1. Click "Connect Wallet" button
2. Approve MetaMask connection
3. Your address will be displayed

### Create Trip

1. Navigate to "Create Trip" tab
2. Fill in trip details:
   - Carrier address
   - Receiver address
   - Origin and destination
   - Distance and carbon footprint
3. Click "Create Trip"
4. Approve transaction in MetaMask
5. Wait for confirmation

### View Trip

1. Navigate to "View Trip" tab
2. Enter trip ID
3. View trip details, status, and timeline

### Release Payment

1. Navigate to "Payment" tab
2. Enter escrow ID and amount
3. Click "Release Payment"
4. Approve transaction in MetaMask

### Carbon Credits

1. Navigate to "Carbon Credits" tab
2. View your balance and offset
3. See statistics and charts

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── wallet/
│   │   │   └── WalletConnect.js
│   │   ├── shipment/
│   │   │   ├── TripForm.js
│   │   │   └── TripDetails.js
│   │   └── common/
│   │       ├── PaymentButton.js
│   │       └── CarbonDashboard.js
│   ├── context/
│   │   └── Web3Context.js
│   ├── services/
│   │   ├── contractService.js
│   │   └── apiService.js
│   ├── config/
│   │   └── constants.js
│   ├── App.js
│   └── index.js
└── public/
```

## Components

### WalletConnect
Handles MetaMask connection and displays connected address.

### TripForm
Form for creating new trips on the blockchain.

### TripDetails
Displays trip information fetched from blockchain or API.

### PaymentButton
Button component for releasing payments from escrow.

### CarbonDashboard
Dashboard showing carbon credits balance and statistics.

## Web3 Integration

The app uses Ethers.js v6 for blockchain interactions:

- **Provider**: Read-only connection to blockchain
- **Signer**: Can sign transactions (requires wallet)
- **Contracts**: Direct contract interactions

See [docs/WEB3_UI.md](../docs/WEB3_UI.md) for detailed learning guide.

## Dependencies

- **react**: UI framework
- **ethers**: Blockchain interactions
- **react-router-dom**: Routing (if needed)
- **axios**: HTTP client for API calls
- **react-hot-toast**: Toast notifications
- **recharts**: Charts for carbon dashboard

## Building for Production

```bash
npm run build
```

Builds the app for production to the `build` folder.

## Troubleshooting

### MetaMask Not Detected

- Ensure MetaMask extension is installed
- Refresh the page
- Check if MetaMask is unlocked

### Transaction Fails

- Check you have enough ETH for gas
- Verify contract addresses are correct
- Ensure you're on the correct network

### Can't Connect Wallet

- Check browser console for errors
- Try disconnecting and reconnecting
- Clear browser cache

## Learning Resources

- [Web3 UI Guide](../docs/WEB3_UI.md) - Complete guide to Web3 UI development
- [Ethers.js Docs](https://docs.ethers.io/) - Ethers.js documentation
- [MetaMask Docs](https://docs.metamask.io/) - MetaMask integration guide
