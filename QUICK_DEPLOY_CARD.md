# 🚀 Quick Reference Card

## Your Deployment Decision

**Question:** "Use GitHub Page only - best: Node.js or ngrok? Free?"

**Answer:** ✅ **GitHub Pages + Railway** (Node.js)

```
Frontend:  GitHub Pages  (FREE)
Backend:   Railway       (FREE - includes $5/month credit)
Cost:      $0/month      💚
Setup:     15 minutes    ⏱️
```

---

## 🎯 Three-Step Deployment

### 1️⃣ Enable GitHub Pages (2 min)
```
Settings → Pages → Deploy from main branch → Save
Wait 2 minutes...
Frontend live at: https://USERNAME.github.io/Glee
```

### 2️⃣ Deploy on Railway (5 min)
```
railway.app → + New Project → GitHub → Select Glee → Deploy
Wait 5 minutes...
Backend live at: https://your-railway-url.railway.app/api
```

### 3️⃣ Connect Frontend to Backend (3 min)
```
Edit: .github/workflows/github-pages.yml
Add:  VITE_API_BASE: https://your-railway-url.railway.app/api
Push: git push origin main
GitHub Actions auto-deploys!
```

---

## 🔗 Important URLs

| Component | URL | Status |
|-----------|-----|--------|
| **Frontend** | `https://USERNAME.github.io/Glee` | Your app! 🎉 |
| **Backend API** | `https://your-railway-url.railway.app/api` | Orders/reviews |
| **Backend Health** | `https://your-railway-url.railway.app/health` | Check status |

---

## 📝 What Changed from Python → Node.js

| Was | Now |
|-----|-----|
| `server.py` | `server/index.js` |
| Python Flask | Node.js Express |
| Heroku deploy | Railway deploy |
| Not on GitHub Pages | Now on GitHub Pages! |

---

## ✅ Post-Deploy Checklist

- [ ] Frontend loads at GitHub Pages URL
- [ ] No 404 or CORS errors
- [ ] Create order works
- [ ] Data persists after refresh
- [ ] Backend health check works

---

## 🆘 Quick Fixes

| Problem | Fix |
|---------|-----|
| **Frontend 404** | Hard refresh: `Ctrl+Shift+R` |
| **API not working** | Check `VITE_API_BASE` URL in workflow |
| **Railway error** | Check Logs in Railway dashboard |
| **GitHub Actions failed** | Click red badge, check error |

---

## 💡 Remember

- ✅ GitHub Pages = FREE frontend hosting
- ✅ Railway = FREE backend with $5/month credit
- ✅ GitHub Actions = FREE auto-deployment
- ❌ ngrok = NOT for production
- ✅ Everything is PERMANENT and RELIABLE

---

## 📚 Need More Info?

[DEPLOY_NOW.md](DEPLOY_NOW.md) - Full step-by-step guide
[GITHUB_PAGES_FREE_SETUP.md](GITHUB_PAGES_FREE_SETUP.md) - Detailed explanation
[WHY_NOT_NGROK.md](WHY_NOT_NGROK.md) - Why we skip ngrok

---

## 🚀 You're Ready to Deploy!

Your app is production-ready. Just push to GitHub and watch it go live. ✨
