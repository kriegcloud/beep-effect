# Enforcement And Verification Contract

## Objective

This design defines how repo laws are enforced under the control plane. Enforcement is required to combine command execution with adversarial review.

## Enforcement Model

Law enforcement uses three layers:

1. command gates for automatable checks
2. adversarial auditors for semantic and architectural drift
3. manifest and handoff evidence for cross-phase traceability

## Universal Verification Surfaces

The control plane is required to recognize these repo-wide verification surfaces:

- `bun run check:effect-imports`
- `bun run check:terse-effect`
- `bun run lint:effect-laws:strict`
- `bun run lint:schema-first`
- `bun run docgen`
- target package or app `check`
- target package or app `lint`
- target package or app `test`

## Law Coverage Matrix

| Law Family | Command Surface | Auditor Surface |
|---|---|---|
| Schema-first | `bun run lint:schema-first` | Schema And Brand Auditor |
| Branded domains | package checks plus manual review | Schema And Brand Auditor, Duplication And Reuse Auditor |
| Typed failures and throwable control | `bun run lint:effect-laws:strict`, `bun run check:effect-imports` | Effect Data Auditor |
| Effect-native helper usage | `bun run check:terse-effect` plus package checks | Effect Data Auditor |
| Service boundary integrity | package checks | Service And Layer Boundary Auditor |
| Layer boundary integrity | package checks | Service And Layer Boundary Auditor |
| HTTP boundary integrity | package checks | HTTP Boundary Auditor |
| Stateful workflow integrity | package checks | State And Ref Auditor |
| Reuse and deduplication | package checks plus manual review | Duplication And Reuse Auditor |
| Documentation integrity | `bun run docgen` plus package lint | JSDoc And Docgen Auditor |
| Verification integrity | command matrix completion | Verification And Quality Gate Auditor |

## Failure Classification

Every failed verification surface is required to be classified as one of these:

- new failure introduced by the active work
- pre-existing failure inside the touched surface
- unrelated pre-existing failure outside the touched surface
- environment failure blocking trustworthy execution

## Required Closure Rule

New failures are required to be fixed before approval. Touched-surface pre-existing failures are required to be fixed or logged in the `Exception Ledger`. Unrelated pre-existing failures are required to be documented and isolated from the readiness statement.

## Verification Consequence

No approved work may claim completion without a `Verification Report` that maps the executed commands and manual audits back to the acceptance criteria and law families.
