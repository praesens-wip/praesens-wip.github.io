# Audio Player Module Structure

## File Organization

```
praesens-wip.github.io/
│
├── audio-player/                    ← MODULE DIRECTORY
│   ├── js/                         # Source JavaScript
│   │   ├── audio-system.js
│   │   └── bandcamp-stream-loader.js
│   ├── functions/                  # Netlify serverless functions
│   │   ├── get-bandcamp-stream.js
│   │   └── README.md
│   ├── tests/                      # Test suites
│   │   ├── audio-system.test.js
│   │   ├── audio-system.dom.test.js
│   │   ├── bandcamp-stream.test.js
│   │   └── bandcamp-stream-loader.test.js
│   ├── docs/                       # Module documentation
│   │   ├── BANDCAMP_STREAMING.md
│   │   └── BANDCAMP_QUICK_START.md
│   ├── README.md                   # Module overview
│   └── STRUCTURE.md               # This file
│
├── static/audio-player/           # Compiled/copied for deployment
│   └── js/
│       ├── audio-system.js         (copy of audio-player/js/)
│       └── bandcamp-stream-loader.js
│
├── netlify/functions/             # Netlify function links
│   └── get-bandcamp-stream.js → ../../audio-player/functions/get-bandcamp-stream.js
│
├── layouts/
│   ├── baseof.html                # Loads scripts from audio-player/
│   └── collection/
│       └── single.html            # Album page template
│
└── content/collection/            # Album content
    └── {album}/
        ├── index.md               # Has bandcamp link
        └── cover.*
```

## File Locations & Purposes

### Source Files (Development)

| Location | Purpose |
|----------|---------|
| `audio-player/js/` | Write and edit JavaScript here |
| `audio-player/functions/` | Backend extraction logic |
| `audio-player/tests/` | Test files for above |
| `audio-player/docs/` | Guides and documentation |

### Deployment Files (Build Output)

| Location | Purpose |
|----------|---------|
| `static/audio-player/js/` | Served to browsers (copied from audio-player/js/) |
| `netlify/functions/` | Deployed by Netlify (symlinks to audio-player/functions/) |

### Integration Files

| Location | Purpose |
|----------|---------|
| `layouts/baseof.html` | References scripts: `audio-player/js/*` |
| `layouts/collection/single.html` | Creates player divs with data attributes |
| `content/collection/*/index.md` | Contains bandcamp URLs |

## Data Flow

```
Content (Bandcamp URL in frontmatter)
    ↓
Hugo Template (creates <div data-url="...">)
    ↓
Browser loads page
    ↓
audio-system.js (renders embed iframe)
    ↓
bandcamp-stream-loader.js (fetches metadata)
    ↓
get-bandcamp-stream function (extracts from HTML)
    ↓
Stream data attached to player element
    ↓
Event dispatched for other scripts
```

## Build & Deployment

### Local Development

```
Edit → Tests → View in Hugo Dev Server
```

Files are served directly from:
- JavaScript: `/audio-player/js/` (served by Hugo)
- Tests: `npm test` (from audio-player/tests/)

### Deployment

1. **Push to GitHub** → GitHub Actions/Netlify webhook
2. **Hugo builds** → Copies files to static/
3. **Netlify deploys** → Functions read from netlify/functions/ (symlinks)
4. **Live on web** → Files served from static directory

## Editing Checklist

When modifying audio player code:

- [ ] Edit files in `audio-player/js/` or `audio-player/functions/`
- [ ] Run tests: `npm test`
- [ ] Update docs if changing behavior
- [ ] Push to GitHub (Hugo + Netlify auto-build)

DO NOT manually edit:
- ❌ `static/audio-player/js/` (will be overwritten)
- ❌ `netlify/functions/get-bandcamp-stream.js` (symlink to source)

## Testing Locations

Tests can be run from two places:

```bash
# All tests (including audio-player tests)
npm test

# Just audio-player tests
npm test -- audio-player/tests/
```

Test files are in `audio-player/tests/` but configured in root `jest.config.js`:
```js
testMatch: ['**/tests/**/*.test.js', 'audio-player/tests/**/*.test.js']
```

## Why This Structure?

✅ **Modularity** - All audio code in one place
✅ **Maintainability** - Easy to find related files
✅ **Testing** - Tests co-located with code
✅ **Documentation** - Docs for the whole module
✅ **Scalability** - Easy to add more audio platforms
✅ **Deployment** - Clear separation of source vs build output

## Common Tasks

### Add a new feature
1. Edit `audio-player/js/` or `audio-player/functions/`
2. Add tests in `audio-player/tests/`
3. Update `audio-player/docs/`

### Debug something
1. Check `audio-player/tests/` for test cases
2. See `audio-player/docs/BANDCAMP_STREAMING.md` for overview
3. Look at data flow above

### Support a new platform
1. Create `audio-player/functions/get-{platform}-stream.js`
2. Create `audio-player/js/{platform}-stream-loader.js`
3. Add tests and docs
4. Update templates

## File Sizes (Approximate)

- `audio-system.js`: ~1.3 KB
- `bandcamp-stream-loader.js`: ~2.4 KB
- `get-bandcamp-stream.js`: ~4.6 KB
- Tests: ~11 KB total
- Docs: ~10 KB total

Total module size: ~29 KB (source)
Deployed size: ~3.7 KB (minified JS)
