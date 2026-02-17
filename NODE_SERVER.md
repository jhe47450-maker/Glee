# 🚀 Quick Start - Node.js Backend

## What Changed?

✅ **Replaced:** Python Flask server (`server.py`)
✅ **With:** Node.js Express server (`server/index.js`)
✅ **Added:** GitHub Actions for auto-deployment
✅ **Ready:** For production on Railway, Vercel, or GitHub Pages

---

## ⚡ 5-Minute Setup

### 1. Install Dependencies
```bash
npm install
```

This installs:
- `express` - Backend server
- `cors` - Cross-origin requests
- `concurrently` - Run frontend + backend together

### 2. Start Locally

**Option A: Both together (Easy)**
```bash
npm run dev:all
```

**Option B: Separate terminals**

Terminal 1 (Frontend):
```bash
npm run dev
```

Terminal 2 (Backend):
```bash
npm run dev:server
```

### 3. Test It Works

Frontend: http://localhost:5173
Backend: http://localhost:5000/api/orders
Health: http://localhost:5000/health

---

## 📁 File Structure

```
server/
├── index.js          ← New Node.js backend
├── data/
│  ├── orders.json    ← Order data (auto-created)
│  └── reviews.json   ← Review data (auto-created)

root/
├── .env.development  ← Local config (NEW)
├── .env.production   ← Production config (NEW)
├── .github/
│  └── workflows/
│     └── deploy.yml  ← Auto-deployment (NEW)
└── package.json      ← Updated with new scripts
```

---

## 🎯 Available API Endpoints

### Orders
```
GET    /api/orders           # List all
POST   /api/orders           # Create
GET    /api/orders/:id       # Get one
PUT    /api/orders/:id       # Update
DELETE /api/orders/:id       # Delete
```

### Reviews
```
GET    /api/reviews          # List all
POST   /api/reviews          # Create
PUT    /api/reviews/:id      # Update
DELETE /api/reviews/:id      # Delete
```

### System
```
GET    /health               # Server status
```

---

## 🐳 What's Inside the Server?

The new Express server includes:

✅ **CORS handling** - Frontend can communicate
✅ **Error handling** - Graceful error responses
✅ **Data persistence** - JSON files (no database needed)
✅ **Validation** - Input validation on forms
✅ **Timestamps** - Auto-tracking created/updated times
✅ **Health checks** - Server status endpoint
✅ **Production ready** - Error logging, environment support

---

## 🌍 Deployment Flowchart

```
Local Development
    ↓
npm install && npm run dev:all
    ↓
Test at http://localhost:5173
    ↓
git push origin main
    ↓
GitHub Actions Runs (.github/workflows/deploy.yml)
    ├── √ Builds frontend → Vercel
    ├── √ Deploys backend → Railway
    └── √ Optional: GitHub Pages
    ↓
Live at https://your-domain.com
```

---

## 🚀 Deploy Now (3 Steps)

### Step 1: Create Railway Account
```bash
# Go to railway.app
# Sign up with GitHub
# Link your repository
```

### Step 2: Configure GitHub Secrets
```
Settings → Secrets → Add:
- RAILWAY_TOKEN
- RAILWAY_PROJECT_ID
```

### Step 3: Push to Main
```bash
git add .
git commit -m "Use Node.js backend"
git push origin main
# Automatic deployment! 🎉
```

---

## 📊 Scripts Available

```bash
# Development
npm run dev              # Frontend Vite dev server
npm run dev:server      # Backend Express server
npm run dev:all         # Both together

# Building
npm run build           # Build frontend for production
npm run optimize        # Regenerate HTML

# Production
npm start               # Start backend server

# Monitoring
npm run analyze         # Analyze bundle size
npm run preview         # Preview prod build locally
```

---

## 🔧 Configuration

### Local Development (.env.development)
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
VITE_API_BASE=http://localhost:5000/api
```

### Production (.env.production)
```env
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://your-frontend.com
VITE_API_BASE=https://api.your-domain.com/api
```

---

## ✅ Checklist

- [ ] Run `npm install`
- [ ] Run `npm run dev:all`
- [ ] Test frontend at http://localhost:5173
- [ ] Test API at http://localhost:5000/api/orders
- [ ] Create order via form
- [ ] Verify order saved in `server/data/orders.json`
- [ ] Push to GitHub main branch
- [ ] Verify GitHub Actions runs
- [ ] Monitor Railway logs

---

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| `PORT 5000 already in use` | `PORT=5001 npm run dev:server` |
| `CORS errors` | Check `.env` has correct URLs |
| `npm ERR!` | Delete `node_modules` & `package-lock.json`, then `npm install` |
| `Data lost on restart` | It's normal, data is only in memory during dev. Use `server/data/*.json` |

---

## 📚 See Also

- [DEPLOYMENT.md](./DEPLOYMENT.md) - Full deployment guide
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Frontend architecture
- [QUICK_WINS.md](./QUICK_WINS.md) - Production checklist
- [SUGGESTIONS.md](./SUGGESTIONS.md) - Advanced features

---

## 🎉 Ready to Go!

Your full-stack Node.js application is ready to run locally and deploy to production!

```bash
npm run dev:all
```

**Happy coding! 🚀**
