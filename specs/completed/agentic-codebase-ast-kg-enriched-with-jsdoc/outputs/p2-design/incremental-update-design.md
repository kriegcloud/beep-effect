# Incremental Update Design

## Purpose
Freeze the local deterministic cache, delta planning, widening, invalidation, and recovery behavior for per-file indexing.

## Lock Alignment (Normative)

| Decision Surface | Frozen Value |
|---|---|
| Ingestion granularity | `per-file delta` |
| CLI command set | `bun run beep kg index --mode full` and `bun run beep kg index --mode delta --changed <paths>` |
| Scope policy | Include `apps/`, `packages/`, `tooling/`, `.claude/hooks`, `.claude/scripts`; exclude `specs/`, `.repos/` |
| Cache default carried from P1 | JSONL snapshots keyed by commit SHA |
| Delta default carried from P1 | changed-file first, dependency-aware widening |
| SCIP default carried from P1 | optional overlay, non-blocking |

## Artifact Layout
- Snapshot root:
`tooling/ast-kg/.cache/snapshots/`
- Per-commit snapshot:
`tooling/ast-kg/.cache/snapshots/<commitSha>.jsonl`
- Snapshot manifest:
`tooling/ast-kg/.cache/snapshots/manifest.json`
- Reverse dependency index:
`tooling/ast-kg/.cache/snapshots/reverse-deps/<commitSha>.json`
- Symbol ownership index:
`tooling/ast-kg/.cache/snapshots/symbol-index/<commitSha>.json`

## Snapshot Record Format
Each JSONL record is one file artifact:

```json
{
  "schemaVersion": "kg-schema-v1",
  "workspace": "beep-effect3",
  "commitSha": "abcdef1234...",
  "file": "packages/example/src/foo.ts",
  "artifactHash": "sha256-hex",
  "nodeCount": 0,
  "edgeCount": 0,
  "semanticEdgeCount": 0
}
```

## Retention Policy
1. Always keep the newest successful full snapshot.
2. Keep the latest 50 snapshots across full and delta runs.
3. Remove snapshots older than 30 days when count exceeds 50.
4. Never delete snapshots referenced by pending Graphiti spool replay records.

## Invalidation Triggers
Triggering any condition below forces full mode:
1. `kg-schema-v1` changes.
2. Extractor implementation version changes.
3. `tsconfig` graph hash changes.
4. Include/exclude scope policy changes.
5. Snapshot manifest corruption or missing parent snapshot for delta run.

## Delta Planning Algorithm (Changed-File First)
1. Seed set `S0` = normalized files from `--changed`.
2. Filter `S0` to in-scope files only.
3. Build widening set `W1`:
direct importers of `S0` from reverse dependency index.
4. Build widening set `W2`:
files owning symbols that reference changed exported symbols.
5. Build widening set `W3`:
files affected by deleted or moved files in `S0`.
6. Final set `S = dedupe(S0 + W1 + W2 + W3)`.
7. If `|S| > 20%` of in-scope files, switch to full mode.

## Deletion and Rename Handling
1. Deleted file in `--changed` produces a tombstone record in delta manifest.
2. Tombstone triggers removal of file-level nodes/edges from local snapshot projection.
3. Graphiti replay for deleted file emits zero-node replacement episode for deterministic convergence.
4. Renames are treated as delete + add to preserve ID determinism by path.

## Recovery Flow
1. If delta run fails before manifest finalization, snapshot is discarded.
2. Next run uses previous committed snapshot.
3. If two consecutive delta failures occur, enforce full mode on next run.

## Determinism Guarantees
1. Identical `--changed` input + identical parent snapshot + identical commit content produces identical output snapshot.
2. Snapshot writes are stable-sorted by file path.
3. Manifest includes deterministic hash over ordered record list for integrity checks.

## Optional SCIP Overlay
1. Overlay artifacts are written to:
`tooling/ast-kg/.cache/scip-overlay/<commitSha>.jsonl`
2. Overlay write/read failure does not fail base indexing.
3. Overlay records are never merged into base snapshot hashes.

## Acceptance Checks
1. Delta on a single-file change updates only planned widened set files.
2. Delta widening is deterministic across repeated runs on same commit.
3. Triggering invalidation conditions always promotes run to full mode.
4. Snapshot retention keeps latest full snapshot and prunes according to policy.
5. Overlay disable/enable does not change base snapshot artifact hashes.

## P3 Ownership Handoff
- AST Engineer:
delta planner, widening implementation, snapshot writer.
- Semantic Engineer:
ensure semantic edge regeneration aligns with file-level delta semantics.
- Graphiti Engineer:
consume delta manifests for per-file episode upsert.
- Orchestrator:
enforce full-mode promotion rules and retention validation in integration checks.

## Freeze Statement
Incremental indexing design is fixed for cache format, retention policy, invalidation triggers, widening algorithm, and recovery behavior.
