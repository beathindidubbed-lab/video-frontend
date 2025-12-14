# Video Frontend - Modern Video Streaming Interface

A beautiful, modern video player frontend for Telegram file download links with advanced features and stunning UI.

## ✨ Features

### 🎨 Modern Design
- **Gradient backgrounds** with animated effects
- **Glass morphism** UI elements with backdrop blur
- **Smooth animations** and transitions
- **Responsive design** for all devices (mobile, tablet, desktop)
- **Dark theme** optimized for video watching

### 🎬 Advanced Video Player
- **Multiple format support**: MP4, WebM, HLS (.m3u8), and more
- **Adaptive quality**: Automatic quality switching based on connection
- **Seeking support**: Full range request support for video seeking
- **Playback controls**: Speed control (0.5x to 2x), volume, fullscreen
- **Picture-in-Picture**: Watch while browsing
- **Keyboard shortcuts**: Space to play/pause, arrows to seek, etc.

### 🚀 Performance
- **HLS.js integration**: Efficient streaming for live content
- **Plyr player**: Beautiful, accessible player interface
- **Lazy loading**: Resources loaded only when needed
- **Optimized assets**: Minified and cached static files
- **Error handling**: Graceful error messages with recovery options

### 🔒 Security
- **HTTPS ready**: Secure connections supported
- **Security headers**: X-Frame-Options, CSP, etc.
- **Input validation**: Safe handling of URL parameters

## 📁 Project Structure

```
video-frontend/
├── public/
│   ├── index.html      # Main HTML with improved UI
│   └── script.js       # Enhanced JavaScript logic
├── server.js           # Express server with better routing
├── package.json        # Dependencies and scripts
└── README.md          # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 14.x or higher
- npm or yarn

### Installation

1. **Clone or download the repository**

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set environment variables:**
   ```bash
   export BOT_API_URL=https://your-bot-url.com
   export PORT=3000
   ```

4. **Start the server:**
   ```bash
   npm start
   ```

   For development with auto-reload:
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   ```
   http://localhost:3000
   ```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `BOT_API_URL` | Your bot's API URL | Required |
| `NODE_ENV` | Environment (development/production) | `development` |

### Example `.env` file:
```env
PORT=3000
BOT_API_URL=https://your-bot-url.com
NODE_ENV=production
```

## 📖 Usage

### URL Parameters

The player supports multiple URL parameter formats:

1. **File parameter:**
   ```
   https://yoursite.com/?file=ENCODED_FILE_ID
   ```

2. **ID parameter:**
   ```
   https://yoursite.com/?id=ENCODED_FILE_ID
   ```

3. **Stream parameter (full URL):**
   ```
   https://yoursite.com/?stream=https://bot-url.com/stream/ENCODED_ID
   ```

4. **Watch format (YouTube-like):**
   ```
   https://yoursite.com/watch?v=ENCODED_FILE_ID
   ```

### Alternative Routes

- `/download?file=ID` - Redirects to main player
- `/stream/ID` - Direct stream access
- `/watch?v=ID` - YouTube-style URL

## 🎨 Customization

### Colors

Edit the CSS variables in `index.html`:

```css
:root {
    --primary-color: #667eea;      /* Main brand color */
    --secondary-color: #764ba2;    /* Secondary brand color */
    --dark-bg: #0a0e27;           /* Background color */
    --success-color: #10b981;     /* Success messages */
    --error-color: #ef4444;       /* Error messages */
}
```

### Player Settings

Modify player configuration in `script.js`:

```javascript
const playerConfig = {
    controls: [...],     // Customize visible controls
    speed: {            // Playback speed options
        selected: 1,
        options: [0.5, 0.75, 1, 1.25, 1.5, 2]
    },
    // ... more options
};
```

## 🎭 Supported Video Formats

### Standard Formats
- MP4 (H.264, H.265)
- WebM (VP8, VP9)
- OGG (Theora)

### Streaming Formats
- HLS (HTTP Live Streaming) - .m3u8
- DASH (Dynamic Adaptive Streaming) - .mpd
- Smooth Streaming

## 🐛 Troubleshooting

### Video won't play
1. Check if the video URL is valid
2. Verify BOT_API_URL is correctly set
3. Check browser console for errors
4. Try a different browser

### HLS streams not working
- Ensure HLS.js is loaded (check browser console)
- Verify the .m3u8 URL is accessible
- Check CORS settings on your bot server

### Poor playback quality
- Check your internet connection
- Try lowering the quality manually in player settings
- Verify the video source is working properly

## 📱 Browser Support

| Browser | Desktop | Mobile |
|---------|---------|--------|
| Chrome | ✅ | ✅ |
| Firefox | ✅ | ✅ |
| Safari | ✅ | ✅ |
| Edge | ✅ | ✅ |
| Opera | ✅ | ✅ |

## 🚀 Deployment

### Render

1. Create new Web Service
2. Connect your repository
3. Set environment variables
4. Deploy!

### Vercel

```bash
vercel --prod
```

### Docker

```bash
docker build -t video-frontend .
docker run -p 3000:3000 -e BOT_API_URL=https://your-bot.com video-frontend
```

## 📊 Performance Tips

1. **Enable caching**: Static files are cached for 1 day by default
2. **Use CDN**: Host static assets on CDN for faster loading
3. **Compress assets**: Enable gzip compression in production
4. **Monitor bandwidth**: Check video file sizes and quality settings

## 🔐 Security Best Practices

1. Always use HTTPS in production
2. Set secure headers (already configured)
3. Validate all URL parameters
4. Keep dependencies updated
5. Use environment variables for sensitive data

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🙏 Acknowledgments

- **Plyr** - Beautiful video player
- **HLS.js** - HLS streaming support
- **Express** - Web server framework
- **Font Awesome** - Icons

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Check the documentation
- Contact the bot administrator

---

Made with ❤️ for seamless video streaming
