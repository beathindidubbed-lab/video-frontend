const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;
const BOT_API_URL = process.env.BOT_API_URL || 'https://telegram-download-link-generator-production.up.railway.app';  // ✅ YOUR RAILWAY URL;

// Security headers middleware
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});

// Serve static files from public directory
app.use(express.static('public', {
    maxAge: '1d',
    etag: true
}));

// Main video player route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Alternative routes for backward compatibility
app.get('/download', (req, res) => {
    const fileId = req.query.file || req.query.id || req.query.stream;
    
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

// Watch route (alternative naming)
app.get('/watch', (req, res) => {
    const fileId = req.query.v || req.query.file || req.query.id;
    
    if (!fileId) {
        return res.redirect('/');
    }

    res.redirect(`/?file=${fileId}`);
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        botUrl: BOT_API_URL,
        service: 'Video Frontend',
        version: '2.0.0'
    });
});

// API status endpoint
app.get('/api/status', (req, res) => {
    res.json({
        status: 'operational',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        timestamp: new Date().toISOString()
    });
});

// Robots.txt
app.get('/robots.txt', (req, res) => {
    res.type('text/plain');
    res.send('User-agent: *\nAllow: /');
});

// 404 handler - redirect to home
app.use((req, res) => {
    res.redirect('/');
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// Start server
app.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log(`🚀 Video Frontend Server Started`);
    console.log('='.repeat(50));
    console.log(`📡 Server running on port: ${PORT}`);
    console.log(`🔗 Bot API URL: ${BOT_API_URL}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`⏰ Started at: ${new Date().toISOString()}`);
    console.log('='.repeat(50));
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('\nSIGINT received, shutting down gracefully...');
    process.exit(0);
});
