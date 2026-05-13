<div align="center">

<img src="https://img.shields.io/badge/RPCForge-Live-6467f2?style=for-the-badge&logo=ethereum&logoColor=white" />
<img src="https://img.shields.io/badge/Node.js-20-339933?style=for-the-badge&logo=node.js&logoColor=white" />
<img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
<img src="https://img.shields.io/badge/Deployed-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white" />
<img src="https://img.shields.io/badge/Frontend-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" />
<a href="https://www.npmjs.com/package/rpcforge-cli"><img src="https://img.shields.io/npm/v/rpcforge-cli?style=for-the-badge&logo=npm&logoColor=white&color=CB3837" /></a>

<br /><br />

```
  ██████╗ ██████╗  ██████╗███████╗ ██████╗ ██████╗  ██████╗ ███████╗
  ██╔══██╗██╔══██╗██╔════╝██╔════╝██╔═══██╗██╔══██╗██╔════╝ ██╔════╝
  ██████╔╝██████╔╝██║     █████╗  ██║   ██║██████╔╝██║  ███╗█████╗
  ██╔══██╗██╔═══╝ ██║     ██╔══╝  ██║   ██║██╔══██╗██║   ██║██╔══╝
  ██║  ██║██║     ╚██████╗██║     ╚██████╔╝██║  ██║╚██████╔╝███████╗
  ╚═╝  ╚═╝╚═╝      ╚═════╝╚═╝      ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚══════╝
```

### Multi-chain Ethereum RPC Gateway — Fast, Reliable, Developer-First

