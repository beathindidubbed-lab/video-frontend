// Script.js - Enhanced Video Player Logic with All Features
const BOT_API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:8080'
    : 'https://telegram-download-link-generator-6ds6.onrender.com';

// Global variables
let player = null;
let videoElement = null;
let currentVideoUrl = null;
let lastTapTime = 0;
let tapTimeout = null;
let bufferUpdateInterval = null;
let positionSaveInterval = null;

// Get video URL from query parameters
function getVideoUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    
    let fileId = urlParams.get('file') || 
                 urlParams.get('id') || 
                 urlParams.get('v') ||
                 urlParams.get('url');
    
    if (!fileId && urlParams.get('stream')) {
        const streamParam = urlParams.get('stream');
        if (streamParam.startsWith('http')) {
            return decodeURIComponent(streamParam);
        } else {
            fileId = streamParam.replace(/^\/stream\//, '');
        }
    }
    
    if (!fileId) {
        return null;
    }
    
    if (fileId.startsWith('http')) {
        return fileId;
    }
    
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

// Format time
function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hrs > 0) {
        return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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

// Detect if running in in-app browser
function detectInAppBrowser() {
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    
    // Telegram
    if (ua.indexOf('Telegram') !== -1) {
        return 'telegram';
    }
    
    // Instagram
    if (ua.indexOf('Instagram') !== -1) {
        return 'instagram';
    }
    
    // Facebook
    if (ua.indexOf('FBAN') !== -1 || ua.indexOf('FBAV') !== -1) {
        return 'facebook';
    }
    
    // Twitter
    if (ua.indexOf('Twitter') !== -1) {
        return 'twitter';
    }
    
    // WhatsApp
    if (ua.indexOf('WhatsApp') !== -1) {
        return 'whatsapp';
    }
    
    return null;
}

// Save playback position
function savePosition(time) {
    if (currentVideoUrl) {
        try {
            const videoId = btoa(currentVideoUrl).substring(0, 50);
            localStorage.setItem(`video_pos_${videoId}`, time.toString());
        } catch (e) {
            console.log('Could not save position:', e);
        }
    }
}

// Load saved position
function loadPosition() {
    if (currentVideoUrl) {
        try {
            const videoId = btoa(currentVideoUrl).substring(0, 50);
            const savedPos = localStorage.getItem(`video_pos_${videoId}`);
            return savedPos ? parseFloat(savedPos) : 0;
        } catch (e) {
            console.log('Could not load position:', e);
            return 0;
        }
    }
    return 0;
}

// Update buffer progress
function updateBufferProgress() {
    if (!videoElement) return;
    
    try {
        const buffered = videoElement.buffered;
        if (buffered.length > 0) {
            const currentTime = videoElement.currentTime;
            const duration = videoElement.duration;
            
            // Find the buffered range that contains current time
            for (let i = 0; i < buffered.length; i++) {
                if (buffered.start(i) <= currentTime && buffered.end(i) > currentTime) {
                    const bufferEnd = buffered.end(i);
                    const bufferPercent = Math.round((bufferEnd / duration) * 100);
                    
                    const bufferValue = document.getElementById('buffer-value');
                    if (bufferValue) {
                        bufferValue.textContent = `${bufferPercent}%`;
                    }
                    break;
                }
            }
        }
    } catch (e) {
        console.log('Buffer update error:', e);
    }
}

// Setup buffer monitoring
function setupBufferMonitoring() {
    if (bufferUpdateInterval) {
        clearInterval(bufferUpdateInterval);
    }
    
    bufferUpdateInterval = setInterval(updateBufferProgress, 500);
}

// Setup position saving
function setupPositionSaving() {
    if (positionSaveInterval) {
        clearInterval(positionSaveInterval);
    }
    
    positionSaveInterval = setInterval(() => {
        if (videoElement && !videoElement.paused) {
            savePosition(videoElement.currentTime);
        }
    }, 5000);
}

// Setup keyboard shortcuts
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        if (!player || !videoElement) return;
        
        // Prevent default for our shortcuts
        const shortcuts = ['Space', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'KeyF', 'KeyM'];
        if (shortcuts.includes(e.code)) {
            e.preventDefault();
        }
        
        switch(e.code) {
            case 'Space':
                player.togglePlay();
                break;
            case 'ArrowLeft':
                videoElement.currentTime = Math.max(0, videoElement.currentTime - 10);
                break;
            case 'ArrowRight':
                videoElement.currentTime = Math.min(videoElement.duration, videoElement.currentTime + 10);
                break;
            case 'ArrowUp':
                player.volume = Math.min(1, player.volume + 0.1);
                break;
            case 'ArrowDown':
                player.volume = Math.max(0, player.volume - 0.1);
                break;
            case 'KeyF':
                player.fullscreen.toggle();
                break;
            case 'KeyM':
                player.muted = !player.muted;
                break;
        }
    });
}

