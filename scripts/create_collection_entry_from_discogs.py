#!/usr/bin/env python3
# /// script
# requires-python = ">=3.9"
# dependencies = [
#     "python3-discogs-client",
# ]
# ///
"""
Fetch Discogs release data via API and create a Hugo collection entry.

The script automatically extracts YouTube links from Discogs video metadata if available.
You can override with --youtube flag.

Usage:
    # Without token (25 requests/min rate limit)
    uv run scripts/create_collection_entry_from_discogs.py <discogs_url>

    # With token (60 requests/min rate limit - recommended)
    export DISCOGS_TOKEN=your_token_here
    uv run scripts/create_collection_entry_from_discogs.py <discogs_url>

Example:
    uv run scripts/create_collection_entry_from_discogs.py https://www.discogs.com/release/123456

Get a Discogs token at: https://www.discogs.com/settings/developers
"""

import argparse
import os
import re
import sys
from datetime import datetime
from pathlib import Path
from urllib.parse import urlparse
from urllib.request import urlretrieve

import discogs_client


def slugify(text):
    """Convert text to URL-friendly slug."""
    text = text.lower()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[-\s]+', '-', text)
    return text.strip('-')


def escape_toml_string(text):
    """Escape quotes and backslashes for TOML strings."""
    if not text:
        return ''
    # Escape backslashes first, then quotes
    text = text.replace('\\', '\\\\')
    text = text.replace('"', '\\"')
    return text


def extract_release_id_from_url(url):
    """Extract release ID from Discogs URL."""
    # URLs are like: https://www.discogs.com/release/1152173-Artist-Album
    match = re.search(r'/release/(\d+)', url)
    if match:
        return int(match.group(1))
    raise ValueError(f"Could not extract release ID from URL: {url}")


def extract_discogs_data(url, token=None):
    """Fetch album data from Discogs API."""
    release_id = extract_release_id_from_url(url)
    print(f"Fetching release {release_id} from Discogs API...")

    # Initialize Discogs client (with or without token)
    if token:
        client = discogs_client.Client('PraesensCollectionScript/1.0', user_token=token)
        print("✓ Using authenticated API (60 requests/min)")
    else:
        client = discogs_client.Client('PraesensCollectionScript/1.0')
        print("ℹ Using unauthenticated API (25 requests/min limit)")

    # Get release
    release = client.release(release_id)

    # Extract artist
    artist = release.artists[0].name if release.artists else ''

    # Extract title
    title = release.title

    # Extract year
    release_year = release.year if hasattr(release, 'year') and release.year else datetime.now().year

    # Extract label and catalog number
    label = ''
    catalog_number = ''
    if release.labels:
        label = release.labels[0].name
        catalog_number = release.labels[0].data.get('catno', '')

    # Extract genres and styles
    genres = []
    if hasattr(release, 'genres') and release.genres:
        genres.extend(release.genres[:3])
    if hasattr(release, 'styles') and release.styles:
        for style in release.styles[:3]:
            if style not in genres and len(genres) < 5:
                genres.append(style)

    # Extract tracklist
    tracklist = []
    if hasattr(release, 'tracklist') and release.tracklist:
        for track in release.tracklist:
            position = track.position
            track_title = track.title
            if position and track_title:
                # Clean up position
                position = position.strip()
                tracklist.append(f"{position}. {track_title}")

    # Extract notes/description
    description = ''
    if hasattr(release, 'notes') and release.notes:
        description = release.notes[:500]

    # Extract credits
    credits_text = ''
    if hasattr(release, 'credits') and release.credits:
        credit_lines = []
        for credit in release.credits[:20]:
            name = credit.name if hasattr(credit, 'name') else ''
            role = credit.role if hasattr(credit, 'role') else ''
            if name and role:
                credit_lines.append(f"{name} - {role}")
            elif name:
                credit_lines.append(name)
        credits_text = '\n'.join(credit_lines)

    # Extract cover image (get the primary image)
    cover_url = ''
    if hasattr(release, 'images') and release.images:
        # Get the first image (usually the cover)
        cover_url = release.images[0]['uri']

    # Extract YouTube link from videos
    youtube_url = ''
    if hasattr(release, 'videos') and release.videos:
        for video in release.videos:
            # Check if it's a YouTube video
            if hasattr(video, 'url') and 'youtube.com' in video.url.lower() or 'youtu.be' in video.url.lower():
                youtube_url = video.url
                break  # Use the first YouTube video found

    return {
        'artist': artist,
        'title': title,
        'release_year': release_year,
        'description': description,
        'cover_url': cover_url,
        'genres': genres,
        'tracklist': tracklist,
        'label': label,
        'catalog_number': catalog_number,
        'credits_text': credits_text,
        'discogs_url': url,
        'youtube_url': youtube_url,
    }


