const hre = require("hardhat");

async function main() {
  console.log("Deploying DecentraLogix contracts to Polygon Mumbai Testnet...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "MATIC\n");

  if (balance === 0n) {
    throw new Error("Insufficient balance. Please fund your account with MATIC.");
  }

  // Deploy TripRegistry
  console.log("1. Deploying TripRegistry...");
  const TripRegistry = await hre.ethers.getContractFactory("TripRegistry");
  const tripRegistry = await TripRegistry.deploy();
  await tripRegistry.waitForDeployment();
  const tripRegistryAddress = await tripRegistry.getAddress();
  console.log("✅ TripRegistry deployed to:", tripRegistryAddress);

  // Wait for block confirmation
  console.log("   Waiting for confirmation...");
  await tripRegistry.deploymentTransaction()?.wait(5);

  // Deploy PaymentEscrow
  console.log("\n2. Deploying PaymentEscrow...");
  const PaymentEscrow = await hre.ethers.getContractFactory("PaymentEscrow");
  const paymentEscrow = await PaymentEscrow.deploy(tripRegistryAddress);
  await paymentEscrow.waitForDeployment();
  const paymentEscrowAddress = await paymentEscrow.getAddress();
  console.log("✅ PaymentEscrow deployed to:", paymentEscrowAddress);

  // Wait for block confirmation
  console.log("   Waiting for confirmation...");
  await paymentEscrow.deploymentTransaction()?.wait(5);

  // Deploy CarbonCredits
  console.log("\n3. Deploying CarbonCredits...");
  const CarbonCredits = await hre.ethers.getContractFactory("CarbonCredits");
  const carbonCredits = await CarbonCredits.deploy();
  await carbonCredits.waitForDeployment();
  const carbonCreditsAddress = await carbonCredits.getAddress();
  console.log("✅ CarbonCredits deployed to:", carbonCreditsAddress);

  // Wait for block confirmation
  console.log("   Waiting for confirmation...");
  await carbonCredits.deploymentTransaction()?.wait(5);

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("=== Deployment Summary ===");
  console.log("=".repeat(60));
  console.log("Network: Polygon Mumbai Testnet");
  console.log("Chain ID: 80001");
  console.log("Deployer:", deployer.address);
  console.log("\nContract Addresses:");
  console.log("TripRegistry:", tripRegistryAddress);
  console.log("PaymentEscrow:", paymentEscrowAddress);
  console.log("CarbonCredits:", carbonCreditsAddress);
  console.log("=".repeat(60) + "\n");

  // Save deployment info
  const network = await hre.ethers.provider.getNetwork();
  const deploymentInfo = {
    network: "polygonMumbai",
    chainId: Number(network.chainId),
    deployer: deployer.address,
    contracts: {
      TripRegistry: tripRegistryAddress,
      PaymentEscrow: paymentEscrowAddress,
      CarbonCredits: carbonCreditsAddress,
    },
    timestamp: new Date().toISOString(),
    explorer: "https://mumbai.polygonscan.com",
  };

  console.log("=== Deployment Info (JSON) ===");
  console.log(JSON.stringify(deploymentInfo, null, 2));
  console.log("\n");

  // Verification instructions
  console.log("=== Next Steps ===");
  console.log("1. Verify contracts on Polygonscan:");
  console.log(`   npx hardhat verify --network polygonMumbai ${tripRegistryAddress}`);
  console.log(`   npx hardhat verify --network polygonMumbai ${paymentEscrowAddress} ${tripRegistryAddress}`);
  console.log(`   npx hardhat verify --network polygonMumbai ${carbonCreditsAddress}`);
  console.log("\n2. Update backend .env with contract addresses");
  console.log("3. Update frontend .env with contract addresses");
  console.log("4. Update REACT_APP_CHAIN_ID to 80001\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

