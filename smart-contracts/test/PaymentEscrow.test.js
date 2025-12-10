const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PaymentEscrow", function () {
  let tripRegistry;
  let paymentEscrow;
  let owner;
  let shipper;
  let carrier;
  let receiver;

  beforeEach(async function () {
    [owner, shipper, carrier, receiver] = await ethers.getSigners();

    // Deploy TripRegistry first
    const TripRegistry = await ethers.getContractFactory("TripRegistry");
    tripRegistry = await TripRegistry.deploy();
    await tripRegistry.waitForDeployment();

    // Deploy PaymentEscrow
    const PaymentEscrow = await ethers.getContractFactory("PaymentEscrow");
    paymentEscrow = await PaymentEscrow.deploy(await tripRegistry.getAddress());
    await paymentEscrow.waitForDeployment();

    // Create a trip for testing
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

  describe("Deployment", function () {
    it("Should set the right trip registry", async function () {
      expect(await paymentEscrow.tripRegistry()).to.equal(await tripRegistry.getAddress());
    });
  });

  describe("Escrow Creation", function () {
    it("Should create escrow with payment", async function () {
      const paymentAmount = ethers.parseEther("1.0");
      const conditions = {
        requiresTripCompletion: true,
        requiresDeliveryProof: false,
        requiresReceiverConfirmation: false,
        milestonePercentage: 0,
        completionPercentage: 100,
      };

      const tx = await paymentEscrow
        .connect(shipper)
        .createEscrow(1, carrier.address, conditions, { value: paymentAmount });

      await expect(tx)
        .to.emit(paymentEscrow, "EscrowCreated")
        .withArgs(1, 1, shipper.address, carrier.address, paymentAmount);

      const escrow = await paymentEscrow.getEscrow(1);
      expect(escrow.escrowId).to.equal(1);
      expect(escrow.tripId).to.equal(1);
      expect(escrow.payer).to.equal(shipper.address);
      expect(escrow.payee).to.equal(carrier.address);
      expect(escrow.amount).to.equal(paymentAmount);
      expect(escrow.status).to.equal(0); // Pending
    });

    it("Should revert with zero payment", async function () {
      const conditions = {
        requiresTripCompletion: true,
        requiresDeliveryProof: false,
        requiresReceiverConfirmation: false,
        milestonePercentage: 0,
        completionPercentage: 100,
      };

      await expect(
        paymentEscrow
          .connect(shipper)
          .createEscrow(1, carrier.address, conditions, { value: 0 })
      ).to.be.revertedWith("PaymentEscrow: Must send payment");
    });

    it("Should revert if trip does not exist", async function () {
      const paymentAmount = ethers.parseEther("1.0");
      const conditions = {
        requiresTripCompletion: true,
        requiresDeliveryProof: false,
        requiresReceiverConfirmation: false,
        milestonePercentage: 0,
        completionPercentage: 100,
      };

      await expect(
        paymentEscrow
          .connect(shipper)
          .createEscrow(999, carrier.address, conditions, { value: paymentAmount })
      ).to.be.reverted;
    });
  });

  describe("Payment Release", function () {
    beforeEach(async function () {
      const paymentAmount = ethers.parseEther("1.0");
      const conditions = {
        requiresTripCompletion: true,
        requiresDeliveryProof: false,
        requiresReceiverConfirmation: false,
        milestonePercentage: 0,
        completionPercentage: 100,
      };

      await paymentEscrow
        .connect(shipper)
        .createEscrow(1, carrier.address, conditions, { value: paymentAmount });
    });

    it("Should allow owner to release payment", async function () {
      const releaseAmount = ethers.parseEther("1.0");
      const initialBalance = await ethers.provider.getBalance(carrier.address);

      const tx = await paymentEscrow
        .connect(owner)
        .releasePayment(1, releaseAmount, "Test release");

      await expect(tx)
        .to.emit(paymentEscrow, "PaymentReleased")
        .withArgs(1, releaseAmount, carrier.address, "Test release");

      const finalBalance = await ethers.provider.getBalance(carrier.address);
      expect(finalBalance - initialBalance).to.equal(releaseAmount);
    });

    it("Should allow payer to release payment", async function () {
      const releaseAmount = ethers.parseEther("0.5");
      const tx = await paymentEscrow
        .connect(shipper)
        .releasePayment(1, releaseAmount, "Partial release");

      await expect(tx)
        .to.emit(paymentEscrow, "PaymentReleased")
        .withArgs(1, releaseAmount, carrier.address, "Partial release");
    });
  });

  describe("Trip Completion Release", function () {
    beforeEach(async function () {
      const paymentAmount = ethers.parseEther("1.0");
      const conditions = {
        requiresTripCompletion: true,
        requiresDeliveryProof: false,
        requiresReceiverConfirmation: false,
        milestonePercentage: 0,
        completionPercentage: 100,
      };

      await paymentEscrow
        .connect(shipper)
        .createEscrow(1, carrier.address, conditions, { value: paymentAmount });

      // Start and complete trip
      await tripRegistry.connect(carrier).startTrip(1);
      await tripRegistry.connect(carrier).completeTrip(1, 45, "QmProof");
    });

    it("Should release payment on trip completion", async function () {
      const initialBalance = await ethers.provider.getBalance(carrier.address);
      const escrowBalance = await paymentEscrow.getEscrowBalance(1);

      const tx = await paymentEscrow
        .connect(owner)
        .releaseOnTripCompletion(1, 1);

      await expect(tx)
        .to.emit(paymentEscrow, "PaymentReleased")
        .withArgs(1, escrowBalance, carrier.address, "Trip completed");

      const finalBalance = await ethers.provider.getBalance(carrier.address);
      expect(finalBalance - initialBalance).to.equal(escrowBalance);
    });
  });

  describe("View Functions", function () {
    beforeEach(async function () {
      const paymentAmount = ethers.parseEther("1.0");
      const conditions = {
        requiresTripCompletion: true,
        requiresDeliveryProof: false,
        requiresReceiverConfirmation: false,
        milestonePercentage: 0,
        completionPercentage: 100,
      };

      await paymentEscrow
        .connect(shipper)
        .createEscrow(1, carrier.address, conditions, { value: paymentAmount });
    });

    it("Should return correct escrow by trip ID", async function () {
      const escrowId = await paymentEscrow.getEscrowByTrip(1);
      expect(escrowId).to.equal(1);
    });

    it("Should return correct escrow balance", async function () {
      const balance = await paymentEscrow.getEscrowBalance(1);
      expect(balance).to.equal(ethers.parseEther("1.0"));
    });
  });
});

