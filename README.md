<div align="center">

<img src="https://img.shields.io/badge/RPCForge-Live-6467f2?style=for-the-badge&logo=ethereum&logoColor=white" />
<img src="https://img.shields.io/badge/Node.js-20-339933?style=for-the-badge&logo=node.js&logoColor=white" />
<img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
<img src="https://img.shields.io/badge/Deployed-Railway-0B0D0E?style=for-the-badge&logo=railway&logoColor=white" />
<img src="https://img.shields.io/badge/Frontend-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" />

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

```bash
cd cli
npm install
npm link   # makes `rpcforge` available globally
```

```
rpcforge init          Setup your endpoint & get usage examples
rpcforge test          Send a test eth_blockNumber request
rpcforge keys          List all API keys
rpcforge keys create   Create a new API key
rpcforge keys revoke   Revoke an API key
rpcforge stats         Show request stats
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
