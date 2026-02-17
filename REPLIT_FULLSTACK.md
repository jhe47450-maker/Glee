# Replit Full Stack Deployment Guide

> 🚀 Deploy your entire app (Frontend + Backend) on Replit for **FREE**!

## ✅ What You Get

```
Replit will host:
├── Backend: Node.js Express API (http://your-app.replit.dev/api)
├── Frontend: Static assets (http://your-app.replit.dev/)
└── Database: JSON files (in Replit storage)

Total Cost: $0/month
Uptime: 24/7 ✅
Speed: Fast ⚡
```

---

## 🎯 Step 1: Create Replit Account

1. Go to [replit.com](https://replit.com)
2. Sign up with GitHub (preferred)
3. Create account

---

## 🎯 Step 2: Import Your GitHub Repository

1. On Replit homepage, click **"+ Create"**
2. Select **"Import from GitHub"**
3. Paste: `https://github.com/jhe47450-maker/Glee`
4. Click **"Import from GitHub"**
5. Wait 30 seconds for Replit to import

---

## 🎯 Step 3: Configure Replit

### Create `.replit` file (Already added)
```
run = "npm run replit"
entrypoint = "server/index.js"
modules = ["nodejs-18"]
```

### Create `replit.nix` file (Already added)
```nix
{ pkgs }: {
    deps = [
        pkgs.nodejs-18_x
        pkgs.npm
    ];
}
```

---

## 🎯 Step 4: Update package.json Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "dev:server": "node server/index.js",
    "dev:all": "concurrently \"npm run dev\" \"npm run dev:server\"",
    "build": "vite build",
    "start": "node server/index.js",
    "replit": "npm run build && npm start"
  }
}
```

The `npm run replit` command:
1. Builds frontend →  `dist/` folder
2. Starts backend → serves on `<url>.replit.dev`

---

## 🎯 Step 5: Deploy on Replit

1. **Wait for setup** (Replit installs packages)
2. **Click green "Run" button** at top
3. **Wait 60 seconds** (first run is slower)
4. **You'll see**:
   ```
   Output:
   Server listening on port 3000
   Static files serving from: dist/
   Your app: https://Glee-YOUR-USERNAME.replit.dev
   ```

Your app is LIVE! 🎉

---

## 📱 What Happens

When someone visits `https://Glee-YOUR-USERNAME.replit.dev/`:

```
Browser requests:  https://Glee-YOUR-USERNAME.replit.dev/
         ↓
Replit server:     Serves index.html from dist/
         ↓
Frontend loads:    Your HTML, CSS, JS
         ↓
JavaScript runs:   Initializes app
         ↓
User clicks "Order":  Browser sends POST to /api/orders
         ↓
Replit Express:    Processes request
         ↓
Saves to JSON:     server/data/orders.json
         ↓
Sends response:    Order confirmation
         ↓
Modal shows:       Order saved! ✅
```

---

## 🔗 API Endpoints on Replit

All requests go to same domain:

```
GET    https://Glee-YOUR-USERNAME.replit.dev/api/orders
POST   https://Glee-YOUR-USERNAME.replit.dev/api/orders
GET    https://Glee-YOUR-USERNAME.replit.dev/api/reviews
POST   https://Glee-YOUR-USERNAME.replit.dev/api/reviews
GET    https://Glee-YOUR-USERNAME.replit.dev/health
```

---

## ⚙️ Configuration

### Automatic API Detection

The app automatically detects Replit URL:

```javascript
// In scripts/config.js
API_BASE: import.meta.env.VITE_API_BASE || 
          (window.location.hostname.includes('replit.dev') ? 
            `${window.location.origin}/api` : 
            'http://localhost:5000/api')
```

**What this means:**
- ✅ Works on Replit automatically
- ✅ Works locally (localhost:5000)
- ✅ Works anywhere!

---

## 📌 Important Notes

### Build on Deploy
- Frontend automatically builds when Replit starts
- Vite creates `dist/` folder
- Server serves files from `dist/`

### CORS / Same Origin
- Frontend and backend on same domain
- No CORS issues! ✅
- Everything just works

### Data Persistence
- JSON files stored in Replit filesystem
- Data persists between restarts
- Easy to download/backup

---

## 🚀 First Deploy Checklist

- [ ] Replit account created
- [ ] GitHub repo imported to Replit
- [ ] `.replit` file in project
- [ ] `replit.nix` file in project
- [ ] `package.json` has `replit` script
- [ ] Click "Run" button
- [ ] Wait for build + server start
- [ ] Visit your URL in browser
- [ ] Test order form
- [ ] Check console for errors
- [ ] Share your URL with friends! 🎉

---

## 🆘 Troubleshooting

### Issue: "Port already in use"
**Fix**: Replit handles ports automatically, just click Run again

### Issue: "Cannot find module"
**Fix**: 
```bash
# In Replit terminal:
npm install
npm run replit
```

### Issue: "Build failed"
**Fix**: Check error in build output
- Usually missing dependency
- Run: `npm install` and retry

### Issue: "API calls 404"
**Fix**: 
- Check server is running
- Verify `/api/` in API path
- Check console for actual error

### Issue: "Static files not found"
**Fix**:
- Make sure `npm run build` completed
- Check `dist/` folder exists
- Restart with Run button

---

## 🎯 Your URLs

Once deployed on Replit:

```
Frontend URL:     https://Glee-YOUR-USERNAME.replit.dev
API URL:          https://Glee-YOUR-USERNAME.replit.dev/api
Health Check:     https://Glee-YOUR-USERNAME.replit.dev/health
Orders JSON:      https://Glee-YOUR-USERNAME.replit.dev/api/orders (GET)
```

**Share frontend URL with friends!**

---

## 🔄 Continuous Updates

```bash
# Update your code locally
git add .
git commit -m "New feature"
git push origin main

# Replit auto-pulls from GitHub (if connected)
# OR manually restart in Replit UI

# Your changes go live! ✅
```

---

## 💾 Keep Your Data

JSON files stored on Replit:

```
server/data/
├── orders.json    ← Customer orders saved here
└── reviews.json   ← Customer reviews saved here
```

Download anytime from Replit Files panel.

---

## 🎉 Advantages of Replit

| Feature | Replit | Others |
|---------|--------|--------|
| Cost | FREE | $0-5 |
| Setup | 5 min | 15 min |
| Domain | `.replit.dev` | Custom possible |
| Scale | Unlimited | Limited free tier |
| Monitoring | Built-in | Manual |
| Sharing | 1 click | Need to host separately |

---

## 📊 Next Steps

1. **Go to replit.com**
2. **Import your GitHub repo**
3. **Wait for build**
4. **Click Run**
5. **Navigate to your URL**
6. **Test ordering**
7. **Share with friends!**

Your full stack app is now ONLINE 🚀

---

## ✨ You now have:

- ✅ Frontend online (served by Replit)
- ✅ Backend online (Node.js on Replit)
- ✅ Database (JSON files on Replit)
- ✅ Always online (24/7 uptime)
- ✅ Free hosting ($0/month)
- ✅ Your own custom domain option later

**Ready to deploy?** 🚀 Let's do it!
