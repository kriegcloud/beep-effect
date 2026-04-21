# Foundation And Law Canon

## Mission

This design locks the repo-wide governance foundation for agent-driven work. It defines the source-of-truth order, the law taxonomy, and the exception posture future phases must preserve.

## Source-Of-Truth Order

Conflicts are resolved in this order:

1. repo law and enforcement sources
2. current repo reality
3. this initiative packet's `SPEC.md`
4. design docs in this directory
5. closed phase outputs in `history/outputs/`
6. handoffs and prompt assets
7. downstream initiatives

## Law Families

| Law Family | Core Requirement | Primary Enforcement Surface |
|---|---|---|
| Schema-first | Pure data is modeled as schemas and decoded at boundaries | schema auditors, schema lint, manual review |
| Branded domains | Domain identifiers and constrained values use branded schemas | schema auditors, reuse auditors |
| Typed failures | Failing logic exposes typed `Effect`, `Result`, or `Exit` | effect auditors, command review |
| Throwable boundary control | `try/catch` is banned where `Result.try`, `Effect.try`, or `Effect.tryPromise` is required | effect auditors, lint review |
| Effect-native data handling | Native helpers are banned where Effect or schema equivalents exist | effect-data auditors, manual review |
| Service boundary integrity | `Context.Service` contracts do not leak dependencies | service/layer auditors |
| Layer boundary integrity | Layer provisioning stays close to application boundaries | service/layer auditors |
| HTTP boundary integrity | HTTP requests use `effect/unstable/http`; HTTP APIs use `effect/unstable/httpapi` | HTTP auditors |
| Stateful workflow integrity | Stateful flows use the correct `Ref`-family primitive | state auditors |
| Reuse and deduplication | Existing abstractions are reused; duplicate abstractions are banned | duplication and reuse auditors |
| Documentation integrity | Exported APIs satisfy JSDoc and docgen requirements | JSDoc/docgen auditors |
| Verification integrity | Approved work closes with explicit checks and no remediation backlog | verification auditors |

## Global Operating Rules

1. Repo reality is required to outrank stale notes and stale prompts.
2. Generic governance text is required to live in this packet instead of being copied into downstream initiatives.
3. Downstream initiatives are required to inherit this law canon rather than redefining it.
4. Every law is required to have both an owner and an enforcement surface.
5. Every approved work packet is required to define acceptance criteria before implementation starts.
6. Hidden exceptions are not allowed.
7. A remediation backlog is not allowed inside an approved implementation wave.

## Exception Policy

Exceptions are tightly controlled:

1. Every exception is required to live in an `Exception Ledger`.
2. Every exception is required to cite the exact violated law.
3. Every exception is required to cite the affected file, symbol, or contract.
4. Every exception is required to explain why avoidance was not possible in the approved wave.
5. Every exception is required to name an owner and a removal condition.
6. Open-ended exceptions are not allowed.
7. Downstream initiatives are not allowed to weaken the exception standard.

## Required Evidence

The governance foundation is required to emit these durable evidence artifacts:

- a law coverage matrix
- a consumer inheritance rule
- an exception-ledger contract
- a named agent owner for every law family

## Design Consequence

This phase creates the law canon future phases must use. Later phases are not allowed to redefine these laws. Later phases are required to operationalize them.
