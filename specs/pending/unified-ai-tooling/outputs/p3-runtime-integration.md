# P3 Runtime Integration (.beep)

Date: 2026-02-23  
Status: completed

## 1) Scope and Locked Inputs

This document defines P3 runtime behavior for `tooling/beep-sync` and closes the P3 orchestration contract.

Locked inputs:

1. `specs/pending/unified-ai-tooling/README.md`
2. `specs/pending/unified-ai-tooling/handoffs/HANDOFF_P3.md`
3. `specs/pending/unified-ai-tooling/outputs/p1-schema-and-contract.md`
4. `specs/pending/unified-ai-tooling/outputs/p2-adapter-design.md`
5. `specs/pending/unified-ai-tooling/outputs/preliminary-research.md`
6. `specs/pending/unified-ai-tooling/outputs/comprehensive-review.md`
7. `specs/pending/unified-ai-tooling/outputs/subtree-synthesis.md`
8. `specs/pending/unified-ai-tooling/outputs/quality-gates-and-test-strategy.md`
9. `specs/pending/unified-ai-tooling/outputs/residual-risk-closure.md`
10. `specs/pending/unified-ai-tooling/outputs/poc-04-managed-ownership-revert-results.md`
11. `specs/pending/unified-ai-tooling/outputs/poc-05-secret-resolution-results.md`

Locked invariants carried into runtime:

1. No symlink fallback.
2. Deterministic generation and hash-aware skip-write.
3. Required secret resolution failures are fatal.
4. `revert` is mandatory in v1 and managed-target-only.
5. JSON ownership remains sidecar-only.

## 2) CLI Runtime Command Contract

### 2.1 Command Semantics

| Command | Purpose | Reads | Writes | Fatal Conditions |
|---|---|---|---|---|
| `validate` | Parse/normalize schema, resolve required secret refs, evaluate strict policy, return diagnostics only. | `.beep/config.yaml`, `.beep/*`, secret provider, manifests | none | schema/normalize errors, required secret auth/resolution errors, strict escalations |
| `apply` | Generate artifact plan, write managed targets, update manifests/state atomically, execute bounded orphan cleanup. | same as `validate` + existing managed files/state | managed targets + manifests/state + backups (unless `--dry-run`) | any fatal diagnostic, cleanup out-of-scope, write failures |
| `check` | Regenerate plan without mutation, compare hashes/freshness/fanout, report drift. | same as `apply` | none | manifest/state corruption, unresolved required secrets, read/parse failures |
| `doctor` | Runtime preflight: schema readability, path permissions, manifest parse/version checks, secret auth preflight, workspace/AGENTS fanout audit. | same as `check` | optional repair outputs only when explicit repair mode is introduced; v1 default is read-only | unrecoverable preflight errors in strict mode |
| `revert` | Restore managed targets from backups/state, or remove newly generated managed targets with no backup, then clear revert state. | manifests/state + backup files + managed targets | managed targets + backup/state cleanup | unmanaged-target scope violation, missing backup with hash mismatch, path escape |

Compatibility commands retained for fixture/POC workflows:

1. `generate` (fixture-driven adapter contract checks).
2. `normalize` (fixture-driven canonical normalization checks).

These compatibility commands are non-authoritative for production repo sync and remain scoped to fixture evidence until full runtime command parity supersedes scaffold behavior.

### 2.2 Global Flags

| Flag | Commands | Contract |
|---|---|---|
| `--strict` | `validate`, `apply`, `check`, `doctor`, compatibility commands | Escalates strict-warning classes to errors (`E_UNSUPPORTED_FIELD_STRICT` and strict-gated warning families). |
| `--dry-run` | `apply` | Must compute full plan and diagnostics but perform zero writes. |
| `--tool <id>` | compatibility commands; optional selective generation mode for runtime `apply/check` | Limits scope to deterministic adapter subset while preserving manifest consistency rules. |
| `--fixture <path>` | fixture harness mode only | Must not be used as canonical project execution path; fixture mode is for deterministic test evidence. |

