# Verification Checks

Every evidence pack must record the exact command lines, timestamps, exit
results, required standards rereads, and search audits used to prove closure.

## Mandatory Command Gates

| Gate | Exact command | When it is mandatory |
| --- | --- | --- |
| Graphiti bootstrap | `bun run graphiti:proxy:ensure` | phase start when Graphiti is available |
| Config sync | `bun run config-sync:check` | every phase exit |
| Type and compile checks | `bun run check` | every code-moving phase exit from `P2` through `P7` |
| Lint and allowlist integrity | `bun run lint` | every code-moving phase exit from `P2` through `P7` |
| Tests | `bun run test` | every code-moving phase exit from `P2` through `P7` |
| JSDoc and docgen | `bun run docgen` | every code-moving phase exit from `P2` through `P7` |
| Repo audit | `bun run audit:full` | `P2`, `P6`, `P7`, and any phase touching tooling, config, routing, or generators |

## Mandatory Non-Command Proof Gates

| Gate | Exact proof | When it is mandatory |
| --- | --- | --- |
| Worker-read acknowledgment | evidence-pack statement naming the exact root-contract files, phase-specific manifest `inputs`, and standards or live-ledger rereads required for the batch | every phase exit |
| Search audits | exact `rg` commands with counts for the active phase's `requiredSearchAuditIds` from `ops/manifest.json`; at the current manifest version, every phase record lists all seven catalog families | every phase exit |
| Live-ledger delta | compatibility-ledger delta, architecture-amendment-register delta, and allowlist delta when applicable | every phase exit |

## Search-Audit Authority And Catalog

`ops/manifest.json` is authoritative for blocking search audits. The seven
families below are the reusable catalog. Only the ids listed in the active
phase's `requiredSearchAuditIds` are blocking, though the current manifest
version lists all seven for every phase.

1. legacy topology references
2. consumer/importer counts before and after the batch
3. hard-coded app and script entrypoints
4. canonical subpath and export usage
5. compatibility aliases and temporary shims
6. touched package metadata for family and kind compliance
7. repo-law boundary surfaces touched by the batch, including type-safety, typed-error, schema/decode, and runtime-execution checks

## Closure Rules

- Any non-zero required command exit blocks closure.
- Missing the worker-read acknowledgment, the required P0 baseline reread, or
  the immediate P7 reread blocks closure under
  `worker-read-acknowledgment-missing`.
- Missing or stale search audits, including any omitted id from the active
  phase's manifest-listed audit set or any required repo-law boundary audit,
  block closure.
- Evidence that predates the last material repo change is stale.
- If a phase claims progress without landed repo diffs, the output is
  scaffold-only and not complete.
