# Präsens Website - Complete Specifications

**Project:** Präsens Music Community Website  
**Repository:** https://github.com/praesens-wip/praesens-wip.github.io  
**Status:** Production-ready  
**Last Updated:** January 11, 2026

---

## 1. Executive Summary

Präsens is a Hugo-based static website for a music community featuring:
- **Blog system** for sharing reflections and documenting events
- **Music collection** with album metadata and streaming integration
- **Audio players** supporting Bandcamp and SoundCloud embeds
- **Automated content creation** with Bandcamp and Discogs scrapers
- **Serverless backend** using Netlify Functions for stream extraction
- **GitHub Pages hosting** with automated CI/CD deployment

---

## 2. Technology Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| Static Site Generator | Hugo | v0.153.2+ |
| Theme | Typo | Custom fork |
| Hosting | GitHub Pages | - |
| CI/CD | GitHub Actions | - |
| Serverless Functions | Netlify Functions | Node.js 18+ |
| Frontend JavaScript | Vanilla JS | ES6+ |
| Testing Framework | Jest | 30.2.0 |
| Build Tool | Node.js | 18+ |
| Package Manager | npm | - |
| Runtime | Deno (scripts) | - |

---

## 3. Architecture Overview

### High-Level System Design

```
┌─────────────────────────────────────────────────────────┐
│                    GitHub Repository                     │
│                 (praesens-wip.github.io)                │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
        ▼            ▼            ▼
    ┌─────────┐ ┌──────────┐ ┌──────────────┐
    │  Hugo   │ │  Scripts │ │ Audio Player │
    │ Content │ │ (Python, │ │   Module     │
    │         │ │  Deno)   │ │              │
    └────┬────┘ └──────────┘ └──────────────┘
         │
         ├─────────────────────┐
         │                     │
         ▼                     ▼
    ┌──────────────┐   ┌─────────────────────┐
    │   Static     │   │  Netlify Functions  │
    │  Files (JS, │   │ (Stream Extraction) │
    │   CSS, etc)  │   │                     │
    └──────────────┘   └─────────────────────┘
         │                     │
         └──────────┬──────────┘
                    │
    ┌───────────────▼────────────────┐
    │   GitHub Pages + Netlify CDN   │
    │    (praesens-wip.github.io)    │
    └────────────────────────────────┘
```

### Data Flow: Album to Live

```
1. Content Creation
   └─ Python script scrapes Bandcamp/Discogs
   └─ Creates: content/collection/{slug}/index.md + cover.jpg

2. Hugo Build
   └─ Reads content files
   └─ Renders templates with metadata
   └─ Creates album pages with audio player divs

3. Browser Load
   └─ audio-system.js detects player divs
   └─ Renders Bandcamp/SoundCloud embed iframes

4. Stream Metadata Loading
   └─ bandcamp-stream-loader.js fetches metadata
   └─ Calls: /.netlify/functions/get-bandcamp-stream
   └─ Netlify function extracts stream URLs from Bandcamp HTML
   └─ Attaches data to player element
   └─ Dispatches custom event

5. Display Complete
   └─ Player shows with embed iframe
   └─ Stream URL available for custom players
```

---

## 4. Project Structure

### Root Directory Organization

