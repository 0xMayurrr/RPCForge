require("dotenv").config();
// Force IPv4 — Node.js on Windows tries IPv6 (64:ff9b::) first and times out
const { setDefaultResultOrder } = require("dns");
setDefaultResultOrder("ipv4first");
const express = require("express");
const axios = require("axios");
const { rateLimit, ipKeyGenerator } = require("express-rate-limit");
const cors = require("cors");
const http = require("http");
const { WebSocketServer } = require("ws");
const { v4: uuidv4 } = require("uuid");
const { createClient } = require("@supabase/supabase-js");
const { Redis } = require("@upstash/redis");
const Stripe = require("stripe");

const stripe = process.env.STRIPE_SECRET_KEY?.startsWith('sk_')
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(cors({ origin: ["http://localhost:5173", "https://rpcforge.vercel.app", "https://rpc-forge.vercel.app"] }));
app.use(express.json());

// ─── Supabase (service role — never exposed to frontend) ──────────────────────
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// ─── Upstash Redis (optional — falls back to in-memory) ──────────────────────
const redisConfigured = process.env.UPSTASH_REST_URL?.startsWith('https');
const redis = redisConfigured ? new Redis({
  url: process.env.UPSTASH_REST_URL,
  token: process.env.UPSTASH_REST_TOKEN,
}) : null;
if (!redisConfigured) console.warn('[RPCForge] Redis not configured — using in-memory fallback');

const memCache = new Map();
async function cacheGet(key) {
  if (redis) return redis.get(key);
  const e = memCache.get(key);
  if (!e || Date.now() > e.exp) { memCache.delete(key); return null; }
  return e.val;
}
async function cacheSet(key, val, ttl) {
  if (redis) return redis.set(key, val, { ex: ttl });
  memCache.set(key, { val, exp: Date.now() + ttl * 1000 });
}
async function cacheDel(key) {
  if (redis) return redis.del(key);
  memCache.delete(key);
}

// ─── Multi-chain nodes from .env ──────────────────────────────────────────────
const CHAINS = {
  eth:      [process.env.ETH_NODE_1,      process.env.ETH_NODE_2].filter(Boolean),
  sepolia:  [process.env.SEPOLIA_NODE_1].filter(Boolean),
  polygon:  [process.env.POLYGON_NODE_1,  process.env.POLYGON_NODE_2].filter(Boolean),
  bsc:      [process.env.BSC_NODE_1,      process.env.BSC_NODE_2].filter(Boolean),
  arbitrum: [process.env.ARBITRUM_NODE_1, process.env.ARBITRUM_NODE_2].filter(Boolean),
};

const TIER_LIMITS = { free: 20, dev: 60, pro: 200, team: 500 };
const BLOCKED_METHODS = ["eth_sendRawTransaction", "eth_sign", "personal_sign"];
const CACHEABLE_METHODS = ["eth_blockNumber", "eth_chainId", "eth_gasPrice"];
const CACHE_TTL = parseInt(process.env.CACHE_TTL_SECONDS) || 30;

// ─── In-memory recent logs for WebSocket broadcast only ──────────────────────
const recentLogs = [];

function pushLog(entry) {
  recentLogs.unshift(entry);
  if (recentLogs.length > 100) recentLogs.pop();
  broadcast(entry);
}

// ─── WebSocket broadcast ──────────────────────────────────────────────────────
function broadcast(data) {
  const msg = JSON.stringify(data);
  wss.clients.forEach((client) => {
    if (client.readyState === 1) client.send(msg);
  });
}

wss.on("connection", (ws, req) => {
  // Auth: require token query param
  const url = new URL(req.url, 'http://localhost');
  const token = url.searchParams.get('token');
  if (!token) { ws.close(1008, 'Unauthorized'); return; }

  supabase.auth.getUser(token).then(({ data: { user }, error }) => {
    if (error || !user) { ws.close(1008, 'Unauthorized'); return; }
    ws.send(JSON.stringify({ type: "init", logs: recentLogs.slice(0, 50) }));
  });
});

