import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES } from '../config/constants';

/**
 * Get contract instance
 * @param {string} contractName - Name of the contract
 * @param {ethers.Signer} signer - Signer instance
 * @returns {ethers.Contract} Contract instance
 */
export function getContract(contractName, signer) {
  const address = CONTRACT_ADDRESSES[contractName];
  if (!address) {
    throw new Error(`Contract address for ${contractName} not found`);
  }

  // Minimal ABI for frontend operations
  const abi = getContractABI(contractName);
  return new ethers.Contract(address, abi, signer);
}

/**
 * Get contract ABI (minimal for frontend)
 */
function getContractABI(contractName) {
  if (contractName === 'TRIP_REGISTRY') {
    return [
      'function createTrip(address,address,string,string,uint256,uint256,string) returns (uint256, uint256)',
      'function startTrip(uint256)',
      'function completeTrip(uint256,uint256,string)',
      'function getTripMetadata(uint256) view returns (tuple(uint256,address,address,address,string,string,uint256,uint256,uint8,uint256,uint256,uint256,string))',
      'function getTokenIdByTrip(uint256) view returns (uint256)',
      'event TripCreated(uint256 indexed, uint256 indexed, address indexed, address)',
      'event TripCompleted(uint256 indexed, uint256, uint256)',
    ];
  }

  if (contractName === 'PAYMENT_ESCROW') {
    return [
      'function releasePayment(uint256,uint256,string)',
      'function releaseOnTripCompletion(uint256,uint256)',
      'function getEscrow(uint256) view returns (tuple(uint256,uint256,address,address,uint256,uint256,uint8,uint256,uint256,tuple(bool,bool,bool,uint8,uint8)))',
      'function getEscrowByTrip(uint256) view returns (uint256)',
      'function getEscrowBalance(uint256) view returns (uint256)',
    ];
  }

  if (contractName === 'CARBON_CREDITS') {
    return [
      'function balanceOf(address) view returns (uint256)',
      'function getTotalCarbonOffset(address) view returns (uint256)',
      'function getUserRewards(address) view returns (uint256[])',
    ];
  }

  return [];
}

/**
 * Create trip on blockchain
 */
export async function createTrip(signer, tripData) {
  const contract = getContract('TRIP_REGISTRY', signer);
  
  const tx = await contract.createTrip(
    tripData.carrier,
    tripData.receiver,
    tripData.originLocation,
    tripData.destinationLocation,
    tripData.distance,
    tripData.estimatedCarbonFootprint,
    tripData.ipfsMetadataHash || ''
  );

  const receipt = await tx.wait();
  
  // Parse event to get trip ID
  const event = receipt.logs.find(log => {
    try {
      const parsed = contract.interface.parseLog(log);
      return parsed && parsed.name === 'TripCreated';
    } catch {
      return false;
    }
  });

  if (event) {
    const parsed = contract.interface.parseLog(event);
    return {
      tripId: parsed.args[0].toString(),
      tokenId: parsed.args[1].toString(),
      txHash: receipt.hash,
    };
  }

  throw new Error('TripCreated event not found');
}

/**
 * Get trip metadata
 */
export async function getTripMetadata(provider, tripId) {
  const contract = getContract('TRIP_REGISTRY', provider);
  const metadata = await contract.getTripMetadata(tripId);
  
  return {
    tripId: metadata[0].toString(),
    shipper: metadata[1],
    carrier: metadata[2],
    receiver: metadata[3],
    originLocation: metadata[4],
    destinationLocation: metadata[5],
    distance: metadata[6].toString(),
    estimatedCarbonFootprint: metadata[7].toString(),
    status: metadata[8],
    createdAt: metadata[9].toString(),
    startedAt: metadata[10].toString(),
    completedAt: metadata[11].toString(),
    ipfsMetadataHash: metadata[12],
  };
}

/**
 * Complete trip
 */
export async function completeTrip(signer, tripId, actualCarbonFootprint, ipfsProofHash = '') {
  const contract = getContract('TRIP_REGISTRY', signer);
  const tx = await contract.completeTrip(tripId, actualCarbonFootprint, ipfsProofHash);
  const receipt = await tx.wait();
  return receipt.hash;
}

/**
 * Release payment
 */
export async function releasePayment(signer, escrowId, amount, reason = '') {
  const contract = getContract('PAYMENT_ESCROW', signer);
  const tx = await contract.releasePayment(escrowId, amount, reason);
  const receipt = await tx.wait();
  return receipt.hash;
}

/**
 * Get carbon credits balance
 */
export async function getCarbonCredits(provider, walletAddress) {
  const contract = getContract('CARBON_CREDITS', provider);
  
  const [balance, totalOffset, rewards] = await Promise.all([
    contract.balanceOf(walletAddress),
    contract.getTotalCarbonOffset(walletAddress),
    contract.getUserRewards(walletAddress),
  ]);

  return {
    balance: balance.toString(),
    totalCarbonOffset: totalOffset.toString(),
    rewards: rewards.map(r => r.toString()),
  };
}

