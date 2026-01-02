# 📁 Project Structure

Complete overview of the video player project structure and file organization.

## 🗂️ Directory Tree

```
video-player/
├── 📄 server.js                 # Express server & API endpoints
├── 📄 package.json              # Dependencies & scripts
├── 📄 .env.example              # Environment variables template
├── 📄 .gitignore               # Git ignore rules
│
├── 📁 public/                   # Frontend files (served statically)
│   ├── 📄 index.html           # Main HTML with player UI
│   └── 📄 script.js            # Player logic & all features
│
└── 📁 docs/                     # Documentation (you're here!)
    ├── 📄 README.md            # Main documentation
    ├── 📄 QUICKSTART.md        # Quick start guide
    ├── 📄 FEATURES.md          # Complete features list
    ├── 📄 DEPLOYMENT.md        # Deployment guide
    └── 📄 PROJECT_STRUCTURE.md # This file
```

---

## 📄 File Descriptions

### Root Files

#### `server.js`
**Purpose**: Backend Express server
**Contains**:
- Express app configuration
- Static file serving
- API routes
- Health check endpoints
- Security headers
- Error handling
- Graceful shutdown

**Key Features**:
```javascript
- Main route: /
- Download route: /download
- Stream route: /stream/:fileId
- Watch route: /watch
- Health check: /health
- API status: /api/status
```

#### `package.json`
**Purpose**: Project configuration and dependencies
**Contains**:
```json
{
  "name": "video-player-frontend",
  "version": "2.0.0",
  "dependencies": {
    "express": "^4.18.2"
  },
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

#### `.env.example`
**Purpose**: Environment variables template
**Contains**:
```env
PORT=3000
NODE_ENV=production
BOT_API_URL=https://your-bot-api-url.com
```

#### `.gitignore`
**Purpose**: Git exclusion rules
**Excludes**:
- node_modules/
- .env files
- logs
- OS files
- IDE files

---

### Public Directory

#### `public/index.html` (22,730 bytes)
**Purpose**: Main HTML page and UI
**Contains**:

**1. HTML Structure**:
```html
- <head> with meta tags
- External CSS (Plyr, Font Awesome)
- Custom CSS styles
- Responsive design
```

**2. CSS Sections**:
- Color variables (`:root`)
- Base styles
- Header/Logo
- Video container
- Loading states
- Error states
- Info panels
- Action buttons
- Double tap overlays
- Seek preview
- Animations
- Responsive media queries
- Plyr customization

**3. HTML Sections**:
- Header with logo
- Loading indicator
- Video container
  - Video element
  - Tap overlays (left/right)
  - Seek preview
  - Action buttons
  - Info panel
- Footer

**4. External Libraries**:
```html
- Plyr CSS (3.7.8)
- Font Awesome (6.4.0)
- Plyr JS (3.7.8)
- HLS.js (1.4.12)
```

#### `public/script.js` (25,399 bytes)
**Purpose**: All player logic and features
**Contains**:

**1. Configuration**:
```javascript
- BOT_API_URL
- Global variables
- Player instance
- Video element reference
```

**2. URL Handling**:
```javascript
getVideoUrl()           // Parse URL parameters
detectStreamingFormat() // Detect HLS/DASH/standard
```

**3. UI Functions**:
```javascript
showError()      // Display error state
showEmptyState() // Display empty state
hideLoading()    // Hide loading indicator
showVideo()      // Show video container
formatTime()     // Format seconds to H:MM:SS
```

**4. Detection Functions**:
```javascript
detectInAppBrowser()    // Detect Telegram/Instagram/etc
```

**5. Storage Functions**:
```javascript
savePosition()          // Save to localStorage
loadPosition()          // Load from localStorage
```

**6. Buffer Monitoring**:
```javascript
updateBufferProgress()  // Update buffer status
setupBufferMonitoring() // Start monitoring (500ms)
```

**7. Position Saving**:
```javascript
setupPositionSaving()   // Auto-save (5000ms)
```

**8. Keyboard Shortcuts**:
```javascript
setupKeyboardShortcuts() // Handle all shortcuts
// Space, Arrows, F, M
```

**9. Double Tap Controls**:
```javascript
setupDoubleTapControls() // Touch & click events
handleDoubleTap()        // Process double taps
// Left: rewind, Right: forward
```

**10. Seek Preview**:
```javascript
setupSeekPreview()    // Canvas thumbnail
updatePreview()       // Update position
hidePreview()         // Hide on mouse leave
// Mouse & touch events
```

**11. Action Buttons**:
```javascript
setupDownloadButton() // Download functionality
setupShareButton()    // Share/clipboard
```

**12. Player Initialization**:
```javascript
initPlayer()          // Main initialization
setupPlayerFeatures() // Setup all features
```

**13. Event Handlers**:
```javascript
setupPlayerEvents()   // Plyr events
// ready, play, pause, ended, timeupdate
```

**14. Lifecycle**:
```javascript
DOMContentLoaded      // Initialize on load
beforeunload          // Cleanup on exit
visibilitychange      // Handle tab visibility
```

---

## 📚 Documentation Files

### `README.md` (7,044 bytes)
**Purpose**: Main project documentation
**Sections**:
1. Features overview
2. Quick start
3. Installation
4. Usage
5. Keyboard shortcuts
6. Mobile gestures
7. Technical details
8. Browser support
9. Customization
10. Security
11. API endpoints
12. Troubleshooting
13. Deployment
14. License

### `QUICKSTART.md` (5,500 bytes)
**Purpose**: Get started in 5 minutes
**Sections**:
1. Super quick start
2. Step-by-step guide
3. Testing features
4. Troubleshooting
5. Mobile testing
6. Customization tips
7. Next steps

### `FEATURES.md` (7,626 bytes)
**Purpose**: Complete feature checklist
**Sections**:
1. All 19 feature categories
2. 200+ sub-features
3. Implementation details
4. Performance metrics
5. Compatibility matrix
6. Customization options

### `DEPLOYMENT.md` (7,964 bytes)
**Purpose**: Deploy to production
**Platforms**:
1. Heroku
2. Railway
3. Render
4. Vercel
5. DigitalOcean
6. AWS EC2
7. Google Cloud

**Also Includes**:
- Environment variables
- Post-deployment checklist
- Monitoring setup
- Troubleshooting
- Best practices

### `PROJECT_STRUCTURE.md`
**Purpose**: This file!
**Sections**:
- Directory tree
- File descriptions
- Code organization
- Data flow
- Dependencies

---

## 🔄 Data Flow

### 1. Request Flow
```
User Browser
    ↓