// ─── Supabase JWT auth middleware (replaces x-admin-secret) ──────────────────
async function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: "Unauthorized" });
  req.user = user;
  next();
}

// ─── Retry / Failover ─────────────────────────────────────────────────────────
async function forwardWithRetry(body, chain = "eth") {
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

// ─── Per-key Redis rate limiter ───────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: async (req) => {
    const userKey = req.headers["x-api-key"];
    if (!userKey) return 20;
    const cached = await cacheGet(`tier:${userKey}`);
    if (cached) return TIER_LIMITS[cached] || 20;
    const { data } = await supabase
      .from("api_keys")
      .select("tier")
      .eq("key", userKey)
      .eq("is_active", true)
      .single();
    if (data?.tier) await cacheSet(`tier:${userKey}`, data.tier, 300);
    return TIER_LIMITS[data?.tier] || 20;
  },
  keyGenerator: (req) => req.headers["x-api-key"] || ipKeyGenerator(req),
  message: { error: "Rate limit exceeded. Too many requests." },
});
app.use(limiter);

// ─── Health check (public) ────────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({ status: "ok", uptime: Math.floor(process.uptime()), chains: Object.keys(CHAINS) });
});

// ─── Chains info (public) ─────────────────────────────────────────────────────
app.get("/chains", (req, res) => {
  res.json(Object.keys(CHAINS).map(chain => ({
    chain,
    nodes: CHAINS[chain].length,
    endpoint: `POST /${chain}`,
  })));
});

// ─── API Keys (JWT protected) ─────────────────────────────────────────────────
app.get("/keys", authMiddleware, async (req, res) => {
  const { data } = await supabase
    .from("api_keys")
    .select("key, tier, request_count, error_count, created_at")
    .eq("user_id", req.user.id)
    .eq("is_active", true)
    .order("created_at", { ascending: false });
  res.json((data || []).map(k => ({ apiKey: k.key, tier: k.tier, requests: k.request_count, errors: k.error_count })));
});

app.post("/keys", authMiddleware, async (req, res) => {
  const { tier = "free" } = req.body;
  const newKey = uuidv4().replace(/-/g, "").slice(0, 16);
  const { data, error } = await supabase.from("api_keys").insert({
    user_id: req.user.id,
    key: newKey,
    tier,
  }).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ apiKey: data.key, tier: data.tier });
});

app.delete("/keys/:key", authMiddleware, async (req, res) => {
  const { error } = await supabase
    .from("api_keys")
    .update({ is_active: false })
    .eq("key", req.params.key)
    .eq("user_id", req.user.id);
  if (error) return res.status(500).json({ error: error.message });
  await cacheDel(`tier:${req.params.key}`);
  res.json({ success: true });
});

app.patch("/keys/:key", authMiddleware, async (req, res) => {
  const { tier } = req.body;
  if (!TIER_LIMITS[tier]) return res.status(400).json({ error: "Invalid tier" });
  const { error } = await supabase
    .from("api_keys")
    .update({ tier })
    .eq("key", req.params.key)
    .eq("user_id", req.user.id);
  if (error) return res.status(500).json({ error: error.message });
  await cacheSet(`tier:${req.params.key}`, tier, 300);
  res.json({ apiKey: req.params.key, tier });
});

// ─── Stats (JWT protected) ────────────────────────────────────────────────────
app.get("/stats", authMiddleware, async (req, res) => {
  const [keysRes, logsRes] = await Promise.all([
    supabase.from("api_keys").select("key, tier, request_count, error_count, is_active").eq("user_id", req.user.id),
    supabase.from("request_logs").select("method, cache_hit, status").eq("user_id", req.user.id),
  ]);

  const keys = keysRes.data || [];
  const logs = logsRes.data || [];

  const totalRequests = keys.reduce((s, k) => s + (k.request_count || 0), 0);
  const totalErrors = keys.reduce((s, k) => s + (k.error_count || 0), 0);

  const methodMap = {};
  logs.forEach(l => { methodMap[l.method] = (methodMap[l.method] || 0) + 1; });
  const mostUsedMethods = Object.entries(methodMap)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));

  res.json({
    totalRequests,
    totalErrors,
    users: keys.map(k => ({ apiKey: k.key, tier: k.tier, requests: k.request_count, errors: k.error_count })),
    mostUsedMethods,
  });
});

