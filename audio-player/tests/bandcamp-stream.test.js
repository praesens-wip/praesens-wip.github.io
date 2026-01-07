// Test for Bandcamp stream extractor
const https = require('https');

// Mock https for testing
jest.mock('https');

const handler = require('../functions/get-bandcamp-stream').handler;

describe('Bandcamp Stream Extractor', () => {
  
  it('should return 400 when url parameter is missing', async () => {
    const event = { queryStringParameters: {} };
    const result = await handler(event, {});
    
    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body).error).toContain('Missing url parameter');
  });

  it('should return 404 when metadata is not found', async () => {
    const mockGet = jest.fn((url, callback) => {
      const mockRes = {
        statusCode: 200,
        on: (event, cb) => {
          if (event === 'data') cb('<!-- no metadata here -->');
          if (event === 'end') cb();
        }
      };
      callback(mockRes);
      return { on: jest.fn() };
    });
    
    https.get = mockGet;
    
    const event = { queryStringParameters: { url: 'https://example.bandcamp.com/album/test' } };
    const result = await handler(event, {});
    
    expect(result.statusCode).toBe(404);
    expect(JSON.parse(result.body).error).toContain('Metadata not found');
  });

  it('should extract streaming data from data-tralbum attribute', async () => {
    const mockData = {
      trackinfo: [{ 
        id: 12345, 
        file: { "mp3-128": "https://stream.bandcamp.com/track.mp3" },
        duration: 180.5
      }],
      album_id: 67890
    };

    const jsonStr = JSON.stringify(mockData)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;');
    
    const html = `<div data-tralbum="${jsonStr}" />`;

    const mockGet = jest.fn((url, callback) => {
      const mockRes = {
        statusCode: 200,
        on: (event, cb) => {
          if (event === 'data') cb(html);
          if (event === 'end') cb();
        }
      };
      callback(mockRes);
      return { on: jest.fn() };
    });
    
    https.get = mockGet;
    
    const event = { queryStringParameters: { url: 'https://example.bandcamp.com/album/test' } };
    const result = await handler(event, {});
    
    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body.trackId).toBe(12345);
    expect(body.streamUrl).toBe('https://stream.bandcamp.com/track.mp3');
    expect(body.duration).toBe(180.5);
    expect(body.albumId).toBe(67890);
  });

  it('should handle redirect responses', async () => {
    const mockData = { 
      trackinfo: [{ 
        id: 111, 
        file: { "mp3-128": "https://stream.bandcamp.com/file.mp3" },
        duration: 200
      }]
    };
    
    const jsonStr = JSON.stringify(mockData)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;');
    
    const html = `<div data-tralbum="${jsonStr}" />`;

    let callCount = 0;
    const mockGet = jest.fn((url, callback) => {
      callCount++;
      if (callCount === 1) {
        // First call: return redirect
        const mockRes = {
          statusCode: 301,
          headers: { location: 'https://redirect.bandcamp.com/album/test' }
        };
        callback(mockRes);
      } else {
        // Second call: return actual data
        const mockRes = {
          statusCode: 200,
          on: (event, cb) => {
            if (event === 'data') cb(html);
            if (event === 'end') cb();
          }
        };
        callback(mockRes);
      }
      return { on: jest.fn() };
    });
    
    https.get = mockGet;
    
    const event = { queryStringParameters: { url: 'https://example.bandcamp.com/album/test' } };
    const result = await handler(event, {});
    
    expect(result.statusCode).toBe(200);
    expect(mockGet).toHaveBeenCalledTimes(2);
  });
});
