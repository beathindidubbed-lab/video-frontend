// Fixed Script.js - YouTube-like Double Tap Controls
const BOT_API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:8080'
    : 'https://telegram-download-link-generator-6ds6.onrender.com';

// Minimal protection - only blocks inspect tools
document.addEventListener('keydown', e => {
    if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I') || (e.ctrlKey && e.key === 'u')) {
        e.preventDefault();
    }
});

// Get video URL
function getVideoUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    let fileId = urlParams.get('file') || urlParams.get('id') || urlParams.get('v') || urlParams.get('url');
    
    if (!fileId && urlParams.get('stream')) {
        const streamParam = urlParams.get('stream');
        if (streamParam.startsWith('http')) {
            return decodeURIComponent(streamParam);
        } else {
            fileId = streamParam.replace(/^\/stream\//, '');
        }
    }
    
    if (!fileId) return null;
    if (fileId.startsWith('http')) return fileId;
    return `${BOT_API_URL}/stream/${fileId}`;
}

// Check if in-app browser
function isInAppBrowser() {
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    return /Telegram/i.test(ua) || /FBAV|FBAN|Instagram/i.test(ua);
}

function redirectToExternalBrowser() {
    if (isInAppBrowser()) {
        const overlay = document.createElement('div');
        overlay.style.cssText = `position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.95);z-index:99999;display:flex;flex-direction:column;align-items:center;justify-content:center;color:white;text-align:center;padding:20px;`;
        overlay.innerHTML = `
            <i class="fas fa-external-link-alt" style="font-size:4rem;margin-bottom:20px;color:#667eea;"></i>
            <h2 style="font-size:1.8rem;margin-bottom:10px;">Open in External Browser</h2>
            <p style="font-size:1.1rem;opacity:0.8;margin-bottom:30px;">For the best experience, please open this link in your default browser</p>
            <button onclick="window.location.href='${window.location.href}'" style="padding:15px 30px;background:linear-gradient(135deg,#667eea,#764ba2);border:none;border-radius:10px;color:white;font-size:1.1rem;font-weight:600;cursor:pointer;">
                <i class="fas fa-arrow-right"></i> Open in Browser
            </button>
        `;
        document.body.appendChild(overlay);
        return true;
    }
    return false;
}

function showError(message) {
    document.querySelector('.container').innerHTML = `
        <div class="header">
            <div class="logo"><i class="fas fa-play-circle"></i><h1>Video Player</h1></div>
            <p class="subtitle">Stream your content seamlessly</p>
        </div>
        <div class="state-message">
            <div class="state-icon error"><i class="fas fa-exclamation-triangle"></i></div>
            <div class="state-content">
                <h1>Oops!</h1>
                <p>${message}</p>
                <a href="/" class="btn"><i class="fas fa-home"></i>Back to Home</a>
            </div>
        </div>
    `;
}

function showEmptyState() {
    document.querySelector('.container').innerHTML = `
        <div class="header">
            <div class="logo"><i class="fas fa-play-circle"></i><h1>Video Player</h1></div>
            <p class="subtitle">Stream your content seamlessly</p>
        </div>
        <div class="state-message">
            <div class="state-icon"><i class="fas fa-film"></i></div>
            <div class="state-content">
                <h1>No Video Selected</h1>
                <p>Please use a valid video link from the bot to start streaming your content.</p>
            </div>
        </div>
        <div class="features-grid">
            <div class="feature-card"><div class="feature-icon"><i class="fas fa-bolt"></i></div><h3>Lightning Fast</h3><p>Experience ultra-fast streaming with adaptive quality.</p></div>
            <div class="feature-card"><div class="feature-icon"><i class="fas fa-shield-alt"></i></div><h3>Secure Streaming</h3><p>Your content is delivered through secure connections.</p></div>
            <div class="feature-card"><div class="feature-icon"><i class="fas fa-mobile-alt"></i></div><h3>Multi-Device</h3><p>Watch on any device with full support.</p></div>
        </div>
    `;
}

function hideLoading() {
    const loading = document.getElementById('loading-indicator');
    if (loading) loading.style.display = 'none';
}

function showVideo() {
    const container = document.getElementById('video-container');
    if (container) container.style.display = 'block';
}

function detectStreamingFormat(url) {
    const urlLower = url.toLowerCase();
    if (urlLower.includes('.m3u8')) return { type: 'hls' };
    if (urlLower.includes('.mpd')) return { type: 'dash' };
    return { type: 'standard' };
}

