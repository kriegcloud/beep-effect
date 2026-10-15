# @beep/palantiri

Agent-facing Palantiri parcels: schema-typed, freshness-checked observability summaries.

## Installation

```bash
bun add @beep/palantiri
```

## Usage

Reduce an accounts report to the account-headroom parcel, then read its
freshness and summary:

```ts
import { AccountHeadroomInput, AccountsReportInput, reduceAccountHeadroom } from "@beep/palantiri"
import * as DateTime from "effect/DateTime"
import * as O from "effect/Option"

const now = DateTime.makeUnsafe(0)
const report = AccountsReportInput.make({ schemaVersion: "accounts-status/v2", generatedAt: now, groups: [] })
const parcel = reduceAccountHeadroom(AccountHeadroomInput.make({ report, expectedProviders: O.some([]) }), now, 20)

console.log(parcel.freshness._tag) // "Fresh"
console.log(parcel.summary) // "0 of 0 accounts fresh"
```

The `beep palantiri parcel <id> [--json]` command in `@beep/repo-cli` serves
these parcels from the workstation's local sources.

## Development

```bash
# Build
bun run build

# Type check
bun run check

# Test
bun run test

# Integration test
bun run test:integration

# Lint
bun run lint:fix
```

Unit tests stay outside `test/integration`; package integration tests live under `test/integration` and use `bun run test:integration`. Tests import package source through `@beep/palantiri` or other `@beep/*` aliases. Use relative imports only for local helpers, fixtures, and snapshots.

## License

MIT
