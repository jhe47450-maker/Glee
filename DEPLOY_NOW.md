# 🚀 Deploy Your App in 15 Minutes

> ⭐ **RECOMMENDED**: GitHub Pages (Frontend) + Railway (Backend)  
> **COST**: $0/month | **UPTIME**: 99.9% | **SETUP TIME**: 15 min

---

## ✅ Pre-Deploy Checklist

- [ ] Code is committed and pushed to GitHub
- [ ] Repository is public (or you have premium)
- [ ] Node.js 18+ installed locally
- [ ] `npm install` completed successfully
- [ ] `npm run build` runs without errors
- [ ] Backend server starts: `node server/index.js`

---

## 🎯 Step-by-Step Deployment

### STEP 1: Enable GitHub Pages (2 minutes)

1. Go to: **GitHub.com → Your Repository → Settings**
2. Sidebar: Click **"Pages"**
3. Under "Build and deployment":
   - **Source**: Select `Deploy from a branch`
   - **Branch**: Select `main`
   - **Folder**: Select `/ (root)` 
4. Click **Save**
5. ⏳ Wait 2 minutes
6. ✅ Your frontend will be live at: `https://USERNAME.github.io/Glee`

### STEP 2: Create Backend on Railway (5 minutes)

1. Go to: **[railway.app](https://railway.app)**
2. Click: **"+ New Project"**
3. Select: **"GitHub"** → Search for **"Glee"**
4. Select your repository
5. Click: **"Deploy"**
6. ⏳ Wait 3-5 minutes for deployment
7. Once deployed:
   - Click on your **"Service"**
   - Look for **"Service URL"** or **"Deployments"**
   - **Copy the URL** (looks like: `https://abc-def-1234.railway.app`)

### STEP 3: Connect Frontend to Backend (3 minutes)

1. **Edit GitHub Actions workflow:**
   ```bash
   cd /workspaces/Glee
   # Edit this file: .github/workflows/github-pages.yml
   ```

2. **Find this section:**
   ```yaml
   env:
     VITE_API_BASE: https://your-railway-app.railway.app/api
   ```

3. **Replace with your Railway URL:**
   ```yaml
   env:
     VITE_API_BASE: https://YOUR-ACTUAL-RAILWAY-URL.railway.app/api
   ```
   > Replace `YOUR-ACTUAL-RAILWAY-URL` with your URL from Step 2

4. **Commit and push:**
   ```bash
   git add .github/workflows/github-pages.yml
   git commit -m "Update Railway API URL"
   git push origin main
   ```

5. ✅ **GitHub Actions automatically redeploys**
   - Check: **GitHub → Actions tab**
   - Should show green checkmark ✅

### STEP 4: Test Your Application (2 minutes)

1. **Open frontend:** `https://USERNAME.github.io/Glee`
2. **Test ordering:**
   - Click "Order"
   - Fill form
   - Click "Submit"
   - ✅ Should see confirmation
3. **Check console for errors:**
   - Right-click → **"Inspect"**
   - **"Console"** tab
   - No red errors? Great! 🎉

---

## 🎉 You're Done!

Your app is now live:

| Part | URL | Status |
|------|-----|--------|
| **Frontend** | `https://USERNAME.github.io/Glee` | ✅ Live |
| **Backend** | `https://YOUR-RAILWAY-URL.railway.app/api` | ✅ Live |
| **Cost** | Free! | 💚 $0/month |

---

## 🆘 Troubleshooting

### ❌ Frontend shows 404
**Solution:**
- Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- Delete browser cache
- Wait 5 minutes for Pages to update

### ❌ Orders don't save
**Problem**: API calls failing
**Solution:**
1. Check Railway URL is correct
2. Open browser console (F12)
3. Look for errors mentioning API
4. Verify `.github/workflows/github-pages.yml` has correct URL
5. Try accessing backend directly: `https://YOUR-RAILWAY-URL.railway.app/health`

### ❌ Railway says "Deployment failed"
**Solution:**
1. Go to Railway dashboard
2. Click your project
3. Check **"Logs"** tab
4. Look for error messages
5. Common fixes:
   - Port conflict: Kill any processes using port 5000
   - Check `package.json` has correct start script
   - Ensure `server/index.js` exists

### ❌ GitHub Actions workflow shows red ❌
**Solution:**
1. Click the failed workflow
2. Click the failed job
3. Scroll down to see error
4. Common issues:
   - Invalid `VITE_API_BASE` URL
   - Build failed (check `npm run build` locally)
   - Missing environment variables

---

## 📊 Verification Checklist

After deployment, verify everything works:

- [ ] Frontend loads at GitHub Pages URL
- [ ] No 404 errors
- [ ] No CORS errors in console
- [ ] Can create order successfully
- [ ] Order data persists (refresh page, still there)
- [ ] Can submit review
- [ ] Backend responds to `/health` endpoint
- [ ] No sensitive data in console logs

---

## 🔒 Keeping Your App Secure

✅ Always use HTTPS (both GitHub Pages and Railway do this automatically)
✅ Never commit `.env` files with secrets
✅ Backend validates all input
✅ CORS is configured correctly

---

## 🚀 What's Next?

After deployment:

1. **Use your app!** 
   - Share the GitHub Pages URL with friends
   - Test ordering and reviews

2. **Keep improving:**
   - See `SUGGESTIONS.md` for advanced features
   - See `LAUNCH_CHECKLIST.md` for production checklist

3. **Monitor your app:**
   - Check Railway logs regularly
   - Monitor GitHub Actions for deployment issues

4. **Scale up (when ready):**
   - Railway free tier includes $5/month credit
   - Sufficient for 1000s of users
   - Pay-as-you-go when you outgrow it

---

## 💡 Remember

- **GitHub Pages**: Completely free, no configuration needed
- **Railway**: Free tier actually costs $0 (includes $5 monthly credit)
- **Deployment**: Automatic on every `git push`
- **Uptime**: 99.9%+ guaranteed
- **Support**: Both platforms have excellent documentation

---

## ✨ You've successfully deployed a production app!

**Frontend Architecture:**
- ✅ Optimized Vite bundle
- ✅ GitHub Pages CDN
- ✅ Automatic HTTPS
- ✅ Fast load times

**Backend Architecture:**
- ✅ Node.js Express server
- ✅ REST API endpoints
- ✅ Auto-scaling on Railway
- ✅ Data persistence

**DevOps:**
- ✅ GitHub Actions CI/CD
- ✅ Automatic deployment
- ✅ Environment management
- ✅ Zero manual deployment

---

**Questions?** See [GITHUB_PAGES_FREE_SETUP.md](GITHUB_PAGES_FREE_SETUP.md) for detailed guide.

**Ready to ship!** 🚀
