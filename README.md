# 🎬 Advanced Video Player

A feature-rich, modern video streaming player with HLS support, advanced controls, and a beautiful UI.

## ✨ Features

### 🎮 Core Playback
- ✅ **HLS Streaming Support** - Adaptive bitrate streaming with hls.js
- ✅ **Standard Video Formats** - MP4, WebM, and more
- ✅ **Plyr Controls** - Professional video player interface
- ✅ **Auto-Quality Selection** - Automatically selects best quality for your connection

### ⌨️ Controls & Interactions
- ✅ **Keyboard Shortcuts**
  - `Space` - Play/Pause
  - `←/→` - Skip backward/forward 10 seconds
  - `↑/↓` - Volume up/down
  - `F` - Toggle fullscreen
  - `M` - Toggle mute

- ✅ **Double Tap Controls** (Mobile & Desktop)
  - Double tap left side - Rewind 10 seconds
  - Double tap right side - Forward 10 seconds
  - Visual feedback animations

- ✅ **Seek Bar Preview**
  - Live video thumbnail at hover position
  - Exact timestamp display
  - Smooth animations
  - Mobile touch support

### 📊 Advanced Features
- ✅ **Buffer Progress Indicator** - Real-time buffer status (updates every 500ms)
- ✅ **Position Saving** - Automatically saves and resumes playback position
- ✅ **Watch Time Tracker** - Displays current watch time
- ✅ **Download Button** - Direct download link for videos
- ✅ **Share Button** - Share video with native share API or clipboard
- ✅ **Auto-Hide Controls** - Controls hide automatically during playback
- ✅ **Auto-Pause on Tab Hidden** - Pauses video when tab is not visible

### 🌐 Browser & Device Support
- ✅ **In-App Browser Detection** - Detects Telegram, Instagram, Facebook, etc.
- ✅ **Responsive Design** - Works on desktop, tablet, and mobile
- ✅ **Touch Optimized** - Full touch gesture support
- ✅ **PWA Ready** - Can be installed as a web app

### 🎨 UI/UX
- ✅ **Modern Gradient Design** - Beautiful purple/blue gradient theme
- ✅ **Animated Loading States** - Smooth loading animations
- ✅ **Error Handling** - User-friendly error messages
- ✅ **Empty State** - Helpful information when no video is loaded
- ✅ **Glass Morphism** - Modern backdrop blur effects

### 🔕 Silent Operation
- ✅ **No Notifications** - Silent buffer updates and player status
- ✅ **Clean Experience** - No popups or interruptions
- ✅ **Status Panel** - All info displayed in organized panel

## 🚀 Quick Start

### Installation

```bash
# Install dependencies
npm install

# Start the server
npm start

# For development (with auto-restart)
npm run dev
```

### Environment Variables

Create a `.env` file (optional):

```env
PORT=3000
BOT_API_URL=https://your-bot-api-url.com
NODE_ENV=production
```

## 📁 Project Structure

```
video-player/
├── public/
│   ├── index.html       # Main HTML file with player UI
│   └── script.js        # Player logic and features
├── server.js            # Express server
├── package.json         # Dependencies
└── README.md           # This file
```

## 🎯 Usage

### URL Parameters

The player supports multiple URL parameter formats:

```
# Standard format
/?file=YOUR_FILE_ID

# Alternative formats
/?id=YOUR_FILE_ID
/?v=YOUR_FILE_ID
/?url=https://direct-video-url.com/video.mp4
/?stream=/stream/FILE_ID

# Full URL
/?file=https://your-server.com/stream/FILE_ID
```

### Example URLs

```
http://localhost:3000/?file=abc123
http://localhost:3000/?v=video-id
http://localhost:3000/?url=https://example.com/video.mp4
```

## 🎮 Keyboard Shortcuts Reference

| Key | Action |
|-----|--------|
| `Space` | Play/Pause |
| `←` | Rewind 10 seconds |
| `→` | Forward 10 seconds |
| `↑` | Volume up |
| `↓` | Volume down |
| `F` | Toggle fullscreen |
| `M` | Toggle mute |

## 📱 Mobile Gestures

- **Double tap left side** - Rewind 10 seconds
- **Double tap right side** - Forward 10 seconds
- **Touch and drag seek bar** - See preview thumbnail
- **Pinch to zoom** (in fullscreen)

## 🔧 Technical Details

### Dependencies

- **Express** - Web server
- **Plyr** - Video player library
- **HLS.js** - HLS streaming support
- **Font Awesome** - Icons

### Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

### Features Implementation

#### Seek Bar Preview
```javascript
// Captures video frame at hover position
// Shows thumbnail + timestamp
// Follows mouse/touch smoothly
// Stays within viewport bounds
```

#### Position Saving
```javascript
// Saves position every 5 seconds
// Loads on video start
// Uses localStorage
// Unique key per video URL
```

#### Buffer Monitoring
```javascript
// Updates every 500ms
// Displays percentage buffered
// No notifications/popups
// Silent operation
```

#### Double Tap Controls
```javascript
// Detects double tap on left/right zones
// Shows animated feedback
// Works on mobile and desktop
// 10-second skip increment
```

## 🎨 Customization

### Colors

Edit CSS variables in `index.html`:

```css
:root {
    --primary-color: #667eea;
    --secondary-color: #764ba2;
    --dark-bg: #0a0e27;
    --success-color: #10b981;
    --error-color: #ef4444;
}
```

### Skip Duration

Edit in `script.js`:

```javascript
// Change 10 to your preferred seconds
videoElement.currentTime += 10;  // Forward
videoElement.currentTime -= 10;  // Backward
```

## 🔒 Security Features

- XSS Protection headers
- Content-Type-Options
- Frame-Options protection
- CSRF protection ready
- Secure streaming

## 📊 API Endpoints

### Main Routes

- `GET /` - Main video player
- `GET /download?file=ID` - Download route
- `GET /stream/:fileId` - Stream route (redirects to player)
- `GET /watch?v=ID` - Watch route (YouTube-style)
- `GET /health` - Health check
- `GET /api/status` - Server status

### Health Check Response

```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "botUrl": "https://your-bot-url.com",
  "service": "Video Frontend",
  "version": "2.0.0"
}
```

## 🐛 Troubleshooting

### Video won't play
- Check if file URL is valid
- Verify browser supports video format
- Check console for error messages
- Try different browser

### HLS not working
- Ensure HLS.js is loaded
- Check if .m3u8 URL is accessible
- Verify CORS headers on video server

### Position not saving
- Check if localStorage is enabled
- Clear browser cache and try again
- Check console for errors

### Controls not responding
- Ensure JavaScript is enabled
- Check for console errors
- Try refreshing the page

## 🚀 Deployment

### Heroku

```bash
heroku create your-app-name
git push heroku main
```

### Railway

```bash
railway login
railway init
railway up
```

### Vercel/Netlify

Use serverless functions or deploy as static site with external API.

## 📝 License

MIT License - feel free to use in your projects!

## 🤝 Contributing

Contributions welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions, please open an issue on GitHub.

---

Made with ❤️ for the best video streaming experience