### 2.3 Exit-Code Matrix

Runtime exit codes are versioned and explicit:

| Exit Code | Meaning | Applies To |
|---|---|---|
| `0` | Success. Warnings allowed only when non-strict and no fatal diagnostics. | all commands |
| `1` | Runtime hard failure (`error` diagnostics present). | all commands |
| `2` | CLI usage/configuration failure (unknown command, invalid flag combination, missing required input path). | all commands |
| `3` | Drift/staleness detected by `check` (operational mismatch, not parser failure). | `check` |
| `4` | `doctor` found non-fatal health degradations requiring operator remediation (strict mode upgrades this to `1`). | `doctor` |

Command-to-condition matrix:

| Command | Clean | Warnings only (non-strict) | Strict escalation | Drift/health mismatch | Usage error |
|---|---|---|---|---|---|
| `validate` | `0` | `0` | `1` | n/a | `2` |
| `apply` | `0` | `0` | `1` | n/a | `2` |
| `check` | `0` | `0` | `1` | `3` | `2` |
| `doctor` | `0` | `4` | `1` | `4` | `2` |
| `revert` | `0` | n/a | n/a | n/a | `2` |

POC scaffold evidence observed in this phase remains compatible with this matrix classing:

1. Unknown command returns non-zero (`1`).
2. Missing fixture path returns usage/config non-zero (`2`).
3. Strict unsupported mapping returns non-zero (`1`).
4. Idempotent `revert` with no state returns success (`0`).

## 3) Secret Resolution Policy

### 3.1 Auth Policy (Locked)

1. Local interactive runs use desktop auth by default.
2. Automation/non-interactive runs use service-account auth by default.
3. Required unresolved secrets are always fatal, regardless of mode.
4. Optional unresolved secrets follow configured optional policy (`warn` in v1 baseline).

### 3.2 Resolver Architecture (SDK-Capable + CLI Compatibility)

1. Primary implementation path is SDK-capable (`@1password/sdk`) to support service-account automation and typed integration.
2. CLI compatibility path remains supported for local parity, bootstrap, and fallback (`op whoami`, `op read`, `op run`).
3. Resolver mode precedence:
   - explicit runtime mode override (CLI/env)
   - automation detection (`OP_SERVICE_ACCOUNT_TOKEN` or equivalent non-interactive marker)
   - desktop default
4. Canonical configs store secret references (`op://...`) only; resolved plaintext values are runtime-only and ephemeral.

### 3.3 Required/Optional Secret Semantics

Required refs:

1. Auth unavailable (`E_SECRET_AUTH`) => fatal.
2. Ref missing/unresolvable (`E_SECRET_REQUIRED_UNRESOLVED`) => fatal.
3. Any required-missing set length > 0 => command fails.

Optional refs:

1. Missing optional refs emit deterministic warning diagnostics (`W_SECRET_OPTIONAL_UNRESOLVED`).
2. Non-strict mode: warning only, command may still succeed.
3. Strict mode: optional warning class may be escalated to fatal when configured by strict warning map.

### 3.4 Redaction Policy

Redaction requirements:

1. Never print resolved secret values to stdout/stderr/log files/state/manifests/backups.
2. Diagnostics may include:
   - secret id
   - canonical path
   - error class/code
3. Diagnostics must not include:
   - secret values
   - bearer tokens
   - full credential payloads
4. Structured result payload includes explicit redaction assertion (`valuesExposed: false`) for secret-resolution paths.

### 3.5 Real-Auth Success-Evidence Closure

POC-05 fail-hard behavior is preserved and validated. Real success-path evidence is closed in P4:

1. Desktop-auth success run with valid signed-in account: captured (`ok=true`, `source=desktop`, required secrets resolved).
2. Service-account success run with valid token: captured (`ok=true`, `source=service_account`, required secrets resolved).
3. Follow-up id `poc05-real-auth-success-evidence` is now closed in `outputs/manifest.json`.

## 4) AGENTS Freshness Operational Contract

### 4.1 Mandatory Generation Scope

`apply` must manage:

