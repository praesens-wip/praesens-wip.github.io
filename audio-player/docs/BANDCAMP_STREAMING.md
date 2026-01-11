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
Stream Loader (fetches stream metadata from backend)
    ↓
Backend Function (extracts numeric album ID from Bandcamp HTML)
    ↓
Stream Loader (sets data-album-id with numeric ID)
    ↓
Audio System (waits for numeric ID, then renders iframe)
    ↓
Player (displays with play controls)
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
  "streamUrl": "https://t4.bcbits.com/stream/.../mp3-128/123456789",
  "duration": 300.5,
  "trackId": 123456789,
  "albumId": null,
  "numericAlbumId": "1899039788"
}
```

**Implementation Details:**
- **REQUIRED**: Extracts numeric album ID from Bandcamp HTML (returned as `numericAlbumId`)
- Fetches Bandcamp page HTML via HTTPS
- Extracts TralbumData from two formats:
  - Modern: `data-tralbum="..."` attribute (preferred)
  - Legacy: `var TralbumData = {...}` variable (fallback)
- Decodes HTML entities
- Parses JSON or falls back to regex extraction
- Handles HTTP redirects automatically
- Returns 404 if numeric album ID cannot be extracted (required for embeds)

### 2. Frontend Loader: `audio-player/js/bandcamp-stream-loader.js`

**Purpose:** Frontend script that fetches stream metadata and triggers player rendering

**Features:**
- Automatically detects all Bandcamp players on page
- Fetches stream data from Netlify function (including `numericAlbumId`)
- **Crucially**: Sets `data-album-id` with the numeric album ID
- Triggers audio-system.js to render the iframe
- Attaches data attributes to player elements (stream URL, duration, track ID)
- Dispatches custom events for other scripts to listen

**Usage:**
```javascript
// Data is automatically loaded and attached
const player = document.querySelector('.album-audio-player[data-type="bandcamp"]');

// Access stream data
console.log(player.getAttribute('data-album-id'));   // MUST be numeric ID (e.g., "1899039788")
console.log(player.getAttribute('data-stream-url')); // MP3 URL
console.log(player.getAttribute('data-duration'));   // Duration in seconds
console.log(player.getAttribute('data-track-id'));   // Bandcamp track ID
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
   - `audio-system.js` initializes and waits for numeric album ID to be set

3. **Stream Data Fetching**
   - `bandcamp-stream-loader.js` initializes on page load
   - Detects all Bandcamp players
   - Fetches stream metadata from `/.netlify/functions/get-bandcamp-stream?url=...`
   - **Backend extracts numeric album ID** from Bandcamp HTML (REQUIRED)

4. **Setting Numeric Album ID**
   - Stream loader receives `numericAlbumId` from backend
   - Sets `data-album-id` attribute with numeric ID (e.g., `"1899039788"`)
   - **This triggers audio-system.js to render the iframe**

5. **Player Rendering**
   - `audio-system.js` detects `data-album-id` is set
   - Renders Bandcamp embed iframe with numeric ID
   - iframe appears with player controls

6. **Data Attachment & Events**
   - Additional metadata attached to player element:
     - `data-stream-url` - Direct MP3 URL
     - `data-duration` - Track duration
     - `data-track-id` - Bandcamp track ID
   - Dispatches `bandcamp-stream-loaded` custom event
   - Other scripts can listen and react

## Error Handling

| Scenario | Behavior |
|----------|----------|
| Missing `url` parameter | Backend returns 400 error |
| Metadata/numeric ID not found | Backend returns 404 error (CRITICAL - player won't render) |
| Network error fetching Bandcamp | Backend returns 500 error |
| Stream loader fetch fails | Logs error, player stays hidden (waiting for numeric ID) |
| Player has no `data-url` | Stream loader skips it silently |
| Numeric album ID missing | Audio system won't render iframe (causes "not available" error) |

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

### Check if numeric album ID is set
```javascript
const player = document.querySelector('.album-audio-player[data-type="bandcamp"]');

// CRITICAL: This must be a number (not a slug!)
console.log('Numeric Album ID:', player.dataset.albumId);

// Check if iframe was rendered
console.log('Has iframe:', player.innerHTML.includes('iframe'));

// Full dataset
console.log('Player data:', player.dataset);
```

### Check backend response
1. Open browser DevTools → Network tab
2. Filter for `get-bandcamp-stream` requests
3. Click the request
4. Check **Response** tab:
   - Should include `numericAlbumId: "1234567890"` (all numbers)
   - Should include `streamUrl`, `duration`, `trackId`
   - If `numericAlbumId` is missing: player won't render

### Check if stream loader ran
```javascript
// Listen for the event
document.addEventListener('bandcamp-stream-loaded', (e) => {
  console.log('Stream loaded!', e.detail);
});
```

## References

- [Bandcamp](https://bandcamp.com)
- [Netlify Functions](https://docs.netlify.com/functions/overview/)
- [Custom Events API](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent)
