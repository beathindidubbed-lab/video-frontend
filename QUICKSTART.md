# 🚀 Quick Start Guide

Get your video player up and running in 5 minutes!

## ⚡ Super Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start the server
npm start

# 3. Open your browser
# Visit: http://localhost:3000/?file=YOUR_VIDEO_ID
```

That's it! 🎉

---

## 📝 Step-by-Step Guide

### Step 1: Prerequisites

Make sure you have:
- Node.js (v14 or higher)
- npm (comes with Node.js)

Check versions:
```bash
node --version
npm --version
```

### Step 2: Install Dependencies

```bash
npm install
```

This installs:
- Express (web server)
- All required packages

### Step 3: Configure (Optional)

Create `.env` file for custom configuration:

```bash
cp .env.example .env
```

Edit `.env`:
```env
PORT=3000
BOT_API_URL=https://your-bot-api-url.com
NODE_ENV=development
```

### Step 4: Start Server

**Production mode:**
```bash
npm start
```

**Development mode (with auto-restart):**
```bash
npm run dev
```

You should see:
```
==================================================
🚀 Video Frontend Server Started
==================================================
📡 Server running on port: 3000
🔗 Bot API URL: https://...
🌍 Environment: development
⏰ Started at: 2024-12-17T10:00:00.000Z
==================================================
```

### Step 5: Test It!

Open your browser and visit:

**Homepage (no video):**
```
http://localhost:3000
```

**With a video:**
```
http://localhost:3000/?file=YOUR_VIDEO_ID
```

**Alternative formats:**
```
http://localhost:3000/?id=VIDEO_ID
http://localhost:3000/?v=VIDEO_ID
http://localhost:3000/?url=https://direct-video-url.com/video.mp4
```

---

## 🎮 Testing Features

### Test Keyboard Shortcuts
1. Open a video
2. Try these keys:
   - `Space` - Play/Pause
   - `←` - Rewind 10s
   - `→` - Forward 10s
   - `↑` - Volume up
   - `↓` - Volume down
   - `F` - Fullscreen
   - `M` - Mute

### Test Double Tap
1. Open a video on mobile or desktop
2. Double tap left side → Rewinds 10s
3. Double tap right side → Forwards 10s
4. Watch for the animated feedback!

### Test Seek Preview
1. Open a video
2. Hover over the seek bar
3. See live thumbnail + timestamp
4. Works on mobile with touch too!

### Test Buffer Progress
1. Open a video
2. Look at the info panel below
3. See "Buffer Progress" updating
4. No annoying popups! 🔕

### Test Position Saving
1. Play a video for 30 seconds
2. Close the tab
3. Reopen the same video URL
4. It resumes where you left off!

### Test Download & Share
1. Open a video
2. Click "Download Video" button
3. Click "Share Video" button
4. Try both on mobile and desktop

---

## 🔧 Troubleshooting

### Port Already in Use?
```bash
# Change port in .env
PORT=8080
```

Or kill the process:
```bash
# Find process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Video Won't Play?
1. Check your BOT_API_URL in server.js or .env
2. Verify the video ID is correct
3. Check browser console for errors
4. Try a different browser

### Can't Install Dependencies?
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### HLS Video Not Working?
1. Ensure you have internet connection (for HLS.js)
2. Check if the video URL is accessible
3. Try a different video format
4. Check browser console for errors

---

## 📱 Mobile Testing

### Test on Your Phone

**Option 1: Same Network**
1. Start server on your computer
2. Find your computer's IP address:
   ```bash
   # macOS/Linux
   ifconfig | grep "inet "
   
   # Windows
   ipconfig
   ```
3. On your phone, visit: `http://YOUR_IP:3000/?file=VIDEO_ID`

**Option 2: ngrok (Tunnel)**
```bash
# Install ngrok
npm install -g ngrok

# Start server
npm start

# In another terminal
ngrok http 3000
```

Use the ngrok URL on any device!

---

## 🎨 Customization Quick Tips

### Change Colors
Edit `public/index.html`, find:
```css
:root {
    --primary-color: #667eea;    /* Change this */
    --secondary-color: #764ba2;  /* And this */
}
```

### Change Skip Duration
Edit `public/script.js`, find:
```javascript
// Change 10 to your preferred seconds
videoElement.currentTime += 10;  // Forward
videoElement.currentTime -= 10;  // Backward
```

### Change Port
Edit `.env`:
```env
PORT=8080
```

Or edit `server.js`:
```javascript
const PORT = process.env.PORT || 8080;
```

---

## 📊 What You Get

✅ **Professional Video Player**
- Beautiful gradient UI
- HLS streaming support
- Adaptive quality
- Mobile & desktop ready

✅ **Advanced Controls**
- Keyboard shortcuts
- Double tap gestures
- Seek bar preview
- Auto-hide controls

✅ **Smart Features**
- Buffer monitoring
- Position saving
- Auto-pause on hidden
- Download & share

✅ **Silent Operation**
- No annoying popups
- No notifications
- Clean experience
- All info in panels

---

## 📚 Next Steps

1. ✅ Got it working locally?
2. 📖 Read [README.md](README.md) for full documentation
3. 🎨 Check [FEATURES.md](FEATURES.md) for complete feature list
4. 🚀 See [DEPLOYMENT.md](DEPLOYMENT.md) to deploy online
5. 🎯 Customize colors, duration, and more!

---

## 🆘 Need Help?

**Check these files:**
- `README.md` - Full documentation
- `FEATURES.md` - Complete feature list
- `DEPLOYMENT.md` - How to deploy
- Browser console - For error messages

**Common URLs:**
- Health check: `http://localhost:3000/health`
- API status: `http://localhost:3000/api/status`

---

## 🎉 Success!

If you can see the video player and play a video, you're all set!

**What's working:**
- ✅ Server running
- ✅ Video player loaded
- ✅ HLS streaming (if applicable)
- ✅ All controls working
- ✅ Keyboard shortcuts active
- ✅ Double tap enabled
- ✅ Seek preview ready
- ✅ Silent operation

**Enjoy your professional video player!** 🎬

---

Made with ❤️ for seamless video streaming
