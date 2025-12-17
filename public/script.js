// Enhanced Script.js - Fixed Video Player Logic
const BOT_API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:8080'
    : 'https://telegram-download-link-generator-6ds6.onrender.com';

// Anti-inspection protection (lighter version)
(function() {
    'use strict';
    
    // Only disable right-click on video element, not entire page
    document.addEventListener('DOMContentLoaded', () => {
        const video = document.getElementById('video');
        if (video) {
            video.addEventListener('contextmenu', e => e.preventDefault());
        }
    });
    
    // Disable keyboard shortcuts for inspect
    document.addEventListener('keydown', e => {
        // Allow controls to work, only block inspect shortcuts
        if (e.key === 'F12' || 
            (e.ctrlKey && e.shiftKey && e.key === 'I') ||
            (e.ctrlKey && e.key === 'u')) {
            e.preventDefault();
            return false;
        }
    });
    
    // Disable text selection only on video
    document.addEventListener('DOMContentLoaded', () => {
        const video = document.getElementById('video');
        if (video) {
            video.style.userSelect = 'none';
            video.style.webkitUserSelect = 'none';
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

function hideLoading() {
    const loading = document.getElementById('loading-indicator');
    if (loading) {
        loading.style.display = 'none';
    }
}

function showVideo() {
    const container = document.getElementById('video-container');
    if (container) {
        container.style.display = 'block';
    }
}

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
            const rect = overlay.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const width = rect.width;
            
            if (x < width / 2) {
                videoElement.currentTime = Math.max(0, videoElement.currentTime - 10);
                showTapFeedback('left');
            } else {
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

// Add download and share buttons
function addDownloadShareButtons(videoUrl) {
    setTimeout(() => {
        const videoInfo = document.querySelector('.video-info');
        if (videoInfo && !document.querySelector('.action-buttons')) {
            const buttonSection = document.createElement('div');
            buttonSection.className = 'action-buttons';
            buttonSection.innerHTML = `
                <button class="action-btn download-btn">
                    <i class="fas fa-download"></i>
                    <span>Download Video</span>
                </button>
                <button class="action-btn share-btn">
                    <i class="fas fa-share-alt"></i>
                    <span>Share</span>
                </button>
            `;
            
            videoInfo.parentElement.appendChild(buttonSection);
            
            // Download handler
            const downloadBtn = buttonSection.querySelector('.download-btn');
            downloadBtn.addEventListener('click', () => {
                const a = document.createElement('a');
                a.href = videoUrl;
                a.download = 'video_' + Date.now() + '.mp4';
                a.target = '_blank';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                showNotification('Download started!', 'success');
            });
            
            // Share handler
            const shareBtn = buttonSection.querySelector('.share-btn');
            shareBtn.addEventListener('click', async () => {
                if (navigator.share) {
                    try {
                        await navigator.share({
                            title: 'Watch Video',
                            text: 'Check out this video!',
                            url: window.location.href
                        });
                    } catch (err) {
                        if (err.name !== 'AbortError') {
                            copyToClipboard(window.location.href);
                        }
                    }
                } else {
                    copyToClipboard(window.location.href);
                }
            });
        }
    }, 1000);
}

function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            showNotification('Link copied to clipboard!', 'success');
        }).catch(() => {
            fallbackCopyToClipboard(text);
        });
    } else {
        fallbackCopyToClipboard(text);
    }
}

function fallbackCopyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
        document.execCommand('copy');
        showNotification('Link copied!', 'success');
    } catch (err) {
        showNotification('Failed to copy', 'error');
    }
    
    document.body.removeChild(textarea);
}

function showNotification(message, type = 'info') {
    // Only show for user actions (download, share, copy)
    // Don't show for automatic events
    if (message.includes('ready') || message.includes('Buffering') || message.includes('Resumed')) {
        return; // Skip these notifications
    }
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 100);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Update buffer continuously (no notifications)
function updateBufferProgress(videoElement) {
    const bufferInfo = document.querySelector('.buffer-info');
    if (!bufferInfo) return;
    
    let lastBufferPercent = 0;
    
    setInterval(() => {
        try {
            const buffered = videoElement.buffered;
            if (buffered.length > 0) {
                const bufferedEnd = buffered.end(buffered.length - 1);
                const duration = videoElement.duration;
                if (duration && duration > 0) {
                    const percentBuffered = Math.round((bufferedEnd / duration) * 100);
                    bufferInfo.textContent = `${percentBuffered}%`;
                    lastBufferPercent = percentBuffered;
                }
            }
        } catch (e) {
            // Silently ignore errors
        }
    }, 500);
}

// Initialize video player
function initPlayer(videoUrl) {
    const videoElement = document.getElementById('video');
    const format = detectStreamingFormat(videoUrl);
    
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
        settings: ['quality', 'speed', 'loop'],
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
            iosNative: true
        },
        ratio: '16:9',
        autoplay: false,
        seekTime: 10,
        volume: 1,
        clickToPlay: true,
        hideControls: true,
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
            
            hls.on(Hls.Events.MANIFEST_PARSED, function(event, data) {
                hideLoading();
                showVideo();
                
                const player = new Plyr(videoElement, playerConfig);
                setupPlayerFeatures(player, videoElement, videoUrl);
            });
            
            hls.on(Hls.Events.ERROR, function(event, data) {
                if (data.fatal) {
                    showError('Failed to load video stream. The link may have expired.');
                }
            });
            
        } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
            videoElement.src = videoUrl;
            
            videoElement.addEventListener('loadedmetadata', function() {
                hideLoading();
                showVideo();
                const player = new Plyr(videoElement, playerConfig);
                setupPlayerFeatures(player, videoElement, videoUrl);
            });
        } else {
            showError('HLS streaming is not supported in this browser.');
        }
    } else {
        videoElement.src = videoUrl;
        
        videoElement.addEventListener('loadedmetadata', function() {
            hideLoading();
            showVideo();
            const player = new Plyr(videoElement, playerConfig);
            setupPlayerFeatures(player, videoElement, videoUrl);
        });
    }
    
    videoElement.addEventListener('error', function(e) {
        showError('Failed to load video. The link may have expired or the format is not supported.');
    });
}

function setupPlayerFeatures(player, videoElement, videoUrl) {
    addDoubleTapControls(videoElement, player);
    addDownloadShareButtons(videoUrl);
    updateBufferProgress(videoElement);
    
    // Keyboard shortcuts (only when not typing)
    document.addEventListener('keydown', (e) => {
        // Ignore if typing in input fields
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        
        // Ignore if modifier keys are pressed (for browser shortcuts)
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
        }
    });
    
    // Save position (silently, no notifications)
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
    
    // Pause when tab hidden (no notification)
    document.addEventListener('visibilitychange', function() {
        if (document.hidden && !player.paused) {
            player.pause();
        }
    });
    
    // Remove any "Player ready" or "Buffering complete" notifications
    player.on('ready', () => {
        console.log('Player ready');
    });
    
    player.on('playing', () => {
        console.log('Playing');
    });
}

window.addEventListener('DOMContentLoaded', function() {
    if (redirectToExternalBrowser()) {
        return;
    }
    
    const videoUrl = getVideoUrl();
    
    if (!videoUrl) {
        hideLoading();
        showEmptyState();
        return;
    }
    
    try {
        initPlayer(videoUrl);
    } catch (error) {
        showError('Failed to initialize video player. Please refresh and try again.');
    }
});

window.addEventListener('beforeunload', function() {
    const videoElement = document.getElementById('video');
    if (videoElement && !videoElement.paused) {
        videoElement.pause();
    }
});
