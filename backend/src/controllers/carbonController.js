import { CarbonCreditsService } from '../services/blockchain/contractService.js';
import { logger } from '../utils/logger.js';

const carbonCreditsService = new CarbonCreditsService();

/**
 * Get carbon credits for a wallet
 * GET /carbon/credits/:wallet
 */
export async function getCarbonCredits(req, res) {
  try {
    const { wallet } = req.params;

    if (!wallet) {
      return res.status(400).json({
        success: false,
        error: 'Wallet address is required',
      });
    }

    // Validate wallet address format (basic check)
    if (!/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid wallet address format',
      });
    }

    // Get carbon credits from blockchain
    const credits = await carbonCreditsService.getCredits(wallet);

    res.json({
      success: true,
      data: credits,
    });
  } catch (error) {
    logger.error('Error in getCarbonCredits controller', { error: error.message, stack: error.stack });
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get carbon credits',
    });
  }
}