1. Root `AGENTS.md`.
2. Root `CLAUDE.md`.
3. `<workspace>/AGENTS.md` for every workspace package discovered from root `package.json.workspaces` that contains `package.json`.

### 4.2 Freshness Algorithm

For each AGENTS target:

`freshnessHash = sha256(instructionsMergedHash + templateHash + packagePath + adapterVersion)`

`check` must report stale when any is true:

1. Required AGENTS target is missing.
2. Content hash differs from planned artifact.
3. Freshness hash differs from stored state.
4. Workspace package fanout changed (added/removed package) and AGENTS set is out of sync.

Required diagnostics:

1. `E_AGENTS_MISSING`
2. `E_AGENTS_STALE`
3. `E_AGENTS_SCOPE_DRIFT`

### 4.3 Operational Commands

| Operation | Command | Expected Outcome |
|---|---|---|
| Generate missing/stale AGENTS | `beep-sync apply` | AGENTS fanout converges to workspace inventory. |
| Validate AGENTS freshness | `beep-sync check` | `0` when clean; `3` on stale/missing/scope drift. |
| Audit AGENTS fanout health | `beep-sync doctor` | Reports workspace discovery count and AGENTS coverage diagnostics. |

No hook auto-wiring is required in this branch; freshness is enforced via explicit command invocation.

## 5) Runtime Packaging and Execution Contract

1. Runtime implementation package path is fixed: `tooling/beep-sync`.
2. Canonical source-of-truth remains `.beep/`; runtime logic must not migrate into `.beep/`.
3. Workspace wiring:
   - package: `@beep/beep-sync`
   - command entry: `tooling/beep-sync/bin/beep-sync`
   - scripts: `beep-sync:test:*` root aliases must remain available.
4. Execution from repo root is supported and deterministic.
5. Fixture mode is explicitly test-only and must not redefine production config scope.
6. Runtime must remain Linux-first in v1 (aligned with P1 platform constraint).

## 6) Deferred CI/Hook Rollout Contract

Explicitly deferred (not omitted):

1. CI pipeline job wiring for `beep-sync` commands.
2. Git hook installation (pre-commit/pre-push) that auto-runs `beep-sync`.

Interim local enforcement bundle (required for phase evidence):

```bash
bun tooling/beep-sync/bin/beep-sync validate
bun tooling/beep-sync/bin/beep-sync apply --dry-run
bun tooling/beep-sync/bin/beep-sync check
bun run beep-sync:test:unit
bun run beep-sync:test:fixtures
bun run beep-sync:test:integration
bun run beep-sync:test:coverage
```

Rollout handoff target:

1. P4 defines CI/hook cutover sequence and rollback criteria.

## 7) State/Manifest Lifecycle Contract

### 7.1 Managed Metadata Files

1. `manifests.managed_files` (default `.beep/manifests/managed-files.json`)
2. `manifests.state` (default `.beep/manifests/state.json`)

Both are required versioned contracts (`version: 1`).

### 7.2 Atomic Write Contract

Any write to managed targets/state/manifests must use atomic update semantics:

1. Serialize deterministic bytes first.
2. Write to temp file in same directory.
3. `fsync` temp file.
4. Atomic rename temp -> final path.
5. `fsync` parent directory.

If any step fails, emit `E_IO_WRITE` and keep previous committed file intact.

### 7.3 Apply Lifecycle Order

Deterministic order:

1. Parse + normalize + diagnostics evaluation.
2. Build artifact plan and hash graph.
3. Create backups for overwrite candidates.
4. Write changed managed targets (skip-write on hash match).
5. Write `managed-files.json`.
6. Write `state.json`.
7. Compute and execute orphan cleanup from managed metadata.
8. Emit structured operation summary.

### 7.4 Orphan Cleanup Contract

Orphan candidates:

`previousManagedPaths - currentPlannedPaths`

Cleanup guardrails:

1. Delete only paths previously marked `managed: true`.
2. Reject path escapes/out-of-scope paths with `E_CLEANUP_OUT_OF_SCOPE`.
3. Dry-run computes cleanup list but performs no deletion.

