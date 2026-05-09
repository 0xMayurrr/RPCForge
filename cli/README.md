# RPCForge CLI

> Command-line interface for managing your RPCForge RPC infrastructure

[![npm version](https://img.shields.io/npm/v/rpcforge-cli.svg)](https://www.npmjs.com/package/rpcforge-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## 🚀 Quick Start

```bash
# Install globally
npm install -g rpcforge-cli

# Setup your endpoint
rpcforge init

# Test it
rpcforge test
```

## 📦 Installation

### Global Installation (Recommended)

```bash
npm install -g rpcforge-cli
```

### Local Installation

```bash
npm install rpcforge-cli
npx rpcforge init
```

## 🔑 Authentication

The CLI requires authentication to manage your API keys and endpoints.

### Option 1: Interactive Login

The CLI will prompt you for credentials when needed:

```bash
rpcforge init
# Email: your@email.com
# Password: ••••••••
```

### Option 2: Environment Variable

Skip login prompts by setting your JWT token:

```bash
export RPCFORGE_TOKEN=your_jwt_token_here
rpcforge stats
```

To get your token:
1. Login via the CLI once
2. Copy the token from the output
3. Set it as an environment variable

## 📚 Commands

### `rpcforge init`

Setup your RPC endpoint and get usage examples.

```bash
rpcforge init
```

**What it does:**
- Prompts you to select a blockchain (Ethereum, Polygon, BSC, Arbitrum, Sepolia)
- Fetches or creates your API key
- Displays your endpoint URL
- Shows integration examples for ethers.js, curl, and Hardhat

**Example Output:**
```
✅ Your RPC Endpoint is ready!

Chain:     ETH
Endpoint:  https://rpcforge.onrender.com/eth
API Key:   rpc_k_a1b2c3d4e5f6

Usage examples:

ethers.js:
  const provider = new ethers.JsonRpcProvider("https://rpcforge.onrender.com/eth", undefined,
    { headers: { "x-api-key": "rpc_k_a1b2c3d4e5f6" } });

curl:
  curl -X POST https://rpcforge.onrender.com/eth \
    -H "x-api-key: rpc_k_a1b2c3d4e5f6" \
    -H "Content-Type: application/json" \
    -d '{"jsonrpc":"2.0","method":"eth_blockNumber","id":1}'
```

---

### `rpcforge test`

Send a test RPC request to verify your endpoint is working.

```bash
rpcforge test
```

**What it does:**
- Prompts for your API key
- Prompts to select a chain
- Sends an `eth_blockNumber` request
- Displays the latest block number

**Example:**
```bash
$ rpcforge test
? API key to test: rpc_k_a1b2c3d4e5f6
? Select chain: eth
✓ Success! Latest block: 21,847,392
```

---

### `rpcforge keys`

List all your API keys with usage statistics.

```bash
rpcforge keys
```

**Example Output:**
```
API Key                  Tier   Requests  Errors
────────────────────────────────────────────────
rpc_k_a1b2c3d4e5f6      PRO    1204      0  (0.0% err)
rpc_k_x9y8z7w6v5u4      FREE   45        2  (4.4% err)
```

---

### `rpcforge keys create`

Create a new API key.

```bash
rpcforge keys create
```

**What it does:**
- Prompts you to select a tier (free, dev, pro, team)
- Creates a new API key
- Displays the key and tier

**Example:**
```bash
$ rpcforge keys create
? Select tier: pro
✓ Key created!

API Key: rpc_k_n3wk3y123456
Tier:    PRO
```

---

### `rpcforge keys revoke`

Revoke an existing API key.

```bash
rpcforge keys revoke
```

**What it does:**
- Prompts for the API key to revoke
- Permanently deletes the key
- Confirms deletion

**Example:**
```bash
$ rpcforge keys revoke
? API key to revoke: rpc_k_old123456
✓ Key revoked.
```

---

### `rpcforge stats`

View your account statistics and usage metrics.

```bash
rpcforge stats
```

**Example Output:**
```
📊 RPCForge Stats

Total Requests : 1204
Total Errors   : 0
Active Keys    : 3

Top Methods:
1. eth_blockNumber              450 calls
2. eth_getBalance               320 calls
3. eth_call                     280 calls
4. eth_getTransactionReceipt    154 calls
```

---

## 🔗 Integration Examples

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
console.log("Latest block:", blockNumber);
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

### Hardhat

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

### curl

```bash
curl -X POST https://rpcforge.onrender.com/eth \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "eth_blockNumber",
    "params": [],
    "id": 1
  }'
```

---

## 🌐 Supported Chains

| Chain | Endpoint |
|---|---|
| Ethereum Mainnet | `https://rpcforge.onrender.com/eth` |
| Ethereum Sepolia | `https://rpcforge.onrender.com/sepolia` |
| Polygon | `https://rpcforge.onrender.com/polygon` |
| BSC | `https://rpcforge.onrender.com/bsc` |
| Arbitrum | `https://rpcforge.onrender.com/arbitrum` |

---

## 💎 Pricing Tiers

| Tier | Price | Requests/day | Rate Limit |
|---|---|---|---|
| **Free** | $0 | 100k | 20 req/min |
| **Dev** | $9/mo | 1M | 60 req/min |
| **Pro** | $29/mo | 10M | 200 req/min |
| **Team** | $99/mo | Unlimited | 500 req/min |

---

## 🛠️ CI/CD Integration

### GitHub Actions

```yaml
name: Deploy Contract
on: [push]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install RPCForge CLI
        run: npm install -g rpcforge-cli
      
      - name: Test RPC Connection
        env:
          RPCFORGE_TOKEN: ${{ secrets.RPCFORGE_TOKEN }}
        run: |
          echo "YOUR_API_KEY" > key.txt
          rpcforge test
      
      - name: Deploy
        run: npx hardhat deploy --network mainnet
        env:
          RPCFORGE_API_KEY: ${{ secrets.RPCFORGE_API_KEY }}
```

### GitLab CI

```yaml
deploy:
  image: node:18
  script:
    - npm install -g rpcforge-cli
    - export RPCFORGE_TOKEN=$RPCFORGE_TOKEN
    - rpcforge stats
    - npm run deploy
  only:
    - main
```

---

## 🐛 Troubleshooting

### "Login failed" error

**Cause:** Invalid credentials or network issue

**Solution:**
```bash
# Verify your credentials at https://rpc-forge.vercel.app
# Try again with correct email/password
rpcforge init
```

---

### "Rate limit exceeded" error

**Cause:** You've exceeded your tier's rate limit

**Solution:**
```bash
# Check your current usage
rpcforge stats

# Upgrade your tier
rpcforge keys create
# Select a higher tier (dev, pro, team)
```

---

### "Failed to fetch" error

**Cause:** Network connectivity or backend is down

**Solution:**
```bash
# Check if the backend is up
curl https://rpcforge.onrender.com/health

# Try again in a few moments
rpcforge test
```

---

## 📖 Environment Variables

| Variable | Description | Example |
|---|---|---|
| `RPCFORGE_TOKEN` | JWT token to skip login prompts | `eyJhbGciOiJIUzI1NiIs...` |
| `RPCFORGE_API_KEY` | Your API key for RPC requests | `rpc_k_a1b2c3d4e5f6` |

---

## 🤝 Contributing

Contributions are welcome! Please check out our [Contributing Guide](../CONTRIBUTING.md).

---

## 📄 License

MIT © [0xMayurrr](https://github.com/0xMayurrr)

---

## 🔗 Links

- **Dashboard**: [https://rpc-forge.vercel.app](https://rpc-forge.vercel.app)
- **GitHub**: [https://github.com/0xMayurrr/RPCForge](https://github.com/0xMayurrr/RPCForge)
- **npm**: [https://www.npmjs.com/package/rpcforge-cli](https://www.npmjs.com/package/rpcforge-cli)
- **Support**: [GitHub Issues](https://github.com/0xMayurrr/RPCForge/issues)

---

**Made with ⚡ by [Mayur](https://github.com/0xMayurrr)**
