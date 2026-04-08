# Deployment Docs

## Purpose

This folder stores deployment and infrastructure runbooks.

## Files

| File | Role |
|---|---|
| `cloudflare-workers.md` | Current Cloudflare deployment model and commands |
| `DOMAIN-STATE-2026-04-08.md` | Current live domain truth for `oando.co.in` and `cad.oando.co.in` |
| `vercel-cloudflare-r2.md` | Cross-platform deployment and storage notes |

## Reading Order

1. `cloudflare-workers.md`
2. `DOMAIN-STATE-2026-04-08.md`
3. `vercel-cloudflare-r2.md`

## Notes

- Planner deployment depends on the CAD suite worker model described here.
- Runtime behavior should be verified against live config, not docs alone.