**[Live App](https://rpc-forge.vercel.app)** · **[Dashboard](https://rpc-forge.vercel.app/dashboard)** · **[npm CLI](https://www.npmjs.com/package/rpcforge-cli)**

</div>

---

## What is RPCForge?

RPCForge is a **production-ready multi-chain RPC gateway** built for Web3 developers. Instead of paying per-request to Infura or Alchemy, RPCForge gives you a single reliable endpoint with API key auth, rate limiting, response caching, multi-node failover, and a real-time dashboard — all managed through a clean web UI.

Sign up, get an API key, and start making RPC calls in under 2 minutes.

---

## ⚡ Why RPCForge?

| Problem | RPCForge Solution |
|---|---|
| Infura/Alchemy charge per request | Flat monthly pricing, no per-call fees |
| No visibility into RPC traffic | Real-time dashboard with live logs & charts |
| Rate limits kill dApps at peak | Per-tier limits up to 500 req/min |
| Managing multiple chain endpoints | One gateway, 5 chains, one API key |
| No CLI tooling | Full-featured `rpcforge-cli` on npm |

---

## 🚀 Quick Start

### Use the hosted version (recommended)

1. Sign up at [rpc-forge.vercel.app](https://rpc-forge.vercel.app)
2. Create an API key from the dashboard
3. Start making requests:

```bash
curl -X POST https://rpcforge.onrender.com/eth \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

### Or use the CLI

```bash
npm install -g rpcforge-cli
rpcforge init
```

---

## Features

| Feature | Description |
|---|---|
| **5 Chains** | Ethereum, Polygon, BSC, Arbitrum, Sepolia |
| **Multi-node Failover** | Shuffles across nodes, retries on failure automatically |
| **Per-key Rate Limiting** | Free: 20 · Dev: 60 · Pro: 200 · Team: 500 req/min |
| **Response Caching** | TTL cache for `eth_blockNumber`, `eth_chainId`, `eth_gasPrice` |
| **Method Blacklist** | Blocks dangerous methods like `eth_sendRawTransaction` by default |
| **Real-time Dashboard** | WebSocket-powered live feed, traffic charts, latency tracker |
| **Chain Breakdown** | See request distribution across chains with visual charts |
| **Key Analytics** | Per-key stats, error rates, top methods, 7-day sparkline |
| **Stripe Billing** | Free / Dev / Pro / Team plans with Stripe Checkout |
| **API Key Manager** | Create, revoke, and manage keys from the dashboard |
| **RPC Playground** | Test any RPC method directly from your browser |
| **CLI Tool** | Full terminal interface — init, test, keys, stats |

---

## Pricing

| Plan | Price | Requests/day | Rate limit |
|---|---|---|---|
| Free | $0 | 100k | 20 req/min |
| Dev | $9/mo | 1M | 60 req/min |
| Pro | $29/mo | 10M | 200 req/min |
| Team | $99/mo | Unlimited | 500 req/min |

---

## Supported Chains

| Chain | Endpoint |
|---|---|
| Ethereum Mainnet | `POST /eth` |
| Ethereum Sepolia | `POST /sepolia` |
| Polygon | `POST /polygon` |
| BSC | `POST /bsc` |
| Arbitrum | `POST /arbitrum` |

---

## Code Examples

### ethers.js
```javascript
import { ethers } from "ethers";

const provider = new ethers.JsonRpcProvider(
  "https://rpcforge.onrender.com/eth",
  undefined,
  {
    fetchOptions: {
      headers: { "x-api-key": "YOUR_API_KEY" }
    }
  }
);

const blockNumber = await provider.getBlockNumber();
const balance = await provider.getBalance("0x...");
```

### viem
```typescript
import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';

const client = createPublicClient({
  chain: mainnet,
  transport: http("https://rpcforge.onrender.com/eth", {
    fetchOptions: {
      headers: { "x-api-key": "YOUR_API_KEY" }
    }
  })
});

const blockNumber = await client.getBlockNumber();
```

### wagmi
```typescript
import { createConfig, http } from 'wagmi';
import { mainnet, polygon, arbitrum } from 'wagmi/chains';

export const config = createConfig({
  chains: [mainnet, polygon, arbitrum],
  transports: {
    [mainnet.id]: http("https://rpcforge.onrender.com/eth", {
      fetchOptions: { headers: { "x-api-key": "YOUR_KEY" }}
    }),
    [polygon.id]: http("https://rpcforge.onrender.com/polygon", {
      fetchOptions: { headers: { "x-api-key": "YOUR_KEY" }}
    }),
    [arbitrum.id]: http("https://rpcforge.onrender.com/arbitrum", {
      fetchOptions: { headers: { "x-api-key": "YOUR_KEY" }}
    }),
  },
});
```

### Hardhat
```javascript
module.exports = {
  networks: {
    mainnet: {
      url: "https://rpcforge.onrender.com/eth",
      headers: { "x-api-key": process.env.RPCFORGE_API_KEY },
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};
```

---

## CLI

```bash
npm install -g rpcforge-cli
```

| Command | Description |
|---|---|
| `rpcforge init` | Setup your endpoint & get usage examples |
| `rpcforge test` | Send a live `eth_blockNumber` test request |
| `rpcforge keys` | List all your API keys |
| `rpcforge keys create` | Create a new API key |
| `rpcforge keys revoke` | Revoke an API key |
| `rpcforge stats` | Show total requests, errors, top methods |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client / dApp                        │
└──────────────────────────┬──────────────────────────────────┘
                           │  POST /{chain}
                           │  x-api-key: <your_key>
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                     RPCForge Server                         │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────┐  │
│  │ API Key  │  │  Rate    │  │ Method   │  │   Cache   │  │
│  │  Auth    │→ │ Limiter  │→ │Blacklist │→ │  (TTL)    │  │
│  └──────────┘  └──────────┘  └──────────┘  └─────┬─────┘  │
│                                                   │        │
│  ┌────────────────────────────────────────────────▼──────┐ │
│  │              Multi-node Failover Router               │ │
│  └───────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         WebSocket Broadcast (live logs)             │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

**Backend** — Node.js 20, Express, WebSocket (`ws`), Upstash Redis, Supabase, Stripe, Axios

**Frontend** — React 18, Vite, Tailwind CSS, Chart.js, Supabase Auth, React Router v7

**CLI** — Node.js, Chalk, Inquirer, Ora, Axios

**Infrastructure** — Render (backend), Vercel (frontend), Supabase (auth + database), Stripe (billing), Upstash (Redis cache)

---

## Project Structure

```
RPCForge/
├── server.js              # Express + WebSocket backend
├── supabase-migration.sql # Database schema + RLS policies
├── Dockerfile
├── docker-compose.yml
│
├── frontend/              # React + Vite dashboard
│   └── src/
│       ├── App.jsx
│       ├── LandingPage.jsx
│       ├── SignupPage.jsx
│       ├── Dashboard.jsx
│       └── supabase.js
│
└── cli/                   # npm package: rpcforge-cli
    ├── index.js
    └── bin/rpcforge.js
```

---

## API Reference

All requests require `x-api-key` header. Admin routes require `Authorization: Bearer <jwt>`.

| Method | Route | Auth | Description |
|---|---|---|---|
| `POST` | `/{chain}` | API Key | Forward RPC request |
| `GET` | `/stats` | JWT | Total requests, errors, top methods |
| `GET` | `/logs` | JWT | Last 200 request logs |
| `GET` | `/keys` | JWT | List API keys |
| `POST` | `/keys` | JWT | Create a key |
| `DELETE` | `/keys/:key` | JWT | Revoke a key |
| `GET` | `/chains` | Public | List supported chains |
| `GET` | `/health` | Public | Health check |
| `POST` | `/billing/create-checkout` | JWT | Start Stripe checkout |
| `GET` | `/billing/status` | JWT | Get current plan |

---

## Rate Limits

Exceeding your tier limit returns:
```json
{ "error": "Rate limit exceeded. Too many requests." }
```

## Blocked Methods

`eth_sendRawTransaction`, `eth_sign`, `personal_sign` are blocked by default.

---

## Contributing

1. Fork the repo
2. Create a branch: `git checkout -b feature/your-feature`
3. Commit: `git commit -m 'Add your feature'`
4. Push and open a Pull Request

---

## License

MIT © 2025 [Mayur](https://github.com/0xMayurrr)

---

<div align="center">

**[Live App](https://rpc-forge.vercel.app)** · **[Dashboard](https://rpc-forge.vercel.app/dashboard)** · **[npm CLI](https://www.npmjs.com/package/rpcforge-cli)** · **[GitHub](https://github.com/0xMayurrr/RPCForge)**

Made with ⚡ by [Mayur](https://github.com/0xMayurrr)

</div>
