<div align="center">

<img src="https://img.shields.io/badge/RPCForge-Live-6467f2?style=for-the-badge&logo=ethereum&logoColor=white" />
<img src="https://img.shields.io/badge/Node.js-20-339933?style=for-the-badge&logo=node.js&logoColor=white" />
<img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
<img src="https://img.shields.io/badge/Deployed-Railway-0B0D0E?style=for-the-badge&logo=railway&logoColor=white" />
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

### Your Personal Multi-Chain Ethereum RPC Provider

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
curl -X POST https://rpcforge-production.up.railway.app/eth \
  -H "x-api-key: demo_key_12345" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

---

## ⭐ Star This Repo!

If RPCForge saves you money or helps your project, give us a star! It helps others discover this tool.

[![GitHub stars](https://img.shields.io/github/stars/0xMayurrr/RPCForge?style=social)](https://github.com/0xMayurrr/RPCForge)

---

## What is RPCForge?

RPCForge is a self-hostable, production-ready RPC gateway that sits in front of your Ethereum nodes. It gives you a single, reliable endpoint with API key auth, per-tier rate limiting, method blacklisting, response caching, multi-node failover, and a real-time WebSocket dashboard — all in one.

Built for developers who want **Infura/Alchemy-level features** without the vendor lock-in.

---

## Features

| Feature | Description |
|---|---|
| **Multi-chain Support** | Ethereum, Polygon, BSC, Arbitrum, Sepolia out of the box |
| **Multi-node Failover** | Shuffles across your configured nodes, retries on failure |
| **Per-key Rate Limiting** | Free tier: 20 req/min · Pro tier: 100 req/min |
| **Response Caching** | 10s TTL cache for `eth_blockNumber`, `eth_chainId`, `eth_gasPrice` |
| **Method Blacklist** | Blocks `eth_sendRawTransaction`, `eth_sign`, `personal_sign` by default |
| **Real-time Dashboard** | WebSocket-powered live feed, charts, and stats |
| **API Key Manager** | Create, revoke, and upgrade keys via UI or CLI |
| **Auth via Supabase** | Email/password + Google OAuth, per-user API key provisioning |
| **CLI Tool** | Full-featured terminal interface for power users |
| **Docker Ready** | One command to spin up the full stack |

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
│  │  Auth    │→ │ Limiter  │→ │Blacklist │→ │  (10s TTL)│  │
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
│       ├── SignupPage.jsx  # Supabase auth (email + Google)
│       ├── Dashboard.jsx   # Live stats, logs, key manager
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
git clone https://github.com/your-username/mini-rpc-provider.git
cd mini-rpc-provider
npm install
```

### 2. Configure `.env`

```env
PORT=3000
ADMIN_SECRET=your_admin_secret

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

# Format: key:tier,key:tier
API_KEYS=mykey123:free,prokey456:pro
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

### Deploy Backend (Railway)

1. Click the button below:
   
   [![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/rpcforge)

2. Add your environment variables in Railway dashboard
3. Copy your Railway URL

### Deploy Frontend (Vercel)

1. Fork this repository
2. Click: [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/0xMayurrr/RPCForge/tree/main/frontend)
3. Set environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_API_BASE_URL` (your Railway backend URL)

### Docker Deployment
```bash
# Pull from Docker Hub
docker pull yourusername/rpcforge:latest

# Run with environment file
docker run -p 3000:3000 --env-file .env yourusername/rpcforge:latest

# Or use docker-compose
docker-compose up -d
```

---

## 📚 Code Examples

### ethers.js Integration
```javascript
import { ethers } from "ethers";

const provider = new ethers.JsonRpcProvider(
  "https://rpcforge-production.up.railway.app/eth",
  undefined,
  { 
    fetchOptions: {
      headers: { "x-api-key": "YOUR_API_KEY" } 
    }
  }
);

// Use it like any provider
const blockNumber = await provider.getBlockNumber();
const balance = await provider.getBalance("0x...");
```

### viem Integration
```typescript
import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';

const client = createPublicClient({
  chain: mainnet,
  transport: http("https://rpcforge-production.up.railway.app/eth", {
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
    [mainnet.id]: http("https://rpcforge-production.up.railway.app/eth", {
      fetchOptions: { headers: { "x-api-key": "YOUR_KEY" }}
    }),
    [polygon.id]: http("https://rpcforge-production.up.railway.app/polygon", {
      fetchOptions: { headers: { "x-api-key": "YOUR_KEY" }}
    }),
    [arbitrum.id]: http("https://rpcforge-production.up.railway.app/arbitrum", {
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
      url: "https://rpcforge-production.up.railway.app/eth",
      headers: { "x-api-key": process.env.RPCFORGE_API_KEY },
      accounts: [process.env.PRIVATE_KEY]
    },
    polygon: {
      url: "https://rpcforge-production.up.railway.app/polygon",
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

## 📊 Performance Benchmarks

*(Add benchmarks showing RPCForge vs Infura/Alchemy in terms of latency, uptime, cost)*

---

## ⚖️ License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

Built with ❤️ for the Ethereum community

Special thanks to:
- [ethers.js](https://docs.ethers.org/) and [viem](https://viem.sh/) teams
- [Supabase](https://supabase.com/) for auth infrastructure
- [Railway](https://railway.app/) and [Vercel](https://vercel.com/) for hosting

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
curl -X POST https://rpcforge-production.up.railway.app/eth \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

### ethers.js

```js
const provider = new ethers.JsonRpcProvider(
  "https://rpcforge-production.up.railway.app/eth",
  undefined,
  { headers: { "x-api-key": "YOUR_API_KEY" } }
);
```

### viem

```js
const transport = http("https://rpcforge-production.up.railway.app/eth", {
  fetchOptions: { headers: { "x-api-key": "YOUR_API_KEY" } }
});
```

### Hardhat

```js
// hardhat.config.js
networks: {
  mainnet: {
    url: "https://rpcforge-production.up.railway.app/eth",
    headers: { "x-api-key": "YOUR_API_KEY" }
  }
}
```

---

## Admin API

All admin routes require the `x-admin-secret` header.

| Method | Route | Description |
|---|---|---|
| `GET` | `/stats` | Total requests, errors, top methods |
| `GET` | `/logs` | Last 500 request logs |
| `GET` | `/keys` | List all API keys |
| `POST` | `/keys` | Create a key `{ tier: "free" \| "pro" }` |
| `DELETE` | `/keys/:key` | Revoke a key |
| `PATCH` | `/keys/:key` | Upgrade/downgrade tier `{ tier: "pro" }` |
| `GET` | `/chains` | List supported chains and node counts |

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

That's it. The CLI will walk you through picking a chain, generating or validating your API key, and print ready-to-use code snippets for ethers.js, curl, and Hardhat.

### All commands

| Command | Description |
|---|---|
| `rpcforge init` | Setup your endpoint & get usage examples |
| `rpcforge test` | Send a live `eth_blockNumber` test request |
| `rpcforge keys` | List all API keys |
| `rpcforge keys create` | Create a new API key (free or pro) |
| `rpcforge keys revoke` | Revoke an API key |
| `rpcforge stats` | Show total requests, errors, top methods |

### Windows users — if `rpcforge` is not recognized

After installing, if you see `'rpcforge' is not recognized`, npm's global bin folder isn't in your PATH. Fix it by running this in cmd **as Administrator**:

```cmd
setx PATH "%PATH%;%APPDATA%\npm" /M
```

Then close and reopen your terminal. Alternatively, use npx without any install:

```cmd
npx rpcforge-cli init
```

### Optional: set your admin secret as an env var

So you're not prompted every time you run `keys` or `stats`:

```bash
# macOS / Linux — add to ~/.bashrc or ~/.zshrc
export RPCFORGE_ADMIN_SECRET=your_secret_here

# Windows cmd
setx RPCFORGE_ADMIN_SECRET your_secret_here
```

---

## Rate Limits

| Tier | Requests / min |
|---|---|
| Free | 20 |
| Pro | 100 |

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

### Backend → Railway

1. Push to GitHub
2. Create a new Railway project → Deploy from GitHub
3. Add all `.env` variables in Railway's environment settings
4. Railway auto-detects the `Dockerfile` and deploys

### Frontend → Vercel

```bash
cd frontend
vercel --prod
```

Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Vercel's environment variables.

---

## Tech Stack

**Backend**
- Node.js + Express 5
- WebSocket (`ws`)
- `express-rate-limit` for per-key throttling
- `axios` for upstream node forwarding
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
- Railway (backend)
- Vercel (frontend)
- Supabase (auth + database)

---

## Environment Variables

| Variable | Description |
|---|---|
| `PORT` | Server port (default: 3000) |
| `ADMIN_SECRET` | Secret for admin API routes |
| `ETH_NODE_1` / `ETH_NODE_2` | Ethereum mainnet node URLs |
| `SEPOLIA_NODE_1` | Sepolia testnet node URL |
| `POLYGON_NODE_1` / `POLYGON_NODE_2` | Polygon node URLs |
| `BSC_NODE_1` / `BSC_NODE_2` | BSC node URLs |
| `ARBITRUM_NODE_1` / `ARBITRUM_NODE_2` | Arbitrum node URLs |
| `API_KEYS` | Comma-separated `key:tier` pairs |

---

## License

MIT © 2025 RPCForge
