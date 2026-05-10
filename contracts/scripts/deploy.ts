import { ethers, network } from "hardhat";

async function main() {
  console.log(`\nDeploying CeloSave to ${network.name}...`);

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "CELO");

  // Deploy CeloSave contract
  const CeloSave = await ethers.getContractFactory("CeloSave");
  const celoSave = await CeloSave.deploy();
  await celoSave.waitForDeployment();

  const address = await celoSave.getAddress();
  console.log("\n✅ CeloSave deployed to:", address);
  console.log("Network:", network.name);
  console.log("Chain ID:", network.config.chainId);

  // Write deployment info
  const deploymentInfo = {
    contractName: "CeloSave",
    address: address,
    network: network.name,
    chainId: network.config.chainId,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
  };

  console.log("\nDeployment Info:", JSON.stringify(deploymentInfo, null, 2));

  if (network.name === "celo" || network.name === "alfajores") {
    const explorerUrl = network.name === "celo"
      ? `https://celoscan.io/address/${address}`
      : `https://alfajores.celoscan.io/address/${address}`;
    console.log("\nView on explorer:", explorerUrl);

    console.log("\nTo verify contract:");
    console.log(`npx hardhat verify --network ${network.name} ${address}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
