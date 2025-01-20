require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-ethers");
require("solidity-coverage");
require("@nomicfoundation/hardhat-ignition");
require("@nomicfoundation/hardhat-ethers");

const { INFURA_API_KEY, PRIVATE_KEY } = process.env;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    defaultNetwork: "sepolia",
    networks: {
        hardhat: {},
        goerli: {
            url: `https://goerli.infura.io/v3/${INFURA_API_KEY}`,
            accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
        },
        sepolia: {
            url: `https://sepolia.infura.io/v3/${INFURA_API_KEY}` || "",
            accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
        }
    },
    solidity: "0.8.17",
};
