# Specifications

Multi-phase specification library for complex features.

## Layout

- `specs/pending/`: In-progress, planned, or not-yet-finished specs
- `specs/completed/`: Fully finished specs
- `specs/archived/`: Deferred/paused specs (not complete, intentionally parked)
- `specs/_guide/`: Shared spec workflow docs/templates
- `specs/agents/`: Agent-specific specification artifacts

## Quick Start

| Action | Resource |
|--------|----------|
| Create new spec | `bun run repo-cli bootstrap-spec -n <name> -d "Description"` |
| Learn workflow | [`_guide/README.md`](_guide/README.md) |
| Handoff format | [`_guide/HANDOFF_STANDARDS.md`](_guide/HANDOFF_STANDARDS.md) |
| Pattern library | [`_guide/PATTERN_REGISTRY.md`](_guide/PATTERN_REGISTRY.md) |
| Status policy | [`SPEC_STATUS_POLICY.md`](SPEC_STATUS_POLICY.md) |

## Status Operations

```bash
# Check for pending specs that declare complete/archived status
bun run spec:status:check

# Move a spec between status folders
bun run spec:move -- <spec-name> pending|completed|archived
```

## Pending Specs

| Spec |
|------|


## Completed Specs

| Spec |
|------|


## Archived Specs

| Spec |
|------|
