// Enhanced Script.js - Advanced Video Player Logic
const BOT_API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:8080'
    : 'https://telegram-download-link-generator-6ds6.onrender.com';

// Anti-inspection protection
(function() {
    'use strict';
    
    // Disable right-click
    document.addEventListener('contextmenu', e => e.preventDefault());
    
    // Detect DevTools
    const devtools = { open: false };
    const threshold = 160;
    
    setInterval(() => {
        if (window.outerWidth - window.innerWidth > threshold || 
            window.outerHeight - window.innerHeight > threshold) {
            if (!devtools.open) {
                devtools.open = true;
                document.body.innerHTML = '<h1 style="color:red;text-align:center;margin-top:50vh;">Developer tools detected. Access denied.</h1>';
            }
        }
    }, 500);
    
    // Disable F12, Ctrl+Shift+I, Ctrl+U
    document.addEventListener('keydown', e => {
        if (e.key === 'F12' || 
            (e.ctrlKey && e.shiftKey && e.key === 'I') ||
            (e.ctrlKey && e.key === 'u')) {
            e.preventDefault();
            return false;
        }
    });
})();

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

// Check if opened in Telegram in-app browser
function isInAppBrowser() {
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    return /Telegram/i.test(ua) || /FBAV|FBAN|Instagram/i.test(ua);
}

