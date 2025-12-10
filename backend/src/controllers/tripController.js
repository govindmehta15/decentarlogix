import { TripRegistryService } from '../services/blockchain/contractService.js';
import { firestoreService } from '../services/cache/firestoreService.js';
import { logger } from '../utils/logger.js';

const tripRegistryService = new TripRegistryService();

/**
 * Create a new trip
 * POST /trip/create
 */
export async function createTrip(req, res) {
  try {
    const {
      carrier,
      receiver,
      originLocation,
      destinationLocation,
      distance,
      estimatedCarbonFootprint,
      ipfsMetadataHash,
    } = req.body;

    // Validate required fields
    if (!carrier || !receiver || !originLocation || !destinationLocation || !distance || !estimatedCarbonFootprint) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        required: ['carrier', 'receiver', 'originLocation', 'destinationLocation', 'distance', 'estimatedCarbonFootprint'],
      });
    }

    // Create trip on blockchain
    const result = await tripRegistryService.createTrip({
      carrier,
      receiver,
      originLocation,
      destinationLocation,
      distance: parseInt(distance, 10),
      estimatedCarbonFootprint: parseInt(estimatedCarbonFootprint, 10),
      ipfsMetadataHash: ipfsMetadataHash || '',
    });

    // Cache trip data in Firestore (optional)
    await firestoreService.saveTrip(result.tripId, {
      carrier,
      receiver,
      originLocation,
      destinationLocation,
      distance,
      estimatedCarbonFootprint,
      ipfsMetadataHash,
      status: 'Created',
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Error in createTrip controller', { error: error.message, stack: error.stack });
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create trip',
    });
  }
}

/**
 * Complete a trip (end trip)
 * POST /trip/end
 */
export async function endTrip(req, res) {
  try {
    const { tripId, actualCarbonFootprint, ipfsProofHash } = req.body;

    if (!tripId || !actualCarbonFootprint) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: tripId, actualCarbonFootprint',
      });
    }

    // Complete trip on blockchain
    const result = await tripRegistryService.completeTrip(
      tripId,
      parseInt(actualCarbonFootprint, 10),
      ipfsProofHash || ''
    );

    // Update cache
    await firestoreService.updateTrip(tripId, {
      status: 'Delivered',
      actualCarbonFootprint,
      completedAt: new Date().toISOString(),
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Error in endTrip controller', { error: error.message, stack: error.stack });
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to complete trip',
    });
  }
}

/**
 * Get trip by ID
 * GET /trip/:id
 */
export async function getTrip(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Trip ID is required',
      });
    }

    // Try to get from cache first
    let tripData = await firestoreService.getTrip(id);

    // If not in cache or cache miss, get from blockchain
    if (!tripData) {
      tripData = await tripRegistryService.getTripMetadata(id);
      
      // Cache the result
      await firestoreService.saveTrip(id, tripData);
    }

    res.json({
      success: true,
      data: tripData,
    });
  } catch (error) {
    logger.error('Error in getTrip controller', { error: error.message, stack: error.stack });
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get trip',
    });
  }
}

