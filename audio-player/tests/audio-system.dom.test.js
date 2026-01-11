// @jest-environment jsdom

function loadScript(src) {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    document.head.appendChild(script);
  });
}

describe('audio-system.js DOM Player Integration', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div class="album-audio-player" data-type="bandcamp" data-url="https://fugazi.bandcamp.com/album/instrument"></div>
      <div class="album-audio-player" data-type="soundcloud" data-url="https://soundcloud.com/fugazi/instrument"></div>
    `;
  });

  it('renders Bandcamp and SoundCloud players', async () => {
    // Manually call the function since DOMContentLoaded won't fire in jest
    const { initAudioPlayers } = require('../js/audio-system.js');
    
    const bandcamp = document.querySelector('.album-audio-player[data-type="bandcamp"]');
    // Simulate stream loader setting the numeric album ID
    bandcamp.setAttribute('data-album-id', '1234567890');
    
    initAudioPlayers();
    
    expect(bandcamp.innerHTML).toMatch(/iframe/);
    expect(bandcamp.innerHTML).toMatch(/bandcamp.com\/EmbeddedPlayer/);
    const soundcloud = document.querySelector('.album-audio-player[data-type="soundcloud"]');
    expect(soundcloud.innerHTML).toMatch(/iframe/);
    expect(soundcloud.innerHTML).toMatch(/soundcloud.com\/player/);
  });

  it('does not render player for other types', async () => {
    document.body.innerHTML += '<div class="album-audio-player" data-type="spotify" data-url="https://open.spotify.com/album/xyz"></div>';
    const { initAudioPlayers } = require('../js/audio-system.js');
    initAudioPlayers();
    
    const spotify = document.querySelector('.album-audio-player[data-type="spotify"]');
    expect(spotify.innerHTML).toBe('');
  });
});
