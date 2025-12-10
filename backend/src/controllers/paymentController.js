import { PaymentEscrowService } from '../services/blockchain/contractService.js';
import { logger } from '../utils/logger.js';

const paymentEscrowService = new PaymentEscrowService();

/**
 * Release payment
 * POST /payment/release
 */
export async function releasePayment(req, res) {
  try {
    const { escrowId, amount, reason } = req.body;

    if (!escrowId || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: escrowId, amount',
      });
    }

    // Release payment on blockchain
    const result = await paymentEscrowService.releasePayment(
      escrowId,
      amount,
      reason || ''
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Error in releasePayment controller', { error: error.message, stack: error.stack });
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to release payment',
    });
  }
}

