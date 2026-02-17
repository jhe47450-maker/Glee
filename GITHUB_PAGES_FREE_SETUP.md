# 🚀 GitHub Pages + Railway Setup Guide (100% FREE)

## What You Get

✅ **Frontend**: Hosted on GitHub Pages (FREE)
✅ **Backend**: Running on Railway Node.js (FREE - $5/month credit)
✅ **Total Cost**: $0 per month
✅ **Uptime**: 99.9% reliable
✅ **Scalability**: Unlimited users

---

## 📊 Why This Setup?

| Feature | GitHub Pages | Railway | Total |
|---------|-------------|---------|-------|
| **Cost** | $0 | $0 (free tier) | **$0** ✨ |
| **Uptime** | 99.99% | 99.9% | **Excellent** |
| **Speed** | Fast CDN | Good | **Great** |
| **Custom Domain** | ✅ Yes | ✅ Yes | **Both** |
| **Auto-Deploy** | ✅ Yes | ✅ Yes | **Automatic** |
| **Reliability** | Production | Production | **Professional** |

---

## 🎯 Quick Start (10 minutes)

### Step 1: Enable GitHub Pages

1. Go to GitHub → Settings → Pages
2. Source: Deploy from a branch
3. Branch: `main` → Folder: `/ (root)`
4. Click **Save**
5. Wait 2 minutes for first deployment

### Step 2: Create Railway Backend

