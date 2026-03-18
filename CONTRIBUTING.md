# Contributing to RPCForge

## Getting Started

1. Fork the repo and clone it locally
2. Copy `.env.example` to `.env` and fill in your node URLs
3. `npm install` in root and `frontend/`
4. `node server.js` to start the backend
5. `cd frontend && npm run dev` to start the dashboard

## Project Structure

- `server.js` — all backend logic (Express + WebSocket)
- `frontend/src/` — React dashboard
- `cli/` — Node.js CLI tool

## Commit Style

Use conventional commits:
- `feat:` new feature
- `fix:` bug fix
- `chore:` tooling / config
- `style:` UI / CSS only
- `docs:` documentation

## Pull Requests

- Keep PRs small and focused
- Test your changes locally before submitting
- Update the README if you add new features or env vars