// Setup double tap controls
function setupDoubleTapControls() {
    const leftOverlay = document.querySelector('.tap-overlay-left');
    const rightOverlay = document.querySelector('.tap-overlay-right');
    
    if (!leftOverlay || !rightOverlay) return;
    
    let lastTouchTime = 0;
    let touchTimeout = null;
    
    function handleDoubleTap(direction) {
        if (!videoElement) return;
        
        const feedback = direction === 'left' 
            ? leftOverlay.querySelector('.tap-feedback')
            : rightOverlay.querySelector('.tap-feedback');
        
        feedback.classList.remove('animate');
        void feedback.offsetWidth; // Trigger reflow
        feedback.classList.add('animate');
        
        if (direction === 'left') {
            videoElement.currentTime = Math.max(0, videoElement.currentTime - 10);
        } else {
            videoElement.currentTime = Math.min(videoElement.duration, videoElement.currentTime + 10);
        }
    }
    
    [leftOverlay, rightOverlay].forEach((overlay, index) => {
        const direction = index === 0 ? 'left' : 'right';
        
        // Make overlay clickable
        overlay.style.pointerEvents = 'auto';
        overlay.style.cursor = 'pointer';
        
        // Touch events
        overlay.addEventListener('touchstart', (e) => {
            const currentTime = new Date().getTime();
            const tapGap = currentTime - lastTouchTime;
            
            if (tapGap < 300 && tapGap > 0) {
                e.preventDefault();
                handleDoubleTap(direction);
                clearTimeout(touchTimeout);
            } else {
                touchTimeout = setTimeout(() => {
                    // Single tap - do nothing or toggle play
                }, 300);
            }
            
            lastTouchTime = currentTime;
        });
        
        // Click events for desktop
        let clickCount = 0;
        let clickTimeout = null;
        
        overlay.addEventListener('click', (e) => {
            clickCount++;
            
            if (clickCount === 1) {
                clickTimeout = setTimeout(() => {
                    clickCount = 0;
                }, 300);
            } else if (clickCount === 2) {
                clearTimeout(clickTimeout);
                clickCount = 0;
                handleDoubleTap(direction);
            }
        });
    });
}

// Setup seek bar preview
function setupSeekPreview() {
    const plyrContainer = document.querySelector('.plyr');
    const preview = document.getElementById('seek-preview');
    const previewCanvas = document.getElementById('preview-canvas');
    const previewTime = document.getElementById('preview-time');
    const ctx = previewCanvas.getContext('2d');
    
    if (!plyrContainer || !preview || !previewCanvas || !videoElement) return;
    
    // Set canvas size
    previewCanvas.width = 160;
    previewCanvas.height = 90;
    
    let isHovering = false;
    
    function updatePreview(e) {
        if (!videoElement || !videoElement.duration) return;
        
        const seekBar = plyrContainer.querySelector('.plyr__progress input[type="range"]');
        if (!seekBar) return;
        
        const rect = seekBar.getBoundingClientRect();
        let x;
        
        if (e.touches) {
            x = e.touches[0].clientX - rect.left;
        } else {
            x = e.clientX - rect.left;
        }
        
        const percentage = Math.max(0, Math.min(1, x / rect.width));
        const time = percentage * videoElement.duration;
        
        // Update time display
        previewTime.textContent = formatTime(time);
        
        // Position preview
        let previewX = rect.left + (percentage * rect.width) - (preview.offsetWidth / 2);
        
        // Keep preview within viewport
        const maxX = window.innerWidth - preview.offsetWidth - 10;
        previewX = Math.max(10, Math.min(maxX, previewX));
        
        preview.style.left = `${previewX}px`;
        preview.classList.add('visible');
        
        // Capture video frame
        try {
            ctx.drawImage(videoElement, 0, 0, previewCanvas.width, previewCanvas.height);
        } catch (err) {
            // Video may not be ready for capture
            console.log('Frame capture not available');
        }
    }
    
    function hidePreview() {
        isHovering = false;
        setTimeout(() => {
            if (!isHovering) {
                preview.classList.remove('visible');
            }
        }, 100);
    }
    
    // Mouse events
    plyrContainer.addEventListener('mousemove', (e) => {
        const seekBar = plyrContainer.querySelector('.plyr__progress input[type="range"]');
        if (!seekBar) return;
        
        const rect = seekBar.getBoundingClientRect();
        if (e.clientY >= rect.top - 20 && e.clientY <= rect.bottom + 20) {
            isHovering = true;
            updatePreview(e);
        } else {
            hidePreview();
        }
    });
    
    plyrContainer.addEventListener('mouseleave', hidePreview);
    
    // Touch events
    plyrContainer.addEventListener('touchmove', (e) => {
        const seekBar = plyrContainer.querySelector('.plyr__progress input[type="range"]');
        if (!seekBar) return;
        
        const touch = e.touches[0];
        const rect = seekBar.getBoundingClientRect();
        
        if (touch.clientY >= rect.top - 20 && touch.clientY <= rect.bottom + 20) {
            isHovering = true;
            updatePreview(e);
        }
    });
    
    plyrContainer.addEventListener('touchend', hidePreview);
}

