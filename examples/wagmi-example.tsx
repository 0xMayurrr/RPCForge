// RPCForge + wagmi Example
import { createConfig, http } from 'wagmi';
import { mainnet, polygon, arbitrum } from 'wagmi/chains';
import { WagmiProvider } from 'wagmi';

const API_KEY = process.env.NEXT_PUBLIC_RPCFORGE_API_KEY ?? '';

export const config = createConfig({
  chains: [mainnet, polygon, arbitrum],
  transports: {
    [mainnet.id]: http("https://rpcforge-production.up.railway.app/eth", {
      fetchOptions: { headers: { "x-api-key": API_KEY }}
    }),
    [polygon.id]: http("https://rpcforge-production.up.railway.app/polygon", {
      fetchOptions: { headers: { "x-api-key": API_KEY }}
    }),
    [arbitrum.id]: http("https://rpcforge-production.up.railway.app/arbitrum", {
      fetchOptions: { headers: { "x-api-key": API_KEY }}
    }),
  },
});

function App() {
  return (
    <WagmiProvider config={config}>
      {/* Your app */}
    </WagmiProvider>
  );
}
