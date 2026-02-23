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

## Your Mission

1. Specify CLI command semantics and exit-code matrix.
2. Define secret resolution policy (desktop auth local, service-account auth automation, SDK-capable implementation, CLI compatibility path, fail-hard behavior).
3. Define AGENTS freshness operational contract.
4. Define runtime packaging and execution expectations for `tooling/beep-sync`.
5. Explicitly document deferred CI/hook rollout.
6. Write `outputs/p3-runtime-integration.md`.
7. Update `outputs/manifest.json` for P3.

## Critical Constraints

- No plaintext secret exposure.
- No symlink fallback.
- Deterministic generation remains mandatory.
- Required secret resolution failures are fatal.

## Verification

- Exit-code matrix is explicit.
- Redaction policy is explicit.
- AGENTS freshness operations are explicit and testable.
- Deferred rollout points are explicit.

## Success Criteria

- Runtime contract is implementable without ambiguity.