```
praesens-wip.github.io/
├── .github/
│   └── workflows/
│       └── static.yml              # GitHub Actions deployment
├── audio-player/                   # Audio system module
│   ├── js/                         # Frontend scripts
│   ├── functions/                  # Netlify serverless functions
│   ├── tests/                      # Jest test suites
│   ├── docs/                       # Module documentation
│   ├── README.md
│   ├── STRUCTURE.md
│   └── INDEX.md
├── content/                        # Content files (Markdown)
│   ├── blog/                       # Blog posts
│   ├── collection/                 # Music albums
│   ├── about/                      # About page
│   └── _index.md                   # Homepage
├── layouts/                        # Hugo templates
│   ├── baseof.html                 # Base layout
│   ├── index.html                  # Homepage template
│   ├── _default/                   # Default templates
│   ├── blog/                       # Blog-specific templates
│   ├── collection/                 # Collection templates
│   ├── about/                      # About page template
│   └── partials/
│       ├── hooks/                  # Theme hooks
│       ├── header.html
│       ├── footer.html
│       └── ...
├── static/                         # Static assets
│   ├── fonts/                      # Custom fonts (Karima)
│   ├── images/                     # Static images
│   └── audio-player/               # Copied scripts (for deployment)
├── assets/                         # Hugo assets
│   └── css/
│       └── custom.css              # Custom styling
├── themes/typo/                    # Hugo theme
├── scripts/                        # Python/Deno scripts
│   ├── create_collection_entry_from_bandcamp.py
│   ├── create_collection_entry_from_discogs.py
│   └── ...
├── data/                           # YAML/TOML data files
├── archetypes/                     # Content templates
├── config.toml                     # Hugo configuration
├── netlify.toml                    # Netlify configuration
├── jest.config.js                  # Jest configuration
├── package.json                    # Node dependencies
└── README.md
```

---

## 5. Content Management

### 5.1 Blog Posts

**Location:** `content/blog/`

**Creating a Post:**
```bash
hugo new content blog/my-post.md
```

**Frontmatter Format:**
```toml
+++
title = "Post Title"
date = 2025-01-07
draft = false
description = "Post description"
+++

Post content in Markdown...
```

**Features:**
- Automatic date tracking
- Draft status control
- SEO metadata support
- Markdown formatting

---

### 5.2 Music Collection

**Location:** `content/collection/{album-slug}/`

**Manual Creation:**
```bash
hugo new content collection/album-name/index.md --kind collection
```

**Automated Creation from Bandcamp:**
```bash
uv run scripts/create_collection_entry_from_bandcamp.py https://artist.bandcamp.com/album/name
```

**Automated Creation from Discogs:**
```bash
# Without token (25 req/min)
uv run scripts/create_collection_entry_from_discogs.py https://www.discogs.com/release/123456

# With token (60 req/min)
export DISCOGS_TOKEN=your_token
uv run scripts/create_collection_entry_from_discogs.py https://www.discogs.com/release/123456 --youtube https://youtube.com/...
```

**Complete Frontmatter Structure:**
```toml
+++
title = "Album Title"
date = 2025-01-07
draft = false
description = "Album description"

[album]
artist = "Artist Name"
releaseYear = 2025
label = "Record Label"
catalogNumber = "CAT001"
genres = ["Genre1", "Genre2"]

[album.links]
bandcamp = "https://artist.bandcamp.com/album/name"
spotify = "https://open.spotify.com/album/..."
appleMusic = "https://music.apple.com/..."
youtube = "https://youtube.com/..."
soundcloud = "https://soundcloud.com/..."

[[album.tracklist]]
side = "Side A"
tracks = [
  "1. Track One",
  "2. Track Two",
  "3. Track Three"
]

[[album.tracklist]]
side = "Side B"
tracks = [
  "4. Track Four",
  "5. Track Five"
]

[[album.credits]]
section = "Performers"
people = [
  "Artist Name - vocals",
  "Other Person - guitar",
  "Third Person - bass"
]

[[album.credits]]
section = "Production"
people = [
  "Producer Name - production",
  "Engineer Name - recording"
]
+++

Album description and additional notes...
```

**Required Files:**
- `index.md` - Album metadata and content
- `cover.jpg` or `cover.png` - Album artwork (300x300px minimum)

**Automated Script Features:**

| Platform | Features |
|----------|----------|
| **Bandcamp** | Artist, title, tracklist, cover art, genres, credits, no auth required |
| **Discogs** | Artist, title, year, label, catalog number, genres, tracklist, credits, API required (optional) |

---

## 6. Audio Player Module

### 6.1 Overview

The audio player module handles streaming integration with Bandcamp and SoundCloud. It consists of:

