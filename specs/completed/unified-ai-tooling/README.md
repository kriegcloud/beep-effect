# Unified AI Tooling (.beep)

## Status
ACTIVE

## Owner
@beep-dev

## Created
2026-02-23

## Last Updated
2026-02-23

## Quick Navigation

- [Quick Start](./QUICK_START.md)
- [Reflection Log](./REFLECTION_LOG.md)
- [Preliminary Research](./outputs/preliminary-research.md)
- [Compatibility Matrix](./outputs/tooling-compatibility-matrix.md)
- [Canonical Pattern Review](./outputs/canonical-pattern-review.md)
- [Comprehensive Review](./outputs/comprehensive-review.md)
- [Subtree Synthesis](./outputs/subtree-synthesis.md)
- [Quality Gates and Test Strategy](./outputs/quality-gates-and-test-strategy.md)
- [Residual Risk Closure](./outputs/residual-risk-closure.md)
- [1Password Setup Runbook](./outputs/onepassword-setup-runbook.md)
- [1Password Env Template](./outputs/onepassword-env-template.env)
- [1Password Setup Commands](./outputs/onepassword-op-setup-commands.sh)
- [Handoffs Index](./handoffs/README.md)
- [P1 Handoff](./handoffs/HANDOFF_P1.md)
- [P1 Orchestrator Prompt](./handoffs/P1_ORCHESTRATOR_PROMPT.md)
- [P5 Handoff](./handoffs/HANDOFF_P5.md)
- [P5 Orchestrator Prompt](./handoffs/P5_ORCHESTRATOR_PROMPT.md)
- [P6 Handoff](./handoffs/HANDOFF_P6.md)
- [P6 Orchestrator Prompt](./handoffs/P6_ORCHESTRATOR_PROMPT.md)
- [Outputs Manifest](./outputs/manifest.json)

## Purpose

Create a project-local, deterministic configuration compiler (`beep-sync`) that turns canonical `.beep/` data into native files for Claude Code, OpenAI Codex, Cursor, Windsurf, and JetBrains AI Assistant.

## Problem Statement

Current tooling requires manual duplication across incompatible config formats and locations. This causes:

1. Repetitive setup for MCP servers, hooks, commands, agents, and skills.
2. Silent drift and breakage between TOML/JSON/Markdown variants.
3. Repo pollution from tool-specific root files and folders.
4. No canonical source of truth for instructions and runtime config.

## Proposed Solution

Use `.beep/` as canonical source and compile to managed targets per tool. All managed outputs are generated, committed, and validated for deterministic drift detection. No symlink strategy is used.

## Primary Goal

Ship an implementation-ready spec that removes ambiguity before coding, including secret resolution, file ownership semantics, JetBrains parity scope, AGENTS freshness workflow, and packaging layout.

## Goals

- Canonical schema at `.beep/config.yaml` plus Markdown assets for instructions/skills/agents.
- Deterministic generation for all target tools in this repo.
- Single instruction source rendered to both `AGENTS.md` and `CLAUDE.md`.
- Project-level AGENTS freshness workflow (root + every workspace package).
- Secret reference workflow with 1Password and fail-hard behavior when required secrets cannot be resolved.
- Runtime implementation in existing monorepo workspace layout.
- Hard quality gates with TDD, unit tests, fixture tests, and review signoff.

## Non-Goals (v1)

- Windows support.
- Symlink-based syncing.
- User-level global overlay config (`~/.ai`, `~/.beep`).
- CI workflow additions in this branch.
- Pre-commit/pre-push wiring in this branch.

## Scope

### In Scope

- Canonical `.beep/` source model (rules/instructions, commands, hooks, MCP, agents, skills, tool overrides).
- Adapters for Claude, Codex, Cursor, Windsurf, JetBrains.
- Managed generation of `.codex/` and `.mcp.json` with commit policy.
- JetBrains project rules + MCP configuration + prompt-library parity in v1.
- Ownership model and managed-file metadata strategy for JSON targets.

### Out of Scope (for now)

- CI rollout.
- Repository hook rollout (contract is defined, integration is deferred).

## Success Criteria

