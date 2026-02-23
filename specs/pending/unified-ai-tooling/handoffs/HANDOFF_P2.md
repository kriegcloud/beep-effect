# HANDOFF P2: Adapter Design

## Context Budget

Read first:
- `specs/pending/unified-ai-tooling/README.md`
- `specs/pending/unified-ai-tooling/outputs/p1-schema-and-contract.md` (required prerequisite)
- `specs/pending/unified-ai-tooling/outputs/tooling-compatibility-matrix.md`
- `specs/pending/unified-ai-tooling/outputs/comprehensive-review.md`
- `specs/pending/unified-ai-tooling/outputs/subtree-synthesis.md`
- `specs/pending/unified-ai-tooling/outputs/quality-gates-and-test-strategy.md`
- `specs/pending/unified-ai-tooling/outputs/residual-risk-closure.md`
- `specs/pending/unified-ai-tooling/outputs/poc-02-mcp-capability-results.md`
- `specs/pending/unified-ai-tooling/outputs/poc-03-jetbrains-prompt-library-results.md`

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
6. MCP capability matrix is explicit for each adapter (supported, transformed, dropped-with-warning, error).
7. Managed marker strategy is explicit per output class (header vs sidecar metadata).
8. P2 output includes `Quality Gate Evidence` with required subsection schema and signoff rows.
9. JetBrains prompt-library v1 mode contract (`bundle_only` default, `native_file` optional with fixture proof) is explicit.
10. Cursor/Windsurf MCP capability baseline is frozen with fixture references.
11. POC-02 and POC-03 outputs are treated as locked baseline contracts unless explicitly re-run.

### Blocking Issues

- If exact JetBrains prompt-library native file integration remains undocumented, default to the locked `bundle_only` mode and continue (do not block phase completion).

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
5. Define capability maps and transform/drop rules for MCP + overrides.
6. Define warning/error classes for non-portable fields and strict-mode promotion behavior.
7. Define adapter test matrix (unit + golden fixtures + negative lossy-path tests).

## Verification Steps

```bash
cat specs/pending/unified-ai-tooling/outputs/manifest.json | jq .

rg -n "^## Quality Gate Evidence" specs/pending/unified-ai-tooling/outputs/p2-adapter-design.md

rg -n "^### (Test Suites Executed|Fixture Sets Used|TDD Evidence|Pass/Fail Summary|Unresolved Risks|Review Signoff)$" specs/pending/unified-ai-tooling/outputs/p2-adapter-design.md

rg -n "^\\| Design/Architecture \\|" specs/pending/unified-ai-tooling/outputs/p2-adapter-design.md
rg -n "^\\| Security/Secrets \\|" specs/pending/unified-ai-tooling/outputs/p2-adapter-design.md

! rg -n "\\|[^|]*\\|[^|]*\\|[^|]*\\| rejected \\|" specs/pending/unified-ai-tooling/outputs/p2-adapter-design.md
```

## Known Issues and Gotchas

- Cursor docs are partly dynamic; rely on explicit adapter fixtures for schema certainty.
- Avoid merge-in-place semantics for managed files.
- Keep warning classes deterministic; no silent field drops.
- Do not regress or silently reinterpret POC-02/03 contracts; call out any intentional divergence explicitly.
