# Cloudflare Pages deployment

This version keeps the React/Vite frontend on Cloudflare Pages and moves the Express `/api/*` routes into Cloudflare Pages Functions.

## Cloudflare Pages settings

- **Build command:** `npm run build`
- **Build output directory:** `dist`
- **Node.js:** 22 or newer
- Add `NASA_API_KEY` as a Pages environment variable if you have a NASA API key. The current APOD endpoint does not require the key for normal use, but the key is kept as a compatibility fallback.

Cloudflare automatically discovers the `functions/` directory. Do not set a custom Functions directory.

## API routes created

- `/api/config`
- `/api/space/apod`
- `/api/space/epic`
- `/api/space/media`
- `/api/space/solar`
- `/api/space/iss`
- `/api/space/image?url=...`

The image proxy is intentionally restricted to NASA and STScI hosts. This prevents the endpoint from becoming an unrestricted open proxy and fixes the browser CORS problem for NASA image assets.

## Local development

`npm run dev` still starts the existing Express server, so the same `/api/*` URLs continue to work locally. The local server also includes the image proxy.
