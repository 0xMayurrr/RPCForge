# Contributing to RPCForge

First off, thank you for considering contributing! 🎉

## Ways to Contribute

- 🐛 Report bugs
- 💡 Suggest features
- 📝 Improve documentation
- 🔧 Submit code fixes
- ⭐ Star the repo (seriously, it helps!)

## Development Setup

### Prerequisites
- Node.js 20+
- Docker (optional)
- A code editor

### Local Development

1. Fork and clone:
```bash
   git clone https://github.com/YOUR_USERNAME/RPCForge.git
   cd RPCForge
```

2. Install dependencies:
```bash
   npm install
   cd frontend && npm install
```

3. Set up `.env`:
```bash
   cp .env.example .env
   # Add your node URLs and secrets
```

4. Run backend:
```bash
   node server.js
```

5. Run frontend (in another terminal):
```bash
   cd frontend
   npm run dev
```

6. Test your changes:
```bash
   # Send a test request
   curl -X POST http://localhost:3000/eth \
     -H "x-api-key: mykey123" \
     -H "Content-Type: application/json" \
     -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

## Code Style

- Use ES6+ syntax
- Follow existing code formatting
- Add comments for complex logic
- Keep functions under 50 lines when possible

## Pull Request Process

1. Create a feature branch:
```bash
   git checkout -b feature/my-awesome-feature
```

2. Make your changes and commit:
```bash
   git commit -m "Add awesome feature"
```

3. Push to your fork:
```bash
   git push origin feature/my-awesome-feature
```

4. Open a Pull Request with:
   - Clear description of changes
   - Link to related issue (if any)
   - Screenshots (for UI changes)

## Commit Message Guidelines

Use conventional commits:
- `feat:` add WebSocket support for eth_subscribe
- `fix:` handle node timeout errors correctly
- `docs:` update API reference for new endpoints
- `chore:` upgrade dependencies

## Testing

Before submitting:
- Test manually with different chains
- Check that existing features still work
- Ensure no console errors

*(We'll add automated tests soon!)*

## Good First Issues

New to the project? Look for issues tagged `good-first-issue`

## Questions?
- Open a GitHub Discussion
- Join our Discord *(coming soon)*

## Code of Conduct

Be respectful. Be kind. Help others learn.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

Happy coding! ⚡
