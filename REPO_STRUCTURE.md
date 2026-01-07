# Repository Structure Guide

Overview of how the repository is organized, with emphasis on the new audio-player module.

## Top-Level Organization

```
praesens-wip.github.io/
├── audio-player/           🎵 AUDIO PLAYER MODULE (NEW)
├── content/                📄 Content files
├── layouts/                🏗️  Hugo templates
├── static/                 📦 Static files
├── themes/                 🎨 Theme files
├── tests/                  ✅ Test files (legacy)
├── netlify/                ⚡ Netlify functions
├── assets/                 🎨 Asset sources
├── scripts/                🔧 Build scripts
└── config files            ⚙️ Configuration
```

## The Audio Player Module

```
audio-player/                                ⭐ NEW MODULE
│
├── js/                                      Frontend source code
│   ├── audio-system.js                     Renders Bandcamp/SoundCloud iframes
│   └── bandcamp-stream-loader.js           Fetches stream metadata
│
├── functions/                              Netlify serverless functions
│   ├── get-bandcamp-stream.js              Extracts Bandcamp stream URLs
│   └── README.md                           API documentation
│
├── tests/                                  Test suites
│   ├── audio-system.test.js                Unit tests for iframe rendering
│   ├── audio-system.dom.test.js            DOM integration tests
│   ├── bandcamp-stream.test.js             Backend function tests
│   └── bandcamp-stream-loader.test.js      Frontend loader tests
│
├── docs/                                   User & developer guides
│   ├── BANDCAMP_STREAMING.md               Technical architecture guide
│   └── BANDCAMP_QUICK_START.md             Quick reference for adding albums
│
├── README.md                               Module overview
├── STRUCTURE.md                            File organization details
├── INDEX.md                                Quick navigation guide
└── (source files stored here for maintenance)
```

## How Files Connect

### Content to Display Pipeline

```
content/collection/{album}/index.md
    ├─ Contains: bandcamp = "https://..."
    │
layouts/collection/single.html
    ├─ Creates: <div class="album-audio-player" data-type="bandcamp" data-url="...">
    │
static/audio-player/js/audio-system.js
    ├─ Renders: <iframe src="https://bandcamp.com/EmbeddedPlayer/...">
    │
static/audio-player/js/bandcamp-stream-loader.js
    ├─ Calls: /.netlify/functions/get-bandcamp-stream?url=...
    │
netlify/functions/get-bandcamp-stream.js → audio-player/functions/get-bandcamp-stream.js
    └─ Returns: {streamUrl, duration, trackId, albumId}
```

## File Locations By Purpose

### For Adding Album Content
```
content/collection/
└── my-album/
    ├── index.md          ← Edit this (add bandcamp link)
    └── cover.jpg         ← Add this (album artwork)
```

### For Modifying Audio Player Code
```
audio-player/
├── js/                   ← Edit JavaScript here
├── functions/            ← Edit backend here
└── tests/               ← Add tests here
```

### For Viewing in Browser
```
static/audio-player/js/  ← Files served to browsers
                            (auto-copied from audio-player/js/)
```

### For Netlify Deployment
```
netlify/functions/
└── get-bandcamp-stream.js ← Symlink to source
```

### For Documentation
```
audio-player/
├── README.md            ← Overview
├── STRUCTURE.md         ← Organization
├── INDEX.md             ← Quick index
├── docs/
│   ├── BANDCAMP_STREAMING.md      ← Technical guide
│   └── BANDCAMP_QUICK_START.md    ← User guide
└── functions/README.md  ← API docs
```

## Related Project Files

### Templates Using Audio Player
```
layouts/
├── baseof.html                      ← Loads audio-player scripts
├── collection/
│   └── single.html                 ← Creates player div
└── partials/
    └── header.html                 ← Navigation
```

### Configuration
```
jest.config.js                        ← Includes audio-player/tests/
config.toml                           ← Hugo config
package.json                          ← NPM dependencies
```

