# Quality Gates and Test Strategy (.beep / beep-sync)

Date: 2026-02-23
Status: required

## 1. Non-Negotiable Quality Policy

1. TDD is mandatory for runtime code changes.
2. Every bug fix starts with a failing regression test.
3. No phase in P1-P4 can be marked complete without explicit gate evidence.
4. Unit tests are required for all parser, normalizer, serializer, adapter, and state-manifest logic.
5. Golden fixture tests are required for every tool adapter target.
6. Integration tests are required for CLI contracts and failure semantics.
7. Review signoff is required for architecture, security/secrets, and migration safety.
8. `revert` is mandatory in v1 runtime scope (managed targets only) and must be tested.

Applicability note:
- P0 is grandfathered because it completed before this policy was formalized.

## 2. Hard Validation Checkpoints

| Checkpoint | Hard Gate | Evidence Required |
|---|---|---|
| Schema validity | Canonical config schema validates known-good fixtures and rejects known-bad fixtures | Test output + fixture list in P1 output |
| Determinism | Same source produces byte-identical targets and unchanged files are skipped | Determinism test results in P2/P3 outputs |
| Drift detection | `check` detects stale managed files and metadata mismatch | CLI integration test in P3 output |
| Capability safety | Unsupported fields produce deterministic warnings/errors | Adapter fixture tests in P2 output |
| Secret safety | Required unresolved secrets fail hard with redacted logs | CLI integration tests in P3 output |
| Cleanup safety | Orphan cleanup only removes files previously marked managed | State/cleanup tests in P3 output |
| Revert safety | Revert restores prior state from backups/metadata | Revert integration tests in P3/P4 outputs |
| Migration safety | Shadow mode + rollback rehearsal pass before managed cutover | Migration validation checklist in P4 output |

## 3. Required Test Matrix by Phase

### P1: Schema + Compiler Contract

1. Parser and schema unit tests:
   - valid minimal config
   - valid full config
   - invalid structure/typing
   - invalid precedence collisions
2. Normalization unit tests:
   - defaulting behavior
   - precedence resolution
   - idempotent normalize(normalize(x))
3. Negative tests:
   - unsupported required fields
   - malformed secret references
4. Review checkpoint:
   - schema contract review against ADRs

### P2: Adapter Design

1. Golden fixture tests per adapter (Claude, Codex, Cursor, Windsurf, JetBrains).
2. Capability-map tests:
   - supported field pass-through
   - transformed field output
   - dropped field warning
   - strict-mode failure escalation
3. Serialization determinism tests:
   - stable ordering
   - stable formatting
4. Review checkpoint:
   - cross-tool mapping review
   - lossy conversion policy review

### P3: Runtime Integration

1. CLI integration tests:
   - `validate`, `apply`, `check`, `doctor`
   - exit-code matrix (success, warning, hard-failure)
2. Secret lifecycle tests:
   - desktop-auth path
   - service-account path
   - required secret missing -> failure
   - redaction of secret values in logs/errors
3. State/cleanup/revert tests:
   - state metadata update
   - orphan cleanup bounded to managed files
   - revert restores backups correctly
4. Review checkpoint:
   - operational safety review
   - secret-handling review

### P4: Migration + Cutover

1. Shadow-mode migration tests on representative repo fixtures.
2. Managed ownership takeover tests.
3. Rollback rehearsal tests from failed/partial cutover scenarios.
4. Review checkpoint:
   - migration checklist review
   - rollback readiness review

## 4. Minimum Coverage and Test Depth

1. Unit test coverage target for `tooling/beep-sync` runtime code:
   - line coverage >= 90%
   - branch coverage >= 80%
2. All critical paths must have at least one negative test:
   - schema validation
   - adapter capability filtering
   - secret resolution
   - managed-file cleanup
   - revert flow
3. Golden fixtures must include at least:
   - one happy-path fixture per tool
   - one lossy/unsupported-path fixture per tool

## 5. Review Requirements (Thorough Reviews)

1. Design review:
   - contract correctness
   - portability boundaries
   - deterministic behavior
2. Security review:
   - no plaintext secret persistence
   - fail-hard handling verified
   - log redaction verified
3. Migration review:
   - no dual ownership ambiguity
   - rollback validated in one-session procedure
4. Review signoff must be captured in each phase output under `Quality Gate Evidence`.

## 6. Evidence Contract for Phase Outputs

Each phase output (`p1`..`p4`) must include a `Quality Gate Evidence` section with this exact heading layout:

```markdown
## Quality Gate Evidence
### Test Suites Executed
### Fixture Sets Used
### TDD Evidence
### Pass/Fail Summary
### Unresolved Risks
### Review Signoff
```

Required content rules:

1. `### Test Suites Executed`:
   - list exact commands executed and result state.
2. `### Fixture Sets Used`:
   - list fixture directories/files used for validation.
3. `### TDD Evidence`:
   - show at least one failing-first test reference for new logic (or justify no-code phase).
4. `### Pass/Fail Summary`:
   - include counts (passed/failed/skipped).
5. `### Unresolved Risks`:
   - list open risks or explicitly state `None`.
6. `### Review Signoff`:
   - include the signoff table below.

Signoff table template:

```markdown
| Role | Reviewer | Date | Result | Notes |
|---|---|---|---|---|
| Design/Architecture | <name> | YYYY-MM-DD | approved/rejected | <notes> |
| Security/Secrets | <name> | YYYY-MM-DD | approved/rejected | <notes> |
| Migration/Operations | <name or N/A> | YYYY-MM-DD | approved/rejected/N/A | <notes> |
```

Signoff rules:

1. `Design/Architecture` and `Security/Secrets` rows are required in all phases.
2. `Migration/Operations` row is required in P4; for P1-P3 it may be `N/A`.
3. A phase cannot be marked complete if any required signoff row is missing or `rejected`.

Phase status in `outputs/manifest.json` must not be moved to completed without that evidence section.
