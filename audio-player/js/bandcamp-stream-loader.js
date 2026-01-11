/**
 * Bandcamp Stream Loader
 * Fetches streaming URLs from Bandcamp links in collection pages
 * and loads metadata (duration, track ID, album ID)
 */

async function loadBandcampStreamData(bandcampUrl) {
  if (!bandcampUrl) return null;

  try {
    const response = await fetch(
      `/.netlify/functions/get-bandcamp-stream?url=${encodeURIComponent(bandcampUrl)}`
    );

    if (!response.ok) {
      console.error(`Failed to fetch stream data: ${response.status}`);
      return null;
    }

    const data = await response.json();
    
    if (data.error) {
      console.error('Stream extraction error:', data.error);
      return null;
    }

    return {
      streamUrl: data.streamUrl,
      duration: data.duration,
      trackId: data.trackId,
      albumId: data.albumId,
      numericAlbumId: data.numericAlbumId,
      sourceUrl: bandcampUrl
    };
  } catch (error) {
    console.error('Error loading Bandcamp stream:', error);
    return null;
  }
}

/**
 * Initialize audio players for all album pages with Bandcamp links
 * This extends the audio-system.js functionality with stream URLs
 */
function initBandcampStreams() {
  const players = document.querySelectorAll('.album-audio-player[data-type="bandcamp"]');
  
  players.forEach(async (player) => {
    const bandcampUrl = player.getAttribute('data-url');
    if (!bandcampUrl) return;

    const streamData = await loadBandcampStreamData(bandcampUrl);
    
    if (streamData) {
      // Store stream data on the player element for potential use
      if (streamData.streamUrl) {
        player.setAttribute('data-stream-url', streamData.streamUrl);
      }
      if (streamData.duration) {
        player.setAttribute('data-duration', streamData.duration);
      }
      if (streamData.trackId) {
        player.setAttribute('data-track-id', streamData.trackId);
      }
      if (streamData.albumId) {
        player.setAttribute('data-album-id', streamData.albumId);
      }
      // Use numeric album ID for embed (highest priority)
      if (streamData.numericAlbumId) {
        player.setAttribute('data-album-id', streamData.numericAlbumId);
      }
      
      // Dispatch custom event for other scripts to listen
      const event = new CustomEvent('bandcamp-stream-loaded', {
        detail: streamData
      });
      player.dispatchEvent(event);
      document.dispatchEvent(event);
    }
  });
}

// Initialize when DOM is ready
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBandcampStreams);
  } else {
    initBandcampStreams();
  }
}

// Export for module usage
if (typeof module !== 'undefined') {
  module.exports = { loadBandcampStreamData, initBandcampStreams };
}