// ─── Logs (JWT protected) ─────────────────────────────────────────────────────
app.get("/logs", authMiddleware, async (req, res) => {
  const { chain, limit = 200 } = req.query;
  let query = supabase
    .from("request_logs")
    .select("*")
    .eq("user_id", req.user.id)
    .order("created_at", { ascending: false })
    .limit(parseInt(limit));
  if (chain) query = query.eq("chain", chain);
  const { data } = await query;
  res.json(data || []);
});

// ─── Billing routes ──────────────────────────────────────────────────────────
const requireStripe = (req, res, next) => {
  if (!stripe) return res.status(503).json({ error: 'Stripe not configured. Add STRIPE_SECRET_KEY to .env' });
  next();
};

app.post("/billing/create-checkout", authMiddleware, requireStripe, async (req, res) => {
  const { plan } = req.body;
  const priceIds = {
    dev: process.env.STRIPE_PRICE_DEV,
    pro: process.env.STRIPE_PRICE_PRO,
    team: process.env.STRIPE_PRICE_TEAM,
  };
  if (!priceIds[plan]) return res.status(400).json({ error: "Invalid plan" });
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceIds[plan], quantity: 1 }],
      success_url: `${process.env.FRONTEND_URL}/dashboard?payment=success`,
      cancel_url: `${process.env.FRONTEND_URL}/dashboard?payment=cancelled`,
      customer_email: req.user.email,
      metadata: { user_id: req.user.id, plan },
    });
    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/billing/create-portal", authMiddleware, requireStripe, async (req, res) => {
  try {
    const { data } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", req.user.id)
      .single();
    if (!data?.stripe_customer_id) return res.status(404).json({ error: "No subscription found" });
    const session = await stripe.billingPortal.sessions.create({
      customer: data.stripe_customer_id,
      return_url: `${process.env.FRONTEND_URL}/dashboard`,
    });
    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/billing/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  if (!stripe) return res.status(503).json({ error: 'Stripe not configured' });
  const sig = req.headers["stripe-signature"];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const obj = event.data.object;

  if (event.type === "checkout.session.completed") {
    const subscription = await stripe.subscriptions.retrieve(obj.subscription);
    await supabase.from("subscriptions").upsert({
      user_id: obj.metadata.user_id,
      stripe_customer_id: obj.customer,
      stripe_subscription_id: obj.subscription,
      plan: obj.metadata.plan,
      status: "active",
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });
    await supabase.from("api_keys")
      .update({ tier: obj.metadata.plan })
      .eq("user_id", obj.metadata.user_id);
  }

  if (event.type === "customer.subscription.deleted") {
    await supabase.from("subscriptions")
      .update({ plan: "free", status: "cancelled", updated_at: new Date().toISOString() })
      .eq("stripe_subscription_id", obj.id);
    await supabase.from("api_keys")
      .update({ tier: "free" })
      .eq("stripe_customer_id", obj.customer);
  }

  if (event.type === "customer.subscription.updated") {
    const planMap = {
      [process.env.STRIPE_PRICE_DEV]: "dev",
      [process.env.STRIPE_PRICE_PRO]: "pro",
      [process.env.STRIPE_PRICE_TEAM]: "team",
    };
    const newPlan = planMap[obj.items.data[0].price.id] || "free";
    await supabase.from("subscriptions")
      .update({ plan: newPlan, updated_at: new Date().toISOString() })
      .eq("stripe_subscription_id", obj.id);
    await supabase.from("api_keys")
      .update({ tier: newPlan })
      .eq("stripe_subscription_id", obj.id);
  }

  if (event.type === "invoice.payment_failed") {
    await supabase.from("api_keys")
      .update({ is_active: false })
      .eq("stripe_customer_id", obj.customer);
  }

  res.json({ received: true });
});

