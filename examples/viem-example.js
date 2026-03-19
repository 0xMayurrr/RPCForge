// RPCForge + viem Example
import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';

const client = createPublicClient({
  chain: mainnet,
  transport: http("https://rpcforge-production.up.railway.app/eth", {
    fetchOptions: {
      headers: { "x-api-key": "your_api_key_here" }
    }
  })
});

async function main() {
  const blockNumber = await client.getBlockNumber();
  console.log("Current block:", blockNumber);

  const balance = await client.getBalance({ 
    address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb' 
  });
  console.log("Balance:", balance);
}

main();
