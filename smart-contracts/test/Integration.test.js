const { expect } = require("chai");
const { ethers } = require("hardhat");

/**
 * Integration tests for complete logistics flow
 */
describe("DecentraLogix Integration", function () {
  let tripRegistry;
  let paymentEscrow;
  let carbonCredits;
  let owner;
  let shipper;
  let carrier;
  let receiver;

  beforeEach(async function () {
    [owner, shipper, carrier, receiver] = await ethers.getSigners();

    // Deploy contracts
    const TripRegistry = await ethers.getContractFactory("TripRegistry");
    tripRegistry = await TripRegistry.deploy();
    await tripRegistry.waitForDeployment();

    const PaymentEscrow = await ethers.getContractFactory("PaymentEscrow");
    paymentEscrow = await PaymentEscrow.deploy(await tripRegistry.getAddress());
    await paymentEscrow.waitForDeployment();

    const CarbonCredits = await ethers.getContractFactory("CarbonCredits");
    carbonCredits = await CarbonCredits.deploy();
    await carbonCredits.waitForDeployment();
  });

  describe("Complete Logistics Flow", function () {
    it("Should complete full trip lifecycle", async function () {
      // Step 1: Create Trip
      const tx1 = await tripRegistry
        .connect(shipper)
        .createTrip(
          carrier.address,
          receiver.address,
          "New York, NY",
          "Los Angeles, CA",
          4500,
          1200,
          "QmHash123"
        );

      const receipt1 = await tx1.wait();
      const event1 = receipt1.logs.find(log => {
        try {
          const parsed = tripRegistry.interface.parseLog(log);
          return parsed && parsed.name === "TripCreated";
        } catch {
          return false;
        }
      });

      expect(event1).to.not.be.undefined;
      const parsed1 = tripRegistry.interface.parseLog(event1);
      const tripId = parsed1.args[0].toString();

      // Step 2: Create Escrow
      const paymentAmount = ethers.parseEther("1.0");
      const conditions = {
        requiresTripCompletion: true,
        requiresDeliveryProof: false,
        requiresReceiverConfirmation: false,
        milestonePercentage: 0,
        completionPercentage: 100,
      };

      const tx2 = await paymentEscrow
        .connect(shipper)
        .createEscrow(tripId, carrier.address, conditions, {
          value: paymentAmount,
        });

      await expect(tx2)
        .to.emit(paymentEscrow, "EscrowCreated")
        .withArgs(1, tripId, shipper.address, carrier.address, paymentAmount);

      // Step 3: Start Trip
      const tx3 = await tripRegistry.connect(carrier).startTrip(tripId);
      await expect(tx3)
        .to.emit(tripRegistry, "TripStarted")
        .withArgs(tripId, await ethers.provider.getBlock("latest").then(b => b.timestamp));

      // Step 4: Complete Trip
      const actualCarbon = 1150;
      const tx4 = await tripRegistry
        .connect(carrier)
        .completeTrip(tripId, actualCarbon, "QmProofHash");

      await expect(tx4)
        .to.emit(tripRegistry, "TripCompleted")
        .withArgs(tripId, await ethers.provider.getBlock("latest").then(b => b.timestamp), actualCarbon);

      // Step 5: Release Payment
      const escrowId = await paymentEscrow.getEscrowByTrip(tripId);
      const escrowBalance = await paymentEscrow.getEscrowBalance(escrowId);

      const tx5 = await paymentEscrow
        .connect(owner)
        .releaseOnTripCompletion(escrowId, tripId);

      await expect(tx5)
        .to.emit(paymentEscrow, "PaymentReleased")
        .withArgs(escrowId, escrowBalance, carrier.address, "Trip completed");

      // Step 6: Mint Carbon Credits
      const tx6 = await carbonCredits
        .connect(owner)
        .mintReward(carrier.address, tripId, actualCarbon, 0);

      await expect(tx6)
        .to.emit(carbonCredits, "CarbonCreditsMinted")
        .withArgs(1, carrier.address, tripId, 115000, actualCarbon, 0);

      // Verify final state
      const tripMetadata = await tripRegistry.getTripMetadata(tripId);
      expect(tripMetadata.status).to.equal(2); // Delivered

      const credits = await carbonCredits.balanceOf(carrier.address);
      expect(credits).to.equal(115000); // 1150 kg * 100 multiplier
    });

    it("Should handle multiple trips", async function () {
      const trips = [];

      // Create 3 trips
      for (let i = 0; i < 3; i++) {
        const tx = await tripRegistry
          .connect(shipper)
          .createTrip(
            carrier.address,
            receiver.address,
            `Origin ${i}`,
            `Destination ${i}`,
            1000 + i * 100,
            300 + i * 50,
            `QmHash${i}`
          );

        const receipt = await tx.wait();
        const event = receipt.logs.find(log => {
          try {
            const parsed = tripRegistry.interface.parseLog(log);
            return parsed && parsed.name === "TripCreated";
          } catch {
            return false;
          }
        });

        const parsed = tripRegistry.interface.parseLog(event);
        trips.push(parsed.args[0].toString());
      }

      expect(trips.length).to.equal(3);

      // Verify all trips exist
      for (const tripId of trips) {
        const metadata = await tripRegistry.getTripMetadata(tripId);
        expect(metadata.tripId).to.equal(tripId);
      }
    });
  });

  describe("Error Scenarios", function () {
    it("Should revert if non-carrier tries to start trip", async function () {
      const tx = await tripRegistry
        .connect(shipper)
        .createTrip(
          carrier.address,
          receiver.address,
          "Origin",
          "Destination",
          1000,
          300,
          ""
        );

      const receipt = await tx.wait();
      const event = receipt.logs.find(log => {
        try {
          const parsed = tripRegistry.interface.parseLog(log);
          return parsed && parsed.name === "TripCreated";
        } catch {
          return false;
        }
      });

      const parsed = tripRegistry.interface.parseLog(event);
      const tripId = parsed.args[0].toString();

      await expect(
        tripRegistry.connect(shipper).startTrip(tripId)
      ).to.be.revertedWith("TripRegistry: Not authorized carrier");
    });

    it("Should revert if trip not in transit when completing", async function () {
      const tx = await tripRegistry
        .connect(shipper)
        .createTrip(
          carrier.address,
          receiver.address,
          "Origin",
          "Destination",
          1000,
          300,
          ""
        );

      const receipt = await tx.wait();
      const event = receipt.logs.find(log => {
        try {
          const parsed = tripRegistry.interface.parseLog(log);
          return parsed && parsed.name === "TripCreated";
        } catch {
          return false;
        }
      });

      const parsed = tripRegistry.interface.parseLog(event);
      const tripId = parsed.args[0].toString();

      await expect(
        tripRegistry.connect(carrier).completeTrip(tripId, 300, "")
      ).to.be.revertedWith("TripRegistry: Trip cannot be completed");
    });
  });
});