- [ ] `.beep/config.yaml` is the canonical contract for this repo.
- [ ] `beep-sync apply` deterministically regenerates native files.
- [ ] `beep-sync check` detects stale outputs.
- [ ] Managed file ownership model is explicit (rewrite semantics + metadata tracking).
- [ ] Required secrets fail hard when unresolved.
- [ ] Skills are fully included in canonical model and generation flows.
- [ ] AGENTS freshness workflow is defined for root and every workspace package.
- [ ] JetBrains prompt-library artifacts are included in v1 managed scope.
- [ ] Runtime packaging path is explicit and compatible with existing workspaces.
- [ ] TDD-first workflow is defined and enforced in phase contracts.
- [ ] Phase outputs include explicit quality-gate evidence (tests + reviews).
- [ ] Coverage and fixture expectations are explicit for runtime implementation.

## Required Outputs

| Artifact                                     | Purpose                                                                                                                                    |
|----------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------|
| `outputs/preliminary-research.md`            | Source-backed baseline + decision-closing research                                                                                         |
| `outputs/tooling-compatibility-matrix.md`    | Tool-by-tool targets and constraints                                                                                                       |
| `outputs/canonical-pattern-review.md`        | Structure audit against completed-spec conventions                                                                                         |
| `outputs/comprehensive-review.md`            | Unknowns and pre-execution decision review                                                                                                 |
| `outputs/subtree-synthesis.md`               | Consolidated design patterns from local subtree prior art                                                                                  |
| `outputs/subtree-*-analysis.md`              | Per-repo deep-dives backing synthesis conclusions                                                                                          |
| `outputs/quality-gates-and-test-strategy.md` | Hard validation checkpoints, TDD policy, test matrix, and review gates                                                                     |
| `outputs/residual-risk-closure.md`           | Explicit closure gates for JetBrains prompt-library, Cursor/Windsurf MCP drift, revert validation, and local enforcement before CI rollout |
| `outputs/onepassword-setup-runbook.md`       | Step-by-step 1Password setup for local and automation readiness                                                                            |
| `outputs/onepassword-env-template.env`       | Ready-to-use `.env` template with `op://` references and ASCII layout                                                                      |
| `outputs/onepassword-op-setup-commands.sh`   | Idempotent copy/paste CLI bootstrap using exact `op` commands                                                                              |
| `outputs/p1-schema-and-contract.md`          | Canonical schema and compiler contract                                                                                                     |
| `outputs/p2-adapter-design.md`               | Per-tool adapter mapping design                                                                                                            |
| `outputs/p3-runtime-integration.md`          | CLI/runtime/secrets/operational contract                                                                                                   |
| `outputs/p4-cutover-playbook.md`             | Migration and cutover plan                                                                                                                 |
| `outputs/p5-runtime-implementation.md`       | Runtime implementation evidence for real command behavior (non-scaffold)                                                                   |
| `outputs/p6-final-verification.md`           | Final cross-agent sync verification and completion evidence                                                                                |
| `handoffs/HANDOFF_P1..P6.md`                 | Execution context for each phase                                                                                                           |
| `handoffs/P1..P6_ORCHESTRATOR_PROMPT.md`     | Copy-paste starter prompts                                                                                                                 |

## Architecture Decision Records

