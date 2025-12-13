const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;
const BOT_API_URL = process.env.BOT_API_URL || 'https://telegram-download-link-generator-6ds6.onrender.com';

// Serve static files
app.use(express.static('public'));

// Video player route - Main page with full player
app.get('/', (req, res) => {
  // Support multiple parameter formats
  let fileId = req.query.file || req.query.id;
  
  // Handle /stream/XXXXX format
  if (!fileId && req.query.stream) {
    fileId = req.query.stream.replace(/^\/stream\//, '');
  }
  
  if (!fileId) {
    return res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Video Player</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
          }
          .container {
            text-align: center;
            padding: 2rem;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            backdrop-filter: blur(10px);
            box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
          }
          h1 { font-size: 2.5rem; margin-bottom: 1rem; }
          p { font-size: 1.2rem; opacity: 0.9; }
          .icon { font-size: 4rem; margin-bottom: 1rem; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="icon">🎬</div>
          <h1>Video Player</h1>
          <p>Please use a valid video link from the bot</p>
        </div>
      </body>
      </html>
    `);
  }

  // Serve full video player with the file
  const videoUrl = `${BOT_API_URL}/stream/${fileId}`;
  
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Video Player</title>
        <link rel="stylesheet" href="https://cdn.plyr.io/3.7.8/plyr.css" />
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                background: #000;
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 1rem;
            }
            
            #loading-indicator {
                display: flex;
                flex-direction: column;
                align-items: center;
                color: white;
                text-align: center;
                padding: 2rem;
            }
            
            .loader {
                width: 60px;
                height: 60px;
                border: 5px solid rgba(255, 255, 255, 0.3);
                border-top-color: white;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin-bottom: 1.5rem;
            }
            
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
            
            #video-container {
                display: none;
                width: 100%;
                max-width: 1200px;
            }
            
            #video {
                width: 100%;
                border-radius: 10px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
            }
            
            .error-message {
                background: rgba(255, 59, 48, 0.1);
                border: 2px solid rgba(255, 59, 48, 0.5);
                border-radius: 20px;
                padding: 3rem;
                text-align: center;
                color: white;
                backdrop-filter: blur(10px);
                max-width: 500px;
            }
            
            .error-message h1 {
                font-size: 2rem;
                margin-bottom: 1rem;
                color: #ff3b30;
            }
            
            .icon {
                font-size: 3rem;
                margin-bottom: 1rem;
            }
        </style>
    </head>
    <body>
        <div id="loading-indicator">
            <div class="loader"></div>
            <h2>Loading Video...</h2>
            <p>Please wait while we prepare your video</p>
        </div>
        
        <div id="video-container">
            <video id="video" controls playsinline></video>
        </div>
        
        <script src="https://cdn.plyr.io/3.7.8/plyr.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/hls.js@1.4.12/dist/hls.min.js"></script>
        
        <script>
            const videoUrl = '${videoUrl}';
            
            function showError(message) {
                document.body.innerHTML = \`
                    <div class="error-message">
                        <div class="icon">⚠️</div>
                        <h1>Error</h1>
                        <p>\${message}</p>
                    </div>
                \`;
            }
            
            function hideLoading() {
                document.getElementById('loading-indicator').style.display = 'none';
            }
            
            function showVideo() {
                document.getElementById('video-container').style.display = 'block';
            }
            
            function initPlayer() {
                const videoElement = document.getElementById('video');
                
                try {
                    // Check if it's an HLS stream
                    if (videoUrl.includes('.m3u8')) {
                        if (Hls.isSupported()) {
                            const hls = new Hls();
                            hls.loadSource(videoUrl);
                            hls.attachMedia(videoElement);
                            
                            hls.on(Hls.Events.MANIFEST_PARSED, function() {
                                hideLoading();
                                showVideo();
                                
                                const player = new Plyr(videoElement, {
                                    controls: ['play-large', 'play', 'progress', 'current-time', 'duration', 
                                              'mute', 'volume', 'settings', 'pip', 'airplay', 'fullscreen'],
                                    settings: ['quality', 'speed'],
                                    quality: {
                                        default: 720,
                                        options: [1080, 720, 480, 360]
                                    }
                                });
                            });
                            
                            hls.on(Hls.Events.ERROR, function(event, data) {
                                if (data.fatal) {
                                    console.error('HLS Error:', data);
                                    showError('Failed to load video stream. Please try again.');
                                }
                            });
                        } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
                            // Native HLS support (Safari)
                            videoElement.src = videoUrl;
                            hideLoading();
                            showVideo();
                            
                            const player = new Plyr(videoElement);
                        } else {
                            showError('Video streaming not supported in this browser. Please try a different browser.');
                        }
                    } else {
                        // Standard video (MP4)
                        videoElement.src = videoUrl;
                        
                        videoElement.addEventListener('loadedmetadata', function() {
                            hideLoading();
                            showVideo();
                            
                            const player = new Plyr(videoElement, {
                                controls: ['play-large', 'play', 'progress', 'current-time', 'duration', 
                                          'mute', 'volume', 'settings', 'pip', 'airplay', 'fullscreen'],
                                settings: ['speed'],
                                speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 2] }
                            });
                        });
                    }
                    
                    videoElement.addEventListener('error', function(e) {
                        console.error('Video error:', e);
                        showError('Failed to load video. The file may be unavailable or the link has expired.');
                    });
                    
                } catch (error) {
                    console.error('Player initialization error:', error);
                    showError('Failed to initialize video player. Please refresh and try again.');
                }
            }
            
            // Initialize on page load
            window.addEventListener('DOMContentLoaded', initPlayer);
            
            // Pause video when tab is not visible
            document.addEventListener('visibilitychange', function() {
                const videoElement = document.getElementById('video');
                if (videoElement && document.hidden && !videoElement.paused) {
                    videoElement.pause();
                }
            });
        </script>
    </body>
    </html>
  `);
});

// Simple redirect route (for backward compatibility)
app.get('/download', (req, res) => {
  // Support multiple parameter formats
  let fileId = req.query.file || req.query.id;
  
  // Handle /stream/XXXXX format
  if (!fileId && req.query.stream) {
    fileId = req.query.stream.replace(/^\/stream\//, '');
  }
  
  if (!fileId) {
    return res.redirect('/');
  }

  // Redirect to main player with file parameter
  res.redirect(`/?file=${fileId}`);
});

// Direct stream route (alternative access)
app.get('/stream/:fileId', (req, res) => {
  const fileId = req.params.fileId;
  res.redirect(`/?file=${fileId}`);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    botUrl: BOT_API_URL 
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`BOT_API_URL: ${BOT_API_URL}`);
});
