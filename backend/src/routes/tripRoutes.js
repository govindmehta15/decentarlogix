import express from 'express';
import { createTrip, endTrip, getTrip } from '../controllers/tripController.js';

const router = express.Router();

/**
 * @route   POST /trip/create
 * @desc    Create a new trip
 * @access  Public
 */
router.post('/create', createTrip);

/**
 * @route   POST /trip/end
 * @desc    Complete/end a trip
 * @access  Public
 */
router.post('/end', endTrip);

/**
 * @route   GET /trip/:id
 * @desc    Get trip by ID
 * @access  Public
 */
router.get('/:id', getTrip);

export default router;

