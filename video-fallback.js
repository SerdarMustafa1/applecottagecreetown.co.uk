/**
 * Video Source Fallback Handler
 * 
 * This script provides fallback functionality for 360° videos:
 * 1. Tries CDN URLs first for production
 * 2. Falls back to local files for development
 * 3. Shows error message if neither works
 */

function initializeVideoFallbacks() {
  const videos = document.querySelectorAll('video[data-src]');
  
  videos.forEach(video => {
    const cdnUrl = video.getAttribute('data-src');
    const localUrl = cdnUrl.replace('https://d1t6lpjdsu4646.cloudfront.net/videos/interior/', '360-source/');
    
    // Create a test video element to check if CDN is available
    const testVideo = document.createElement('video');
    testVideo.preload = 'metadata';
    
    // Try CDN first
    testVideo.src = cdnUrl;
    
    testVideo.addEventListener('loadedmetadata', () => {
      // CDN working, use original source
      video.src = cdnUrl;
      console.log(`✅ Using CDN for ${cdnUrl}`);
    });
    
    testVideo.addEventListener('error', () => {
      // CDN failed, try local
      console.log(`⚠️  CDN failed for ${cdnUrl}, trying local fallback`);
      
      const testLocal = document.createElement('video');
      testLocal.preload = 'metadata';
      testLocal.src = localUrl;
      
      testLocal.addEventListener('loadedmetadata', () => {
        video.src = localUrl;
        console.log(`✅ Using local fallback for ${localUrl}`);
      });
      
      testLocal.addEventListener('error', () => {
        console.error(`❌ Both CDN and local failed for ${cdnUrl}`);
        // Show error state
        const container = video.closest('.tour-item');
        if (container) {
          const errorMsg = document.createElement('div');
          errorMsg.className = 'video-error';
          errorMsg.innerHTML = `
            <div style="
              background: #fee; 
              border: 1px solid #fcc; 
              padding: 1rem; 
              border-radius: 6px; 
              text-align: center;
            ">
              <p><strong>Video temporarily unavailable</strong></p>
              <p style="font-size: 0.9em; color: #666;">
                We're working to restore the 360° tour for this room.
              </p>
            </div>
          `;
          container.appendChild(errorMsg);
        }
      });
    });
  });
}

// Initialize fallbacks when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeVideoFallbacks);
} else {
  initializeVideoFallbacks();
}
