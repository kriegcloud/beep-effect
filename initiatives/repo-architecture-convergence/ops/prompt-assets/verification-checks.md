# Verification Checks

Every evidence pack must record the exact command lines, timestamps, exit
results, and search audits used to prove closure.

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

## Required Search-Audit Families

Every phase evidence pack must record exact `rg` commands for its batch across
the following proof families:

1. legacy topology references
2. consumer/importer counts before and after the batch
3. hard-coded app and script entrypoints
4. canonical subpath and export usage
5. compatibility aliases and temporary shims
6. touched package metadata for family and kind compliance

## Closure Rules

- Any non-zero required command exit blocks closure.
- Missing or stale search audits block closure.
- Evidence that predates the last material repo change is stale.
- If a phase claims progress without landed repo diffs, the output is
  scaffold-only and not complete.
