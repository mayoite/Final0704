# Main Site Master Walkthrough And Review

Generated: 2026-04-08

## Scope

This walkthrough is for the main site runtime at the repo root.

It does not replace the planner-specific package under `IMPORTANTFILES/docs/planner/new/`.

## What The Main Site Covers

- public marketing and commerce-facing routes under `src/app`
- shared site components under `src/components`
- deployment and edge/runtime configuration at the repo root
- the bridge to the separate CAD Suite planner deployment

## Current Structure

The main site side of the repo is organized around these source areas:

- `src/app`
- `src/components`
- `src/lib`
- `IMPORTANTFILES/docs/audits`
- `IMPORTANTFILES/docs/deployment`
- `IMPORTANTFILES/docs/diagrams`

The CAD planner remains a separate runtime under `apps/cad-suite`.

## Runtime Model

The current documented deployment model is:

- main site deploys from the repo root
- CAD Suite deploys from `apps/cad-suite`
- the main site points planner-related routes and references at the separate CAD deployment

See:

- `cloudflare-workers.md`
- `vercel-cloudflare-r2.md`

## Current Review Signals

Verified in the current working tree:

- `npm run lint` passes
- `npm -w cad-suite run lint` passes
- `npm run test:planner` passes

Not freshly re-proven in this session because the sandbox blocked clean build/browser verification:

- root `npm run build`
- live browser proof on deployed surfaces

## Security Summary

Clean signals:

- security headers and CSP are configured in `next.config.js`
- browser-exposed service-role keys were not found
- server-side service-role usage is confined to server helpers and API routes

Current review risks:

- CSP still allows `'unsafe-inline'` and `'unsafe-eval'`
- an ops query client stores an admin token in `localStorage`
- legacy vendor/public bundles include unsafe dynamic-code patterns and should not be treated as a strong security baseline

## Diagram Set

This package keeps 3 core main-site diagrams:

- `as_is_dfd.svg`
- `to_be_bpmn.svg`
- `to_be_bpmn_choices_on.svg`

These are enough for review without duplicating every variant.

## Reviewer Path

Use this order for a fast review:

1. Read this walkthrough.
2. Read `repo_audit_20_parameters.md`.
3. Read `cloudflare-workers.md` for the two-runtime deployment split.
4. Read `vercel-cloudflare-r2.md` for asset and platform rollout.
5. Open the 3 SVGs for process context.

## Further Steps

1. Re-run root build outside the current sandbox.
2. Verify live security headers on the deployed main-site domain.
3. Remove browser-stored admin tokens from ops tooling.
4. Tighten CSP once legacy dependencies are reduced.
5. Keep the main-site and planner review bundles separate so reviewer scope stays clear.
