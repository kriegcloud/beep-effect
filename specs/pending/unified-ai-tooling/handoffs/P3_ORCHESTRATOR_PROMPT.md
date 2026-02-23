# P3 ORCHESTRATOR PROMPT: Runtime Integration

## Context

Execute P3 for `specs/pending/unified-ai-tooling`.

Read in order:
1. `README.md`
2. `handoffs/HANDOFF_P3.md`
3. `outputs/p1-schema-and-contract.md`
4. `outputs/p2-adapter-design.md`
5. `outputs/preliminary-research.md`
6. `outputs/comprehensive-review.md`
7. `outputs/subtree-synthesis.md`
8. `outputs/quality-gates-and-test-strategy.md`
9. `outputs/residual-risk-closure.md`

## Your Mission

1. Specify CLI command semantics and exit-code matrix.
2. Define secret resolution policy (desktop auth local, service-account auth automation, SDK-capable implementation, CLI compatibility path, fail-hard behavior).
3. Define AGENTS freshness operational contract.
4. Define runtime packaging and execution expectations for `tooling/beep-sync`.
5. Explicitly document deferred CI/hook rollout.
6. Define state/manifest lifecycle (atomic writes, orphan cleanup, versioning).
7. Define backup/revert command semantics.
8. Define structured diagnostics output and strict-mode behavior.
9. Define and test managed-target-only `revert` scenarios from the residual-risk closure contract.
10. Add `## Quality Gate Evidence` section using the required subsection schema and signoff table.
11. Write `outputs/p3-runtime-integration.md`.
12. Update `outputs/manifest.json` for P3.

## Critical Constraints

- No plaintext secret exposure.
- No symlink fallback.
- Deterministic generation remains mandatory.
- Required secret resolution failures are fatal.
- `revert` is mandatory in v1 and scoped to managed targets only.

## Verification

- Exit-code matrix is explicit.
- Redaction policy is explicit.
- AGENTS freshness operations are explicit and testable.
- Deferred rollout points are explicit.
- Cleanup/revert semantics are explicit and testable.
- Quality gate evidence includes all required subsections and required signoff rows.

## Success Criteria

- Runtime contract is implementable without ambiguity.
