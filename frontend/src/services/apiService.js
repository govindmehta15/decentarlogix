import axios from 'axios';
import { API_URL } from '../config/constants';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Create trip via API
 */
export async function createTripAPI(tripData) {
  const response = await api.post('/trip/create', tripData);
  return response.data;
}

/**
 * Get trip via API
 */
export async function getTripAPI(tripId) {
  const response = await api.get(`/trip/${tripId}`);
  return response.data;
}

/**
 * End trip via API
 */
export async function endTripAPI(tripData) {
  const response = await api.post('/trip/end', tripData);
  return response.data;
}

/**
 * Release payment via API
 */
export async function releasePaymentAPI(paymentData) {
  const response = await api.post('/payment/release', paymentData);
  return response.data;
}

/**
 * Get carbon credits via API
 */
export async function getCarbonCreditsAPI(walletAddress) {
  const response = await api.get(`/carbon/credits/${walletAddress}`);
  return response.data;
}

export default api;

