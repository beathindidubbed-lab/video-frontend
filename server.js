const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;
const BOT_API_URL = process.env.BOT_API_URL || 'YOUR_BOT_API_URL';

// Serve static files
app.use(express.static('public'));

// Main download route
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
        <title>Video Download</title>
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
          <h1>Video Download Service</h1>
          <p>Please use a valid download link</p>
        </div>
      </body>
      </html>
    `);
  }

  // Redirect to bot's stream endpoint
  res.redirect(`${BOT_API_URL}/stream/${fileId}`);
});

// Download route with nice UI
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

  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Downloading Video...</title>
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
          padding: 3rem;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          backdrop-filter: blur(10px);
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
          max-width: 500px;
        }
        h1 { font-size: 2rem; margin-bottom: 1.5rem; }
        .loader {
          width: 60px;
          height: 60px;
          border: 5px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 2rem auto;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        p { font-size: 1rem; opacity: 0.9; line-height: 1.6; }
        .icon { font-size: 3rem; margin-bottom: 1rem; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="icon">📥</div>
        <h1>Preparing Your Download</h1>
        <div class="loader"></div>
        <p>Your video is being prepared...<br>If download doesn't start automatically, please wait a moment.</p>
      </div>
      <script>
        setTimeout(() => {
          window.location.href = '${BOT_API_URL}/stream/${fileId}';
        }, 1500);
      </script>
    </body>
    </html>
  `);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`BOT_API_URL: ${BOT_API_URL}`);
});