1. **Frontend Scripts** - Render embed iframes and load metadata
2. **Netlify Functions** - Backend extraction logic
3. **Tests** - Comprehensive Jest test coverage
4. **Documentation** - Technical guides and quick start

### 6.2 Components

#### JavaScript Files

**Location:** `audio-player/js/`

**audio-system.js** (~1.3 KB)
- Initializes on DOM content loaded
- Detects `.album-audio-player` elements
- Renders Bandcamp/SoundCloud embed iframes
- Handles both player types
- Falls back to URL-based album slug if numeric ID unavailable
- Waits up to 2 seconds for stream loader to provide data

```javascript
renderBandcampEmbed(element)     // Renders iframe with album ID
initAudioPlayers()                // Main initialization function
```

**bandcamp-stream-loader.js** (~2.4 KB)
- Runs asynchronously after DOM load
- Fetches stream metadata from Netlify function
- Attaches data attributes to player elements
- Dispatches custom events for other scripts
- Graceful error handling

```javascript
loadBandcampStreamData(url)       // Fetches from /.netlify/functions/get-bandcamp-stream
initBandcampStreams()              // Initializes all players
// Dispatches: bandcamp-stream-loaded event
```

#### Netlify Functions

**Location:** `audio-player/functions/`

**get-bandcamp-stream.js** (~4.6 KB)
- Serverless Node.js function
- Deployed automatically by Netlify
- Extracts metadata from Bandcamp HTML pages
- Handles 3xx redirects automatically

**Request:**
```
GET /.netlify/functions/get-bandcamp-stream?url=https://artist.bandcamp.com/album/name
```

**Response:**
```json
{
  "streamUrl": "https://stream.bandcamp.com/mp3/album/...",
  "duration": 180.5,
  "trackId": 1234567890,
  "albumId": 9876543210,
  "numericAlbumId": "123456"
}
```

**Extraction Process:**
1. Fetches Bandcamp page HTML
2. Extracts TralbumData from:
   - Modern format: `data-tralbum="..."` attribute
   - Legacy format: `var TralbumData = {...}` JavaScript
3. Decodes HTML entities (`&quot;`, `&amp;`, `&lt;`, `&gt;`)
4. Parses JSON and extracts:
   - `streamUrl` - MP3-128 bitrate URL from trackinfo
   - `duration` - Track duration in seconds
   - `trackId` - Bandcamp track ID
   - `albumId` - Bandcamp album ID (from metadata)
   - `numericAlbumId` - Numeric ID for embed (from HTML)
5. Falls back to regex extraction if JSON parsing fails

### 6.3 Data Flow

```
Content File
  ├─ album.links.bandcamp = "https://..."
  └─ album.links.soundcloud = "https://..."
       │
       ▼
Hugo Template (collection/single.html)
  ├─ Renders: <div class="album-audio-player" data-type="bandcamp" data-url="..."></div>
  └─ Renders: <div class="album-audio-player" data-type="soundcloud" data-url="..."></div>
       │
       ▼
audio-system.js (on DOM load)
  ├─ Detects players
  ├─ Renders Bandcamp embed iframe
  └─ Renders SoundCloud embed iframe
       │
       ▼
bandcamp-stream-loader.js (after DOM load)
  ├─ Fetches /.netlify/functions/get-bandcamp-stream
  ├─ Attaches data to element:
  │  ├─ data-stream-url
  │  ├─ data-duration
  │  ├─ data-track-id
  │  └─ data-album-id
  └─ Dispatches: bandcamp-stream-loaded event
       │
       ▼
Player Complete
  ├─ Embed iframe visible
  ├─ Stream URL available
  └─ Metadata loaded
```

### 6.4 Integration Points

**Templates:** `layouts/baseof.html`
```html
<script src="{{ "audio-player/js/audio-system.js" | relURL }}"></script>
<script src="{{ "audio-player/js/bandcamp-stream-loader.js" | relURL }}"></script>
```

