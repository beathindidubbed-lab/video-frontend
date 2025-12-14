// Script.js - Video Player Logic
const BOT_API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:8080'
    : 'https://telegram-download-link-generator-6ds6.onrender.com';

// Get video URL from query parameters
function getVideoUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Support multiple parameter formats
    let fileId = urlParams.get('file') || 
                 urlParams.get('id') || 
                 urlParams.get('v') ||
                 urlParams.get('url');
    
    // Handle stream parameter with encoded URL
    if (!fileId && urlParams.get('stream')) {
        const streamParam = urlParams.get('stream');
        // Check if it's a full URL or just an ID
        if (streamParam.startsWith('http')) {
            return decodeURIComponent(streamParam);
        } else {
            fileId = streamParam.replace(/^\/stream\//, '');
        }
    }
    
    if (!fileId) {
        return null;
    }
    
    // If fileId is already a full URL, return it
    if (fileId.startsWith('http')) {
        return fileId;
    }
    
    // Otherwise construct the URL
    return `${BOT_API_URL}/stream/${fileId}`;
}

// Show error message
function showError(message) {
    const container = document.querySelector('.container');
    container.innerHTML = `
        <div class="header">
            <div class="logo">
                <i class="fas fa-play-circle"></i>
                <h1>Video Player</h1>
            </div>
            <p class="subtitle">Stream your content seamlessly</p>
        </div>
        
        <div class="state-message">
            <div class="state-icon error">
                <i class="fas fa-exclamation-triangle"></i>
            </div>
            <div class="state-content">
                <h1>Oops!</h1>
                <p>${message}</p>
                <a href="/" class="btn">
                    <i class="fas fa-home"></i>
                    Back to Home
                </a>
            </div>
        </div>
    `;
}

// Show empty state
function showEmptyState() {
    const container = document.querySelector('.container');
    container.innerHTML = `
        <div class="header">
            <div class="logo">
                <i class="fas fa-play-circle"></i>
                <h1>Video Player</h1>
            </div>
            <p class="subtitle">Stream your content seamlessly</p>
        </div>
        
        <div class="state-message">
            <div class="state-icon">
                <i class="fas fa-film"></i>
            </div>
            <div class="state-content">
                <h1>No Video Selected</h1>
                <p>Please use a valid video link from the bot to start streaming your content.</p>
            </div>
        </div>
        
        <div class="features-grid">
            <div class="feature-card">
                <div class="feature-icon">
                    <i class="fas fa-bolt"></i>
                </div>
                <h3>Lightning Fast</h3>
                <p>Experience ultra-fast streaming with adaptive quality for smooth playback.</p>
            </div>
            <div class="feature-card">
                <div class="feature-icon">
                    <i class="fas fa-shield-alt"></i>
                </div>
                <h3>Secure Streaming</h3>
                <p>Your content is delivered through secure, encrypted connections.</p>
            </div>
            <div class="feature-card">
                <div class="feature-icon">
                    <i class="fas fa-mobile-alt"></i>
                </div>
                <h3>Multi-Device</h3>
                <p>Watch on any device - desktop, tablet, or mobile with full support.</p>
            </div>
        </div>
    `;
}

// Hide loading indicator
function hideLoading() {
    const loading = document.getElementById('loading-indicator');
    if (loading) {
        loading.style.display = 'none';
    }
}

// Show video container
function showVideo() {
    const container = document.getElementById('video-container');
    if (container) {
        container.style.display = 'block';
    }
}

// Detect streaming format
function detectStreamingFormat(url) {
    const urlLower = url.toLowerCase();
    
    if (urlLower.includes('.m3u8')) {
        return { type: 'hls', library: 'hls.js' };
    }
    
    if (urlLower.includes('.mpd')) {
        return { type: 'dash', library: 'dash.js' };
    }
    
    return { type: 'standard', library: 'native' };
}

