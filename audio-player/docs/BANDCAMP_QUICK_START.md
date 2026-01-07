# Bandcamp Streaming Quick Start

## Add a New Album with Bandcamp Link

### 1. Create Album Content

Create a new file: `content/collection/{album-slug}/index.md`

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
genres = ["Genre1", "Genre2"]

[album.links]
bandcamp = "https://artist.bandcamp.com/album/album-slug"
spotify = "https://open.spotify.com/album/..."
appleMusic = "https://music.apple.com/..."

[[album.tracklist]]
side = "Side A"
tracks = [
  "1. Track Name",
  "2. Another Track"
]

[[album.credits]]
people = [
  "Artist Name - vocals",
  "Other Person - guitar"
]
+++

Album description text goes here.
```

### 2. Add Cover Image

Place cover art in same folder as `index.md`:
- `cover.jpg` or `cover.png` (recommended: square, at least 300x300px)

Folder structure:
```
content/collection/
└── album-slug/
    ├── index.md
    └── cover.jpg
```

### 3. Deploy

When you push to GitHub, Netlify automatically:
1. Builds the site with Hugo
2. Makes `get-bandcamp-stream` function available
3. Deploys audio system and stream loader scripts

## How It Works

1. **Hugo Template** renders the album page with Bandcamp link
2. **Audio System Script** creates the Bandcamp embed iframe
3. **Stream Loader Script** fetches stream metadata from the Bandcamp link
4. **Player displays** the embedded player with play controls

## Testing Locally

```bash
# Start Hugo dev server
hugo serve --buildDrafts

# In another terminal, run tests
npm test

# View your album at:
# http://localhost:1313/collection/{album-slug}/
```

## Verify It Works

1. Navigate to your album page
2. Open DevTools (F12)
3. Go to Network tab
4. Look for request to `.netlify/functions/get-bandcamp-stream`
5. Check response contains `streamUrl`, `duration`, `trackId`, `albumId`

Or in Console:
```javascript
const player = document.querySelector('.album-audio-player[data-type="bandcamp"]');
console.log(player.dataset);
// Should show: { 
//   type: "bandcamp", 
//   url: "...", 
//   streamUrl: "...", 
//   duration: "...", 
//   trackId: "...", 
//   albumId: "..."
// }
```

## Troubleshooting

### Bandcamp player shows error
- Check Bandcamp link is valid: `https://artist.bandcamp.com/album/slug`
- Some embeds may have restrictions (password protected, etc.)
- Player iframe still works even if stream metadata fails to load

### Stream URL not loading
- Open Network tab in DevTools
- Check `get-bandcamp-stream` response
- May fail if Bandcamp HTML structure changed

### Cover image not showing
- Must be named `cover.jpg` or `cover.png`
- Place in same folder as `index.md`
- Hugo should automatically find and display it

## Adding Other Platforms

To add SoundCloud or other platforms:

1. Create extractor function in `netlify/functions/get-soundcloud-stream.js`
2. Add SoundCloud link to `album.links`:
   ```toml
   [album.links]
   soundcloud = "https://soundcloud.com/artist/track"
   ```
3. Update audio template in `layouts/collection/single.html`

## File Reference

Key files you're working with:

| File | Purpose |
|------|---------|
| `content/collection/{slug}/index.md` | Album content |
| `layouts/collection/single.html` | Album page template |
| `static/js/audio-system.js` | Renders embeds |
| `static/js/bandcamp-stream-loader.js` | Fetches stream data |
| `netlify/functions/get-bandcamp-stream.js` | Backend extractor |

## Next Steps

- [ ] Add your first album
- [ ] Test locally with `hugo serve`
- [ ] Push to GitHub to deploy
- [ ] Verify on live site at `praesens-wip.github.io`
- [ ] Add more albums

For detailed information, see [BANDCAMP_STREAMING.md](./BANDCAMP_STREAMING.md)
