const express = require("express");
const axios = require("axios");
const rateLimit = require("express-rate-limit");
const cors = require("cors");

const app = express();
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// 🔐 API key
const VALID_API_KEY = "mayur123";

// 🌐 Multiple nodes
const NODES = [
  "https://mainnet.infura.io/v3/b625bdd01c554b5481ce60a747c434c3",
  "https://eth-sepolia.g.alchemy.com/v2/FO-OJ6NMsXO4KiwEOSbUN"
];

// 🔁 Random node selector
const getNode = () => {
  return NODES[Math.floor(Math.random() * NODES.length)];
};

// 📋 In-memory logs
const logs = [];

// 🚫 Rate limiter
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10
});

app.use(limiter);

app.post("/", async (req, res) => {

  // 🔐 Check API key
  const userKey = req.headers["x-api-key"];
  if (userKey !== VALID_API_KEY) {
    return res.status(403).json({ error: "Unauthorized bro 😅" });
  }

  // 📊 Logging
  const log = { time: new Date().toISOString(), method: req.body.method };
  logs.push(log);
  console.log("Method:", req.body.method);

  try {
    const response = await axios.post(getNode(), req.body);
    res.json(response.data);
  } catch (err) {
  console.error("FULL ERROR:", err.response?.data || err.message);
  res.status(500).send("Error forwarding request");
  }
});

// 📋 Logs route
app.get("/logs", (req, res) => {
  res.json(logs);
});

app.listen(3000, () => {
  console.log("Mini RPC upgraded 🚀");
});