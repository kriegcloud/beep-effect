# HANDOFF P3: Runtime Integration (CLI, Secrets, Operational Contract)

## Context Budget

Read first:
- `README.md`
- `outputs/p1-schema-and-contract.md`
- `outputs/p2-adapter-design.md`
- `outputs/preliminary-research.md`
- `outputs/comprehensive-review.md`
- `outputs/subtree-synthesis.md`
- `outputs/quality-gates-and-test-strategy.md`
- `outputs/residual-risk-closure.md`
- `outputs/poc-04-managed-ownership-revert-results.md`
- `outputs/poc-05-secret-resolution-results.md`

## Working Memory

### Phase Goal

Define runtime behavior for `beep-sync` commands, secret resolution lifecycle, and AGENTS freshness operational contract.

### Deliverables

- `specs/pending/unified-ai-tooling/outputs/p3-runtime-integration.md`
- Updated `specs/pending/unified-ai-tooling/outputs/manifest.json`

### Success Criteria

1. CLI command contract is explicit (`validate`, `apply`, `check`, `doctor`).
2. Secret lifecycle is explicit (SDK-capable design, hybrid auth policy, CLI compatibility path, redaction, fail-hard on required unresolved secrets).
3. AGENTS freshness workflow contract is explicit (root + every workspace package).
4. Runtime packaging contract is explicit for `tooling/beep-sync`.
5. CI and hook wiring are explicitly deferred (not silently omitted).
6. State/manifest lifecycle is explicit (atomic updates, orphan cleanup, schema versioning).
7. Backup/revert operational contract is explicit.
8. Diagnostics contract is explicit (structured output + strict mode).
9. P3 output includes `Quality Gate Evidence` with required subsection schema and signoff rows.
10. Managed-target-only `revert` integration scenarios are fully specified and testable.

### Blocking Issues

- None blocker-level.

### Key Constraints

- No plaintext secrets in repo or logs.
- No hidden global config scope.
- No symlink fallback path.
- Required secrets unresolved => non-zero exit.

### Implementation Order

1. Define command semantics + exit codes.
2. Define secret resolution lifecycle and auth preflight behavior (desktop auth local, service-account auth automation).
3. Define logging/redaction policy.
4. Define AGENTS freshness operational flow (`generate-missing`, `check-stale`).
5. Define state + orphan cleanup lifecycle and atomic write behavior.
6. Define backup/revert command semantics and scope.
7. Define diagnostics output and strict-mode behavior.
8. Document deferred hook/CI integration points.
9. Define runtime TDD + integration-test checkpoints and coverage contract.

## Verification Steps

```bash
cat specs/pending/unified-ai-tooling/outputs/manifest.json | jq .

rg -n "^## Quality Gate Evidence" specs/pending/unified-ai-tooling/outputs/p3-runtime-integration.md

rg -n "^### (Test Suites Executed|Fixture Sets Used|TDD Evidence|Pass/Fail Summary|Unresolved Risks|Review Signoff)$" specs/pending/unified-ai-tooling/outputs/p3-runtime-integration.md

rg -n "^\\| Design/Architecture \\|" specs/pending/unified-ai-tooling/outputs/p3-runtime-integration.md
rg -n "^\\| Security/Secrets \\|" specs/pending/unified-ai-tooling/outputs/p3-runtime-integration.md

! rg -n "\\|[^|]*\\|[^|]*\\|[^|]*\\| rejected \\|" specs/pending/unified-ai-tooling/outputs/p3-runtime-integration.md
```

## Known Issues and Gotchas

- Do not make required secret resolution optional.
- Differentiate "hooks/CI deferred" from "workflow undefined".
- Keep cleanup and revert semantics deterministic and auditable.
- `revert` scope is managed targets only in v1.
