// Contract addresses (update after deployment)
export const CONTRACT_ADDRESSES = {
  TRIP_REGISTRY: process.env.REACT_APP_TRIP_REGISTRY_ADDRESS || '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  PAYMENT_ESCROW: process.env.REACT_APP_PAYMENT_ESCROW_ADDRESS || '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
  CARBON_CREDITS: process.env.REACT_APP_CARBON_CREDITS_ADDRESS || '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
};

// API URL
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Network configuration
export const CHAIN_ID = parseInt(process.env.REACT_APP_CHAIN_ID || '1337', 10);

// Trip status mapping
export const TRIP_STATUS = {
  0: 'Created',
  1: 'In Transit',
  2: 'Delivered',
  3: 'Cancelled',
  4: 'Disputed',
};

