# Main Site Review Package 2026-04-08

## Purpose

This folder is the reviewer-facing handoff bundle for the main site side of the repo.

It keeps the current repo audit, deployment runbooks, one walkthrough file, and 3 core process diagrams in one place.

## Included Files

- `MAIN-SITE-MASTER-WALKTHROUGH-AND-REVIEW.md`
- `repo_audit_20_parameters.md`
- `cloudflare-workers.md`
- `vercel-cloudflare-r2.md`
- `as_is_dfd.svg`
- `to_be_bpmn.svg`
- `to_be_bpmn_choices_on.svg`

## SVG Rule

This package intentionally keeps 3 main-site SVGs only:

- `as_is_dfd.svg`
- `to_be_bpmn.svg`
- `to_be_bpmn_choices_on.svg`

The alternate `to_be_bpmn_choices_off.svg` source remains in the main `diagrams/` folder and is not duplicated here.

## Reading Order

1. `MAIN-SITE-MASTER-WALKTHROUGH-AND-REVIEW.md`
2. `repo_audit_20_parameters.md`
3. `cloudflare-workers.md`
4. `vercel-cloudflare-r2.md`

## Security Priority Order

1. Tighten CSP in `next.config.js`.
   Current risk: `script-src` still allows `'unsafe-inline'` and `'unsafe-eval'`.

2. Remove browser-stored admin tokens.
   Current risk: ops query tooling stores an admin token in browser `localStorage`.

3. Keep service-role keys server-only.
   Current repo signal is good, but deployment secrets still need environment-by-environment verification.

4. Keep legacy vendor code off critical public paths.
   Any code relying on `new Function` or unsafe DOM writes should stay quarantined or be replaced.

5. Re-run build and header verification outside the current sandbox before final sign-off.

## Next Steps

1. Run a fresh root build outside the current sandbox.
2. Verify root response headers and CSP on the deployed domain.
3. Re-check homepage, products, quote-cart, login, and admin entry paths.
4. Commit the docs package along with the current review-prep fixes.
