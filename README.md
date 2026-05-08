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

### Multi-chain Ethereum RPC you own and control

**[Live Demo](https://rpc-forge.vercel.app)** · **[Dashboard](https://rpc-forge.vercel.app/dashboard)** · **[API Docs](#api-reference)**

</div>

---

## ⚡ Why RPCForge?

**The Problem**:
- Infura/Alchemy charge per request and lock you into their platform
- No visibility into your RPC traffic
- Rate limits kill your dApp during peak usage
- Compliance issues with data residency

**The Solution**:
RPCForge gives you enterprise-grade RPC infrastructure you can self-host in 5 minutes. Full control, zero vendor lock-in, unlimited requests.

## 🎯 Who Should Use This?

✅ dApp developers tired of paying per API call  
✅ Projects requiring data sovereignty/compliance  
✅ Teams building on multiple chains  
✅ Anyone wanting full visibility into blockchain requests  
✅ Developers who need unlimited rate limits  

## 🚀 Quick Demo

**Live Instance**: [rpc-forge.vercel.app](https://rpc-forge.vercel.app)  
**Dashboard**: [rpc-forge.vercel.app/dashboard](https://rpc-forge.vercel.app/dashboard)  
**Test Endpoint**:
```bash
curl -X POST https://rpcforge.onrender.com/eth \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

---

## ⭐ Star This Repo!

If RPCForge saves you money or helps your project, give us a star! It helps others discover this tool.

[![GitHub stars](https://img.shields.io/github/stars/0xMayurrr/RPCForge?style=social)](https://github.com/0xMayurrr/RPCForge)

---

## What is RPCForge?

RPCForge is a self-hostable, production-ready RPC gateway that sits in front of your Ethereum nodes. It gives you a single, reliable endpoint with API key auth, per-tier rate limiting, method blacklisting, response caching, multi-node failover, Stripe billing, and a real-time WebSocket dashboard — all in one.

Built for developers who want **Infura/Alchemy-level features** without the vendor lock-in.

---

## Features

| Feature | Description |
|---|---|
| **Multi-chain Support** | Ethereum, Polygon, BSC, Arbitrum, Sepolia out of the box |
| **Multi-node Failover** | Shuffles across your configured nodes, retries on failure |
| **Per-key Rate Limiting** | Free: 20 · Dev: 60 · Pro: 200 · Team: 500 req/min |
| **Response Caching** | TTL cache for `eth_blockNumber`, `eth_chainId`, `eth_gasPrice` |
| **Method Blacklist** | Blocks `eth_sendRawTransaction`, `eth_sign`, `personal_sign` by default |
| **Real-time Dashboard** | WebSocket-powered live feed, charts, and stats |
| **Stripe Billing** | Free / Dev / Pro / Team plans with Stripe Checkout + Customer Portal |
| **API Key Manager** | Create, revoke, and manage keys via UI |
| **Auth via Supabase** | Email/password auth, per-user API key provisioning |
| **CLI Tool** | Full-featured terminal interface for power users |
| **Docker Ready** | One command to spin up the full stack |

---

## Pricing

| Plan | Price | Requests/day | Rate limit |
|---|---|---|---|
| Free | $0 | 100k | 20 req/min |
| Dev | $9/mo | 1M | 60 req/min |
| Pro | $29/mo | 10M | 200 req/min |
| Team | $99/mo | Unlimited | 500 req/min |

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
│  │   Node 1 ──┐                                          │ │
│  │   Node 2 ──┼──► Shuffle & Retry on failure            │ │
│  │   Node N ──┘                                          │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         WebSocket Broadcast (live logs)             │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                           │
          ┌────────────────┼────────────────┐
          ▼                ▼                ▼
      Ethereum          Polygon            BSC
      Mainnet           Mainnet           Mainnet
      Sepolia           ...               Arbitrum
```

---

## Project Structure

```
mini-rpc-provider/
├── server.js              # Express + WebSocket backend
├── Dockerfile             # Production Docker image
├── docker-compose.yml     # Full stack (backend + frontend)
├── .env                   # Node URLs, API keys, secrets
├── package.json
│
├── frontend/              # React + Vite + Tailwind dashboard
│   └── src/
│       ├── App.jsx        # Router (/, /signup, /dashboard)
│       ├── LandingPage.jsx
│       ├── SignupPage.jsx  # Supabase auth (email/password)
│       ├── Dashboard.jsx   # Live stats, logs, key manager, billing
│       └── supabase.js
│
└── cli/                   # Node.js CLI tool
    ├── index.js           # Commands: init, test, keys, stats
    └── bin/rpcforge.js
```

---

## Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/0xMayurrr/RPCForge.git
cd RPCForge
npm install
```

### 2. Configure `.env`

```env
PORT=3000

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key

# Add your node URLs (Infura, Alchemy, or public nodes)
ETH_NODE_1=https://mainnet.infura.io/v3/<YOUR_KEY>
ETH_NODE_2=https://eth-mainnet.g.alchemy.com/v2/<YOUR_KEY>

SEPOLIA_NODE_1=https://eth-sepolia.g.alchemy.com/v2/<YOUR_KEY>

POLYGON_NODE_1=https://polygon-rpc.com
POLYGON_NODE_2=https://rpc-mainnet.matic.quiknode.pro

BSC_NODE_1=https://bsc-dataseed.binance.org
BSC_NODE_2=https://bsc-dataseed1.defibit.io

ARBITRUM_NODE_1=https://arb1.arbitrum.io/rpc
ARBITRUM_NODE_2=https://arbitrum-one.publicnode.com

# Stripe billing
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_DEV=price_...
STRIPE_PRICE_PRO=price_...
STRIPE_PRICE_TEAM=price_...
FRONTEND_URL=http://localhost:5173
```

### 3. Start the Server

```bash
node server.js
# RPCForge 🚀 running on port 3000
```

### 4. Start the Frontend

```bash
cd frontend
npm install
npm run dev
# http://localhost:5173
```

### 5. Or use Docker

```bash
docker-compose up --build
```

---

## 📦 One-Click Deploy

### Deploy Backend (Render)

1. Go to [render.com](https://render.com) → New → Web Service
2. Connect your GitHub repo
3. Set:
   - Build Command: `npm install`
   - Start Command: `node server.js`
4. Add all environment variables from `.env`
5. Deploy — you'll get a URL like `https://rpcforge.onrender.com`

### Deploy Frontend (Vercel)

1. Fork this repository
2. Click: [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/0xMayurrr/RPCForge/tree/main/frontend)
3. Set environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_API_BASE_URL` (your Render backend URL)

### Docker Deployment
```bash
docker-compose up -d
```

---

## 📚 Code Examples

### ethers.js Integration
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

### viem Integration
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

### wagmi Configuration
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

### Hardhat Configuration
```javascript
// hardhat.config.js
require("@nomiclabs/hardhat-ethers");

module.exports = {
  networks: {
    mainnet: {
      url: "https://rpcforge.onrender.com/eth",
      headers: { "x-api-key": process.env.RPCFORGE_API_KEY },
      accounts: [process.env.PRIVATE_KEY]
    },
    polygon: {
      url: "https://rpcforge.onrender.com/polygon",
      headers: { "x-api-key": process.env.RPCFORGE_API_KEY },
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};
```

---

## 🤝 Contributing

We love contributions! Check out our [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Quick Contribution Guide

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

**Good First Issues**: Check issues tagged with `good-first-issue`

---

## 🐛 Bug Reports & Feature Requests

Found a bug? Want a feature? [Open an issue](https://github.com/0xMayurrr/RPCForge/issues/new)

---

## 📞 Community & Support

- **Discord**: [Join our server](https://discord.gg/rpcforge) *(coming soon)*
- **GitHub Discussions**: [Ask questions](https://github.com/0xMayurrr/RPCForge/discussions)
- **Twitter**: [@RPCForge](https://twitter.com/rpcforge) *(coming soon)*

---

## 🗺️ Roadmap

- [ ] WebSocket support for `eth_subscribe`
- [ ] Prometheus metrics export
- [ ] GraphQL query layer
- [ ] Load balancing across regions
- [ ] Custom caching rules per method
- [ ] Webhook alerts for downtime
- [ ] Multi-tenant isolation

Vote on features in [GitHub Discussions](https://github.com/0xMayurrr/RPCForge/discussions)!

---

## ⚖️ License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

Built with ❤️ for the Ethereum community

Special thanks to:
- [ethers.js](https://docs.ethers.org/) and [viem](https://viem.sh/) teams
- [Supabase](https://supabase.com/) for auth infrastructure
- [Render](https://render.com/) and [Vercel](https://vercel.com/) for hosting
- [Stripe](https://stripe.com/) for billing infrastructure

---

## 💖 Support This Project

If RPCForge helps you save money on RPC costs:

- ⭐ Star this repo
- 🐦 Tweet about it
- 💬 Share in your Discord/Telegram
- ☕ [Buy me a coffee](https://github.com/sponsors/0xMayurrr) *(optional)*

Every star helps more developers discover this tool!

---

**Made with ⚡ by [Mayur](https://github.com/0xMayurrr)**

---

## API Reference

All RPC requests go to `POST /{chain}` with your API key in the header.

### Supported Chains

| Chain | Endpoint |
|---|---|
| Ethereum Mainnet | `POST /eth` |
| Ethereum Sepolia | `POST /sepolia` |
| Polygon | `POST /polygon` |
| BSC | `POST /bsc` |
| Arbitrum | `POST /arbitrum` |

### Make an RPC Request

```bash
curl -X POST https://rpcforge.onrender.com/eth \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

### ethers.js

```js
const provider = new ethers.JsonRpcProvider(
  "https://rpcforge.onrender.com/eth",
  undefined,
  { headers: { "x-api-key": "YOUR_API_KEY" } }
);
```

### viem

```js
const transport = http("https://rpcforge.onrender.com/eth", {
  fetchOptions: { headers: { "x-api-key": "YOUR_API_KEY" } }
});
```

### Hardhat

```js
// hardhat.config.js
networks: {
  mainnet: {
    url: "https://rpcforge.onrender.com/eth",
    headers: { "x-api-key": "YOUR_API_KEY" }
  }
}
```

---

## Admin API

All admin routes require a valid JWT Bearer token (`Authorization: Bearer <token>`).

| Method | Route | Description |
|---|---|---|
| `GET` | `/stats` | Total requests, errors, top methods |
| `GET` | `/logs` | Last 200 request logs |
| `GET` | `/keys` | List all API keys |
| `POST` | `/keys` | Create a key `{ tier: "free" \| "dev" \| "pro" \| "team" }` |
| `DELETE` | `/keys/:key` | Revoke a key |
| `PATCH` | `/keys/:key` | Upgrade/downgrade tier |
| `GET` | `/chains` | List supported chains and node counts |
| `POST` | `/billing/create-checkout` | Create Stripe Checkout session |
| `POST` | `/billing/create-portal` | Open Stripe Customer Portal |
| `GET` | `/billing/status` | Get current plan and status |

---

## CLI

The easiest way to use RPCForge is via the official CLI — no cloning required.

### Install globally

```bash
npm install -g rpcforge-cli
```

### Run your first command

```bash
rpcforge init
```

### All commands

| Command | Description |
|---|---|
| `rpcforge init` | Setup your endpoint & get usage examples |
| `rpcforge test` | Send a live `eth_blockNumber` test request |
| `rpcforge keys` | List all API keys |
| `rpcforge keys create` | Create a new API key |
| `rpcforge keys revoke` | Revoke an API key |
| `rpcforge stats` | Show total requests, errors, top methods |

---

## Rate Limits

| Tier | Requests / min |
|---|---|
| Free | 20 |
| Dev | 60 |
| Pro | 200 |
| Team | 500 |

Exceeding the limit returns:
```json
{ "error": "Rate limit exceeded. Too many requests." }
```

---

## Blocked Methods

The following methods are blocked by default to prevent abuse:

- `eth_sendRawTransaction`
- `eth_sign`
- `personal_sign`

---

## Deployment

### Backend → Render

1. Push to GitHub
2. Create a new Render Web Service → Deploy from GitHub
3. Add all `.env` variables in Render's environment settings
4. Start command: `node server.js`

### Frontend → Vercel

```bash
cd frontend
vercel --prod
```

Set `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_API_BASE_URL` in Vercel's environment variables.

---

## Tech Stack

**Backend**
- Node.js + Express 5
- WebSocket (`ws`)
- `express-rate-limit` for per-key throttling
- `axios` for upstream node forwarding
- `stripe` for billing
- `uuid` for log IDs

**Frontend**
- React 18 + Vite
- Tailwind CSS
- Chart.js + react-chartjs-2
- Supabase (auth + user DB)
- React Router v7

**CLI**
- `chalk`, `inquirer`, `ora`, `axios`

**Infrastructure**
- Docker + Docker Compose
- Render (backend)
- Vercel (frontend)
- Supabase (auth + database)
- Stripe (billing)

---

## Environment Variables

| Variable | Description |
|---|---|
| `PORT` | Server port (default: 3000) |
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Supabase service role key |
| `ETH_NODE_1` / `ETH_NODE_2` | Ethereum mainnet node URLs |
| `SEPOLIA_NODE_1` | Sepolia testnet node URL |
| `POLYGON_NODE_1` / `POLYGON_NODE_2` | Polygon node URLs |
| `BSC_NODE_1` / `BSC_NODE_2` | BSC node URLs |
| `ARBITRUM_NODE_1` / `ARBITRUM_NODE_2` | Arbitrum node URLs |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `STRIPE_PRICE_DEV` | Stripe Price ID for Dev plan |
| `STRIPE_PRICE_PRO` | Stripe Price ID for Pro plan |
| `STRIPE_PRICE_TEAM` | Stripe Price ID for Team plan |
| `FRONTEND_URL` | Your frontend URL for Stripe redirects |

---

## License

MIT © 2025 RPCForge