**Album Template:** `layouts/collection/single.html`
```html
{{ with .Params.album.links.bandcamp }}
  <div class="album-audio-player" data-type="bandcamp" data-url="{{ . }}"></div>
{{ end }}
{{ with .Params.album.links.soundcloud }}
  <div class="album-audio-player" data-type="soundcloud" data-url="{{ . }}"></div>
{{ end }}
```

**Netlify Config:** `netlify.toml`
```toml
[functions]
directory = "audio-player/functions"
```

### 6.5 Testing

**Location:** `audio-player/tests/`

**Test Files:**
- `audio-system.test.js` - Unit tests for iframe generation
- `audio-system.dom.test.js` - DOM integration tests
- `bandcamp-stream.test.js` - Backend function tests
- `bandcamp-stream-loader.test.js` - Frontend loader tests

**Run Tests:**
```bash
npm test                                    # All tests
npm test -- audio-player/tests/            # Just audio-player
npm test -- audio-player/tests/audio-system.test.js  # Specific file
npm test -- --watch                        # Watch mode
```

**Test Coverage:**
- Audio system iframe rendering (8 tests)
- Bandcamp metadata extraction (10 tests)
- Total: 18 tests, all passing ✅

---

## 7. Build & Deployment

### 7.1 Local Development

**Prerequisites:**
- Hugo v0.116.0+
- Node.js 18+
- Git

**Setup:**
```bash
git clone https://github.com/praesens-wip/praesens-wip.github.io.git
cd praesens-wip.github.io
```

**Start Development Server:**
```bash
hugo server --buildDrafts
# Opens at http://localhost:1313/
```

**Run Tests:**
```bash
npm test
```

**Run Netlify Dev:**
```bash
npm run dev
# Local Netlify environment
```

### 7.2 Production Build

**Hugo Build:**
```bash
hugo --gc --minify
# Output: ./public/
```

**Process:**
1. Hugo compiles Markdown → HTML
2. Processes templates with data
3. Minifies CSS/JavaScript
4. Copies assets to `public/`
5. Garbage collects unused files

### 7.3 Deployment Pipeline

**Trigger:** Push to `main` branch

**GitHub Actions Workflow:** `.github/workflows/static.yml`

**Steps:**
1. Installs Hugo
2. Runs `hugo --gc --minify`
3. Deploys to GitHub Pages
4. Netlify detects changes (via webhook)
5. Deploys Netlify functions
6. Serves via GitHub Pages + Netlify CDN

**Result:**
- Live at: https://praesens-wip.github.io/
- Functions at: /.netlify/functions/*
- CDN cached globally

---

## 8. Configuration

### 8.1 Hugo Configuration

**File:** `config.toml`

```toml
baseURL = 'https://praesens-wip.github.io/'
languageCode = 'en-us'
defaultContentLanguage = 'en-us'
title = 'Präsens'
theme = 'typo'

[params]
description = 'Music in presence - creating spaces where sound connects, resonates, and inspires'
copyright = '© 2025 Präsens Community'

[[params.menu]]
name = "collection"
url = "/collection"

[[params.menu]]
name = "blog"
url = "/blog"

[[params.menu]]
name = "about"
url = "/about"

[params.social]
email = 'praesens.wip@gmail.com'
```

**Key Parameters:**
- `baseURL` - Site root URL
- `theme` - Hugo theme to use
- `params.menu` - Navigation items
- `params.social` - Contact information

### 8.2 Netlify Configuration

**File:** `netlify.toml`

```toml
[functions]
directory = "audio-player/functions"
```

**Functions Deployment:**
- Directory: `audio-player/functions/`
- Runtime: Node.js 18+
- Endpoint: `/.netlify/functions/{filename}`

### 8.3 Jest Configuration

**File:** `jest.config.js`

```javascript
module.exports = {
  testEnvironment: 'jsdom',
  testMatch: [
    '**/tests/**/*.test.js',
    'audio-player/tests/**/*.test.js'
  ]
}
```

---

## 9. Styling

### 9.1 Custom CSS

**Location:** `assets/css/custom.css`

**Features:**
- Karima font for headings
- Homepage-specific styling
- Mobile responsive design
- Album page layout
- Collection grid

**Font Loading:** `layouts/partials/hooks/head_end.html`

### 9.2 Theme

**Theme:** Typo (custom fork)  
**Location:** `themes/typo/`

**Customization:**
- Custom templates in `layouts/`
- Override theme files
- Partial hooks for injecting content

---

## 10. Scripting

### 10.1 Bandcamp Script

**File:** `scripts/create_collection_entry_from_bandcamp.py`

**Features:**
- Scrapes Bandcamp album page
- Extracts metadata automatically
- Downloads cover art
- Creates Hugo content file

**Extracted Data:**
- Artist name
- Album title
- Track list
- Genres
- Credits
- Cover image

**No Dependencies:**
- Uses requests library only
- No authentication required
- Fast parsing with BeautifulSoup

### 10.2 Discogs Script

**File:** `scripts/create_collection_entry_from_discogs.py`

**Features:**
- Uses official Discogs API
- Extracts comprehensive metadata
- Downloads cover art
- Organizes by vinyl side
- Auto-extracts YouTube links

**Extracted Data:**
- Artist name
- Album title
- Release year
- Label & catalog number
- Genres
- Full tracklist with sides
- Credits (performers, engineers, etc.)
- Cover image

**Requirements:**
- Optional: DISCOGS_TOKEN for higher rate limits
- Rate limit: 25 req/min (60 with token)
- Free API access

---

## 11. Content Types

### 11.1 Album Content

**Archetype:** `archetypes/collection.md`

**Supported Fields:**
```toml
[album]
artist = "string"
releaseYear = "number"
label = "string"
catalogNumber = "string"
genres = ["array of strings"]

