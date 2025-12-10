const hre = require("hardhat");

async function main() {
  console.log("Deploying DecentraLogix contracts...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());

  // Deploy TripRegistry
  console.log("\n1. Deploying TripRegistry...");
  const TripRegistry = await hre.ethers.getContractFactory("TripRegistry");
  const tripRegistry = await TripRegistry.deploy();
  await tripRegistry.waitForDeployment();
  const tripRegistryAddress = await tripRegistry.getAddress();
  console.log("TripRegistry deployed to:", tripRegistryAddress);

  // Deploy PaymentEscrow
  console.log("\n2. Deploying PaymentEscrow...");
  const PaymentEscrow = await hre.ethers.getContractFactory("PaymentEscrow");
  const paymentEscrow = await PaymentEscrow.deploy(tripRegistryAddress);
  await paymentEscrow.waitForDeployment();
  const paymentEscrowAddress = await paymentEscrow.getAddress();
  console.log("PaymentEscrow deployed to:", paymentEscrowAddress);

  // Deploy CarbonCredits
  console.log("\n3. Deploying CarbonCredits...");
  const CarbonCredits = await hre.ethers.getContractFactory("CarbonCredits");
  const carbonCredits = await CarbonCredits.deploy();
  await carbonCredits.waitForDeployment();
  const carbonCreditsAddress = await carbonCredits.getAddress();
  console.log("CarbonCredits deployed to:", carbonCreditsAddress);

  // Summary
  console.log("\n=== Deployment Summary ===");
  console.log("TripRegistry:", tripRegistryAddress);
  console.log("PaymentEscrow:", paymentEscrowAddress);
  console.log("CarbonCredits:", carbonCreditsAddress);
  console.log("\nDeployment completed successfully!");

  // Save deployment addresses (optional - for frontend/backend)
  const network = await hre.ethers.provider.getNetwork();
  const deploymentInfo = {
    network: hre.network.name,
    chainId: Number(network.chainId),
    deployer: deployer.address,
    contracts: {
      TripRegistry: tripRegistryAddress,
      PaymentEscrow: paymentEscrowAddress,
      CarbonCredits: carbonCreditsAddress,
    },
    timestamp: new Date().toISOString(),
  };

  console.log("\n=== Deployment Info (JSON) ===");
  console.log(JSON.stringify(deploymentInfo, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