// YouTube-like Double Tap Controls - FIXED VERSION
function addDoubleTapControls(videoElement, player) {
    const videoWrapper = videoElement.closest('.video-wrapper');
    if (!videoWrapper) return;
    
    // Create overlay container
    const overlay = document.createElement('div');
    overlay.className = 'double-tap-overlay';
    overlay.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        z-index: 100;
        pointer-events: auto;
    `;
    
    // Left and right tap zones
    const leftZone = document.createElement('div');
    leftZone.style.cssText = 'flex: 1; position: relative;';
    const rightZone = document.createElement('div');
    rightZone.style.cssText = 'flex: 1; position: relative;';
    
    // Tap indicators
    const leftIndicator = document.createElement('div');
    leftIndicator.className = 'tap-indicator tap-left';
    leftIndicator.innerHTML = '<i class="fas fa-undo"></i><span>10s</span>';
    
    const rightIndicator = document.createElement('div');
    rightIndicator.className = 'tap-indicator tap-right';
    rightIndicator.innerHTML = '<i class="fas fa-redo"></i><span>10s</span>';
    
    leftZone.appendChild(leftIndicator);
    rightZone.appendChild(rightIndicator);
    overlay.appendChild(leftZone);
    overlay.appendChild(rightZone);
    
    // Insert overlay before video element
    videoElement.parentElement.insertBefore(overlay, videoElement);
    
    // Double tap logic for both zones
    let lastTapTime = 0;
    let lastTapSide = null;
    const DOUBLE_TAP_DELAY = 300;
    
    function handleTap(side, event) {
        event.preventDefault();
        event.stopPropagation();
        
        const now = Date.now();
        const timeSinceLastTap = now - lastTapTime;
        
        // Check if this is a double tap
        if (timeSinceLastTap < DOUBLE_TAP_DELAY && lastTapSide === side) {
            // This is a double tap!
            if (side === 'left') {
                videoElement.currentTime = Math.max(0, videoElement.currentTime - 10);
                showTapFeedback(leftIndicator);
            } else {
                videoElement.currentTime = Math.min(videoElement.duration, videoElement.currentTime + 10);
                showTapFeedback(rightIndicator);
            }
            
            // Reset to prevent triple tap
            lastTapTime = 0;
            lastTapSide = null;
        } else {
            // First tap - just record it
            lastTapTime = now;
            lastTapSide = side;
            
            // Single tap toggles play/pause after delay
            setTimeout(() => {
                if (lastTapSide === side && Date.now() - lastTapTime >= DOUBLE_TAP_DELAY) {
                    player.togglePlay();
                }
            }, DOUBLE_TAP_DELAY);
        }
    }
    
    // Touch events (mobile)
    leftZone.addEventListener('touchend', (e) => handleTap('left', e), { passive: false });
    rightZone.addEventListener('touchend', (e) => handleTap('right', e), { passive: false });
    
    // Click events (desktop)
    leftZone.addEventListener('click', (e) => handleTap('left', e));
    rightZone.addEventListener('click', (e) => handleTap('right', e));
    
    // Prevent default touch behavior
    overlay.addEventListener('touchstart', (e) => {
        e.stopPropagation();
    }, { passive: true });
    
    function showTapFeedback(indicator) {
        indicator.classList.add('active');
        setTimeout(() => indicator.classList.remove('active'), 600);
    }
}

// Download and share buttons
function addDownloadShareButtons(videoUrl) {
    setTimeout(() => {
        const videoInfo = document.querySelector('.video-info');
        if (videoInfo && !document.querySelector('.action-buttons')) {
            const buttonSection = document.createElement('div');
            buttonSection.className = 'action-buttons';
            buttonSection.innerHTML = `
                <button class="action-btn download-btn"><i class="fas fa-download"></i><span>Download Video</span></button>
                <button class="action-btn share-btn"><i class="fas fa-share-alt"></i><span>Share</span></button>
            `;
            videoInfo.parentElement.appendChild(buttonSection);
            
            buttonSection.querySelector('.download-btn').addEventListener('click', () => {
                const a = document.createElement('a');
                a.href = videoUrl;
                a.download = 'video_' + Date.now() + '.mp4';
                a.target = '_blank';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            });
            
            buttonSection.querySelector('.share-btn').addEventListener('click', async () => {
                if (navigator.share) {
                    try {
                        await navigator.share({ title: 'Watch Video', url: window.location.href });
                    } catch (err) {
                        copyToClipboard(window.location.href);
                    }
                } else {
                    copyToClipboard(window.location.href);
                }
            });
        }
    }, 1000);
}

function copyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    try {
        document.execCommand('copy');
    } catch (err) {}
    document.body.removeChild(textarea);
}

// Update buffer continuously
function updateBufferProgress(videoElement) {
    const bufferInfo = document.querySelector('.buffer-info');
    if (!bufferInfo) return;
    
    setInterval(() => {
        try {
            const buffered = videoElement.buffered;
            if (buffered.length > 0) {
                const bufferedEnd = buffered.end(buffered.length - 1);
                const duration = videoElement.duration;
                if (duration && duration > 0) {
                    const percentBuffered = Math.round((bufferedEnd / duration) * 100);
                    bufferInfo.textContent = `${percentBuffered}%`;
                }
            }
        } catch (e) {}
    }, 500);
}

function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
}

// Initialize player
function initPlayer(videoUrl) {
    const videoElement = document.getElementById('video');
    const format = detectStreamingFormat(videoUrl);
    
    const playerConfig = {
        controls: ['play-large', 'restart', 'rewind', 'play', 'fast-forward', 'progress', 'current-time', 'duration', 'mute', 'volume', 'settings', 'pip', 'airplay', 'fullscreen'],
        settings: ['quality', 'speed', 'loop'],
        speed: { selected: 1, options: [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2] },
        tooltips: { controls: true, seek: true },
        keyboard: { focused: true, global: true },
        fullscreen: { enabled: true, fallback: true, iosNative: true },
        ratio: '16:9',
        hideControls: true,
        clickToPlay: false, // Disable default click to play
        resetOnEnd: false
    };
    
    if (format.type === 'hls') {
        if (Hls.isSupported()) {
            const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90,
                maxBufferLength: 30,
                maxMaxBufferLength: 600
            });
            
            hls.loadSource(videoUrl);
            hls.attachMedia(videoElement);
            
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                hideLoading();
                showVideo();
                const player = new Plyr(videoElement, playerConfig);
                setupPlayerFeatures(player, videoElement, videoUrl);
            });
            
            hls.on(Hls.Events.ERROR, (event, data) => {
                if (data.fatal) showError('Failed to load video stream.');
            });
        } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
            videoElement.src = videoUrl;
            videoElement.addEventListener('loadedmetadata', () => {
                hideLoading();
                showVideo();
                const player = new Plyr(videoElement, playerConfig);
                setupPlayerFeatures(player, videoElement, videoUrl);
            });
        } else {
            showError('HLS streaming not supported in this browser.');
        }
    } else {
        videoElement.src = videoUrl;
        videoElement.addEventListener('loadedmetadata', () => {
            hideLoading();
            showVideo();
            const player = new Plyr(videoElement, playerConfig);
            setupPlayerFeatures(player, videoElement, videoUrl);
        });
    }
    
    videoElement.addEventListener('error', () => {
        showError('Failed to load video. The link may have expired.');
    });
}

function setupPlayerFeatures(player, videoElement, videoUrl) {
    // Add double tap controls with player reference
    addDoubleTapControls(videoElement, player);
    addDownloadShareButtons(videoUrl);
    updateBufferProgress(videoElement);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        if (e.ctrlKey || e.altKey || e.metaKey) return;
        
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
            case 'arrowup':
                e.preventDefault();
                player.volume = Math.min(1, player.volume + 0.1);
                break;
            case 'arrowdown':
                e.preventDefault();
                player.volume = Math.max(0, player.volume - 0.1);
                break;
        }
    });
    
    // Save video position
    const videoId = new URLSearchParams(window.location.search).get('file');
    if (videoId) {
        const savedPosition = localStorage.getItem(`video_pos_${videoId}`);
        if (savedPosition && parseFloat(savedPosition) > 0) {
            videoElement.currentTime = parseFloat(savedPosition);
        }
        setInterval(() => {
            if (!videoElement.paused && videoElement.currentTime > 0) {
                localStorage.setItem(`video_pos_${videoId}`, videoElement.currentTime);
            }
        }, 5000);
    }
    
    // Pause on tab hidden
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && !player.paused) player.pause();
    });
}

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    if (redirectToExternalBrowser()) return;
    const videoUrl = getVideoUrl();
    if (!videoUrl) {
        hideLoading();
        showEmptyState();
        return;
    }
    try {
        initPlayer(videoUrl);
    } catch (error) {
        console.error('Player init error:', error);
        showError('Failed to initialize video player. Please refresh and try again.');
    }
});

window.addEventListener('beforeunload', () => {
    const videoElement = document.getElementById('video');
    if (videoElement && !videoElement.paused) videoElement.pause();
});
