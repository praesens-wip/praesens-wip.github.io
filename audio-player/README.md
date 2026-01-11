# Audio Player Module

Bandcamp and SoundCloud streaming integration for Präsens music collection.

## Quick Start

- **Adding an album?** → See [`docs/BANDCAMP_QUICK_START.md`](docs/BANDCAMP_QUICK_START.md)
- **Understanding how it works?** → See [`docs/BANDCAMP_STREAMING.md`](docs/BANDCAMP_STREAMING.md)
- **Looking for something?** → See [`docs/INDEX.md`](docs/INDEX.md)

## Overview

This module provides:
- **Bandcamp stream extraction** via serverless function
- **Audio player rendering** with metadata display
- **Automatic player initialization** on collection pages
- **Comprehensive test coverage** (18/18 tests passing ✅)

## Key Components

| File | Purpose |
|------|---------|
| `js/audio-system.js` | Renders Bandcamp iframe with numeric album ID |
| `js/bandcamp-stream-loader.js` | Fetches metadata and initializes player |
| `functions/get-bandcamp-stream.js` | Backend: extracts stream data from Bandcamp |
| `tests/` | Comprehensive test suites (all passing) |

## Critical Feature: Numeric Album IDs

**Bandcamp embeds REQUIRE numeric album IDs** to work properly. Using URL slugs causes "not available" errors.

- ❌ Wrong: `album=selected-works-1979-to-1983`
- ✅ Correct: `album=1899039788`

The backend function extracts numeric IDs from Bandcamp HTML and returns them as `numericAlbumId`. The frontend stream loader then uses this to trigger player rendering.

See [`docs/BANDCAMP_STREAMING.md`](docs/BANDCAMP_STREAMING.md) for technical details.

## Testing

```bash
# Run all tests
npm test

# Run only audio-player tests
npm test -- audio-player/tests/

# Run specific test
npm test -- audio-player/tests/audio-system.test.js
```

All tests passing: ✅ 18/18

## File Structure

```
audio-player/
├── js/
│   ├── audio-system.js              Renders iframes
│   └── bandcamp-stream-loader.js   Fetches metadata
├── functions/
│   ├── get-bandcamp-stream.js      Backend extractor
│   └── README.md                   API documentation
├── tests/
│   ├── audio-system.test.js
│   ├── audio-system.dom.test.js
│   ├── bandcamp-stream.test.js
│   └── bandcamp-stream-loader.test.js
├── docs/
│   ├── INDEX.md                    Quick navigation
│   ├── BANDCAMP_QUICK_START.md     User guide
│   └── BANDCAMP_STREAMING.md       Technical guide
└── README.md                        This file
```

## Development

Edit source files in `audio-player/js/` and `audio-player/functions/` directly. 

Files are automatically:
- Copied to `static/audio-player/js/` for Hugo serving
- Symlinked to `netlify/functions/` for Netlify deployment

## Deployment

No manual steps required:
1. Edit files locally
2. Run tests: `npm test`
3. Push to GitHub
4. Netlify automatically deploys

## Recent Fixes (Jan 2026)

- ✅ Fixed "not available" error by requiring numeric album IDs
- ✅ Backend now validates numeric ID extraction
- ✅ Frontend stream loader passes numeric ID to player
- ✅ Audio system waits for numeric ID before rendering
- ✅ Changed player size from large (120px) to small (42px)

See [`BANDCAMP_FIX_SUMMARY.md`](../BANDCAMP_FIX_SUMMARY.md) for complete details.

## References

- [Bandcamp](https://bandcamp.com)
- [Netlify Functions](https://docs.netlify.com/functions/overview/)
- [Custom Events API](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent)

---

**Status**: ✅ Production-ready  
**Last Updated**: January 11, 2026  
**Tests**: 18/18 passing  
**Coverage**: Bandcamp extraction, player rendering, event dispatch
