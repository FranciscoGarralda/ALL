# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.x.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability, please follow these steps:

1. **DO NOT** open a public issue
2. Email security concerns to: francisco.garralda@yourdomain.com
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

## Security Measures

This project implements the following security measures:

### Authentication & Authorization
- JWT-based authentication
- Bcrypt password hashing (10 rounds)
- Role-based access control (RBAC)
- Session expiration (24h)

### Data Protection
- Environment variables for sensitive data
- No hardcoded credentials
- HTTPS enforced in production
- SQL injection prevention via parameterized queries

### Dependencies
- Weekly Dependabot updates
- Security audits on every push
- ESLint security rules
- Trivy vulnerability scanning

### Infrastructure
- Railway deployment with secure defaults
- PostgreSQL with connection pooling
- Graceful shutdown handling
- Health check endpoints

## Security Headers

The application uses the following security headers:
- `helmet` for comprehensive header security
- CORS restricted to allowed origins
- Rate limiting on API endpoints

## Development Guidelines

1. Never commit sensitive data
2. Use environment variables for configuration
3. Keep dependencies updated
4. Run `npm audit` before committing
5. Follow OWASP best practices

## Compliance

This project aims to comply with:
- OWASP Top 10 recommendations
- GDPR data protection requirements
- Industry standard security practices