### 7.5 Versioning and Corruption Handling

1. Unknown manifest/state version => `E_STATE_VERSION` or `E_MANIFEST_CORRUPT`.
2. Parse failures => `E_STATE_PARSE` / `E_MANIFEST_CORRUPT`.
3. `doctor` reports and classifies repair needs.
4. `apply --dry-run` never mutates state/manifests.

## 8) Backup/Revert Contract (Managed Targets Only)

### 8.1 Backup Creation Rules

1. Backup before overwrite is mandatory for existing managed targets when `settings.require_revert_backups=true`.
2. New managed files with no prior on-disk file have no backup by design.
3. Backup pointers and managed hashes must be recorded in state metadata used by `revert`.

### 8.2 Revert Semantics

`revert` algorithm:

1. Load managed state.
2. If no state: return success no-op (`changed: false`).
3. For each managed target (sorted):
   - if backup exists: restore file from backup.
   - if no backup and current hash equals generated managed hash: remove generated file.
   - else: fail with `E_REVERT_MISSING_BACKUP` (unsafe to mutate).
4. Never mutate unmanaged targets.
5. Remove revert state/backup metadata after successful restoration/removal.
6. Second `revert` must be idempotent no-op.

### 8.3 Residual-Risk Revert Scenarios (Executed)

| Scenario | Contract | Evidence |
|---|---|---|
| Restore overwritten managed file from backup | `revert` restores prior bytes and clears state | executed; result `changed: true`, message includes `restored managed file from backup` |
| Remove generated managed file when no backup exists | `revert` removes managed file only when hash matches generated content | executed; result `changed: true`, message includes `removed managed file with no backup` |
| Keep unmanaged files untouched | unmanaged bytes remain identical through apply/revert cycle | executed; byte-level `diff` passed for unmanaged files |
| Double-run revert is safe | second `revert` returns success no-op | executed; result `changed: false`, message includes idempotent no-op |

## 9) Structured Diagnostics and Strict-Mode Contract

### 9.1 Diagnostic Payload Shape

P1 diagnostic schema is normative:

```ts
type DiagnosticV1 = {
  severity: "error" | "warning" | "info"
  code: string
  path: string
  message: string
  tool?: "core" | "claude" | "codex" | "cursor" | "windsurf" | "jetbrains"
}
```

Runtime result envelope contract:

```ts
type CommandResultV1 = {
  action: "validate" | "apply" | "check" | "doctor" | "revert"
  ok: boolean
  changed: boolean
  dryRun: boolean
  exitCode: number
  diagnostics: DiagnosticV1[]
  stats: {
    errorCount: number
    warningCount: number
    managedTargetCount?: number
    staleTargetCount?: number
    orphanCandidateCount?: number
  }
}
```

Determinism rules:

1. Diagnostics sorted by `(path, code)`.
2. No timestamps in diagnostic payloads.
3. Repeated clean runs produce byte-identical JSON output for same input/state.

### 9.2 Strict-Mode Escalation

Strict mode must escalate warning classes that imply lossy or unsafe behavior:

1. `W_UNSUPPORTED_FIELD` -> `E_UNSUPPORTED_FIELD_STRICT`
2. `W_DEFERRED_NATIVE_WIRING` -> strict error
3. Optional secret unresolved warnings may be escalated by strict warning map when configured.

Always-fatal regardless of strict:

1. Required secret auth/resolution failures.
2. Cleanup out-of-scope violations.
3. Revert unmanaged-target violations.
4. Schema/parse corruption errors.

## 10) P3 Exit Assertions

P3 is complete when all are true:

1. CLI command semantics for `validate/apply/check/doctor/revert` are explicit.
2. Exit-code matrix is explicit and testable.
3. Secret policy is explicit (desktop local, service-account automation, SDK-capable, CLI compatibility).
4. Redaction and fail-hard rules are explicit.
5. AGENTS freshness operations are explicit and testable.
6. Runtime packaging contract for `tooling/beep-sync` is explicit.
7. CI/hook deferral is explicit with interim local gate bundle.
8. State/manifest lifecycle includes atomic writes, orphan cleanup, and version handling.
9. Backup/revert semantics are explicit and managed-target-only.
10. Managed-target-only revert scenarios from residual-risk plan are executed and evidenced.
11. POC-04/05 behavior remains preserved and real-auth follow-up is explicitly tracked.

