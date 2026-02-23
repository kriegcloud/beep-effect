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

## Summary Verdict

The spec is execution-ready with a clear implementation path. Follow-up answers closed the remaining pre-execution unknowns.

## Decision Audit (12-question closure)

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

## Key Risks and Mitigations

1. Dynamic vendor docs drift (especially Cursor)
- Mitigation: fixture-driven adapter tests and explicit schema versioning per target.

2. Secret resolution brittleness on fresh machines
- Mitigation: early auth preflight command + fatal error on required unresolved refs.

3. Overly broad AGENTS generation causing noise in monorepo
- Mitigation: enforce all-workspace-package generation with deterministic staleness checks and explicit skip rules only for non-workspace paths.

4. JetBrains portability gaps for non-rule artifacts
- Mitigation: keep tool-specific extensions in `tool_overrides.jetbrains.*` and degrade with explicit warnings.

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

## Recommendation

Proceed to P1 now and treat these decisions as locked inputs. Keep P2 adapter work strict on deterministic outputs and explicit warning/error semantics.
