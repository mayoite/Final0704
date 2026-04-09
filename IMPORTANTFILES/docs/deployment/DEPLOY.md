# Deploy

This repo supports two deployment paths:

1. Vercel
2. Cloudflare via OpenNext

The app is a single main deployment. Planner routes are part of the main app.

## Prerequisites

- Node.js 20+
- npm
- Vercel CLI for Vercel deploys
- Wrangler for Cloudflare deploys

Install dependencies:

```bash
npm install
```

## Release Gate

Run this before any production deploy:

```bash
npm run release:gate
```

That runs:

```bash
npm run lint
npm test
npm run build
```

## Required Environment Variables

Set these everywhere the app runs:

```env
NEXT_PUBLIC_SITE_URL=https://oando.co.in
SITE_URL=https://oando.co.in

NEXT_PUBLIC_SUPABASE_URL=https://erpweaiypimorcunaimz.supabase.co
SUPABASE_URL=https://erpweaiypimorcunaimz.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY=<publishable-key>
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

Notes:

- `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` should be the same value.
- `SUPABASE_SERVICE_ROLE_KEY` must not be committed to the repo.
- `NEXT_PUBLIC_SITE_URL` and `SITE_URL` should match the deployed domain.

Optional:

```env
NEXT_IMAGE_UNOPTIMIZED=0
OPENAI_MODEL=gpt-5.4
OPENROUTER_MODEL=openrouter/free
CLOUDFLARE_BACKUP_ENABLED=true
```

## Local Smoke Check

```bash
npm run dev
```

Open:

- `http://localhost:3000/`
- `http://localhost:3000/planner`
- `http://localhost:3000/planner-blueprint`
- `http://localhost:3000/planners`
- `http://localhost:3000/configurator`

## Vercel

### Preview

```bash
npm run vercel:preview
```

### Production

```bash
npm run vercel:prod
```

That runs the release gate first, then:

```bash
vercel --prod --yes
```

### Vercel Environment Variables

Set these in Vercel for `Production`, `Preview`, and `Development`:

- `NEXT_PUBLIC_SITE_URL`
- `SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Cloudflare / OpenNext

Cloudflare uses:

- [open-next.config.ts](/C:/claude0104%20-%20Copy/open-next.config.ts)
- [wrangler.jsonc](/C:/claude0104%20-%20Copy/wrangler.jsonc)

Worker name:

- `oneandonly-site`

### Build

```bash
npm run cf:build
```

### Preview

```bash
npm run cf:preview
```

### Deploy

```bash
npm run cf:deploy
```

### Cloudflare Variables

Current worker vars are defined in [wrangler.jsonc](/C:/claude0104%20-%20Copy/wrangler.jsonc), but these values must be completed remotely:

- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` as a secret

Keep these set:

- `NEXT_PUBLIC_SITE_URL=https://oando.co.in`
- `SITE_URL=https://oando.co.in`
- `NEXT_PUBLIC_SUPABASE_URL=https://erpweaiypimorcunaimz.supabase.co`
- `SUPABASE_URL=https://erpweaiypimorcunaimz.supabase.co`
- `CLOUDFLARE_BACKUP_ENABLED=true`

### Important Cloudflare Rule

Do not deploy empty Supabase keys in `wrangler.jsonc`.

If remote values are overwritten with empty strings, runtime will break.

## Backup D1

This repo already binds backup D1 in Cloudflare:

- binding: `CATALOG_BACKUP_D1`
- database: `oneandonly-backup-db`

Apply schema if needed:

```bash
npm run cf:d1:schema:apply
```

## Asset and Cache Notes

- OpenNext uses R2 incremental cache.
- Worker assets come from `.open-next/assets`.
- Planner routes are inside the main app and deploy with the main site.

## Known Non-Blocking Notes

- Build may log:

```text
[planner] catalog preload fallback: planner-catalog-timeout>3000ms
```

That is currently a fallback log, not a build failure.

- `tldraw` can emit runtime warnings in dev if its package graph is duplicated. That is separate from deploy success.

## Useful Commands

```bash
npm run build
npm test
npm run lint
npm run cf:build
npm run cf:preview
npm run cf:deploy
npm run vercel:preview
npm run vercel:prod
```
