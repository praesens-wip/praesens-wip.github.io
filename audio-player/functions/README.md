# Netlify Functions

## get-bandcamp-stream

Serverless function that extracts streaming metadata from Bandcamp album/track URLs.

### API

**Endpoint:** `/.netlify/functions/get-bandcamp-stream`

**Query Parameters:**
- `url` (required) - Full Bandcamp album or track URL
  - Example: `https://sokkohai.bandcamp.com/album/alone-together`

### Response

**Success (200):**
```json
{
  "streamUrl": "https://stream.bandcamp.com/mp3/album/...",
  "duration": 180.5,
  "trackId": 1234567890,
  "albumId": 9876543210
}
```

**Missing URL (400):**
```json
{
  "error": "Missing url parameter"
}
```

**Metadata Not Found (404):**
```json
{
  "error": "Metadata not found"
}
```

**Server Error (500):**
```json
{
  "error": "Error description"
}
```

### Implementation Details

The function:
1. **Fetches** the Bandcamp page HTML
2. **Handles redirects** automatically (3xx responses)
3. **Extracts metadata** from two possible formats:
   - Modern: `data-tralbum="..."` attribute
   - Legacy: `var TralbumData = {...}` variable
4. **Decodes HTML entities** (`&quot;`, `&amp;`, `&lt;`, `&gt;`)
5. **Parses JSON** to extract track/album data
6. **Falls back to regex** if JSON parsing fails

### Usage in Frontend

```javascript
// Get stream data from Bandcamp link
const url = 'https://sokkohai.bandcamp.com/album/alone-together';
const response = await fetch(`/.netlify/functions/get-bandcamp-stream?url=${encodeURIComponent(url)}`);
const { streamUrl, duration, trackId, albumId } = await response.json();

// Use streamUrl to play the track
```

### Testing

```bash
npm test -- tests/bandcamp-stream.test.js
```

Tests cover:
- Missing URL parameter validation
- Metadata extraction from HTML
- HTML entity decoding
- Redirect handling
- Error responses
