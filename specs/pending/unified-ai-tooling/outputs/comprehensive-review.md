# Comprehensive Review: Unified AI Tooling (.beep)

Date: 2026-02-23

## Review Scope

Reviewed architecture and phase contracts for:
- config/source-of-truth design
- managed output policy
- AGENTS strategy for monorepo
- secret handling and failure semantics
- JetBrains parity scope
- runtime packaging and rollout constraints
- subtree prior-art patterns from `.repos/*` and phase impact

## Summary Verdict

The spec is execution-ready with a clear implementation path. Product-level unknowns are closed; remaining items are validation targets for fixture coverage (JetBrains prompt-library pathing and Cursor/Windsurf MCP schema parity).

## Decision Audit (Resolved Decision Set)

| Area | User Direction | Current Spec State | Status |
|---|---|---|---|
| MCP secret values in generated files | Keep references; research 1Password support | SDK/CLI-backed reference model; no plaintext output | Closed |
| `.codex/` and `.mcp.json` commit policy | Commit/unignore | Added to committed managed-target policy | Closed |
| Nested `AGENTS.md` freshness | Generate missing + keep non-stale | Added as mandatory workflow contract for every workspace package | Closed |
| JetBrains scope | Include deeper parity | Rules + MCP + prompt-library in core scope; indexing remains scoped extension | Closed |
| Ownership model | Research rewrite vs merge | Full-file rewrite default; one-time import then takeover | Closed |
| JSON managed-file marking | Research approach | Sidecar metadata strategy chosen | Closed |
| CI workflow | Skip for now | Deferred from v1 execution scope | Closed |
| Hook wiring | Skip pre-commit for now | Deferred, command contract retained | Closed |
| Packaging location | Requested recommendation | `tooling/beep-sync` runtime + `.beep/` data | Closed |
| 1Password v1 mechanism | Prefer SDK if feasible | SDK-capable design with explicit hybrid auth policy (desktop local + service-account automation) | Closed |
| Missing auth behavior | Fail if secrets required | Fail-hard explicitly required | Closed |
| Skills scope | Fold all skills in | Skills first-class in schema/adapters | Closed |
| Hard validation checkpoints + TDD + unit tests + thorough reviews | Requested explicit enforcement | Added as mandatory quality-gates strategy + phase-level evidence contract | Closed |
| Revert scope | Make mandatory in v1 | Mandatory in v1, scoped to managed targets | Closed |

## Subtree Pattern Audit

| Pattern | Adopted Spec Position | Status |
|---|---|---|
| Adapter registry + transform hooks | Required architecture for `beep-sync` adapters | Closed |
| Capability map per tool (especially MCP) | Required in P2 contracts with drop/warn semantics | Closed |
| Deterministic sort + hash-aware skip-write | Required in ownership/drift model | Closed |
| Manifest/state metadata + orphan cleanup | Required in P1/P3 runtime contracts | Closed |
| Full-file rewrite post-ownership | Locked default ownership model | Closed |
| Backup/revert symmetry | Added to operational safety contract | Closed |
| Warning/error taxonomy + strict mode | Added to runtime diagnostics contract | Closed |
| Root + package rule layering | Locked AGENTS generation/freshness policy | Closed |
| Managed `.gitignore` block strategy | Added for local-only generated artifacts | Closed |

## Key Risks and Mitigations

1. Dynamic vendor docs drift (especially Cursor)
- Mitigation: fixture-driven adapter tests and explicit schema versioning per target.

2. Secret resolution brittleness on fresh machines
- Mitigation: early auth preflight command + fatal error on required unresolved refs.

3. Overly broad AGENTS generation causing noise in monorepo
- Mitigation: enforce all-workspace-package generation with deterministic staleness checks and explicit skip rules only for non-workspace paths.

4. JetBrains portability gaps for non-rule artifacts
- Mitigation: keep tool-specific extensions in `tool_overrides.jetbrains.*` and degrade with explicit warnings.

5. State/manifest drift causing incorrect cleanup
- Mitigation: atomic state writes, schema versioned sidecar records, and dry-run previews before destructive cleanup.

6. Revert gaps after failed generation
- Mitigation: backup-before-write contract and a first-class `revert` command semantics in P3.

## Follow-up Closures Applied

1. AGENTS scope policy
- Decision: generate/manage `AGENTS.md` for every workspace package.

2. 1Password auth policy for local development
- Decision: hybrid policy.
- Local interactive runs: desktop-account auth is allowed.
- Automation/non-interactive runs: service-account auth is required.
- In all modes, required unresolved secrets fail hard.

3. JetBrains prompt-library ownership
- Decision: include prompt-library artifact ownership in v1.

4. Adapter/runtime pattern adoption from subtree review
- Decision: adopt registry-based adapters, capability maps, hash-aware writes, orphan cleanup, strict diagnostics, and backup/revert as core contracts.

5. Revert scope closure
- Decision: `revert` is mandatory in v1 and scoped to managed targets only.

## Remaining Validation Targets (Not Decision Blockers)

1. Verify JetBrains prompt-library file targets using local fixture experiments.
2. Freeze Cursor/Windsurf MCP capability maps from fixture-based golden tests.
3. Validate managed-target-only `revert` behavior using fixture-driven integration tests.

## Recommendation

Proceed to P1 now and treat these decisions as locked inputs. Carry the remaining validation targets into P2/P3 as fixture tasks, not architecture re-openers.