def create_collection_entry(data, youtube_url='', content_dir='content/collection'):
    """Create Hugo collection entry from scraped data."""
    # Use YouTube URL from data if not provided via command line
    if not youtube_url and data.get('youtube_url'):
        youtube_url = data['youtube_url']
        print(f"✓ Found YouTube link in Discogs metadata: {youtube_url}")

    # Create slug for directory
    slug = slugify(f"{data['artist']}-{data['title']}")
    entry_dir = Path(content_dir) / slug
    entry_dir.mkdir(parents=True, exist_ok=True)

    print(f"Creating entry in {entry_dir}...")

    # Download cover image
    cover_path = None
    if data['cover_url']:
        try:
            cover_ext = '.jpg'
            if '.png' in data['cover_url']:
                cover_ext = '.png'
            cover_path = entry_dir / f"cover{cover_ext}"
            print(f"Downloading cover image...")
            urlretrieve(data['cover_url'], cover_path)
            print(f"✓ Cover image saved to {cover_path}")
        except Exception as e:
            print(f"Warning: Failed to download cover image: {e}")

    # Split tracklist into sides (if more than 10 tracks, split in half)
    tracklist_sides = []
    if data['tracklist']:
        # Check if tracklist already has sides (A1, B1, etc.)
        has_sides = any(track[0].upper() in 'ABCD' for track in data['tracklist'] if track)

        if has_sides:
            # Group by side letter
            current_side = None
            current_tracks = []

            for track in data['tracklist']:
                if track and track[0].upper() in 'ABCD':
                    side_letter = track[0].upper()
                    side_name = f"Side {side_letter}"

                    if current_side != side_name and current_tracks:
                        tracklist_sides.append({'side': current_side, 'tracks': current_tracks})
                        current_tracks = []

                    current_side = side_name
                    current_tracks.append(track)

            if current_tracks:
                tracklist_sides.append({'side': current_side, 'tracks': current_tracks})
        else:
            # Split numerically
            if len(data['tracklist']) > 10:
                mid = len(data['tracklist']) // 2
                tracklist_sides = [
                    {'side': 'Side A', 'tracks': data['tracklist'][:mid]},
                    {'side': 'Side B', 'tracks': data['tracklist'][mid:]},
                ]
            else:
                tracklist_sides = [
                    {'side': 'Side A', 'tracks': data['tracklist']},
                ]

    # Generate frontmatter
    genres_str = ', '.join([f'"{escape_toml_string(g)}"' for g in data['genres'][:5]])

    frontmatter = f"""+++
title = "{escape_toml_string(data['title'])}"
date = {datetime.now().strftime('%Y-%m-%d')}
draft = false
description = "{escape_toml_string(data['description'][:200] if data['description'] else '')}"

[album]
artist = "{escape_toml_string(data['artist'])}"
releaseYear = {data['release_year']}
label = "{escape_toml_string(data['label'])}"
catalogNumber = "{escape_toml_string(data['catalog_number'])}"
genres = [{genres_str}]

[album.links]
spotify = ""
bandcamp = ""
appleMusic = ""
"""

    # Add YouTube link if provided
    if youtube_url:
        frontmatter += f'youtube = "{youtube_url}"\n'

    # Add tracklist sections
    for side_data in tracklist_sides:
        tracks_formatted = ',\n  '.join([f'"{escape_toml_string(track)}"' for track in side_data['tracks']])
        frontmatter += f"""
[[album.tracklist]]
side = "{escape_toml_string(side_data['side'])}"
tracks = [
  {tracks_formatted}
]
"""

    # Add credits if available
    if data['credits_text']:
        # Split credits by newlines and filter out empty lines
        credit_lines = [line.strip() for line in data['credits_text'].split('\n') if line.strip()]
        credits_formatted = ',\n  '.join([f'"{escape_toml_string(line)}"' for line in credit_lines[:20]])
        frontmatter += f"""
[[album.credits]]
section = "Credits"
people = [
  {credits_formatted}
]
"""

    frontmatter += "+++\n\n"

    # Add description as content
    content = data['description'] if data['description'] else "Album description."

    # Write index.md
    index_path = entry_dir / 'index.md'
    with open(index_path, 'w', encoding='utf-8') as f:
        f.write(frontmatter + content)

    print(f"✓ Created {index_path}")
    print(f"\nEntry created successfully!")
    print(f"Location: {entry_dir}")
    print(f"\nTo view:")
    print(f"  hugo server -D")
    print(f"  Visit: http://localhost:1313/collection/{slug}")


def main():
    parser = argparse.ArgumentParser(
        description='Create Hugo collection entry from Discogs release page'
    )
    parser.add_argument('url', help='Discogs release URL')
    parser.add_argument('--youtube', help='YouTube URL for the album')
    parser.add_argument(
        '--content-dir',
        default='content/collection',
        help='Path to Hugo content/collection directory (default: content/collection)'
    )

    args = parser.parse_args()

    # Get Discogs API token from environment (optional)
    token = os.environ.get('DISCOGS_TOKEN')
    if not token:
        print("ℹ No DISCOGS_TOKEN found - using unauthenticated API (rate limited)")
        print("  For higher rate limits, get a token at: https://www.discogs.com/settings/developers")
        print("  Then run: export DISCOGS_TOKEN=your_token_here")
        print()

    # Validate URL
    parsed = urlparse(args.url)
    if 'discogs.com' not in parsed.netloc:
        print("Error: URL must be a Discogs page", file=sys.stderr)
        sys.exit(1)

    try:
        # Fetch data from API
        data = extract_discogs_data(args.url, token)

        # Create entry
        create_collection_entry(data, args.youtube or '', args.content_dir)

    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    main()