// Initialize video player
function initPlayer(videoUrl) {
    const videoElement = document.getElementById('video');
    const format = detectStreamingFormat(videoUrl);
    
    console.log('Initializing player with format:', format);
    
    // Plyr configuration
    const playerConfig = {
        controls: [
            'play-large',
            'restart',
            'rewind',
            'play',
            'fast-forward',
            'progress',
            'current-time',
            'duration',
            'mute',
            'volume',
            'captions',
            'settings',
            'pip',
            'airplay',
            'fullscreen'
        ],
        settings: ['captions', 'quality', 'speed'],
        speed: { 
            selected: 1, 
            options: [0.5, 0.75, 1, 1.25, 1.5, 2] 
        },
        tooltips: { 
            controls: true, 
            seek: true 
        },
        keyboard: { 
            focused: true, 
            global: true 
        },
        fullscreen: { 
            enabled: true, 
            fallback: true, 
            iosNative: true 
        },
        ratio: '16:9'
    };
    
    // Handle HLS streams
    if (format.type === 'hls') {
        if (Hls.isSupported()) {
            console.log('HLS supported, using hls.js');
            const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            
            hls.loadSource(videoUrl);
            hls.attachMedia(videoElement);
            
            hls.on(Hls.Events.MANIFEST_PARSED, function(event, data) {
                console.log('HLS manifest parsed:', data);
                hideLoading();
                showVideo();
                
                // Initialize Plyr with quality options
                const qualityOptions = data.levels.map(level => level.height);
                playerConfig.quality = {
                    default: qualityOptions[0],
                    options: qualityOptions,
                    forced: true,
                    onChange: (newQuality) => {
                        const levels = hls.levels;
                        hls.currentLevel = levels.findIndex(level => level.height === newQuality);
                    }
                };
                
                const player = new Plyr(videoElement, playerConfig);
                setupPlayerEvents(player);
            });
            
            hls.on(Hls.Events.ERROR, function(event, data) {
                console.error('HLS Error:', data);
                if (data.fatal) {
                    switch(data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            showError('Network error occurred. Please check your connection and try again.');
                            break;
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            showError('Media error occurred. The video format may not be supported.');
                            break;
                        default:
                            showError('Failed to load video stream. Please try again later.');
                            break;
                    }
                }
            });
            
        } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
            console.log('Using native HLS support');
            videoElement.src = videoUrl;
            
            videoElement.addEventListener('loadedmetadata', function() {
                hideLoading();
                showVideo();
                const player = new Plyr(videoElement, playerConfig);
                setupPlayerEvents(player);
            });
        } else {
            showError('HLS streaming is not supported in this browser. Please try a different browser.');
        }
    } else {
        // Standard video (MP4, WebM, etc.)
        console.log('Using standard video playback');
        videoElement.src = videoUrl;
        
        videoElement.addEventListener('loadedmetadata', function() {
            hideLoading();
            showVideo();
            const player = new Plyr(videoElement, playerConfig);
            setupPlayerEvents(player);
        });
    }
    
    // Error handling
    videoElement.addEventListener('error', function(e) {
        console.error('Video error:', e);
        const error = videoElement.error;
        let errorMessage = 'Failed to load video. ';
        
        if (error) {
            switch(error.code) {
                case error.MEDIA_ERR_ABORTED:
                    errorMessage += 'Playback was aborted.';
                    break;
                case error.MEDIA_ERR_NETWORK:
                    errorMessage += 'A network error occurred.';
                    break;
                case error.MEDIA_ERR_DECODE:
                    errorMessage += 'The video format is not supported.';
                    break;
                case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
                    errorMessage += 'The video source is not supported or the link has expired.';
                    break;
                default:
                    errorMessage += 'An unknown error occurred.';
            }
        }
        
        showError(errorMessage);
    });
}

// Setup player event handlers
function setupPlayerEvents(player) {
    player.on('ready', () => {
        console.log('Player is ready');
    });
    
    player.on('play', () => {
        console.log('Playback started');
    });
    
    player.on('pause', () => {
        console.log('Playback paused');
    });
    
    player.on('ended', () => {
        console.log('Playback ended');
    });
    
    player.on('error', (error) => {
        console.error('Player error:', error);
    });
    
    // Pause when tab is not visible
    document.addEventListener('visibilitychange', function() {
        if (document.hidden && !player.paused) {
            player.pause();
        }
    });
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', function() {
    const videoUrl = getVideoUrl();
    
    if (!videoUrl) {
        hideLoading();
        showEmptyState();
        return;
    }
    
    console.log('Video URL:', videoUrl);
    
    try {
        initPlayer(videoUrl);
    } catch (error) {
        console.error('Initialization error:', error);
        showError('Failed to initialize video player. Please refresh and try again.');
    }
});

// Handle page unload
window.addEventListener('beforeunload', function() {
    const videoElement = document.getElementById('video');
    if (videoElement && !videoElement.paused) {
        videoElement.pause();
    }
});
