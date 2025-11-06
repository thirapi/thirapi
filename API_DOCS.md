# Now Playing API Documentation

This document provides details on the available API endpoints for displaying your currently playing Spotify track as an SVG image.

You can use these endpoints to embed a dynamic "Now Playing" card in your own GitHub profiles, personal websites, or any other platform that supports embedding images from a URL.

---

## Endpoints

### 1. Random SVG (`/api/now-playing`)

This is the recommended endpoint for general use. It randomly serves one of the available SVG variants (`card` or `dvd`), providing a dynamic experience each time it's loaded.

- **URL:** `https://https://thirapi-now-playing.vercel.app/api/now-playing`
- **Method:** `GET`
- **Description:** Redirects to either the `/api/now-playing/card` or `/api/now-playing/dvd` endpoint. The redirect is temporary (307) and is not cached, ensuring a random result on each request.
- **Usage Example (Markdown):**
  ```markdown
  ![Now Playing](https://https://thirapi-now-playing.vercel.app/api/now-playing)
  ```

---

### 2. Card SVG (`/api/now-playing/card`)

This endpoint consistently returns the standard "Now Playing" card, which displays the album art, track title, artist, and album name in a clean, compact layout.

- **URL:** `https://https://thirapi-now-playing.vercel.app/api/now-playing/card`
- **Method:** `GET`
- **Description:** Generates and returns an SVG image of the card-style "Now Playing" status.
- **Usage Example (Markdown):**
  ```markdown
  ![Now Playing Card](https://https://thirapi-now-playing.vercel.app/api/now-playing/card)
  ```
- **Preview:**
  ![Now Playing Card](https://https://thirapi-now-playing.vercel.app/api/now-playing/card)

---

### 3. DVD SVG (`/api/now-playing/dvd`)

This endpoint returns a creative, vinyl/DVD-inspired SVG. It features the album art as a spinning disc, providing a visually engaging animation.

- **URL:** `https://https://thirapi-now-playing.vercel.app/api/now-playing/dvd`
- **Method:** `GET`
- **Description:** Generates and returns an SVG image of the DVD-style "Now Playing" status with a spinning animation.
- **Usage Example (Markdown):**
  ```markdown
  ![Now Playing DVD](https://https://thirapi-now-playing.vercel.app/api/now-playing/dvd)
  ```
- **Preview:**
  ![Now Playing DVD](https://https://thirapi-now-playing.vercel.app/api/now-playing/dvd)

---

### Caching

- The `/api/now-playing` endpoint has caching disabled to ensure it can perform a random redirect on every request.
- The `/api/now-playing/card` and `/api/now-playing/dvd` endpoints have a short cache lifetime (`s-maxage=60`) to reduce server load while still providing near real-time updates.
