<div align="center">

<br />

<img src="https://img.shields.io/badge/RPCForge-Live-6467f2?style=for-the-badge&logo=ethereum&logoColor=white" />
<img src="https://img.shields.io/badge/Status-Production-22c55e?style=for-the-badge" />
<img src="https://img.shields.io/badge/Chains-5-6467f2?style=for-the-badge" />
<a href="https://www.npmjs.com/package/rpcforge-cli"><img src="https://img.shields.io/npm/v/rpcforge-cli?style=for-the-badge&logo=npm&logoColor=white&color=CB3837" /></a>

<br /><br />

<h1>⚡ RPCForge</h1>

<h3>The RPC Gateway Built for Web3 Developers</h3>

<p>One endpoint. Five chains. Real-time dashboard. No per-request fees.</p>

<br />

<a href="https://rpc-forge.vercel.app"><img src="https://img.shields.io/badge/Get%20Started%20Free-6467f2?style=for-the-badge" /></a>
&nbsp;
<a href="https://rpc-forge.vercel.app/dashboard"><img src="https://img.shields.io/badge/Live%20Dashboard-18181b?style=for-the-badge" /></a>
&nbsp;
<a href="https://www.producthunt.com/products/rpcforge-own-your-rpc"><img src="https://img.shields.io/badge/Product%20Hunt-FF6154?style=for-the-badge&logo=producthunt&logoColor=white" /></a>

<br /><br />

</div>

---

## What is RPCForge?

RPCForge is a **hosted multi-chain RPC gateway** that gives Web3 developers a single, reliable endpoint to interact with Ethereum, Polygon, BSC, Arbitrum, and Sepolia — without paying per-request fees to Infura or Alchemy.

Sign up → get an API key → start building. That's it.

```bash
curl -X POST https://rpcforge.onrender.com/eth \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

---

## The Problem

Every Web3 developer hits this wall:

- 💸 **Infura & Alchemy charge per request** — costs spiral as your dApp grows
- 🔍 **Zero visibility** into your RPC traffic, errors, or latency
- 🚫 **Rate limits** that kill your app during peak usage
- 🔗 **Multiple endpoints** to manage across different chains
- 🖥️ **No CLI** for scripting, CI/CD, or terminal workflows

## The Solution

RPCForge gives you everything in one place:

✅ Flat monthly pricing — no per-call fees ever  
✅ Real-time dashboard with live logs, charts, and latency tracking  
✅ Per-tier rate limits up to 500 req/min  
✅ One API key for all 5 chains  
✅ Full-featured CLI on npm  

---

## Features

### 🌐 Multi-Chain Gateway
One API key works across all supported chains. No separate accounts, no separate billing.

| Chain | Endpoint |
|---|---|
| Ethereum Mainnet | `POST /eth` |
| Polygon | `POST /polygon` |
| BSC | `POST /bsc` |
| Arbitrum | `POST /arbitrum` |
| Ethereum Sepolia | `POST /sepolia` |

### 📊 Real-Time Dashboard
- **Live traffic feed** — WebSocket-powered request log with sub-second updates
- **Traffic chart** — visualize request volume over time
- **Chain breakdown** — see which chains you use most
- **Latency tracker** — avg response times per chain
- **Request heatmap** — 24-hour traffic visualization

### 🔑 API Key Management
- Create multiple keys per account
- Per-key analytics — requests, error rate, top methods, 7-day sparkline
- Revoke keys instantly
- Tier-based rate limiting per key

### 🛡️ Built-in Security
- Method blacklist — blocks `eth_sendRawTransaction`, `eth_sign`, `personal_sign` by default
- JWT-authenticated dashboard API
- Per-key rate limiting with Redis
- Supabase Row Level Security on all data

### ⚡ Performance
- **Multi-node failover** — shuffles across nodes, retries on failure automatically
- **Response caching** — TTL cache for `eth_blockNumber`, `eth_chainId`, `eth_gasPrice`
- **Upstash Redis** — distributed cache with in-memory fallback

### 🧪 RPC Playground
Test any RPC method directly from your browser — no curl, no code. Pick a chain, pick a method, hit send.

### 💳 Stripe Billing
Full subscription management with Stripe Checkout and Customer Portal.

---

## Quick Start

### 1. Sign up
Go to [rpc-forge.vercel.app](https://rpc-forge.vercel.app) and create a free account.

### 2. Get your API key
From the dashboard → API Keys → New Free Key.

### 3. Make your first request

```bash
curl -X POST https://rpcforge.onrender.com/eth \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