Express Server (server.js)
    ↓
Static Files (public/)
    ↓
index.html + script.js loaded
    ↓
Video Player Initialized
```

### 2. Video Playback Flow
```
URL Parameter
    ↓
getVideoUrl() in script.js
    ↓
detectStreamingFormat()
    ↓
HLS.js OR Native playback
    ↓
Plyr Player Initialized
    ↓
All features activated
```

### 3. Feature Activation
```
Player Ready Event
    ↓
setupPlayerFeatures()
    ↓
├─ setupKeyboardShortcuts()
├─ setupDoubleTapControls()
├─ setupSeekPreview()
├─ setupBufferMonitoring()
├─ setupPositionSaving()
├─ setupDownloadButton()
└─ setupShareButton()
```

---

## 📦 Dependencies

### Runtime Dependencies
```json
{
  "express": "^4.18.2"  // Web server
}
```

### Frontend Dependencies (CDN)
```javascript
// CSS
- Plyr CSS 3.7.8
- Font Awesome 6.4.0

// JavaScript
- Plyr JS 3.7.8
- HLS.js 1.4.12
```

### Development Dependencies
```json
{
  "nodemon": "^3.0.1"  // Auto-restart (optional)
}
```

---

## 🎯 Code Organization

### HTML Organization
```
index.html
├── <head>
│   ├── Meta tags
│   ├── External CSS
│   └── Inline CSS (styles)
│
└── <body>
    ├── Header section
    ├── Loading section
    ├── Video section
    │   ├── Video element
    │   ├── Overlays
    │   ├── Preview
    │   ├── Buttons
    │   └── Info panel
    ├── Footer section
    └── External JS
```

### JavaScript Organization
```
script.js
├── Configuration
├── Helper Functions
│   ├── URL parsing
│   ├── Format functions
│   ├── Detection functions
│   └── Storage functions
│
├── UI Functions
│   ├── Error handling
│   ├── State management
│   └── Display functions
│
├── Feature Setup
│   ├── Keyboard
│   ├── Double tap
│   ├── Seek preview
│   ├── Buffer monitoring
│   ├── Position saving
│   └── Action buttons
│
├── Player Core
│   ├── Initialization
│   ├── Event handlers
│   └── Playback control
│
└── Lifecycle Handlers
    ├── Page load
    ├── Page unload
    └── Visibility change
```

---

## 🔐 Security Considerations

### Server Level (server.js)
```javascript
✅ X-Content-Type-Options: nosniff
✅ X-Frame-Options: DENY
✅ X-XSS-Protection: 1; mode=block
✅ Input validation
✅ Error handling
```

### Client Level (script.js)
```javascript
✅ Context menu prevention
✅ User-select disabled
✅ Tap highlight disabled
✅ Safe localStorage usage
✅ Error boundaries
```

---

## 📊 File Sizes

```
Total Project Size: ~70 KB (without node_modules)

Breakdown:
- server.js:        3.2 KB
- package.json:     0.6 KB
- index.html:       22.7 KB
- script.js:        25.4 KB
- README.md:        7.0 KB
- FEATURES.md:      7.6 KB
- DEPLOYMENT.md:    8.0 KB
- QUICKSTART.md:    5.5 KB
- Other files:      ~2 KB
```

---

## 🚀 Performance Notes

### Optimization Strategies
1. **CDN Usage**: External libraries from CDN
2. **Static Serving**: Express serves with caching
3. **Efficient Intervals**: Proper cleanup
4. **Memory Management**: Event listener cleanup
5. **Lazy Loading**: Features load on demand

### Monitoring Intervals
```javascript
Buffer Update:    500ms   (2 Hz)
Position Save:    5000ms  (0.2 Hz)
```

---

## 🔧 Maintenance

### Regular Tasks
- [ ] Update dependencies
- [ ] Test on new browsers
- [ ] Check CDN availability
- [ ] Review error logs
- [ ] Test mobile devices
- [ ] Update documentation

### Update Commands
```bash
# Check for updates
npm outdated

# Update dependencies
npm update

# Update specific package
npm install express@latest
```

---

## 📞 Support Locations

**For Server Issues**: Check `server.js` logs
**For Player Issues**: Check browser console
**For UI Issues**: Inspect `index.html` CSS
**For Feature Issues**: Debug `script.js` functions
**For Deployment**: Follow `DEPLOYMENT.md`

---

**Project Version**: 2.0.0
**Last Updated**: December 2024
**Status**: Production Ready ✅
