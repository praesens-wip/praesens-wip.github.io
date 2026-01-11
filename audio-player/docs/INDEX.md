# Audio Player Module - Quick Index

## 📚 Documentation

Start here based on what you need:

### For Users
- **Adding albums to collection?** → [`docs/BANDCAMP_QUICK_START.md`](docs/BANDCAMP_QUICK_START.md)
- **Need help?** → See "Troubleshooting" section in QUICK_START

### For Developers
- **Understanding the module?** → [`README.md`](README.md) (overview)
- **How does it work?** → [`docs/BANDCAMP_STREAMING.md`](docs/BANDCAMP_STREAMING.md) (technical)
- **Where are files?** → [`STRUCTURE.md`](STRUCTURE.md) (organization)
- **API docs?** → [`functions/README.md`](functions/README.md) (endpoints)

### For Contributors
- **Adding features?** → Start with [`README.md`](README.md)
- **Working on tests?** → See [`tests/`](tests/) directory
- **Extending for new platforms?** → See "Adding New Audio Platforms" in [`README.md`](README.md)

## 🗂️ File Structure

```
audio-player/
├── js/                              Source code
│   ├── audio-system.js             Renders embeds
│   └── bandcamp-stream-loader.js   Loads streams
├── functions/                       Backend APIs
│   ├── get-bandcamp-stream.js      Stream extractor
│   └── README.md                   API docs
├── tests/                          Test suites
│   ├── audio-system.test.js
│   ├── audio-system.dom.test.js
│   ├── bandcamp-stream.test.js
│   └── bandcamp-stream-loader.test.js
├── docs/                           User guides
│   ├── BANDCAMP_STREAMING.md       Technical guide
│   └── BANDCAMP_QUICK_START.md     Quick reference
├── README.md                        Module overview
├── STRUCTURE.md                     File organization
└── INDEX.md                         This file
```

## ⚡ Quick Commands

```bash
# Run all tests
npm test

# Run audio-player tests only
npm test -- audio-player/tests/

# Start development server
hugo serve --buildDrafts

# View specific test file
npm test -- audio-player/tests/audio-system.test.js
```

## 🎯 Common Tasks

### Add a New Album
1. Create: `content/collection/{album-slug}/index.md`
2. Include: Bandcamp link in `[album.links]` section
3. Add: Cover image as `cover.jpg`
4. Push to GitHub (auto-deploys)

See: [`docs/BANDCAMP_QUICK_START.md`](docs/BANDCAMP_QUICK_START.md) for detailed steps

### Debug Audio Player
1. Open DevTools (F12)
2. Go to Console tab
3. Run:
```javascript
const player = document.querySelector('.album-audio-player[data-type="bandcamp"]');
console.log(player.dataset);
```

See: "Debugging" in [`docs/BANDCAMP_STREAMING.md`](docs/BANDCAMP_STREAMING.md)

### Add Support for New Platform (e.g., SoundCloud)
1. Create: `functions/get-soundcloud-stream.js`
2. Create: `js/soundcloud-stream-loader.js`
3. Add tests in: `tests/`
4. Update: `layouts/baseof.html` to load new script

See: "Adding New Audio Platforms" in [`README.md`](README.md)

### Run Tests
```bash
# All tests
npm test

# Just this module
npm test -- audio-player/tests/

# Watch mode
npm test -- --watch
```

See: `tests/` directory for test files

## 📊 Test Coverage

- **Audio system**: 2 test files (8 tests)
  - Unit tests for iframe generation
  - DOM integration tests

- **Bandcamp stream**: 2 test files (10 tests)
  - Extraction logic
  - Frontend data loading
  - Error handling
  - Event dispatch

**Total**: 18 tests, all passing ✅

## 🔗 Integration Points

**Templates**: `layouts/baseof.html`
```html
<script src="{{ "audio-player/js/audio-system.js" | relURL }}"></script>
<script src="{{ "audio-player/js/bandcamp-stream-loader.js" | relURL }}"></script>
```

**Album Pages**: `layouts/collection/single.html`
```html
<div class="album-audio-player" 
     data-type="bandcamp" 
     data-url="{{ .Params.album.links.bandcamp }}">
</div>
```

**Content**: `content/collection/{album}/index.md`
```toml
[album.links]
bandcamp = "https://artist.bandcamp.com/album/name"
```

**Functions**: `netlify/functions/get-bandcamp-stream.js`
(symlink to `audio-player/functions/get-bandcamp-stream.js`)

## 📦 Deployment

### Local
- Files read from `audio-player/js/`, `audio-player/functions/`
- Tests run from `audio-player/tests/`
- Served by Hugo dev server

### Production
- JS copied to `static/audio-player/js/`
- Functions via symlink in `netlify/functions/`
- Netlify auto-deploys from GitHub

No manual steps required - everything is automatic!

## 💡 Tips

- Always run `npm test` before pushing
- Tests must pass in this order: audioSystem → bandcampStream → loaders
- Edit source files in `audio-player/js/` not in `static/`
- Documentation is auto-generated from code comments (see individual files)

## 🚀 Performance

- **JS size**: ~3.7 KB minified
- **Load time**: <100ms for both scripts
- **Stream fetch**: Lazy loaded when player encountered
- **Graceful fallback**: Works even if stream extraction fails

## 🔐 Security

- HTML entities properly decoded
- No user input in stream extractor
- CORS headers included in API responses
- Redirect handling prevents loops

## 📝 License

Part of Präsens project. See root LICENSE file.

---

**Last Updated**: January 11, 2026
**Status**: ✅ Fully functional and tested
**Tests**: 18/18 passing
**Bug Fix**: Numeric album ID requirement implemented (prevents "not available" errors)
