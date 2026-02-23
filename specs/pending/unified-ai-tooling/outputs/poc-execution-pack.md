# POC Execution Pack (.beep)

Date: 2026-02-23
Status: ready to execute

## 1. Purpose

Run targeted pre-validation POCs before committing to full implementation, so design assumptions are validated with concrete fixtures and command evidence.

## 2. POC Order (Mandatory)

1. POC-01: Canonical Compiler
2. POC-02: MCP Capability Maps
3. POC-03: JetBrains Prompt Library
4. POC-04: Managed Ownership + Revert
5. POC-05: Secret Resolution
6. POC-06: End-to-End Dry Run

## 3. Artifacts

Master command templates:
- `specs/pending/unified-ai-tooling/outputs/poc-command-templates.md`

POC result stubs:
- `specs/pending/unified-ai-tooling/outputs/poc-01-canonical-compiler-results.md`
- `specs/pending/unified-ai-tooling/outputs/poc-02-mcp-capability-results.md`
- `specs/pending/unified-ai-tooling/outputs/poc-03-jetbrains-prompt-library-results.md`
- `specs/pending/unified-ai-tooling/outputs/poc-04-managed-ownership-revert-results.md`
- `specs/pending/unified-ai-tooling/outputs/poc-05-secret-resolution-results.md`
- `specs/pending/unified-ai-tooling/outputs/poc-06-end-to-end-dry-run-results.md`

## 4. Shared Rules

1. Every POC must include actual command outputs or explicit blocked reason.
2. Every POC must include fixture set references.
3. Every POC must include pass/fail verdict.
4. No POC may be marked passed with missing required signoff rows.
5. If a POC fails, record decision and mitigation before continuing.

## 5. POC Goals and Pass Criteria

### POC-01 Canonical Compiler

Goal:
- Validate schema parsing, normalization, precedence, and deterministic hash behavior.

Minimum pass criteria:
1. Valid fixtures parse and normalize successfully.
2. Invalid fixtures fail with deterministic diagnostics.
3. Repeated runs produce identical normalized output/hash.

### POC-02 MCP Capability Maps

Goal:
- Validate Cursor/Windsurf/Codex MCP field mapping and strict/non-strict behavior.

Minimum pass criteria:
1. Capability tables exist and are fixture-backed.
2. Unsupported fields warn in default mode.
3. Unsupported fields fail in strict mode.
4. No silent field drops.

### POC-03 JetBrains Prompt Library

Goal:
- Validate default `bundle_only` mode and optional native-file probe.

Minimum pass criteria:
1. Bundle artifacts are deterministic.
2. If native-file mode used, fixture proof includes stable path/format and safe round trip.
3. If native-file not proven, default remains `bundle_only` and is accepted.

### POC-04 Managed Ownership + Revert

Goal:
- Validate managed-file boundaries, cleanup safety, and revert semantics.

Minimum pass criteria:
1. Cleanup only touches managed files.
2. Unmanaged files remain untouched.
3. Revert restores/undoes managed changes.
4. Revert is idempotent on second run.

### POC-05 Secret Resolution

Goal:
- Validate 1Password resolution behavior and fail-hard/redaction policy.

Minimum pass criteria:
1. Required unresolved secrets fail hard.
2. Optional unresolved secrets follow explicit policy.
3. Secret values are redacted from logs and diagnostics.
4. Local desktop auth and automation/service-account paths are both documented.

### POC-06 End-to-End Dry Run

Goal:
- Validate operational flow and deterministic no-op behavior.

Minimum pass criteria:
1. `validate`, `apply --dry-run`, `check`, and `doctor` contracts are exercised.
2. Dry-run output is deterministic.
3. No unbounded churn in generated targets.

## 6. Go/No-Go Criteria

Go:
1. POC-01..POC-06 all pass.
2. Any deviations have approved mitigations and explicit follow-ups.
3. Required signoff rows are present and non-rejected across all six results.

No-Go:
1. Any mandatory pass criterion fails without mitigation.
2. Any required signoff row is missing or rejected.
3. Managed-target boundary or secret redaction guarantees are not demonstrated.
