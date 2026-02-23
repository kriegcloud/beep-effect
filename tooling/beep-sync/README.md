# @beep/beep-sync (Scaffold)

Status: scaffold only

This package scaffolds the runtime layout, CLI entrypoints, and POC fixture tree for
`beep-sync`. It is not the final implementation.

## Available now

- `tooling/beep-sync/bin/beep-sync` wrapper
- `tooling/beep-sync/src/bin.ts` scaffold CLI
- POC fixture directories under `tooling/beep-sync/fixtures/poc-01` .. `poc-06`
- Basic local scripts:
  - `test:unit`
  - `test:fixtures`
  - `test:integration`
  - `test:coverage`
  - `poc:preflight`
  - `agents:audit`
  - `agents:scaffold`

## Scaffold behavior

The CLI currently:
- validates referenced fixture/input paths exist
- prints deterministic scaffold output
- supports command shapes used by POC command templates

Replace scaffold behaviors with real parser/adapter/runtime logic during P1-P3.
