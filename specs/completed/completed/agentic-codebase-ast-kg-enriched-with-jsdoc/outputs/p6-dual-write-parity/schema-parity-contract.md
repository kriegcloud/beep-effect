# P6 Schema Parity Contract

## Status
IMPLEMENTED and HARDENED (2026-02-25)

## Scope
This contract freezes TypeScript-first dual-write behavior for AST KG publication:
1. Falkor structured graph sink (queryable functional graph).
2. Graphiti episodic sink (envelope archive with commit provenance).

## Canonical Types

| Type | Required Fields | Notes |
|---|---|---|
| `AstKgNodeV2` | `nodeId`, `kind`, `symbol`, `file`, `commitSha`, `workspace` | Deterministic `nodeId` from workspace/file/symbol/kind/signature hash. |
| `AstKgEdgeV2` | `edgeId`, `from`, `to`, `type`, `provenance`, `commitSha` | Deterministic `edgeId` from from/type/to/provenance hash. |
| `AstKgWriteReceiptV1` | `target`, `attempted`, `written`, `replayed`, `failed`, `durationMs` | Emitted by `kg publish` and `kg replay`. |
| `AstKgEpisodeV1` | envelope metadata + `nodes[]` + `edges[]` | Serialized to Graphiti `add_memory` with `source="json"`. |

## Falkor Projection Contract

| Source | Falkor Label / Relation | Rule |
|---|---|---|
| node `kind=module` | `:Module:Searchable` | Preserve nodeId/kind/symbol/file/commit/workspace/group metadata. |
| node `kind=literal` | `:Literal:Searchable` | Same metadata shape as other nodes. |
| all other node kinds | `:Symbol:Searchable` | Covers function/class/interface/typeAlias/variable/enum. |
| file anchor | `:File:Searchable` | `nodeId` uses canonical module node id for file. |
| commit anchor | `:Commit` | `sha`, `parentSha`, `branch`, `workspace`, `groupId`. |
| commit-file edge | `(:Commit)-[:CONTAINS]->(:File)` | Required for commit-context parity checks. |
| semantic/structural edges | relation from sanitized `edge.type` | Non-alnum/underscore chars replaced with `_`, uppercased, leading digit prefixed with `R_`. |

## Graphiti Projection Contract

| Field | Value |
|---|---|
| `group_id` | `beep-ast-kg` |
| `name` | `ast-kg:<workspace>:<commitSha>:<file>` |
| `source` | `json` |
| `source_description` | `p6 dual-write publish` |
| `episode_body` | JSON string of `AstKgEpisodeV1` envelope |

## Functional Parity Contract

| Parity Check | Query Class | Pass Condition |
|---|---|---|
| Entity listing | `MATCH (f:File) RETURN count(f)` | `count > 0` |
| Neighbor expansion | `MATCH (n)-[r]->(m) RETURN count(r)` | `count > 0` |
| Commit context | `MATCH (c:Commit)-[:CONTAINS]->(f:File) RETURN count(f)` | `count > 0` |
| Path query execution | `MATCH p=()-[:CALLS*1..3]->() RETURN count(p)` | Query executes successfully (count may be `0`) |

## Hardening Applied in P6
1. Falkor query execution changed from shell command strings to argument-safe process execution (`execFileSync`), eliminating quote-break failures when Cypher literals contain single quotes.
2. `kg verify` now reports Falkor commit-context metrics from `Commit` and `Commit->File` structures (instead of stale `Episodic` label assumptions).
3. `kg parity` now includes explicit `commit-context` status and observed counts in the matrix.

## Evidence Anchors
1. Pre-hardening failure evidence: `evidence/20260225T205938Z-publish-full.json`.
2. Post-hardening dual-write success evidence: `evidence/20260225T210659Z-fixture-publish-full.json`.
3. Post-hardening parity evidence: `evidence/20260225T210659Z-fixture-parity.json`.
