# Status
not-applicable on current main

## Outcome
The reported file is not present in this checkout, and the CLI typechecks cleanly, so there is no live malformed import to remediate on current `main`.

## Evidence
- Missing path: `tooling/cli/src/commands/kg.ts`
- Search: no `tooling/agent-eval` match under `tooling/cli/src/commands`
- Verification: `bunx tsc -p tooling/cli/tsconfig.json --noEmit`
