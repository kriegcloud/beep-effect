# Schema To Drizzle Projection

Status: experimental initiative

This packet tracks a greenfield experiment for collapsing rich domain entity
models and persistence table metadata into one schema-authored surface.

## Reading Order

- `SPEC.md` defines the desired API and invariants.
- `PLAN.md` breaks the experiment into implementation checkpoints.
- `READINESS.md` records the confidence gates and migration-planning boundary.
- `../../scratchpad/schema-drizzle-projection/README.md` links the runnable
  proof.

## Thesis

Domain entities should remain Effect schemas first. Persistence metadata should
be attached to those schemas as a checked projection, not rebuilt as a parallel
Drizzle-specific model.

The experiment keeps the first cut deliberately small: create the plumbing,
attach metadata through schema annotations, prove class-factory invariants, and
project one fully typed Drizzle table from the encoded side of the schema.
