const hre = require("hardhat");

async function main() {
  const contractAddresses = {
    TripRegistry: process.env.TRIP_REGISTRY_ADDRESS || "",
    PaymentEscrow: process.env.PAYMENT_ESCROW_ADDRESS || "",
    CarbonCredits: process.env.CARBON_CREDITS_ADDRESS || "",
  };

  console.log("Verifying contracts on Polygon Mumbai...\n");

  // Verify TripRegistry
  if (contractAddresses.TripRegistry) {
    console.log("Verifying TripRegistry...");
    try {
      await hre.run("verify:verify", {
        address: contractAddresses.TripRegistry,
        constructorArguments: [],
        network: "polygonMumbai",
      });
      console.log("✅ TripRegistry verified\n");
    } catch (error) {
      console.error("❌ TripRegistry verification failed:", error.message);
    }
  }

  // Verify PaymentEscrow (needs constructor argument)
  if (contractAddresses.PaymentEscrow && contractAddresses.TripRegistry) {
    console.log("Verifying PaymentEscrow...");
    try {
      await hre.run("verify:verify", {
        address: contractAddresses.PaymentEscrow,
        constructorArguments: [contractAddresses.TripRegistry],
        network: "polygonMumbai",
      });
      console.log("✅ PaymentEscrow verified\n");
    } catch (error) {
      console.error("❌ PaymentEscrow verification failed:", error.message);
    }
  }

  // Verify CarbonCredits
  if (contractAddresses.CarbonCredits) {
    console.log("Verifying CarbonCredits...");
    try {
      await hre.run("verify:verify", {
        address: contractAddresses.CarbonCredits,
        constructorArguments: [],
        network: "polygonMumbai",
      });
      console.log("✅ CarbonCredits verified\n");
    } catch (error) {
      console.error("❌ CarbonCredits verification failed:", error.message);
    }
  }

  console.log("Verification complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