| ID      | Decision                                                                                                                                                                  | Rationale                                                                                              |
|---------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------|
| ADR-001 | Canonical namespace is `.beep/`                                                                                                                                           | Avoid collisions with existing `.ai` ecosystem tools                                                   |
| ADR-002 | Generated outputs are committed to git                                                                                                                                    | Deterministic auditability and reproducible onboarding                                                 |
| ADR-003 | No symlink strategy in v1                                                                                                                                                 | Avoid known caching/path-resolution issues                                                             |
| ADR-004 | One instruction source generates both `AGENTS.md` and `CLAUDE.md`                                                                                                         | Cross-tool parity with minimum bloat                                                                   |
| ADR-005 | Project-scoped config only                                                                                                                                                | Keep v1 deterministic and explicit                                                                     |
| ADR-006 | Linux-only support in v1                                                                                                                                                  | Matches current operating environment                                                                  |
| ADR-007 | Effect v4 implementation core                                                                                                                                             | Aligns with repo architecture choices                                                                  |
| ADR-008 | `.codex/` and `.mcp.json` are committed (unignored)                                                                                                                       | Matches desired generated-files policy                                                                 |
| ADR-009 | Secrets are stored as references; required resolution failures are fatal                                                                                                  | Prevent silent runtime misconfiguration                                                                |
| ADR-010 | 1Password auth policy is hybrid: desktop auth for local interactive runs, service-account auth for automation/non-interactive runs; required unresolved secrets are fatal | Balances local DX and automation reliability while preserving strict secret guarantees                 |
| ADR-011 | Runtime code lives in `tooling/beep-sync`; `.beep/` is config/data only                                                                                                   | Fits current workspace globs and monorepo tooling layout                                               |
| ADR-012 | Skills are first-class in canonical model and adapters                                                                                                                    | Explicit user requirement for full skill parity                                                        |
| ADR-013 | Managed targets use full-file rewrite semantics                                                                                                                           | Deterministic output beats partial merge ambiguity                                                     |
| ADR-014 | JSON managed-file tracking uses sidecar metadata, not inline markers                                                                                                      | Preserve strict JSON validity                                                                          |
| ADR-015 | AGENTS freshness workflow is mandatory at design level; automatic hook wiring is deferred in this branch                                                                  | Keeps behavior requirement while respecting branch constraints                                         |
| ADR-016 | Generate and manage `AGENTS.md` for every workspace package                                                                                                               | Explicit user requirement and consistency objective                                                    |
| ADR-017 | JetBrains prompt-library artifacts are in v1 scope                                                                                                                        | Explicit user requirement for deeper JetBrains parity                                                  |
| ADR-018 | Adapter architecture is registry/capability-map based                                                                                                                     | Scales targets without N^2 converter complexity                                                        |
| ADR-019 | Managed outputs are hash-aware with skip-write and orphan cleanup via state metadata                                                                                      | Minimizes git churn and stale generated artifacts                                                      |
| ADR-020 | Backup/revert lifecycle is mandatory in v1 and scoped to managed targets                                                                                                  | Enables one-session rollback during migration or bad emits while avoiding unmanaged-file deletion risk |
| ADR-021 | Diagnostics include structured warnings + strict mode gates                                                                                                               | Prevents silent lossy conversions and hidden unsupported fields                                        |
| ADR-022 | Managed `.gitignore` updates use bounded generated blocks for local-only artifacts                                                                                        | Keeps ignore policy deterministic and reversible                                                       |
| ADR-023 | TDD and hard validation checkpoints are mandatory for phase completion (P1-P4; P0 grandfathered)                                                                          | Prevents underspecified implementation and regression risk                                             |
| ADR-024 | JetBrains prompt-library v1 supports deterministic bundle artifacts by default; native-file emission is optional and requires fixture proof                               | Removes undocumented file-path ambiguity while preserving v1 scope                                     |

## Architecture Overview

```
.beep/ (canonical source)
  - config.yaml
  - instructions/
  - skills/
  - agents/
  - templates/
  - manifests/

beep-sync runtime (tooling/beep-sync)
  - schema validation + normalization
  - adapter registry + capability maps (claude/codex/cursor/windsurf/jetbrains)
  - secret resolution layer (1Password)
  - deterministic writers (hash-aware skip-write)
  - state/manifest drift + orphan cleanup
  - backup/revert operational safety

managed targets (committed)
  - AGENTS.md + CLAUDE.md (+ nested AGENTS.md where required)
  - .codex/config.toml
  - .mcp.json
  - .cursor/*
  - .windsurf/*
  - .aiassistant/rules/* + JetBrains MCP artifacts
```

## Phase Overview

| Phase | Name                                  | Status       | Description                                                        |
|-------|---------------------------------------|--------------|--------------------------------------------------------------------|
| P0    | Research + Constraint Freeze + Review | **Complete** | Canonical scaffold + research + unknown closure                    |
| P1    | Schema + Compiler Contract            | Complete     | Canonical config schema, merge/precedence, deterministic model     |
| P2    | Adapter Design                        | Complete     | Tool-specific output contracts and mapping semantics               |
| P3    | Runtime Integration                   | Complete     | CLI contract, secret lifecycle, AGENTS freshness workflow contract |
| P4    | Migration + Cutover                   | Complete     | Rollout sequence, rollback, and operational handoff                |
| P5    | Runtime Implementation + Skill Sync   | Pending      | Implement real `beep-sync` behavior and `.beep` skill distribution |
| P6    | Final Verification + Completion       | Pending      | End-to-end proof, rollback rehearsal, and completion signoff       |

