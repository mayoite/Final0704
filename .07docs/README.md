# 07docs

Workspace archive and reporting area. Runtime code should not be added here.

## Structure

- `Backupcad/`: archived donor snapshot
- `archive/reference/`: archived loose reference docs moved from root
- `artifacts/`: pointer-only artifact area retained for archive hygiene
- `artifacts/root-logs/`: pointer folder only; live CAD root logs were moved out
- `reports/planner/`: pointer to moved planner reports
- `reports/structure/`: folder-structure snapshots

## Moved to app docs

- CAD planner reports now live in `apps/cad-suite/docs/reports/planner`
- CAD root logs now live in `apps/cad-suite/docs/artifacts/root-logs`
- CAD coverage reports now live in `apps/cad-suite/docs/artifacts/coverage-report`

## Rule

Keep active application/runtime files in root app folders (`apps`, `src`, `public`, `scripts`, `supabase`).
Use `07docs` for archival snapshots and generated artifacts that are not yet consolidated.
