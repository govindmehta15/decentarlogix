/**
 * Testing utilities for frontend
 */

/**
 * Generate test trip data
 */
export function generateTestTrip() {
  const origins = [
    'New York, NY',
    'Los Angeles, CA',
    'Chicago, IL',
    'Houston, TX',
    'Phoenix, AZ',
  ];

  const destinations = [
    'Miami, FL',
    'Seattle, WA',
    'Boston, MA',
    'Denver, CO',
    'Atlanta, GA',
  ];

  const origin = origins[Math.floor(Math.random() * origins.length)];
  let destination = destinations[Math.floor(Math.random() * destinations.length)];
  
  // Ensure origin and destination are different
  while (destination === origin) {
    destination = destinations[Math.floor(Math.random() * destinations.length)];
  }

  // Calculate approximate distance (simplified)
  const distance = Math.floor(Math.random() * 4000) + 500; // 500-4500 km
  const estimatedCarbon = Math.floor(distance * 0.25); // ~0.25 kg CO2 per km

  return {
    carrier: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    receiver: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    originLocation: origin,
    destinationLocation: destination,
    distance: distance.toString(),
    estimatedCarbonFootprint: estimatedCarbon.toString(),
    ipfsMetadataHash: `QmTest${Date.now()}`,
  };
}

/**
 * Generate test addresses
 */
export function generateTestAddresses() {
  return {
    shipper: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    carrier: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    receiver: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
  };
}

/**
 * Format transaction hash for display
 */
export function formatTxHash(hash) {
  if (!hash) return 'N/A';
  return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
}

/**
 * Format address for display
 */
export function formatAddress(address) {
  if (!address) return 'N/A';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Wait utility for testing
 */
export function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Mock transaction response
 */
export function mockTransaction(tripId, tokenId) {
  return {
    tripId,
    tokenId,
    txHash: `0x${Math.random().toString(16).substr(2, 64)}`,
    blockNumber: Math.floor(Math.random() * 1000000) + 1000000,
  };
}

