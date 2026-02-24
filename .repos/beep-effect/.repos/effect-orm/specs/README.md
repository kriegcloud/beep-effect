# Specifications

Multi-phase specification library for complex features.

## Layout

- `specs/pending/`: In-progress, planned, or not-yet-finished specs
- `specs/completed/`: Fully finished specs
- `specs/archived/`: Deferred/paused specs (not complete, intentionally parked)
- `specs/_guide/`: Shared spec workflow docs/templates

## Quick Start

| Action | Resource |
|--------|----------|
| Create new spec | Create a folder under `specs/pending/<spec-name>/` with a `README.md` |
| Learn workflow | [`_guide/README.md`](_guide/README.md) |
| Handoff format | [`_guide/HANDOFF_STANDARDS.md`](_guide/HANDOFF_STANDARDS.md) |
| Pattern library | [`_guide/PATTERN_REGISTRY.md`](_guide/PATTERN_REGISTRY.md) |
| Status policy | [`SPEC_STATUS_POLICY.md`](SPEC_STATUS_POLICY.md) |

To create a new spec manually:

1. Create a folder: `specs/pending/<spec-name>/`
2. Add a `README.md` with the spec title, description, status, and phase breakdown.
3. Follow the templates in `specs/_guide/` for structure.

## Status Operations

To move a spec between status folders, relocate its directory:

- `specs/pending/<spec>/` -> `specs/completed/<spec>/` when finished.
- `specs/pending/<spec>/` -> `specs/archived/<spec>/` when deferred.
- `specs/archived/<spec>/` -> `specs/pending/<spec>/` when resumed.

Update the tables below after moving.

## Pending Specs

| Spec |
|------|
| [effect-orm](./pending/effect-orm/) -- Multi-dialect ORM extending @effect/sql/Model with Drizzle table derivation |

## Completed Specs

| Spec |
|------|

## Archived Specs

| Spec |
|------|
