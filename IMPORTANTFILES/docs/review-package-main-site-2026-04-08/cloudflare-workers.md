# Cloudflare Workers Deployment

This repository now supports Cloudflare Workers deployment without removing the existing Git or Vercel flow.

## Deployment model

- Main site deploys from the repo root as one Worker.
- CAD suite deploys from `apps/cad-suite` as a second Worker.
- The main site keeps proxying `/planner`, `/draw`, and `/configurator` to the CAD Worker through `NEXT_PUBLIC_CAD_SUITE_URL`.
- Existing Vercel commands remain available.

## Added commands

From the repo root:

```bash
npm run cf:build
npm run cf:preview
npm run cf:deploy

npm run cf:cad:build
npm run cf:cad:preview
npm run cf:cad:deploy
```

From `apps/cad-suite`:

```bash
npm run cf:build
npm run cf:preview
npm run cf:deploy
```

## Required Cloudflare resources

Create two Workers:

- `oneandonly-site`
- `oneandonly-cad-suite`

Create two R2 buckets for incremental cache:

- `oneandonly-site-opennext-cache`
- `oneandonly-cad-suite-opennext-cache`

Create one D1 database for backup fallback data:

- `oneandonly-backup-db`

Apply the schema before deploying:

```bash
wrangler d1 execute oneandonly-backup-db --file cloudflare/d1/backup-schema.sql
```

The default worker names and bucket names live in:

- `wrangler.jsonc`
- `apps/cad-suite/wrangler.jsonc`

Rename them there if your Cloudflare account needs different names.

## Environment variables

Main site Worker:

```bash
NEXT_PUBLIC_SITE_URL=https://www.example.com
SITE_URL=https://www.example.com

NEXT_PUBLIC_ASSET_BASE_URL=https://cdn.example.com
ASSET_BASE_URL=https://cdn.example.com
NEXT_PUBLIC_ASSET_HOSTNAME=cdn.example.com

NEXT_PUBLIC_CAD_SUITE_URL=https://cad.example.com

NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...

OPENAI_API_KEY=...
OPENAI_MODEL=gpt-5.4
OPENROUTER_API_KEY=...
OPENROUTER_MODEL=openrouter/free

CLOUDFLARE_BACKUP_ENABLED=true
CLOUDFLARE_BACKUP_D1_BINDING=CATALOG_BACKUP_D1
```

CAD suite Worker:

```bash
NEXT_PUBLIC_SITE_URL=https://cad.example.com
SITE_URL=https://cad.example.com

NEXT_PUBLIC_ASSET_BASE_URL=https://cdn.example.com
ASSET_BASE_URL=https://cdn.example.com
NEXT_PUBLIC_ASSET_HOSTNAME=cdn.example.com

NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...

OPENAI_API_KEY=...
OPENAI_MODEL=gpt-5.4
OPENROUTER_API_KEY=...
OPENROUTER_MODEL=openrouter/free

CLOUDFLARE_BACKUP_ENABLED=true
CLOUDFLARE_BACKUP_D1_BINDING=CATALOG_BACKUP_D1
```

For local Cloudflare preview:

- copy `.dev.vars.example` to `.dev.vars`
- copy `apps/cad-suite/.dev.vars.example` to `apps/cad-suite/.dev.vars`

## Suggested deployment order

1. Deploy the CAD suite Worker first.
2. Set `NEXT_PUBLIC_CAD_SUITE_URL` on the main site Worker to the CAD Worker domain or custom domain.
3. Deploy the main site Worker.
4. Verify `/planner`, `/draw`, and `/configurator` through the main domain.

## Vercel compatibility

Nothing in this setup removes the current Vercel path:

- root `vercel:preview`
- root `vercel:prod`

Cloudflare deployment is additive.
