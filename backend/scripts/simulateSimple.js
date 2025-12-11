import { ethers } from 'ethers';
import dotenv from 'dotenv';
import { getProvider, getSigner } from '../src/config/blockchain.js';
import { getContract } from '../src/config/blockchain.js';

dotenv.config();

/**
 * Simplified simulation script that works with a single account
 * Creates trips and demonstrates the flow
 */

async function simpleSimulation() {
  console.log('🚀 Starting Simple Simulation...\n');

  try {
    const provider = getProvider();
    const signer = getSigner();
    const address = await signer.getAddress();

    console.log(`👤 Using account: ${address}\n`);

    // Get contract instances
    const tripRegistry = getContract('TripRegistry', true);
    const carbonCredits = getContract('CARBON_CREDITS', false);

    // Simulate creating a trip
    console.log('📦 Creating trip...\n');

    const carrier = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8';
    const receiver = '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC';

    const tx = await tripRegistry.createTrip(
      carrier,
      receiver,
      'New York, NY',
      'Los Angeles, CA',
      4500,
      1200,
      'QmSimulation123'
    );

    console.log(`⏳ Transaction sent: ${tx.hash}`);
    console.log('   Waiting for confirmation...\n');

    const receipt = await tx.wait();
    console.log(`✅ Trip created!`);
    console.log(`   Block: ${receipt.blockNumber}`);
    console.log(`   Gas used: ${receipt.gasUsed.toString()}\n`);

    // Parse event to get trip ID
    const event = receipt.logs.find(log => {
      try {
        const parsed = tripRegistry.interface.parseLog(log);
        return parsed && parsed.name === 'TripCreated';
      } catch {
        return false;
      }
    });

    if (event) {
      const parsed = tripRegistry.interface.parseLog(event);
      const tripId = parsed.args[0].toString();
      console.log(`📝 Trip ID: ${tripId}\n`);

      // Get trip metadata
      console.log('📊 Fetching trip metadata...\n');
      const metadata = await tripRegistry.getTripMetadata(tripId);
      console.log('Trip Details:');
      console.log(`  Shipper: ${metadata[1]}`);
      console.log(`  Carrier: ${metadata[2]}`);
      console.log(`  Origin: ${metadata[4]}`);
      console.log(`  Destination: ${metadata[5]}`);
      console.log(`  Distance: ${metadata[6].toString()} km`);
      console.log(`  Status: ${metadata[8]}\n`);

      // Check carbon credits balance
      console.log('🌱 Checking carbon credits...\n');
      try {
        const balance = await carbonCredits.balanceOf(address);
        console.log(`  Your balance: ${balance.toString()} credits\n`);
      } catch (error) {
        console.log('  Could not fetch carbon credits\n');
      }
    }

    console.log('✅ Simulation complete!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.reason) {
      console.error('   Reason:', error.reason);
    }
    process.exit(1);
  }
}

// Run if executed directly
simpleSimulation()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });

export { simpleSimulation };

