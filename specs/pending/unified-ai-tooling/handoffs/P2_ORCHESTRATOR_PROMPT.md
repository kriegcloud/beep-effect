# P2 ORCHESTRATOR PROMPT: Adapter Design

## Context

Execute P2 for `specs/pending/unified-ai-tooling`.

Required read order:
1. `README.md`
2. `handoffs/HANDOFF_P2.md`
3. `outputs/p1-schema-and-contract.md`
4. `outputs/tooling-compatibility-matrix.md`
5. `outputs/comprehensive-review.md`
6. `outputs/subtree-synthesis.md`
7. `outputs/quality-gates-and-test-strategy.md`
8. `outputs/residual-risk-closure.md`
9. `outputs/poc-02-mcp-capability-results.md`
10. `outputs/poc-03-jetbrains-prompt-library-results.md`

## Your Mission

1. Define adapter contracts for Claude/Codex/Cursor/Windsurf/JetBrains.
2. Define per-tool file targets and mapping semantics.
3. Define unsupported-field warning/error policy.
4. Ensure skills and agents mapping is covered in each adapter.
5. Ensure JetBrains prompt-library mapping is included in v1 adapter scope.
6. Define MCP capability matrix per tool with transform/drop/error rules.
7. Define managed marker strategy per target type (header vs sidecar metadata).
8. Lock JetBrains prompt-library mode contract (`bundle_only` default; `native_file` only with fixture proof).
9. Update POC result files for MCP capability and JetBrains prompt-library with verdict/evidence or blocked reason.
10. Add `## Quality Gate Evidence` section using the required subsection schema and signoff table.
11. Write `outputs/p2-adapter-design.md`.
12. Update `outputs/manifest.json` for P2.

## Critical Constraints

- No symlink strategy.
- Deterministic output required.
- Full-file rewrite ownership model for managed targets.
- Keep JetBrains extension surfaces explicit where parity is non-portable.

## Verification

- Every tool has explicit file targets.
- Every canonical domain has mapping or explicit non-support handling.
- Dual instruction output (`AGENTS.md`, `CLAUDE.md`) is deterministic.
- Capability-map behavior is explicit and fixture-testable.
- Quality gate evidence includes all required subsections and required signoff rows.

## Success Criteria

- P2 output is implementation-ready and unambiguous.
