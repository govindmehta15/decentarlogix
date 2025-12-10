import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Blockchain configuration
 */
export const blockchainConfig = {
  rpcUrl: process.env.RPC_URL || 'http://localhost:8545',
  privateKey: process.env.PRIVATE_KEY || '',
  contractAddresses: {
    tripRegistry: process.env.TRIP_REGISTRY_ADDRESS || '',
    paymentEscrow: process.env.PAYMENT_ESCROW_ADDRESS || '',
    carbonCredits: process.env.CARBON_CREDITS_ADDRESS || '',
  },
  chainId: parseInt(process.env.CHAIN_ID || '1337', 10),
};

/**
 * Get provider instance
 */
export function getProvider() {
  return new ethers.JsonRpcProvider(blockchainConfig.rpcUrl);
}

/**
 * Get signer instance (for write operations)
 */
export function getSigner() {
  if (!blockchainConfig.privateKey) {
    throw new Error('PRIVATE_KEY not set in environment variables');
  }
  const provider = getProvider();
  return new ethers.Wallet(blockchainConfig.privateKey, provider);
}

/**
 * Get contract instance
 * @param {string} contractName - Name of the contract (TripRegistry, PaymentEscrow, CarbonCredits)
 * @param {boolean} withSigner - Whether to use signer (for write operations)
 * @returns {ethers.Contract} Contract instance
 */
export function getContract(contractName, withSigner = false) {
  const address = blockchainConfig.contractAddresses[contractName.toLowerCase()];
  if (!address) {
    throw new Error(`Contract address for ${contractName} not found`);
  }

  // In production, load ABI from artifacts
  // For now, we'll use the interface
  const abi = getContractABI(contractName);
  
  const provider = withSigner ? getSigner() : getProvider();
  return new ethers.Contract(address, abi, provider);
}

/**
 * Get contract ABI (simplified - in production, load from artifacts)
 * @param {string} contractName - Name of the contract
 * @returns {Array} Contract ABI
 */
function getContractABI(contractName) {
  // In production, load from compiled artifacts
  // For MVP, return minimal ABI needed for our operations
  const commonABI = [
    'function createTrip(address,address,string,string,uint256,uint256,string) returns (uint256, uint256)',
    'function startTrip(uint256)',
    'function completeTrip(uint256,uint256,string)',
    'function cancelTrip(uint256,string)',
    'function getTripMetadata(uint256) view returns (tuple(uint256,address,address,address,string,string,uint256,uint256,uint8,uint256,uint256,uint256,string))',
    'function getTripIdByToken(uint256) view returns (uint256)',
    'function getTokenIdByTrip(uint256) view returns (uint256)',
    'function isAuthorizedForTrip(uint256,address) view returns (bool)',
    'event TripCreated(uint256 indexed, uint256 indexed, address indexed, address)',
    'event TripStarted(uint256 indexed, uint256)',
    'event TripCompleted(uint256 indexed, uint256, uint256)',
    'event TripStatusUpdated(uint256 indexed, uint8, uint8)',
  ];

  if (contractName.toLowerCase() === 'tripregistry') {
    return commonABI;
  }

  if (contractName.toLowerCase() === 'paymentescrow') {
    return [
      'function createEscrow(uint256,address,tuple(bool,bool,bool,uint8,uint8)) payable returns (uint256)',
      'function releasePayment(uint256,uint256,string)',
      'function releaseOnTripCompletion(uint256,uint256)',
      'function getEscrow(uint256) view returns (tuple(uint256,uint256,address,address,uint256,uint256,uint8,uint256,uint256,tuple(bool,bool,bool,uint8,uint8)))',
      'function getEscrowByTrip(uint256) view returns (uint256)',
      'function getEscrowBalance(uint256) view returns (uint256)',
      'event EscrowCreated(uint256 indexed, uint256 indexed, address indexed, address, uint256)',
      'event PaymentReleased(uint256 indexed, uint256, address indexed, string)',
    ];
  }

  if (contractName.toLowerCase() === 'carboncredits') {
    return [
      'function mintReward(address,uint256,uint256,uint8) returns (uint256, uint256)',
      'function balanceOf(address) view returns (uint256)',
      'function getTotalCarbonOffset(address) view returns (uint256)',
      'function getUserRewards(address) view returns (uint256[])',
      'event CarbonCreditsMinted(uint256 indexed, address indexed, uint256 indexed, uint256, uint256, uint8)',
    ];
  }

  return [];
}

