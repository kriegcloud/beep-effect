# HANDOFF P2: Adapter Design

## Context Budget

Read first:
- `specs/pending/unified-ai-tooling/README.md`
- `specs/pending/unified-ai-tooling/outputs/p1-schema-and-contract.md` (required prerequisite)
- `specs/pending/unified-ai-tooling/outputs/tooling-compatibility-matrix.md`
- `specs/pending/unified-ai-tooling/outputs/comprehensive-review.md`

## Working Memory

### Phase Goal

Define per-tool adapter contracts mapping normalized canonical data to native target files.

### Deliverables

- `specs/pending/unified-ai-tooling/outputs/p2-adapter-design.md`
- Updated `specs/pending/unified-ai-tooling/outputs/manifest.json`

### Success Criteria

1. Adapter contracts exist for Claude, Codex, Cursor, Windsurf, and JetBrains.
2. File targets, mapping rules, and unsupported-field handling are explicit.
3. Dual instruction generation (`AGENTS.md`, `CLAUDE.md`) is deterministic.
4. JetBrains rules + MCP + prompt-library parity is explicit; indexing artifacts are clearly scoped.
5. Skills mapping is covered across all supported tools (or explicit unsupported warnings).

### Blocking Issues

- If exact JetBrains prompt-library file integration remains undocumented, define a deterministic interim mapping contract and capture an explicit follow-up task rather than de-scoping v1 parity.

### Key Constraints

- No symlinks.
- Generated files committed.
- Linux-only v1.
- Use full-file rewrite semantics for managed targets.

### Implementation Order

1. Define target file map by tool.
2. Define field mapping and fallback semantics.
3. Define serialization/format stability per target.
4. Define adapter fixture matrix and drift assertions.
5. Define warning/error classes for non-portable fields.

## Verification Steps

```bash
cat specs/pending/unified-ai-tooling/outputs/manifest.json | jq .
```

## Known Issues and Gotchas

- Cursor docs are partly dynamic; rely on explicit adapter fixtures for schema certainty.
- Avoid merge-in-place semantics for managed files.
