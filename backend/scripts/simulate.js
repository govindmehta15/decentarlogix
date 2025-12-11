import { ethers } from 'ethers';
import dotenv from 'dotenv';
import { getProvider, getSigner, blockchainConfig } from '../src/config/blockchain.js';
import { TripRegistryService, PaymentEscrowService, CarbonCreditsService } from '../src/services/blockchain/contractService.js';

dotenv.config();

/**
 * Simulation script for DecentraLogix logistics operations
 * Creates fake trips, triggers payments, and generates carbon credits
 */

// Test addresses (use your own test accounts)
const TEST_ACCOUNTS = {
  shipper: process.env.SHIPPER_ADDRESS || '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
  carrier: process.env.CARRIER_ADDRESS || '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
  receiver: process.env.RECEIVER_ADDRESS || '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
};

// Sample trip data
const SAMPLE_TRIPS = [
  {
    origin: 'New York, NY',
    destination: 'Los Angeles, CA',
    distance: 4500,
    estimatedCarbon: 1200,
    actualCarbon: 1150,
    paymentAmount: ethers.parseEther('1.0'),
  },
  {
    origin: 'Chicago, IL',
    destination: 'Miami, FL',
    distance: 2000,
    estimatedCarbon: 600,
    actualCarbon: 580,
    paymentAmount: ethers.parseEther('0.8'),
  },
  {
    origin: 'Seattle, WA',
    destination: 'Portland, OR',
    distance: 300,
    estimatedCarbon: 100,
    actualCarbon: 95,
    paymentAmount: ethers.parseEther('0.5'),
  },
];

/**
 * Simulate complete logistics flow
 */
async function simulateLogisticsFlow() {
  console.log('🚀 Starting DecentraLogix Simulation...\n');

  try {
    const provider = getProvider();
    const signer = getSigner();

    // Initialize services
    const tripService = new TripRegistryService();
    const paymentService = new PaymentEscrowService();
    const carbonService = new CarbonCreditsService();

    // Get network info
    const network = await provider.getNetwork();
    console.log(`📡 Connected to network: ${network.name} (Chain ID: ${network.chainId})\n`);

    // Get signer address
    const shipperAddress = await signer.getAddress();
    console.log(`👤 Shipper address: ${shipperAddress}\n`);

    const results = [];

    // Simulate each trip
    for (let i = 0; i < SAMPLE_TRIPS.length; i++) {
      const trip = SAMPLE_TRIPS[i];
      console.log(`\n${'='.repeat(60)}`);
      console.log(`📦 Simulating Trip ${i + 1}/${SAMPLE_TRIPS.length}`);
      console.log(`${'='.repeat(60)}\n`);

      const tripResult = await simulateSingleTrip(
        trip,
        tripService,
        paymentService,
        carbonService,
        shipperAddress,
        i + 1
      );

      results.push(tripResult);

      // Wait between trips
      if (i < SAMPLE_TRIPS.length - 1) {
        console.log('\n⏳ Waiting 5 seconds before next trip...\n');
        await sleep(5000);
      }
    }

    // Print summary
    printSummary(results);

  } catch (error) {
    console.error('❌ Simulation failed:', error);
    process.exit(1);
  }
}

/**
 * Simulate a single trip lifecycle
 */
