import { getContract, getProvider } from '../../config/blockchain.js';
import { logger } from '../../utils/logger.js';

/**
 * Service for interacting with TripRegistry contract
 */
export class TripRegistryService {
  constructor() {
    this.contract = getContract('TripRegistry', false);
    this.writeContract = getContract('TripRegistry', true);
  }

  /**
   * Create a new trip
   * @param {Object} tripData - Trip data
   * @returns {Promise<Object>} Transaction result
   */
  async createTrip(tripData) {
    try {
      const {
        carrier,
        receiver,
        originLocation,
        destinationLocation,
        distance,
        estimatedCarbonFootprint,
        ipfsMetadataHash = '',
      } = tripData;

      logger.info('Creating trip on blockchain', { carrier, receiver, distance });

      const tx = await this.writeContract.createTrip(
        carrier,
        receiver,
        originLocation,
        destinationLocation,
        distance,
        estimatedCarbonFootprint,
        ipfsMetadataHash
      );

      logger.info('Trip creation transaction sent', { txHash: tx.hash });

      // Wait for transaction confirmation
      const receipt = await tx.wait();
      logger.info('Trip creation confirmed', { txHash: receipt.hash, blockNumber: receipt.blockNumber });

      // Parse events to get trip ID and token ID
      const event = receipt.logs.find(log => {
        try {
          const parsed = this.contract.interface.parseLog(log);
          return parsed && parsed.name === 'TripCreated';
        } catch {
          return false;
        }
      });

      if (event) {
        const parsed = this.contract.interface.parseLog(event);
        const tripId = parsed.args[0];
        const tokenId = parsed.args[1];

        return {
          success: true,
          tripId: tripId.toString(),
          tokenId: tokenId.toString(),
          txHash: receipt.hash,
          blockNumber: receipt.blockNumber,
        };
      }

      throw new Error('TripCreated event not found in transaction receipt');
    } catch (error) {
      logger.error('Error creating trip', { error: error.message });
      throw error;
    }
  }

  /**
   * Start a trip
   * @param {string} tripId - Trip ID
   * @returns {Promise<Object>} Transaction result
   */
  async startTrip(tripId) {
    try {
      logger.info('Starting trip', { tripId });

      const tx = await this.writeContract.startTrip(tripId);
      const receipt = await tx.wait();

      logger.info('Trip started', { tripId, txHash: receipt.hash });

      return {
        success: true,
        tripId,
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
      };
    } catch (error) {
      logger.error('Error starting trip', { tripId, error: error.message });
      throw error;
    }
  }

  /**
   * Complete a trip
   * @param {string} tripId - Trip ID
   * @param {string} actualCarbonFootprint - Actual carbon footprint
   * @param {string} ipfsProofHash - IPFS hash for delivery proof
   * @returns {Promise<Object>} Transaction result
   */
  async completeTrip(tripId, actualCarbonFootprint, ipfsProofHash = '') {
    try {
      logger.info('Completing trip', { tripId, actualCarbonFootprint });

      const tx = await this.writeContract.completeTrip(
        tripId,
        actualCarbonFootprint,
        ipfsProofHash
      );
      const receipt = await tx.wait();

      logger.info('Trip completed', { tripId, txHash: receipt.hash });

      return {
        success: true,
        tripId,
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
      };
    } catch (error) {
      logger.error('Error completing trip', { tripId, error: error.message });
      throw error;
    }
  }

  /**
   * Get trip metadata
   * @param {string} tripId - Trip ID
   * @returns {Promise<Object>} Trip metadata
   */
  async getTripMetadata(tripId) {
    try {
      const metadata = await this.contract.getTripMetadata(tripId);

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
    } catch (error) {
      logger.error('Error getting trip metadata', { tripId, error: error.message });
      throw error;
    }
  }

  /**
   * Get trip ID by token ID
   * @param {string} tokenId - NFT token ID
   * @returns {Promise<string>} Trip ID
   */
  async getTripIdByToken(tokenId) {
    try {
      const tripId = await this.contract.getTripIdByToken(tokenId);
      return tripId.toString();
    } catch (error) {
      logger.error('Error getting trip ID by token', { tokenId, error: error.message });
      throw error;
    }
  }

