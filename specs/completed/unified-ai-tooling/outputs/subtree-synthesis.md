# Subtree Synthesis: Patterns to Adopt for `.beep` / `beep-sync`

Date: 2026-02-23
Scope: synthesis of subtree analyses under `.repos/*` into concrete spec upgrades

## 1. Inputs Reviewed

- `subtree-add-mcp-analysis.md`
- `subtree-agent-rules-analysis.md`
- `subtree-agent-sync-analysis.md`
- `subtree-agnix-analysis.md`
- `subtree-ai-rulez-analysis.md`
- `subtree-claude-setup-analysis.md`
- `subtree-lnai-analysis.md`
- `subtree-ruler-analysis.md`
- `subtree-rulesync-analysis.md`

## 2. High-Value Reusable Patterns

### 2.1 Canonical model + adapter registry

Adopt a strict canonical model (`.beep/config.yaml` + markdown assets) and a plugin-style adapter registry with per-tool capabilities and transform hooks. This gives deterministic one-to-many generation without N^2 format converters.

Source signals:
- `lnai`, `agent-sync`, `add-mcp`, `rulesync`

### 2.2 Deterministic generation + skip-write

Sort outputs deterministically, hash generated content, and skip file writes when the hash is unchanged. This reduces git noise and watcher churn.

Source signals:
- `ai-rulez`, `lnai`, `agent-sync`

### 2.3 Manifest/state + orphan cleanup

Maintain managed-file state and clean orphaned generated files when source no longer emits them. Include source hash, rendered hash, adapter version, and timestamp.

Source signals:
- `lnai`, `agent-sync`, `ruler`

### 2.4 Full-file ownership by default

Keep managed targets full-file rewrite once ownership is claimed. Avoid merge-in-place for managed files; reserve merge/skip choices for import/bootstrap paths only.

Source signals:
- `ruler`, `rulesync`, `add-mcp`

### 2.5 Symmetric backup/revert

Before overwrite of managed targets, keep reversible backups and provide a first-class `revert` flow.

Source signals:
- `ruler`

### 2.6 Capability-aware MCP translation

Use an explicit per-tool MCP capability map and strip/warn on unsupported fields during emit. Normalize canonical MCP once, then transform per target.

Source signals:
- `rulesync`, `add-mcp`, `lnai`

### 2.7 Warning/error taxonomy with strict mode

Surface lossy mappings and unsupported fields as structured diagnostics. Provide strict mode to fail on warnings relevant to portability/safety.

Source signals:
- `agent-sync`, `agnix`, `lnai`

### 2.8 Managed markers and `.gitignore` policy

Use generated headers for Markdown/text targets and sidecar metadata for JSON targets. Manage `.gitignore` through a bounded managed block for local-only artifacts.

Source signals:
- `ai-rulez`, `ruler`, `lnai`

### 2.9 Rule layering for monorepo scopes

Apply root instructions first, then package-level overlays. Require one root canonical instruction source and generated package-level `AGENTS.md` coverage.

Source signals:
- `agent-rules`, `rulesync`, `ruler`

### 2.10 Context bootstrap hooks (optional)

Keep optional runtime hook contracts for context crawling, skill suggestions, and pattern detection, but do not block v1 compiler delivery on these workflows.

Source signals:
- `claude-setup`

## 3. Decisions Applied to This Spec

1. `beep-sync` architecture will be registry/adapter-based with capability declarations.
2. Managed generation is deterministic and hash-aware; unchanged targets are not rewritten.
3. Managed outputs use full-file rewrite semantics after ownership cutover.
4. State/manifest metadata is required for drift detection and orphan cleanup.
5. Backup/revert contract is in scope for operational safety.
6. MCP adapters must validate against per-tool capability maps and emit warnings/errors on field drops.
7. Diagnostics model includes machine-readable warnings/errors and strict-fail mode.
8. Markdown/text managed files include generated headers; strict JSON files use sidecar metadata.
9. Instruction layering is root-first with package-level overlay; every workspace package gets a managed `AGENTS.md`.
10. Hook/CI wiring remains deferred in this branch, but command contracts must support future integration.
11. `revert` is mandatory in v1 runtime scope and is limited to managed targets.

## 4. Explicit Non-Adoptions

1. Symlink-based sync is not adopted due known caching/path issues in current toolchains.
2. User-home global state (`~/.<tool>`) as canonical scope is not adopted in v1 (project-only design).
3. Silent lossy conversions are not acceptable; warnings must be surfaced, with strict mode to fail.
4. Non-fatal required-secret resolution is not allowed; unresolved required secrets fail hard.

## 5. Phase Impact

### P1 (Schema + compiler contract)

- Add adapter capability descriptors to schema-level contracts.
- Define sidecar/state schemas for hash tracking and managed ownership.
- Define canonical precedence and package-level AGENTS layering rules.

### P2 (Adapter design)

- Provide per-tool MCP capability matrices and transform/drop behavior.
- Define deterministic serialization order and managed markers per output type.
- Define unsupported-field policy (warn vs error) per domain.

### P3 (Runtime integration)

- Add command semantics for state refresh, orphan cleanup, strict mode, and revert.
- Specify diagnostic output formats (human + machine-readable).
- Specify backup lifecycle and rollback behavior.

### P4 (Migration + cutover)

- Include import/bootstrap conflict policy (`overwrite` default, optional `skip` for bootstrap).
- Include ownership takeover sequence with backup checkpoints.
- Include managed `.gitignore` block policy for local-only outputs.

## 6. Remaining Validation Targets (Pre-Implementation)

1. Confirm exact JetBrains prompt-library file placement and portability constraints with fixture tests.
2. Lock Cursor and Windsurf MCP target schemas with local fixtures to guard vendor-doc drift.
3. Validate managed-target-only `revert` behavior with fixture-driven runtime tests.