1. Go to [railway.app](https://railway.app)
2. Click **+ Create New Project**
3. Select **Repo → GitHub**
4. Select your `Glee` repository
5. Click **Deploy**
6. Wait 3-5 minutes
7. Copy the **Service URL** from Railway dashboard

### Step 3: Connect Frontend to Backend

Update `VITE_API_BASE` in GitHub Actions workflow:

1. Go to `.github/workflows/github-pages.yml`
2. Find line: `VITE_API_BASE: https://your-railway-app.railway.app/api`
3. Replace with your Railway URL
4. Commit and push

### Step 4: Done! 🎉

**Frontend**: `https://jhe47450-maker.github.io/Glee`
**Backend**: `https://your-railway-app.railway.app/api`

---

## 📁 File Structure for GitHub Pages

```
Glee/
├── dist/                      # GitHub Pages serves this
│   ├── index.html
│   ├── product.html
│   └── ...
├── src/                       # Source code
├── .github/workflows/
│   └── github-pages.yml      # Auto-deploy script
├── vite.config.js            # Has base: '/Glee/'
└── package.json              # Build scripts
```

---

## 🔧 Local Development

```bash
# Start frontend (http://localhost:5173)
npm run dev

# In another terminal, start backend (http://localhost:5000)
npm run dev:server

# Or both together
npm run dev:all
```

---

## 🚀 Deployment

### Frontend (Automatic via GitHub Actions)
```bash
# Just push to main!
git add .
git commit -m "Update styling"
git push origin main
# ✨ Automatically deploys to GitHub Pages!
```

### Backend (Automatic via Railway)
```bash
# Railway auto-deploys when you push
git push origin main
# ✨ Railway detects changes and auto-deploys!
```

---

## 📋 Setup Checklist

### GitHub Pages Setup
- [ ] Enable Pages in GitHub Settings
- [ ] Select `main` branch as source
- [ ] Wait for first deployment
- [ ] Visit `https://USERNAME.github.io/Glee`

### Railway Setup
- [ ] Create Railway account
- [ ] Connect GitHub repository
- [ ] Select `Glee` repo
- [ ] Deploy Node.js backend
- [ ] Copy Service URL

### Connect Frontend to Backend
- [ ] Get Railway URL
- [ ] Update `.github/workflows/github-pages.yml`
- [ ] Update `VITE_API_BASE`
- [ ] Push to GitHub
- [ ] Tests if orders work

### Verify Everything Works
- [ ] Frontend loads at GitHub Pages URL
- [ ] Can create order
- [ ] Can see review
- [ ] No CORS errors in console

---

## 🆘 Common Issues & Fixes

### Issue 1: "Page not found" on GitHub Pages
**Problem**: Visiting `https://jhe47450-maker.github.io/Glee` shows 404
**Fix**: 
- Go to Settings → Pages
- Ensure source is set to `main` branch
- Wait 5 minutes
- Clear browser cache

### Issue 2: "Cannot GET /product.html"
**Problem**: Links don't work on GitHub Pages
**Fix**: This is normal! GitHub Pages serves from `/Glee/` subdirectory
- The `vite.config.js` already has `base: '/Glee/'`
- Just rebuild: `npm run build`
- Push: `git push origin main`

### Issue 3: API calls return 404
**Problem**: "Cannot POST /api/orders"
**Fix**:
- Check Railway URL is correct
- Update `.github/workflows/github-pages.yml`
- Ensure `VITE_API_BASE` ends with `/api`
- Check Railway backend is running

### Issue 4: CORS errors
**Problem**: "Access to XMLHttpRequest blocked by CORS policy"
**Fix**: This means backend isn't running
- Check Railway status
- Verify `VITE_API_BASE` is correct URL
- Try accessing backend URL directly in browser
- Should show: `{"status":"OK"}`

### Issue 5: GitHub Pages shows old version
**Problem**: See old code even after pushing new code
**Fix**:
- Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- Check Actions tab → see if build succeeded
- Clear browser cache
- Incognito window to bypass cache

---

## 📝 Setup Your Railway URL

### Step-by-Step:

1. **Go to railway.app dashboard**
2. **Click your deployment**
3. **Look for "Service" section**
4. **Find "Public URL"** or "Environment"
5. **Copy the URL** (looks like `https://abcd-efgh-1234.railway.app`)
6. **Update in workflow:**

```yaml
# .github/workflows/github-pages.yml
VITE_API_BASE: https://YOUR-RAILWAY-URL.railway.app/api
```

7. **Commit and push:**

```bash
git add .github/workflows/github-pages.yml
git commit -m "Update Railway URL"
git push origin main
```

8. **Wait for deployment** (check Actions tab)

---

## 🎯 How It Works

```
User visits GitHub Pages
         ↓
Browser loads HTML/CSS/JS from GitHub Pages CDN
         ↓
JavaScript runs in browser
         ↓
User clicks "Create Order"
         ↓
Browser sends POST to Railway backend
         ↓
Railway Node.js server processes request
         ↓
Data saved in Railway storage
         ↓
Response sent back to browser
         ↓
Order confirmation displayed! ✅
```

---

## 🔐 Security

✅ **HTTPS everywhere** (GitHub Pages & Railway both use HTTPS)
✅ **CORS configured** (Only your domain can access API)
✅ **Input validation** (Backend validates all data)
✅ **Error messages safe** (No sensitive info exposed)
✅ **No credentials exposed** (Railway URL is public, that's fine)

---

## 📊 Monitoring

### Check Frontend Status
```
Go to: https://jhe47450-maker.github.io/Glee
Should load without errors
```

### Check Backend Status
```
Go to: https://your-railway-app.railway.app/health
Should show: {"status":"OK"}
```

### Check GitHub Actions
```
Go to: GitHub.com → Your Repo → Actions
Should show: ✅ All workflows passed
```

### Check Railway Logs
```
Go to: railway.app → Your Project → Logs
Should show: Server listening on port 3000
```

---

## 🆙 Upgrading (If needed later)

If you outgrow the free tier:

### GitHub Pages
- Still free! No limit

### Railway
- Free tier: $5 credit/month
- Paid tier: Start at $5/month (billed hourly)
- But often stays in free tier!

---

## 💡 Pro Tips

1. **Keep API URL in GitHub Secrets?**
   - Not needed! GitHub Pages URL is public
   - Railway URL is also okay to be public
   - It's protected by CORS

2. **Custom Domain?**
   - GitHub Pages: Settings → Pages → Custom Domain
   - Railway: Settings → Domain → Add Custom Domain

3. **Environment Variables?**
   - Frontend: Use `.env.github-pages`
   - Backend: Use Railway dashboard → Variables

4. **Database Later?**
   - Railway has free PostgreSQL tier
   - Can migrate from JSON files easily

---

## 🚀 Next Steps

1. **Now**: Push to GitHub
2. **5 min**: Frontend deploys to GitHub Pages
3. **10 min**: Backend deploys to Railway
4. **15 min**: Test ordering at `https://USERNAME.github.io/Glee`
5. **Done**: Tell everyone about your app! 🎉

---

## 📞 Need Help?

Check these files:
- `NODE_SERVER.md` - Backend documentation
- `DEPLOYMENT.md` - General deployment guide
- `GITHUB_PAGES_SETUP.md` - This file!
- `README.md` - Project overview

Visit resources:
- [GitHub Pages Docs](https://pages.github.com/)
- [Railway Docs](https://railway.app/docs)
- [Vite Config Reference](https://vitejs.dev/config/)

---

## ✨ Summary

**You now have:**
- ✅ Frontend hosted on GitHub Pages (FREE)
- ✅ Backend running on Railway (FREE)
- ✅ Auto-deployment on every push
- ✅ Professional-grade hosting
- ✅ Scaling capability
- ✅ $0 cost per month

**All you need to do:**
1. `git push origin main`
2. Wait 5 minutes
3. Visit your site!

---

**Status**: ✅ Ready to Deploy
**Last Updated**: February 17, 2026
**Cost**: 💚 FREE
