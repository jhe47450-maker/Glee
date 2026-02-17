# 🚀 Deployment Guide - GleeJeYly

## Overview

GleeJeYly now uses:
- **Frontend**: Vite + Vue (or vanilla JS)
- **Backend**: Node.js + Express
- **Data**: JSON files (local) or Database (production)
- **Deployment**: GitHub Actions + Railway/Vercel

---

## 🏠 Local Development

### Prerequisites
- Node.js 18+ ([Download](https://nodejs.org/))
- npm or yarn
- Git

### Setup

```bash
# 1. Clone repository
git clone https://github.com/jhe47450-maker/Glee.git
cd Glee

# 2. Install dependencies
npm install

# 3. Copy environment file
cp .env.example .env.development

# 4. Start frontend (terminal 1)
npm run dev

# 5. Start backend (terminal 2)
npm run dev:server

# 6. Or run both together (terminal)
npm run dev:all
```

**Access:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api
- Health check: http://localhost:5000/health

### Data Persistence
Data is stored in:
- `/server/data/orders.json`
- `/server/data/reviews.json`

---

## 📦 Build for Production

```bash
# Build frontend assets
npm run build

# Output: ./dist/

# Test production build locally
npm run preview

# Then start server in production mode
NODE_ENV=production npm start
```

---

## 🚀 Deployment Options

### Option 1: Railway (Recommended for Full Stack)

**Advantages:**
- Free tier available
- Easy Node.js deployment
- GitHub integration
- Environment variables UI
- Database support

**Steps:**

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app/)
   - Sign up with GitHub

2. **Connect GitHub Repository**
   ```bash
   railway init
   railway link
   ```

3. **Set Environment Variables**
   ```bash
   railway variables set NODE_ENV=production
   railway variables set PORT=3000
   railway variables set FRONTEND_URL=https://your-frontend-url.com
   ```

4. **Deploy**
   ```bash
   railway deploy
   # or push to main branch for auto-deploy
   git push origin main
   ```

5. **Get Backend URL**
   - Copy from Railway dashboard
   - Update frontend VITE_API_BASE

---

### Option 2: Heroku (Free tier ending)

**Note:** Heroku ended free tier support. Use Railway, Render, or Fly.io instead.

---

### Option 3: Vercel (Frontend only)

**Advantages:**
- Free tier
- Fast CDN globally
- Easy GitHub integration
- Automatic deployment

**Steps:**

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Configure Environment Variables**
   - In Vercel Dashboard → Project Settings → Environment Variables
   - Add `VITE_API_BASE=https://your-api-url.com/api`

---

### Option 4: GitHub Pages (Static Frontend only)

**Advantages:**
- Free
- GitHub integrated
- No backend needed

**Steps:**

1. **Update vite.config.js:**
   ```javascript
   export default defineConfig({
     base: '/Glee/',  // Your repo name
     // ...
   });
   ```

2. **Update GitHub Pages settings:**
   - Settings → Pages → Source: GitHub Actions

3. **GitHub Pages automatically deploys** when you push to main

**Note:** This only hosts frontend. Backend needs separate service (Railway, Render, etc.)

---

### Option 5: Docker + Custom VPS

**Dockerfile:**

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy app files
COPY . .

# Build frontend
RUN npm run build

# Expose port
EXPOSE 5000

# Start server
CMD ["npm", "start"]
```

**Build & Run:**
```bash
docker build -t gleejeyly .
docker run -p 5000:5000 gleejeyly
```

---

## 🔧 Environment Variables for Production

### Backend (.env.production)
```env
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://your-frontend.com
# For database (future):
# DB_HOST=prod-db.example.com
# DB_NAME=gleejeyly_prod
# DB_USER=secret
# DB_PASSWORD=secret
```

### Frontend (vite.env.production)
```env
VITE_API_BASE=https://api.your-domain.com/api
```

---

## 🔄 GitHub Actions CI/CD

### Automatic Deployment

The `.github/workflows/deploy.yml` will:
1. **Build & Test** on every push
2. **Deploy Frontend** to Vercel on push to main
3. **Deploy Backend** to Railway on push to main
4. **Alternative:** Deploy frontend to GitHub Pages

### Setup GitHub Secrets

Navigate to: **Settings → Secrets and variables → Actions**

Add for Vercel:
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

Add for Railway:
- `RAILWAY_TOKEN`
- `RAILWAY_PROJECT_ID`

Add for Heroku (if using):
- `HEROKU_API_KEY`
- `HEROKU_APP_NAME`
- `HEROKU_EMAIL`

---

## 📊 Monitoring & Logs

### Local
```bash
# View backend logs
npm run dev:server

# View frontend build issues
npm run build
```

### Production (Railway)
```bash
# View logs
railway logs

# SSH into container (if SSH enabled)
railway shell
```

### Vercel
- Dashboard → Logs → Deployment Logs

---

## 🔐 Production Checklist

- [ ] Environment variables configured
- [ ] Backend error tracking setup (Sentry)
- [ ] Database backups enabled (if using DB)
- [ ] Monitoring/logging enabled
- [ ] CORS properly configured
- [ ] SSL/TLS enabled
- [ ] API rate limiting configured
- [ ] Health checks passing
- [ ] Frontend correctly points to backend API
- [ ] Domain/DNS configured

---

## 🐛 Troubleshooting

### Backend not accessible from frontend

**Problem:** CORS errors in browser console

**Solution:**
1. Check `CORS` config in `server/index.js`
2. Ensure `FRONTEND_URL` is in origin list
3. Verify API_BASE is correctly set in frontend

```javascript
// server/index.js
app.use(cors({
  origin: ['http://localhost:5173', 'https://your-frontend.com'],
  credentials: true
}));
```

### Data not persisting

**Problem:** Orders/reviews not saved

**Solution:**
1. Ensure `/server/data/` directory exists
2. Check file permissions: `ls -la server/data/`
3. Verify JSON syntax if manually editing files

### Port already in use

```bash
# Find process using port 5000
lsof -i :5000

# Kill process
kill -9 <PID>

# Or use different port
PORT=5001 npm run dev:server
```

### Deployment fails

```bash
# Check logs
npm run build  # Test locally

# Check Node version
node --version  # Should be 18+

# Verify all env vars are set
printenv | grep VITE_
```

---

## 📚 Useful Commands

```bash
# Local development
npm run dev:all              # Frontend + Backend

# Building
npm run build                # Build frontend
npm run optimize             # Regenerate HTML templates

# Production
npm start                    # Start backend only
NODE_ENV=production npm start

# Monitoring
npm run analyze              # Bundle size analysis
npm run lighthouse           # Performance report

# GitHub/Deployment
git push origin main         # Trigger CI/CD
railway logs                 # View production logs
railway shell                # SSH into Railway container
```

---

## 🎯 Next Steps

1. **Choose deployment platform** (Railway recommended)
2. **Create accounts** and link GitHub
3. **Add GitHub Secrets** for CI/CD
4. **Push to `main` branch** to trigger deployment
5. **Test in production**
6. **Monitor logs** for any issues
7. **Setup custom domain** (optional)

---

## 📞 Support

- **Node.js Issues**: [nodejs.org/docs](https://nodejs.org/docs/)
- **Express**: [expressjs.com](https://expressjs.com/)
- **Railway**: [railway.app/docs](https://railway.app/docs/)
- **Vercel**: [vercel.com/docs](https://vercel.com/docs/)
- **GitHub Actions**: [github.com/actions](https://github.com/features/actions)

---

**Last Updated:** February 16, 2026
