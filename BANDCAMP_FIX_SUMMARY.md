# Bandcamp Player Bug Fix - Complete Summary

## Problem
The Ryo Kawasaki album was showing "Sorry, this track or album is not available" on the Bandcamp player iframe, despite the backend successfully extracting stream metadata.

## Root Causes

### 1. Incorrect Embed URL Format
Bandcamp's `EmbeddedPlayer` requires **numeric album IDs**, not URL slugs.
- ❌ **Wrong**: `https://bandcamp.com/EmbeddedPlayer/album=selected-works-1979-to-1983/...`
- ✅ **Correct**: `https://bandcamp.com/EmbeddedPlayer/album=1899039788/...`

### 2. Missing numericAlbumId in Stream Loader
The frontend stream loader wasn't returning the `numericAlbumId` value from the backend, so it couldn't be passed to the player element.

### 3. Stale Deployed Files
Static files in `/static/audio-player/js/` weren't updated with bug fixes.

## Solution

### Fixed Files

#### 1. **Backend: `/audio-player/functions/get-bandcamp-stream.js`**
- Added validation to require `numericAlbumId` (returns 404 if missing)
- Ensures proper album ID extraction from Bandcamp HTML
- Returns `numericAlbumId` in response

#### 2. **Frontend: `/audio-player/js/audio-system.js`**
- Removed slug-based fallback (causes "not available" error)
- Only renders iframe when `data-album-id` is set with numeric ID
- Waits for stream loader to set numeric ID before rendering
- Polls for numeric ID for up to 3 seconds

#### 3. **Frontend: `/audio-player/js/bandcamp-stream-loader.js`**
- Fixed: Now includes `numericAlbumId` in returned data object
- Passes `numericAlbumId` to player as `data-album-id` attribute
- Triggers player re-render when ID becomes available

#### 4. **Tests: All test files updated**
- `audio-system.test.js`: Tests now set numeric album ID before testing
- `audio-system.dom.test.js`: DOM integration tests updated
- `bandcamp-stream.test.js`: Test HTML now includes numeric album ID in mock data

#### 5. **Deployment: `/static/audio-player/js/`**
- Copied fixed files from source to static directory
- Ensures live site uses updated code

## Verification

### Test Results
✅ **18/18 tests passing**
- audio-system.test.js: PASS
- audio-system.dom.test.js: PASS
- bandcamp-stream-loader.test.js: PASS
- bandcamp-stream.test.js: PASS

### Live Testing
✅ **Ryo Kawasaki album now displays correctly**
- Backend function extracts `numericAlbumId: "1899039788"`
- Frontend stream loader receives and applies the numeric ID
- Player renders with proper iframe:
  ```html
  <iframe src="https://bandcamp.com/EmbeddedPlayer/album=1899039788/size=large/..." seamless></iframe>
  ```
- ✅ Album player displays properly
- ✅ Stream URL extracted: `https://t4.bcbits.com/stream/...`
- ✅ Player shows album title and tracklist

### Test Page
Created `/static/bandcamp-test.html` demonstrating:
1. Slug-based embed (fails) ❌
2. Numeric ID embed (works) ✅
3. Official Bandcamp link ✅
4. Stream metadata extraction ✅

## Key Changes Summary

| Component | Issue | Fix |
|-----------|-------|-----|
| Backend Function | Missing numeric ID validation | Added required check for `numericAlbumId` |
| Audio System | Uses slug (wrong) | Only accepts numeric ID |
| Stream Loader | Missing `numericAlbumId` field | Added to returned data object |
| Tests | Expected immediate render | Updated to provide numeric ID |
| Static Files | Outdated code | Copied fixed source files |

## How It Works (Fixed Flow)

```
1. Template renders: <div data-type="bandcamp" data-url="..."></div>
   ↓
2. Audio System initializes, waits for numeric album ID
   ↓
3. Stream Loader fetches from backend
   ↓
4. Backend extracts from HTML: numericAlbumId = "1899039788"
   ↓
5. Stream Loader receives numericAlbumId and sets it as data-album-id
   ↓
6. Audio System detects data-album-id is set
   ↓
7. Renders iframe with numeric ID: album=1899039788
   ↓
8. ✅ Bandcamp player displays correctly
```

## Files Modified

- `/audio-player/functions/get-bandcamp-stream.js`
- `/audio-player/js/audio-system.js`
- `/audio-player/js/bandcamp-stream-loader.js`
- `/audio-player/tests/audio-system.test.js`
- `/audio-player/tests/audio-system.dom.test.js`
- `/audio-player/tests/bandcamp-stream.test.js`
- `/static/audio-player/js/audio-system.js` (copied)
- `/static/audio-player/js/bandcamp-stream-loader.js` (copied)
- `/package.json` (added test script)

## Status
✅ **FIXED** - All tests passing, live functionality verified
