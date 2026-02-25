# P6 Query Parity Report

## Status
IMPLEMENTED and evidenced (post-hardening).

## Profile
`code-graph-functional`

## Matrix (Post-Hardening)
Source: `evidence/20260225T210659Z-fixture-parity.json`

| Check | Pass | Observed |
|---|---|---:|
| Entity listing | YES | 239 |
| Neighbor expansion | YES | 4934 |
| Commit context | YES | 239 |
| Path finding query execution | YES | 0 paths (query executed) |

## Matrix (Full-Repo)
Source: `evidence/20260225T221039Z-fullrepo-parity.json`

| Check | Pass | Observed |
|---|---|---:|
| Entity listing | YES | 246 |
| Neighbor expansion | YES | 5270 |
| Commit context | YES | 246 |
| Path finding query execution | YES | 0 paths (query executed) |

## Verification Snapshot
Source: `evidence/20260225T210659Z-fixture-verify-both.json`

| Surface | Signal | Value |
|---|---|---|
| Falkor | `nodeCount` | 2729 |
| Falkor | `edgeCount` | 4934 |
| Falkor | `fileCount` | 239 |
| Falkor | `commitCount` (target commit) | 1 |
| Falkor | `commitContextCount` | 239 |
| Graphiti | MCP response status | 200 |

## Verification Snapshot (Full-Repo)
Source: `evidence/20260225T221039Z-fullrepo-verify-both.json`

| Surface | Signal | Value |
|---|---|---|
| Falkor | `nodeCount` | 2852 |
| Falkor | `edgeCount` | 5270 |
| Falkor | `fileCount` | 246 |
| Falkor | `commitCount` (target commit) | 1 |
| Falkor | `commitContextCount` | 246 |
| Graphiti | MCP response status | 200 |

## Regression/Hardening Evidence
Pre-fix parity failure (quote-break in Falkor write path):
- Source: `evidence/20260225T205938Z-parity.json`
- Failed checks: entity listing, commit listing.

Post-fix parity pass:
- Source: `evidence/20260225T210659Z-fixture-parity.json`
- All four checks pass.

## Parity Semantics Notes
1. This parity profile is functional, not byte-identical schema parity with Falkor reference code-graph.
2. Path-query parity currently validates execution success; non-zero path volume is not required.
3. Parity/verify currently run against graph group `beep-ast-kg`, which may include previously published records from broader runs.
