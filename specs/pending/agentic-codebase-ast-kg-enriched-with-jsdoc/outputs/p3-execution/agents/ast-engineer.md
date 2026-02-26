# P3 AST Engineer Report

## Delivered
- Implemented deterministic extraction for module/import/export/JSDoc-tag surfaces.
- Implemented node ID canonicalization and edge ID hashing per `kg-schema-v1` lock.
- Implemented full/delta planner with changed-file seed, widening, and >20% full-promotion rule.
- Implemented snapshot JSONL projection and manifest updates.
- Implemented reverse-deps and symbol-index cache outputs for delta widening.

## Lock Checks
- Node ID shape unchanged.
- Provenance set unchanged (`ast|type|jsdoc`).
- Scope include/exclude filters enforced.
- Delta mode contract implemented with changed-path filter and widening policy.

## Exit
- Deterministic full replay behavior validated through CLI tests and smoke runs.
