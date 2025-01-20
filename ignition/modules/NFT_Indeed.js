const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("NFT_Indeed", m => {
    // deploy market first
    const marketContract = m.contract("Market", []);
    // deploy contract that controls each tokenized house on the market 
    const houseNFTContract = m.contract("HouseNFT", { args: [marketContract] });

    return { marketContract, houseNFTContract };
})