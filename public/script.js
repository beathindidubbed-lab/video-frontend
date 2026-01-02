// Script.js - Fixed Video Player Logic
const BOT_API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:8080'
    : 'https://telegram-download-link-generator-6ds6.onrender.com';

// Global variables
let player = null;
let videoElement = null;
let currentVideoUrl = null;
let bufferUpdateInterval = null;
let positionSaveInterval = null;
let previewVideo = null;

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
            const duration = videoElement.duration;
            
            // Get the furthest buffered end point
            let maxBuffered = 0;
            for (let i = 0; i < buffered.length; i++) {
                if (buffered.end(i) > maxBuffered) {
                    maxBuffered = buffered.end(i);
                }
            }
            
            const bufferPercent = Math.round((maxBuffered / duration) * 100);
            
            const bufferValue = document.getElementById('buffer-value');
            if (bufferValue) {
                bufferValue.textContent = `${bufferPercent}%`;
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
    
    bufferUpdateInterval = setInterval(updateBufferProgress, 1000);
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
        
        // Ignore if typing in an input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }
        
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

// Setup double tap controls - FIXED to prevent fullscreen trigger
function setupDoubleTapControls() {
    const videoElement = document.getElementById('video');
    const playerContainer = document.querySelector('.player-container');
    const leftOverlay = document.querySelector('.tap-overlay-left');
    const rightOverlay = document.querySelector('.tap-overlay-right');
    
    if (!playerContainer || !leftOverlay || !rightOverlay || !videoElement) return;
    
    function handleDoubleTap(direction) {
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
    
    // Wait for Plyr to initialize
    setTimeout(() => {
        const plyrVideo = document.querySelector('.plyr__video-wrapper');
        if (!plyrVideo) return;
        
        // MOBILE: Touch events
        let lastTouchTime = 0;
        let lastTouchX = 0;
        
        plyrVideo.addEventListener('touchend', (e) => {
            const currentTime = new Date().getTime();
            const tapGap = currentTime - lastTouchTime;
            
            const touch = e.changedTouches[0];
            const touchX = touch.clientX;
            
            // Check if it's a double tap (within 300ms)
            if (tapGap < 300 && tapGap > 0) {
                // CRITICAL: Prevent fullscreen toggle
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                
                // Determine direction
                const rect = plyrVideo.getBoundingClientRect();
                const relativeX = touchX - rect.left;
                const direction = relativeX < rect.width / 2 ? 'left' : 'right';
                
                handleDoubleTap(direction);
                
                // Reset to prevent triple tap issues
                lastTouchTime = 0;
            } else {
                lastTouchTime = currentTime;
                lastTouchX = touchX;
            }
        });
        
        // DESKTOP: Double click (but don't interfere with single clicks)
        let clickCount = 0;
        let clickTimeout = null;
        let lastClickX = 0;
        
        plyrVideo.addEventListener('dblclick', (e) => {
            // CRITICAL: Prevent fullscreen toggle on double click
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            
            // Determine direction
            const rect = plyrVideo.getBoundingClientRect();
            const relativeX = e.clientX - rect.left;
            const direction = relativeX < rect.width / 2 ? 'left' : 'right';
            
            handleDoubleTap(direction);
        });
        
        // Disable Plyr's default double-click fullscreen
        if (player) {
            videoElement.removeEventListener('dblclick', player.toggleFullscreen);
            plyrVideo.removeEventListener('dblclick', player.toggleFullscreen);
        }
    }, 800);
}

// Setup seek bar preview - FIXED VERSION
function setupSeekPreview() {
    const preview = document.getElementById('seek-preview');
    const previewCanvas = document.getElementById('preview-canvas');
    const previewTime = document.getElementById('preview-time');
    
    if (!preview || !previewCanvas || !videoElement) return;
    
    const ctx = previewCanvas.getContext('2d');
    previewCanvas.width = 160;
    previewCanvas.height = 90;
    
    let isHovering = false;
    let isSeeking = false;
    
    // Initialize preview video element
    function initPreviewVideo() {
        if (previewVideo) return;
        
        previewVideo = document.createElement('video');
        previewVideo.style.display = 'none';
        previewVideo.crossOrigin = 'anonymous';
        previewVideo.muted = true;
        previewVideo.preload = 'auto';
        previewVideo.src = videoElement.src;
        document.body.appendChild(previewVideo);
        
        previewVideo.addEventListener('seeked', () => {
            drawFrame(previewVideo);
        });
    }
    
    function drawFrame(sourceVideo) {
        try {
            ctx.drawImage(sourceVideo, 0, 0, previewCanvas.width, previewCanvas.height);
        } catch (err) {
            // Fallback to gradient background
            ctx.fillStyle = '#1a1f3a';
            ctx.fillRect(0, 0, previewCanvas.width, previewCanvas.height);
            ctx.fillStyle = '#667eea';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Preview', previewCanvas.width / 2, previewCanvas.height / 2);
        }
    }
    
    function updatePreview(clientX, rect) {
        if (!videoElement || !videoElement.duration) return;
        
        const x = clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, x / rect.width));
        const time = percentage * videoElement.duration;
        
        // Update time display
        previewTime.textContent = formatTime(time);
        
        // Position preview to follow mouse/touch horizontally
        const previewWidth = preview.offsetWidth;
        const previewHeight = preview.offsetHeight;
        let previewX = rect.left + (percentage * rect.width);
        
        // Keep preview within viewport bounds
        const minX = previewWidth / 2 + 10;
        const maxX = window.innerWidth - previewWidth / 2 - 10;
        previewX = Math.max(minX, Math.min(maxX, previewX));
        
        // Position preview above the seek bar with proper offset
        const previewY = rect.top - previewHeight - 15;
        
        preview.style.left = `${previewX}px`;
        preview.style.top = `${previewY}px`;
        preview.style.transform = 'translateX(-50%)';
        preview.classList.add('visible');
        
        // Initialize and update preview video
        if (!previewVideo) {
            initPreviewVideo();
        }
        
        if (previewVideo && previewVideo.readyState >= 2) {
            previewVideo.currentTime = time;
        } else {
            drawFrame(videoElement);
        }
    }
    
    function hidePreview() {
        isHovering = false;
        isSeeking = false;
        setTimeout(() => {
            if (!isHovering && !isSeeking) {
                preview.classList.remove('visible');
            }
        }, 150);
    }
    
    // Wait for Plyr to be ready
    setTimeout(() => {
        const plyrContainer = document.querySelector('.plyr');
        if (!plyrContainer) return;
        
        const seekInput = plyrContainer.querySelector('.plyr__progress input[type="range"]');
        if (!seekInput) return;
        
        // Desktop: Mouse events on seek bar
        seekInput.addEventListener('mouseenter', () => {
            isHovering = true;
        });
        
        seekInput.addEventListener('mousemove', (e) => {
            isHovering = true;
            const rect = seekInput.getBoundingClientRect();
            updatePreview(e.clientX, rect);
        });
        
        seekInput.addEventListener('mouseleave', () => {
            isHovering = false;
            hidePreview();
        });
        
        // Mobile: Touch events on seek bar
        seekInput.addEventListener('touchstart', (e) => {
            isSeeking = true;
            const rect = seekInput.getBoundingClientRect();
            const touch = e.touches[0];
            updatePreview(touch.clientX, rect);
        });
        
        seekInput.addEventListener('touchmove', (e) => {
            isSeeking = true;
            const rect = seekInput.getBoundingClientRect();
            const touch = e.touches[0];
            updatePreview(touch.clientX, rect);
        });
        
        seekInput.addEventListener('touchend', () => {
            hidePreview();
        });
        
        seekInput.addEventListener('touchcancel', () => {
            hidePreview();
        });
        
    }, 1000);
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
                await navigator.clipboard.writeText(window.location.href);
                alert('Link copied to clipboard!');
            }
        } catch (err) {
            console.log('Share failed:', err);
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
            'settings',
            'pip',
            'airplay',
            'fullscreen'
        ],
        settings: ['quality', 'speed'],
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
            global: false
        },
        fullscreen: { 
            enabled: true, 
            fallback: true, 
            iosNative: true 
        },
        ratio: '16:9',
        autoplay: false,
        clickToPlay: true,
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
    setupBufferMonitoring();
    setupPositionSaving();
    setupDownloadButton();
    setupShareButton();
    
    // Setup double tap and seek preview with delay
    setTimeout(() => {
        setupDoubleTapControls();
        setupSeekPreview();
    }, 500);
    
    // Load saved position
    const savedPos = loadPosition();
    if (savedPos > 0 && savedPos < videoElement.duration - 10) {
        videoElement.currentTime = savedPos;
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
        savePosition(0);
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
    }
    
    if (bufferUpdateInterval) clearInterval(bufferUpdateInterval);
    if (positionSaveInterval) clearInterval(positionSaveInterval);
    if (previewVideo) {
        previewVideo.remove();
        previewVideo = null;
    }
});

// Handle page visibility
document.addEventListener('visibilitychange', function() {
    if (document.hidden && videoElement && !videoElement.paused) {
        savePosition(videoElement.currentTime);
    }
});
