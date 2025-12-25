#!/usr/bin/env python3
# /// script
# requires-python = ">=3.9"
# dependencies = [
#     "requests",
#     "beautifulsoup4",
# ]
# ///
"""
Scrape Bandcamp album page and create a Hugo collection entry.

Usage:
    uv run scripts/create_collection_entry_from_bandcamp.py <bandcamp_url>

Example:
    uv run scripts/create_collection_entry_from_bandcamp.py https://fugazi.bandcamp.com/album/instrument
"""

import argparse
import json
import os
import re
import sys
from datetime import datetime
from pathlib import Path
from urllib.parse import urlparse
from urllib.request import urlretrieve

import requests
from bs4 import BeautifulSoup


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


def extract_bandcamp_data(url):
    """Scrape album data from Bandcamp page."""
    print(f"Fetching {url}...")
    response = requests.get(url)
    response.raise_for_status()

    soup = BeautifulSoup(response.text, 'html.parser')

    # Extract JSON-LD data (contains structured data)
    script_tag = soup.find('script', type='application/ld+json')
    if script_tag:
        json_data = json.loads(script_tag.string)
    else:
        json_data = {}

    # Extract embedded data from JavaScript
    embedded_data = {}
    for script in soup.find_all('script'):
        if script.string and 'var TralbumData' in script.string:
            # Extract TralbumData object
            match = re.search(r'var TralbumData = ({.*?});', script.string, re.DOTALL)
            if match:
                try:
                    embedded_data = json.loads(match.group(1))
                except json.JSONDecodeError:
                    pass

    # Extract artist
    artist = json_data.get('byArtist', {}).get('name', '')
    if not artist:
        artist_meta = soup.find('meta', property='og:site_name')
        if artist_meta:
            artist = artist_meta.get('content', '')

    # Extract title
    title = json_data.get('name', '')
    if not title:
        title_meta = soup.find('meta', property='og:title')
        if title_meta:
            title = title_meta.get('content', '').split(' | ')[0]

    # Extract release date/year
    release_date = json_data.get('datePublished', '')
    release_year = datetime.now().year
    if release_date:
        try:
            release_year = datetime.fromisoformat(release_date.replace('Z', '+00:00')).year
        except:
            pass

    # Extract description
    description = json_data.get('description', '')
    if not description:
        about_elem = soup.find('div', class_='tralbumData tralbum-about')
        if about_elem:
            description = about_elem.get_text(strip=True)

    # Extract cover image
    cover_url = json_data.get('image', '')
    if not cover_url:
        cover_meta = soup.find('meta', property='og:image')
        if cover_meta:
            cover_url = cover_meta.get('content', '')

    # Extract genres/keywords
    genres = json_data.get('keywords', [])
    if isinstance(genres, str):
        genres = [g.strip() for g in genres.split(',')]

    # If no genres from JSON-LD, try to find tags
    if not genres:
        tags_elem = soup.find('div', class_='tralbum-tags')
        if tags_elem:
            genre_links = tags_elem.find_all('a', class_='tag')
            genres = [tag.get_text(strip=True) for tag in genre_links]

    # Extract tracklist
    tracklist = []
    if 'trackinfo' in embedded_data:
        for track in embedded_data['trackinfo']:
            track_num = track.get('track_num', 0)
            track_title = track.get('title', '')
            if track_title:
                tracklist.append(f"{track_num}. {track_title}")

    # If no tracklist from embedded data, try scraping the track table
    if not tracklist:
        track_table = soup.find('table', id='track_table')
        if track_table:
            track_rows = track_table.find_all('tr', class_='track_row_view')
            for row in track_rows:
                track_num_elem = row.find('div', class_='track_number')
                track_title_elem = row.find('span', class_='track-title')
                if track_num_elem and track_title_elem:
                    track_num = track_num_elem.get_text(strip=True).rstrip('.')
                    track_title = track_title_elem.get_text(strip=True)
                    tracklist.append(f"{track_num}. {track_title}")

    # Extract label info
    label = ''
    label_elem = soup.find('span', class_='label')
    if label_elem:
        label = label_elem.get_text(strip=True)

    # Extract album credits/info
    credits_text = ''
    credits_elem = soup.find('div', class_='tralbumData tralbum-credits')
    if credits_elem:
        # Replace <br> tags with newlines before extracting text
        for br in credits_elem.find_all('br'):
            br.replace_with('\n')
        credits_text = credits_elem.get_text()

    return {
        'artist': artist,
        'title': title,
        'release_year': release_year,
        'description': description,
        'cover_url': cover_url,
        'genres': genres,
        'tracklist': tracklist,
        'label': label,
        'credits_text': credits_text,
        'bandcamp_url': url,
    }


def create_collection_entry(data, content_dir='content/collection'):
    """Create Hugo collection entry from scraped data."""
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
    genres_str = ', '.join([f'"{escape_toml_string(g)}"' for g in data['genres'][:5]])  # Limit to 5 genres

    frontmatter = f"""+++
title = "{escape_toml_string(data['title'])}"
date = {datetime.now().strftime('%Y-%m-%d')}
draft = false
description = "{escape_toml_string(data['description'][:200] if data['description'] else '')}"

[album]
artist = "{escape_toml_string(data['artist'])}"
releaseYear = {data['release_year']}
label = "{escape_toml_string(data['label'])}"
catalogNumber = ""
genres = [{genres_str}]

[album.links]
spotify = ""
bandcamp = "{data['bandcamp_url']}"
appleMusic = ""
"""

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
        credits_formatted = ',\n  '.join([f'"{escape_toml_string(line)}"' for line in credit_lines[:20]])  # Limit to 20 lines
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
        description='Create Hugo collection entry from Bandcamp album page'
    )
    parser.add_argument('url', help='Bandcamp album URL')
    parser.add_argument(
        '--content-dir',
        default='content/collection',
        help='Path to Hugo content/collection directory (default: content/collection)'
    )

    args = parser.parse_args()

    # Validate URL
    parsed = urlparse(args.url)
    if 'bandcamp.com' not in parsed.netloc:
        print("Error: URL must be a Bandcamp page", file=sys.stderr)
        sys.exit(1)

    try:
        # Scrape data
        data = extract_bandcamp_data(args.url)

        # Create entry
        create_collection_entry(data, args.content_dir)

    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    main()
