# 🚀 Deployment Guide

Complete deployment instructions for various platforms.

## 📋 Pre-Deployment Checklist

- [ ] Update `BOT_API_URL` in server.js or .env
- [ ] Test locally with `npm start`
- [ ] Verify all features work correctly
- [ ] Check browser console for errors
- [ ] Test on mobile devices
- [ ] Verify HLS streaming works
- [ ] Test download and share buttons

## 🌐 Platform Deployment

### 1. Heroku

#### Step 1: Install Heroku CLI
```bash
# Install Heroku CLI
brew install heroku/brew/heroku  # macOS
# or download from https://devcenter.heroku.com/articles/heroku-cli
```

#### Step 2: Login and Create App
```bash
heroku login
heroku create your-video-player
```

#### Step 3: Set Environment Variables
```bash
heroku config:set NODE_ENV=production
heroku config:set BOT_API_URL=https://your-bot-api-url.com
```

#### Step 4: Deploy
```bash
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

#### Step 5: Open App
```bash
heroku open
```

#### Heroku Procfile
Create `Procfile` in root:
```
web: node server.js
```

---

### 2. Railway

#### Step 1: Install Railway CLI
```bash
npm install -g @railway/cli
```

#### Step 2: Login and Initialize
```bash
railway login
railway init
```

#### Step 3: Set Environment Variables
```bash
railway variables set NODE_ENV=production
railway variables set BOT_API_URL=https://your-bot-api-url.com
```

#### Step 4: Deploy
```bash
railway up
```

#### Step 5: Get URL
```bash
railway open
```

---

### 3. Render

#### Step 1: Create Account
- Go to https://render.com
- Sign up with GitHub

#### Step 2: New Web Service
- Click "New +" → "Web Service"
- Connect GitHub repository
- Or deploy from dashboard

#### Step 3: Configure
```
Name: video-player
Environment: Node
Build Command: npm install
Start Command: npm start
```

#### Step 4: Environment Variables
```
NODE_ENV=production
BOT_API_URL=https://your-bot-api-url.com
```

#### Step 5: Deploy
- Click "Create Web Service"
- Wait for deployment to complete

---

### 4. Vercel

#### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

#### Step 2: Login
```bash
vercel login
```

#### Step 3: Create vercel.json
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    },
    {
      "src": "public/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/public/(.*)",
      "dest": "/public/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/server.js"
    }
  ]
}
```

#### Step 4: Deploy
```bash
vercel
```

#### Step 5: Set Environment Variables
```bash
vercel env add NODE_ENV
vercel env add BOT_API_URL
```

---

### 5. DigitalOcean App Platform

#### Step 1: Create Account
- Go to https://www.digitalocean.com
- Create account and verify

#### Step 2: Create App
- Click "Apps" → "Create App"
- Connect GitHub repository
- Select branch

#### Step 3: Configure
```
Name: video-player
HTTP Port: 3000
Environment Variables:
  - NODE_ENV=production
  - BOT_API_URL=https://your-bot-api-url.com
```

#### Step 4: Build Settings
```
Build Command: npm install
Run Command: npm start
```

#### Step 5: Deploy
- Click "Next" → "Create Resources"
- Wait for deployment

---

### 6. AWS (EC2)

#### Step 1: Launch EC2 Instance
- Choose Ubuntu Server 20.04 LTS
- Instance type: t2.micro (free tier)
- Configure security group (ports 22, 80, 443, 3000)

#### Step 2: Connect to Instance
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

#### Step 3: Install Dependencies
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2
```

#### Step 4: Clone and Setup
```bash
# Clone repository
git clone https://github.com/your-username/video-player.git
cd video-player

# Install dependencies
npm install

# Create .env file
nano .env
# Add your environment variables
```

#### Step 5: Start with PM2
```bash
# Start application
pm2 start server.js --name video-player

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

#### Step 6: Configure Nginx (Optional)
```bash
sudo apt install nginx -y
sudo nano /etc/nginx/sites-available/video-player
```

Add configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable and restart:
```bash
sudo ln -s /etc/nginx/sites-available/video-player /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

### 7. Google Cloud Platform (App Engine)

#### Step 1: Install gcloud CLI
```bash
# Follow instructions at:
# https://cloud.google.com/sdk/docs/install
```

#### Step 2: Initialize and Login
```bash
gcloud init
gcloud auth login
```

#### Step 3: Create app.yaml
```yaml
runtime: nodejs18
env: standard

instance_class: F1

env_variables:
  NODE_ENV: 'production'
  BOT_API_URL: 'https://your-bot-api-url.com'

handlers:
- url: /.*
  secure: always
  script: auto
```

#### Step 4: Deploy
```bash
gcloud app deploy
```

#### Step 5: Open App
```bash
gcloud app browse
```

---

## 🔒 Environment Variables

### Required Variables
```bash
PORT=3000                    # Server port
NODE_ENV=production          # Environment mode
BOT_API_URL=https://...      # Your bot API URL
```

### Optional Variables
```bash
# Add any custom variables here
```

---

## 🔧 Post-Deployment

### 1. Test Deployment
```bash
# Visit your deployed URL
https://your-app.domain.com

# Test with video URL
https://your-app.domain.com/?file=test-video-id
```

### 2. Monitor Logs

**Heroku:**
```bash
heroku logs --tail
```

**Railway:**
```bash
railway logs
```

**PM2 (EC2):**
```bash
pm2 logs video-player
```

### 3. Setup Custom Domain

**Heroku:**
```bash
heroku domains:add yourdomain.com
```

**Railway:**
- Go to Settings → Domains
- Add custom domain

**Render:**
- Go to Settings → Custom Domains
- Add domain

### 4. Enable HTTPS
- Most platforms provide free SSL
- For EC2, use Let's Encrypt:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

---

## 📊 Monitoring & Maintenance

### Health Checks
- All platforms: `/health` endpoint
- Returns JSON with status

### Update Application
```bash
# Pull latest changes
git pull origin main

# Install dependencies
npm install

# Restart application
# (varies by platform)
```

### Backup
- Regular database backups (if applicable)
- Environment variables backup
- Configuration files backup

---

## 🐛 Troubleshooting

### Common Issues

**1. Port Already in Use**
```bash
# Find and kill process
lsof -ti:3000 | xargs kill -9
```

**2. Module Not Found**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**3. Environment Variables Not Working**
- Check variable names (case-sensitive)
- Restart application after setting
- Verify in platform dashboard

**4. Video Not Playing**
- Check BOT_API_URL is correct
- Verify CORS headers
- Check browser console

**5. HLS Streaming Issues**
- Verify HLS.js is loaded
- Check video URL format
- Test with different browsers

---

## 📞 Support

For deployment issues:
1. Check platform-specific documentation
2. Review application logs
3. Test locally first
4. Check environment variables
5. Verify network connectivity

---

## 🎯 Production Best Practices

- [ ] Use environment variables for sensitive data
- [ ] Enable HTTPS/SSL
- [ ] Setup custom domain
- [ ] Configure error tracking
- [ ] Enable logging
- [ ] Setup monitoring alerts
- [ ] Regular backups
- [ ] Load testing
- [ ] Security headers enabled
- [ ] CDN for static assets (optional)

---

**Happy Deploying! 🚀**
