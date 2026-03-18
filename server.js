const express = require("express");
const axios = require("axios");
const rateLimit = require("express-rate-limit");
const cors = require("cors");

const app = express();
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// 🗂️ 1. Multiple API Key System (In-memory DB)
const users = {
  "user1_key": { requests: 0, methods: {} },
  "user2_key": { requests: 0, methods: {} },
  "mayur123": { requests: 0, methods: {} }
};

// 🌐 Multiple nodes
const NODES = [
  "https://mainnet.infura.io/v3/b625bdd01c554b5481ce60a747c434c3",
  "https://eth-sepolia.g.alchemy.com/v2/FO-OJ6NMsXO4KiwEOSbUN"
];

// 🔁 Random node selector
const getNode = () => NODES[Math.floor(Math.random() * NODES.length)];

// 📋 5. Improved Logs
const logs = [];

// 🧠 3. Caching System
const cache = new Map();
const CACHE_TTL = 10 * 1000; // 10 seconds in ms
const CACHEABLE_METHODS = ["eth_blockNumber", "eth_chainId", "eth_gasPrice"];

// 🚫 4. Advanced Rate Limiting (per API key)
const keyGenerator = (req) => req.headers["x-api-key"] || req.ip;

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 requests per minute per user key
  keyGenerator: keyGenerator,
  message: { error: "Rate limit exceeded. Too many requests." }
});

app.use(limiter);

// 🚀 Core JSON-RPC Endpoint
app.post("/", async (req, res) => {
  const userKey = req.headers["x-api-key"];
  const method = req.body.method;

  // 🔐 Check API key
  if (!userKey || !users[userKey]) {
    return res.status(403).json({ error: "Invalid or missing API Key" });
  }

  // 📊 Analytics Update
  users[userKey].requests += 1;
  users[userKey].methods[method] = (users[userKey].methods[method] || 0) + 1;

  // 📋 Logging setup
  const log = { 
    time: new Date().toISOString(), 
    method, 
    userKey,
    cached: false 
  };
  
  // 🧠 Check Cache
  if (CACHEABLE_METHODS.includes(method)) {
    const cacheKey = JSON.stringify(req.body);
    if (cache.has(cacheKey)) {
      const cachedData = cache.get(cacheKey);
      if (Date.now() - cachedData.timestamp < CACHE_TTL) {
        log.cached = true;
        logs.push(log);
        return res.json(cachedData.response); // Return cached response immediately
      } else {
        cache.delete(cacheKey); // Expired, clear it
      }
    }
  }

  // 🌐 Forward Request to Blockchain
  try {
    const response = await axios.post(getNode(), req.body);
    
    // 🧠 Store newly fetched data in Cache
    if (CACHEABLE_METHODS.includes(method) && response.data && !response.data.error) {
      cache.set(JSON.stringify(req.body), {
        response: response.data,
        timestamp: Date.now()
      });
    }

    logs.push(log);
    res.json(response.data);
  } catch (err) {
    console.error("FULL ERROR:", err.response?.data || err.message);
    res.status(500).json({ error: "Error forwarding request" });
  }
});

// 📋 Logs route
app.get("/logs", (req, res) => {
  res.json(logs);
});

// 📊 Analytics Stats Route
app.get("/stats", (req, res) => {
  let totalRequests = 0;
  const overallMethods = {};

  // Aggregate stats across all active users
  for (const user of Object.values(users)) {
    totalRequests += user.requests;
    for (const [m, count] of Object.entries(user.methods)) {
      overallMethods[m] = (overallMethods[m] || 0) + count;
    }
  }
  
  // Format most used methods nicely for the Frontend Charts
  const mostUsedMethods = Object.entries(overallMethods)
    .sort((a, b) => b[1] - a[1]) // Sort descending
    .map(([method, count]) => ({ name: method, count }));

  // Format users array nicely
  const formattedUsers = Object.entries(users).map(([key, data]) => ({
    apiKey: key,
    requests: data.requests
  }));

  res.json({
    totalRequests,
    users: formattedUsers,
    mostUsedMethods
  });
});

app.listen(3000, () => {
  console.log("RPCForge Backend upgraded 🚀 listening on port 3000");
});