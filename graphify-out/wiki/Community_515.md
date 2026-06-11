# Community 515

> 22 nodes · cohesion 0.11

## Key Concepts

- **09 — Errors Across Boundaries** (10 connections) — `standards/architecture/09-errors-across-boundaries.md`
- **08 — Testing** (9 connections) — `standards/architecture/08-testing.md`
- **12 — Observability** (6 connections) — `standards/architecture/12-observability.md`
- **Decision: Lock Strict Action Errors And Fixture-First Proof** (4 connections) — `standards/architecture/DECISIONS.md`
- **Three-rule translation contract (one per boundary)** (3 connections) — `standards/architecture/09-errors-across-boundaries.md`
- **Contract tests between use-cases and server adapters** (2 connections) — `standards/architecture/08-testing.md`
- **Logging is the dual of translation** (2 connections) — `standards/architecture/09-errors-across-boundaries.md`
- **PostgresError (driver-level technical failure)** (2 connections) — `standards/architecture/09-errors-across-boundaries.md`
- **Five-kind error taxonomy (domain/port/public/internal/protocol)** (2 connections) — `standards/architecture/09-errors-across-boundaries.md`
- **Attribute split (domain-semantic in use-cases, technical in adapters)** (2 connections) — `standards/architecture/12-observability.md`
- **Logging vs tracing vs Console split** (2 connections) — `standards/architecture/12-observability.md`
- **Slice boundaries are span boundaries** (2 connections) — `standards/architecture/12-observability.md`
- **Common role suffixes table** (2 connections) — `standards/architecture/13-onboarding-the-minimum-viable-slice.md`
- **Decision: Split Postgres And Drizzle Drivers From Product Repositories** (2 connections) — `standards/architecture/DECISIONS.md`
- **Fixture Ownership (slice /test subpath)** (1 connections) — `standards/architecture/08-testing.md`
- **Membership test fixtures (activeMembership, revokedMembership)** (1 connections) — `standards/architecture/08-testing.md`
- **Use-case testing with port stubs (Layer.mock / Layer.succeed)** (1 connections) — `standards/architecture/08-testing.md`
- **Vitest via @effect/vitest (never bun test)** (1 connections) — `standards/architecture/08-testing.md`
- **Internal failure dies at the boundary rule** (1 connections) — `standards/architecture/09-errors-across-boundaries.md`
- **TaggedErrorClass (from @beep/schema)** (1 connections) — `standards/architecture/09-errors-across-boundaries.md`
- **OpenTelemetry semantic conventions (db.*, http.*, messaging.*)** (1 connections) — `standards/architecture/12-observability.md`
- **Span naming convention <slice>.<concept>.<action>** (1 connections) — `standards/architecture/12-observability.md`

## Relationships

- [[Community 1149]] (1 shared connections)

## Source Files

- `standards/architecture/08-testing.md`
- `standards/architecture/09-errors-across-boundaries.md`
- `standards/architecture/12-observability.md`
- `standards/architecture/13-onboarding-the-minimum-viable-slice.md`
- `standards/architecture/DECISIONS.md`

## Audit Trail

- EXTRACTED: 19 (73%)
- INFERRED: 7 (27%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [[index]] to navigate.*