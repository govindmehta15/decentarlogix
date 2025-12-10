const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CarbonCredits", function () {
  let carbonCredits;
  let owner;
  let recipient;
  let addr1;

  beforeEach(async function () {
    [owner, recipient, addr1] = await ethers.getSigners();

    const CarbonCredits = await ethers.getContractFactory("CarbonCredits");
    carbonCredits = await CarbonCredits.deploy();
    await carbonCredits.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await carbonCredits.owner()).to.equal(owner.address);
    });

    it("Should have correct name and symbol", async function () {
      expect(await carbonCredits.name()).to.equal("DecentraLogix Carbon Credits");
      expect(await carbonCredits.symbol()).to.equal("DLXCC");
    });

    it("Should have default reward parameters", async function () {
      const params = await carbonCredits.getRewardParameters();
      expect(params.baseMultiplier).to.equal(100);
      expect(params.lowCarbonBonus).to.equal(20);
      expect(params.carbonNeutralBonus).to.equal(50);
    });
  });

  describe("Minting Rewards", function () {
    it("Should mint credits for trip completion", async function () {
      const carbonOffset = 100; // kg CO2
      const rewardType = 0; // TripCompletion

      const tx = await carbonCredits
        .connect(owner)
        .mintReward(recipient.address, 1, carbonOffset, rewardType);

      await expect(tx)
        .to.emit(carbonCredits, "CarbonCreditsMinted")
        .withArgs(1, recipient.address, 1, 10000, carbonOffset, rewardType);

      // Check balance (100 kg * 100 multiplier = 10000 credits)
      expect(await carbonCredits.balanceOf(recipient.address)).to.equal(10000);
    });

    it("Should calculate bonus for low carbon footprint", async function () {
      const carbonOffset = 100;
      const rewardType = 1; // LowCarbonFootprint

      await carbonCredits
        .connect(owner)
        .mintReward(recipient.address, 1, carbonOffset, rewardType);

      // Base: 100 * 100 = 10000
      // Bonus: 10000 * 20% = 2000
      // Total: 12000
      expect(await carbonCredits.balanceOf(recipient.address)).to.equal(12000);
    });

    it("Should calculate bonus for carbon neutral", async function () {
      const carbonOffset = 100;
      const rewardType = 2; // CarbonNeutral

      await carbonCredits
        .connect(owner)
        .mintReward(recipient.address, 1, carbonOffset, rewardType);

      // Base: 100 * 100 = 10000
      // Bonus: 10000 * 50% = 5000
      // Total: 15000
      expect(await carbonCredits.balanceOf(recipient.address)).to.equal(15000);
    });

    it("Should revert if non-owner tries to mint", async function () {
      await expect(
        carbonCredits
          .connect(addr1)
          .mintReward(recipient.address, 1, 100, 0)
      ).to.be.revertedWith("CarbonCredits: Not authorized minter");
    });

    it("Should track total carbon offset", async function () {
      await carbonCredits
        .connect(owner)
        .mintReward(recipient.address, 1, 100, 0);

      await carbonCredits
        .connect(owner)
        .mintReward(recipient.address, 2, 50, 0);

      const totalOffset = await carbonCredits.getTotalCarbonOffset(recipient.address);
      expect(totalOffset).to.equal(150);
    });
  });

  describe("Reward Calculation", function () {
    it("Should calculate reward correctly for trip completion", async function () {
      const amount = await carbonCredits.calculateReward(100, 0); // TripCompletion
      expect(amount).to.equal(10000); // 100 * 100
    });

    it("Should calculate reward with low carbon bonus", async function () {
      const amount = await carbonCredits.calculateReward(100, 1); // LowCarbonFootprint
      expect(amount).to.equal(12000); // 10000 + 20% bonus
    });

    it("Should calculate reward with carbon neutral bonus", async function () {
      const amount = await carbonCredits.calculateReward(100, 2); // CarbonNeutral
      expect(amount).to.equal(15000); // 10000 + 50% bonus
    });
  });

  describe("Burning Credits", function () {
    beforeEach(async function () {
      await carbonCredits
        .connect(owner)
        .mintReward(recipient.address, 1, 100, 0);
    });

    it("Should allow user to burn their credits", async function () {
      const burnAmount = 5000;
      const initialBalance = await carbonCredits.balanceOf(recipient.address);

      const tx = await carbonCredits
        .connect(recipient)
        .burnCredits(burnAmount, "Offsetting carbon");

      await expect(tx)
        .to.emit(carbonCredits, "CarbonCreditsBurned")
        .withArgs(recipient.address, burnAmount, "Offsetting carbon");

      const finalBalance = await carbonCredits.balanceOf(recipient.address);
      expect(finalBalance).to.equal(initialBalance - BigInt(burnAmount));
    });

    it("Should revert if user tries to burn more than balance", async function () {
      const balance = await carbonCredits.balanceOf(recipient.address);
      await expect(
        carbonCredits
          .connect(recipient)
          .burnCredits(balance + BigInt(1), "Test")
      ).to.be.revertedWith("CarbonCredits: Insufficient balance");
    });
  });

  describe("View Functions", function () {
    beforeEach(async function () {
      await carbonCredits
        .connect(owner)
        .mintReward(recipient.address, 1, 100, 0);
    });

    it("Should return reward details", async function () {
      const reward = await carbonCredits.getReward(1);
      expect(reward.rewardId).to.equal(1);
      expect(reward.recipient).to.equal(recipient.address);
      expect(reward.tripId).to.equal(1);
      expect(reward.amount).to.equal(10000);
      expect(reward.carbonOffset).to.equal(100);
    });

    it("Should return user rewards", async function () {
      const rewards = await carbonCredits.getUserRewards(recipient.address);
      expect(rewards.length).to.equal(1);
      expect(rewards[0]).to.equal(1);
    });
  });

  describe("Parameter Updates", function () {
    it("Should allow owner to update reward parameters", async function () {
      const newParams = {
        baseMultiplier: 150,
        lowCarbonBonus: 25,
        carbonNeutralBonus: 60,
        batchOptimizationBonus: 20,
      };

      const tx = await carbonCredits
        .connect(owner)
        .updateRewardParameters(newParams);

      await expect(tx)
        .to.emit(carbonCredits, "RewardParametersUpdated")
        .withArgs(150, 25, 60);

      const params = await carbonCredits.getRewardParameters();
      expect(params.baseMultiplier).to.equal(150);
      expect(params.lowCarbonBonus).to.equal(25);
    });

    it("Should revert if non-owner tries to update parameters", async function () {
      const newParams = {
        baseMultiplier: 150,
        lowCarbonBonus: 25,
        carbonNeutralBonus: 60,
        batchOptimizationBonus: 20,
      };

      await expect(
        carbonCredits
          .connect(addr1)
          .updateRewardParameters(newParams)
      ).to.be.revertedWithCustomError(carbonCredits, "OwnableUnauthorizedAccount");
    });
  });
});

