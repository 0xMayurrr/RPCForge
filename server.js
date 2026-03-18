require("dotenv").config();
const express = require("express");
const axios = require("axios");
const { rateLimit, ipKeyGenerator } = require("express-rate-limit");
const cors = require("cors");
const http = require("http");
const { WebSocketServer } = require("ws");
const { v4: uuidv4 } = require("uuid");

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(cors({ origin: ["http://localhost:5173", "https://rpcforge.vercel.app"] }));
app.use(express.json());

// ─── Multi-chain nodes from .env ───────────────────────────────────────────
const CHAINS = {
  eth:      [process.env.ETH_NODE_1,      process.env.ETH_NODE_2].filter(Boolean),
  sepolia:  [process.env.SEPOLIA_NODE_1].filter(Boolean),
  polygon:  [process.env.POLYGON_NODE_1,  process.env.POLYGON_NODE_2].filter(Boolean),
  bsc:      [process.env.BSC_NODE_1,      process.env.BSC_NODE_2].filter(Boolean),
  arbitrum: [process.env.ARBITRUM_NODE_1, process.env.ARBITRUM_NODE_2].filter(Boolean),
};

// ─── API Keys (loaded from .env, stored in memory) ──────────────────────────
// Format in .env: API_KEYS=key1:free,key2:pro
const TIER_LIMITS = { free: 20, pro: 100 };
const BLOCKED_METHODS = ["eth_sendRawTransaction", "eth_sign", "personal_sign"];
const CACHEABLE_METHODS = ["eth_blockNumber", "eth_chainId", "eth_gasPrice"];

function buildUsers() {
  const map = {};
  const raw = process.env.API_KEYS || "";
  raw.split(",").forEach((entry) => {
    const [key, tier = "free"] = entry.trim().split(":");
    if (key) map[key] = { requests: 0, errors: 0, methods: {}, tier };
  });
  return map;
}
let users = buildUsers();

// ─── Cache ───────────────────────────────────────────────────────────────────
const cache = new Map();
const CACHE_TTL = 10 * 1000;

// ─── Logs ────────────────────────────────────────────────────────────────────
const logs = [];
const MAX_LOGS = 500;

function pushLog(entry) {
  logs.unshift(entry);
  if (logs.length > MAX_LOGS) logs.pop();
  broadcast(entry);
}

// ─── WebSocket broadcast ─────────────────────────────────────────────────────
function broadcast(data) {
  const msg = JSON.stringify(data);
  wss.clients.forEach((client) => {
    if (client.readyState === 1) client.send(msg);
  });
}

wss.on("connection", (ws) => {
  ws.send(JSON.stringify({ type: "init", logs: logs.slice(0, 50) }));
});

// ─── Retry / Failover ────────────────────────────────────────────────────────
async function forwardWithRetry(body, chain = 'eth') {
  const nodes = CHAINS[chain] || CHAINS.eth;
  const shuffled = [...nodes].sort(() => Math.random() - 0.5);
  let lastErr;
  for (const node of shuffled) {
    try {
      const res = await axios.post(node, body, { timeout: 8000 });
      return res.data;
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr;
}

// ─── Per-key dynamic rate limiter ────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: (req) => {
    const user = users[req.headers["x-api-key"]];
    return user ? TIER_LIMITS[user.tier] || 20 : 20;
  },
  keyGenerator: (req) => req.headers["x-api-key"] || ipKeyGenerator(req),
  message: { error: "Rate limit exceeded. Too many requests." },
});
app.use(limiter);

