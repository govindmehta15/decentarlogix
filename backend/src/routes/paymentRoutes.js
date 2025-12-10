import express from 'express';
import { releasePayment } from '../controllers/paymentController.js';

const router = express.Router();

/**
 * @route   POST /payment/release
 * @desc    Release payment from escrow
 * @access  Public
 */
router.post('/release', releasePayment);

export default router;