// Redirect to external browser
function redirectToExternalBrowser() {
    if (isInAppBrowser()) {
        const currentUrl = window.location.href;
        
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.95);
            z-index: 99999;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: white;
            text-align: center;
            padding: 20px;
        `;
        
        overlay.innerHTML = `
            <i class="fas fa-external-link-alt" style="font-size: 4rem; margin-bottom: 20px; color: #667eea;"></i>
            <h2 style="font-size: 1.8rem; margin-bottom: 10px;">Open in External Browser</h2>
            <p style="font-size: 1.1rem; opacity: 0.8; margin-bottom: 30px;">
                For the best experience, please open this link in your default browser
            </p>
            <button onclick="window.location.href='${currentUrl}'" 
                    style="padding: 15px 30px; background: linear-gradient(135deg, #667eea, #764ba2); 
                           border: none; border-radius: 10px; color: white; font-size: 1.1rem; 
                           font-weight: 600; cursor: pointer;">
                <i class="fas fa-arrow-right"></i> Open in Browser
            </button>
            <p style="margin-top: 30px; font-size: 0.9rem; opacity: 0.6;">
                Tap the three dots (⋮) at the top and select "Open in Browser"
            </p>
        `;
        
        document.body.appendChild(overlay);
        return true;
    }
    return false;
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

// Add double-tap controls
function addDoubleTapControls(videoElement, player) {
    let lastTap = 0;
    let tapTimer = null;
    
    const overlay = document.createElement('div');
    overlay.className = 'double-tap-overlay';
    overlay.innerHTML = `
        <div class="tap-indicator tap-left">
            <i class="fas fa-undo"></i>
            <span>10s</span>
        </div>
        <div class="tap-indicator tap-right">
            <i class="fas fa-redo"></i>
            <span>10s</span>
        </div>
    `;
    videoElement.parentElement.appendChild(overlay);
    
    overlay.addEventListener('click', (e) => {
        const now = Date.now();
        const timeSinceLastTap = now - lastTap;
        
        if (timeSinceLastTap < 300 && timeSinceLastTap > 0) {
            // Double tap detected
            const rect = overlay.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const width = rect.width;
            
            if (x < width / 2) {
                // Left side - rewind
                videoElement.currentTime = Math.max(0, videoElement.currentTime - 10);
                showTapFeedback('left');
            } else {
                // Right side - forward
                videoElement.currentTime = Math.min(videoElement.duration, videoElement.currentTime + 10);
                showTapFeedback('right');
            }
        }
        
        lastTap = now;
    });
    
    function showTapFeedback(side) {
        const indicator = overlay.querySelector(`.tap-${side}`);
        indicator.classList.add('active');
        setTimeout(() => indicator.classList.remove('active'), 600);
    }
}

// Add download button
function addDownloadButton(videoUrl, player) {
    setTimeout(() => {
        const controls = document.querySelector('.plyr__controls');
        if (controls) {
            const downloadBtn = document.createElement('button');
            downloadBtn.className = 'plyr__controls__item plyr__control download-btn';
            downloadBtn.setAttribute('type', 'button');
            downloadBtn.setAttribute('aria-label', 'Download');
            downloadBtn.innerHTML = '<i class="fas fa-download"></i>';
            downloadBtn.title = 'Download Video';
            
            downloadBtn.addEventListener('click', () => {
                // Create temporary link
                const a = document.createElement('a');
                a.href = videoUrl;
                a.download = 'video_' + Date.now();
                a.style.display = 'none';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                
                // Show notification
                showNotification('Download started...', 'success');
            });
            
            controls.appendChild(downloadBtn);
        }
    }, 1000);
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 100);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Enable background buffering
function enableBackgroundBuffering(videoElement) {
    let wasPlaying = false;
    
    videoElement.addEventListener('pause', () => {
        wasPlaying = true;
        // Keep loading in background by setting preload
        videoElement.setAttribute('preload', 'auto');
    });
    
    videoElement.addEventListener('play', () => {
        if (wasPlaying) {
            showNotification('Buffering complete', 'success');
        }
    });
    
    // Monitor buffer progress
    videoElement.addEventListener('progress', () => {
        if (videoElement.paused) {
            const buffered = videoElement.buffered;
            if (buffered.length > 0) {
                const bufferedEnd = buffered.end(buffered.length - 1);
                const duration = videoElement.duration;
                const percentBuffered = (bufferedEnd / duration) * 100;
                
                // Update buffer indicator
                updateBufferIndicator(percentBuffered);
            }
        }
    });
}

// Update buffer indicator
function updateBufferIndicator(percent) {
    let indicator = document.querySelector('.buffer-indicator');
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.className = 'buffer-indicator';
        document.querySelector('.video-info').appendChild(indicator);
    }
    indicator.innerHTML = `
        <div class="info-item">
            <i class="fas fa-clock"></i>
            <div>
                <div class="info-label">Buffer</div>
                <div class="info-value">${Math.round(percent)}%</div>
            </div>
        </div>
    `;
}

// Add picture-in-picture support
function addPIPSupport(videoElement) {
    if (document.pictureInPictureEnabled) {
        videoElement.addEventListener('enterpictureinpicture', () => {
            showNotification('Picture-in-Picture enabled', 'info');
        });
        
        videoElement.addEventListener('leavepictureinpicture', () => {
            showNotification('Picture-in-Picture disabled', 'info');
        });
    }
}

// Initialize video player
function initPlayer(videoUrl) {
    const videoElement = document.getElementById('video');
    const format = detectStreamingFormat(videoUrl);
    
    console.log('Initializing player with format:', format);
    
    // Enhanced Plyr configuration
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
        settings: ['captions', 'quality', 'speed', 'loop'],
        speed: { 
            selected: 1, 
            options: [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2] 
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
            iosNative: true,
            container: null
        },
        ratio: '16:9',
        autoplay: false,
        autopause: true,
        seekTime: 10,
        volume: 1,
        clickToPlay: true,
        disableContextMenu: true
    };
    
    // Handle HLS streams
    if (format.type === 'hls') {
        if (Hls.isSupported()) {
            console.log('HLS supported, using hls.js');
            const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90,
                maxBufferLength: 30,
                maxMaxBufferLength: 600
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
                
                const player = new Plyr(videoElement, playerConfig);
                setupPlayerFeatures(player, videoElement, videoUrl);
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
                setupPlayerFeatures(player, videoElement, videoUrl);
            });
        } else {
            showError('HLS streaming is not supported in this browser. Please try a different browser.');
        }
    } else {
        console.log('Using standard video playback');
        videoElement.src = videoUrl;
        
        videoElement.addEventListener('loadedmetadata', function() {
            hideLoading();
            showVideo();
            const player = new Plyr(videoElement, playerConfig);
            setupPlayerFeatures(player, videoElement, videoUrl);
        });
    }
    
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
function setupPlayerFeatures(player, videoElement, videoUrl) {
    setupPlayerEvents(player);
    addDoubleTapControls(videoElement, player);
    addDownloadButton(videoUrl, player);
    enableBackgroundBuffering(videoElement);
    addPIPSupport(videoElement);
    
    // Add keyboard shortcuts
    addKeyboardShortcuts(player, videoElement);
    
    // Save playback position
    savePlaybackPosition(videoElement);
}

// Add keyboard shortcuts
function addKeyboardShortcuts(player, videoElement) {
    document.addEventListener('keydown', (e) => {
        switch(e.key.toLowerCase()) {
            case 'k':
            case ' ':
                e.preventDefault();
                player.togglePlay();
                break;
            case 'f':
                e.preventDefault();
                player.fullscreen.toggle();
                break;
            case 'm':
                e.preventDefault();
                player.muted = !player.muted;
                break;
            case 'arrowleft':
                e.preventDefault();
                videoElement.currentTime -= 5;
                break;
            case 'arrowright':
                e.preventDefault();
                videoElement.currentTime += 5;
                break;
            case 'j':
                e.preventDefault();
                videoElement.currentTime -= 10;
                break;
            case 'l':
                e.preventDefault();
                videoElement.currentTime += 10;
                break;
        }
    });
}

// Save playback position
function savePlaybackPosition(videoElement) {
    const videoId = new URLSearchParams(window.location.search).get('file');
    
    if (videoId) {
        // Load saved position
        const savedPosition = localStorage.getItem(`video_pos_${videoId}`);
        if (savedPosition) {
            videoElement.currentTime = parseFloat(savedPosition);
            showNotification('Resumed from last position', 'info');
        }
        
        // Save position periodically
        setInterval(() => {
            if (!videoElement.paused) {
                localStorage.setItem(`video_pos_${videoId}`, videoElement.currentTime);
            }
        }, 5000);
    }
}

// Setup player event handlers
function setupPlayerEvents(player) {
    player.on('ready', () => {
        console.log('Player is ready');
        showNotification('Player ready', 'success');
    });
    
    player.on('play', () => {
        console.log('Playback started');
    });
    
    player.on('pause', () => {
        console.log('Playback paused - buffering continues');
    });
    
    player.on('ended', () => {
        console.log('Playback ended');
        showNotification('Video ended', 'info');
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
    // Check if in Telegram app
    if (redirectToExternalBrowser()) {
        return;
    }
    
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