// ─── Admin auth middleware ────────────────────────────────────────────────────
function adminAuth(req, res, next) {
  if (req.headers["x-admin-secret"] !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

// ─── Chains info (public) ───────────────────────────────────────────────────
app.get("/chains", (req, res) => {
  res.json(Object.keys(CHAINS).map(chain => ({
    chain,
    nodes: CHAINS[chain].length,
    endpoint: `POST /${chain}`,
  })));
});

// ─── Core RPC endpoint (multi-chain) ────────────────────────────────────────
app.post("/:chain", async (req, res) => {
  const chain = req.params.chain;
  if (!CHAINS[chain]) return res.status(400).json({ error: `Unsupported chain: ${chain}. Available: ${Object.keys(CHAINS).join(', ')}` });

  const userKey = req.headers["x-api-key"];
  const method = req.body.method;

  if (!userKey || !users[userKey]) {
    return res.status(403).json({ error: "Invalid or missing API Key" });
  }

  if (BLOCKED_METHODS.includes(method)) {
    return res.status(403).json({ error: `Method ${method} is not allowed` });
  }

  users[userKey].requests += 1;
  users[userKey].methods[method] = (users[userKey].methods[method] || 0) + 1;

  const log = {
    id: uuidv4(),
    time: new Date().toISOString(),
    method,
    chain,
    userKey,
    cached: false,
    error: false,
  };

  // Cache check
  if (CACHEABLE_METHODS.includes(method)) {
    const cacheKey = JSON.stringify(req.body);
    if (cache.has(cacheKey)) {
      const hit = cache.get(cacheKey);
      if (Date.now() - hit.timestamp < CACHE_TTL) {
        log.cached = true;
        pushLog(log);
        return res.json(hit.response);
      }
      cache.delete(cacheKey);
    }
  }

  try {
    const data = await forwardWithRetry(req.body, chain);

    if (CACHEABLE_METHODS.includes(method) && data && !data.error) {
      cache.set(JSON.stringify(req.body), { response: data, timestamp: Date.now() });
    }

    pushLog(log);
    res.json(data);
  } catch (err) {
    users[userKey].errors += 1;
    log.error = true;
    pushLog(log);
    console.error("RPC Error:", err.message);
    res.status(500).json({ error: "Error forwarding request" });
  }
});

// ─── Logs (protected) ────────────────────────────────────────────────────────
app.get("/logs", adminAuth, (req, res) => res.json(logs));

// ─── Stats (protected) ───────────────────────────────────────────────────────
app.get("/stats", adminAuth, (req, res) => {
  let totalRequests = 0, totalErrors = 0;
  const overallMethods = {};

  for (const user of Object.values(users)) {
    totalRequests += user.requests;
    totalErrors += user.errors;
    for (const [m, count] of Object.entries(user.methods)) {
      overallMethods[m] = (overallMethods[m] || 0) + count;
    }
  }

  const mostUsedMethods = Object.entries(overallMethods)
    .sort((a, b) => b[1] - a[1])
    .map(([method, count]) => ({ name: method, count }));

  const formattedUsers = Object.entries(users).map(([key, data]) => ({
    apiKey: key,
    requests: data.requests,
    errors: data.errors,
    tier: data.tier,
  }));

  res.json({ totalRequests, totalErrors, users: formattedUsers, mostUsedMethods });
});

// ─── API Key Manager (protected) ─────────────────────────────────────────────
app.get("/keys", adminAuth, (req, res) => {
  res.json(
    Object.entries(users).map(([key, data]) => ({
      apiKey: key,
      tier: data.tier,
      requests: data.requests,
      errors: data.errors,
    }))
  );
});

app.post("/keys", adminAuth, (req, res) => {
  const { tier = "free" } = req.body;
  const newKey = uuidv4().replace(/-/g, "").slice(0, 16);
  users[newKey] = { requests: 0, errors: 0, methods: {}, tier };
  res.json({ apiKey: newKey, tier });
});

app.delete("/keys/:key", adminAuth, (req, res) => {
  const { key } = req.params;
  if (!users[key]) return res.status(404).json({ error: "Key not found" });
  delete users[key];
  res.json({ success: true });
});

app.patch("/keys/:key", adminAuth, (req, res) => {
  const { key } = req.params;
  const { tier } = req.body;
  if (!users[key]) return res.status(404).json({ error: "Key not found" });
  if (!TIER_LIMITS[tier]) return res.status(400).json({ error: "Invalid tier" });
  users[key].tier = tier;
  res.json({ apiKey: key, tier });
});

// ─── Start ───────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`RPCForge 🚀 running on port ${PORT}`);
});
