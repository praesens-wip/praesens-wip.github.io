# Präsens

A Hugo-based website for the Präsens music community, featuring a blog and curated music collection.

## About

Präsens creates spaces where music connects, resonates, and inspires. This website serves as our digital home for sharing reflections, documenting events, and building deeper connections with our community.

## Technology Stack

- **Static Site Generator**: [Hugo](https://gohugo.io/) v0.153.2+
- **Theme**: [Typo](https://github.com/tomfran/typo)
- **Hosting**: GitHub Pages
- **Deployment**: GitHub Actions (automated on push to main)

## Local Development

### Prerequisites

- Hugo Extended v0.116.0 or higher
- Git

### Setup

1. Clone the repository:
```bash
git clone https://github.com/praesens-wip/site.git
cd site
```

2. Install the theme (already included as a git clone):
```bash
# Theme is in themes/typo directory
```

3. Run the development server:
```bash
hugo server
```

4. Open your browser to `http://localhost:1313/site/`

The site will automatically reload when you make changes to content or templates.

### Building for Production

To build the site for production:

```bash
hugo --gc --minify
```

The generated site will be in the `public/` directory.

## Project Structure

```
.
├── archetypes/          # Content templates
├── assets/
│   └── css/
│       └── custom.css   # Custom Präsens styling
├── content/
│   ├── blog/            # Blog posts
│   ├── collection/      # Music collection entries
│   └── _index.md        # Homepage content
├── layouts/
│   ├── index.html       # Custom homepage template
│   └── partials/
│       └── hooks/       # Theme hooks (font loading)
├── static/
│   ├── fonts/           # Custom fonts (karima)
│   └── images/          # Static images
├── themes/typo/         # Hugo theme
└── hugo.toml            # Site configuration
```

## Content Management

### Adding a Blog Post

```bash
hugo new content blog/my-post.md
```

Edit the generated file and set `draft = false` when ready to publish.

### Adding to Collection

You can add music albums to the collection in two ways:

#### Manual Creation

```bash
hugo new content collection/album-name/index.md --kind collection
```

#### Using Automated Scripts

The `scripts/` folder contains Python scripts that automatically scrape album data and create collection entries:

##### From Bandcamp

```bash
uv run scripts/create_collection_entry_from_bandcamp.py <bandcamp_url>
```

**Example:**
```bash
uv run scripts/create_collection_entry_from_bandcamp.py https://fugazi.bandcamp.com/album/instrument
```

**Features:**
- Automatically extracts: artist, title, tracklist, cover art, genres, credits
- Preserves newlines in credits
- Handles quote escaping for TOML
- No authentication required

##### From Discogs

```bash
# Without token (25 requests/min)
uv run scripts/create_collection_entry_from_discogs.py <discogs_url>

# With token (60 requests/min - recommended)
export DISCOGS_TOKEN=your_token_here
uv run scripts/create_collection_entry_from_discogs.py <discogs_url>

# With custom YouTube link
uv run scripts/create_collection_entry_from_discogs.py <discogs_url> --youtube <youtube_url>
```

**Example:**
```bash
uv run scripts/create_collection_entry_from_discogs.py https://www.discogs.com/release/1152173-Idris-Muhammad-Turn-This-Mutha-Out
```

**Features:**
- Uses official Discogs API
- Automatically extracts: artist, title, year, label, catalog number, genres, tracklist, credits
- Auto-extracts YouTube links from Discogs metadata
- Supports vinyl side organization (Side A/B)
- No token required (but recommended for higher rate limits)

**Get a Discogs token:** https://www.discogs.com/settings/developers

**What Gets Created:**
Both scripts generate:
- `content/collection/artist-album/index.md` - Album metadata and content
- `content/collection/artist-album/cover.jpg` - Album cover art
- Properly formatted TOML frontmatter with all album details
- Streaming links (Spotify, Apple Music, Bandcamp, YouTube where available)

## Deployment

The site is automatically deployed to GitHub Pages when changes are pushed to the `main` branch via GitHub Actions.

The workflow:
1. Installs Hugo
2. Builds the site
3. Deploys to GitHub Pages

See `.github/workflows/static.yml` for details.

## Configuration

Main configuration is in `hugo.toml`:
- Site title, description, and URLs
- Navigation menu items
- Theme parameters

## Custom Styling

Custom CSS is in `assets/css/custom.css` and includes:
- Karima font integration for headings
- Homepage-specific styling
- Mobile responsive adjustments

## License

Content and design © 2025 Präsens Community

## Contact

Email: praesens.wip@gmail.com