### 4. Integrate with your stack

**ethers.js**
```javascript
import { ethers } from "ethers";

const provider = new ethers.JsonRpcProvider(
  "https://rpcforge.onrender.com/eth",
  undefined,
  { fetchOptions: { headers: { "x-api-key": "YOUR_API_KEY" } } }
);
```

**viem**
```typescript
import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';

const client = createPublicClient({
  chain: mainnet,
  transport: http("https://rpcforge.onrender.com/eth", {
    fetchOptions: { headers: { "x-api-key": "YOUR_API_KEY" } }
  })
});
```

**wagmi**
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

**Hardhat**
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

The fastest way to manage RPCForge from your terminal.

```bash
npm install -g rpcforge-cli
rpcforge init
```

| Command | Description |
|---|---|
| `rpcforge init` | Configure your endpoint and get integration examples |
| `rpcforge test` | Send a live test request and verify your setup |
| `rpcforge keys` | List all your API keys |
| `rpcforge keys create` | Create a new API key |
| `rpcforge keys revoke` | Revoke an API key |
| `rpcforge stats` | View total requests, errors, and top methods |

---

## Pricing

| Plan | Price | Requests/day | Rate limit |
|---|---|---|---|
| **Free** | $0 | 100,000 | 20 req/min |
| **Dev** | $9/mo | 1,000,000 | 60 req/min |
| **Pro** | $29/mo | 10,000,000 | 200 req/min |
| **Team** | $99/mo | Unlimited | 500 req/min |

No credit card required to start. Upgrade anytime from the dashboard.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Node.js 20, Express, WebSocket (`ws`) |
| **Database & Auth** | Supabase (PostgreSQL + Auth) |
| **Cache** | Upstash Redis |
| **Billing** | Stripe |
| **Frontend** | React 18, Vite, Tailwind CSS, Chart.js |
| **Routing** | React Router v7 |
| **CLI** | Node.js, Chalk, Inquirer, Ora |
| **Backend Hosting** | Render |
| **Frontend Hosting** | Vercel |

---

## Architecture

```
Client / dApp
     │
     │  POST /{chain}  +  x-api-key
     ▼
┌─────────────────────────────────────┐
│           RPCForge Gateway          │
│                                     │
│  API Key Auth → Rate Limit →        │
│  Method Blacklist → Redis Cache →   │
│  Multi-node Failover Router         │
│                                     │
│  WebSocket → Live Dashboard         │
└─────────────────────────────────────┘
     │
     ├── Ethereum nodes
     ├── Polygon nodes
     ├── BSC nodes
     ├── Arbitrum nodes
     └── Sepolia nodes
```

---

## API Reference

All RPC requests require `x-api-key` header.  
Dashboard API routes require `Authorization: Bearer <supabase_jwt>`.

| Method | Route | Auth | Description |
|---|---|---|---|
| `POST` | `/{chain}` | API Key | Forward JSON-RPC request |
| `GET` | `/keys` | JWT | List API keys |
| `POST` | `/keys` | JWT | Create API key |
| `DELETE` | `/keys/:key` | JWT | Revoke API key |
| `GET` | `/stats` | JWT | Request stats and top methods |
| `GET` | `/logs` | JWT | Last 200 request logs |
| `GET` | `/chains` | Public | List supported chains |
| `GET` | `/health` | Public | Health check |
| `POST` | `/billing/create-checkout` | JWT | Start Stripe checkout |
| `GET` | `/billing/status` | JWT | Get current plan |

---

## Contributing

RPCForge is open source. Contributions are welcome.

```bash
git clone https://github.com/0xMayurrr/RPCForge.git
cd RPCForge

# Backend
npm install
node server.js

# Frontend
cd frontend && npm install && npm run dev
```

1. Fork the repo
2. Create a branch: `git checkout -b feature/your-feature`
3. Commit and push
4. Open a Pull Request

---

## License

MIT © 2025 [Mayur](https://github.com/0xMayurrr)

---

<div align="center">

**[Live App](https://rpc-forge.vercel.app)** · **[Dashboard](https://rpc-forge.vercel.app/dashboard)** · **[npm CLI](https://www.npmjs.com/package/rpcforge-cli)** · **[Product Hunt](https://www.producthunt.com/products/rpcforge-own-your-rpc)**

<br />

Made with ⚡ by [Mayur](https://github.com/0xMayurrr)

<br />

⭐ Star this repo if RPCForge saves you money on RPC costs

</div>
