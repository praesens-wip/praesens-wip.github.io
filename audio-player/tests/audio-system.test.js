// @jest-environment jsdom

const { initAudioPlayers } = require('../js/audio-system.js');

describe('audio-system.js', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div class="album-audio-player" data-type="bandcamp" data-url="https://fugazi.bandcamp.com/album/instrument"></div>
      <div class="album-audio-player" data-type="soundcloud" data-url="https://soundcloud.com/fugazi/instrument"></div>
    `;
  });

  it('should render Bandcamp player iframe', () => {
    const bandcamp = document.querySelector('.album-audio-player[data-type="bandcamp"]');
    // Simulate stream loader setting the numeric album ID
    bandcamp.setAttribute('data-album-id', '1234567890');
    
    initAudioPlayers();
    expect(bandcamp.innerHTML).toMatch(/iframe/);
    expect(bandcamp.innerHTML).toMatch(/bandcamp.com\/EmbeddedPlayer/);
  });

  it('should render SoundCloud player iframe', () => {
    initAudioPlayers();
    const soundcloud = document.querySelector('.album-audio-player[data-type="soundcloud"]');
    expect(soundcloud.innerHTML).toMatch(/iframe/);
    expect(soundcloud.innerHTML).toMatch(/soundcloud.com\/player/);
  });

  it('should not render player for other types', () => {
    document.body.innerHTML += '<div class="album-audio-player" data-type="spotify" data-url="https://open.spotify.com/album/xyz"></div>';
    initAudioPlayers();
    const spotify = document.querySelector('.album-audio-player[data-type="spotify"]');
    expect(spotify.innerHTML).toBe('');
  });

  it('renders Bandcamp and SoundCloud players', () => {
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
});
