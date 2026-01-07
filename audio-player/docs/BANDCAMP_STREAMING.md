# Bandcamp Streaming Integration

This document describes the Bandcamp streaming extraction system that powers the audio players in the collection.

## Overview

The system extracts playable streaming URLs and metadata from Bandcamp album/track URLs stored in collection content files. It consists of:

1. **Backend Netlify Function** - Extracts metadata from Bandcamp HTML
2. **Frontend Loader Script** - Fetches and attaches stream data to players
3. **Tests** - Comprehensive test coverage for both backend and frontend

## Architecture

```
Content (Bandcamp URL)
    ↓
HTML Template (creates div with data-url)
    ↓
Audio System (renders embed iframe)
    ↓
Stream Loader (fetches stream metadata)
    ↓
Custom Events (dispatches 'bandcamp-stream-loaded')
```

## Components

### 1. Netlify Function: `netlify/functions/get-bandcamp-stream.js`

**Purpose:** Serverless function that extracts streaming data from Bandcamp URLs

**Endpoint:** `/.netlify/functions/get-bandcamp-stream`

**Request:**
```
GET /.netlify/functions/get-bandcamp-stream?url=https://sokkohai.bandcamp.com/album/alone-together
```

**Response:**
```json
{
  "streamUrl": "https://stream.bandcamp.com/mp3/album/...",
  "duration": 180.5,
  "trackId": 1234567890,
  "albumId": 9876543210
}
```

**Implementation Details:**
- Fetches Bandcamp page HTML
- Extracts TralbumData from two formats:
  - Modern: `data-tralbum="..."` attribute
  - Legacy: `var TralbumData = {...}` variable
- Decodes HTML entities
- Parses JSON or falls back to regex extraction
- Handles redirects automatically

### 2. Frontend Loader: `static/js/bandcamp-stream-loader.js`

**Purpose:** Frontend script that loads and attaches stream metadata to players

**Features:**
- Automatically detects all Bandcamp players on page
- Fetches stream data from Netlify function
- Attaches data attributes to player elements
- Dispatches custom events for other scripts to listen

**Usage:**
```javascript
// Data is automatically loaded and attached
const player = document.querySelector('.album-audio-player[data-type="bandcamp"]');

// Access stream data
console.log(player.getAttribute('data-stream-url')); // MP3 URL
console.log(player.getAttribute('data-duration'));   // Duration in seconds
console.log(player.getAttribute('data-track-id'));   // Track ID
console.log(player.getAttribute('data-album-id'));   // Album ID
```

**Custom Events:**
```javascript
// Listen for stream loaded event
document.addEventListener('bandcamp-stream-loaded', (event) => {
  console.log('Stream loaded:', event.detail.streamUrl);
});
```

### 3. Integration with Collection Content

**File:** `content/collection/{album-name}/index.md`

**Example:**
```toml
[album.links]
bandcamp = "https://sokkohai.bandcamp.com/album/alone-together"
```

**Template:** `layouts/collection/single.html`

Creates:
```html
<div class="album-audio-player" 
     data-type="bandcamp" 
     data-url="https://sokkohai.bandcamp.com/album/alone-together">
</div>
```

## File Structure

```
praesens-wip.github.io/
├── netlify/functions/
│   ├── get-bandcamp-stream.js      # Netlify function
│   └── README.md                    # API documentation
├── static/js/
│   ├── audio-system.js              # Renders iframes
│   ├── bandcamp-stream-loader.js   # Loads stream metadata
│   └── bootlegs.js                  # (placeholder)
├── tests/
│   ├── bandcamp-stream.test.js              # Backend tests
│   ├── bandcamp-stream-loader.test.js       # Frontend tests
│   ├── audio-system.test.js                 # Audio player tests
│   └── audio-system.dom.test.js             # DOM integration tests
└── BANDCAMP_STREAMING.md            # This file
```

## Testing

Run all tests:
```bash
npm test
```

Run specific test suite:
```bash
npm test -- tests/bandcamp-stream.test.js
npm test -- tests/bandcamp-stream-loader.test.js
```

**Test Coverage:**

Backend (`bandcamp-stream.test.js`):
- Missing URL parameter validation
- Metadata extraction from HTML
- HTML entity decoding
- Redirect handling
- Error responses

Frontend (`bandcamp-stream-loader.test.js`):
- API data fetching
- Null/error handling
- DOM attribute assignment
- Custom event dispatch
- Multiple players

## How It Works (Step-by-Step)

1. **Content Definition**
   - Album has Bandcamp URL in frontmatter
   - Example: `bandcamp = "https://sokkohai.bandcamp.com/album/alone-together"`

2. **Initial Render**
   - Hugo template creates `<div class="album-audio-player" data-url="..." data-type="bandcamp">`
   - `audio-system.js` renders Bandcamp embed iframe

3. **Stream Data Loading**
   - `bandcamp-stream-loader.js` initializes on page load
   - Detects all Bandcamp players
   - Fetches stream metadata from `/.netlify/functions/get-bandcamp-stream?url=...`

4. **Data Attachment**
   - Stream data attributes added to player element:
     - `data-stream-url` - Direct MP3 URL
     - `data-duration` - Track duration
     - `data-track-id` - Bandcamp track ID
     - `data-album-id` - Bandcamp album ID

5. **Event Dispatch**
   - Dispatches `bandcamp-stream-loaded` custom event
   - Other scripts can listen and react (e.g., player controls)

## Error Handling

| Scenario | Behavior |
|----------|----------|
| Missing `url` parameter | Returns 400 error |
| Metadata not found in HTML | Returns 404 error |
| Network error | Returns 500 error |
| API fetch fails | Logs error, continues without stream URL |
| Player has no `data-url` | Skips player silently |

## Performance Considerations

- **Lazy Loading**: Stream data fetched only when needed
- **Parallel Fetches**: Multiple players load their data simultaneously
- **Fallback**: Players work without stream data (embed iframe still visible)
- **Caching**: Browser caches function responses

## Security

- **CORS**: All responses include `Access-Control-Allow-Origin: *`
- **HTML Entity Decoding**: Prevents injection attacks
- **No User Input**: URLs from content files, not user input

## Future Enhancements

- [ ] Add SoundCloud stream extractor
- [ ] Cache stream metadata in local storage
- [ ] Create native audio player using extracted stream URLs
- [ ] Add playback progress tracking
- [ ] Implement download functionality
- [ ] Add analytics/tracking

## Debugging

To debug stream extraction:

1. Open browser DevTools
2. Go to Network tab
3. Filter for `get-bandcamp-stream` requests
4. Check response body for `streamUrl`, `trackId`, etc.

Or check DOM:
```javascript
const player = document.querySelector('.album-audio-player[data-type="bandcamp"]');
console.log({
  url: player.dataset.url,
  streamUrl: player.dataset.streamUrl,
  duration: player.dataset.duration,
  trackId: player.dataset.trackId,
  albumId: player.dataset.albumId
});
```

## References

- [Bandcamp](https://bandcamp.com)
- [Netlify Functions](https://docs.netlify.com/functions/overview/)
- [Custom Events API](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent)