app.get("/billing/status", authMiddleware, async (req, res) => {
  const { data } = await supabase
    .from("subscriptions")
    .select("plan, status, current_period_end")
    .eq("user_id", req.user.id)
    .single();
  res.json(data || { plan: "free", status: "active", current_period_end: null });
});

// ─── Cache clear (JWT protected) ──────────────────────────────────────────────
app.delete("/cache", authMiddleware, async (req, res) => {
  res.json({ success: true, message: "Use Upstash dashboard to flush Redis cache" });
});

// ─── Core RPC endpoint (multi-chain) — must be LAST ──────────────────────────
app.post("/:chain", async (req, res) => {
  const chain = req.params.chain;
  if (!CHAINS[chain]) return res.status(400).json({ error: `Unsupported chain: ${chain}. Available: ${Object.keys(CHAINS).join(", ")}` });

  const userKey = req.headers["x-api-key"];
  const { method, jsonrpc, id } = req.body || {};

  if (!userKey) return res.status(403).json({ error: "Missing API Key" });

  // Validate JSON-RPC body
  if (!method || typeof method !== 'string' || jsonrpc !== '2.0') {
    return res.status(400).json({ error: "Invalid JSON-RPC request" });
  }

  // Validate key against Supabase
  const { data: keyRecord, error: keyError } = await supabase
    .from("api_keys")
    .select("id, user_id, tier, is_active")
    .eq("key", userKey)
    .eq("is_active", true)
    .single();

  if (keyError || !keyRecord) return res.status(403).json({ error: "Invalid or missing API Key" });

  if (BLOCKED_METHODS.includes(method)) {
    return res.status(403).json({ error: `Method ${method} is not allowed` });
  }

  const log = {
    id: uuidv4(),
    time: new Date().toISOString(),
    method,
    chain,
    userKey,
    cached: false,
    error: false,
    latency: null,
  };

  // ── Redis cache check ────────────────────────────────────────────────────
  if (CACHEABLE_METHODS.includes(method)) {
    const cacheKey = `rpc:${chain}:${JSON.stringify(req.body)}`;
    const cached = await cacheGet(cacheKey);
    if (cached) {
      log.cached = true;
      log.latency = 0;
      pushLog(log);
      // fire-and-forget log insert
      supabase.from("request_logs").insert({
        api_key: userKey,
        user_id: keyRecord.user_id,
        method,
        chain,
        cache_hit: true,
        status: 200,
        response_time_ms: 0,
      }).then(() => {});
      return res.json(typeof cached === "string" ? JSON.parse(cached) : cached);
    }
  }

  const start = Date.now();
  try {
    const data = await forwardWithRetry(req.body, chain);
    const latency = Date.now() - start;

    if (CACHEABLE_METHODS.includes(method) && data && !data.error) {
      const cacheKey = `rpc:${chain}:${JSON.stringify(req.body)}`;
      await cacheSet(cacheKey, JSON.stringify(data), CACHE_TTL);
    }

    // Increment request count in Supabase (fire-and-forget)
    supabase.rpc("increment_key_requests", { key_id: keyRecord.id }).then(() => {});

    log.latency = latency;
    pushLog(log);

    supabase.from("request_logs").insert({
      api_key: userKey,
      user_id: keyRecord.user_id,
      method,
      chain,
      cache_hit: false,
      status: 200,
      response_time_ms: latency,
    }).then(() => {});

    res.json(data);
  } catch (err) {
    const latency = Date.now() - start;
    log.error = true;
    log.latency = latency;
    pushLog(log);

    supabase.rpc("increment_key_errors", { key_id: keyRecord.id }).then(() => {});
    supabase.from("request_logs").insert({
      api_key: userKey,
      user_id: keyRecord.user_id,
      method,
      chain,
      cache_hit: false,
      status: 500,
      response_time_ms: latency,
    }).then(() => {});

    console.error(`[RPCForge] RPC Error on ${chain}:`, err.message);
    res.status(500).json({ error: "Error forwarding request" });
  }
});

// ─── Global error handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[RPCForge] Unhandled error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`RPCForge 🚀 running on port ${PORT}`);
});
