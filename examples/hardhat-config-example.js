// Hardhat configuration with RPCForge
require("@nomiclabs/hardhat-ethers");
require("dotenv").config();

module.exports = {
  solidity: "0.8.19",
  networks: {
    mainnet: {
      url: "https://rpcforge-production.up.railway.app/eth",
      headers: { "x-api-key": process.env.RPCFORGE_API_KEY },
      accounts: [process.env.PRIVATE_KEY]
    },
    polygon: {
      url: "https://rpcforge-production.up.railway.app/polygon",
      headers: { "x-api-key": process.env.RPCFORGE_API_KEY },
      accounts: [process.env.PRIVATE_KEY]
    },
    sepolia: {
      url: "https://rpcforge-production.up.railway.app/sepolia",
      headers: { "x-api-key": process.env.RPCFORGE_API_KEY },
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};
