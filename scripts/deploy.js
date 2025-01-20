// const { ethers } = require("hardhat");
const { Ignition } = require("@nomicfoundation/hardhat-ignition");
const deploymentModule = require("../ignition/modules/NFT_Indeed");

// async function main() {
//     // Contracts deployer
//     const [deployer] = await ethers.getSigners();

//     if (!deployer || !deployer.address) {
//         throw new Error("Deployer is undefined or address is missing. Check Hardhat configuration.");
//     }

//     console.log("Deployer object:", deployer);
//     console.log('Contracts deployed with the account:', deployer.address);

//     // Get the balance of the deployer's wallet
//     try {
//         const deployerBalance = await deployer.provider.getBalance(deployer.address);
//         console.log('Deployer balance:', ethers.formatEther(deployerBalance), "ETH");
//     } catch (err) {
//         console.error("Error fetching deployer balance:", err);
//         throw err;
//     }

//     try {
//         // NFT In-Deed Marketplace contract deployment
//         const NFT_in_Deed_Market = await ethers.getContractFactory('Market');
//         const marketContract = await NFT_in_Deed_Market.deploy();
//         await marketContract.waitForDeployment();
//         console.log('NFT-in-Deed Market deployed to:', marketContract.target);

//         // NFT In-Deed Token contract deployment
//         const HouseNFT = await ethers.getContractFactory('HouseNFT');
//         const deedTokenContract = await HouseNFT.deploy(marketContract.target);
//         await deedTokenContract.waitForDeployment();
//         console.log('house deployed to:', deedTokenContract.target);
//     } catch (err) {
//         console.error("Error deploying contracts: ", err);
//     }
// }

async function main() {
    // Initialize Ignition with the desired network
    const ignition = new Ignition(hre, "sepolia");

    console.log("Starting deployment...");

    try {
        // Deploy the contracts using the deployment module
        const result = await ignition.deploy(deploymentModule);

        // Log deployed addresses
        console.log("Deployment successful!");
        console.log("Market Contract Address:", result.marketContract.target);
        console.log("HouseNFT Contract Address:", result.houseNFT.target);
    } catch (err) {
        console.error("Deployment failed:", err);
    }
}

main()
    .then(() => process.exit(0))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });