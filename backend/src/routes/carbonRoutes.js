import express from 'express';
import { getCarbonCredits } from '../controllers/carbonController.js';

const router = express.Router();

/**
 * @route   GET /carbon/credits/:wallet
 * @desc    Get carbon credits for a wallet
 * @access  Public
 */
router.get('/credits/:wallet', getCarbonCredits);

export default router;

