# .codex Configuration

Codex-target parity implementation for `specs/codex-claude-parity` Phase 2.

## Scope

- This directory is the Codex execution surface for parity-critical docs.
- `.claude/` remains the source reference.
- Non-direct ports are documented in `specs/codex-claude-parity/outputs/P2_IMPLEMENTATION_REPORT.md`.

## Structure

- `rules/`: core instruction rules (symlinked direct ports)
- `workflows/`: Codex workflows adapted from `.claude/commands`
- `skills/`: structured skill index and selected portable ports
- `agents/`: tool-agnostic delegation manifest and profiles
- `safety/`: Codex safety policy replacing Claude permission DSL
- `patterns/`: reusable ask/deny/context pattern corpus
- `runtime/`: deferred runtime parity and fallback procedures

## Canonical references

- Spec orchestration source of truth: `specs/codex-claude-parity/MASTER_ORCHESTRATION.md`
- Repository guardrails: `AGENTS.md`
- P2 implementation evidence: `specs/codex-claude-parity/outputs/P2_IMPLEMENTATION_REPORT.md`