async function simulateSingleTrip(
  tripData,
  tripService,
  paymentService,
  carbonService,
  shipperAddress,
  tripNumber
) {
  const result = {
    tripNumber,
    tripId: null,
    escrowId: null,
    paymentReleased: false,
    carbonCreditsMinted: false,
  };

  try {
    // Step 1: Create Trip
    console.log('📝 Step 1: Creating trip...');
    console.log(`   Origin: ${tripData.origin}`);
    console.log(`   Destination: ${tripData.destination}`);
    console.log(`   Distance: ${tripData.distance} km`);
    console.log(`   Estimated CO2: ${tripData.estimatedCarbon} kg\n`);

    const createResult = await tripService.createTrip({
      carrier: TEST_ACCOUNTS.carrier,
      receiver: TEST_ACCOUNTS.receiver,
      originLocation: tripData.origin,
      destinationLocation: tripData.destination,
      distance: tripData.distance,
      estimatedCarbonFootprint: tripData.estimatedCarbon,
      ipfsMetadataHash: `QmSimulation${tripNumber}`,
    });

    result.tripId = createResult.tripId;
    console.log(`✅ Trip created!`);
    console.log(`   Trip ID: ${result.tripId}`);
    console.log(`   Token ID: ${createResult.tokenId}`);
    console.log(`   TX Hash: ${createResult.txHash}\n`);

    // Wait for confirmation
    await sleep(2000);

    // Step 2: Create Escrow
    console.log('💰 Step 2: Creating payment escrow...');
    console.log(`   Amount: ${ethers.formatEther(tripData.paymentAmount)} ETH\n`);

    // Note: In real scenario, you'd need to switch to carrier account
    // For simulation, we'll skip escrow creation and assume it exists
    // Or create it with the shipper's signer
    console.log('⚠️  Escrow creation skipped (requires carrier account)\n');

    // Step 3: Start Trip
    console.log('🚚 Step 3: Starting trip...');
    // Note: This requires carrier's signer, so we'll skip in simulation
    console.log('⚠️  Trip start skipped (requires carrier account)\n');

    // Step 4: Complete Trip
    console.log('✅ Step 4: Completing trip...');
    console.log(`   Actual CO2: ${tripData.actualCarbon} kg\n`);
    // Note: This requires carrier's signer
    console.log('⚠️  Trip completion skipped (requires carrier account)\n');

    // Step 5: Release Payment (if escrow exists)
    console.log('💸 Step 5: Releasing payment...');
    // This would require escrow to exist
    console.log('⚠️  Payment release skipped (requires escrow)\n');

    // Step 6: Mint Carbon Credits
    console.log('🌱 Step 6: Minting carbon credits...');
    console.log(`   Carbon Offset: ${tripData.actualCarbon} kg CO2\n`);

    // Mint credits for the carrier
    try {
      const mintResult = await carbonService.mintReward(
        TEST_ACCOUNTS.carrier,
        result.tripId,
        tripData.actualCarbon,
        0 // TripCompletion reward type
      );

      result.carbonCreditsMinted = true;
      console.log(`✅ Carbon credits minted!`);
      console.log(`   Reward ID: ${mintResult.rewardId}`);
      console.log(`   Amount: ${mintResult.amount} credits\n`);
    } catch (error) {
      console.log(`⚠️  Carbon credits minting skipped: ${error.message}\n`);
    }

    // Get final trip status
    console.log('📊 Final trip status:');
    const tripMetadata = await tripService.getTripMetadata(result.tripId);
    console.log(`   Status: ${getStatusName(tripMetadata.status)}`);
    console.log(`   Created: ${new Date(Number(tripMetadata.createdAt) * 1000).toLocaleString()}\n`);

    return result;

  } catch (error) {
    console.error(`❌ Error in trip ${tripNumber}:`, error.message);
    return result;
  }
}

/**
 * Print simulation summary
 */
function printSummary(results) {
  console.log('\n' + '='.repeat(60));
  console.log('📊 SIMULATION SUMMARY');
  console.log('='.repeat(60) + '\n');

  console.log(`Total Trips Simulated: ${results.length}\n`);

  results.forEach((result, index) => {
    console.log(`Trip ${result.tripNumber}:`);
    console.log(`  Trip ID: ${result.tripId || 'N/A'}`);
    console.log(`  Escrow Created: ${result.escrowId ? 'Yes' : 'No'}`);
    console.log(`  Payment Released: ${result.paymentReleased ? 'Yes' : 'No'}`);
    console.log(`  Carbon Credits: ${result.carbonCreditsMinted ? 'Yes' : 'No'}`);
    console.log('');
  });

  const successfulTrips = results.filter(r => r.tripId).length;
  const carbonMinted = results.filter(r => r.carbonCreditsMinted).length;

  console.log('Statistics:');
  console.log(`  Successful Trips: ${successfulTrips}/${results.length}`);
  console.log(`  Carbon Credits Minted: ${carbonMinted}/${results.length}`);
  console.log('\n✅ Simulation complete!\n');
}

/**
 * Get status name from status code
 */
function getStatusName(status) {
  const statusMap = {
    0: 'Created',
    1: 'In Transit',
    2: 'Delivered',
    3: 'Cancelled',
    4: 'Disputed',
  };
  return statusMap[status] || 'Unknown';
}

/**
 * Sleep utility
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Run simulation
simulateLogisticsFlow()
  .then(() => {
    console.log('🎉 All simulations completed!');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Simulation error:', error);
    process.exit(1);
  });

export { simulateLogisticsFlow, simulateSingleTrip };

