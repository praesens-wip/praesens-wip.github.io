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

```bash
hugo new content collection/album-name.md
```

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
