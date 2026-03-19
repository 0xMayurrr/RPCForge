// RPCForge + ethers.js Example
import { ethers } from "ethers";

const RPCFORGE_URL = "https://rpcforge-production.up.railway.app/eth";
const API_KEY = "your_api_key_here";

const provider = new ethers.JsonRpcProvider(
  RPCFORGE_URL,
  undefined,
  { 
    fetchOptions: {
      headers: { "x-api-key": API_KEY } 
    }
  }
);

async function main() {
  // Get block number
  const blockNumber = await provider.getBlockNumber();
  console.log("Current block:", blockNumber);

  // Get balance
  const balance = await provider.getBalance("0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb");
  console.log("Balance:", ethers.formatEther(balance), "ETH");

  // Get gas price
  const feeData = await provider.getFeeData();
  console.log("Gas price:", ethers.formatUnits(feeData.gasPrice, "gwei"), "gwei");
}

main();