// Setup download button
function setupDownloadButton() {
    const downloadBtn = document.getElementById('download-btn');
    if (downloadBtn && currentVideoUrl) {
        downloadBtn.href = currentVideoUrl;
        downloadBtn.download = 'video.mp4';
        downloadBtn.target = '_blank';
    }
}

// Setup share button
function setupShareButton() {
    const shareBtn = document.getElementById('share-btn');
    if (!shareBtn) return;
    
    shareBtn.addEventListener('click', async () => {
        const shareData = {
            title: 'Check out this video!',
            text: 'Watch this amazing video',
            url: window.location.href
        };
        
        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                // Fallback: copy to clipboard
                await navigator.clipboard.writeText(window.location.href);
                alert('Link copied to clipboard!');
            }
        } catch (err) {
            console.log('Share failed:', err);
            // Final fallback
            const tempInput = document.createElement('input');
            tempInput.value = window.location.href;
            document.body.appendChild(tempInput);
            tempInput.select();
            document.execCommand('copy');
            document.body.removeChild(tempInput);
            alert('Link copied to clipboard!');
        }
    });
}

// Initialize video player
function initPlayer(videoUrl) {
    videoElement = document.getElementById('video');
    currentVideoUrl = videoUrl;
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
            global: false  // We handle this ourselves
        },
        fullscreen: { 
            enabled: true, 
            fallback: true, 
            iosNative: true 
        },
        ratio: '16:9',
        autoplay: false,
        storage: { enabled: true, key: 'plyr_volume' }
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
                
                player = new Plyr(videoElement, playerConfig);
                setupPlayerFeatures();
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
                player = new Plyr(videoElement, playerConfig);
                setupPlayerFeatures();
            });
        } else {
            showError('HLS streaming is not supported in this browser. Please try a different browser.');
        }
    } else {
        // Standard video
        console.log('Using standard video playback');
        videoElement.src = videoUrl;
        
        videoElement.addEventListener('loadedmetadata', function() {
            hideLoading();
            showVideo();
            player = new Plyr(videoElement, playerConfig);
            setupPlayerFeatures();
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

// Setup all player features
function setupPlayerFeatures() {
    setupPlayerEvents();
    setupKeyboardShortcuts();
    setupDoubleTapControls();
    setupBufferMonitoring();
    setupPositionSaving();
    setupDownloadButton();
    setupShareButton();
    
    // Setup seek preview after a slight delay to ensure Plyr is ready
    setTimeout(() => {
        setupSeekPreview();
    }, 500);
    
    // Load saved position
    const savedPos = loadPosition();
    if (savedPos > 0 && savedPos < videoElement.duration - 10) {
        videoElement.currentTime = savedPos;
    }
    
    // Detect in-app browser
    const inAppBrowser = detectInAppBrowser();
    if (inAppBrowser) {
        console.log('Running in', inAppBrowser, 'in-app browser');
    }
}

// Setup player event handlers
function setupPlayerEvents() {
    if (!player || !videoElement) return;
    
    player.on('ready', () => {
        console.log('Player is ready');
        const statusValue = document.getElementById('status-value');
        if (statusValue) statusValue.textContent = 'Ready to Play';
    });
    
    player.on('play', () => {
        console.log('Playback started');
        const statusValue = document.getElementById('status-value');
        if (statusValue) statusValue.textContent = 'Playing';
    });
    
    player.on('pause', () => {
        console.log('Playback paused');
        const statusValue = document.getElementById('status-value');
        if (statusValue) statusValue.textContent = 'Paused';
        savePosition(videoElement.currentTime);
    });
    
    player.on('ended', () => {
        console.log('Playback ended');
        const statusValue = document.getElementById('status-value');
        if (statusValue) statusValue.textContent = 'Ended';
        savePosition(0); // Reset position
    });
    
    player.on('timeupdate', () => {
        const watchTimeValue = document.getElementById('watch-time-value');
        if (watchTimeValue) {
            watchTimeValue.textContent = formatTime(videoElement.currentTime);
        }
    });
    
    player.on('error', (error) => {
        console.error('Player error:', error);
    });
    
    // Auto-pause when tab is hidden
    document.addEventListener('visibilitychange', function() {
        if (document.hidden && player && !player.paused) {
            player.pause();
            console.log('Auto-paused: tab hidden');
        }
    });
    
    // Prevent context menu on video
    videoElement.addEventListener('contextmenu', (e) => {
        e.preventDefault();
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
    if (videoElement && !videoElement.paused) {
        savePosition(videoElement.currentTime);
        videoElement.pause();
    }
    
    // Cleanup intervals
    if (bufferUpdateInterval) clearInterval(bufferUpdateInterval);
    if (positionSaveInterval) clearInterval(positionSaveInterval);
});

// Handle page visibility
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        console.log('Page hidden');
        if (videoElement && !videoElement.paused) {
            savePosition(videoElement.currentTime);
        }
    } else {
        console.log('Page visible');
    }
});
