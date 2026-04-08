# OpenClaw Port Bootstrap

Use this spec as the operator entrypoint for the OpenClaw port workflow.

Do not start with a single implementation session anymore. Split the work into
two separate Codex sessions:

1. A validator/orchestrator session driven by
   `specs/pending/openclaw-port/VALIDATION_PROMPT.md`
2. A separate implementation session driven by
   `specs/pending/openclaw-port/IMPLEMENTATION_PROMPT.md`

The validator session is the authority. It confirms repo reality, chooses the
wave, defines the rules, and emits a decision-complete `Implementation Packet`.
The implementer session is a constrained executor that only ports the approved
wave from that packet.

## Split Rationale

The OpenClaw source tree under `.repos/openclaw` is runtime-heavy and does not
share this repo's laws by default. A single session tends to mix discovery,
policy, and implementation, which leads to remediation work later.

This split is required so that:

- adversarial agents can enforce repo laws before code is written
- the implementer can focus on one cohesive wave at a time
- repo reality beats stale spec assumptions
- documentation, tests, and quality gates are defined before code changes begin

## Non-Negotiable Workflow

1. Start a fresh Codex session with `VALIDATION_PROMPT.md`.
2. Let that session inspect the repo, the reference source, and the laws.
3. Do not implement until it emits a complete `Implementation Packet`.
4. Start a second fresh Codex session with `IMPLEMENTATION_PROMPT.md`.
5. Paste the validator's `Implementation Packet` into that session.
6. Let the implementer port only the approved wave.

## Repo Reality Rule

Older notes for this port referenced `@beep/openclaw`, but the active local repo
surface does not control implementation scope. The validator is required to
confirm the live destination path from the current repo state before any
implementation begins.

Treat `.repos/openclaw` as a semantic reference only. It is not a template for
line-by-line transliteration.

## Shared Port Laws

Both sessions must preserve and strengthen these rules:

1. Pure data models are required to be modeled as schemas.
2. Failing logic is required to surface typed `Effect`, `Result`, or `Exit`
   values.
3. `try/catch` is not allowed. Throwable or rejecting boundaries are required
   to use `Result.try`, `Effect.try`, or `Effect.tryPromise`.
4. Optional, nullable, and missing data is required to be modeled with
   `Option` at the boundary.
5. Discriminated object unions are required to be schema tagged unions.
6. Literal unions that benefit from repo ergonomics are required to use
   `LiteralKit`.
7. Native `String`, `Array`, `Object`, `Map`, `Set`, `Date`, `JSON`,
   `URLSearchParams`, console, and similar JS or Node helpers are not allowed
   where Effect modules or schema codecs exist.
8. Domain identifiers and reusable constrained values are required to be modeled
   as branded schemas.
9. Existing repo utilities, schemas, branded types, services, and helpers are
   required to be reused when they satisfy the port requirement.
10. Data structures are required to be immutable by default, with explicit
   service boundaries.
11. Effect modules and services are required to replace native JS, Node, and
   ambient runtime APIs in domain logic.
12. `Context.Service` contracts are required to expose domain-facing
    capabilities without leaking their constructor dependencies.
13. Service dependencies are required to be provided with layers close to the
    application boundary.
14. Network requests are required to use `effect/unstable/http`, and
    application HTTP boundaries are required to use
    `effect/unstable/httpapi`.
15. Stateful workflows and stateful functions are required to use dedicated
    `Ref`-family modules instead of mutable closure state or ad-hoc mutable
    containers.
16. Workflows in scope that perform IO, orchestration, retries, timeouts,
   concurrency, or recovery are required to have typed-cause recovery, spans,
   and structured logs.
17. Exported APIs are required to have repo-standard JSDoc and docgen-clean
   examples.
18. "Fix later" violations are not allowed in approved port waves.

## Files

- `VALIDATION_PROMPT.md`: adversarial orchestration, validation, and packet
  generation
- `IMPLEMENTATION_PROMPT.md`: constrained implementation prompt for an approved
  wave
