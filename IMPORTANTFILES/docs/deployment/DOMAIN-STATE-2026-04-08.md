# Domain State 2026-04-08

## Purpose

This note records the current live domain truth for the repo so deployment decisions do not drift from DNS reality.

## Current Domain Truth

- Main public site domain: `https://oando.co.in`
- CAD public subdomain: `https://cad.oando.co.in`
- Cloudflare is the active DNS/production edge for the live `oando.co.in` zone

## Verified DNS Reality

- `oando.co.in` exists and resolves through Cloudflare nameservers
- `cad.oando.co.in` exists and resolves
- `oando.com.in` does not exist
- `cad.oando.com.in` does not exist

This means the repo should currently treat `*.oando.co.in` as canonical, not `*.oando.com.in`.

## Repo Configuration That Matches This

- Root site config: `wrangler.jsonc`
  - `NEXT_PUBLIC_SITE_URL = https://oando.co.in`
  - `SITE_URL = https://oando.co.in`
  - `NEXT_PUBLIC_CAD_SUITE_URL = https://cad.oando.co.in`
- CAD site config: `apps/cad-suite/wrangler.jsonc`
  - `NEXT_PUBLIC_SITE_URL = https://cad.oando.co.in`
  - `SITE_URL = https://cad.oando.co.in`
  - custom domain route pattern: `cad.oando.co.in`

## Deployment State

- Root app is linked to the Vercel project `final-oando-0504`
- CAD app is linked to the Vercel project `oneandonly-cad-suite`
- Cloudflare remains the main production deployment/runtime path
- Vercel can build from git pushes, but Vercel custom-domain attachment still depends on domain ownership/verification inside the Vercel account

## Important Constraint

The requested Vercel subdomain `oneandonly.oando.co.in` is not attached yet.

Reason:
- the current Vercel account does not have authority over the `oando.co.in` zone
- adding that subdomain in Vercel requires domain ownership/verification there, plus the needed DNS record in Cloudflare

## Operational Rule

Until DNS and Vercel domain ownership say otherwise:

- use `oando.co.in` for the main site
- use `cad.oando.co.in` for the CAD app
- do not document or deploy against `oando.com.in`

## Next Steps

1. Keep Cloudflare as the production front door for `oando.co.in`.
2. Let Vercel continue consuming pushes from the linked git project for preview/build purposes.
3. If `oneandonly.oando.co.in` is still wanted on Vercel, first verify the `oando.co.in` domain in the correct Vercel account, then add the matching DNS record in Cloudflare.
