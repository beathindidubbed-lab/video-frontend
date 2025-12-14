# Deployment Guide - Railway Backend + Frontend

Complete step-by-step guide for deploying your video streaming service with both frontend and backend on Railway.

## 🏗️ Architecture Overview

**Option 1: Both on Railway (Recommended)**
```
┌─────────────────────────────────────────┐
│           Railway (Free Tier)           │
│                                         │
│  ┌──────────────┐   ┌──────────────┐  │
│  │   Frontend   │──▶│   Backend    │  │
│  │ Video Player │   │ Bot + Stream │  │
│  └──────────────┘   └──────────────┘  │
└─────────────────────────────────────────┘
         │                     │
         ▼                     ▼
     End Users            Telegram API
```

**Option 2: Split Hosting**
```
┌─────────────────┐         ┌─────────────────┐
│  Render (Free)  │         │ Railway (Free)  │
│                 │         │                 │
│  Video Player   │────────▶│   Bot Backend   │
│  Frontend       │         │   + Streaming   │
└─────────────────┘         └─────────────────┘
        │                           │
        │                           │
        ▼                           ▼
    End Users                  Telegram API
```

## Why Railway for Both?

✅ **Simpler setup** - One platform to manage
✅ **Better integration** - Services can communicate internally
✅ **Easier environment variables** - Shared across services
✅ **Cost efficient** - Share the $5 free credit
✅ **Your frontend is fully compatible** - Node.js/Express works perfectly

## 📦 Part 1: Deploy Backend to Railway

### Step 1: Prepare Your Backend

1. **Ensure your backend repository has:**
   - `Dockerfile` (already present in your repo)
   - `requirements.txt` (already present)
   - All StreamBot files

2. **Verify these environment variables are set in your code:**
   - `API_ID`
   - `API_HASH`
   - `BOT_TOKEN`
   - `LOG_CHANNEL`
   - `BASE_URL` (will be your Railway URL)
   - `DATABASE_URL`
   - And all other required variables

### Step 2: Deploy to Railway

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign in with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your backend repository

3. **Configure Build Settings**
   - Railway will auto-detect the Dockerfile
   - Build command: (Auto-detected from Dockerfile)
   - Start command: `python -m StreamBot`

4. **Add Environment Variables**
   
   Click on your service → Variables → Add all these:
   
   ```env
   # Telegram Core (REQUIRED)
   API_ID=your_api_id
   API_HASH=your_api_hash
   BOT_TOKEN=your_bot_token
   
   # Channels (REQUIRED)
   LOG_CHANNEL=-100xxxxxxxxxx
   FORCE_SUB_CHANNEL=-100yyyyyyyyyy
   
   # Web Server (REQUIRED)
   BASE_URL=https://your-railway-app.up.railway.app
   PORT=8080
   BIND_ADDRESS=0.0.0.0
   
   # Video Frontend (Set after deploying frontend)
   VIDEO_FRONTEND_URL=https://your-render-app.onrender.com
   
   # Settings
   LINK_EXPIRY_SECONDS=86400
   SESSION_NAME=TgDlBot
   WORKERS=4
   
   # Admin Users (REQUIRED)
   ADMINS=123456789 987654321
   
   # Rate Limiting
   MAX_LINKS_PER_DAY=5
   
   # Bandwidth Limiting
   BANDWIDTH_LIMIT_GB=100
   
   # Session Generator
   ALLOW_USER_LOGIN=true
   
   # Database (REQUIRED)
   DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/dbname
   DATABASE_NAME=TgDlBotUsers
   
   # URL Shortener (Optional)
   ADLINKFLY_URL=https://api.gplinks.com/api?api=your_api_key
   FILE_SIZE_THRESHOLD=200
   
   # Multiple Bots (Optional)
   ADDITIONAL_BOT_TOKENS=
   WORKER_CLIENT_PYROGRAM_WORKERS=1
   WORKER_SESSIONS_IN_MEMORY=true
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait 2-5 minutes for build and deployment
   - Once deployed, copy your Railway URL (e.g., `https://your-app.up.railway.app`)

6. **Configure Domain with BotFather (Important for Session Generator)**
   - Open Telegram and message @BotFather
   - Select your bot
   - Go to Bot Settings → Domain
   - Enter your Railway domain WITHOUT https:// (e.g., `your-app.up.railway.app`)