  /**
   * Listen to trip events
   * @param {Function} callback - Callback function for events
   */
  listenToEvents(callback) {
    this.contract.on('TripCreated', (tripId, tokenId, shipper, carrier, event) => {
      callback({
        type: 'TripCreated',
        tripId: tripId.toString(),
        tokenId: tokenId.toString(),
        shipper,
        carrier,
        blockNumber: event.blockNumber,
      });
    });

    this.contract.on('TripStarted', (tripId, startedAt, event) => {
      callback({
        type: 'TripStarted',
        tripId: tripId.toString(),
        startedAt: startedAt.toString(),
        blockNumber: event.blockNumber,
      });
    });

    this.contract.on('TripCompleted', (tripId, completedAt, actualCarbonFootprint, event) => {
      callback({
        type: 'TripCompleted',
        tripId: tripId.toString(),
        completedAt: completedAt.toString(),
        actualCarbonFootprint: actualCarbonFootprint.toString(),
        blockNumber: event.blockNumber,
      });
    });
  }
}

/**
 * Service for interacting with PaymentEscrow contract
 */
export class PaymentEscrowService {
  constructor() {
    this.contract = getContract('PaymentEscrow', false);
    this.writeContract = getContract('PaymentEscrow', true);
  }

  /**
   * Release payment
   * @param {string} escrowId - Escrow ID
   * @param {string} amount - Amount to release (in wei)
   * @param {string} reason - Reason for release
   * @returns {Promise<Object>} Transaction result
   */
  async releasePayment(escrowId, amount, reason = '') {
    try {
      logger.info('Releasing payment', { escrowId, amount });

      const tx = await this.writeContract.releasePayment(escrowId, amount, reason);
      const receipt = await tx.wait();

      logger.info('Payment released', { escrowId, txHash: receipt.hash });

      return {
        success: true,
        escrowId,
        amount,
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
      };
    } catch (error) {
      logger.error('Error releasing payment', { escrowId, error: error.message });
      throw error;
    }
  }

  /**
   * Release payment on trip completion
   * @param {string} escrowId - Escrow ID
   * @param {string} tripId - Trip ID
   * @returns {Promise<Object>} Transaction result
   */
  async releaseOnTripCompletion(escrowId, tripId) {
    try {
      logger.info('Releasing payment on trip completion', { escrowId, tripId });

      const tx = await this.writeContract.releaseOnTripCompletion(escrowId, tripId);
      const receipt = await tx.wait();

      logger.info('Payment released on completion', { escrowId, txHash: receipt.hash });

      return {
        success: true,
        escrowId,
        tripId,
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
      };
    } catch (error) {
      logger.error('Error releasing payment on completion', { escrowId, error: error.message });
      throw error;
    }
  }

  /**
   * Get escrow details
   * @param {string} escrowId - Escrow ID
   * @returns {Promise<Object>} Escrow details
   */
  async getEscrow(escrowId) {
    try {
      const escrow = await this.contract.getEscrow(escrowId);
      return {
        escrowId: escrow[0].toString(),
        tripId: escrow[1].toString(),
        payer: escrow[2],
        payee: escrow[3],
        amount: escrow[4].toString(),
        releasedAmount: escrow[5].toString(),
        status: escrow[6],
        createdAt: escrow[7].toString(),
        releasedAt: escrow[8].toString(),
      };
    } catch (error) {
      logger.error('Error getting escrow', { escrowId, error: error.message });
      throw error;
    }
  }

  /**
   * Get escrow by trip ID
   * @param {string} tripId - Trip ID
   * @returns {Promise<string>} Escrow ID
   */
  async getEscrowByTrip(tripId) {
    try {
      const escrowId = await this.contract.getEscrowByTrip(tripId);
      return escrowId.toString();
    } catch (error) {
      logger.error('Error getting escrow by trip', { tripId, error: error.message });
      throw error;
    }
  }
}

/**
 * Service for interacting with CarbonCredits contract
 */
export class CarbonCreditsService {
  constructor() {
    this.contract = getContract('CarbonCredits', false);
  }

  /**
   * Get carbon credits balance
   * @param {string} walletAddress - Wallet address
   * @returns {Promise<Object>} Balance and offset information
   */
  async getCredits(walletAddress) {
    try {
      const [balance, totalOffset, rewards] = await Promise.all([
        this.contract.balanceOf(walletAddress),
        this.contract.getTotalCarbonOffset(walletAddress),
        this.contract.getUserRewards(walletAddress),
      ]);

      return {
        walletAddress,
        balance: balance.toString(),
        totalCarbonOffset: totalOffset.toString(),
        rewardCount: rewards.length,
        rewards: rewards.map(r => r.toString()),
      };
    } catch (error) {
      logger.error('Error getting carbon credits', { walletAddress, error: error.message });
      throw error;
    }
  }
}

