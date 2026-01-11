# Audio Player Module

Bundled audio player system for the Präsens collection. Handles Bandcamp and SoundCloud streaming with metadata extraction.

## Directory Structure

```
audio-player/
├── js/                          # Frontend JavaScript files
│   ├── audio-system.js         # Renders embed iframes
│   └── bandcamp-stream-loader.js # Fetches stream metadata
├── functions/                   # Netlify serverless functions
│   ├── get-bandcamp-stream.js  # Extracts Bandcamp metadata
│   └── README.md               # API documentation
├── tests/                       # Test suites
│   ├── audio-system.test.js
│   ├── audio-system.dom.test.js
│   ├── bandcamp-stream.test.js
│   └── bandcamp-stream-loader.test.js
├── docs/                        # Documentation
│   ├── BANDCAMP_STREAMING.md   # Technical guide
│   └── BANDCAMP_QUICK_START.md # Quick reference
└── README.md                    # This file
```

## What's Inside

### JavaScript Files (`js/`)

**audio-system.js**
- Detects Bandcamp/SoundCloud links in collection pages
- Renders embed iframes directly into player divs
- Handles both album and track embeds
- Triggers on page load or DOM content loaded

**bandcamp-stream-loader.js**
- Fetches streaming metadata from Netlify function
- Attaches stream URLs and metadata to player elements
- Dispatches custom events for other scripts
- Graceful fallback if fetch fails

### Netlify Functions (`functions/`)

**get-bandcamp-stream.js**
- Serverless function deployed to Netlify
- Extracts streaming URLs from Bandcamp pages
- Returns: stream URL, duration, track ID, album ID
- Handles HTML parsing, redirects, fallbacks

See `functions/README.md` for API details.

### Tests (`tests/`)

Run all tests:
```bash
npm test
```

Run specific test:
```bash
npm test -- audio-player/tests/audio-system.test.js
```

**Test Coverage**
- Audio system rendering (unit + DOM tests)
- Bandcamp metadata extraction (unit + integration)
- Stream loader functionality (fetch, events, error handling)
- Redirect and HTML entity handling

### Documentation (`docs/`)

**BANDCAMP_STREAMING.md**
- Technical architecture overview
- Component descriptions
- How it works (step-by-step)
- Error handling guide
- Debugging tips

**BANDCAMP_QUICK_START.md**
- How to add new albums
- File setup instructions
- Testing locally
- Troubleshooting guide

## Integration Points

### In Templates
Files loaded in `layouts/baseof.html`:
```html
<script src="{{ "audio-player/js/audio-system.js" | relURL }}"></script>
<script src="{{ "audio-player/js/bandcamp-stream-loader.js" | relURL }}"></script>
```

Copies deployed to:
- `static/audio-player/js/audio-system.js`
- `static/audio-player/js/bandcamp-stream-loader.js`

### In Content
Album content files (`content/collection/{album}/index.md`):
```toml
[album.links]
bandcamp = "https://artist.bandcamp.com/album/name"
```

### In Netlify
Configuration in `netlify.toml`:
```toml
[functions]
directory = "audio-player/functions"
```

## Development Workflow

1. **Edit** JavaScript files in `audio-player/js/`
2. **Run tests** to verify: `npm test`
3. **Update** documentation in `audio-player/docs/`
4. **Files are automatically served** from `static/audio-player/js/` (copies)
5. **Netlify function** accessible via symlink from `netlify/functions/`

## Adding New Audio Platforms

To add support for SoundCloud or other platforms:

1. Create `functions/get-soundcloud-stream.js` in this directory
2. Add symlink: `netlify/functions/get-soundcloud-stream.js`
3. Create loader: `js/soundcloud-stream-loader.js`
4. Add tests in `tests/`
5. Update templates to load new script
6. Add documentation

## Building for Production

Hugo automatically:
1. Compiles JavaScript from `audio-player/js/` to `static/audio-player/js/`
2. References them in HTML
3. Netlify deploys the functions

No additional build steps needed.

## Debugging

Enable debug logging in browser console:

```javascript
// Check what players are detected
console.log(document.querySelectorAll('.album-audio-player'));

// Check if stream data loaded
const player = document.querySelector('.album-audio-player[data-type="bandcamp"]');
console.log(player.dataset);

// Listen for stream loaded event
document.addEventListener('bandcamp-stream-loaded', (e) => {
  console.log('Stream loaded:', e.detail);
});
```

## Performance

- **Lazy loading**: Stream data fetched only when needed
- **Parallel loading**: Multiple players load simultaneously
- **Graceful degradation**: Players work even if stream extraction fails
- **No blocking**: Embed iframes render immediately

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- IE11: No (uses modern JavaScript)

## Dependencies

- **Node.js**: For testing and development
- **Hugo**: For static site generation
- **Netlify**: For serverless functions

No frontend dependencies required (vanilla JavaScript).

## Related Files

- `layouts/baseof.html` - Loads scripts
- `layouts/collection/single.html` - Album template
- `content/collection/*/index.md` - Album content
- `jest.config.js` - Test configuration
- `package.json` - Dependencies

## License

Part of Präsens project. See root LICENSE file.