7. **Test Backend**
   - Visit: `https://your-railway-app.up.railway.app/health`
   - You should see: `{"status": "ok", "bot_status": "connected", ...}`

## 📦 Part 2A: Deploy Frontend to Railway (Recommended)

### Step 1: Prepare Frontend Repository

Your frontend is fully compatible with Railway. Ensure you have:

1. **Files in your repository:**
   ```
   video-frontend/
   ├── public/
   │   ├── index.html
   │   └── script.js
   ├── server.js
   ├── package.json
   └── README.md
   ```

2. **package.json should have:**
   ```json
   {
     "scripts": {
       "start": "node server.js",
       "dev": "nodemon server.js"
     },
     "dependencies": {
       "express": "^4.18.2"
     }
   }
   ```

### Step 2: Deploy Frontend to Railway

1. **Go to Railway Dashboard**
   - From your existing project (where backend is)
   - Click "+ New" → "GitHub Repo"
   - Select your video-frontend repository

2. **Configure Frontend Service**
   - Railway auto-detects Node.js
   - Build command: `npm install` (auto-detected)
   - Start command: `npm start` (auto-detected)

3. **Add Environment Variables**
   
   Click on frontend service → Variables:
   ```env
   NODE_ENV=production
   PORT=3000
   BOT_API_URL=${{Backend.RAILWAY_PUBLIC_DOMAIN}}
   ```
   
   **Pro Tip:** Use Railway's variable reference syntax:
   - `${{Backend.RAILWAY_PUBLIC_DOMAIN}}` auto-references your backend URL
   - No need to manually copy URLs!

4. **Generate Public Domain**
   - Click on frontend service
   - Settings → Networking
   - Click "Generate Domain"
   - Copy the URL (e.g., `https://frontend-production-xxxx.up.railway.app`)

5. **Update Backend Environment Variable**
   - Go to your backend service
   - Variables → Add:
   ```env
   VIDEO_FRONTEND_URL=${{Frontend.RAILWAY_PUBLIC_DOMAIN}}
   ```

### Step 3: Test Frontend

Visit: `https://your-frontend.up.railway.app/health`

You should see:
```json
{
  "status": "ok",
  "botUrl": "https://your-backend.up.railway.app",
  "timestamp": "..."
}
```

### Benefits of Railway for Frontend:

✅ **Internal networking** - Services communicate faster within Railway
✅ **Variable references** - Use `${{ServiceName.RAILWAY_PUBLIC_DOMAIN}}`
✅ **Single dashboard** - Manage everything in one place
✅ **Shared resources** - Better use of free tier credits
✅ **No cold starts** - Unlike Render, Railway keeps services warm
✅ **Better logs** - Unified logging across all services

## 📦 Part 2B: Deploy Frontend to Render (Alternative)

### Step 1: Prepare Frontend for Production

1. **Update server.js**
   
   Make sure the `BOT_API_URL` will use environment variable:
   ```javascript
   const BOT_API_URL = process.env.BOT_API_URL || 'https://your-railway-app.up.railway.app';
   ```

2. **Create public directory structure:**
   ```
   video-frontend/
   ├── public/
   │   ├── index.html
   │   └── script.js
   ├── server.js
   ├── package.json
   └── README.md
   ```

3. **Update script.js to use dynamic BOT_API_URL:**
   
   At the top of `script.js`:
   ```javascript
   // Auto-detect BOT API URL from current domain
   const BOT_API_URL = window.location.hostname === 'localhost' 
       ? 'http://localhost:8080'
       : 'https://your-railway-app.up.railway.app'; // Replace with your Railway URL
   ```

### Step 2: Deploy to Render

