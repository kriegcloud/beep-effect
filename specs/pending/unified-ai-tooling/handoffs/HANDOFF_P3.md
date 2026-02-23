# HANDOFF P3: Runtime Integration (CLI, Secrets, Operational Contract)

## Context Budget

Read first:
- `README.md`
- `outputs/p1-schema-and-contract.md`
- `outputs/p2-adapter-design.md`
- `outputs/preliminary-research.md`
- `outputs/comprehensive-review.md`

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
5. Document deferred hook/CI integration points.

## Verification Steps

```bash
cat specs/pending/unified-ai-tooling/outputs/manifest.json | jq .
```

## Known Issues and Gotchas

- Do not make required secret resolution optional.
- Differentiate "hooks/CI deferred" from "workflow undefined".
