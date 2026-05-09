You are an expert React + Tailwind CSS frontend developer. I have a Web3 RPC gateway project called RPCForge. Upgrade the entire frontend (React 18 + Vite + Tailwind CSS) into a professional, modern SaaS web app.

## Project Context
- RPCForge is a self-hostable Ethereum RPC gateway (like Infura/Alchemy)
- Supports chains: Ethereum, Polygon, BSC, Arbitrum, Sepolia
- Has: API key management, rate limiting, real-time WebSocket dashboard, Stripe billing, Supabase auth
- Backend: Node.js + Express on Render
- Frontend files: App.jsx, LandingPage.jsx, SignupPage.jsx, Dashboard.jsx, supabase.js

## What to Redesign

### 1. LandingPage.jsx
- Dark theme (bg-gray-950 / bg-zinc-950) with purple/violet accent (#6467f2)
- Hero section: bold headline, subheadline, CTA buttons (Get Started, View Docs)
- Animated gradient background or subtle grid pattern
- Features section: icon cards (Multi-chain, Failover, Rate Limiting, Caching, Dashboard, CLI)
- Pricing section: 4 tier cards (Free/Dev/Pro/Team) with highlighted "Pro" card
- Stats bar: "5 chains supported", "99.9% uptime", "Unlimited requests"
- Footer with links

### 2. SignupPage.jsx
- Centered card with glassmorphism effect
- Email/password fields with proper validation UI
- Toggle between Login / Sign Up
- Show loading spinner on submit
- Error/success toast notifications

### 3. Dashboard.jsx
- Sidebar navigation (dark, collapsible on mobile)
- Top navbar with user avatar, plan badge, logout
- Overview cards: Total Requests, Errors, Cache Hits, Active Keys
- Real-time request log table (WebSocket feed) with method, chain, status, latency columns
- Line chart for requests over time (Chart.js)
- API Keys panel: table with key, tier badge, created date, copy button, revoke button
- Billing section: current plan card, upgrade button to Stripe Checkout
- Chain status panel: show each chain with node count and status dot

### 4. General Requirements
- Fully responsive (mobile + desktop)
- Smooth transitions and hover effects
- Use Lucide React icons throughout
- Use consistent color system:
  - Background: #09090b (zinc-950)
  - Card: #18181b (zinc-900)
  - Border: #27272a (zinc-800)
  - Accent: #6467f2 (purple)
  - Success: #22c55e
  - Error: #ef4444
  - Text primary: #fafafa
  - Text muted: #a1a1aa
- No external UI libraries (no shadcn, no MUI) — pure Tailwind only
- Keep all existing logic (Supabase auth, WebSocket, Stripe calls, API calls) intact
- Only redesign the JSX/CSS, do not break any functionality

## File Structure
frontend/src/
├── App.jsx
├── LandingPage.jsx
├── SignupPage.jsx
├── Dashboard.jsx
└── supabase.js

Please rewrite each file one by one, starting with LandingPage.jsx, then SignupPage.jsx, then Dashboard.jsx, then App.jsx. For each file, output the complete updated file content.