## Reopen Trigger (2026-02-23)

This spec was moved back to `specs/pending/` after verification showed `tooling/beep-sync` still in scaffold mode and not yet delivering full `.beep` source-of-truth behavior across agent skill/config targets.

## Phase Completion Requirements

| Phase | Required Exit Evidence                                                                                                                                    |
|-------|-----------------------------------------------------------------------------------------------------------------------------------------------------------|
| P1    | Schema covers instructions/commands/hooks/MCP/agents/skills/overrides + ownership semantics + parser/normalizer unit test plan + schema negative fixtures |
| P2    | Each tool has explicit target map + field mapping + unsupported-field handling + golden fixture matrix + capability-map test plan                         |
| P3    | Runtime command contract and required-secret failure behavior are fully specified + CLI integration tests + state/cleanup/revert test plan                |
| P4    | Migration playbook covers inventory, shadow mode, managed cutover, rollback + rollback rehearsal and cutover validation checkpoints                       |
| P5    | Runtime implementation replaces scaffold behavior (`validate/apply/check/doctor/revert`) + skills sync from `.beep` to managed targets + quality evidence |
| P6    | Deterministic no-churn validation, rollback rehearsal, managed-boundary verification, and final quality signoff matrix                                    |

## Hard Quality Gates

Gate source:
- `specs/completed/unified-ai-tooling/outputs/quality-gates-and-test-strategy.md`

Mandatory gates:
1. TDD-first evidence for runtime code changes.
2. Unit tests for parser/normalizer/adapters/state.
3. Golden fixture tests for every tool adapter.
4. Integration tests for `validate/apply/check/doctor` exit behavior.
5. Secret fail-hard and redaction tests.
6. Cleanup/revert safety tests.
7. Thorough review signoff recorded in each phase output.
8. Policy applies to P1-P4; P0 is grandfathered.
9. Residual risk closure tasks in `outputs/residual-risk-closure.md` are treated as mandatory phase gates.

## Complexity and Risk Assessment

- Complexity: medium-high due heterogenous tool formats.
- Highest integration risk: exact JetBrains parity beyond project rules + MCP.
- Secondary risk: Cursor/Windsurf MCP schema drift and capability mismatch.
- Secondary risk: secret-resolution coupling to local auth state.
- Mitigation: strict adapter boundaries, capability maps, sidecar metadata, deterministic fixtures, explicit fatal error paths, strict-mode diagnostics.

## Dependencies

- Bun workspace tooling.
- Effect v4 packages.
- 1Password SDK and CLI (`op`) availability in developer environments.
- Existing repository structure under `tooling/*`, `packages/*`, `apps/*`.

## Verification Commands

```bash
# planned runtime contract (paths finalized in implementation phase)
bun tooling/beep-sync/bin/beep-sync validate
bun tooling/beep-sync/bin/beep-sync apply
bun tooling/beep-sync/bin/beep-sync check
bun tooling/beep-sync/bin/beep-sync doctor

# planned quality command contract (to be wired in implementation)
bun run beep-sync:test:unit
bun run beep-sync:test:fixtures
bun run beep-sync:test:integration
bun run beep-sync:test:coverage
```

## Key Files

- `specs/completed/unified-ai-tooling/README.md`
- `specs/completed/unified-ai-tooling/QUICK_START.md`
- `specs/completed/unified-ai-tooling/REFLECTION_LOG.md`
- `specs/completed/unified-ai-tooling/outputs/preliminary-research.md`
- `specs/completed/unified-ai-tooling/outputs/tooling-compatibility-matrix.md`
- `specs/completed/unified-ai-tooling/outputs/comprehensive-review.md`
- `specs/completed/unified-ai-tooling/outputs/subtree-synthesis.md`
- `specs/completed/unified-ai-tooling/outputs/quality-gates-and-test-strategy.md`
- `specs/completed/unified-ai-tooling/outputs/residual-risk-closure.md`
- `specs/completed/unified-ai-tooling/handoffs/HANDOFF_P1.md`
- `specs/completed/unified-ai-tooling/handoffs/P1_ORCHESTRATOR_PROMPT.md`

## Related Specs

- Prior baseline: `specs/pending/unified-ai-sync/outputs/research.md`
- Secret-management context: `specs/pending/env-1password-redesign`