1. **Create Render Account**
   - Go to [render.com](https://render.com)
   - Sign in with GitHub

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository (video-frontend)
   - Click "Connect"

3. **Configure Service**
   ```
   Name: video-frontend
   Region: Choose closest to your users
   Branch: main (or master)
   Root Directory: (leave blank if repo root is project root)
   Environment: Node
   Build Command: npm install
   Start Command: npm start
   ```

4. **Select Plan**
   - Choose "Free" plan
   - Note: Free plan may spin down after inactivity

5. **Add Environment Variables**
   
   Click "Advanced" → "Add Environment Variable":
   ```
   BOT_API_URL = https://your-railway-app.up.railway.app
   NODE_ENV = production
   ```

6. **Deploy**
   - Click "Create Web Service"
   - Wait 2-3 minutes for deployment
   - Copy your Render URL (e.g., `https://video-frontend.onrender.com`)

7. **Test Frontend**
   - Visit: `https://your-render-app.onrender.com/health`
   - Should see: `{"status": "ok", "botUrl": "...", ...}`

## 🔗 Part 3: Connect Frontend and Backend

### If Both Services on Railway (Recommended)

**You're already connected!** 

If you used the variable reference syntax (`${{Backend.RAILWAY_PUBLIC_DOMAIN}}`), your services are automatically linked. Railway updates these references automatically.

**Test the connection:**
```bash
# Frontend health (should show backend URL)
curl https://your-frontend.up.railway.app/health

# Backend health
curl https://your-backend.up.railway.app/health
```

### If Frontend on Render + Backend on Railway

### Update Backend Environment Variable

1. **Go to Railway Dashboard**
   - Open your backend project
   - Click on Variables
   - Update `VIDEO_FRONTEND_URL`:
   ```
   VIDEO_FRONTEND_URL=https://your-render-app.onrender.com
   ```

2. **Redeploy Backend**
   - Railway will auto-redeploy with new variable
   - Wait for deployment to complete

### Update Frontend with Actual Backend URL

1. **Go to Render Dashboard**
   - Open your frontend service
   - Click "Environment"
   - Ensure `BOT_API_URL` is set to your Railway URL
   - If not, add it and redeploy

2. **Or Update in Code (Recommended)**
   
   Edit `public/script.js`:
   ```javascript
   const BOT_API_URL = window.location.hostname === 'localhost' 
       ? 'http://localhost:8080'
       : 'https://your-actual-railway-url.up.railway.app';
   ```
   
   Commit and push - Render will auto-deploy

## ✅ Part 4: Verification & Testing

### Test the Complete Flow

1. **Test Backend API**
   ```bash
   curl https://your-railway-app.up.railway.app/api/info
   ```
   Should return bot information

2. **Test Health Endpoints**
   ```bash
   # Backend health
   curl https://your-railway-app.up.railway.app/health
   
   # Frontend health
   curl https://your-render-app.onrender.com/health
   ```

3. **Test Video Streaming**
   - Send a video to your Telegram bot
   - Bot should reply with a download link
   - Click the "🎬 Play Video" button
   - Should open your Render frontend
   - Video should play smoothly

4. **Test Different URL Formats**
   ```
   https://your-render-app.onrender.com/?file=ENCODED_ID
   https://your-render-app.onrender.com/watch?v=ENCODED_ID
   https://your-render-app.onrender.com/stream/ENCODED_ID
   ```

## 🔧 Troubleshooting

### Backend Issues

**Bot not connecting:**
- Check Railway logs: Dashboard → Your Service → Deployments → Logs
- Verify all environment variables are set correctly
- Check `BOT_TOKEN` is valid

**Database connection failed:**
- Verify `DATABASE_URL` is correct
- Check MongoDB Atlas whitelist (allow all IPs: `0.0.0.0/0`)

**Video streaming not working:**
- Ensure `LOG_CHANNEL` bot is admin in the channel
- Check Railway logs for errors

### Frontend Issues

**Video not loading:**
- Check browser console for errors (F12)
- Verify `BOT_API_URL` in Render environment matches Railway URL
- Check if CORS is enabled on backend

**"Failed to load" error:**
- Backend might be down - check Railway status
- Link might be expired (24 hours default)
- Check network tab in browser DevTools

**Frontend spinning down:**
- Render free tier spins down after 15 minutes of inactivity
- First request after spin down takes ~30 seconds to wake up
- Consider upgrading to paid tier for always-on service

## 🚀 Post-Deployment Setup

### 1. Configure Custom Domains (Optional)

**For Railway (Backend):**
1. Go to Railway Dashboard → Settings → Domains
2. Click "Generate Domain" or "Custom Domain"
3. Update `BASE_URL` environment variable
4. Update domain in @BotFather

**For Render (Frontend):**
1. Go to Render Dashboard → Settings → Custom Domains
2. Add your domain
3. Configure DNS records as shown
4. Update `VIDEO_FRONTEND_URL` in Railway

### 2. Enable HTTPS (Auto-enabled on both platforms)

Both Render and Railway provide free SSL certificates automatically.

### 3. Monitor Your Services

**Railway:**
- Dashboard → Metrics tab
- View CPU, Memory, Network usage
- Check deployment logs

**Render:**
- Dashboard → Metrics tab
- View requests, response times
- Monitor bandwidth usage

### 4. Set Up Notifications

**Railway:**
- Settings → Notifications
- Get alerts for deployment failures

**Render:**
- Settings → Notifications
- Email alerts for service issues

## 💰 Cost Optimization

### Free Tier Limits

**Railway Free Tier:**
- $5 of usage per month (shared across all services)
- ~500 hours of runtime total
- Both frontend and backend share this credit

**If using both on Railway:**
- Frontend uses minimal resources (~$1-2/month)
- Backend uses more resources (~$3-4/month)
- Total: Should stay within $5/month with light usage

**Render Free Tier (if using Render for frontend):**
- 750 hours/month
- Spins down after 15 min inactivity
- Limited to 512 MB RAM

## 🚀 Quick Start: Railway Only (Fastest Setup)

If you want the simplest deployment with both services on Railway:

1. **Deploy Backend:**
   ```
   Railway → New Project → Deploy from GitHub → Select backend repo
   → Add all environment variables → Deploy
   ```

2. **Deploy Frontend:**
   ```
   Same Railway Project → New Service → Deploy from GitHub → Select frontend repo
   → Add environment variables with references:
     BOT_API_URL=${{Backend.RAILWAY_PUBLIC_DOMAIN}}
   → Deploy
   ```

3. **Link Them:**
   ```
   Backend Variables → Add:
     VIDEO_FRONTEND_URL=${{Frontend.RAILWAY_PUBLIC_DOMAIN}}
   ```

4. **Done!** Both services are live and auto-linked.

Total time: ~10 minutes ⚡


### Tips to Stay Within Free Tier:

1. **Use one bot token** (avoid multiple workers if possible)
2. **Enable `WORKER_SESSIONS_IN_MEMORY=true`** (saves disk I/O)
3. **Set reasonable rate limits** (`MAX_LINKS_PER_DAY=5`)
4. **Monitor bandwidth** (set `BANDWIDTH_LIMIT_GB=100`)
5. **Clean up old sessions** regularly

## 📊 Maintenance

### Regular Tasks

**Weekly:**
- Check Railway and Render dashboards for errors
- Review bandwidth usage
- Check bot responsiveness

**Monthly:**
- Update dependencies: `npm update`
- Review and clean up old database entries
- Check SSL certificates (auto-renewed)

### Updating Your Code

**Backend (Railway):**
1. Push changes to GitHub
2. Railway auto-deploys from main branch
3. Check deployment logs for any errors

**Frontend (Render):**
1. Push changes to GitHub
2. Render auto-deploys from main branch
3. Verify at your Render URL

## 🎉 You're All Set!

Your video streaming service is now live with:
- ✅ Backend on Railway (Bot + API + Streaming)
- ✅ Frontend on Render (Video Player)
- ✅ Auto-deployments from GitHub
- ✅ Free SSL certificates
- ✅ Monitoring and logs

### Quick Links Template

Save these for easy access:

```
Backend (Railway): https://your-app.up.railway.app
Frontend (Render): https://your-render-app.onrender.com
Telegram Bot: https://t.me/your_bot_username

Railway Dashboard: https://railway.app/project/[your-project-id]
Render Dashboard: https://dashboard.render.com/web/[your-service-id]

Health Checks:
- Backend: https://your-app.up.railway.app/health
- Frontend: https://your-render-app.onrender.com/health
- Bot API: https://your-app.up.railway.app/api/info
```

## 📞 Need Help?

- Railway Docs: https://docs.railway.app
- Render Docs: https://render.com/docs
- Open an issue on GitHub
- Check the troubleshooting section above

---

**Happy Streaming! 🎬**
