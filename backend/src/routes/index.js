import express from 'express';
import tripRoutes from './tripRoutes.js';
import paymentRoutes from './paymentRoutes.js';
import carbonRoutes from './carbonRoutes.js';

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'decentralogix-backend',
  });
});

// API routes
router.use('/trip', tripRoutes);
router.use('/payment', paymentRoutes);
router.use('/carbon', carbonRoutes);

export default router;