[album.links]
bandcamp = "URL"
spotify = "URL"
appleMusic = "URL"
youtube = "URL"
soundcloud = "URL"

[[album.tracklist]]
side = "string"
tracks = ["array of strings"]

[[album.credits]]
section = "string"
people = ["array of strings"]
```

### 11.2 Blog Posts

**Archetype:** `archetypes/default.md`

**Standard Hugo Fields:**
- `title` - Post title
- `date` - Publication date
- `draft` - Draft status
- `description` - SEO description

### 11.3 Pages

**Types:**
- About page
- Homepage
- Collection list
- Blog list

---

## 12. APIs & Integrations

### 12.1 Netlify Functions API

**Endpoint:** `/.netlify/functions/get-bandcamp-stream`

**Query Parameters:**
- `url` (required) - Full Bandcamp URL

**Response Format:**
```json
{
  "streamUrl": "string",
  "duration": "number",
  "trackId": "number",
  "albumId": "number",
  "numericAlbumId": "string"
}
```

**Error Responses:**
```json
{ "error": "Missing url parameter" }        // 400
{ "error": "Metadata not found" }           // 404
{ "error": "Error description" }            // 500
```

### 12.2 External APIs

**Discogs API:**
- Endpoint: https://api.discogs.com/
- Authentication: Optional token
- Rate limit: 25 req/min (60 with token)

**Bandcamp:**
- No official API
- HTML parsing via serverless function
- Metadata extraction from page data

---

## 13. Performance Characteristics

### 13.1 Metrics

| Metric | Value | Notes |
|--------|-------|-------|
| **JS Bundle Size** | ~3.7 KB | Minified audio player scripts |
| **Load Time** | <100ms | Both scripts combined |
| **Stream Fetch** | 200-500ms | Bandcamp metadata extraction |
| **Page Build Time** | <2s | Hugo development server |
| **Production Build** | <5s | Full site minification |

### 13.2 Optimization

**Frontend:**
- Lazy loading of stream metadata
- Parallel metadata fetches
- Graceful degradation if extraction fails
- Browser caching of function responses

**Backend:**
- Netlify function caching
- CDN distribution via GitHub Pages
- HTML parsing only when needed
- Redirect handling optimized

---

## 14. Security

### 14.1 Data Security

**No User Input:**
- All Bandcamp URLs from content files
- No user submissions or API inputs

**HTML Entity Decoding:**
- Prevents injection attacks
- Proper escaping of all data attributes

**CORS Headers:**
- Functions include `Access-Control-Allow-Origin: *`
- Safe cross-origin requests

### 14.2 Content Security

**Static Site:**
- No database
- No dynamic content generation
- All content in Git repository
- Signed commits recommended

**Netlify Functions:**
- Isolated execution environment
- No file system access
- HTTPS only
- Rate limiting on functions

---

## 15. Maintenance & Operations

### 15.1 Regular Tasks

**Weekly:**
- Monitor GitHub Actions logs
- Check Netlify function errors

**Monthly:**
- Review and update content
- Update dependencies: `npm update`
- Run full test suite

**Quarterly:**
- Update Hugo version if available
- Review and optimize CSS
- Check for security updates

### 15.2 Debugging

**Hugo Issues:**
```bash
hugo server -v              # Verbose output
hugo server --logVerbose    # Log everything
```

**JavaScript Issues:**
```javascript
// Check detected players
console.log(document.querySelectorAll('.album-audio-player'));

