# CAD Suite Docs

This folder is the app-local documentation and artifact area for `apps/cad-suite`.

## Structure

- `reports/planner/`: CAD planner audit and structure reports moved from `07docs/reports/planner`
- `artifacts/root-logs/`: canonical CAD build/test/lint log location, including the moved `apps-cad-suite-*-latest.*` logs from `07docs/artifacts/root-logs`
- `artifacts/coverage-report/`: canonical CAD coverage HTML and lcov output moved from `07docs/artifacts/coverage-report`

## Rule

- Keep live runtime code in `apps/cad-suite/src`.
- Keep canonical planner authority docs in `IMPORTANTFILES/docs/planner/new`.
- Keep donor snapshot code in `07docs/Backupcad` until a separate migration is approved.
