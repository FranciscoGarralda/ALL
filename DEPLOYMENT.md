# Deployment Guide

## 🚀 Frontend - Vercel

### Environment Variables
```
NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
```

### Deployment Steps
1. Connect your GitHub repository to Vercel
2. Set the environment variable
3. Deploy

## 🚀 Backend - Railway

### Required Environment Variables
```
DATABASE_URL=postgresql://...
JWT_SECRET=[generate-a-secure-random-string]
ADMIN_PASSWORD=[set-a-strong-password]
NODE_ENV=production
PORT=8080
FRONTEND_URL=https://your-frontend.vercel.app
```

### Database Setup
The application will automatically create tables on first run.

### Initial Admin Access
After deployment, the admin user will be created with:
- Email: admin@sistema.com
- Password: [the one you set in ADMIN_PASSWORD]

⚠️ **IMPORTANT**: 
- Never use default or weak passwords
- Generate a strong JWT_SECRET (at least 32 characters)
- Change admin password immediately after first login

### Security Checklist
- [ ] Set strong JWT_SECRET
- [ ] Set strong ADMIN_PASSWORD
- [ ] Configure CORS properly
- [ ] Enable HTTPS (automatic on Railway)
- [ ] Review all environment variables