// Check stream data
const player = document.querySelector('[data-type="bandcamp"]');
console.log(player.dataset);

// Listen for events
document.addEventListener('bandcamp-stream-loaded', (e) => {
  console.log('Loaded:', e.detail);
});
```

**Function Issues:**
```bash
# Local testing
netlify dev
# Visit: http://localhost:8888/.netlify/functions/get-bandcamp-stream?url=...

# View logs
netlify logs --tail
```

### 15.3 Troubleshooting

| Issue | Solution |
|-------|----------|
| Player not showing | Check data-type and data-url attributes |
| Stream URL not loading | Check Bandcamp URL validity, may be password protected |
| Cover image missing | File must be `cover.jpg` in same directory as `index.md` |
| Function timeout | Bandcamp HTML parsing may be slow, increase timeout |
| Hugo build fails | Check TOML syntax, use `hugo server --logVerbose` |

---

## 16. Future Enhancements

**Planned Features:**
- [ ] SoundCloud stream extraction
- [ ] Local storage caching for stream metadata
- [ ] Custom audio player UI using extracted URLs
- [ ] Playback progress tracking
- [ ] Download functionality
- [ ] Analytics and tracking
- [ ] Comments system
- [ ] Social sharing features
- [ ] Dark mode toggle
- [ ] Multiple language support

**Technical Improvements:**
- [ ] TypeScript migration
- [ ] Component-based frontend
- [ ] Improved error boundaries
- [ ] Enhanced accessibility (a11y)
- [ ] Performance monitoring
- [ ] Automated performance testing

---

## 17. File Reference Guide

### Content Files

| Path | Purpose | Type |
|------|---------|------|
| `content/blog/*.md` | Blog posts | Markdown |
| `content/collection/*/index.md` | Album metadata | TOML frontmatter |
| `content/collection/*/cover.jpg` | Album artwork | Image |
| `content/about/index.md` | About page | Markdown |
| `content/_index.md` | Homepage | Markdown |

### Layout Files

| Path | Purpose |
|------|---------|
| `layouts/baseof.html` | Base template (all pages) |
| `layouts/index.html` | Homepage layout |
| `layouts/blog/list.html` | Blog listing |
| `layouts/collection/list.html` | Collection listing |
| `layouts/collection/single.html` | Album page |
| `layouts/about/list.html` | About page |
| `layouts/_default/single.html` | Default single page |
| `layouts/partials/header.html` | Header (all pages) |
| `layouts/partials/footer.html` | Footer (all pages) |

### Configuration Files

| Path | Purpose |
|------|---------|
| `config.toml` | Hugo site configuration |
| `netlify.toml` | Netlify deployment config |
| `jest.config.js` | Jest testing config |
| `.github/workflows/static.yml` | GitHub Actions workflow |
| `package.json` | Node.js dependencies |

### Audio Module Files

| Path | Purpose |
|------|---------|
| `audio-player/js/audio-system.js` | Iframe rendering |
| `audio-player/js/bandcamp-stream-loader.js` | Stream metadata loading |
| `audio-player/functions/get-bandcamp-stream.js` | Netlify function |
| `audio-player/tests/*.test.js` | Jest test suites |
| `audio-player/docs/*.md` | Module documentation |

### Script Files

| Path | Purpose | Language |
|------|---------|----------|
| `scripts/create_collection_entry_from_bandcamp.py` | Bandcamp scraper | Python |
| `scripts/create_collection_entry_from_discogs.py` | Discogs API integration | Python |

---

## 18. Development Workflow

### Standard Git Workflow

```bash
# 1. Create feature branch
git checkout -b feature/your-feature

# 2. Make changes
# Edit files, add content, etc.

# 3. Run tests
npm test

# 4. Test locally
hugo server --buildDrafts

# 5. Commit changes
git add .
git commit -m "feat: description of changes"

# 6. Push to GitHub
git push origin feature/your-feature

# 7. Create Pull Request
# Review changes on GitHub
# Merge when approved

# 8. Auto-deployment
# GitHub Actions triggers
# Hugo builds and deploys to GitHub Pages
# Netlify deploys functions
```

### Commit Convention

Uses Conventional Commits format:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `style:` - Formatting
- `refactor:` - Code restructure
- `test:` - Test changes
- `chore:` - Maintenance

---

## 19. Monitoring & Analytics

**Current Setup:**
- GitHub Actions logs for build status
- Netlify function logs and analytics
- Browser console for client-side errors

**Potential Additions:**
- Error tracking (Sentry, etc.)
- Performance monitoring (SpeedCurve, etc.)
- Analytics (Plausible, Fathom, etc.)

---

## 20. Glossary

| Term | Definition |
|------|-----------|
| **Hugo** | Static site generator that converts Markdown to HTML |
| **Theme** | Reusable collection of templates and styles (Typo) |
| **Frontmatter** | TOML/YAML metadata at top of content files |
| **Netlify Functions** | Serverless functions deployed by Netlify |
| **GitHub Pages** | Static site hosting by GitHub |
| **CDN** | Content Delivery Network for fast global distribution |
| **CORS** | Cross-Origin Resource Sharing for API requests |
| **API** | Application Programming Interface (endpoints) |
| **MD/Markdown** | Lightweight markup language for content |
| **TOML** | Configuration file format (Human-Friendly) |
| **Jest** | JavaScript testing framework |

---

## 21. Quick Start Checklist

### Add New Album
- [ ] Run Bandcamp/Discogs script OR manually create content
- [ ] Verify frontmatter has all required fields
- [ ] Add cover.jpg image
- [ ] Test locally: `hugo server`
- [ ] Push to GitHub
- [ ] Verify live at praesens-wip.github.io

### Add New Blog Post
- [ ] Run: `hugo new content blog/post-title.md`
- [ ] Edit frontmatter and content
- [ ] Set `draft = false`
- [ ] Test locally
- [ ] Push to GitHub

### Update Styling
- [ ] Edit `assets/css/custom.css`
- [ ] Test locally: `hugo server`
- [ ] Push to GitHub
- [ ] Verify changes live

### Fix Audio Player
- [ ] Edit files in `audio-player/js/` or `audio-player/functions/`
- [ ] Update tests in `audio-player/tests/`
- [ ] Run: `npm test`
- [ ] Push to GitHub
- [ ] Netlify auto-deploys functions

---

## 22. Contact & Support

**Project Email:** praesens.wip@gmail.com  
**Repository:** https://github.com/praesens-wip/praesens-wip.github.io  
**Live Site:** https://praesens-wip.github.io/

---

## Document Information

- **Version:** 1.0
- **Created:** January 11, 2026
- **Status:** Complete & Current
- **Maintainer:** Präsens Development Team
- **Last Review:** January 11, 2026

---

*This specification document comprehensively describes the Präsens website architecture, components, processes, and operations. It serves as the single source of truth for project documentation.*
