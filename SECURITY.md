# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

## Reporting a Vulnerability

**DO NOT** open a public issue for security vulnerabilities.

Instead:

1. Email: security@rpcforge.dev *(or create one)*
2. Subject: `[SECURITY] Brief description`
3. Include:
   - Vulnerability description
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

**Response Time**: 
- Initial response: Within 48 hours
- Fix timeline: Depends on severity

**Severity Levels**:
- **Critical**: Immediate action (RCE, auth bypass, data leak)
- **High**: Fix within 7 days
- **Medium**: Fix within 30 days
- **Low**: Fix in next release

## Security Best Practices

When using RPCForge:

1. **Never commit `.env` files** - Use environment variables
2. **Rotate API keys regularly** - At least every 90 days
3. **Use HTTPS only** - Never send API keys over HTTP
4. **Monitor admin endpoints** - Restrict `/keys`, `/stats` to trusted IPs
5. **Keep dependencies updated** - Run `npm audit` regularly

## Known Security Features

- ✅ Rate limiting per API key
- ✅ Method blacklisting (blocks risky RPC methods)
- ✅ Request/response logging
- ✅ API key-based authentication
- ✅ Admin endpoint protection

## Disclosure Policy

Once a fix is released:
- We'll publish a security advisory
- Credit the reporter (if desired)
- Update CHANGELOG.md

Thank you for helping keep RPCForge secure! 🔒
