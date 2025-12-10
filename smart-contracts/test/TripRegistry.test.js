const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TripRegistry", function () {
  let tripRegistry;
  let owner;
  let shipper;
  let carrier;
  let receiver;
  let addr1;

  beforeEach(async function () {
    [owner, shipper, carrier, receiver, addr1] = await ethers.getSigners();

    const TripRegistry = await ethers.getContractFactory("TripRegistry");
    tripRegistry = await TripRegistry.deploy();
    await tripRegistry.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await tripRegistry.owner()).to.equal(owner.address);
    });

    it("Should have correct name and symbol", async function () {
      expect(await tripRegistry.name()).to.equal("DecentraLogix Trip");
      expect(await tripRegistry.symbol()).to.equal("DLXTRIP");
    });
  });

  describe("Trip Creation", function () {
    it("Should create a trip and mint NFT", async function () {
      const tx = await tripRegistry
        .connect(shipper)
        .createTrip(
          carrier.address,
          receiver.address,
          "New York, NY",
          "Los Angeles, CA",
          4500, // km
          1000, // kg CO2
          "QmHash123"
        );

      await expect(tx)
        .to.emit(tripRegistry, "TripCreated")
        .withArgs(1, 1, shipper.address, carrier.address);

      const tripMetadata = await tripRegistry.getTripMetadata(1);
      expect(tripMetadata.tripId).to.equal(1);
      expect(tripMetadata.shipper).to.equal(shipper.address);
      expect(tripMetadata.carrier).to.equal(carrier.address);
      expect(tripMetadata.receiver).to.equal(receiver.address);
      expect(tripMetadata.status).to.equal(0); // Created

      // Check NFT ownership
      expect(await tripRegistry.ownerOf(1)).to.equal(shipper.address);
    });

    it("Should revert with invalid carrier address", async function () {
      await expect(
        tripRegistry
          .connect(shipper)
          .createTrip(
            ethers.ZeroAddress,
            receiver.address,
            "Origin",
            "Destination",
            100,
            50,
            ""
          )
      ).to.be.revertedWith("TripRegistry: Invalid carrier address");
    });

    it("Should revert if shipper is same as carrier", async function () {
      await expect(
        tripRegistry
          .connect(shipper)
          .createTrip(
            shipper.address,
            receiver.address,
            "Origin",
            "Destination",
            100,
            50,
            ""
          )
      ).to.be.revertedWith("TripRegistry: Cannot be own carrier");
    });

    it("Should revert with zero distance", async function () {
      await expect(
        tripRegistry
          .connect(shipper)
          .createTrip(
            carrier.address,
            receiver.address,
            "Origin",
            "Destination",
            0,
            50,
            ""
          )
      ).to.be.revertedWith("TripRegistry: Distance must be greater than 0");
    });
  });

  describe("Trip Lifecycle", function () {
    beforeEach(async function () {
      await tripRegistry
        .connect(shipper)
        .createTrip(
          carrier.address,
          receiver.address,
          "New York, NY",
          "Los Angeles, CA",
          4500,
          1000,
          "QmHash123"
        );
    });

    it("Should allow carrier to start trip", async function () {
      const tx = await tripRegistry.connect(carrier).startTrip(1);

      await expect(tx)
        .to.emit(tripRegistry, "TripStarted")
        .withArgs(1, await ethers.provider.getBlock("latest").then(b => b.timestamp));

      const tripMetadata = await tripRegistry.getTripMetadata(1);
      expect(tripMetadata.status).to.equal(1); // InTransit
      expect(tripMetadata.startedAt).to.be.gt(0);
    });

    it("Should revert if non-carrier tries to start trip", async function () {
      await expect(
        tripRegistry.connect(addr1).startTrip(1)
      ).to.be.revertedWith("TripRegistry: Not authorized carrier");
    });

    it("Should allow carrier to complete trip", async function () {
      await tripRegistry.connect(carrier).startTrip(1);

      const tx = await tripRegistry
        .connect(carrier)
        .completeTrip(1, 950, "QmProofHash");

      await expect(tx)
        .to.emit(tripRegistry, "TripCompleted")
        .withArgs(1, await ethers.provider.getBlock("latest").then(b => b.timestamp), 950);

      const tripMetadata = await tripRegistry.getTripMetadata(1);
      expect(tripMetadata.status).to.equal(2); // Delivered
      expect(tripMetadata.completedAt).to.be.gt(0);
    });

    it("Should revert if trip not in transit", async function () {
      await expect(
        tripRegistry.connect(carrier).completeTrip(1, 950, "")
      ).to.be.revertedWith("TripRegistry: Trip cannot be completed");
    });
  });

  describe("Trip Cancellation", function () {
    beforeEach(async function () {
      await tripRegistry
        .connect(shipper)
        .createTrip(
          carrier.address,
          receiver.address,
          "Origin",
          "Destination",
          100,
          50,
          ""
        );
    });

    it("Should allow shipper to cancel trip", async function () {
      const tx = await tripRegistry
        .connect(shipper)
        .cancelTrip(1, "Change of plans");

      await expect(tx)
        .to.emit(tripRegistry, "TripStatusUpdated")
        .withArgs(1, 0, 3); // Created -> Cancelled

      const tripMetadata = await tripRegistry.getTripMetadata(1);
      expect(tripMetadata.status).to.equal(3); // Cancelled
    });

    it("Should allow carrier to cancel trip", async function () {
      await tripRegistry.connect(carrier).startTrip(1);

      const tx = await tripRegistry
        .connect(carrier)
        .cancelTrip(1, "Unable to complete");

      const tripMetadata = await tripRegistry.getTripMetadata(1);
      expect(tripMetadata.status).to.equal(3); // Cancelled
    });
  });

  describe("View Functions", function () {
    beforeEach(async function () {
      await tripRegistry
        .connect(shipper)
        .createTrip(
          carrier.address,
          receiver.address,
          "Origin",
          "Destination",
          100,
          50,
          "QmHash"
        );
    });

    it("Should return correct trip ID by token ID", async function () {
      const tripId = await tripRegistry.getTripIdByToken(1);
      expect(tripId).to.equal(1);
    });

    it("Should return correct token ID by trip ID", async function () {
      const tokenId = await tripRegistry.getTokenIdByTrip(1);
      expect(tokenId).to.equal(1);
    });

    it("Should check authorization correctly", async function () {
      expect(await tripRegistry.isAuthorizedForTrip(1, shipper.address)).to.be.true;
      expect(await tripRegistry.isAuthorizedForTrip(1, carrier.address)).to.be.true;
      expect(await tripRegistry.isAuthorizedForTrip(1, receiver.address)).to.be.true;
      expect(await tripRegistry.isAuthorizedForTrip(1, owner.address)).to.be.true;
      expect(await tripRegistry.isAuthorizedForTrip(1, addr1.address)).to.be.false;
    });
  });
});