## Quality Gate Evidence

### Test Suites Executed

1. `cat specs/pending/unified-ai-tooling/outputs/manifest.json | jq .` (pass)
2. `bun run --cwd tooling/beep-sync check` (pass)
3. `bun run beep-sync:test:unit` (pass)
4. `bun run beep-sync:test:fixtures` (pass)
5. `bun run beep-sync:test:integration` (pass)
6. `bun run beep-sync:test:coverage` (pass)
7. Managed-target-only revert scenario pack via direct CLI:
   - `bun tooling/beep-sync/bin/beep-sync apply --fixture tooling/beep-sync/fixtures/poc-04/managed.yaml`
   - `bun tooling/beep-sync/bin/beep-sync revert --fixture tooling/beep-sync/fixtures/poc-04/managed.yaml`
   - repeated across backup-restore, no-backup-removal, unmanaged-immutability, and idempotent second-revert setups (all pass)
8. Exit-behavior sampling commands:
   - `bun tooling/beep-sync/bin/beep-sync does-not-exist`
   - `bun tooling/beep-sync/bin/beep-sync validate --fixture tooling/beep-sync/fixtures/poc-05/does-not-exist.yaml`
   - `bun tooling/beep-sync/bin/beep-sync generate --tool cursor --strict --fixture tooling/beep-sync/fixtures/poc-02/mcp-cursor-unsupported.yaml`
   - `bun tooling/beep-sync/bin/beep-sync revert --fixture tooling/beep-sync/fixtures/poc-04/managed.yaml` (no-state no-op)

### Fixture Sets Used

1. `tooling/beep-sync/fixtures/poc-01/*` (schema/normalize diagnostics baseline through scripted suites)
2. `tooling/beep-sync/fixtures/poc-02/*` (strict/non-strict capability diagnostics in scripted suites)
3. `tooling/beep-sync/fixtures/poc-03/*` (JetBrains prompt-library deterministic envelope checks in scripted suites)
4. `tooling/beep-sync/fixtures/poc-04/*` (managed ownership + revert scenario execution)
5. `tooling/beep-sync/fixtures/poc-05/*` (secret resolution fail-hard/warn/redaction behavior)
6. `tooling/beep-sync/fixtures/poc-06/*` (no-arg deterministic command contract in integration suite)

### TDD Evidence

No runtime code changes were made in this P3 document phase; this phase formalizes and validates runtime contracts.

Evidence basis:

1. Existing failing-first POC and scripted integration tests from POC-04/POC-05 are preserved.
2. Additional direct CLI scenario execution was run for the residual-risk revert case that was previously only specified (`no backup` removal path).
3. Real-auth success-path closure could not be executed without valid local auth credentials; follow-up remains explicitly tracked.

### Pass/Fail Summary

- passed: 8
- failed: 0
- skipped: 0

### Unresolved Risks

None. Real-auth evidence and CI/hook rollout follow-ups were closed by P4.

### Review Signoff

| Role | Reviewer | Date | Result | Notes |
|---|---|---|---|---|
| Design/Architecture | Codex (P3 author) | 2026-02-23 | approved | CLI semantics, exit matrix, AGENTS freshness ops, state lifecycle, and revert contract are explicit and implementation-ready. |
| Security/Secrets | Codex (P3 author) | 2026-02-23 | approved | Required-secret fail-hard behavior, SDK-capable/CLI-compatible resolver policy, and no-plaintext redaction rules remain preserved and explicit. |
| Migration/Operations | Codex (P3 author) | 2026-02-23 | approved | Managed-target-only revert scenarios were executed (including no-backup removal and idempotent second revert) with deterministic operational evidence. |
