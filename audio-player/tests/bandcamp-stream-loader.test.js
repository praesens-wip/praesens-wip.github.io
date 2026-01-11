// @jest-environment jsdom

const { loadBandcampStreamData, initBandcampStreams } = require('../js/bandcamp-stream-loader.js');

describe('Bandcamp Stream Loader', () => {
  beforeEach(() => {
    // Mock fetch
    global.fetch = jest.fn();
    
    // Clear DOM
    document.body.innerHTML = '';
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('loadBandcampStreamData', () => {
    it('should fetch stream data from the API', async () => {
      const mockData = {
        streamUrl: 'https://stream.bandcamp.com/track.mp3',
        duration: 180.5,
        trackId: 12345,
        albumId: 67890
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData
      });

      const url = 'https://sokkohai.bandcamp.com/album/alone-together';
      const result = await loadBandcampStreamData(url);

      expect(global.fetch).toHaveBeenCalledWith(
        `/.netlify/functions/get-bandcamp-stream?url=${encodeURIComponent(url)}`
      );
      
      expect(result).toEqual({
        streamUrl: mockData.streamUrl,
        duration: mockData.duration,
        trackId: mockData.trackId,
        albumId: mockData.albumId,
        sourceUrl: url
      });
    });

    it('should return null when URL is missing', async () => {
      const result = await loadBandcampStreamData(null);
      expect(result).toBeNull();
    });

    it('should return null when API returns error', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ error: 'Metadata not found' })
      });

      const result = await loadBandcampStreamData('https://test.bandcamp.com/album/test');
      expect(result).toBeNull();
    });

    it('should return null when fetch fails', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await loadBandcampStreamData('https://test.bandcamp.com/album/test');
      expect(result).toBeNull();
    });

    it('should handle HTTP error responses', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({})
      });

      const result = await loadBandcampStreamData('https://test.bandcamp.com/album/test');
      expect(result).toBeNull();
    });
  });

  describe('initBandcampStreams', () => {
    it('should load streams for all Bandcamp players', async () => {
      const mockData = {
        streamUrl: 'https://stream.bandcamp.com/track.mp3',
        duration: 180,
        trackId: 111,
        albumId: 222
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData
      });

      document.body.innerHTML = `
        <div class="album-audio-player" data-type="bandcamp" data-url="https://test.bandcamp.com/album/test">
          <iframe></iframe>
        </div>
      `;

      await initBandcampStreams();
      
      // Wait for async operations to complete
      await new Promise(r => setTimeout(r, 50));

      const player = document.querySelector('.album-audio-player');
      expect(player.getAttribute('data-stream-url')).toBe(mockData.streamUrl);
      expect(player.getAttribute('data-duration')).toBe(String(mockData.duration));
      expect(player.getAttribute('data-track-id')).toBe(String(mockData.trackId));
      expect(player.getAttribute('data-album-id')).toBe(String(mockData.albumId));
    });

    it('should dispatch custom event when stream is loaded', async () => {
      const mockData = {
        streamUrl: 'https://stream.bandcamp.com/track.mp3',
        duration: 200,
        trackId: 333,
        albumId: 444
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData
      });

      document.body.innerHTML = `
        <div class="album-audio-player" data-type="bandcamp" data-url="https://test.bandcamp.com/album/test">
          <iframe></iframe>
        </div>
      `;

      const eventListener = jest.fn();
      document.addEventListener('bandcamp-stream-loaded', eventListener);

      await initBandcampStreams();

      // Wait for async operations
      await new Promise(r => setTimeout(r, 100));

      expect(eventListener).toHaveBeenCalled();
      const event = eventListener.mock.calls[0][0];
      expect(event.detail.streamUrl).toBe(mockData.streamUrl);
    });

    it('should skip players without data-url', async () => {
      document.body.innerHTML = `
        <div class="album-audio-player" data-type="bandcamp">
          <iframe></iframe>
        </div>
      `;

      await initBandcampStreams();
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });
});
