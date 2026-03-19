# Changelog

All notable changes to RPCForge will be documented here.

Format based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)

## [Unreleased]

### Planned
- WebSocket support for `eth_subscribe`
- Prometheus metrics export
- GraphQL query layer

---

## [1.0.0] - 2025-03-XX

### Added
- Multi-chain support (Ethereum, Polygon, BSC, Arbitrum, Sepolia)
- Multi-node failover with automatic retry
- Per-key rate limiting (Free: 20 req/min, Pro: 100 req/min)
- Response caching (10s TTL) for common methods
- Method blacklist (blocks dangerous RPC methods)
- Real-time WebSocket dashboard
- API key management UI
- Supabase authentication (email + Google OAuth)
- CLI tool for power users
- Admin API for stats, logs, key management
- Docker + docker-compose support
- Deployment guides for Railway + Vercel

### Security
- API key authentication on all RPC requests
- Admin secret protection for sensitive routes
- Method blacklist prevents abuse

---

## Legend

- `Added` - New features
- `Changed` - Changes in existing functionality
- `Deprecated` - Soon-to-be removed features
- `Removed` - Removed features
- `Fixed` - Bug fixes
- `Security` - Security improvements
