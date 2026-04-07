# Vercel + Cloudflare R2 Deployment

## Recommended split

- Deploy the Next.js app to `Vercel`
- Store large public assets on `Cloudflare R2`
- Serve R2 through a custom domain such as `cdn.oneandonlyfurniture.com`

This repo is already wired to read CDN assets through:

- `NEXT_PUBLIC_ASSET_BASE_URL`
- `ASSET_BASE_URL`
- `NEXT_PUBLIC_ASSET_HOSTNAME`

Those values are consumed by:

- [`next.config.js`](../../../next.config.js)
- [`src/lib/helpers/images.ts`](../../../src/lib/helpers/images.ts)
- [`src/components/home/Hero.tsx`](../../../src/components/home/Hero.tsx)
- [`src/components/home/HomepageHero.tsx`](../../../src/components/home/HomepageHero.tsx)
- [`src/components/layout/Navbar.tsx`](../../../src/components/layout/Navbar.tsx)

## Vercel project

Create a Vercel project from the GitHub repo.

Framework:

- `Next.js`

Build settings:

- Install command: `npm install`
- Build command: `npm run build`
- Output directory: leave default

Required environment variables in Vercel:

```bash
NEXT_PUBLIC_SITE_URL=https://www.oneandonlyfurniture.com
SITE_URL=https://www.oneandonlyfurniture.com

NEXT_PUBLIC_ASSET_BASE_URL=https://cdn.oneandonlyfurniture.com
ASSET_BASE_URL=https://cdn.oneandonlyfurniture.com
NEXT_PUBLIC_ASSET_HOSTNAME=cdn.oneandonlyfurniture.com

NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...

OPENAI_API_KEY=...
OPENAI_MODEL=gpt-5.4
OPENROUTER_API_KEY=...
OPENROUTER_MODEL=openrouter/free
```

Optional:

```bash
NEXT_IMAGE_UNOPTIMIZED=1
```

Keep `NEXT_IMAGE_UNOPTIMIZED=1` only if you want the browser to load CDN images directly instead of using Vercel image optimization.

## Cloudflare R2

Create a bucket for public media, for example:

- `oneandonly-public-assets`

Attach a custom domain:

- `cdn.oneandonlyfurniture.com`

Recommended top-level folders in the bucket:

- `images/`
- `ClientPhotos/`
- `projects/`
- `hero/`
- `fonts/`
- `3d-assets/`

Mirror the current `public/` asset paths where possible so existing references keep working after upload.

Examples:

- `public/images/hero/titan-patna-hq.webp` -> `https://cdn.oneandonlyfurniture.com/images/hero/titan-patna-hq.webp`
- `public/projects/titan-gallery.webp` -> `https://cdn.oneandonlyfurniture.com/projects/titan-gallery.webp`

## What to upload

Move heavy static assets from `public/` first:

- `public/images/**`
- `public/projects/**`
- `public/ClientPhotos/**`
- `public/hero/**`
- `public/fonts/**` if you want fonts on the CDN too

Avoid moving files that are intended to stay app-local:

- framework-generated assets
- HTML entrypoints used by the app runtime
- files whose paths are consumed by server-side code expecting local disk access

## DNS

Recommended:

- `www.oneandonlyfurniture.com` -> Vercel
- apex/root domain either -> Vercel directly or redirected to `www`
- `cdn.oneandonlyfurniture.com` -> Cloudflare R2 custom domain

## Rollout order

1. Create the Vercel project and add env vars.
2. Create the R2 bucket and custom domain.
3. Upload static media from `public/` into matching R2 paths.
4. Set `NEXT_PUBLIC_ASSET_BASE_URL` and `NEXT_PUBLIC_ASSET_HOSTNAME` in Vercel.
5. Redeploy on Vercel.
6. Verify homepage hero, menu cards, product cards, and category pages load CDN URLs.

## Verification checklist

- Homepage hero image loads from `cdn.*`
- Hero sections on content pages load from `cdn.*`
- Navbar featured cards load from `cdn.*`
- Product images load from `cdn.*` or allowed remote sources
- No CSP image blocking in production
- No broken asset paths caused by missing folders in R2