### Other Directories
```
assets/                              ← CSS/other assets
content/
├── collection/                      ← Album content
├── about/                           ← About pages
└── blog/                            ← Blog posts

static/
├── audio-player/                   ← Served JS files
├── fonts/                          ← Typography
├── images/                         ← Images
└── js/                             ← (legacy location)

themes/
└── typo/                           ← UI theme
```

## Development Workflow

### 1. View/Edit Album Content
```
content/collection/{album}/index.md
    ↓ (change bandcamp link)
    ↓ (Hugo reloads)
    ↓
layouts/collection/single.html (renders with new data)
```

### 2. Develop Audio Player Features
```
audio-player/js/*.js (edit source)
    ↓ (save)
    ↓ (Hugo detects change)
    ↓
static/audio-player/js/*.js (auto-copied)
    ↓ (browser reloads)
    ↓
View changes live
```

### 3. Test Changes
```
npm test (runs audio-player/tests/ + tests/)
    ↓
18/18 tests should pass
    ↓
Push to GitHub
    ↓
Netlify auto-deploys
```

## Key Paths for Different Users

### Content Creator
Adding a new album? Navigate to:
- 📖 [`audio-player/docs/BANDCAMP_QUICK_START.md`](audio-player/docs/BANDCAMP_QUICK_START.md)
- 📂 [`content/collection/`](content/collection/)

### Frontend Developer
Modifying audio player? Navigate to:
- 💻 [`audio-player/js/`](audio-player/js/)
- 📚 [`audio-player/README.md`](audio-player/README.md)
- 🧪 [`audio-player/tests/`](audio-player/tests/)

### Backend Developer
Working on stream extraction? Navigate to:
- ⚡ [`audio-player/functions/get-bandcamp-stream.js`](audio-player/functions/get-bandcamp-stream.js)
- 📖 [`audio-player/functions/README.md`](audio-player/functions/README.md)

### DevOps/Deployment
Deploying changes? Navigate to:
- ⚙️ [`netlify/functions/`](netlify/functions/) (auto-deployed via symlink)
- 📦 [`package.json`](package.json) (dependencies)
- 🏗️ [`config.toml`](config.toml) (Hugo config)

## Common File References

### Templates
- Load audio scripts: `layouts/baseof.html`
- Render players: `layouts/collection/single.html`

### Configuration
- Test setup: `jest.config.js`
- Hugo setup: `config.toml`

### Dependencies
- Node/NPM: `package.json`

### Git
- Build ignore: `.gitignore`
- Modules: `.gitmodules`

## Deployment Flow

```
Local Development
    ↓ (git push)
    ↓
GitHub Repository
    ↓ (webhook triggers)
    ↓
Netlify Build
    ├─ Hugo builds site
    │   ├─ Copies: audio-player/js/ → static/audio-player/js/
    │   └─ Renders: layouts/ with content/
    │
    └─ Deploy serverless functions
        └─ netlify/functions/get-bandcamp-stream.js (symlink to source)
    ↓ (build complete)
    ↓
Live on praesens-wip.github.io
```

## File Size Summary

| Directory | Size | Purpose |
|-----------|------|---------|
| `audio-player/` | ~29 KB | Source + docs + tests |
| `static/audio-player/js/` | ~3.7 KB | Deployed JS |
| `content/collection/` | ~5 KB | Album content |
| `layouts/` | ~15 KB | Templates |

## Quick Navigation

- **I want to...** 
  - Add an album → [`BANDCAMP_QUICK_START.md`](audio-player/docs/BANDCAMP_QUICK_START.md)
  - Understand the code → [`BANDCAMP_STREAMING.md`](audio-player/docs/BANDCAMP_STREAMING.md)
  - Understand the structure → [`STRUCTURE.md`](audio-player/STRUCTURE.md)
  - Find files → [`INDEX.md`](audio-player/INDEX.md)
  - Run tests → `npm test`
  - Start dev server → `hugo serve --buildDrafts`

---

**Generated**: January 7, 2026
**Status**: ✅ Complete & Tested
